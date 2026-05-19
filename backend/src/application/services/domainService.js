const db = require('../../infrastructure/database/connection');
const AppError = require('../../shared/errors/appError');
const {
  pickAllowedFields,
  validateRequiredFields,
} = require('../../shared/utils/normalizePayload');

const domainFields = {
  domain_name: { required: true },
  domain_provider_id: { required: true, type: 'number' },
  domain_extension_id: { required: true, type: 'number' },
  domain_type_id: { required: true, type: 'number' },
  domain_action_id: { required: true, type: 'number' },
  expiration_date: { required: true },
  notes: { nullable: true },
  is_active: { type: 'boolean' },
};

function toNumber(value) {
  return Number(value || 0);
}

function roundMoney(value) {
  return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
}

function domainsQuery() {
  return db('domains as d')
    .leftJoin('domain_providers as p', 'd.domain_provider_id', 'p.id')
    .leftJoin('domain_extensions as e', 'd.domain_extension_id', 'e.id')
    .leftJoin('domain_types as t', 'd.domain_type_id', 't.id')
    .leftJoin('domain_actions as a', 'd.domain_action_id', 'a.id');
}

function selectDomainColumns() {
  return [
    'd.id',
    'd.domain_name',
    'd.domain_provider_id',
    'd.domain_extension_id',
    'd.domain_type_id',
    'd.domain_action_id',
    'd.expiration_date',
    'd.notes',
    'd.is_active',
    'd.created_at',
    'd.updated_at',
    'p.name as provider_name',
    'e.extension as extension',
    't.name as domain_type_name',
    'a.name as domain_action_name',
  ];
}

async function getCurrentFinancialSettings() {
  return db('financial_settings')
    .where({ is_active: true })
    .orderBy('effective_from', 'desc')
    .first();
}

async function getServicesByDomainIds(domainIds) {
  if (!domainIds.length) {
    return new Map();
  }

  const rows = await db('domain_additional_services as ds')
    .leftJoin('provider_service_prices as sp', 'ds.provider_service_price_id', 'sp.id')
    .select([
      'ds.domain_id',
      'ds.provider_service_price_id',
      'ds.service_type',
      'sp.service_name',
      'sp.price_amount',
      'sp.currency_code',
    ])
    .whereIn('ds.domain_id', domainIds);

  return rows.reduce((map, row) => {
    const services = map.get(row.domain_id) || {};
    services[row.service_type] = row;
    map.set(row.domain_id, services);
    return map;
  }, new Map());
}

async function getCurrentExtensionPrices(domains) {
  const pairs = domains.map((domain) => [
    domain.domain_provider_id,
    domain.domain_extension_id,
  ]);

  if (!pairs.length) {
    return new Map();
  }

  const today = new Date().toISOString().slice(0, 10);
  const rows = await db('provider_extension_prices')
    .select([
      'id',
      'domain_provider_id',
      'domain_extension_id',
      'price_amount',
      'currency_code',
      'effective_from',
    ])
    .whereIn(['domain_provider_id', 'domain_extension_id'], pairs)
    .where({ is_active: true })
    .where('effective_from', '<=', today)
    .where((builder) => {
      builder
        .whereNull('effective_to')
        .orWhere('effective_to', '>=', today);
    })
    .orderBy('effective_from', 'desc');

  return rows.reduce((map, row) => {
    const key = `${row.domain_provider_id}:${row.domain_extension_id}`;

    if (!map.has(key)) {
      map.set(key, row);
    }

    return map;
  }, new Map());
}

function attachComputedPrices(domain, services, financialSettings, extensionPrice) {
  const dnsService = services?.dns || null;
  const securityService = services?.security || null;
  const domainPrice = toNumber(extensionPrice?.price_amount);
  const dnsPrice = toNumber(dnsService?.price_amount);
  const securityPrice = toNumber(securityService?.price_amount);
  const subtotalAmount = domainPrice + dnsPrice + securityPrice;
  const vatRate = toNumber(financialSettings?.vat_rate);
  const usdExchangeRate = toNumber(financialSettings?.usd_exchange_rate) || 1;
  const vatAmount = subtotalAmount * vatRate;
  const totalAmount = subtotalAmount + vatAmount;

  return {
    ...domain,
    current_extension_price_id: extensionPrice?.id || null,
    domain_price_amount: roundMoney(domainPrice),
    domain_price_currency_code: extensionPrice?.currency_code || null,
    dns_service_price_id: dnsService?.provider_service_price_id || null,
    security_service_price_id: securityService?.provider_service_price_id || null,
    dns_price_amount: roundMoney(dnsPrice),
    security_price_amount: roundMoney(securityPrice),
    subtotal_amount: roundMoney(subtotalAmount),
    vat_rate: vatRate,
    vat_amount: roundMoney(vatAmount),
    total_amount: roundMoney(totalAmount),
    total_usd_amount: roundMoney(totalAmount / usdExchangeRate),
    usd_exchange_rate: usdExchangeRate,
    financial_setting_id: financialSettings?.id || null,
  };
}

