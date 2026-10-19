import app from './app.js';
import { connectDB } from './config/db.js';
import { config } from './config/env.js';

async function startServer() {
  try {
    await connectDB();
    app.listen(config.port, () => {
      console.log(`[PayFlow Server] Running on http://localhost:${config.port} (${config.nodeEnv})`);
    });
  } catch (error) {
    console.error('[Startup Failure]:', error.message);
    process.exit(1);
  }
}

startServer();
