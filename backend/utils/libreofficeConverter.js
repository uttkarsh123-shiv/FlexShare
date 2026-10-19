const { execFile } = require('child_process');
const { promisify } = require('util');
const fs = require('fs');
const path = require('path');
const logger = require('./logger');

const execFileAsync = promisify(execFile);

class LibreOfficeConverter {
  constructor() {
    this.timeout = 120000;
    this.maxConcurrent = 2;
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
      'pdf->word':  'docx',
      'pdf->txt':   'docx', // convert to docx first, then extract text
      'word->pdf':  'pdf',
      'word->txt':  'txt',
      'excel->pdf': 'pdf',
      'excel->csv': 'csv',
      'ppt->pdf':   'pdf',
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
      if (conversionType === 'pdf->word' || conversionType === 'pdf->txt') {
        args.push('--infilter=writer_pdf_import');
      }
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
    if (conversionType === 'pdf->txt') {
      // LibreOffice can't export txt on Windows — convert to docx first, extract text with mammoth
      const docxPath = await this.convert(inputPath, outputDir, 'pdf->word');
      const mammoth = require('mammoth');
      const result = await mammoth.extractRawText({ path: docxPath });
      const baseName = path.basename(inputPath, path.extname(inputPath));
      const txtPath = path.join(outputDir, `${baseName}.txt`);
      fs.writeFileSync(txtPath, result.value);
      // clean up intermediate docx
      fs.unlink(docxPath, () => {});
      return txtPath;
    }
    return await this.convert(inputPath, outputDir, conversionType);
  }
}

module.exports = new LibreOfficeConverter();
