const LibreOfficeConverter = require('./backend/utils/libreofficeConverter');
const fs = require('fs');
const path = require('path');

async function testLibreOfficeIntegration() {
  console.log('🔍 Testing LibreOffice Integration...\n');

  try {
    // Test 1: Check LibreOffice availability
    console.log('1. Checking LibreOffice availability...');
    const isAvailable = await LibreOfficeConverter.isAvailable();
    console.log(`   LibreOffice available: ${isAvailable ? '✅ YES' : '❌ NO'}`);
    
    if (!isAvailable) {
      console.log('\n❌ LibreOffice is not installed or not in PATH');
      console.log('📋 Installation instructions:');
      console.log('   Ubuntu/Debian: sudo apt-get install libreoffice');
      console.log('   CentOS/RHEL: sudo yum install libreoffice');
      console.log('   macOS: brew install --cask libreoffice');
      console.log('   Windows: Download from https://www.libreoffice.org/download/');
      return;
    }

    // Test 2: Check supported conversions
    console.log('\n2. Supported conversion types:');
    const supportedConversions = LibreOfficeConverter.getSupportedConversions();
    supportedConversions.forEach(conversion => {
      console.log(`   ✅ ${conversion}`);
    });

    // Test 3: Test conversion with sample files (if available)
    console.log('\n3. Testing conversions with sample files...');
    
    const testDataDir = './Test_data';
    if (fs.existsSync(testDataDir)) {
      const files = fs.readdirSync(testDataDir);
      console.log(`   Found ${files.length} test files in ${testDataDir}`);
      
      // Test with first few files
      const testFiles = files.slice(0, 3);
      for (const file of testFiles) {
        const filePath = path.join(testDataDir, file);
        const ext = path.extname(file).toLowerCase();
        
        let conversionType = null;
        if (ext === '.pdf') conversionType = 'pdf->word';
        else if (ext === '.docx' || ext === '.doc') conversionType = 'word->pdf';
        else if (ext === '.xlsx' || ext === '.xls') conversionType = 'excel->pdf';
        else if (ext === '.pptx' || ext === '.ppt') conversionType = 'ppt->pdf';
        
        if (conversionType && supportedConversions.includes(conversionType)) {
          console.log(`   📄 Testing ${file} (${conversionType})...`);
          try {
            const outputDir = './backend/uploads';
            if (!fs.existsSync(outputDir)) {
              fs.mkdirSync(outputDir, { recursive: true });
            }
            
            const result = await LibreOfficeConverter.convert(filePath, outputDir, conversionType);
            console.log(`   ✅ Conversion successful: ${path.basename(result)}`);
            
            // Clean up test output
            if (fs.existsSync(result)) {
              fs.unlinkSync(result);
            }
          } catch (error) {
            console.log(`   ❌ Conversion failed: ${error.message}`);
          }
        }
      }
    } else {
      console.log(`   ⚠️  No test data directory found at ${testDataDir}`);
      console.log('   💡 Create test files to verify conversions work properly');
    }

    console.log('\n✅ LibreOffice integration test completed!');
    console.log('\n📋 Next steps:');
    console.log('   1. Test file uploads through the web interface');
    console.log('   2. Verify conversion quality with your document types');
    console.log('   3. Monitor conversion performance under load');
    console.log('   4. Check server logs for any conversion errors');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Run the test
if (require.main === module) {
  testLibreOfficeIntegration();
}

module.exports = testLibreOfficeIntegration;