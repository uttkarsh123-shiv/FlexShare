const sharp = require('sharp');
const { PDFDocument } = require('pdf-lib');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');

async function testConversions() {
  console.log('Testing all conversion libraries...\n');

  // Test Sharp (Image conversions)
  try {
    console.log('✓ Sharp library loaded successfully');
    // Create a test image buffer
    const testImage = await sharp({
      create: {
        width: 100,
        height: 100,
        channels: 3,
        background: { r: 255, g: 0, b: 0 }
      }
    }).png().toBuffer();
    console.log('✓ Sharp can create images');
  } catch (error) {
    console.log('✗ Sharp test failed:', error.message);
  }

  // Test PDF-lib
  try {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage();
    page.drawText('Test PDF');
    const pdfBytes = await pdfDoc.save();
    console.log('✓ PDF-lib can create PDFs');
  } catch (error) {
    console.log('✗ PDF-lib test failed:', error.message);
  }

  // Test pdf-parse
  try {
    console.log('✓ pdf-parse library loaded successfully');
  } catch (error) {
    console.log('✗ pdf-parse test failed:', error.message);
  }

  // Test mammoth
  try {
    console.log('✓ mammoth library loaded successfully');
  } catch (error) {
    console.log('✗ mammoth test failed:', error.message);
  }

  // Test xlsx
  try {
    const wb = xlsx.utils.book_new();
    const ws = xlsx.utils.aoa_to_sheet([['Test', 'Data'], [1, 2]]);
    xlsx.utils.book_append_sheet(wb, ws, 'Sheet1');
    console.log('✓ xlsx can create spreadsheets');
  } catch (error) {
    console.log('✗ xlsx test failed:', error.message);
  }

  // Test Python packages
  const { execFile } = require('child_process');
  const util = require('util');
  const execFileAsync = util.promisify(execFile);

  try {
    await execFileAsync('python', ['-c', 'import pdf2docx; print("pdf2docx available")']);
    console.log('✓ pdf2docx Python package available');
  } catch (error) {
    console.log('✗ pdf2docx Python package not available');
  }

  try {
    await execFileAsync('python', ['-c', 'import docx2pdf; print("docx2pdf available")']);
    console.log('✓ docx2pdf Python package available');
  } catch (error) {
    console.log('✗ docx2pdf Python package not available');
  }

  console.log('\nConversion test completed!');
}

testConversions().catch(console.error);