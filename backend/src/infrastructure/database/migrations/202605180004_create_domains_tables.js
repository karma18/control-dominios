exports.up = async function up(knex) {
  await knex.schema.createTable('domains', (table) => {
    table.increments('id').primary();
    table.string('domain_name', 255).notNullable();
    table.integer('domain_provider_id').unsigned().notNullable();
    table.integer('domain_extension_id').unsigned().notNullable();
    table.integer('domain_type_id').unsigned().notNullable();
    table.integer('domain_action_id').unsigned().notNullable();
    table.date('expiration_date').notNullable();
    table.text('notes').nullable();
    table.boolean('is_active').notNullable().defaultTo(true);
    table.timestamps(true, true);

    table.foreign('domain_provider_id', 'fk_domains_provider')
      .references('id')
      .inTable('domain_providers')
      .onUpdate('CASCADE')
      .onDelete('RESTRICT');

    table.foreign('domain_extension_id', 'fk_domains_extension')
      .references('id')
      .inTable('domain_extensions')
      .onUpdate('CASCADE')
      .onDelete('RESTRICT');

    table.foreign('domain_type_id', 'fk_domains_type')
      .references('id')
      .inTable('domain_types')
      .onUpdate('CASCADE')
      .onDelete('RESTRICT');

    table.foreign('domain_action_id', 'fk_domains_action')
      .references('id')
      .inTable('domain_actions')
      .onUpdate('CASCADE')
      .onDelete('RESTRICT');

    table.unique(['domain_name', 'domain_extension_id'], 'uq_domains_name_extension');
    table.unique(['id', 'domain_provider_id'], 'uq_domains_id_provider');
    table.index(['expiration_date', 'domain_action_id'], 'idx_domains_expiration_action');
    table.index(['domain_provider_id', 'domain_extension_id'], 'idx_domains_provider_extension');
  });

  await knex.schema.createTable('domain_additional_services', (table) => {
    table.increments('id').primary();
    table.integer('domain_id').unsigned().notNullable();
    table.integer('domain_provider_id').unsigned().notNullable();
    table.integer('provider_service_price_id').unsigned().notNullable();
    table.enu('service_type', ['dns', 'security'], {
      useNative: true,
      enumName: 'domain_additional_service_type',
    }).notNullable();
    table.timestamps(true, true);

    table.foreign(['domain_id', 'domain_provider_id'], 'fk_domain_services_domain_provider')
      .references(['id', 'domain_provider_id'])
      .inTable('domains')
      .onUpdate('CASCADE')
      .onDelete('CASCADE');

    table.foreign(
      ['domain_provider_id', 'provider_service_price_id', 'service_type'],
      'fk_domain_services_provider_service_price',
    )
      .references(['domain_provider_id', 'id', 'service_type'])
      .inTable('provider_service_prices')
      .onUpdate('CASCADE')
      .onDelete('RESTRICT');

    table.unique(['domain_id', 'service_type'], 'uq_domain_services_domain_type');
    table.index(['provider_service_price_id'], 'idx_domain_services_price');
  });
};

exports.down = async function down(knex) {
  await knex.schema.dropTableIfExists('domain_additional_services');
  await knex.schema.dropTableIfExists('domains');
};
