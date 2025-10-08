import express from 'express';
import cors from 'cors';
import connectDB from './db/connection.js';
import authRoutes from './routes/auth.js';
import categoryRoutes from './routes/category.js';
import supplierRoutes from './routes/supplier.js';
import productRoutes from './routes/product.js';
import baranginRoutes from './routes/barangin.js';
import barangoutRoutes from './routes/barangout.js'
import userRoutes from './routes/user.js'
import stockopnameRoutes from './routes/stockopname.js'

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/category', categoryRoutes);
app.use('/api/supplier', supplierRoutes);
app.use('/api/product', productRoutes);
app.use('/api/barangin', baranginRoutes);
app.use('/api/barangout', barangoutRoutes);
app.use('/api/users', userRoutes);
app.use('/api/stockopname', stockopnameRoutes);

app.listen(process.env.PORT, () => {
  connectDB();
  console.log('server is running on http://localhost:3000');
})