const bcrypt = require("bcrypt");
const passport = require("passport");
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const LocalStrategy = require("passport-local").Strategy;
const { User } = require("../models");

// Local Strategy
module.exports = passport.use(
  new LocalStrategy((username, password, done) => {
    User.findOne({ username }, (err, user) => {
      if (err) {
        return done(err);
      }
      if (!user) {
        return done(null, false, { message: "Username does not exist" });
      }
      bcrypt.compare(password, user.password, (err, res) => {
        if (res) {
          return done(null, user, {
            message: `Welcome back ${user.name}!`,
          });
        } else {
          return done(null, false, { message: "Incorrect password" });
        }
      });
    });
  })
);

// JWT Strategy
module.exports = passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET,
    },
    (payload, done) => {
      User.findById(payload.user._id, (err, user) => {
        if (err) {
          return done(err, false);
        }

        if (user) {
          done(null, user);
        } else {
          done(null, false);
        }
      });
    }
  )
);
