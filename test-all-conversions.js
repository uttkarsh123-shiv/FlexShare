const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

// Test configuration
const API_URL = 'http://localhost:3000'; // Change to your backend URL
const TEST_FILES_DIR = './test-files';
const RESULTS_DIR = './conversion-results';

// Sample file URLs for testing
const SAMPLE_FILES = {
  // Image files
  'test-image.png': 'https://via.placeholder.com/800x600.png',
  'test-image.jpg': 'https://via.placeholder.com/800x600.jpg',
  'test-image.jpeg': 'https://via.placeholder.com/800x600.jpeg',
  'test-image.webp': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop&fm=webp',
  'test-image.gif': 'https://media.giphy.com/media/3oEjI6SIIHBdRxXI40/200.gif',
  
  // Document files
  'sample.pdf': 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
  'sample.docx': 'https://file-examples.com/storage/fe68c8a7c4c83d3226e9b0c/2017/10/file_example_DOCX_10kB.docx',
  'sample.doc': 'https://file-examples.com/storage/fe68c8a7c4c83d3226e9b0c/2017/10/file_example_DOC_10kB.doc',
  
  // Spreadsheet files
  'sample.xlsx': 'https://file-examples.com/storage/fe68c8a7c4c83d3226e9b0c/2017/10/file_example_XLSX_10.xlsx',
  'sample.xls': 'https://file-examples.com/storage/fe68c8a7c4c83d3226e9b0c/2017/10/file_example_XLS_10.xls',
  
  // Presentation files
  'sample.pptx': 'https://file-examples.com/storage/fe68c8a7c4c83d3226e9b0c/2017/08/file_example_PPTX_1MB.pptx',
  'sample.ppt': 'https://file-examples.com/storage/fe68c8a7c4c83d3226e9b0c/2017/08/file_example_PPT_1MB.ppt'
};

// All conversion types to test
const CONVERSIONS_TO_TEST = [
  // Image conversions
  { file: 'test-image.png', conversion: 'image->jpg', expected: 'jpg' },
  { file: 'test-image.jpg', conversion: 'image->png', expected: 'png' },
  { file: 'test-image.jpeg', conversion: 'image->webp', expected: 'webp' },
  { file: 'test-image.png', conversion: 'image->gif', expected: 'gif' },
  { file: 'test-image.jpg', conversion: 'image->bmp', expected: 'bmp' },
  { file: 'test-image.png', conversion: 'image->avif', expected: 'avif' },
  { file: 'test-image.jpg', conversion: 'image->pdf', expected: 'pdf' },
  
  // PDF conversions
  { file: 'sample.pdf', conversion: 'pdf->word', expected: 'docx' },
  { file: 'sample.pdf', conversion: 'pdf->txt', expected: 'txt' },
  { file: 'sample.pdf', conversion: 'pdf->images', expected: 'zip' },
  
  // Word conversions
  { file: 'sample.docx', conversion: 'word->pdf', expected: 'pdf' },
  { file: 'sample.doc', conversion: 'word->txt', expected: 'txt' },
  
  // Excel conversions
  { file: 'sample.xlsx', conversion: 'excel->pdf', expected: 'pdf' },
  { file: 'sample.xls', conversion: 'excel->csv', expected: 'csv' },
  
  // PowerPoint conversions
  { file: 'sample.pptx', conversion: 'ppt->pdf', expected: 'pdf' },
  
  // No conversion
  { file: 'sample.pdf', conversion: 'none', expected: 'pdf' },
  { file: 'test-image.png', conversion: 'none', expected: 'png' }
];

class ConversionTester {
  constructor() {
    this.results = [];
    this.setupDirectories();
  }

  setupDirectories() {
    if (!fs.existsSync(TEST_FILES_DIR)) {
      fs.mkdirSync(TEST_FILES_DIR, { recursive: true });
    }
    if (!fs.existsSync(RESULTS_DIR)) {
      fs.mkdirSync(RESULTS_DIR, { recursive: true });
    }
  }

