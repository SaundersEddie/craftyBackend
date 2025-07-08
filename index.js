const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use(
  cors({
    origin: 'http://localhost:3000', // or wherever craftyclient is running
    credentials: true, // optional if using cookies later
  })
);
app.use('/api/user', userRoutes);

const port = process.env.PORT || 5000;

// Simple ping route
app.get('/ping', (req, res) => {
  res.json({ message: 'CraftyBackend is live!' });
});

// Bring in DB test route (we’ll write this next)
const testRoutes = require('./routes/test');
app.use('/api', testRoutes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
