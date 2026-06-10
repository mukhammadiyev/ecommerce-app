/**
 * Foydalanuvchiga xush kelibsiz xatini yuborish (Simulyatsiya)
 * @param {string} email - Foydalanuvchi emaili
 * @param {string} first_name - Foydalanuvchi ismi
 */
const sendWelcomeEmail = async (email, first_name) => {
  try {
    // Hozircha shunchaki konsolga chiqarib turamiz (Nodemailer ulguncha)
    console.log(`📧 [EMAIL SERVICE]: Xush kelibsiz xati yuborilmoqda -> Kimga: ${first_name} (${email})`);
    return true;
  } catch (error) {
    console.error("Email yuborishda xatolik:", error.message);
    throw error;
  }
};

// Funksiyani controllerlar bera olishi uchun eksport qilamiz 🎯
module.exports = {
  sendWelcomeEmail
};