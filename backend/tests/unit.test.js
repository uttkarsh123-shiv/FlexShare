const { validateUpload, validateFileCode } = require('../middleware/validation');
const { cleanupFiles } = require('../utils/fileCleanup');
const fs = require('fs');

// ── validateUpload ─────────────────────────────────────────────────────────────

function runValidateUpload(body) {
  const req = { body };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  const next = jest.fn();
  validateUpload(req, res, next);
  return { res, next };
}

describe('validateUpload middleware', () => {
  it('calls next() for a valid body', () => {
    const { next } = runValidateUpload({ conversionType: 'none', expiryHours: 24 });
    expect(next).toHaveBeenCalled();
  });

  it('returns 400 for an invalid conversionType', () => {
    const { res, next } = runValidateUpload({ conversionType: 'video->mp4' });
    expect(res.status).toHaveBeenCalledWith(400);
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 400 for a password shorter than 4 chars', () => {
    const { res } = runValidateUpload({ conversionType: 'none', password: 'ab' });
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('returns 400 for maxDownloads over 100', () => {
    const { res } = runValidateUpload({ conversionType: 'none', maxDownloads: 200 });
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('returns 400 for expiryHours over 168', () => {
    const { res } = runValidateUpload({ conversionType: 'none', expiryHours: 200 });
    expect(res.status).toHaveBeenCalledWith(400);
  });
});

// ── validateFileCode ───────────────────────────────────────────────────────────

function runValidateFileCode(code) {
  const req = { params: { code } };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  const next = jest.fn();
  validateFileCode(req, res, next);
  return { res, next };
}

describe('validateFileCode middleware', () => {
  it('calls next() for a 6-char code', () => {
    const { next } = runValidateFileCode('ABC123');
    expect(next).toHaveBeenCalled();
  });

  it('returns 400 for a code shorter than 6 chars', () => {
    const { res } = runValidateFileCode('ABC');
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('returns 400 for a code longer than 6 chars', () => {
    const { res } = runValidateFileCode('ABCDEFG');
    expect(res.status).toHaveBeenCalledWith(400);
  });
});

// ── cleanupFiles ───────────────────────────────────────────────────────────────

describe('cleanupFiles', () => {
  it('deletes files that exist', async () => {
    jest.spyOn(fs, 'existsSync').mockReturnValue(true);
    const unlinkSpy = jest.spyOn(fs, 'unlinkSync').mockImplementation(() => {});

    await cleanupFiles(['/tmp/file1.txt', '/tmp/file2.txt']);

    expect(unlinkSpy).toHaveBeenCalledTimes(2);
    jest.restoreAllMocks();
  });

  it('skips files that do not exist', async () => {
    jest.spyOn(fs, 'existsSync').mockReturnValue(false);
    const unlinkSpy = jest.spyOn(fs, 'unlinkSync').mockImplementation(() => {});

    await cleanupFiles(['/tmp/ghost.txt']);

    expect(unlinkSpy).not.toHaveBeenCalled();
    jest.restoreAllMocks();
  });

  it('does not throw if a file deletion fails', async () => {
    jest.spyOn(fs, 'existsSync').mockReturnValue(true);
    jest.spyOn(fs, 'unlinkSync').mockImplementation(() => { throw new Error('perm denied'); });

    await expect(cleanupFiles(['/tmp/locked.txt'])).resolves.not.toThrow();
    jest.restoreAllMocks();
  });
});
