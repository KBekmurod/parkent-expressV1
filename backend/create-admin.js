#!/usr/bin/env node
/**
 * Script to create initial admin user
 * Usage: node create-admin.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('./src/models/Admin.model');

const createAdmin = async () => {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({
      $or: [
        { email: 'admin@parkentexpress.com' },
        { username: 'admin' }
      ]
    });

    if (existingAdmin) {
      console.log('⚠ Admin user already exists:');
      console.log('  Username:', existingAdmin.username);
      console.log('  Email:', existingAdmin.email);
      console.log('  Role:', existingAdmin.role);
      process.exit(0);
    }

    // Create admin user
    const admin = await Admin.create({
      username: 'admin',
      email: 'admin@parkentexpress.com',
      password: 'admin123456',
      firstName: 'Super',
      lastName: 'Admin',
      role: 'super_admin'
    });

    console.log('✓ Admin user created successfully!');
    console.log('\nCredentials:');
    console.log('  Username: admin');
    console.log('  Email: admin@parkentexpress.com');
    console.log('  Password: admin123456');
    console.log('  Role:', admin.role);
    console.log('\n⚠ Please change the password after first login!');

    process.exit(0);
  } catch (error) {
    console.error('✗ Error creating admin user:', error.message);
    process.exit(1);
  }
};

createAdmin();
