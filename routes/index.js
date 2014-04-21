var express = require('express');
var passport = require('passport');
var router = express.Router();
var expressValidator = require('express-validator');


/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
});

// Login
router.get('/login', function(req, res) {
  res.render('login', { message: req.flash('loginMessage') });
});

router.use('/login', function(req, res, next) {  //validation middleware
  req.assert('email', 'Invalid Email').isEmail();

  var errors = req.validationErrors();
  if (!errors) return next();

  res.render('login', { message: '', errors: errors }); 
});

router.post('/login', passport.authenticate('local-login', {
      successRedirect: '/profile',
      failureRedirect: '/login',
      failureFlash: true  
}));

// SignUp
router.get('/signup', function(req, res) {
  res.render('signup', {message: req.flash('signupMessage')});
});

router.use('/signup', function(req, res, next) {  // validation middleware
  req.assert('email', 'Invalid Email').isEmail();
  req.assert('password', 'Passwords must be 4 - 20 characters long').isLength(4, 20);

  var errors = req.validationErrors(true);

  if (!errors) return next();

  res.render('signup', { message: '', errors: errors }); 
});

router.post('/signup', passport.authenticate('local-signup', {
    successRedirect: '/profile',
    failureRedirect: '/signup',
    failureFlash: true
  }));

// Profile Section
router.use('/profile', function(req, res, next) {  //middleware verification for Profile
  if (req.isAuthenticated()) return next();

  res.redirect('/');
 });
 
router.get('/profile', function(req, res) {
  res.render('profile', {
    user: req.user //get the user out of session and pass to template
  });
});

// Logout
router.get('/logout', function(req, res) {
  req.logout();
  res.redirect('/');
});

// Google Routes =============================================
router.get('/auth/google', passport.authenticate('google',  { scope: ['profile', 'email'] }));

router.get('/auth/google/callback', passport.authenticate('google', {
  successRedirect: '/profile',
  failureRedirect: '/'
}));

// Authorize (Already Logged In / Connect Other Accounts) ====

// Locally
router.get('/connect/local', function(req, res) {
  res.render('connect-local', { message: req.flash('loginMessage') });
}); 
router.post('/connect/local', passport.authenticate('local-signup', {
  successRedirect:'/profile',
  failureRedirect: '/connect/local',
  failureFlash: true
}));

// Googley
router.get('/connect/google', passport.authorize('google', { scope: ['profile', 'email'] }));

router.get('/connect/google/callback', passport.authorize('google', {
  successRedirect: '/profile',
  failureRedirect: '/'
}));

// Unlink Accounts ==========================================

// Local
router.get('/unlink/local', function(req, res) {
  var user = req.user;
  user.local.email = undefined;
  user.local.password = undefined;
  user.save(function(err) {
    res.redirect('/profile');
  });
});
// Google
router.get('/unlink/google', function(req, res) {
  var user = req.user;
  user.google.token = undefined;
  user.save(function(err) {
    res.redirect('/profile');
  });
});



module.exports = router;
