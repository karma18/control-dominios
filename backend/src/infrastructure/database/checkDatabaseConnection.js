async function checkDatabaseConnection(db) {
  await db.raw('select 1 as connection_status');
}

module.exports = checkDatabaseConnection;
