const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

// ==========================================
// ROUTERLARNI IMPORT QILISH
// ==========================================
const authRoutes = require('./routes/auth.routes');
const productRoutes = require('./routes/products.routes');
const cartRoutes = require('./routes/cart.routes');
const orderRoutes = require('./routes/orders.routes'); // Fayl nomi orders.routes bo'lgani uchun moslashtirildi
const reviewRoutes = require('./routes/reviews.routes');
const categoryRoutes = require('./routes/categories.routes');
const userRoutes = require('./routes/users.routes');
const blogRoutes = require('./routes/blogs.routes');
const addressRoutes = require('./routes/address.routes');
const paymentRoutes = require('./routes/payments.routes');
const contactRoutes = require('./routes/contacts.routes');
const newsletterRoutes = require('./routes/newsletter.routes');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// API Yo'nalishlari
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

app.get('/api/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: "Express server va barcha tizimlar aloqada! 🚀"
    });
});

module.exports = app;