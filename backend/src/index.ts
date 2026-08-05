import app from './app';
import dotenv from 'dotenv';
import { initAdExpirationCron } from './cron/adExpiration';

dotenv.config();

const PORT = process.env.PORT || 3001;

// Initialize background cron jobs
initAdExpirationCron();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

