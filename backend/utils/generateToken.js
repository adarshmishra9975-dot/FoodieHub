const jwt = require('jsonwebtoken');

const generateToken = (id, role) => {
  const secret = process.env.JWT_SECRET || 'foodiehub_super_secret_jwt_key_2026_bsc_it';
  return jwt.sign({ id, role }, secret, {
    expiresIn: '7d',
  });
};

module.exports = generateToken;
