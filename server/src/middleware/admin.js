module.exports = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'manager')) {
    next();
  } else {
    return res.status(403).json({ 
      success: false, 
      message: "Ruxsat berilmadi! Bu amalni bajarish uchun admin huquqi kerak." 
    });
  }
};