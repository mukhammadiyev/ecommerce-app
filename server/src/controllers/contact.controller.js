const Contact = require('../models/contact'); // Yo'li to'g'rilandi

exports.createContactMessage = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: "Ism, email va xabar maydonlarini to'ldirish majburiy!"
      });
    }

    const contact = await Contact.create({
      name,
      email,
      subject: subject || "Mavzu ko'rsatilmagan",
      message
    });

    return res.status(201).json({
      success: true,
      message: "Xabaringiz muvaffaqiyatli yuborildi! Tez orada siz bilan bog'lanamiz. 📬",
      data: contact
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Xabar yuborishda xatolik yuz berdi", error: error.message });
  }
};

exports.getAllMessagesForAdmin = async (req, res) => {
  try {
    const messages = await Contact.findAll({ order: [['createdAt', 'DESC']] });
    return res.status(200).json({ success: true, count: messages.length, data: messages });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Xabarlarni yuklashda xatolik", error: error.message });
  }
};