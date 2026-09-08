require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const Food = require('../models/Food');
const Order = require('../models/Order');
const sampleFoods = require('./seedData');

const seedDatabase = async () => {
  try {
    console.log('[Seed] Checking and seeding database records...');

    // 1. Seed or Verify Default Admin Account
    let admin = await User.findOne({ email: 'admin@foodiehub.com' });
    if (!admin) {
      admin = await User.create({
        name: 'System Admin',
        email: 'admin@foodiehub.com',
        phone: '9876543210',
        password: 'Admin@123', // Pre-save hook will hash with bcrypt
        address: 'FoodieHub Central Kitchen, Park Street, Kolkata',
        role: 'admin',
      });
      console.log('✅ Default Admin Account created (admin@foodiehub.com / Admin@123)');
    } else {
      console.log('ℹ️ Default Admin Account already exists');
    }

    // 2. Seed or Verify Demo Customer Account
    let customer = await User.findOne({ email: 'customer@foodiehub.com' });
    if (!customer) {
      customer = await User.create({
        name: 'Rahul Sharma',
        email: 'customer@foodiehub.com',
        phone: '9876543211',
        password: 'Customer@123', // Pre-save hook will hash with bcrypt
        address: 'Flat 402, Green Valley Towers, MG Road, Pune, Maharashtra 411001',
        role: 'customer',
      });
      console.log('✅ Demo Customer Account created (customer@foodiehub.com / Customer@123)');
    } else {
      console.log('ℹ️ Demo Customer Account already exists');
    }

    // 3. Seed Foods if count is less than sample count
    const foodCount = await Food.countDocuments();
    if (foodCount === 0) {
      await Food.insertMany(sampleFoods);
      console.log(`✅ Seeded ${sampleFoods.length} sample food items across 8 categories`);
    } else {
      console.log(`ℹ️ Food database currently contains ${foodCount} items`);
    }

    // 4. Seed sample orders if orders table is empty
    const orderCount = await Order.countDocuments();
    if (orderCount === 0 && customer) {
      const allFoods = await Food.find().limit(5);
      if (allFoods.length >= 2) {
        // Order 1: Delivered
        await Order.create({
          orderId: 'FH-89421',
          user: customer._id,
          items: [
            {
              food: allFoods[0]._id,
              name: allFoods[0].name,
              price: allFoods[0].price,
              quantity: 1,
              image: allFoods[0].image,
            },
            {
              food: allFoods[1]._id,
              name: allFoods[1].name,
              price: allFoods[1].price,
              quantity: 2,
              image: allFoods[1].image,
            },
          ],
          totalAmount: allFoods[0].price + allFoods[1].price * 2,
          deliveryCharge: 0,
          address: {
            fullName: customer.name,
            phone: customer.phone,
            street: 'Flat 402, Green Valley Towers, MG Road',
            city: 'Pune',
            pincode: '411001',
          },
          phone: customer.phone,
          paymentMethod: 'Cash on Delivery',
          paymentStatus: 'Completed',
          orderStatus: 'Delivered',
        });

        // Order 2: Preparing
        await Order.create({
          orderId: 'FH-92145',
          user: customer._id,
          items: [
            {
              food: allFoods[1]._id,
              name: allFoods[1].name,
              price: allFoods[1].price,
              quantity: 1,
              image: allFoods[1].image,
            },
          ],
          totalAmount: allFoods[1].price + 40,
          deliveryCharge: 40,
          address: {
            fullName: customer.name,
            phone: customer.phone,
            street: 'Flat 402, Green Valley Towers, MG Road',
            city: 'Pune',
            pincode: '411001',
          },
          phone: customer.phone,
          paymentMethod: 'Cash on Delivery',
          paymentStatus: 'Pending',
          orderStatus: 'Preparing',
        });

        console.log('✅ Seeded 2 sample demo orders for testing order tracking and dashboard metrics');
      }
    }

    console.log('🎉 Seeding process completed successfully!');
  } catch (error) {
    console.error('❌ Seeding error:', error.message);
  }
};

// If run directly from CLI
if (require.main === module) {
  const connectDB = require('../config/db');
  connectDB().then(async () => {
    await seedDatabase();
    process.exit(0);
  });
}

module.exports = seedDatabase;
