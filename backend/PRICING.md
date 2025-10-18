# BoxBus Pricing Algorithm

## Overview

The BoxBus pricing system is designed to be fair and transparent, with a base delivery fee plus additional charges based on distance, weight, and package count.

## Base Pricing

**Base Delivery Fee: $15.00**
- This covers one pickup and one delivery location
- Applies to all orders regardless of size or distance

## Additional Fees

### 1. Distance Fee
- **Threshold**: After 15 kilometers
- **Rate**: $0.75 per additional kilometer
- **Formula**: `Math.max(0, (distance - 15) × 0.75)`

**Examples:**
- 10km delivery: $0.00 (under threshold)
- 20km delivery: $3.75 (5km × $0.75)
- 30km delivery: $11.25 (15km × $0.75)

### 2. Weight Fee
- **Threshold**: After 25 pounds
- **Base Rate**: $0.25 per additional pound
- **Scaling Reduction**: Applied for packages over 50 pounds

#### Weight Reduction Formula
For packages over 50 pounds, the rate reduces by 15% for every 50 pounds beyond the first 50:

```
reductionFactor = Math.floor((weight - 50) / 50)
reduction = Math.min(reductionFactor × 0.15, 0.18)
ratePerPound = Math.max(0.07, 0.25 - reduction)
```

**Examples:**
- 30lbs: $1.25 (5lbs × $0.25)
- 60lbs: $8.50 (35lbs × $0.243) - 3% reduction
- 100lbs: $16.45 (75lbs × $0.219) - 12% reduction
- 150lbs: $21.00 (125lbs × $0.168) - 33% reduction
- 200lbs: $12.25 (175lbs × $0.07) - maximum reduction

### 3. Package Fee
- **Additional Packages**: $2.00 per package beyond the first
- **Formula**: `(numberOfPackages - 1) × $2.00`

**Examples:**
- 1 package: $0.00
- 2 packages: $2.00
- 5 packages: $8.00

## Complete Pricing Formula

```
Total = BasePrice + DistanceFee + WeightFee + PackageFee

Where:
BasePrice = $15.00
DistanceFee = Math.max(0, (distance - 15) × 0.75)
WeightFee = Math.max(0, (weight - 25) × adjustedRate)
PackageFee = (numberOfPackages - 1) × 2.00
```

## Example Calculations

### Example 1: Basic Delivery
- Distance: 8km
- Weight: 15lbs
- Packages: 1
- **Total**: $15.00 (base only)

### Example 2: Medium Distance
- Distance: 25km
- Weight: 30lbs
- Packages: 2
- Distance Fee: (25-15) × $0.75 = $7.50
- Weight Fee: (30-25) × $0.25 = $1.25
- Package Fee: (2-1) × $2.00 = $2.00
- **Total**: $15.00 + $7.50 + $1.25 + $2.00 = $25.75

### Example 3: Heavy Package
- Distance: 12km
- Weight: 80lbs
- Packages: 1
- Weight Fee: (80-25) × $0.219 = $12.05
- **Total**: $15.00 + $0.00 + $12.05 + $0.00 = $27.05

### Example 4: Complex Order
- Distance: 40km
- Weight: 120lbs
- Packages: 4
- Distance Fee: (40-15) × $0.75 = $18.75
- Weight Fee: (120-25) × $0.168 = $15.96
- Package Fee: (4-1) × $2.00 = $6.00
- **Total**: $15.00 + $18.75 + $15.96 + $6.00 = $55.71

## API Endpoints

### Calculate Price (Without Saving)
```
POST /api/orders/calculate-price
```

**Request Body:**
```json
{
  "distance": 25,
  "packageDetails": {
    "weight": 50,
    "numberOfPackages": 2
  }
}
```

**Response:**
```json
{
  "message": "Price calculated successfully",
  "price": {
    "basePrice": 15.00,
    "distanceFee": 7.50,
    "weightFee": 6.25,
    "packageFee": 2.00,
    "total": 30.75
  },
  "breakdown": {
    "basePrice": 15.00,
    "distanceFee": 7.50,
    "weightFee": 6.25,
    "packageFee": 2.00,
    "total": 30.75
  }
}
```

## Testing

Run the pricing algorithm tests:
```bash
npm run test-pricing
```

This will test various scenarios including:
- Basic deliveries
- Distance fees
- Weight fees with reductions
- Multiple packages
- Complex combinations
- Maximum weight reductions

## Implementation Notes

- All fees are rounded to 2 decimal places
- The weight reduction algorithm automatically calculates the optimal rate
- Distance is measured in kilometers
- Weight is measured in pounds
- The system automatically applies the pricing when creating orders
- Price calculation is available as a separate endpoint for quote purposes

## Future Enhancements

Potential improvements to consider:
- Fuel surcharges based on current fuel prices
- Rush delivery fees
- Holiday/weekend surcharges
- Volume discounts for large orders
- Loyalty program pricing
- Dynamic pricing based on demand
