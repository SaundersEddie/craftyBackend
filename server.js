const express = require('express');
const app = express();
const cors = require('cors');
const userRoutes = require('./routes/users');
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');

app.use(express.json());
// app.use(cors());
app.use(
  cors({
    origin: 'http://localhost:3000', // or wherever craftyclient is running
    credentials: true, // optional if using cookies later
  })
);
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
