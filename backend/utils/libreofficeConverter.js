const { execFile } = require('child_process');
const { promisify } = require('util');
const fs = require('fs');
const path = require('path');
const logger = require('./logger');
const { Document, Packer, Paragraph, TextRun } = require('docx');

const execFileAsync = promisify(execFile);

class LibreOfficeConverter {
  constructor() {
    this.timeout = 120000;
    this.maxConcurrent = 2; // matches worker concurrency
    this.activeConversions = 0;
    this.libreOfficeCmd = null;
  }

  getLibreOfficeCommand() {
    const windowsPaths = [
      'C:\\Program Files\\LibreOffice\\program\\soffice.com',
      'C:\\Program Files (x86)\\LibreOffice\\program\\soffice.com',
      'soffice',
    ];
    const unixPaths = ['libreoffice', 'soffice'];
    return process.platform === 'win32' ? windowsPaths : unixPaths;
  }

  async isAvailable() {
    if (this.libreOfficeCmd) return true;
    for (const cmd of this.getLibreOfficeCommand()) {
      try {
        await execFileAsync(cmd, ['--version'], { timeout: 5000 });
        this.libreOfficeCmd = cmd;
        return true;
      } catch {}
    }
    logger.warn('LibreOffice not available');
    return false;
  }

  getTargetFormat(conversionType) {
    const map = {
      'pdf->word': 'docx',
      'pdf->txt':  'txt',
      'word->pdf': 'pdf',
      'word->txt': 'txt',
      'excel->pdf': 'pdf',
      'excel->csv': 'csv',
      'ppt->pdf':  'pdf',
    };
    return map[conversionType];
  }

  async convert(inputPath, outputDir, conversionType) {
    if (this.activeConversions >= this.maxConcurrent) {
      throw new Error('Too many concurrent conversions, please try again later.');
    }

    const targetFormat = this.getTargetFormat(conversionType);
    if (!targetFormat) throw new Error(`Unsupported conversion type: ${conversionType}`);

    if (!this.libreOfficeCmd) {
      const available = await this.isAvailable();
      if (!available) throw new Error('LibreOffice is not installed');
    }

    if (!fs.existsSync(inputPath)) throw new Error(`Input file not found: ${inputPath}`);
    if (fs.statSync(inputPath).size === 0) throw new Error('Input file is empty');
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    this.activeConversions++;
    try {
      const args = ['--headless', '--convert-to', targetFormat, '--outdir', outputDir];
      if (conversionType === 'pdf->word') args.push('--infilter=writer_pdf_import');
      args.push(inputPath);

      await execFileAsync(this.libreOfficeCmd, args, {
        timeout: this.timeout,
        env: {
          ...process.env,
          SAL_USE_VCLPLUGIN: 'svp',
          HOME: process.env.HOME || process.env.USERPROFILE || '/tmp',
        },
      });

      const baseName = path.basename(inputPath, path.extname(inputPath));
      const expectedOutput = path.join(outputDir, `${baseName}.${targetFormat}`);

      for (let i = 0; i < 50; i++) {
        if (fs.existsSync(expectedOutput) && fs.statSync(expectedOutput).size > 0) {
          return expectedOutput;
        }
        await new Promise(r => setTimeout(r, 100));
      }

      const match = fs.readdirSync(outputDir).find(f => f.endsWith(`.${targetFormat}`));
      if (match) {
        const found = path.join(outputDir, match);
        if (fs.statSync(found).size > 0) return found;
      }

      throw new Error(`Output file not produced: ${expectedOutput}`);
    } finally {
      this.activeConversions--;
    }
  }

  async convertWithFallback(inputPath, outputDir, conversionType) {
    try {
      return await this.convert(inputPath, outputDir, conversionType);
    } catch (err) {
      logger.warn(`LibreOffice failed for ${conversionType}: ${err.message}`);
      if (conversionType.startsWith('pdf->')) {
        return await this.fallbackPdfConversion(inputPath, outputDir, conversionType);
      }
      throw err;
    }
  }

  async fallbackPdfConversion(inputPath, outputDir, conversionType) {
    const pdfParse = require('pdf-parse');
    const dataBuffer = fs.readFileSync(inputPath);
    const result = await pdfParse(dataBuffer);
    const content = result.text || '';
    const baseName = path.basename(inputPath, path.extname(inputPath));

    if (conversionType === 'pdf->word') {
      const outputPath = path.join(outputDir, `${baseName}.docx`);
      const paragraphs = content.split('\n').map(line =>
        new Paragraph({ children: [new TextRun(line || ' ')] })
      );
      const doc = new Document({ sections: [{ properties: {}, children: paragraphs }] });
      const buffer = await Packer.toBuffer(doc);
      fs.writeFileSync(outputPath, buffer);
      return outputPath;
    }

    const outputPath = path.join(outputDir, `${baseName}.txt`);
    fs.writeFileSync(outputPath, content);
    return outputPath;
  }
}

module.exports = new LibreOfficeConverter();