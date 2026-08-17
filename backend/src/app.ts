import express from 'express';
import cors from 'cors';
import exploreRouter from './routes/explore';
import placesRouter from './routes/places';
import contributionsRouter from './routes/contributions';
import merchantRouter from './routes/merchant';
import profileRouter from './routes/profile';
import awardsRouter from './routes/awards';
import regionsRouter from './routes/regions';
import adminRouter from './routes/admin';
import cronRouter from './routes/cron';
import settingsRouter from './routes/settings';
import { errorHandler } from './middleware/errorHandler';

const app = express();

const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(',').map((url) => url.trim())
  : '*';

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/explore', exploreRouter);
app.use('/api/places', placesRouter);
app.use('/api/contributions', contributionsRouter);
app.use('/api/merchant', merchantRouter);
app.use('/api/profile', profileRouter);
app.use('/api/awards', awardsRouter);
app.use('/api/regions', regionsRouter);
app.use('/api/admin', adminRouter);
app.use('/api/cron', cronRouter);
app.use('/api/settings', settingsRouter);

app.use(errorHandler);

export default app;

