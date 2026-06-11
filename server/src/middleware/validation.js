const AppError = require('../utils/appError');

module.exports = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    
    if (error) {
      // Barcha validatsiya xatolarini bitta matnga birlashtiradi
      const errorMessage = error.details.map(detail => detail.message).join(', ');
      throw new AppError(errorMessage, 400);
    }
    
    next();
  };
};