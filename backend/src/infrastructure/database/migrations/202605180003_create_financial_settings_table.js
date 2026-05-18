exports.up = async function up(knex) {
  await knex.schema.createTable('financial_settings', (table) => {
    table.increments('id').primary();
    table.string('name', 100).notNullable();
    table.string('base_currency_code', 3).notNullable().defaultTo('MXN');
    table.decimal('usd_exchange_rate', 15, 6).unsigned().notNullable();
    table.decimal('vat_rate', 6, 4).unsigned().notNullable().defaultTo(0.1600);
    table.date('effective_from').notNullable();
    table.date('effective_to').nullable();
    table.boolean('is_active').notNullable().defaultTo(true);
    table.timestamps(true, true);

    table.unique(['name', 'effective_from'], 'uq_financial_settings_name_from');
    table.index(['is_active', 'effective_from'], 'idx_financial_settings_active_from');
  });
};

exports.down = async function down(knex) {
  await knex.schema.dropTableIfExists('financial_settings');
};
