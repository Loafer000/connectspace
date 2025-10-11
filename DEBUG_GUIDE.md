# 🐛 Debug Guide - Search & PropertyDetails Issues

## Current Issues
1. **Search Issue**: Typing "Abcde" shows ALL properties instead of filtered results
2. **PropertyDetails Issue**: Shows "Oops! Something went wrong" error

## Debug Logging Added (Commit: bd634f1d)

### Search Endpoint (`/api/properties/search`)
The backend now logs:
- 🔍 Incoming query parameters (`req.query`)
- 🎯 Search term value (`q` parameter)
- 🔧 Base filters (status, visibility, isDeleted)
- 🔎 Search regex pattern created
- 📋 All fields being searched against
- 🏙️ City/area/type filters if present
- 💰 Price range filters if present
- 🎯 Final MongoDB query object (complete filters)
- ✅ Number of properties found
- 📦 Sample property data (first 2 results)
- 📊 Database statistics (total/public/available counts)

### PropertyDetails Endpoint (`/api/properties/:id`)
The backend now logs:
- 🏠 Requested property ID
- ❌ Invalid ObjectId format detection
- ⏳ MongoDB query execution
- 📦 Query result status (found/not found)
- ✅ Property details (title, city, status, visibility, images count, owner)
- 👤 User viewing info (logged in or anonymous)
- ❌ Error details with stack trace

## How to Debug

### Step 1: Open Backend Terminal
The backend server should be running at `http://localhost:5000`

### Step 2: Test Search
1. Open your frontend in browser
2. Search for "Abcde" (or any specific term)
3. Watch the **backend terminal** for logs starting with 🔍
4. Look for:
   - Is `q` parameter received correctly?
   - What does the final MongoDB filter look like?
   - How many properties are returned?
   - What data is in the sample properties?

### Step 3: Test PropertyDetails
1. Click on any property from search results
2. Watch the **backend terminal** for logs starting with 🏠
3. Look for:
   - Is the property ID valid?
   - Was the property found in MongoDB?
   - What are the property details?
   - Are there any errors?

### Step 4: Frontend Console
Open browser DevTools Console (F12) and look for:
- `🔍 PropertyContext` logs from search
- `📍 Fetching property` logs from PropertyDetails
- Any error messages

## Expected Log Patterns

### Successful Search (Should Filter)
```
🔍 ========== SEARCH REQUEST START ==========
📥 Query params received: { q: 'Abcde' }
🎯 Search term (q): Abcde
🔧 Base filters: { status: 'available', visibility: 'public', isDeleted: false }
🔎 Creating search regex for: Abcde
📋 Search will match against fields: [title, description, address.city, ...]
🎯 Final MongoDB query filters: {
  "status": "available",
  "visibility": "public",
  "isDeleted": false,
  "$or": [
    { "title": { "$regex": "Abcde", "$options": "i" } },
    { "address.city": { "$regex": "Abcde", "$options": "i" } },
    ...
  ]
}
⏳ Executing MongoDB query...
✅ Query executed. Found 2 properties
📦 Sample property data:
   [1] Abcde Mansion
       City: Abcde City
       Visibility: public
       Status: available
```

### Failed Search (Returns All)
```
🔍 ========== SEARCH REQUEST START ==========
📥 Query params received: { q: 'Abcde' }
...
✅ Query executed. Found 50 properties  ⚠️ TOO MANY!
📦 Sample property data:
   [1] Random Property 1  ⚠️ Doesn't match "Abcde"!
       City: Mumbai
```

### Successful PropertyDetails
```
🏠 ========== GET PROPERTY BY ID START ==========
📍 Requested property ID: 675a1b2c3d4e5f6789abcdef
⏳ Querying MongoDB...
📦 MongoDB query result: Property found
✅ Property retrieved successfully:
   Title: Beautiful 2BHK Apartment
   City: Mumbai
   Status: available
   Visibility: public
   Images count: 5
   Owner: John Doe
```

### Failed PropertyDetails
```
🏠 ========== GET PROPERTY BY ID START ==========
📍 Requested property ID: 675a1b2c3d4e5f6789abcdef
⏳ Querying MongoDB...
📦 MongoDB query result: Property NOT found  ⚠️ ISSUE!
⚠️ Property not found or deleted. Deleted status: undefined
```

## Common Issues to Look For

### Search Returns All Properties
**Possible Causes:**
1. **All properties match the regex** - Check if properties have "Abcde" in ANY field
2. **Filter not applied** - $or clause might be empty or malformed
3. **All properties are public** - Base filters are too broad

**What to Check:**
- Is the `$or` array in the final filter?
- Are properties in DB actually matching the search term?
- Is `visibility: 'public'` set on ALL properties?

### PropertyDetails Shows Error
**Possible Causes:**
1. **Property doesn't exist** - ID not found in MongoDB
2. **Property is deleted** - `isDeleted: true`
3. **Invalid ID format** - Not a valid MongoDB ObjectId
4. **Response format wrong** - Frontend expects `response.data.property`

**What to Check:**
- Is the ID valid (24 hex characters)?
- Does the property exist in MongoDB?
- Is `response.data.property` being sent correctly?
- Check frontend logs for the actual error

## Next Steps After Logging

### If Search Shows All Properties:
1. Check MongoDB directly: `db.properties.find({ visibility: 'public', status: 'available' }).count()`
2. Test specific query: `db.properties.find({ "address.city": { $regex: "Abcde", $options: "i" } })`
3. Check if properties have empty/null address fields
4. Verify search term is reaching backend correctly

### If PropertyDetails Fails:
1. Copy the property ID from frontend URL
2. Check MongoDB: `db.properties.findById("ID_HERE")`
3. Verify the property exists and has required fields
4. Test the endpoint directly: `curl http://localhost:5000/api/properties/ID_HERE`

## MongoDB Compass Queries

### Check All Properties Status
```javascript
// Count by visibility
db.properties.aggregate([
  { $group: { _id: "$visibility", count: { $sum: 1 } } }
])

// Count by status
db.properties.aggregate([
  { $group: { _id: "$status", count: { $sum: 1 } } }
])

// Find properties without addresses
db.properties.find({ "address.city": { $exists: false } })
```

### Test Search Regex
```javascript
// Should only match "Abcde" properties
db.properties.find({
  $and: [
    { status: 'available', visibility: 'public', isDeleted: false },
    {
      $or: [
        { title: { $regex: "Abcde", $options: "i" } },
        { "address.city": { $regex: "Abcde", $options: "i" } }
      ]
    }
  ]
})
```

## Contact Points
- Backend Terminal: Look for 🔍 and 🏠 emojis
- Frontend Console: Look for 🔍 PropertyContext and 📍 Fetching
- MongoDB Compass: Run queries to verify data
- Network Tab: Check API responses

---
**Created:** Debug logging commit bd634f1d  
**Purpose:** Comprehensive debugging of search and property details functionality
