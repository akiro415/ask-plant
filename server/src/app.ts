import express, { Express } from 'express';
import cors from 'cors';
import plantRoutes from './routes/plants';
import wateringRoutes from './routes/waterings';
import { errorHandler } from './middleware/errorHandler';

export function createApp(): Express {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.use('/api/plants', plantRoutes);
  app.use('/api/waterings', wateringRoutes);

  app.use(errorHandler);

  return app;
}
