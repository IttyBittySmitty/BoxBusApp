const Order = require('./models/Order');

function debugWeightCalculation() {
  console.log('🔍 Debugging Weight Calculation Step by Step\n');

  const testWeights = [100, 101, 150, 200];
  
  testWeights.forEach(weight => {
    console.log(`📦 Testing ${weight}lbs:`);
    console.log(`Excess weight over 25lbs: ${weight - 25}lbs`);
    
    if (weight > 50) {
      const reductionFactor = Math.floor((weight - 50) / 50);
      console.log(`Reduction factor: floor((${weight} - 50) / 50) = ${reductionFactor}`);
      
      let cumulativeReduction = 0;
      for (let i = 1; i <= reductionFactor; i++) {
        cumulativeReduction += 0.15;
        console.log(`  Step ${i}: reduction += 0.15 = ${cumulativeReduction.toFixed(4)}`);
      }
      
      cumulativeReduction = Math.min(cumulativeReduction, 0.18);
      console.log(`Capped reduction: min(${cumulativeReduction.toFixed(4)}, 0.18) = ${cumulativeReduction.toFixed(4)}`);
      
      const ratePerPound = Math.max(0.07, 0.25 - cumulativeReduction);
      console.log(`Final rate: max(0.07, 0.25 - ${cumulativeReduction.toFixed(4)}) = $${ratePerPound.toFixed(4)}`);
      
      const weightFee = (weight - 25) * ratePerPound;
      console.log(`Weight fee: ${weight - 25}lbs × $${ratePerPound.toFixed(4)} = $${weightFee.toFixed(2)}`);
    } else {
      console.log(`No reduction applied, rate: $0.25`);
      const weightFee = (weight - 25) * 0.25;
      console.log(`Weight fee: ${weight - 25}lbs × $0.25 = $${weightFee.toFixed(2)}`);
    }
    console.log('');
  });
  
  console.log('❓ Question: What should the rates be?');
  console.log('Should it be:');
  console.log('50-100 lbs: 0.25 - 0.15 = 0.10 (15% reduction)');
  console.log('101-150 lbs: 0.25 - 0.30 = -0.05 → capped at 0.07 (30% reduction)');
  console.log('Or something else?');
}

if (require.main === module) {
  debugWeightCalculation();
}
