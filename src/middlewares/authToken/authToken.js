const jwt = require('jsonwebtoken');

const authToken = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];
  if (!token) {
    return res.status(401).json({
      status: 'error',
      message: 'Authentication failed: Bearer token not provided',
      error_code: 'BearerTokenMissing',
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decodedToken) => {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
          status: 'error',
          message: 'Authentication failed: Bearer token has expired',
          error_code: 'ExpiredBearerToken',
        });
      }
      if (err.name === 'JsonWebTokenError' || err.name === 'NotBeforeError') {
        return res.status(403).json({
          status: 'error',
          message: 'Authentication failed: Invalid bearer token',
          error_code: 'InvalidBearerToken',
        });
      }
      if (err.name === 'TokenTamperedError') {
        return res.status(403).json({
          status: 'error',
          message: 'Authentication failed: Bearer token is tampered or invalid',
          error_code: 'TamperedBearerToken',
        });
      }
      return res.status(500).json({
        status: 'error',
        message: 'Authentication failed: Unexpected error',
        error_code: 'UnexpectedError',
      });
    }

    req.userId = decodedToken.userId;
    req.userRole = decodedToken.role;
    next();
  });
};

module.exports = authToken;
