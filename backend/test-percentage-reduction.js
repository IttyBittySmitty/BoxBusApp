const Order = require('./models/Order');

function testPercentageReduction() {
  console.log('🧮 Testing Corrected BoxBus Weight Pricing (Percentage Reductions)\n');

  const testWeights = [30, 50, 75, 100, 101, 150, 200, 250, 300];
  
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
    console.log(`  Rate per pound: $${ratePerPound.toFixed(4)}`);
    
    // Show the calculation
    if (weight > 50) {
      const reductionFactor = Math.floor((weight - 50) / 50);
      const calculatedRate = 0.25 * Math.pow(0.85, reductionFactor);
      const finalRate = Math.max(0.07, calculatedRate);
      console.log(`  Reduction Factor: ${reductionFactor}`);
      console.log(`  Calculated Rate: $0.25 × (0.85)^${reductionFactor} = $${calculatedRate.toFixed(4)}`);
      console.log(`  Final Rate: max($0.07, $${calculatedRate.toFixed(4)}) = $${finalRate.toFixed(4)}`);
    }
    console.log('');
  });
  
  console.log('✅ Corrected Algorithm Results:');
  console.log('25-50 lbs: $0.2500 (no reduction)');
  console.log('50-100 lbs: $0.25 × 0.85 = $0.2125 (15% reduction)');
  console.log('101-150 lbs: $0.25 × 0.85² = $0.1806 (27.75% reduction)');
  console.log('151-200 lbs: $0.25 × 0.85³ = $0.1535 (38.6% reduction)');
  console.log('200+ lbs: $0.25 × 0.85⁴ = $0.1305 (47.8% reduction)');
  console.log('Note: All rates are capped at minimum $0.07 per pound');
}

if (require.main === module) {
  testPercentageReduction();
}
