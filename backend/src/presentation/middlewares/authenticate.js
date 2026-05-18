const jwt = require('jsonwebtoken');
const AppError = require('../../shared/errors/appError');
const userService = require('../../application/services/userService');

module.exports = async function authenticate(req, res, next) {
  try {
    const authorizationHeader = req.headers.authorization || '';
    const [, token] = authorizationHeader.split(' ');

    if (!token) {
      throw new AppError('Authentication token is required.', 401);
    }

    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET || 'development-secret-change-me',
    );

    const user = await userService.getById(payload.sub);

    if (!user.is_active) {
      throw new AppError('User is inactive.', 403);
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      next(new AppError('Invalid authentication token.', 401));
      return;
    }

    next(error);
  }
};
