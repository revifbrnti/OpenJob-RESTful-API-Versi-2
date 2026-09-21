const jwt = require('jsonwebtoken');
const AuthenticationError = require('../exceptions/AuthenticationError');

const authMiddleware = (req, res, next) => {
  const authorization = req.headers.authorization;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    return next(new AuthenticationError('Kredensial tidak valid atau token hilang'));
  }

  const token = authorization.substring(7);

  if (!token) {
    return next(new AuthenticationError('Kredensial tidak valid atau token hilang'));
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_KEY);
    req.user = decoded;
    return next();
  } catch (error) {
    return next(new AuthenticationError('Access token tidak valid atau sudah kadaluwarsa'));
  }
};

module.exports = authMiddleware;
