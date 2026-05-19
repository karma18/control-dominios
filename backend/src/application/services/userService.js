const bcrypt = require('bcryptjs');
const db = require('../../infrastructure/database/connection');
const AppError = require('../../shared/errors/appError');

const userSelectColumns = [
  'users.id',
  'users.role_id',
  'roles.name as role_name',
  'users.first_name',
  'users.last_name',
  'users.email',
  'users.is_active',
  'users.last_login_at',
  'users.created_at',
  'users.updated_at',
];

function sanitizeUserPayload(payload) {
  const data = {};
  const fields = ['role_id', 'first_name', 'last_name', 'email', 'is_active'];

  fields.forEach((field) => {
    if (Object.prototype.hasOwnProperty.call(payload, field)) {
      data[field] = field === 'is_active'
        ? payload[field] === true || payload[field] === 'true' || payload[field] === 1 || payload[field] === '1'
        : payload[field];
    }
  });

  return data;
}

async function hashPassword(password) {
  return bcrypt.hash(password, Number(process.env.BCRYPT_SALT_ROUNDS || 12));
}

function usersQuery() {
  return db('users')
    .leftJoin('roles', 'users.role_id', 'roles.id')
    .select(userSelectColumns);
}

async function list(filters = {}) {
  const page = Math.max(Number(filters.page || 1), 1);
  const pageSize = Math.min(Math.max(Number(filters.pageSize || 50), 1), 200);
  const offset = (page - 1) * pageSize;
  const baseQuery = db('users').leftJoin('roles', 'users.role_id', 'roles.id');

  if (filters.search) {
    baseQuery.where((builder) => {
      builder
        .orWhere('users.first_name', 'like', `%${filters.search}%`)
        .orWhere('users.last_name', 'like', `%${filters.search}%`)
        .orWhere('users.email', 'like', `%${filters.search}%`)
        .orWhere('roles.name', 'like', `%${filters.search}%`);
    });
  }

  if (filters.role_id) {
    baseQuery.where('users.role_id', filters.role_id);
  }

  if (filters.is_active !== undefined && filters.is_active !== '') {
    const isActive = filters.is_active === true || filters.is_active === 'true' || filters.is_active === '1';
    baseQuery.where('users.is_active', isActive);
  }

  const countRow = await baseQuery.clone().count({ total: 'users.id' }).first();
  const data = await baseQuery
    .clone()
    .select(userSelectColumns)
    .orderBy('users.first_name', 'asc')
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

async function getById(id) {
  const user = await usersQuery()
    .where('users.id', id)
    .first();

  if (!user) {
    throw new AppError('User was not found.', 404);
  }

  return user;
}

async function getByEmailWithPassword(email) {
  return db('users')
    .leftJoin('roles', 'users.role_id', 'roles.id')
    .select([
      ...userSelectColumns,
      'users.password_hash',
    ])
    .where('users.email', email)
    .first();
}

async function create(payload) {
  const data = sanitizeUserPayload(payload);
  const requiredFields = ['role_id', 'first_name', 'last_name', 'email'];
  const missingFields = requiredFields.filter((field) => !data[field]);

  if (!payload.password) {
    missingFields.push('password');
  }

  if (missingFields.length) {
    throw new AppError('Required fields are missing.', 400, { fields: missingFields });
  }

  data.password_hash = await hashPassword(payload.password);

  const [id] = await db('users').insert(data);
  return getById(id);
}

async function update(id, payload) {
  const data = sanitizeUserPayload(payload);

  if (payload.password) {
    data.password_hash = await hashPassword(payload.password);
  }

  if (!Object.keys(data).length) {
    throw new AppError('No valid fields were provided.', 400);
  }

  const affectedRows = await db('users')
    .where({ id })
    .update(data);

  if (!affectedRows) {
    throw new AppError('User was not found.', 404);
  }

  return getById(id);
}

async function remove(id) {
  const affectedRows = await db('users')
    .where({ id })
    .del();

  if (!affectedRows) {
    throw new AppError('User was not found.', 404);
  }
}

async function markLogin(id) {
  await db('users')
    .where({ id })
    .update({ last_login_at: db.fn.now() });
}

module.exports = {
  list,
  getById,
  getByEmailWithPassword,
  create,
  update,
  remove,
  markLogin,
};
