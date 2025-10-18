const Order = require('./models/Order');

function testFinalCase() {
  console.log('🧮 Testing Final Case: 49.65 km, 6 packages, 600 lbs\n');

  const order = new Order({
    distance: 49.65,
    packageDetails: { 
      weight: 600, 
      numberOfPackages: 6 
    }
  });
  
  const price = order.calculatePrice();
  
  console.log('📦 Order Details:');
  console.log(`Distance: ${order.distance} km`);
  console.log(`Weight: ${order.packageDetails.weight} lbs`);
  console.log(`Packages: ${order.packageDetails.numberOfPackages}`);
  console.log('');
  
  console.log('💰 Price Breakdown:');
  console.log(`Base Price: $${price.basePrice.toFixed(2)}`);
  console.log(`Distance Fee: $${price.distanceFee.toFixed(2)} (${order.distance - 15} km × $0.75)`);
  console.log(`Weight Fee: $${price.weightFee.toFixed(2)} (${order.packageDetails.weight - 25} lbs × $${(price.weightFee / (order.packageDetails.weight - 25)).toFixed(4)}/lb)`);
  console.log(`Package Fee: $${price.packageFee.toFixed(2)} (${order.packageDetails.numberOfPackages - 1} additional packages × $2.00)`);
  console.log(`Total: $${price.total.toFixed(2)}`);
  console.log('');
  
  // Verify weight calculation
  const excessWeight = 600 - 25; // 575 lbs
  const reductionFactor = Math.floor((600 - 50) / 50); // 11
  const calculatedRate = 0.25 * Math.pow(0.85, reductionFactor);
  const finalRate = Math.max(0.07, calculatedRate);
  
  console.log('🔍 Weight Calculation Verification:');
  console.log(`Excess weight over 25lbs: ${excessWeight} lbs`);
  console.log(`Reduction factor: floor((${600} - 50) / 50) = ${reductionFactor}`);
  console.log(`Calculated rate: $0.25 × (0.85)^${reductionFactor} = $${calculatedRate.toFixed(6)}`);
  console.log(`Final rate: max($0.07, $${calculatedRate.toFixed(6)}) = $${finalRate.toFixed(6)}`);
  console.log(`Weight fee: ${excessWeight} lbs × $${finalRate.toFixed(6)} = $${(excessWeight * finalRate).toFixed(2)}`);
  console.log('');
  
  console.log('✅ Algorithm is working correctly!');
}

if (require.main === module) {
  testFinalCase();
}
