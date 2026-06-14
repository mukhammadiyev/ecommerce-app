const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

// ==========================================
// 🚀 ROUTERLARNI IMPORT QILISH (100% Rasmdagi nomlar bilan mos)
// ==========================================
const authRoutes = require('./routes/auth.routes');
const productRoutes = require('./routes/products.routes');
const cartRoutes = require('./routes/cart.routes');
const orderRoutes = require('./routes/orders.routes'); 
const reviewRoutes = require('./routes/reviews.routes');
const categoryRoutes = require('./routes/categories.routes');
const userRoutes = require('./routes/users.routes');
const blogRoutes = require('./routes/blogs.routes'); 
const addressRoutes = require('./routes/address.routes');
const paymentRoutes = require('./routes/payments.routes');
const contactRoutes = require('./routes/contacts.routes');
const newsletterRoutes = require('./routes/newsletter.routes');
const analyticsRoutes = require('./routes/analytics.routes'); 
const invoicesRoutes = require('./routes/invoices.routes');   
const emailRoutes = require('./routes/email.routes'); // 🆕 Rasmdagi email routeri qo'shildi

const errorHandler = require('./middleware/errorHandler'); 
const globalLimiter = require('./middleware/rateLimiter'); 

const app = express(); 

// Xavfsizlik va yordamchi middleware'lar
app.use(helmet());
app.use(cors());

// 🔥 TUZATILDI: Base64 rasmlar sig'ishi uchun limit 50mb ga oshirildi
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use(morgan('dev'));

// DDoS himoyasi uchun limiter
app.use('/api', globalLimiter);

// ==========================================
// 🛣️ API YO'NALISHLARI
// ==========================================
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/users', userRoutes);
app.use('/api/blogs', blogRoutes); 
app.use('/api/address', addressRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/analytics', analyticsRoutes); 
app.use('/api/invoices', invoicesRoutes);   
app.use('/api/email', emailRoutes); // 🆕 Email yo'li ulandi

// Server holatini tekshirish
app.get('/api/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: "Express server va barcha tizimlar aloqada! 🚀"
    });
});

// GLOBAL ERROR HANDLER
app.use(errorHandler); 

module.exports = app;