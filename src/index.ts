import { CronJob } from "cron";
import { backup } from "./backup.js";
import { env } from "./env.js";
import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import cors from "cors";

console.log("NodeJS Version: " + process.version);

const tryBackup = async () => {
  try {
    await backup();
    return true;
  } catch (error) {
    console.error("Error while running backup: ", error);
    return false;
  }
}

// Setup Express server for webhook if secret is provided
if (env.WEBHOOK_SECRET) {
  const app = express();
  // Use Railway's PORT env variable if available, otherwise fall back to our configured port
  const port = process.env.PORT ? parseInt(process.env.PORT) : parseInt(env.WEBHOOK_PORT);
  
  // Middleware
  app.use(cors({
    origin: 'https://railway.com',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })); // Enable CORS specifically for railway.com
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  
  // Health check endpoint
  app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({ status: 'OK' });
  });
  
  // Webhook endpoint
  app.post('/webhook/backup', async (req: Request, res: Response) => {
    // Check for Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || authHeader !== `Bearer ${env.WEBHOOK_SECRET}`) {
      console.log('Webhook called with invalid authorization');
      res.status(403).json({ success: false, message: 'Invalid authorization' });
      return;
    }
    
    console.log('Running backup from webhook...');
    const success = await tryBackup();
    
    if (success) {
      res.status(200).json({ success: true, message: 'Backup completed successfully' });
    } else {
      res.status(500).json({ success: false, message: 'Backup failed' });
    }
  });
  
  // Start server
  app.listen(port, () => {
    console.log(`Webhook server running on port ${port}`);
  });
}

if (env.RUN_ON_STARTUP || env.SINGLE_SHOT_MODE) {
  console.log("Running on start backup...");

  const success = await tryBackup();

  if (env.SINGLE_SHOT_MODE) {
    console.log("Database backup complete, exiting...");
    process.exit(success ? 0 : 1);
  }
}

const job = new CronJob(env.BACKUP_CRON_SCHEDULE, async () => {
  await tryBackup();
});

job.start();

console.log("Backup cron scheduled...");