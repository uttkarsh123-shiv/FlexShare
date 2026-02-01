const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const axios = require('axios');

async function testPdfText() {
  const SERVER_URL = 'http://localhost:3000';
  
  console.log('🧪 Testing PDF Text Conversion');
  console.log('==============================');
  
  try {
    const pdfFile = path.join('./Test_data/Pdf', 'UttkarshResume.pdf');
    
    if (!fs.existsSync(pdfFile)) {
      console.log('❌ PDF file not found');
      return;
    }
    
    const form = new FormData();
    form.append('file', fs.createReadStream(pdfFile));
    form.append('conversionType', 'pdf->txt');
    form.append('description', 'Testing PDF text conversion');
    
    console.log('📤 Sending PDF text conversion request...');
    
    const response = await axios.post(`${SERVER_URL}/api/uploads`, form, {
      headers: { ...form.getHeaders() },
      timeout: 30000,
    });
    
    console.log('✅ SUCCESS!');
    console.log(`Code: ${response.data.code}`);
    console.log(`URL: ${response.data.url}`);
    console.log(`Description: ${response.data.description}`);
    
  } catch (error) {
    console.log('❌ FAILED');
    console.log(`Error: ${error.message}`);
    
    if (error.response) {
      console.log(`Status: ${error.response.status}`);
      console.log(`Response:`, error.response.data);
    }
  }
}

testPdfText().catch(console.error);