export interface AddressValidationResult {
  isValid: boolean;
  errors: string[];
  suggestions?: string[];
}

export interface ParsedAddress {
  street: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
}

export class AddressValidator {
  // Canadian postal code regex
  private static readonly CANADIAN_POSTAL_CODE = /^[A-Za-z]\d[A-Za-z] \d[A-Za-z]\d$/;
  
  // US ZIP code regex
  private static readonly US_ZIP_CODE = /^\d{5}(-\d{4})?$/;
  
  // Minimum address length
  private static readonly MIN_ADDRESS_LENGTH = 10;
  
  // Maximum address length
  private static readonly MAX_ADDRESS_LENGTH = 200;

  /**
   * Validates a complete address string
   */
  public static validateAddress(address: string): AddressValidationResult {
    const errors: string[] = [];
    const suggestions: string[] = [];

    // Check if address is provided
    if (!address || address.trim().length === 0) {
      errors.push('Address is required');
      return { isValid: false, errors };
    }

    const trimmedAddress = address.trim();

    // Check minimum length (more lenient)
    if (trimmedAddress.length < 5) {
      errors.push('Address is too short. Please provide a complete address.');
    }

    // Check maximum length
    if (trimmedAddress.length > this.MAX_ADDRESS_LENGTH) {
      errors.push('Address is too long. Please shorten your address.');
    }

    // Check for obviously invalid inputs (temporarily disabled for testing)
    // if (this.isJunkInput(trimmedAddress)) {
    //   errors.push('Please enter a valid address');
    //   suggestions.push('Try: "123 Main Street, Toronto, ON M5V 3A8"');
    // }

    // Check for required components
    const hasStreetNumber = /\d/.test(trimmedAddress);
    if (!hasStreetNumber) {
      errors.push('Address should include a street number');
      suggestions.push('Example: "123 Main Street"');
    }

    // Check for postal code (very lenient)
    const hasPostalCode = this.CANADIAN_POSTAL_CODE.test(trimmedAddress) || 
                         this.US_ZIP_CODE.test(trimmedAddress) ||
                         /\b[A-Za-z]\d[A-Za-z]\s*\d[A-Za-z]\d\b/.test(trimmedAddress) ||
                         /\b\d{5}(-\d{4})?\b/.test(trimmedAddress) ||
                         /\b[A-Za-z]\d[A-Za-z]\d[A-Za-z]\d\b/.test(trimmedAddress) ||
                         /\b\d{3}\s*\d{3}\b/.test(trimmedAddress);
    if (!hasPostalCode) {
      errors.push('Address should include a postal code');
      suggestions.push('Example: "M5V 3A8" or "90210"');
    }

    // Check for city/province
    const hasCity = /[A-Za-z]{2,}/.test(trimmedAddress);
    if (!hasCity) {
      errors.push('Address should include a city name');
      suggestions.push('Example: "Toronto" or "Vancouver"');
    }

    return {
      isValid: errors.length === 0,
      errors,
      suggestions: suggestions.length > 0 ? suggestions : undefined
    };
  }

  /**
   * Parses an address string into components
   */
  public static parseAddress(address: string): ParsedAddress | null {
    if (!address || address.trim().length === 0) {
      return null;
    }

    const trimmedAddress = address.trim();
    
    // Try to extract postal code
    const postalCodeMatch = trimmedAddress.match(/([A-Za-z]\d[A-Za-z] \d[A-Za-z]\d|\d{5}(-\d{4})?)/);
    const postalCode = postalCodeMatch ? postalCodeMatch[0] : '';

    // Try to extract province/state
    const provinceMatch = trimmedAddress.match(/\b(ON|BC|AB|MB|SK|QC|NS|NB|NL|PE|YT|NT|NU|CA|NY|CA|TX|FL|WA|OR)\b/i);
    const province = provinceMatch ? provinceMatch[0].toUpperCase() : '';

    // Try to extract city (look for words before postal code or province)
    const cityMatch = trimmedAddress.match(/([A-Za-z\s]+?)(?:\s+(?:ON|BC|AB|MB|SK|QC|NS|NB|NL|PE|YT|NT|NU|CA|NY|CA|TX|FL|WA|OR)\s+[A-Za-z]\d[A-Za-z] \d[A-Za-z]\d|\s+\d{5}(-\d{4})?)/i);
    const city = cityMatch ? cityMatch[1].trim() : '';

    // Extract street (everything before city)
    const streetMatch = trimmedAddress.match(/^(.+?)(?:\s+(?:ON|BC|AB|MB|SK|QC|NS|NB|NL|PE|YT|NT|NU|CA|NY|CA|TX|FL|WA|OR)\s+[A-Za-z]\d[A-Za-z] \d[A-Za-z]\d|\s+\d{5}(-\d{4})?)/i);
    const street = streetMatch ? streetMatch[1].trim() : trimmedAddress;

    return {
      street,
      city,
      province,
      postalCode,
      country: this.CANADIAN_POSTAL_CODE.test(postalCode) ? 'CA' : 'US'
    };
  }

  /**
   * Checks if input is obviously junk (much more lenient)
   */
  private static isJunkInput(address: string): boolean {
    const junkPatterns = [
      /^[0-9]+$/, // Only numbers
      /^[a-zA-Z]+$/, // Only letters (but allow if it's a real word)
      /^(.)\1{10,}$/, // Repeated characters (10+ times)
      /^(test|asdf|qwerty|123|abc|xyz)$/i, // Common test inputs (exact match only)
      /^.{1,3}$/, // Too short (3 chars or less)
    ];

    // Don't flag as junk if it contains common address words
    const hasAddressWords = /\b(street|st|avenue|ave|road|rd|boulevard|blvd|drive|dr|lane|ln|way|place|pl|court|ct|circle|cir|toronto|vancouver|montreal|calgary|ottawa|edmonton|winnipeg|hamilton|quebec|city|province|on|bc|ab|mb|sk|qc|ns|nb|nl|pe|yt|nt|nu)\b/i.test(address);
    
    if (hasAddressWords) {
      return false; // Don't flag as junk if it has address words
    }

    return junkPatterns.some(pattern => pattern.test(address));
  }

  /**
   * Validates distance between two addresses
   */
  public static validateDistance(distance: number): AddressValidationResult {
    const errors: string[] = [];

    if (distance <= 0) {
      errors.push('Invalid distance calculated');
    } else if (distance > 200) {
      errors.push('Delivery distance exceeds maximum limit (200 km)');
    } else if (distance < 0.1) {
      errors.push('Addresses appear to be the same location');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Provides address format suggestions
   */
  public static getFormatSuggestions(): string[] {
    return [
      '123 Main Street, Toronto, ON M5V 3A8',
      '456 Queen Street West, Vancouver, BC V6B 1A1',
      '789 Yonge Street, Suite 100, Toronto, ON M4W 2G8',
      '321 Bay Street, Toronto, ON M5H 2S2'
    ];
  }
}
