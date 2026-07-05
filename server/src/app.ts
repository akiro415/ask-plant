import express, { Express } from 'express';
import cors from 'cors';
import plantRoutes from './routes/plants';
import commonCodeRoutes from './routes/common-codes';
import speciesRoutes from './routes/species';
import authRoutes from './routes/auth';
import publicRoutes from './routes/public';
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
  app.use(`${API_V1}/auth`, authRoutes);
  app.use(`${API_V1}/public`, publicRoutes);

  app.use(errorHandler);

  return app;
}
