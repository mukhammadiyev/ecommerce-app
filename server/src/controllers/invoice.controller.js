const Order = require('../models/Order');
const pdfGenerator = require('../utils/pdfGenerator'); // utils ichidagi faylingiz
const ApiResponse = require('../utils/response');
const AppError = require('../utils/appError');

exports.getInvoiceByOrderId = async (req, res) => {
  const { orderId } = req.params;

  const order = await Order.findByPk(orderId);
  if (!order) {
    throw new AppError("Kechirasiz, bunday buyurtma topilmadi!", 404);
  }

  // PDF hisobot yaratish (utils ichidagi pdfGenerator'ga qarab moslab olasiz)
  const invoicePdf = await pdfGenerator.generateOrderInvoice(order);

  return ApiResponse.send(res, "Hisob-faktura muvaffaqiyatli tayyorlandi", {
    invoice_url: invoicePdf.url,
    order_id: order.id,
    total_price: order.total_price
  });
};