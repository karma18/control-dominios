exports.up = async function up(knex) {
  const hasProviderExtensionPriceId = await knex.schema.hasColumn(
    'domains',
    'provider_extension_price_id',
  );

  if (!hasProviderExtensionPriceId) {
    return;
  }

  await knex.schema.alterTable('domains', (table) => {
    table.dropForeign(
      ['domain_provider_id', 'domain_extension_id', 'provider_extension_price_id'],
      'fk_domains_provider_extension_price',
    );
    table.dropColumn('provider_extension_price_id');
  });
};

exports.down = async function down(knex) {
  const hasProviderExtensionPriceId = await knex.schema.hasColumn(
    'domains',
    'provider_extension_price_id',
  );

  if (hasProviderExtensionPriceId) {
    return;
  }

  await knex.schema.alterTable('domains', (table) => {
    table.integer('provider_extension_price_id').unsigned().nullable().after('domain_extension_id');

    table.foreign(
      ['domain_provider_id', 'domain_extension_id', 'provider_extension_price_id'],
      'fk_domains_provider_extension_price',
    )
      .references(['domain_provider_id', 'domain_extension_id', 'id'])
      .inTable('provider_extension_prices')
      .onUpdate('CASCADE')
      .onDelete('RESTRICT');
  });
};
