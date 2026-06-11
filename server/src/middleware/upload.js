const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// 1. Cloudinary-ni sozlash
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// 2. Bulutli xotira (Storage) parametrlarini o'rnatish
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'e-commerce-images', // Cloudinary ichida ochiladigan papka nomi
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'], // Faqat rasm formatlari
    transformation: [{ width: 800, height: 800, crop: 'limit' }] // Rasmni avtomat optimallashtirish
  },
});

// 3. Multer-ni yuklashga tayyorlash
const upload = multer({ storage: storage });

// Obyektni to'g'ridan-to'g'ri eksport qilamiz (router tushunishi uchun)
module.exports = upload;