  async downloadFile(url, filename) {
    const filePath = path.join(TEST_FILES_DIR, filename);
    
    // Skip if file already exists
    if (fs.existsSync(filePath)) {
      console.log(`✓ File ${filename} already exists`);
      return filePath;
    }

    try {
      console.log(`📥 Downloading ${filename}...`);
      const response = await axios({
        method: 'GET',
        url: url,
        responseType: 'stream',
        timeout: 30000
      });

      const writer = fs.createWriteStream(filePath);
      response.data.pipe(writer);

      return new Promise((resolve, reject) => {
        writer.on('finish', () => {
          console.log(`✅ Downloaded ${filename}`);
          resolve(filePath);
        });
        writer.on('error', reject);
      });
    } catch (error) {
      console.error(`❌ Failed to download ${filename}:`, error.message);
      throw error;
    }
  }

  async downloadAllFiles() {
    console.log('🚀 Downloading test files...\n');
    
    for (const [filename, url] of Object.entries(SAMPLE_FILES)) {
      try {
        await this.downloadFile(url, filename);
      } catch (error) {
        console.error(`Failed to download ${filename}, skipping...`);
      }
    }
    
    console.log('\n📁 All files downloaded!\n');
  }

  async testConversion(testCase) {
    const { file, conversion, expected } = testCase;
    const filePath = path.join(TEST_FILES_DIR, file);
    
    console.log(`🔄 Testing: ${file} → ${conversion}`);

    // Check if source file exists
    if (!fs.existsSync(filePath)) {
      const result = {
        file,
        conversion,
        expected,
        status: 'SKIPPED',
        error: 'Source file not found',
        duration: 0
      };
      this.results.push(result);
      console.log(`⚠️  SKIPPED: ${file} not found`);
      return result;
    }

    const startTime = Date.now();

    try {
      // Create form data
      const formData = new FormData();
      formData.append('file', fs.createReadStream(filePath));
      formData.append('conversionType', conversion);
      formData.append('description', `Test conversion: ${conversion}`);

      // Upload and convert
      const response = await axios.post(`${API_URL}/api/uploads`, formData, {
        headers: {
          ...formData.getHeaders(),
        },
        timeout: 60000 // 1 minute timeout
      });

      const duration = Date.now() - startTime;

      if (response.status === 200 && response.data.code) {
        // Try to access the converted file
        const fileInfoResponse = await axios.get(`${API_URL}/api/file/${response.data.code}/info`);
        
        const result = {
          file,
          conversion,
          expected,
          status: 'SUCCESS',
          code: response.data.code,
          fileUrl: fileInfoResponse.data.fileUrl,
          originalSize: fs.statSync(filePath).size,
          convertedSize: fileInfoResponse.data.fileSize,
          duration,
          conversionType: fileInfoResponse.data.conversionType
        };

        this.results.push(result);
        console.log(`✅ SUCCESS: ${file} → ${conversion} (${duration}ms)`);
        return result;
      } else {
        throw new Error('Invalid response from server');
      }

    } catch (error) {
      const duration = Date.now() - startTime;
      const result = {
        file,
        conversion,
        expected,
        status: 'FAILED',
        error: error.response?.data?.message || error.message,
        duration
      };

      this.results.push(result);
      console.log(`❌ FAILED: ${file} → ${conversion} - ${result.error}`);
      return result;
    }
  }

  async testAllConversions() {
    console.log('🧪 Starting conversion tests...\n');

    for (let i = 0; i < CONVERSIONS_TO_TEST.length; i++) {
      const testCase = CONVERSIONS_TO_TEST[i];
      console.log(`[${i + 1}/${CONVERSIONS_TO_TEST.length}]`);
      
      await this.testConversion(testCase);
      
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('');
    }
  }

