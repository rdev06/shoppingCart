const express = require('express');
const router = express.Router();
const Cart = require('../models/cart');

const Product = require('../models/product');
const Order = require('../models/order');

/* GET home page. */
router.get('/', async (req, res) => {
  const successMsg = req.flash('success')[0];
  const products = await Product.find().lean();
  const productChunks = [];
  const chunkSize = 3;
  for (let i = 0; i < products.length; i++) {
    productChunks.push(products.slice(i, i + chunkSize));
  }
  res.render('shop/index', {
    title: 'Products',
    products: productChunks,
    successMsg: successMsg,
    NoMessages: !successMsg
  });
});

router.get('/add-to-cart/:id', function (req, res) {
  const productId = req.params.id;
  const cart = new Cart(req.session.cart ? req.session.cart : {});

  Product.findById(productId, function (err, product) {
    if (err) {
      return res.redirect('/');
    }
    cart.add(product, product.id);
    req.session.cart = cart;
    res.redirect('/');
  });
});

router.get('/reduce/:id', function (req, res) {
  const productId = req.params.id;
  const cart = new Cart(req.session.cart ? req.session.cart : {});

  cart.reduceByOne(productId);
  req.session.cart = cart;
  res.redirect('/shopping-cart');
});

router.get('/remove/:id', function (req, res) {
  const productId = req.params.id;
  const cart = new Cart(req.session.cart ? req.session.cart : {});

  cart.removeItem(productId);
  req.session.cart = cart;
  res.redirect('/shopping-cart');
});

router.get('/shopping-cart', function (req, res) {
  if (!req.session.cart) {
    return res.render('shop/shopping-cart', {
      title: 'Cart',
      products: null
    });
  }
  const cart = new Cart(req.session.cart);
  res.render('shop/shopping-cart', {
    products: cart.generateArray(),
    totalPrice: cart.totalPrice
  });
});

router.get('/checkout', isLoggedIn, function (req, res) {
  if (!req.session.cart) {
    return res.redirect('/shopping-cart');
  }
  const cart = new Cart(req.session.cart);
  const errMsg = req.flash('error')[0];
  res.render('shop/checkout', {
    total: cart.totalPrice,
    errMsg: errMsg,
    noError: !errMsg
  });
});

router.post('/checkout', isLoggedIn, function (req, res) {
  if (!req.session.cart) {
    return res.redirect('/shopping-cart');
  }
  const cart = new Cart(req.session.cart);

  if (req.body.PaymentType == 'COD') {
    Order.create({
      user: req.user,
      cart: cart,
      address: req.body.address,
      name: req.body.name,
      type: 'COD'
    })
      .then(successResponse)
      .catch(errorResponse);
  } else if (req.body.PaymentType == 'CARD') {
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

    stripe.charges.create(
      {
        amount: cart.totalPrice * 100,
        currency: 'inr',
        source: req.body.stripeToken, // obtained with Stripe.js
        description: 'Test Charge'
      },
      function (err, charge) {
        if (err) {
          errorResponse();
          return;
        }
        Order.create({
          user: req.user,
          cart: cart,
          address: req.body.address,
          name: req.body.name,
          type: 'CARD',
          paymentId: charge.id
        })
          .then(successResponse)
          .catch(errorResponse);
      }
    );
  }
  function successResponse() {
    req.flash('success', 'Payement Successful');
    req.session.cart = null;
    res.redirect('/');
  }
  function errorResponse(err) {
    console.log(err);
    req.flash('error', 'We are unable to finalise the purchase');
    res.redirect('/checkout');
  }
});

module.exports = router;

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  req.session.oldUrl = req.url;
  res.redirect('/user/signin');
}
