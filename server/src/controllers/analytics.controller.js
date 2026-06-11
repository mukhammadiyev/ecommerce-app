const ApiResponse = require('../utils/response');

exports.getDashboardStats = async (req, res) => {
  // Bu yerda statistika hisoblash mantiqi bo'ladi (masalan, umumiy savdo, foydalanuvchilar soni)
  const stats = {
    totalSales: 1500000,
    totalOrders: 45,
    newUsers: 12
  };

  return ApiResponse.send(res, "Analitika ma'lumotlari muvaffaqiyatli yuklandi", stats);
};