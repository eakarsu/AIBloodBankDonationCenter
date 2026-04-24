const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.BACKEND_PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require('./routes/auth');
const donorRoutes = require('./routes/donors');
const donationRoutes = require('./routes/donations');
const screeningRoutes = require('./routes/screening');
const deferralRoutes = require('./routes/deferrals');
const collectionRoutes = require('./routes/collections');
const bloodtypingRoutes = require('./routes/bloodtyping');
const componentRoutes = require('./routes/components');
const inventoryRoutes = require('./routes/inventory');
const orderRoutes = require('./routes/orders');
const transportationRoutes = require('./routes/transportation');
const reactionRoutes = require('./routes/reactions');
const equipmentRoutes = require('./routes/equipment');
const staffRoutes = require('./routes/staff');
const driveRoutes = require('./routes/drives');
const rewardRoutes = require('./routes/rewards');
const aiRoutes = require('./routes/ai');

app.use('/api/auth', authRoutes);
app.use('/api/donors', donorRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/screening', screeningRoutes);
app.use('/api/deferrals', deferralRoutes);
app.use('/api/collections', collectionRoutes);
app.use('/api/bloodtyping', bloodtypingRoutes);
app.use('/api/components', componentRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/transportation', transportationRoutes);
app.use('/api/reactions', reactionRoutes);
app.use('/api/equipment', equipmentRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/drives', driveRoutes);
app.use('/api/rewards', rewardRoutes);
app.use('/api/ai', aiRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.stack || err.message || err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

app.listen(PORT, () => {
  console.log(`Blood Bank Backend running on port ${PORT}`);
});

module.exports = app;
