const express = require('express');
const passport = require('../config/passport');
const { authenticate } = require('../middleware/auth');
const { logger } = require('../config/database');

const router = express.Router();

/**
 * @route   GET /api/auth/github
 * @desc    Initiate GitHub OAuth flow
 * @access  Public
 */
router.get('/github', passport.authenticate('github', {
  scope: ['user:email', 'repo']
}));

/**
 * @route   GET /api/auth/github/callback
 * @desc    GitHub OAuth callback
 * @access  Public
 */
router.get('/github/callback',
  passport.authenticate('github', { failureRedirect: '/login' }),
  (req, res) => {
    logger.info(`User authenticated: ${req.user.username}`);
    // Redirect to frontend dashboard
    res.redirect(`${process.env.FRONTEND_URL}/dashboard`);
  }
);

/**
 * @route   GET /api/auth/user
 * @desc    Get current authenticated user
 * @access  Private
 */
router.get('/user', authenticate, (req, res) => {
  res.json({
    user: req.user.getPublicProfile()
  });
});

/**
 * @route   GET /api/auth/status
 * @desc    Check authentication status
 * @access  Public
 */
router.get('/status', (req, res) => {
  if (req.isAuthenticated()) {
    res.json({
      authenticated: true,
      user: req.user.getPublicProfile()
    });
  } else {
    res.json({
      authenticated: false
    });
  }
});

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Private
 */
router.post('/logout', authenticate, (req, res) => {
  const username = req.user.username;
  
  req.logout((err) => {
    if (err) {
      logger.error('Logout error:', err);
      return res.status(500).json({
        error: {
          message: 'Logout failed',
          status: 500
        }
      });
    }
    
    req.session.destroy((err) => {
      if (err) {
        logger.error('Session destruction error:', err);
      }
      
      logger.info(`User logged out: ${username}`);
      res.json({
        message: 'Logged out successfully'
      });
    });
  });
});

module.exports = router;

// Made with Bob
