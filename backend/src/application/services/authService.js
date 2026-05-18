const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const AppError = require('../../shared/errors/appError');
const userService = require('./userService');

const jwtSecret = process.env.JWT_SECRET || 'development-secret-change-me';
const jwtExpiresIn = process.env.JWT_EXPIRES_IN || '8h';

function toPublicUser(user) {
  const { password_hash: passwordHash, ...publicUser } = user;
  return publicUser;
}

async function login(email, password) {
  if (!email || !password) {
    throw new AppError('Email and password are required.', 400);
  }

  const user = await userService.getByEmailWithPassword(email);

  if (!user) {
    throw new AppError('Invalid credentials.', 401);
  }

  if (!user.is_active) {
    throw new AppError('User is inactive.', 403);
  }

  const passwordMatches = await bcrypt.compare(password, user.password_hash);

  if (!passwordMatches) {
    throw new AppError('Invalid credentials.', 401);
  }

  await userService.markLogin(user.id);

  const token = jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role_name,
    },
    jwtSecret,
    { expiresIn: jwtExpiresIn },
  );

  return {
    token,
    user: toPublicUser(user),
  };
}

async function me(userId) {
  return userService.getById(userId);
}

module.exports = {
  login,
  me,
};
