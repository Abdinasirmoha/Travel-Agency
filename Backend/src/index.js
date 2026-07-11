import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import apiRoutes from './routes/api.js';
import reportRoutes from './routes/reports.js';
import authRoutes from './routes/auth.js';
import waafipayRoutes from './routes/waafipay.js';
import stripeRoutes from './routes/stripe.js';

dotenv.config({ override: true });

const app = express();

// Connect to database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api', apiRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/waafipay', waafipayRoutes);
app.use('/api/stripe', stripeRoutes);

// Basic Route
app.get('/', (req, res) => {
  res.send('EliteTravel Pro API is running...');
});

// Return JSON for unknown API routes (avoids HTML 404 confusing the frontend)
app.use('/api', (req, res) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
