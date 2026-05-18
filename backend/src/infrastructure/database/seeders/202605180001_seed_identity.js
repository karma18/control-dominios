const bcrypt = require('bcryptjs');

exports.seed = async function seed(knex) {
  const roles = [
    {
      name: 'admin',
      description: 'Full access to domain inventory administration.',
    },
    {
      name: 'operator',
      description: 'Operational access to manage domain catalogs.',
    },
  ];

  await knex('roles')
    .insert(roles)
    .onConflict('name')
    .ignore();

  if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
    return;
  }

  const adminRole = await knex('roles')
    .where({ name: 'admin' })
    .first();

  const existingAdmin = await knex('users')
    .where({ email: process.env.ADMIN_EMAIL })
    .first();

  if (existingAdmin) {
    return;
  }

  const passwordHash = await bcrypt.hash(
    process.env.ADMIN_PASSWORD,
    Number(process.env.BCRYPT_SALT_ROUNDS || 12),
  );

  await knex('users').insert({
    role_id: adminRole.id,
    first_name: 'System',
    last_name: 'Administrator',
    email: process.env.ADMIN_EMAIL,
    password_hash: passwordHash,
    is_active: true,
  });
};
