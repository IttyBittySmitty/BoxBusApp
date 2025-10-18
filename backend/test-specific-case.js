const Order = require('./models/Order');

// Test the specific pricing scenario requested by the user
function testSpecificCase() {
  console.log('🧮 Testing Specific BoxBus Pricing Scenario\n');

  console.log('📦 Test Case: User Requested Scenario');
  const userOrder = new Order({
    distance: 49.65, // 49.65 km
    packageDetails: {
      weight: 600, // 600 pounds total
      numberOfPackages: 6 // 6 packages
    }
  });
  
  const userPrice = userOrder.calculatePrice();
  
  console.log(`Distance: ${userOrder.distance}km, Weight: ${userOrder.packageDetails.weight}lbs, Packages: ${userOrder.packageDetails.numberOfPackages}`);
  console.log('');
  
  // Calculate expected values manually to verify
  const basePrice = 15.00;
  const distanceFee = Math.max(0, (49.65 - 15) * 0.75); // 34.65 * 0.75 = 25.9875
  const packageFee = (6 - 1) * 2.00; // 5 * 2.00 = 10.00
  
  // Weight calculation with reduction
  let weightFee = 0;
  if (600 > 25) {
    const excessWeight = 600 - 25; // 575 pounds
    let ratePerPound = 0.25;
    
    if (600 > 50) {
      const reductionFactor = Math.floor((600 - 50) / 50); // floor(550/50) = 11
      const reduction = Math.min(reductionFactor * 0.15, 0.18); // min(11 * 0.15, 0.18) = min(1.65, 0.18) = 0.18
      ratePerPound = Math.max(0.07, 0.25 - reduction); // max(0.07, 0.25 - 0.18) = max(0.07, 0.07) = 0.07
    }
    
    weightFee = excessWeight * ratePerPound; // 575 * 0.07 = 40.25
  }
  
  const expectedTotal = basePrice + distanceFee + weightFee + packageFee;
  
  console.log('💰 Price Breakdown:');
  console.log(`Base Price: $${userPrice.basePrice.toFixed(2)}`);
  console.log(`Distance Fee: $${userPrice.distanceFee.toFixed(2)} (${(49.65 - 15).toFixed(2)}km × $0.75)`);
  console.log(`Weight Fee: $${userPrice.weightFee.toFixed(2)} (${(600 - 25)}lbs × $0.07 with maximum reduction)`);
  console.log(`Package Fee: $${userPrice.packageFee.toFixed(2)} (${6 - 1} additional × $2.00)`);
  console.log(`Total: $${userPrice.total.toFixed(2)}`);
  console.log('');
  
  console.log('✅ Verification:');
  console.log(`Expected Base Price: $${basePrice.toFixed(2)}`);
  console.log(`Expected Distance Fee: $${distanceFee.toFixed(2)}`);
  console.log(`Expected Weight Fee: $${weightFee.toFixed(2)}`);
  console.log(`Expected Package Fee: $${packageFee.toFixed(2)}`);
  console.log(`Expected Total: $${expectedTotal.toFixed(2)}`);
  console.log('');
  
  // Verify the calculation is correct
  const isCorrect = Math.abs(userPrice.total - expectedTotal) < 0.01;
  console.log(`🎯 Calculation ${isCorrect ? 'CORRECT' : 'INCORRECT'}: ${isCorrect ? '✅' : '❌'}`);
  
  if (!isCorrect) {
    console.log(`Difference: $${Math.abs(userPrice.total - expectedTotal).toFixed(2)}`);
  }
  
  console.log('\n✨ Specific test case completed!');
}

// Run test if this file is executed directly
if (require.main === module) {
  testSpecificCase();
}

module.exports = { testSpecificCase };
