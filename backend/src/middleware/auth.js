const { logger } = require('../config/database');

/**
 * Middleware to check if user is authenticated
 */
const authenticate = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  
  logger.warn('Unauthorized access attempt');
  res.status(401).json({
    error: {
      message: 'Authentication required',
      status: 401
    }
  });
};

/**
 * Middleware to check if user owns the resource
 */
const authorize = (resourceType) => {
  return async (req, res, next) => {
    try {
      const userId = req.user._id;
      const resourceId = req.params.id || req.params.repoId || req.params.sessionId;

      // Import models dynamically to avoid circular dependencies
      const Repository = require('../models/Repository');
      const ChatSession = require('../models/ChatSession');

      let resource;
      
      if (resourceType === 'repository') {
        resource = await Repository.findById(resourceId);
      } else if (resourceType === 'chat') {
        resource = await ChatSession.findById(resourceId);
      }

      if (!resource) {
        return res.status(404).json({
          error: {
            message: `${resourceType} not found`,
            status: 404
          }
        });
      }

      if (resource.userId.toString() !== userId.toString()) {
        logger.warn(`Unauthorized access to ${resourceType}: ${resourceId} by user: ${userId}`);
        return res.status(403).json({
          error: {
            message: 'Access denied',
            status: 403
          }
        });
      }

      // Attach resource to request for use in route handler
      req.resource = resource;
      next();
    } catch (error) {
      logger.error('Authorization error:', error);
      res.status(500).json({
        error: {
          message: 'Authorization check failed',
          status: 500
        }
      });
    }
  };
};

/**
 * Optional authentication - doesn't block if not authenticated
 */
const optionalAuth = (req, res, next) => {
  // Just pass through, req.user will be undefined if not authenticated
  next();
};

module.exports = {
  authenticate,
  authorize,
  optionalAuth
};

// Made with Bob
