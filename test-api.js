// Simple API test script
const API_KEY = 'your-super-secret-blog-api-key-2024';
const BASE_URL = 'http://localhost:4321';

async function testAPI(endpoint, description) {
  try {
    console.log(`\n🧪 Testing: ${description}`);
    console.log(`📡 Endpoint: ${endpoint}`);
    
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      headers: {
        'X-API-Key': API_KEY,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    console.log(`✅ Success: ${response.status}`);
    console.log(`📊 Data count: ${data.data?.length || 0}`);
    console.log(`🔍 Sample data:`, data.data?.[0]?.title || data.data?.[0]?.name || 'No title/name');
    
    return data;
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
    return null;
  }
}

async function runTests() {
  console.log('🚀 Starting Affiliate API Tests...\n');
  
  // Test affiliate categories
  await testAPI('/api/affiliate-categories.json', 'Affiliate Categories');
  
  // Test affiliate products
  await testAPI('/api/affiliate-products.json', 'All Affiliate Products');
  
  // Test category-specific products
  await testAPI('/api/affiliate-products/tech.json', 'Tech Products');
  await testAPI('/api/affiliate-products/audio.json', 'Audio Products');
  
  // Test affiliate comparisons
  await testAPI('/api/affiliate-comparisons.json', 'Affiliate Comparisons');
  
  // Test with search parameters
  await testAPI('/api/affiliate-products.json?search=apple', 'Search for Apple Products');
  await testAPI('/api/affiliate-categories.json?featured=true', 'Featured Categories');
  
  console.log('\n🎯 API Tests Complete!');
}

runTests().catch(console.error);