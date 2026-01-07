const Joi = require('joi');

const uploadSchema = Joi.object({
  conversionType: Joi.string().valid(
    'image->png',
    'image->jpg',
    'image->jpeg',
    'image->webp',
    'image->gif',
    'image->bmp',
    'image->avif',
    'image->pdf',
    'pdf->word',
    'word->pdf',
    'pdf->txt',
    'pdf->images',
    'word->txt',
    'excel->pdf',
    'excel->csv',
    'ppt->pdf',
    'none'
  ).optional(),
  description: Joi.string().max(500).allow('').optional(),
  password: Joi.string().min(4).max(50).allow('').optional(),
  expiryHours: Joi.number().integer().min(1).max(168).optional(), // 1 hour to 7 days
  maxDownloads: Joi.number().integer().min(1).max(100).optional()
});

const validateUpload = (req, res, next) => {
  const { error, value } = uploadSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    const errors = error.details.map(detail => detail.message).join(', ');
    return res.status(400).json({ 
      message: 'Validation error',
      errors: errors 
    });
  }

  req.body = value;
  next();
};

const fileCodeSchema = Joi.object({
  code: Joi.string().length(6).pattern(/^[A-Z0-9]+$/).required()
});

const validateFileCode = (req, res, next) => {
  const { error } = fileCodeSchema.validate(req.params);
  
  if (error) {
    return res.status(400).json({ 
      message: 'Invalid file code format' 
    });
  }
  
  next();
};

module.exports = {
  validateUpload,
  validateFileCode
};


