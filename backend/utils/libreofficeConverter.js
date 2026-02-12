const { execFile } = require('child_process');
const { promisify } = require('util');
const fs = require('fs');
const path = require('path');
const logger = require('./logger');
const { PDFParse } = require('pdf-parse');
const { Document, Packer, Paragraph, TextRun } = require('docx');

const execFileAsync = promisify(execFile);

class LibreOfficeConverter {
  constructor() {
    this.timeout = 120000; // 120 seconds timeout for large files
    this.maxConcurrent = 5; // Increased from 3 to 5
    this.activeConversions = 0;
    this.libreOfficeCmd = null; // Will be set by isAvailable()
  }

  /**
   * Get LibreOffice executable path
   */
  getLibreOfficeCommand() {
    // Windows paths
    const windowsPaths = [
      'C:\\Program Files\\LibreOffice\\program\\soffice.com',
      'C:\\Program Files (x86)\\LibreOffice\\program\\soffice.com',
      'soffice'
    ];
    
    // Unix/Linux paths
    const unixPaths = ['libreoffice', 'soffice'];
    
    const isWindows = process.platform === 'win32';
    return isWindows ? windowsPaths : unixPaths;
  }

  /**
   * Check if LibreOffice is available
   */
  async isAvailable() {
    // If we already found a working command, use it
    if (this.libreOfficeCmd) {
      return true;
    }
    
    const commands = this.getLibreOfficeCommand();
    
    for (const cmd of commands) {
      try {
        await execFileAsync(cmd, ['--version'], { timeout: 5000 });
        this.libreOfficeCmd = cmd;
        logger.log(`LibreOffice found at: ${cmd}`);
        return true;
      } catch (error) {
        // Continue to next command
      }
    }
    
    logger.warn('LibreOffice not available at any known location');
    return false;
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
      'excel->csv': 'csv'
      // Note: pdf->txt is not supported by LibreOffice, use fallback
    };
    return formatMap[conversionType];
  }

  /**
   * Convert file using LibreOffice
   */
  async convert(inputPath, outputDir, conversionType) {
    // PDF conversions need special handling (LibreOffice can't convert FROM PDF)
    if (conversionType === 'pdf->txt' || conversionType === 'pdf->word') {
      return await this.fallbackPdfConversion(inputPath, outputDir, conversionType);
    }
    
    if (this.activeConversions >= this.maxConcurrent) {
      throw new Error('Too many concurrent conversions. Please try again later.');
    }

    const targetFormat = this.getTargetFormat(conversionType);
    if (!targetFormat) {
      throw new Error(`Unsupported conversion type: ${conversionType}`);
    }

    // Ensure LibreOffice is available and command is set
    if (!this.libreOfficeCmd) {
      const isAvailable = await this.isAvailable();
      if (!isAvailable) {
        throw new Error('LibreOffice is not available');
      }
    }

    this.activeConversions++;
    
    try {
      logger.log(`Starting LibreOffice conversion: ${conversionType}`);
      
      // Ensure output directory exists
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      // Verify input file exists and is readable
      if (!fs.existsSync(inputPath)) {
        throw new Error(`Input file not found: ${inputPath}`);
      }

      const inputStats = fs.statSync(inputPath);
      if (inputStats.size === 0) {
        throw new Error('Input file is empty');
      }

      logger.log(`Input file: ${inputPath} (${inputStats.size} bytes)`);

      // LibreOffice command
      const args = [
        '--headless',
        '--convert-to', targetFormat,
        '--outdir', outputDir,
        inputPath
      ];

      logger.log(`LibreOffice command: ${this.libreOfficeCmd} ${args.join(' ')}`);

      // Execute conversion with increased timeout
      const { stdout, stderr } = await execFileAsync(this.libreOfficeCmd, args, {
        timeout: this.timeout,
        env: {
          ...process.env,
          SAL_USE_VCLPLUGIN: 'svp', // Use headless plugin
          HOME: process.env.HOME || process.env.USERPROFILE || '/tmp' // Ensure HOME is set
        }
      });

      if (stdout) {
        logger.log('LibreOffice stdout:', stdout);
      }
      
      if (stderr) {
        logger.warn('LibreOffice stderr:', stderr);
      }

      // Determine expected output file
      const inputBasename = path.basename(inputPath, path.extname(inputPath));
      const expectedOutput = path.join(outputDir, `${inputBasename}.${targetFormat}`);

      logger.log(`Expected output: ${expectedOutput}`);

      // Poll for file existence with shorter intervals (max 5 seconds total)
      let attempts = 0;
      const maxAttempts = 50; // 50 attempts * 100ms = 5 seconds max
      
      while (attempts < maxAttempts) {
        if (fs.existsSync(expectedOutput)) {
          const stats = fs.statSync(expectedOutput);
          if (stats.size > 0) {
            // File exists and has content, validate it
            
            // Additional validation for PDF files
            if (targetFormat === 'pdf') {
              const pdfBuffer = fs.readFileSync(expectedOutput);
              // Check if file starts with PDF header
              if (!pdfBuffer.toString('utf8', 0, 4).includes('%PDF')) {
                throw new Error('Generated PDF file is corrupted (invalid PDF header)');
              }
            }
            
            logger.log(`LibreOffice conversion successful: ${expectedOutput} (${stats.size} bytes)`);
            return expectedOutput;
          }
        }
        
        // Wait 100ms before next check
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
      }

      // If we get here, file wasn't created in time
      // Check if there's an alternative file
      const files = fs.readdirSync(outputDir);
      logger.log('Files in output directory:', files);
      
      const possibleOutput = files.find(f => f.endsWith(`.${targetFormat}`));
      if (possibleOutput) {
        const foundPath = path.join(outputDir, possibleOutput);
        logger.log(`Found alternative output file: ${foundPath}`);
        
        const stats = fs.statSync(foundPath);
        if (stats.size > 0) {
          logger.log(`LibreOffice conversion successful: ${foundPath} (${stats.size} bytes)`);
          return foundPath;
        }
      }
      
      throw new Error(`Expected output file not found after ${maxAttempts * 100}ms: ${expectedOutput}`);

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
    try {
      logger.log('Using pdf-parse fallback for PDF conversion');
      
      const dataBuffer = fs.readFileSync(inputPath);
      const parser = new PDFParse({ data: dataBuffer });
      const result = await parser.getText();
      
      const inputBasename = path.basename(inputPath, path.extname(inputPath));
      let outputPath;
      
      // Extract text from all pages
      let content = '';
      if (result.pages && Array.isArray(result.pages)) {
        content = result.pages.map(page => page.text).join('\n\n');
      } else if (result.text) {
        content = result.text;
      }
      
      if (conversionType === 'pdf->word') {
        // Create a proper .docx file using docx library
        outputPath = path.join(outputDir, `${inputBasename}.docx`);
        
        // Split content into paragraphs
        const paragraphs = content.split('\n').map(line => 
          new Paragraph({
            children: [new TextRun(line || ' ')], // Empty line if no content
          })
        );
        
        const doc = new Document({
          sections: [{
            properties: {},
            children: paragraphs,
          }],
        });
        
        const buffer = await Packer.toBuffer(doc);
        fs.writeFileSync(outputPath, buffer);
        
        logger.log(`Created Word document: ${outputPath} (${buffer.length} bytes)`);
      } else {
        // Create text file
        outputPath = path.join(outputDir, `${inputBasename}.txt`);
        fs.writeFileSync(outputPath, content);
        logger.log(`Created text file: ${outputPath} (${content.length} characters)`);
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