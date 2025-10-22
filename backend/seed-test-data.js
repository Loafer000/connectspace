const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI;

// Import the actual Property model
const { Property } = require('./models');

// Get a test user ID - you'll need to replace this with an actual user ID from your database
const TEST_OWNER_ID = '507f1f77bcf86cd799439011'; // Placeholder - will be replaced

const testProperties = [
  {
    title: 'Premium Retail Space in Bandra',
    description: 'Prime retail location in Bandra West',
    propertyType: 'retail',
    category: 'commercial',
    address: {
      street: 'Linking Road',
      area: 'Bandra West',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400050',
      country: 'India'
    },
    location: {
      type: 'Point',
      coordinates: [72.8258, 19.0596] // Bandra coordinates
    },
    rental: {
      monthlyRent: 50000,
      securityDeposit: 100000,
      maintenanceCharges: { amount: 5000, included: false },
      leaseDuration: { minimum: 11, unit: 'months' },
      availableFrom: new Date()
    },
    specifications: {
      bedrooms: 0,
      bathrooms: 1,
      area: { carpet: 1000, builtUp: 1200, unit: 'sqft' },
      floor: { current: 1, total: 3 }
    },
    owner: TEST_OWNER_ID,
    visibility: 'public',
    status: 'available'
  },
  {
    title: 'Modern Office Space in Andheri',
    description: 'Fully furnished office in Andheri East',
    propertyType: 'office',
    category: 'commercial',
    address: {
      street: 'Chakala',
      area: 'Andheri East',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400069',
      country: 'India'
    },
    location: {
      type: 'Point',
      coordinates: [72.8697, 19.1136]
    },
    rental: {
      monthlyRent: 75000,
      securityDeposit: 150000,
      maintenanceCharges: { amount: 7500, included: false },
      leaseDuration: { minimum: 11, unit: 'months' },
      availableFrom: new Date()
    },
    specifications: {
      bedrooms: 0,
      bathrooms: 2,
      area: { carpet: 1500, builtUp: 1800, unit: 'sqft' },
      floor: { current: 5, total: 10 }
    },
    owner: TEST_OWNER_ID,
    visibility: 'public',
    status: 'available'
  },
  {
    title: 'Industrial Warehouse in Bhiwandi',
    description: 'Large warehouse space near Mumbai',
    propertyType: 'industrial',
    category: 'commercial',
    address: {
      street: 'MIDC Area',
      area: 'Bhiwandi',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '421302',
      country: 'India'
    },
    location: {
      type: 'Point',
      coordinates: [73.0644, 19.2952]
    },
    rental: {
      monthlyRent: 120000,
      securityDeposit: 240000,
      maintenanceCharges: { amount: 10000, included: false },
      leaseDuration: { minimum: 12, unit: 'months' },
      availableFrom: new Date()
    },
    specifications: {
      bedrooms: 0,
      bathrooms: 2,
      area: { carpet: 5000, builtUp: 5500, unit: 'sqft' },
      floor: { current: 1, total: 1 }
    },
    owner: TEST_OWNER_ID,
    visibility: 'public',
    status: 'available'
  },
  {
    title: 'Retail Shop in Connaught Place',
    description: 'Prime retail location in CP',
    propertyType: 'retail',
    category: 'commercial',
    address: {
      street: 'Inner Circle',
      area: 'Connaught Place',
      city: 'Delhi',
      state: 'Delhi',
      pincode: '110001',
      country: 'India'
    },
    location: {
      type: 'Point',
      coordinates: [77.2167, 28.6289]
    },
    rental: {
      monthlyRent: 80000,
      securityDeposit: 160000,
      maintenanceCharges: { amount: 8000, included: false },
      leaseDuration: { minimum: 11, unit: 'months' },
      availableFrom: new Date()
    },
    specifications: {
      bedrooms: 0,
      bathrooms: 1,
      area: { carpet: 800, builtUp: 1000, unit: 'sqft' },
      floor: { current: 1, total: 4 }
    },
    owner: TEST_OWNER_ID,
    visibility: 'public',
    status: 'available'
  },
  {
    title: 'Office Space in Cyber City',
    description: 'Modern office in Gurgaon',
    propertyType: 'office',
    category: 'commercial',
    address: {
      street: 'DLF Cyber City',
      area: 'Sector 25',
      city: 'Gurgaon',
      state: 'Haryana',
      pincode: '122002',
      country: 'India'
    },
    location: {
      type: 'Point',
      coordinates: [77.0886, 28.4942]
    },
    rental: {
      monthlyRent: 90000,
      securityDeposit: 180000,
      maintenanceCharges: { amount: 9000, included: false },
      leaseDuration: { minimum: 12, unit: 'months' },
      availableFrom: new Date()
    },
    specifications: {
      bedrooms: 0,
      bathrooms: 2,
      area: { carpet: 2000, builtUp: 2400, unit: 'sqft' },
      floor: { current: 8, total: 15 }
    },
    owner: TEST_OWNER_ID,
    visibility: 'public',
    status: 'available'
  }
];

async function seedData() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get or create a test user
    const User = mongoose.model('User');
    let testUser = await User.findOne({ email: 'testowner@connectspace.com' });
    
    if (!testUser) {
      console.log('⚠️ No test user found. Please create a user first or use an existing user ID.');
      console.log('Getting first available user...');
      testUser = await User.findOne({});
      if (!testUser) {
        console.log('❌ No users found in database. Please create a user first.');
        return;
      }
    }
    
    console.log(`✅ Using owner: ${testUser.firstName} ${testUser.lastName} (${testUser._id})\n`);

    console.log('🌱 Seeding test data...');
    
    for (const propData of testProperties) {
      propData.owner = testUser._id; // Set the actual owner ID
      const property = new Property(propData);
      await property.save();
      console.log(`✅ Created: ${property.title} (${property.propertyType}) in ${property.address.city}`);
    }

    console.log(`\n🎉 Successfully created ${testProperties.length} test properties!`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB');
  }
}

seedData();
