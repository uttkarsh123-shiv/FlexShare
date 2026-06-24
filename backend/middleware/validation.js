const Joi = require('joi');

const uploadSchema = Joi.object({
  conversionType: Joi.string().valid(
    'image->png', 'image->jpg', 'image->jpeg', 'image->webp',
    'image->gif', 'image->bmp', 'image->avif', 'image->pdf',
    'pdf->word', 'word->pdf', 'pdf->txt', 'word->txt',
    'excel->pdf', 'excel->csv', 'ppt->pdf', 'none'
  ).optional(),
  description:  Joi.string().max(500).allow('').optional(),
  password:     Joi.string().min(4).max(50).allow('').optional(),
  expiryHours:  Joi.number().integer().min(1).max(168).optional(),
  maxDownloads: Joi.number().integer().min(1).max(100).optional(),
});

const validateUpload = (req, res, next) => {
  const { error } = uploadSchema.validate(req.body);

  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  next();
};

const validateFileCode = (req, res, next) => {
  const { code } = req.params;
  if (!code || code.length !== 6) {
    return res.status(400).json({ message: 'Invalid file code format' });
  }
  next();
};

module.exports = { validateUpload, validateFileCode };
