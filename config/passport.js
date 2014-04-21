var LocalStrategy = require('passport-local').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

// load up user model
var User = require('../models/user');

//load the auth variables
var configAuth = require('./auth');

module.exports = function(passport) {

  // Passport Session Setup ==========================

  // used to serialize the user for the session
  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  // used to deserialize user
  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });

  // Local Signup ===================================

  passport.use('local-signup', new LocalStrategy({
    // overriding username default to email
    usernameField : 'email',
    passwordField : 'password',
    passReqToCallback : true
  }, 
  function(req, email, password, done) {
    process.nextTick(function() {       //async "Timeout".  findOne called only if data is sent back
      User.findOne({ 'local.email' : email }, function(err, existingUser) {

        if (err)
          return done(err);

        if (existingUser) 
          return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
         
        if (req.user) {  // If logged in, we're connecting to a new Local account
          var user = req.user;
          user.local.email = email;
          user.local.password = user.generateHash(password);
          user.save(function(err) {
            if (err)
              throw err;
            return done(null, user);
          });
        //  Else we're not logged in, so we created a new user  
        } else {

          var newUser = new User();

          newUser.local.email = email;
          newUser.local.password = newUser.generateHash(password);

          newUser.save(function(err) {
            if (err) 
              throw err;
            return done(null, newUser);
          });
        }
      });
    });
  }));

  // Local Login ===================================

  passport.use('local-login', new LocalStrategy({
    usernameField : 'email',
    passwordField : 'password',
    passReqToCallback : true
  },
  function(req, email, password, done) {
    User.findOne({ 'local.email' : email }, function(err, user) {
      if (err)
        return done(err);

      if (!user)
        return done(null, false, req.flash('loginMessage', 'No user found.'));

      if(!user.validPassword(password))
        return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.'));

      return done(null, user);
    });
  }));

  // Google =======================================

  passport.use(new GoogleStrategy({
    clientID: configAuth.googleAuth.clientID,
    clientSecret: configAuth.googleAuth.clientSecret,
    callbackURL: configAuth.googleAuth.callbackURL,
    passReqToCallback: true
  },
  function(req, token, refreshToken, profile, done) {
    //asynchronous
    process.nextTick(function() {

      if (!req.user) {
        User.findOne({ 'google.id': profile.id }, function(err, user) {
          if (err)
            return done(err);

          if (user) {
            // if there is a user id but no token (user unlinked account)
            if (!user.google.token) {
              user.google.token = token;
              user.google.name = profile.displayName;
              user.google.email = profile.emails[0].value;

              user.save(function(err) {
                if (err)
                  throw err;
                return done(null, user);
              });
            }
            return done(null, user); // found user

          } else {
            var newUser = new User();
            // set all relavent info for our new user
            newUser.google.id = profile.id;
            newUser.google.token = token;
            newUser.google.name = profile.displayName;
            newUser.google.email = profile.emails[0].value;  //pull the first email

            //save the user
            newUser.save(function(err) {
              if(err)
                throw err;

              return done(null, newUser);
            });
          }
        });
     } else {
      // user exists and is logged in, we have to link accounts
      var user = req.user;

      user.google.id = profile.id;
      user.google.token = token;
      user.google.name = profile.displayName;
      user.google.email = profile.emails[0].value; 

      user.save(function(err) {
        if (err)
          throw err;
        return done(null, user);
      });
     }
    });
  }));

};