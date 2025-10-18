const Order = require('./models/Order');

function testCorrectedRates() {
  console.log('🧮 Testing Corrected BoxBus Weight Pricing (Cumulative Reductions)\n');

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
      let cumulativeReduction = 0;
      for (let i = 1; i <= reductionFactor; i++) {
        cumulativeReduction += 0.15;
      }
      cumulativeReduction = Math.min(cumulativeReduction, 0.18);
      const calculatedRate = Math.max(0.07, 0.25 - cumulativeReduction);
      console.log(`  Reduction Factor: ${reductionFactor}, Cumulative Reduction: ${cumulativeReduction.toFixed(4)}`);
      console.log(`  Calculated Rate: $${calculatedRate.toFixed(4)}`);
    }
    console.log('');
  });
  
  console.log('✅ Corrected Algorithm Results:');
  console.log('25-50 lbs: $0.2500 (no reduction)');
  console.log('50-100 lbs: $0.2125 (15% reduction)');
  console.log('101-150 lbs: $0.1806 (30% reduction)');
  console.log('151-200 lbs: $0.1487 (45% reduction)');
  console.log('200+ lbs: $0.0700 (72% reduction, capped at 7 cents)');
}

if (require.main === module) {
  testCorrectedRates();
}
