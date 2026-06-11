/**
 * Standart API Muvaffaqiyatli javob formati
 */
class ApiResponse {
  constructor(message = "Muvaffaqiyatli bajarildi!", data = null) {
    this.success = true;
    this.message = message;
    if (data) {
      this.data = data;
    }
  }

  // 200 OK uchun tezkor chaqirish
  static send(res, message, data = null, statusCode = 200) {
    return res.status(statusCode).json(new ApiResponse(message, data));
  }

  // 201 Created uchun tezkor chaqirish (Yangi ma'lumot qo'shilganda)
  static created(res, message, data = null) {
    return res.status(201).json(new ApiResponse(message, data));
  }
}

module.exports = ApiResponse;