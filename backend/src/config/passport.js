const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const User = require('../models/User');
const { logger } = require('./database');

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// GitHub OAuth Strategy
passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: process.env.GITHUB_CALLBACK_URL,
      scope: ['user:email', 'repo']
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        logger.info(`GitHub OAuth callback for user: ${profile.username}`);

        // Check if user exists
        let user = await User.findByGithubId(profile.id);

        if (user) {
          // Update existing user
          user.accessToken = accessToken;
          user.avatarUrl = profile.photos?.[0]?.value || user.avatarUrl;
          await user.updateLastLogin();
          logger.info(`Existing user logged in: ${user.username}`);
        } else {
          // Create new user
          user = new User({
            githubId: profile.id,
            username: profile.username,
            email: profile.emails?.[0]?.value || `${profile.username}@github.com`,
            avatarUrl: profile.photos?.[0]?.value,
            accessToken
          });
          await user.save();
          logger.info(`New user created: ${user.username}`);
        }

        return done(null, user);
      } catch (error) {
        logger.error('GitHub OAuth error:', error);
        return done(error, null);
      }
    }
  )
);

module.exports = passport;

// Made with Bob
