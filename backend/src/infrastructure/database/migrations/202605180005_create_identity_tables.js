exports.up = async function up(knex) {
  await knex.schema.createTable('roles', (table) => {
    table.increments('id').primary();
    table.string('name', 100).notNullable().unique();
    table.string('description', 255).nullable();
    table.boolean('is_active').notNullable().defaultTo(true);
    table.timestamps(true, true);
  });

  await knex.schema.createTable('users', (table) => {
    table.increments('id').primary();
    table.integer('role_id').unsigned().notNullable();
    table.string('first_name', 100).notNullable();
    table.string('last_name', 100).notNullable();
    table.string('email', 255).notNullable().unique();
    table.string('password_hash', 255).notNullable();
    table.boolean('is_active').notNullable().defaultTo(true);
    table.timestamp('last_login_at').nullable();
    table.timestamps(true, true);

    table.foreign('role_id', 'fk_users_role')
      .references('id')
      .inTable('roles')
      .onUpdate('CASCADE')
      .onDelete('RESTRICT');

    table.index(['role_id', 'is_active'], 'idx_users_role_active');
    table.index(['email', 'is_active'], 'idx_users_email_active');
  });
};

exports.down = async function down(knex) {
  await knex.schema.dropTableIfExists('users');
  await knex.schema.dropTableIfExists('roles');
};
