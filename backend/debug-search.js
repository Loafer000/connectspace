const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI;

// Property Schema (simplified)
const propertySchema = new mongoose.Schema({
  title: String,
  propertyType: String,
  address: {
    city: String,
    area: String,
    state: String
  },
  visibility: String,
  status: String,
  isDeleted: Boolean
});

const Property = mongoose.model('Property', propertySchema);

async function debugSearch() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // 1. Check total properties
    const total = await Property.countDocuments({});
    console.log(`📊 Total properties in database: ${total}\n`);

    // 2. Check properties by city
    const cities = await Property.aggregate([
      { $group: { _id: '$address.city', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    console.log('🏙️ Properties by city:');
    cities.forEach(c => console.log(`   ${c._id}: ${c.count}`));
    console.log('');

    // 3. Check properties by type
    const types = await Property.aggregate([
      { $group: { _id: '$propertyType', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    console.log('🏢 Properties by type:');
    types.forEach(t => console.log(`   ${t._id}: ${t.count}`));
    console.log('');

    // 4. Test search: Mumbai + Any Type
    console.log('🔍 TEST 1: Search Mumbai (no type filter)');
    const mumbaiAll = await Property.find({
      isDeleted: false,
      $or: [
        { 'address.city': /mumbai/i },
        { 'address.area': /mumbai/i },
        { 'address.state': /mumbai/i }
      ]
    });
    console.log(`   Found: ${mumbaiAll.length} properties`);
    mumbaiAll.slice(0, 3).forEach(p => {
      console.log(`   - ${p.title} (${p.propertyType}) in ${p.address.city}`);
    });
    console.log('');

    // 5. Test search: Mumbai + Retail
    console.log('🔍 TEST 2: Search Mumbai + Retail');
    const mumbaiRetail = await Property.find({
      isDeleted: false,
      propertyType: /retail/i,
      $or: [
        { 'address.city': /mumbai/i },
        { 'address.area': /mumbai/i },
        { 'address.state': /mumbai/i }
      ]
    });
    console.log(`   Found: ${mumbaiRetail.length} properties`);
    mumbaiRetail.slice(0, 3).forEach(p => {
      console.log(`   - ${p.title} (${p.propertyType}) in ${p.address.city}`);
    });
    console.log('');

    // 6. Sample properties
    console.log('📦 Sample properties:');
    const samples = await Property.find({}).limit(5);
    samples.forEach(p => {
      console.log(`   - ${p.title}`);
      console.log(`     Type: ${p.propertyType}`);
      console.log(`     City: ${p.address.city}`);
      console.log(`     Visibility: ${p.visibility}, Status: ${p.status}, Deleted: ${p.isDeleted}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
  }
}

debugSearch();
