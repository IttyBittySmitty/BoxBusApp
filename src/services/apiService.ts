import { API_BASE_URL } from '../config/api';

export interface DistanceCalculationResult {
  distance: number; // in kilometers
  duration: string; // formatted as "Xh Ym" or "Xm"
  startCoords: {
    latitude: number;
    longitude: number;
  };
  endCoords: {
    latitude: number;
    longitude: number;
  };
}

class ApiService {
  private static instance: ApiService;

  private constructor() {}

  public static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }

  /**
   * Calculate distance between two addresses using the backend
   */
  public async calculateDistance(
    pickupAddress: string, 
    dropoffAddress: string
  ): Promise<DistanceCalculationResult> {
    try {
      console.log('API SERVICE CALLED!');
      console.log('API Service: Attempting to calculate distance...');
      console.log('API Service: Pickup:', pickupAddress);
      console.log('API Service: Dropoff:', dropoffAddress);
      console.log('API Service: URL:', `${API_BASE_URL}/api/distance/calculate`);
      
      const response = await fetch(`${API_BASE_URL}/api/distance/calculate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pickupAddress,
          dropoffAddress
        })
      });

      console.log('API Service: Response status:', response.status);
      console.log('API Service: Response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.log('API Service: Error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const data = await response.json();
      console.log('API Service: Success response:', data);
      return data;
    } catch (error) {
      console.error('API Service: Error calculating distance:', error);
      throw error;
    }
  }

  /**
   * Test if the backend API is available
   */
  public async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/`, {
        method: 'GET'
      });
      return response.ok;
    } catch (error) {
      console.error('Backend connection test failed:', error);
      return false;
    }
  }
}

export default ApiService.getInstance();
