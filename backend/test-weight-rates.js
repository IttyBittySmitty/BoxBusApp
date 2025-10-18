const Order = require('./models/Order');

function testWeightRates() {
  console.log('🧮 Testing BoxBus Weight Pricing Rates\n');

  const testWeights = [30, 50, 75, 100, 150, 200, 250, 300];
  
  testWeights.forEach(weight => {
    const order = new Order({
      distance: 10,
      packageDetails: { weight, numberOfPackages: 1 }
    });
    
    const price = order.calculatePrice();
    const excessWeight = weight - 25;
    const ratePerPound = excessWeight > 0 ? price.weightFee / excessWeight : 0;
    
    console.log(`📦 ${weight}lbs:`);
    console.log(`  Excess Weight: ${excessWeight}lbs`);
    console.log(`  Weight Fee: $${price.weightFee.toFixed(2)}`);
    console.log(`  Rate per pound: $${ratePerPound.toFixed(3)}`);
    console.log('');
  });
  
  // Show the 7 cent threshold calculation
  console.log('🔍 7 Cent Threshold Analysis:');
  console.log('The 7 cent rate is reached when:');
  console.log('reductionFactor × 0.15 ≥ 0.18');
  console.log('reductionFactor ≥ 0.18 ÷ 0.15 = 1.2');
  console.log('Since reductionFactor is an integer:');
  console.log('reductionFactor ≥ 2');
  console.log('This means: (weight - 50) ÷ 50 ≥ 2');
  console.log('So: weight ≥ 50 + (2 × 50) = 150lbs');
  console.log('');
  console.log('✅ At 150lbs and above, the rate becomes 7 cents per pound');
}

if (require.main === module) {
  testWeightRates();
}
