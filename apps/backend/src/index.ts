import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import userRoutes from './routes/userRoutes';
import serviceRoutes from './routes/serviceRoutes';
import driverRoutes from './routes/driverRoutes';
import routeRoutes from './routes/routeRoutes';
import authRoutes from './routes/authRoutes';
import { Service } from 'shared/types';

const app = express();

app.use(cors({
  origin: true,
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Authorization'],
}));
app.use(express.json());
app.use((req, res, next) => {
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  next();
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/example-service', (req, res) => {
  const exampleService: Service = {
    id: '1',
    name: 'Akşam Servisi',
    plate: '34XYZ789',
    route: 'B-C',
    driverId: 'driver-2',
  };
  res.json(exampleService);
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/routes', routeRoutes);

const PORT = Number(process.env.PORT) || 4001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
}); 