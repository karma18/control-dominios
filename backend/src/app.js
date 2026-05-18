const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

require('dotenv').config({
  path: path.join(__dirname, '..', '.env'),
  quiet: true,
});

const authRoutes = require('./presentation/routes/authRoutes');
const catalogRoutes = require('./presentation/routes/catalogRoutes');
const userRoutes = require('./presentation/routes/userRoutes');
const domainRoutes = require('./presentation/routes/domainRoutes');
const authenticate = require('./presentation/middlewares/authenticate');
const errorHandler = require('./presentation/middlewares/errorHandler');

const app = express();
const allowedOrigins = process.env.FRONTEND_ORIGIN
  ? process.env.FRONTEND_ORIGIN.split(',').map((origin) => origin.trim())
  : true;

app.use(helmet());
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'control-dominios-backend',
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/catalog', authenticate, catalogRoutes);
app.use('/api/users', authenticate, userRoutes);
app.use('/api/domains', authenticate, domainRoutes);
app.use(errorHandler);

module.exports = app;
