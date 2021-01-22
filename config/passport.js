const bcrypt = require("bcrypt");
const passport = require("passport");
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const LocalStrategy = require("passport-local").Strategy;
const { User } = require("../models");

module.exports = passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const user = await User.findOne({ username });
      if (!user) {
        return done(null, false, {
          message: "Username does not exist",
          name: "username",
        });
      } else {
        const match = await bcrypt.compare(password, user.password);
        if (match) {
          return done(null, user, {
            message: `Welcome back ${user.name}!`,
          });
        } else {
          return done(null, false, {
            message: "Incorrect password",
            name: "password",
          });
        }
      }
    } catch (err) {
      return done(err, false);
    }
  })
);

module.exports = passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET,
    },
    async (payload, done) => {
      try {
        const user = await User.findById(payload.user._id);
        user ? done(null, user) : done(null, false);
      } catch (err) {
        return done(err, false);
      }
    }
  )
);
