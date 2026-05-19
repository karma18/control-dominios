const db = require('../../infrastructure/database/connection');
const catalogResources = require('../../config/catalogResources');
const AppError = require('../../shared/errors/appError');
const {
  pickAllowedFields,
  validateRequiredFields,
} = require('../../shared/utils/normalizePayload');

function getResourceConfig(resourceName) {
  const config = catalogResources[resourceName];

  if (!config) {
    throw new AppError('Catalog resource was not found.', 404);
  }

  return config;
}

function applySearch(query, config, search) {
  if (!search || !config.searchColumns?.length) {
    return;
  }

  query.where((builder) => {
    config.searchColumns.forEach((column) => {
      builder.orWhere(column, 'like', `%${search}%`);
    });
  });
}

function applyActiveFilter(query, config, active) {
  if ((active === undefined && config.fields.is_active) || !config.fields.is_active) {
    return;
  }

  const isActive = active === true || active === 'true' || active === '1';
  query.where('is_active', isActive);
}

function applyFieldFilters(query, config, filters) {
  Object.keys(config.fields).forEach((fieldName) => {
    const value = filters[fieldName];

    if (value === undefined || value === null || value === '') {
      return;
    }

    if (fieldName === 'is_active') {
      const isActive = value === true || value === 'true' || value === '1';
      query.where(fieldName, isActive);
      return;
    }

    query.where(fieldName, value);
  });
}

async function list(resourceName, filters = {}) {
  const config = getResourceConfig(resourceName);
  const page = Math.max(Number(filters.page || 1), 1);
  const pageSize = Math.min(Math.max(Number(filters.pageSize || 50), 1), 200);
  const offset = (page - 1) * pageSize;
  const baseQuery = db(config.table);

  applySearch(baseQuery, config, filters.search);
  applyActiveFilter(baseQuery, config, filters.active);
  applyFieldFilters(baseQuery, config, filters);

  const countRow = await baseQuery.clone().count({ total: 'id' }).first();
  const data = await baseQuery
    .clone()
    .select(config.columns)
    .orderBy(config.orderBy || 'id', config.orderDirection || 'asc')
    .limit(pageSize)
    .offset(offset);

  return {
    data,
    meta: {
      page,
      pageSize,
      total: Number(countRow?.total || 0),
    },
  };
}

async function getById(resourceName, id) {
  const config = getResourceConfig(resourceName);
  const record = await db(config.table)
    .select(config.columns)
    .where({ id })
    .first();

  if (!record) {
    throw new AppError('Record was not found.', 404);
  }

  return record;
}

async function create(resourceName, payload) {
  const config = getResourceConfig(resourceName);
  const data = pickAllowedFields(payload, config.fields);
  const missingFields = validateRequiredFields(data, config.fields);

  if (missingFields.length) {
    throw new AppError('Required fields are missing.', 400, { fields: missingFields });
  }

  const [id] = await db(config.table).insert(data);
  return getById(resourceName, id);
}

async function update(resourceName, id, payload) {
  const config = getResourceConfig(resourceName);
  const data = pickAllowedFields(payload, config.fields);

  if (!Object.keys(data).length) {
    throw new AppError('No valid fields were provided.', 400);
  }

  const affectedRows = await db(config.table)
    .where({ id })
    .update(data);

  if (!affectedRows) {
    throw new AppError('Record was not found.', 404);
  }

  return getById(resourceName, id);
}

async function remove(resourceName, id) {
  const config = getResourceConfig(resourceName);
  const affectedRows = await db(config.table)
    .where({ id })
    .del();

  if (!affectedRows) {
    throw new AppError('Record was not found.', 404);
  }
}

module.exports = {
  list,
  getById,
  create,
  update,
  remove,
};
