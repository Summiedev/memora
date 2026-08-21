const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require("../models/user.js");

const getCallbackURL = () => {
  const serverUrl = process.env.SERVER_URL;
  if (!serverUrl) {
    console.warn('SERVER_URL not set in environment variables. Google OAuth callback may fail.');
  }
  return `${serverUrl || 'http://localhost:5000'}/api/auth/google/callback`;
};

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: getCallbackURL(),
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await User.findOne({ googleId: profile.id });
      if (!user) {
        user = await User.create({
          googleId: profile.id,
          fullname: profile.displayName,
          email: profile.emails[0].value,
          avatar: profile.photos[0].value,
          isVerified: true
        });
      }
      return done(null, user);
    } catch (err) {
      return done(err, false);
    }
  }
));
