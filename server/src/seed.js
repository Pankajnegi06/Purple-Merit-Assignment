require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const seedUsers = [
  {
    name: 'Admin User',
    email: 'admin@purplemerit.com',
    password: 'Admin@123',
    role: 'admin',
    status: 'active',
  },
  {
    name: 'Manager User',
    email: 'manager@purplemerit.com',
    password: 'Manager@123',
    role: 'manager',
    status: 'active',
  },
  {
    name: 'John Doe',
    email: 'john@purplemerit.com',
    password: 'User@123',
    role: 'user',
    status: 'active',
  },
  {
    name: 'Jane Smith',
    email: 'jane@purplemerit.com',
    password: 'User@123',
    role: 'user',
    status: 'active',
  },
  {
    name: 'Inactive User',
    email: 'inactive@purplemerit.com',
    password: 'User@123',
    role: 'user',
    status: 'inactive',
  },
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing users
    await User.deleteMany({});
    console.log('Cleared existing users');

    // Create admin first to get ID for createdBy
    const admin = await User.create(seedUsers[0]);
    console.log(`Created admin: ${admin.email}`);

    // Create remaining users with createdBy reference
    for (let i = 1; i < seedUsers.length; i++) {
      const user = await User.create({
        ...seedUsers[i],
        createdBy: admin._id,
        updatedBy: admin._id,
      });
      console.log(`Created ${user.role}: ${user.email}`);
    }

    console.log('\nSeed complete! Default credentials:');
    console.log('Admin:   admin@purplemerit.com / Admin@123');
    console.log('Manager: manager@purplemerit.com / Manager@123');
    console.log('User:    john@purplemerit.com / User@123');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error.message);
    process.exit(1);
  }
};

seedDB();
