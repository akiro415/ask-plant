import express, { Express } from 'express';
import cors from 'cors';
import plantRoutes from './routes/plants';
import commonCodeRoutes from './routes/common-codes';
import speciesRoutes from './routes/species';
import locationRoutes from './routes/locations';
import authRoutes from './routes/auth';
import publicRoutes from './routes/public';
import dashboardRoutes from './routes/dashboard';
import historyRoutes from './routes/histories';
import imageRoutes from './routes/images';
import userRoutes from './routes/users';
import qrRoutes from './routes/qr';
import settingsRoutes from './routes/settings';
import cartRoutes from './routes/cart';
import collectorProfileRoutes from './routes/collector-profile';
import { errorHandler } from './middleware/errorHandler';

const API_V1 = '/api/v1';

export function createApp(): Express {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.use(`${API_V1}/plants`, plantRoutes);
  app.use(`${API_V1}/common-codes`, commonCodeRoutes);
  app.use(`${API_V1}/species`, speciesRoutes);
  app.use(`${API_V1}/locations`, locationRoutes);
  app.use(`${API_V1}/auth`, authRoutes);
  app.use(`${API_V1}/public`, publicRoutes);
  app.use(`${API_V1}/dashboard`, dashboardRoutes);
  app.use(`${API_V1}/histories`, historyRoutes);
  app.use(`${API_V1}/images`, imageRoutes);
  app.use(`${API_V1}/users`, userRoutes);
  app.use(`${API_V1}/qr`, qrRoutes);
  app.use(`${API_V1}/settings`, settingsRoutes);
  app.use(`${API_V1}/cart`, cartRoutes);
  app.use(`${API_V1}/collector-profile`, collectorProfileRoutes);

  app.use(errorHandler);

  return app;
}
