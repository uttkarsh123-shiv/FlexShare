const { execFile } = require('child_process');
const { promisify } = require('util');
const fs = require('fs');
const path = require('path');
const logger = require('./logger');

const execFileAsync = promisify(execFile);

class LibreOfficeConverter {
  constructor() {
    this.timeout = 60000; // 60 seconds timeout
    this.maxConcurrent = 3; // Limit concurrent conversions
    this.activeConversions = 0;
  }

  /**
   * Check if LibreOffice is available
   */
  async isAvailable() {
    try {
      await execFileAsync('libreoffice', ['--version'], { timeout: 5000 });
      return true;
    } catch (error) {
      logger.warn('LibreOffice not available:', error.message);
      return false;
    }
  }

  /**
   * Get target format for LibreOffice conversion
   */
  getTargetFormat(conversionType) {
    const formatMap = {
      'pdf->word': 'docx',
      'word->pdf': 'pdf',
      'excel->pdf': 'pdf',
      'ppt->pdf': 'pdf',
      'word->txt': 'txt',
      'excel->csv': 'csv',
      'pdf->txt': 'txt'
    };
    return formatMap[conversionType];
  }

  /**
   * Convert file using LibreOffice
   */
  async convert(inputPath, outputDir, conversionType) {
    if (this.activeConversions >= this.maxConcurrent) {
      throw new Error('Too many concurrent conversions. Please try again later.');
    }

    const targetFormat = this.getTargetFormat(conversionType);
    if (!targetFormat) {
      throw new Error(`Unsupported conversion type: ${conversionType}`);
    }

    this.activeConversions++;
    
    try {
      logger.log(`Starting LibreOffice conversion: ${conversionType}`);
      
      // Ensure output directory exists
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      // LibreOffice command
      const args = [
        '--headless',
        '--convert-to', targetFormat,
        '--outdir', outputDir,
        inputPath
      ];

      // Add format-specific options
      if (conversionType === 'pdf->word') {
        // Better PDF to Word conversion options
        args.splice(2, 0, '--infilter=writer_pdf_import');
      }

      logger.log(`LibreOffice command: libreoffice ${args.join(' ')}`);

      // Execute conversion
      const { stdout, stderr } = await execFileAsync('libreoffice', args, {
        timeout: this.timeout,
        env: {
          ...process.env,
          SAL_USE_VCLPLUGIN: 'svp', // Use headless plugin
          HOME: process.env.HOME || '/tmp' // Ensure HOME is set
        }
      });

      if (stderr) {
        logger.warn('LibreOffice stderr:', stderr);
      }

      // Determine expected output file
      const inputBasename = path.basename(inputPath, path.extname(inputPath));
      const expectedOutput = path.join(outputDir, `${inputBasename}.${targetFormat}`);

      // Wait a moment for file system to sync
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (fs.existsSync(expectedOutput)) {
        const stats = fs.statSync(expectedOutput);
        if (stats.size > 0) {
          logger.log(`LibreOffice conversion successful: ${expectedOutput} (${stats.size} bytes)`);
          return expectedOutput;
        } else {
          throw new Error('Output file is empty');
        }
      } else {
        throw new Error(`Expected output file not found: ${expectedOutput}`);
      }

    } catch (error) {
      logger.error('LibreOffice conversion failed:', error);
      throw error;
    } finally {
      this.activeConversions--;
    }
  }

  /**
   * Convert with fallback to text extraction for PDF files
   */
  async convertWithFallback(inputPath, outputDir, conversionType) {
    try {
      return await this.convert(inputPath, outputDir, conversionType);
    } catch (error) {
      logger.warn(`LibreOffice conversion failed, attempting fallback for ${conversionType}`);
      
      // Fallback for PDF conversions
      if (conversionType.startsWith('pdf->')) {
        return await this.fallbackPdfConversion(inputPath, outputDir, conversionType);
      }
      
      throw error;
    }
  }

  /**
   * Fallback PDF conversion using pdf-parse
   */
  async fallbackPdfConversion(inputPath, outputDir, conversionType) {
    const fs = require('fs');
    const path = require('path');
    
    try {
      // Import pdf-parse dynamically to avoid issues
      const PDFParse = require('pdf-parse');
      
      const dataBuffer = fs.readFileSync(inputPath);
      const data = await PDFParse(dataBuffer);
      
      const inputBasename = path.basename(inputPath, path.extname(inputPath));
      let outputPath;
      let content = data.text;
      
      if (conversionType === 'pdf->word') {
        // Create a simple RTF file that Word can open
        outputPath = path.join(outputDir, `${inputBasename}.rtf`);
        const rtfContent = `{\\rtf1\\ansi\\deff0 {\\fonttbl {\\f0 Times New Roman;}}\\f0\\fs24 ${content.replace(/\n/g, '\\par ')}}`;
        fs.writeFileSync(outputPath, rtfContent);
      } else {
        // Create text file
        outputPath = path.join(outputDir, `${inputBasename}.txt`);
        fs.writeFileSync(outputPath, content);
      }
      
      logger.log(`Fallback PDF conversion completed: ${outputPath}`);
      return outputPath;
      
    } catch (fallbackError) {
      logger.error('Fallback PDF conversion failed:', fallbackError);
      throw fallbackError;
    }
  }

  /**
   * Get supported conversion types
   */
  getSupportedConversions() {
    return [
      'pdf->word',
      'word->pdf', 
      'excel->pdf',
      'ppt->pdf',
      'word->txt',
      'excel->csv',
      'pdf->txt'
    ];
  }
}

module.exports = new LibreOfficeConverter();