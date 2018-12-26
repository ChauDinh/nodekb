const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator/check');
const bcrypt = require('bcryptjs');
const passport = require('passport');

// Bring in User Model
let User = require('../models/user');

// Register Form
router.get('/register', (req, res) => {
 res.render('register');
})

// Register Process
router.post('/register', [
 check('name').isLength({ min: 1 }).trim().withMessage('Name is required!'),
 check('email').isEmail().trim().withMessage('Email is not valid'),
 check('email').isLength({ min: 1 }).trim().withMessage('Email is required!'),
 check('username').isLength({ min: 1 }).trim().withMessage('Username is required!'),
 check('password').isLength({ min: 1 }).trim().withMessage('Password is required!'),
 check('password2', 'Passwords do not match')
        .isLength({ min: 1 })
        .custom((value,{req, loc, path}) => {
            if (value !== req.body.password) {
                // throw error if passwords do not match
                throw new Error("Passwords don't match");
            } else {
                return value;
            }
        })

], (req, res, next) => {
 let newUser = new User({
  name: req.body.name,
  email: req.body.email,
  username: req.body.username,
  password: req.body.password,
 });

 const errors = validationResult(req);

 if (!errors.isEmpty()) {
  console.log(errors);
  res.render('register', {
   newUser: newUser,
   errors: errors.mapped()
  });
 } else {
  newUser.name = req.body.name;
  newUser.email = req.body.email;
  newUser.username = req.body.username;
  newUser.password = req.body.password;

  bcrypt.genSalt(10, (err, salt) => {
   bcrypt.hash(newUser.password, salt, (err, hash) => {
    if (err) {
     console.log(err);
    }
    newUser.password = hash;
    newUser.save(err => {
     if (err) {
       console.log(err);
     } else {
      req.flash('success', 'Your registration is finish and now you can login');
      res.redirect('/users/login');
     }
    });
   });
  });
  
 }
});

// Login Form
router.get('/login', (req, res) => {
    res.render('login');
});

// Login Process
router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req, res, next);
})

// Logout
router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success', 'You are logged out');
    res.redirect('/users/login');
})

module.exports = router;