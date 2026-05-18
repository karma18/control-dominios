exports.up = async function up(knex) {
  await knex.schema.createTable('domain_providers', (table) => {
    table.increments('id').primary();
    table.string('name', 150).notNullable().unique();
    table.string('website_url', 255).nullable();
    table.string('support_email', 255).nullable();
    table.boolean('is_active').notNullable().defaultTo(true);
    table.timestamps(true, true);
  });

  await knex.schema.createTable('domain_extensions', (table) => {
    table.increments('id').primary();
    table.string('extension', 30).notNullable().unique();
    table.string('description', 255).nullable();
    table.boolean('is_active').notNullable().defaultTo(true);
    table.timestamps(true, true);
  });

  await knex.schema.createTable('domain_types', (table) => {
    table.increments('id').primary();
    table.string('name', 100).notNullable().unique();
    table.string('description', 255).nullable();
    table.boolean('is_active').notNullable().defaultTo(true);
    table.timestamps(true, true);
  });

  await knex.schema.createTable('domain_actions', (table) => {
    table.increments('id').primary();
    table.string('name', 100).notNullable().unique();
    table.string('description', 255).nullable();
    table.boolean('is_active').notNullable().defaultTo(true);
    table.timestamps(true, true);
  });
};

exports.down = async function down(knex) {
  await knex.schema.dropTableIfExists('domain_actions');
  await knex.schema.dropTableIfExists('domain_types');
  await knex.schema.dropTableIfExists('domain_extensions');
  await knex.schema.dropTableIfExists('domain_providers');
};
