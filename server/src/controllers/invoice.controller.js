const { Order, Invoice } = require('../models/associations'); // ⚙️ Markaziy import
const pdfGenerator = require('../utils/pdfGenerator'); 
const ApiResponse = require('../utils/response');
const AppError = require('../utils/appError');

exports.getInvoiceByOrderId = async (req, res) => {
  const { orderId } = req.params;

  // Buyurtmani tekshiramiz
  const order = await Order.findByPk(orderId);
  if (!order) {
    throw new AppError("Kechirasiz, bunday buyurtma topilmadi!", 404);
  }

  // Avval bazada shu buyurtmaga tegishli invoice bormi, tekshiramiz
  let invoice = await Invoice.findOne({ where: { order_id: orderId } });

  // Agar invoice hali yaratilmagan bo'lsa, yangi ochamiz va PDF yaratamiz
  if (!invoice) {
    // PDF generatoringiz ishlashi uchun buyurtma ma'lumotlarini yuboramiz
    const invoicePdf = await pdfGenerator.generateOrderInvoice(order);

    invoice = await Invoice.create({
      order_id: order.id,
      invoice_number: `INV-${Date.now()}-${order.id}`, // Unikal invoys raqami
      pdf_url: invoicePdf.url,
      status: order.status === 'completed' ? 'paid' : 'pending' // buyurtma holatiga qarab
    });
  }

  return ApiResponse.send(res, "Hisob-faktura muvaffaqiyatli tayyorlandi", {
    invoice_id: invoice.id,
    invoice_number: invoice.invoice_number,
    invoice_url: invoice.pdf_url,
    order_id: order.id,
    total_price: order.total_price,
    status: invoice.status
  });
};