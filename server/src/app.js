const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

// ==========================================
// 🆕 MODELLARNI RO'YXATDAN O'TKAZISH
// ==========================================
require('./models/Blog');      // Blog asosiy modeli
require('./models/BlogImage'); // Blog galereya modeli (munosabatlar shakllanishi uchun)

// ==========================================
// ROUTERLARNI IMPORT QILISH
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

const errorHandler = require('./middleware/errorHandler'); 
const globalLimiter = require('./middleware/rateLimiter'); 

const app = express(); 

// Xavfsizlik va yordamchi middleware'lar
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// DDoS va botlardan himoya qilish uchun hamma API so'rovlarini elakdan o'tkazamiz
app.use('/api', globalLimiter);

// ==========================================
// API YO'NALISHLARI (ROUTERLAR)
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

app.get('/api/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: "Express server va barcha tizimlar aloqada! 🚀"
    });
});

// GLOBAL ERROR HANDLER
app.use(errorHandler); 

module.exports = app;