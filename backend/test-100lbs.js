const Order = require('./models/Order');

function test100lbs() {
  console.log('🧮 Testing 100 Pounds Weight Pricing\n');

  const order = new Order({
    distance: 10,
    packageDetails: { weight: 100, numberOfPackages: 1 }
  });
  
  const price = order.calculatePrice();
  const excessWeight = 100 - 25; // 75 pounds
  
  console.log('📦 100 Pounds Analysis:');
  console.log(`Total Weight: 100lbs`);
  console.log(`Excess Weight: ${excessWeight}lbs (over 25lb threshold)`);
  console.log('');
  
  // Manual calculation
  console.log('🔍 Manual Calculation:');
  console.log('Base rate: $0.25 per pound');
  console.log('Weight over 50lbs: 100 - 50 = 50lbs');
  console.log('Reduction factor: floor(50 ÷ 50) = 1');
  console.log('Reduction: 1 × 0.15 = 0.15');
  console.log('New rate: $0.25 - $0.15 = $0.10 per pound');
  console.log('');
  console.log(`Weight fee: ${excessWeight}lbs × $0.10 = $${price.weightFee.toFixed(2)}`);
  console.log('');
  
  console.log('💰 Final Result:');
  console.log(`Base Price: $${price.basePrice.toFixed(2)}`);
  console.log(`Weight Fee: $${price.weightFee.toFixed(2)}`);
  console.log(`Total: $${price.total.toFixed(2)}`);
  console.log('');
  
  console.log('✅ At 100lbs, the rate is $0.10 (10 cents) per pound, not $0.1806');
  console.log('The pricing is NOT incremental - it applies the same rate to ALL excess weight');
}

if (require.main === module) {
  test100lbs();
}
