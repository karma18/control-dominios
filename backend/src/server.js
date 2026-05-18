const app = require('./app');
const db = require('./infrastructure/database/connection');
const checkDatabaseConnection = require('./infrastructure/database/checkDatabaseConnection');

const port = Number(process.env.PORT || 3000);
let server;

async function startServer() {
  try {
    await checkDatabaseConnection(db);

    console.log(JSON.stringify({
      level: 'info',
      message: 'MySQL connection verified.',
      database: process.env.DB_NAME,
    }));

    server = app.listen(port, () => {
      console.log(JSON.stringify({
        level: 'info',
        message: 'Backend server started.',
        port,
      }));
    });
  } catch (error) {
    console.error(JSON.stringify({
      level: 'error',
      message: 'Backend startup failed because MySQL connection could not be verified.',
      error: error.message,
    }));

    await db.destroy();
    process.exit(1);
  }
}

async function shutdown() {
  if (!server) {
    await db.destroy();
    process.exit(0);
  }

  server.close(async () => {
    await db.destroy();
    process.exit(0);
  });
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

startServer();
