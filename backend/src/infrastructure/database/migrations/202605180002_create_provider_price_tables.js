exports.up = async function up(knex) {
  await knex.schema.createTable('provider_extension_prices', (table) => {
    table.increments('id').primary();
    table.integer('domain_provider_id').unsigned().notNullable();
    table.integer('domain_extension_id').unsigned().notNullable();
    table.decimal('price_amount', 15, 4).unsigned().notNullable();
    table.string('currency_code', 3).notNullable().defaultTo('MXN');
    table.date('effective_from').notNullable();
    table.date('effective_to').nullable();
    table.boolean('is_active').notNullable().defaultTo(true);
    table.timestamps(true, true);

    table.foreign('domain_provider_id', 'fk_provider_extension_prices_provider')
      .references('id')
      .inTable('domain_providers')
      .onUpdate('CASCADE')
      .onDelete('RESTRICT');

    table.foreign('domain_extension_id', 'fk_provider_extension_prices_extension')
      .references('id')
      .inTable('domain_extensions')
      .onUpdate('CASCADE')
      .onDelete('RESTRICT');

    table.unique(
      ['domain_provider_id', 'domain_extension_id', 'effective_from'],
      'uq_provider_extension_prices_provider_extension_from',
    );
    table.unique(
      ['domain_provider_id', 'domain_extension_id', 'id'],
      'uq_provider_extension_prices_provider_extension_id',
    );
    table.index(
      ['domain_provider_id', 'domain_extension_id', 'is_active'],
      'idx_provider_extension_prices_lookup',
    );
  });

  await knex.schema.createTable('provider_service_prices', (table) => {
    table.increments('id').primary();
    table.integer('domain_provider_id').unsigned().notNullable();
    table.enu('service_type', ['dns', 'security'], {
      useNative: true,
      enumName: 'provider_service_type',
    }).notNullable();
    table.string('service_name', 100).notNullable();
    table.decimal('price_amount', 15, 4).unsigned().notNullable();
    table.string('currency_code', 3).notNullable().defaultTo('MXN');
    table.date('effective_from').notNullable();
    table.date('effective_to').nullable();
    table.boolean('is_active').notNullable().defaultTo(true);
    table.timestamps(true, true);

    table.foreign('domain_provider_id', 'fk_provider_service_prices_provider')
      .references('id')
      .inTable('domain_providers')
      .onUpdate('CASCADE')
      .onDelete('RESTRICT');

    table.unique(
      ['domain_provider_id', 'service_type', 'service_name', 'effective_from'],
      'uq_provider_service_prices_provider_type_name_from',
    );
    table.unique(
      ['domain_provider_id', 'id', 'service_type'],
      'uq_provider_service_prices_provider_id_type',
    );
    table.index(
      ['domain_provider_id', 'service_type', 'is_active'],
      'idx_provider_service_prices_lookup',
    );
  });
};

exports.down = async function down(knex) {
  await knex.schema.dropTableIfExists('provider_service_prices');
  await knex.schema.dropTableIfExists('provider_extension_prices');
};
