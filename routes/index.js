var express = require('express');
var router = express.Router();
var Cart  = require('../models/cart')
var admins = require('../models/admin');
var csrf = require('csurf');
var user = require('../models/user');
var passport = require('passport');
var order = require('../models/order');
var items = require('../models/item');
var orders = require('../models/order');
var item = require('../models/item');

var csrftoken = csrf();

router.use(csrftoken);
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'website' });
});

router.get('/apple', function(req, res, next) {
    var iphones = items.find(function (err, result) {

        var array=[];
        for(i=0;i<result.length;i+=4){
         array.push(result.slice(i,i+4));
        }
        res.render('partials/below', { title: 'website', items: array });
    });

});

router.get('/signup',notLoggedin, function(req, res, next) {
    var messages = req.flash('error');
    res.render('signup', { csrftoken: req.csrfToken() , messages: messages, hasErrors: messages.length > 0});
});

router.post('/signup', passport.authenticate('localsignup', {
    failureRedirect: '/signup',
    failureFlash: true
}), function (req, res, next) {
    if(req.session.oldUrl){
        var prevurl = req.session.oldUrl;
        req.session.oldUrl=null;
        res.redirect(prevurl);
    }
    else{
        res.redirect('/login');
    }
});

router.get('/login',notLoggedin, function(req, res, next) {
    var messages = req.flash('error');
    res.render('login', { csrftoken: req.csrfToken() , messages: messages, hasErrors: messages.length > 0});
});

router.post('/login', passport.authenticate('localsignin', {
    failureRedirect: '/login',
    failureFlash: true
}), function (req, res, next) {
    if(req.session.oldUrl){
        var prevurl = req.session.oldUrl;
        req.session.oldUrl=null;
        res.redirect(prevurl);
    }
    else{
        res.redirect('/profile');
    }
});

router.get('/logout',function(req, res, next){
    req.logout();
    res.redirect('/');
});



router.get('/addtocart/:id', function (req, res, next) {
    var itemid = req.params.id;
    var cart = new Cart(req.session.cart ? req.session.cart : {});

    items.findById(itemid, function (err, item) {
        if(err){
            return res.redirect('/');
        }
         cart.add(item, itemid);
        req.session.cart = cart;
        console.log(req.session.cart);
        res.redirect('/apple')
    } );
});


router.get('/cart', isLoggedin,function(req, res, next) {
    if(!req.session.cart){
        return res.render('cart', { items: null  });
    }
        var cart = new Cart(req.session.cart);
        res.render('cart', { items: cart.generateArray(), totalqty: cart.totalqty, netprice: cart.totalprice  });
    console.log(req.session.cart);
   });



router.get('/checkout',isLoggedin, function (req, res, next) {
    if(!req.session.cart){
        return res.redirect('/cart');
    }
    var cart = new Cart(req.session.cart);
    var errMsg = req.flash('error')[0];
    res.render('checkout',{ csrftoken: req.csrfToken(), total: cart.totalprice, errMsg: errMsg, noError: !errMsg});
});

router.post('/checkout', function (req, res, next) {
    if(!req.session.cart){
        return res.redirect('/cart');
    }
    var cart = new Cart(req.session.cart);

    var stripe = require("stripe")("sk_test_TRm2og8abIPKZbHbDEa9zJ97");
    stripe.charges.create({
        amount: cart.totalprice * 100,
        currency: "usd",
        source: "tok_mastercard",
        description:"charge"
    }, function (err, charge) {
        if(err){
            req.flash('error', err.message);
            return res.redirect('/checkout');
        }
        var neworder = new order({
            user: req.user,
            cart: cart,
            address: req.body.address,
            name: req.body.name,
            paymentId: charge.id
        });

        neworder.save(function (err, result) {
            if(err){
                res.redirect('/',{error: 'order not saved'});
            }
            req.flash('success', 'good to go');
            req.session.cart = null;
            res.redirect('/profile');
        });

    });
});

router.get('/adminsignup',notLoggedin, function(req, res, next) {
    var messages = req.flash('error');
    res.render('adminsignup', { csrftoken: req.csrfToken() , messages: messages, hasErrors: messages.length > 0});
});

router.post('/adminsignup', passport.authenticate('adminsignup', {
    failureRedirect: '/adminsignup',
    failureFlash: true
}), function (req, res, next) {
    if(req.session.oldUrl){
        var prevurl = req.session.oldUrl;
        req.session.oldUrl=null;
        res.redirect(prevurl);
    }
    else{
        res.redirect('/adminlogin');
    }
});

router.get('/adminlogin',notLoggedin, function(req, res, next) {
    var messages = req.flash('error');
    res.render('adminlogin', { csrftoken: req.csrfToken() , messages: messages, hasErrors: messages.length > 0});
});

router.post('/adminlogin', passport.authenticate('adminsignin', {
    failureRedirect: '/adminlogin',
    failureFlash: true
}), function (req, res, next) {
    if(req.session.oldUrl){
        var prevurl = req.session.oldUrl;
        req.session.oldUrl=null;
        res.redirect(prevurl);
    }
    else{
        res.redirect('/adminhome');
    }
});

router.get('/logout',function(req, res, next){
    req.logout();
    res.redirect('/');
});

router.get('/adminhome',function(req, res, next){
    res.render('adminhome');
});

router.get('/itemform',function(req, res, next){
    res.render('itemform',{ csrftoken: req.csrfToken()});
});

router.post('/itemform',function(req, res, next){
    var newitem = new item({
        name: req.body.name,
        type: req.body.type,
        brand: req.body.brand,
        title: req.body.title,
        imagePath: req.body.imagePath,
        quantity: req.body.quantity,
        price: req.body.price,
        description: req.body.description
    });
    newitem.save(function (err, result) {
        if(err){
            console.log(err);
        }
        req.flash('success', 'good to go');
        res.redirect('/adminhome');
    });
});


router.get('/vieworders',function(req, res, next){
    var order = orders.find(function (err, result) {
       // var ordercart = new Cart(result.cart);
        res.render('vieworders', { orders: result });
    });
});


//-----------------------facebook----------------------------------

router.get('/auth/facebook', passport.authenticate('facebook',{ scope: ['email'] }));

router.get('/auth/facebook/callback',
    passport.authenticate('facebook', { successRedirect: '/profile',
        failureRedirect: '/' }));


//-----------------------google--------------------------------------
router.get('/auth/google', passport.authenticate('google',{ scope: ['email','profile'] }));

router.get('/auth/google/callback',
    passport.authenticate('google', { successRedirect: '/profile',
        failureRedirect: '/' }));

//-----------------------twitter--------------------------------------
router.get('/auth/twitter', passport.authenticate('twitter',{ scope: ['email','profile'] }));

router.get('/auth/twitter/callback',
    passport.authenticate('twitter', { successRedirect: '/profile',
        failureRedirect: '/' }));

//--------------------------xxxx--------------------------------------
router.get('/profile',isLoggedin, function (req, res, next) {
    var successMsg = req.flash('success')[0];

    res.render('profile',{successMsg: successMsg, noMessages: !successMsg, user: req.user});
});
module.exports = router;



function isLoggedin(req, res, next) {
    if(req.isAuthenticated()){
        return next();
    }
    req.session.oldUrl = req.url;
    res.redirect('/login');
}

function notLoggedin(req, res, next) {
    if(!req.isAuthenticated()){
        return next();
    }

    res.redirect('/profile');
}