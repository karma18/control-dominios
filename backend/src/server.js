const app = require('./app');
const db = require('./infrastructure/database/connection');

const port = Number(process.env.PORT || 3000);

const server = app.listen(port, () => {
  console.log(JSON.stringify({
    level: 'info',
    message: 'Backend server started.',
    port,
  }));
});

async function shutdown() {
  server.close(async () => {
    await db.destroy();
    process.exit(0);
  });
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
