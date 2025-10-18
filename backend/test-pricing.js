const Order = require('./models/Order');

// Test the pricing algorithm with various scenarios
function testPricingAlgorithm() {
  console.log('🧮 Testing BoxBus Pricing Algorithm\n');

  // Test Case 1: Basic delivery (no additional fees)
  console.log('📦 Test Case 1: Basic Delivery');
  const basicOrder = new Order({
    distance: 10, // Under 15km
    packageDetails: {
      weight: 20, // Under 25 pounds
      numberOfPackages: 1
    }
  });
  const basicPrice = basicOrder.calculatePrice();
  console.log(`Distance: 10km, Weight: 20lbs, Packages: 1`);
  console.log(`Base Price: $${basicPrice.basePrice}`);
  console.log(`Distance Fee: $${basicPrice.distanceFee}`);
  console.log(`Weight Fee: $${basicPrice.weightFee}`);
  console.log(`Package Fee: $${basicPrice.packageFee}`);
  console.log(`Total: $${basicPrice.total}\n`);

  // Test Case 2: Distance fee
  console.log('📦 Test Case 2: Distance Fee');
  const distanceOrder = new Order({
    distance: 25, // 10km over 15km limit
    packageDetails: {
      weight: 20,
      numberOfPackages: 1
    }
  });
  const distancePrice = distanceOrder.calculatePrice();
  console.log(`Distance: 25km, Weight: 20lbs, Packages: 1`);
  console.log(`Base Price: $${distancePrice.basePrice}`);
  console.log(`Distance Fee: $${distancePrice.distanceFee} (10km × $0.75)`);
  console.log(`Weight Fee: $${distancePrice.weightFee}`);
  console.log(`Package Fee: $${distancePrice.packageFee}`);
  console.log(`Total: $${distancePrice.total}\n`);

  // Test Case 3: Weight fee
  console.log('📦 Test Case 3: Weight Fee');
  const weightOrder = new Order({
    distance: 10,
    packageDetails: {
      weight: 50, // 25lbs over 25lbs limit
      numberOfPackages: 1
    }
  });
  const weightPrice = weightOrder.calculatePrice();
  console.log(`Distance: 10km, Weight: 50lbs, Packages: 1`);
  console.log(`Base Price: $${weightPrice.basePrice}`);
  console.log(`Distance Fee: $${weightPrice.distanceFee}`);
  console.log(`Weight Fee: $${weightPrice.weightFee} (25lbs × $0.25)`);
  console.log(`Package Fee: $${weightPrice.packageFee}`);
  console.log(`Total: $${weightPrice.total}\n`);

  // Test Case 4: Multiple packages
  console.log('📦 Test Case 4: Multiple Packages');
  const packageOrder = new Order({
    distance: 10,
    packageDetails: {
      weight: 20,
      numberOfPackages: 3
    }
  });
  const packagePrice = packageOrder.calculatePrice();
  console.log(`Distance: 10km, Weight: 20lbs, Packages: 3`);
  console.log(`Base Price: $${packagePrice.basePrice}`);
  console.log(`Distance Fee: $${packagePrice.distanceFee}`);
  console.log(`Weight Fee: $${packagePrice.weightFee}`);
  console.log(`Package Fee: $${packagePrice.packageFee} (2 additional × $2.00)`);
  console.log(`Total: $${packagePrice.total}\n`);

  // Test Case 5: Heavy package with weight reduction
  console.log('📦 Test Case 5: Heavy Package (Weight Reduction)');
  const heavyOrder = new Order({
    distance: 10,
    packageDetails: {
      weight: 120, // 95lbs over 25lbs limit, should get reduction
      numberOfPackages: 1
    }
  });
  const heavyPrice = heavyOrder.calculatePrice();
  console.log(`Distance: 10km, Weight: 120lbs, Packages: 1`);
  console.log(`Base Price: $${heavyPrice.basePrice}`);
  console.log(`Distance Fee: $${heavyPrice.distanceFee}`);
  console.log(`Weight Fee: $${heavyPrice.weightFee} (95lbs with reduction)`);
  console.log(`Package Fee: $${heavyPrice.packageFee}`);
  console.log(`Total: $${heavyPrice.total}\n`);

  // Test Case 6: Complex scenario
  console.log('📦 Test Case 6: Complex Scenario');
  const complexOrder = new Order({
    distance: 30, // 15km over limit
    packageDetails: {
      weight: 80, // 55lbs over limit, should get reduction
      numberOfPackages: 4
    }
  });
  const complexPrice = complexOrder.calculatePrice();
  console.log(`Distance: 30km, Weight: 80lbs, Packages: 4`);
  console.log(`Base Price: $${complexPrice.basePrice}`);
  console.log(`Distance Fee: $${complexPrice.distanceFee} (15km × $0.75)`);
  console.log(`Weight Fee: $${complexPrice.weightFee} (55lbs with reduction)`);
  console.log(`Package Fee: $${complexPrice.packageFee} (3 additional × $2.00)`);
  console.log(`Total: $${complexPrice.total}\n`);

  // Test Case 7: Maximum weight reduction
  console.log('📦 Test Case 7: Maximum Weight Reduction');
  const maxReductionOrder = new Order({
    distance: 10,
    packageDetails: {
      weight: 200, // Should get maximum reduction to 7 cents per pound
      numberOfPackages: 1
    }
  });
  const maxReductionPrice = maxReductionOrder.calculatePrice();
  console.log(`Distance: 10km, Weight: 200lbs, Packages: 1`);
  console.log(`Base Price: $${maxReductionPrice.basePrice}`);
  console.log(`Distance Fee: $${maxReductionPrice.distanceFee}`);
  console.log(`Weight Fee: $${maxReductionPrice.weightFee} (175lbs × $0.07)`);
  console.log(`Package Fee: $${maxReductionPrice.packageFee}`);
  console.log(`Total: $${maxReductionPrice.total}\n`);

  console.log('✨ Pricing algorithm tests completed!');
}

// Run tests if this file is executed directly
if (require.main === module) {
  testPricingAlgorithm();
}

module.exports = { testPricingAlgorithm };
