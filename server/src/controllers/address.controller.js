const Address = require('../models/address');

// ==========================================
// FOYDALANUVCHI MANZILINI SAQLASH / YANGILASH
// ==========================================
exports.saveAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { street_address, city, country, postal_code } = req.body;

    if (!street_address || !city || !country || !postal_code) {
      return res.status(400).json({ success: false, message: "Barcha manzil maydonlarini to'ldirish shart!" });
    }

    let address = await Address.findOne({ where: { user_id: userId } });

    if (address) {
      address.street_address = street_address;
      address.city = city;
      address.country = country;
      address.postal_code = postal_code;
      await address.save();
    } else {
      address = await Address.create({
        user_id: userId,
        street_address,
        city,
        country,
        postal_code
      });
    }

    res.status(200).json({
      success: true,
      message: "Yetkazib berish manzili muvaffaqiyatli saqlandi! 📍",
      data: address
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Serverda xatolik", error: error.message });
  }
};

// ==========================================
// FOYDALANUVCHINING JORIY MANZILINI OLISH
// ==========================================
exports.getMyAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const address = await Address.findOne({ where: { user_id: userId } });

    res.status(200).json({
      success: true,
      data: address || null 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Serverda xatolik", error: error.message });
  }
};