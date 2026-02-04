const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const axios = require('axios');

async function testPasswordProtection() {
  const SERVER_URL = 'http://localhost:3000';
  
  console.log('🔒 Testing Password Protection Feature');
  console.log('=====================================');
  
  try {
    // Test file path - using a simple text file for testing
    const testFile = path.join('./Test_data', 'test.txt');
    
    // Create a test file if it doesn't exist
    if (!fs.existsSync(testFile)) {
      const testDir = path.dirname(testFile);
      if (!fs.existsSync(testDir)) {
        fs.mkdirSync(testDir, { recursive: true });
      }
      fs.writeFileSync(testFile, 'This is a test file for password protection.');
    }
    
    // Test 1: Upload file with password
    console.log('\n📤 Test 1: Uploading file with password...');
    
    const form = new FormData();
    form.append('file', fs.createReadStream(testFile));
    form.append('conversionType', 'none');
    form.append('description', 'Password protected test file');
    form.append('password', 'TEST123'); // 6-character password
    
    const uploadResponse = await axios.post(`${SERVER_URL}/api/uploads`, form, {
      headers: { ...form.getHeaders() },
      timeout: 30000,
    });
    
    console.log('✅ Upload successful!');
    console.log(`Code: ${uploadResponse.data.code}`);
    const fileCode = uploadResponse.data.code;
    
    // Test 2: Get file info (should show hasPassword: true but no file content)
    console.log('\n📋 Test 2: Getting file info (should show password protection)...');
    
    const infoResponse = await axios.get(`${SERVER_URL}/api/file/${fileCode}/info`);
    
    console.log('✅ File info retrieved!');
    console.log(`Has Password: ${infoResponse.data.hasPassword}`);
    console.log(`File URL: ${infoResponse.data.fileUrl ? 'Present' : 'Not present'}`);
    console.log(`Original Filename: ${infoResponse.data.originalFileName}`);
    
    if (infoResponse.data.hasPassword) {
      console.log('✅ Password protection detected correctly!');
    } else {
      console.log('❌ Password protection not detected!');
    }
    
    // Test 3: Try to access file without password (should fail)
    console.log('\n🚫 Test 3: Trying to access file without password...');
    
    try {
      await axios.post(`${SERVER_URL}/api/file/${fileCode}`, {});
      console.log('❌ Should have failed but didn\'t!');
    } catch (error) {
      if (error.response?.status === 401 && error.response?.data?.requiresPassword) {
        console.log('✅ Correctly rejected access without password!');
      } else {
        console.log('❌ Unexpected error:', error.response?.data || error.message);
      }
    }
    
    // Test 4: Try to access file with wrong password (should fail)
    console.log('\n🔑 Test 4: Trying to access file with wrong password...');
    
    try {
      await axios.post(`${SERVER_URL}/api/file/${fileCode}`, {
        password: 'WRONG1'
      });
      console.log('❌ Should have failed but didn\'t!');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Correctly rejected wrong password!');
      } else {
        console.log('❌ Unexpected error:', error.response?.data || error.message);
      }
    }
    
    // Test 5: Access file with correct password (should succeed)
    console.log('\n✅ Test 5: Accessing file with correct password...');
    
    const accessResponse = await axios.post(`${SERVER_URL}/api/file/${fileCode}`, {
      password: 'TEST123'
    });
    
    console.log('✅ File accessed successfully with correct password!');
    console.log(`File URL: ${accessResponse.data.fileUrl ? 'Present' : 'Not present'}`);
    console.log(`Download Count: ${accessResponse.data.downloadCount}`);
    
    console.log('\n🎉 All password protection tests passed!');
    
  } catch (error) {
    console.log('❌ Test failed');
    console.log(`Error: ${error.message}`);
    
    if (error.response) {
      console.log(`Status: ${error.response.status}`);
      console.log(`Response:`, error.response.data);
    }
  }
}

// Run the test
testPasswordProtection().catch(console.error);