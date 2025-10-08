const axios = require('axios');

const API_BASE = 'https://connectspace-abgg.onrender.com/api';

// Test property creation with authentication
async function testPropertyCreation() {
    try {
        console.log('🔐 Step 1: Testing login...');
        
        // First, let's try to register a test user if needed
        const testUser = {
            firstName: 'Test',
            lastName: 'Landlord',
            email: 'testlordland@example.com',
            password: 'Test123!@#',
            phone: '9876543210',
            role: 'landlord'
        };

        try {
            const registerResponse = await axios.post(`${API_BASE}/auth/register`, testUser);
            console.log('✅ User registered:', registerResponse.data.message);
        } catch (regError) {
            if (regError.response?.status === 400 && regError.response?.data?.message?.includes('already exists')) {
                console.log('ℹ️ User already exists, proceeding with login...');
            } else {
                console.log('⚠️ Registration error:', regError.response?.data?.message);
            }
        }

        // Login to get token
        const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
            email: testUser.email,
            password: testUser.password
        });

        if (!loginResponse.data.success) {
            throw new Error('Login failed: ' + loginResponse.data.message);
        }

        const token = loginResponse.data.data.token;
        console.log('✅ Login successful, token received');

        console.log('🏠 Step 2: Creating test property...');

        // Create a comprehensive test property
        const propertyData = {
            title: 'Test Office Space - ' + new Date().toISOString(),
            description: 'A beautiful office space for testing property creation functionality. This property has all the necessary amenities.',
            propertyType: 'office',
            category: 'commercial',
            address: {
                street: '123 Test Street, Business District',
                area: 'Bandra West',
                city: 'Mumbai',
                state: 'Maharashtra',
                pincode: '400050',
                country: 'India',
                landmark: 'Near Metro Station'
            },
            rental: {
                monthlyRent: 45000,
                securityDeposit: 90000,
                maintenanceCharges: 5000,
                utilitiesIncluded: false
            },
            specifications: {
                totalArea: 1200,
                builtUpArea: 1000,
                floorNumber: 5,
                totalFloors: 15,
                bedrooms: 0,
                bathrooms: 2,
                amenities: ['parking', 'security', 'elevator', 'power_backup', 'internet']
            },
            images: ['https://images.unsplash.com/photo-1497366216548-37526070297c?w=800'],
            visibility: 'public',
            status: 'available'
        };

        console.log('📝 Property data to send:', JSON.stringify(propertyData, null, 2));

        const propertyResponse = await axios.post(`${API_BASE}/properties`, propertyData, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('✅ Property created successfully!');
        console.log('📊 Response:', JSON.stringify(propertyResponse.data, null, 2));

        // Verify property was saved by fetching it
        console.log('🔍 Step 3: Verifying property was saved...');
        const fetchResponse = await axios.get(`${API_BASE}/properties`);
        console.log('📋 All properties in database:', JSON.stringify(fetchResponse.data, null, 2));

        console.log('🎉 SUCCESS: Property creation test completed!');

    } catch (error) {
        console.error('❌ Test failed:', error.response?.data || error.message);
        console.error('📊 Error details:', {
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data
        });
    }
}

// Run the test
console.log('🚀 Starting property creation test...');
testPropertyCreation();