const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contact.controller');
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');
const validate = require('../middleware/validation');
const { contactSchema } = require('../validators/contact.validator');
const nodemailer = require('nodemailer'); 

// Ochiq yo'l: Har kim xabar qoldira oladi
router.post('/', validate(contactSchema), contactController.createContactMessage);

// Himoyalangan yo'llar: Faqat Admin ko'ra oladi va o'chira oladi 🔒
router.get('/admin', authMiddleware, adminMiddleware, contactController.getAllMessagesForAdmin);
router.delete('/admin/:id', authMiddleware, adminMiddleware, contactController.deleteMessage); 

// 🆕 YANGI YO'L: Admin nomidan emailga javob yuborish (Xatolik tuzatilgan varianti)
router.post('/admin/reply', authMiddleware, adminMiddleware, async (req, res) => {
  const { to, subject, message } = req.body;

  if (!to || !subject || !message) {
    return res.status(400).json({ message: "Barcha maydonlarni to'ldiring!" });
  }

  try {
    // 🎯 Gmail SMTP konfiguratsiyasi (To'g'ridan-to'g'ri ma'lumotlar bilan)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'azizxon7777777@gmail.com', // Sizning emailingiz
        pass: 'lyznczpateqfuzqn'          // Google App Password (16 xonali)
      }
    });

    const mailOptions = {
      from: `"Admin Support" <azizxon7777777@gmail.com>`, // auth.user bilan bir xil bo'lishi shart!
      to: to,
      subject: `Re: ${subject}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #333; background-color: #f9f9f9;">
          <div style="max-width: 600px; margin: 0 auto; background: #fff; padding: 25px; border-radius: 12px; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
            <h2 style="color: #6c63ff; border-bottom: 2px solid #6c63ff; padding-bottom: 10px; margin-top: 0;">Sizning so'rovingizga javob xati</h2>
            <p style="font-size: 15px; line-height: 1.6; color: #444;">${message}</p>
            <br />
            <hr style="border: 0; border-top: 1px solid #eee;" />
            <p style="font-size: 11px; color: #999; text-align: center;">Bu xat avtomatik tarzda admin panel orqali yuborildi.</p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    return res.status(200).json({ message: "Javob muvaffaqiyatli yuborildi! ✉️" });

  } catch (error) {
    // ⚠️ Terminalda aniq xatoni ko'rish uchun buni qoldiramiz
    console.error("Email yuborishda xatolik tafsiloti:", error);
    return res.status(500).json({ message: "Email yuborishda xatolik yuz berdi." });
  }
});

module.exports = router;