  generateReport() {
    const successful = this.results.filter(r => r.status === 'SUCCESS');
    const failed = this.results.filter(r => r.status === 'FAILED');
    const skipped = this.results.filter(r => r.status === 'SKIPPED');

    const report = {
      summary: {
        total: this.results.length,
        successful: successful.length,
        failed: failed.length,
        skipped: skipped.length,
        successRate: `${((successful.length / this.results.length) * 100).toFixed(1)}%`
      },
      results: this.results,
      failedConversions: failed.map(r => ({
        conversion: `${r.file} → ${r.conversion}`,
        error: r.error
      })),
      averageDuration: successful.length > 0 
        ? Math.round(successful.reduce((sum, r) => sum + r.duration, 0) / successful.length)
        : 0
    };

    // Save detailed report
    const reportPath = path.join(RESULTS_DIR, `conversion-test-report-${Date.now()}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    // Generate markdown report
    const markdownReport = this.generateMarkdownReport(report);
    const markdownPath = path.join(RESULTS_DIR, `conversion-test-report-${Date.now()}.md`);
    fs.writeFileSync(markdownPath, markdownReport);

    return report;
  }

  generateMarkdownReport(report) {
    const { summary, results, failedConversions } = report;
    
    let markdown = `# FlexShare Conversion Test Report\n\n`;
    markdown += `**Generated:** ${new Date().toISOString()}\n\n`;
    
    // Summary
    markdown += `## 📊 Summary\n\n`;
    markdown += `- **Total Tests:** ${summary.total}\n`;
    markdown += `- **Successful:** ${summary.successful} ✅\n`;
    markdown += `- **Failed:** ${summary.failed} ❌\n`;
    markdown += `- **Skipped:** ${summary.skipped} ⚠️\n`;
    markdown += `- **Success Rate:** ${summary.successRate}\n`;
    markdown += `- **Average Duration:** ${report.averageDuration}ms\n\n`;

    // Detailed results
    markdown += `## 📋 Detailed Results\n\n`;
    markdown += `| File | Conversion | Status | Duration | Error |\n`;
    markdown += `|------|------------|--------|----------|-------|\n`;
    
    results.forEach(result => {
      const status = result.status === 'SUCCESS' ? '✅' : 
                    result.status === 'FAILED' ? '❌' : '⚠️';
      const error = result.error || '-';
      markdown += `| ${result.file} | ${result.conversion} | ${status} | ${result.duration}ms | ${error} |\n`;
    });

    // Failed conversions
    if (failedConversions.length > 0) {
      markdown += `\n## ❌ Failed Conversions\n\n`;
      failedConversions.forEach(failure => {
        markdown += `- **${failure.conversion}**: ${failure.error}\n`;
      });
    }

    // Recommendations
    markdown += `\n## 🔧 Recommendations\n\n`;
    if (summary.failed > 0) {
      markdown += `### Issues Found:\n`;
      const uniqueErrors = [...new Set(failedConversions.map(f => f.error))];
      uniqueErrors.forEach(error => {
        markdown += `- ${error}\n`;
      });
    }
    
    if (summary.successful === summary.total) {
      markdown += `🎉 All conversions working perfectly!\n`;
    }

    return markdown;
  }

  printSummary(report) {
    console.log('\n' + '='.repeat(60));
    console.log('📊 CONVERSION TEST SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total Tests: ${report.summary.total}`);
    console.log(`✅ Successful: ${report.summary.successful}`);
    console.log(`❌ Failed: ${report.summary.failed}`);
    console.log(`⚠️  Skipped: ${report.summary.skipped}`);
    console.log(`Success Rate: ${report.summary.successRate}`);
    console.log(`Average Duration: ${report.averageDuration}ms`);
    
    if (report.failedConversions.length > 0) {
      console.log('\n❌ Failed Conversions:');
      report.failedConversions.forEach(failure => {
        console.log(`  - ${failure.conversion}: ${failure.error}`);
      });
    }
    
    console.log('\n📁 Reports saved to:', RESULTS_DIR);
    console.log('='.repeat(60));
  }
}

// Main execution
async function main() {
  console.log('🚀 FlexShare Conversion Tester\n');
  
  const tester = new ConversionTester();
  
  try {
    // Download test files
    await tester.downloadAllFiles();
    
    // Test all conversions
    await tester.testAllConversions();
    
    // Generate and display report
    const report = tester.generateReport();
    tester.printSummary(report);
    
  } catch (error) {
    console.error('❌ Test execution failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { ConversionTester, CONVERSIONS_TO_TEST };

