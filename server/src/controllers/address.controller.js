const Address = require('../models/address');
const ApiResponse = require('../utils/response');
const AppError = require('../utils/appError');

// 1. Foydalanuvchining joriy manzilini olish
exports.getMyAddress = async (req, res) => {
  const userId = req.user.id;
  const address = await Address.findOne({ where: { user_id: userId } });

  return ApiResponse.send(res, "Foydalanuvchi manzili keltirildi", address || null);
};

// 2. Yangi manzil yaratish (POST)
exports.saveAddress = async (req, res) => {
  const userId = req.user.id;
  const { street_address, city, country, postal_code } = req.body;

  let address = await Address.findOne({ where: { user_id: userId } });

  if (address) {
    // Agar manzil mavjud bo'lsa, xatolik beramiz yoki PUT ishlatishni so'raymiz
    throw new AppError("Manzilingiz allaqachon mavjud, uni o'zgartirish uchun PUT so'rovini ishlating", 400);
  }

  address = await Address.create({
    user_id: userId,
    street_address,
    city,
    country,
    postal_code
  });

  return ApiResponse.send(res, "Yetkazib berish manzili muvaffaqiyatli saqlandi! 📍", address, 201);
};

// 3. Manzilni tahrirlash (PUT) 🆕
exports.updateAddress = async (req, res) => {
  const userId = req.user.id;
  const { street_address, city, country, postal_code } = req.body;

  const address = await Address.findOne({ where: { user_id: userId } });
  if (!address) {
    throw new AppError("Yangilash uchun manzil topilmadi", 404);
  }

  address.street_address = street_address !== undefined ? street_address : address.street_address;
  address.city = city !== undefined ? city : address.city;
  address.country = country !== undefined ? country : address.country;
  address.postal_code = postal_code !== undefined ? postal_code : address.postal_code;

  await address.save();

  return ApiResponse.send(res, "Manzil muvaffaqiyatli yangilandi! 🔄", address);
};

// 4. Manzilni o'chirish (DELETE) 🆕
exports.deleteAddress = async (req, res) => {
  const userId = req.user.id;

  const address = await Address.findOne({ where: { user_id: userId } });
  if (!address) {
    throw new AppError("O'chirish uchun manzil topilmadi", 404);
  }

  await address.destroy();

  return ApiResponse.send(res, "Manzil muvaffaqiyatli o'chirildi! 🗑️");
};