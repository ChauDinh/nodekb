const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator/check');

// Bring in Article model
let Article = require('../models/article');
// Bring in User model
let User = require('../models/user');

// Add Route
router.get('/add', ensureAuthenticated, (req, res) => {
 res.render('add_article', {
  title: 'Add Article'
 });
});

// Add Submit POST Route
router.post('/add', [
 check('title').isLength({ min: 1 }).trim().withMessage('Title is required!'),
 // check('author').isLength({ min: 1 }).trim().withMessage('Author is required!'),
 check('body').isLength({ min: 1 }).trim().withMessage('Body is required!')
],(req, res, next) => {
 let article = new Article({
  title: req.body.title,
  author: req.body.author,
  body: req.body.body
 });
 
 const errors = validationResult(req);

 if (!errors.isEmpty()) {
  console.log(errors);
  res.render('add_article', {
   article: article,
   errors: errors.mapped()
  });
 } else {
  article.title = req.body.title;
  article.author = req.user._id;
  article.body = req.body.body;

  article.save(err => {
   if (err) throw err;
   req.flash('success', 'A New Article Added');
   res.redirect('/');
  });
 } 
});

// Load Edit Form
router.get('/edit/:id', ensureAuthenticated, function (req, res) {
 Article.findById(req.params.id, function (err, article) {
  if (article.author != req.user._id) {
   req.flash('danger', 'Not Authorized!');
   return res.redirect('/');
  }
  res.render('edit_article', {
   title: 'Edit Article',
   article: article
  });
 });
}); 

// Update Submit POST Route
router.post('/edit/:id', (req, res) => {
 let article = {};
 article.title = req.body.title;
 article.author = req.body.author;
 article.body = req.body.body;

 let query = { _id: req.params.id }

 Article.update(query, article, err => {
  if (err) {
   console.log(err);
   return;
  } else {
   req.flash('success', 'Article Updated');
   res.redirect('/');
  }
 })
});

// Delete Article
router.delete('/:id', (req, res) => {
 if (!req.user._id) {
  res.status(500).send();
 }

 let query = { _id: req.params.id }

 Article.findById(req.params.id, (err, article) => {
  if (article.author != req.user._id) {
   res.status(500).send();
  } else {
   Article.remove(query, err => {
    if (err) {
     console.log(err);
    }
    res.send('Success');
   });
  }
 });
});

// Get Single Article
router.get('/:id', (req, res) => {
 Article.findById(req.params.id, (err, article) => {
  User.findById(article.author, (err, user) => {
   res.render('article', {
    article: article,
    author: user.name
   });
  })
 });
});

// Access Control
function ensureAuthenticated(req, res, next) {
 if (req.isAuthenticated()) {
  return next();
 } else {
  req.flash('danger', 'Please login before submit article!');
  res.redirect('/users/login');
 }
}

module.exports = router;