async function decorateDomains(rows) {
  const servicesByDomain = await getServicesByDomainIds(rows.map((row) => row.id));
  const extensionPricesByPair = await getCurrentExtensionPrices(rows);
  const financialSettings = await getCurrentFinancialSettings();

  return rows.map((row) => {
    const extensionPrice = extensionPricesByPair.get(
      `${row.domain_provider_id}:${row.domain_extension_id}`,
    );

    return attachComputedPrices(
      row,
      servicesByDomain.get(row.id),
      financialSettings,
      extensionPrice,
    );
  });
}

async function list(filters = {}) {
  const page = Math.max(Number(filters.page || 1), 1);
  const pageSize = Math.min(Math.max(Number(filters.pageSize || 50), 1), 200);
  const offset = (page - 1) * pageSize;
  const baseQuery = domainsQuery();

  if (filters.search) {
    baseQuery.where((builder) => {
      builder
        .orWhere('d.domain_name', 'like', `%${filters.search}%`)
        .orWhere('p.name', 'like', `%${filters.search}%`)
        .orWhere('e.extension', 'like', `%${filters.search}%`)
        .orWhere('t.name', 'like', `%${filters.search}%`)
        .orWhere('a.name', 'like', `%${filters.search}%`);
    });
  }

  if (filters.domain_provider_id) {
    baseQuery.where('d.domain_provider_id', filters.domain_provider_id);
  }

  if (filters.domain_extension_id) {
    baseQuery.where('d.domain_extension_id', filters.domain_extension_id);
  }

  if (filters.domain_type_id) {
    baseQuery.where('d.domain_type_id', filters.domain_type_id);
  }

  if (filters.domain_action_id) {
    baseQuery.where('d.domain_action_id', filters.domain_action_id);
  }

  if (filters.expiration_from) {
    baseQuery.where('d.expiration_date', '>=', filters.expiration_from);
  }

  if (filters.expiration_to) {
    baseQuery.where('d.expiration_date', '<=', filters.expiration_to);
  }

  if (filters.is_active !== undefined && filters.is_active !== '') {
    const isActive = filters.is_active === true || filters.is_active === 'true' || filters.is_active === '1';
    baseQuery.where('d.is_active', isActive);
  }

  const countRow = await baseQuery.clone().count({ total: 'd.id' }).first();
  const rows = await baseQuery
    .clone()
    .select(selectDomainColumns())
    .orderBy('d.expiration_date', 'asc')
    .limit(pageSize)
    .offset(offset);

  return {
    data: await decorateDomains(rows),
    meta: {
      page,
      pageSize,
      total: Number(countRow?.total || 0),
    },
  };
}

async function getById(id) {
  const row = await domainsQuery()
    .select(selectDomainColumns())
    .where('d.id', id)
    .first();

  if (!row) {
    throw new AppError('Domain was not found.', 404);
  }

  const [domain] = await decorateDomains([row]);
  return domain;
}

async function syncAdditionalServices(trx, domain, payload) {
  const serviceEntries = [
    ['dns_service_price_id', 'dns'],
    ['security_service_price_id', 'security'],
  ];

  for (const [payloadKey, serviceType] of serviceEntries) {
    if (!Object.prototype.hasOwnProperty.call(payload, payloadKey)) {
      continue;
    }

    await trx('domain_additional_services')
      .where({
        domain_id: domain.id,
        service_type: serviceType,
      })
      .del();

    if (!payload[payloadKey]) {
      continue;
    }

    await trx('domain_additional_services').insert({
      domain_id: domain.id,
      domain_provider_id: domain.domain_provider_id,
      provider_service_price_id: payload[payloadKey],
      service_type: serviceType,
    });
  }
}

async function create(payload) {
  const data = pickAllowedFields(payload, domainFields);
  const missingFields = validateRequiredFields(data, domainFields);

  if (missingFields.length) {
    throw new AppError('Required fields are missing.', 400, { fields: missingFields });
  }

  const id = await db.transaction(async (trx) => {
    const [createdId] = await trx('domains').insert(data);
    const domain = { id: createdId, ...data };
    await syncAdditionalServices(trx, domain, payload);
    return createdId;
  });

  return getById(id);
}

async function update(id, payload) {
  const updatedId = await db.transaction(async (trx) => {
    const data = pickAllowedFields(payload, domainFields);

    if (Object.keys(data).length) {
      const affectedRows = await trx('domains')
        .where({ id })
        .update(data);

      if (!affectedRows) {
        throw new AppError('Domain was not found.', 404);
      }
    }

    const domain = await trx('domains')
      .where({ id })
      .first();

    if (!domain) {
      throw new AppError('Domain was not found.', 404);
    }

    await syncAdditionalServices(trx, domain, payload);
    return id;
  });

  return getById(updatedId);
}

async function remove(id) {
  const affectedRows = await db('domains')
    .where({ id })
    .del();

  if (!affectedRows) {
    throw new AppError('Domain was not found.', 404);
  }
}

module.exports = {
  list,
  getById,
  create,
  update,
  remove,
};
