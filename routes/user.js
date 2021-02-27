const express = require('express');
const router = express.Router();
const csrf = require('csurf');
const passport = require('passport');

const Order = require('../models/order');
const Cart = require('../models/cart');
const User = require('../models/user');

const csrfProtection = csrf();

router.post('/removeUser', function (req, res) {
  User.findOneAndRemove({ email: req.user.email }, function (err, success) {
    if (err) {
      console.log(err.message);
      req.flash('error', 'Falha ao Remove usuário!');
    }
    if (success) {
      req.flash('success', 'Usuário removido com sucesso!');
      res.redirect('/');
    }
  });
});

router.use(csrfProtection);

router.get('/profile', isLoggedIn, async (req, res) => {
  try {
    const orders = await Order.find({
      user: req.user
    }).lean();
    let cart;
    orders.forEach(function (order) {
      cart = new Cart(order.cart);
      order.items = cart.generateArray();
    });
    res.render('user/profile', {
      csrfToken: req.csrfToken(),
      orders: orders,
      user: req.user._doc
    });
  } catch (error) {
    res.write('Error!', error);
  }
});

router.post('/profile', function (req, res) {
  if (req.body.email) {
    User.findOne(
      {
        email: req.body.email
      },
      function (err, doc) {
        if (err) {
          req.flash('error', 'falhou');
          console.log(err);
        }

        doc.email = req.body.email;
        doc.name = req.body.name;
        doc.state = req.body.state;
        doc.city = req.body.city;

        doc.save();
      }
    );
  } else {
    console.log('email inválido');
  }

  if (req.session.oldUrl) {
    const oldUrl = req.session.oldUrl;
    req.session.oldUrl = null;
    res.redirect(oldUrl);
  } else {
    res.redirect('/user/profile');
  }

  res.end();
});

router.get('/logout', isLoggedIn, function (req, res) {
  req.logout();
  res.redirect('/');
});

router.get('/signup', function (req, res) {
  const messages = req.flash('error');
  res.render('user/signup', {
    csrfToken: req.csrfToken(),
    messages: messages,
    hasErrors: messages.length > 0
  });
});

router.post(
  '/signup',
  passport.authenticate('local.signup', {
    failureRedirect: '/user/signup',
    failureFlash: true
  }),
  function (req, res) {
    if (req.session.oldUrl) {
      const oldUrl = req.session.oldUrl;
      req.session.oldUrl = null;
      res.redirect(oldUrl);
    } else {
      res.redirect('/user/profile');
    }
  }
);

router.get('/signin', function (req, res) {
  const messages = req.flash('error');
  res.render('user/signin', {
    csrfToken: req.csrfToken(),
    messages: messages,
    hasErrors: messages.length > 0
  });
});

router.post(
  '/signin',
  passport.authenticate('local.signin', {
    failureRedirect: '/user/signin',
    failureFlash: true
  }),
  function (req, res) {
    if (req.session.oldUrl) {
      const oldUrl = req.session.oldUrl;
      req.session.oldUrl = null;
      res.redirect(oldUrl);
    } else {
      res.redirect('/user/profile');
    }
  }
);

router.use('/', notLoggedIn, function (req, res, next) {
  next();
});

module.exports = router;

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/');
}

function notLoggedIn(req, res, next) {
  if (!req.isAuthenticated()) {
    return next();
  }
  res.redirect('/');
}
