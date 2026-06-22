const { Newsletter } = require('../models/associations'); // ⚙️ Markaziy fayldan import qilamiz
const ApiResponse = require('../utils/response');
const AppError = require('../utils/appError');
const nodemailer = require('nodemailer');

// 1. Yangi emailni obunachilar ro'yxatiga qo'shish
exports.subscribeNewsletter = async (req, res) => {
  const { email } = req.body;

  const existing = await Newsletter.findOne({ where: { email } });
  if (existing) {
    throw new AppError("Bu email allaqachon obuna bo'lgan", 400);
  }

  const subscription = await Newsletter.create({ email });
  return ApiResponse.send(res, "Obuna muvaffaqiyatli yakunlandi! 📬", subscription, 201);
};

// 2. Admin uchun barcha obunachilarni olish
exports.getAllSubscribersForAdmin = async (req, res) => {
  const subscribers = await Newsletter.findAll({ order: [['createdAt', 'DESC']] });
  return ApiResponse.send(res, "Obunachilar ro'yxati", subscribers);
};

// 3. Admin barcha obunachilarga haqiqiy Gmail orqali xabar yuborishi uchun
// 3. Admin barcha obunachilarga haqiqiy Gmail orqali ALOHIDA-ALOHIDA xabar yuborishi uchun
exports.sendNewsletterToAll = async (req, res) => {
  const { subject, message } = req.body;

  if (!subject || !message) {
    throw new AppError("Sarlavha va xabar matni majburiy!", 400);
  }

  // 1. Bazadan barcha obunachilarning emaillarini olamiz
  const subscribers = await Newsletter.findAll({ attributes: ['email'] });
  const emailList = subscribers.map(sub => sub.email);

  if (emailList.length === 0) {
    throw new AppError("Xabar yuborish uchun hech qanday obunachi yo'q", 400);
  }

  // 2. Nodemailer transportini sozlash
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.ADMIN_EMAIL,
      pass: process.env.ADMIN_EMAIL_PASSWORD
    }
  });

  try {
    // 3. 🔥 Har bir emailga alohida xat jo'natish (Tsikl yordamida)
    const sendPromises = emailList.map(email => {
      const mailOptions = {
        from: `"Admin Panel" <${process.env.ADMIN_EMAIL}>`,
        to: email, // 🔥 Endi bitta-bitta email boradi
        subject: subject,
        text: message,
        html: `
          <div style="font-family: sans-serif; padding: 20px; background-color: #f9f9f9; border-radius: 12px; color: #333;">
            <h2 style="color: #6c63ff;">${subject}</h2>
            <p style="font-size: 14px; line-height: 1.6; color: #555;">${message.replace(/\n/g, '<br>')}</p>
            <hr style="border: none; border-top: 1px solid #eee; margin-top: 20px;" />
            <small style="color: #999;">Agar siz bizning bildirishnomalarga obuna bo'lmagan bo'lsangiz, ushbu xatga e'tibor bermang.</small>
          </div>
        `
      };
      
      // Har bir jo'natish so'rovini qaytaradi
      return transporter.sendMail(mailOptions);
    });

    // Barcha xatlar parallel ravishda to'liq jo'natib bo'linishini kutamiz
    await Promise.all(sendPromises);
    
    return ApiResponse.send(res, "Xabar barcha obunachilarga muvaffaqiyatli jo'natildi! 🚀", {
      totalSent: emailList.length
    });
  } catch (mailError) {
    console.error("Nodemailer xatoligi:", mailError);
    throw new AppError("Gmail orqali xat yuborishda xatolik yuz berdi: " + mailError.message, 500);
  }
};