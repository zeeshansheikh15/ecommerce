var passport = require('passport');
var users = require('../models/user');
var admins = require('../models/admin');
var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;

var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var configAuth = require('../config/auth')

passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(function (id, done) {
    users.findById(id, function (err, user) {
       done(err, user);
    });
});
passport.use('localsignup', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, function (req, email, password, done) {
    req.checkBody('email', 'Invalid email').notEmpty().isEmail();
    req.checkBody('password', 'Invalid password').notEmpty().isLength({min:4});
    var errors = req.validationErrors();
    if(errors){
        var messages = [];
        errors.forEach(function (error) {
            message.push(error.msg);
        });
        return done(null, false, req.flash('error', messages));
    }
    users.findOne({'local.email': email}, function (err, user) {
        if(err){
            return done(err);
        }
        if(user){
            return done(null, false, {message: 'email already exists'});
        }
        var newuser = new users();
        newuser.local.email = email;
        newuser.local.password = newuser.encryptPassword(password);
        newuser.save(function (err, result) {
            if(err){
                return done(err);
            }
            return done(null, newuser);
        });
    });
}));

passport.use('localsignin', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, function (req, email, password, done) {
    req.checkBody('email', 'Invalid email').notEmpty().isEmail();
    req.checkBody('password', 'Invalid password').notEmpty().isLength({min:4});
    var errors = req.validationErrors();
    if(errors){
        var messages = [];
        errors.forEach(function (error) {
            message.push(error.msg);
        });
        return done(null, false, req.flash('error', messages));
    }
    users.findOne({'local.email': email}, function (err, user) {
        if(err){
            return done(err);
        }
        if(!user){
            return done(null, false, {message: 'no user found'});
        }
        if(!user.validPassword(password)){
            return done(null, false, {message: 'wrong password'});
        }
        return  done(null, user);
    });
}));


passport.use('adminsignup', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, function (req, email, password, done) {
    req.checkBody('email', 'Invalid email').notEmpty().isEmail();
    req.checkBody('password', 'Invalid password').notEmpty().isLength({min:4});
    var errors = req.validationErrors();
    if(errors){
        var messages = [];
        errors.forEach(function (error) {
            message.push(error.msg);
        });
        return done(null, false, req.flash('error', messages));
    }
    admins.findOne({'email': email}, function (err, user) {
        if(err){
            return done(err);
        }
        if(user){
            return done(null, false, {message: 'email already exists'});
        }
        var newuser = new admins();
        newuser.email = email;
        newuser.password = newuser.encryptPassword(password);
        newuser.save(function (err, result) {
            if(err){
                return done(err);
            }
            return done(null, newuser);
        });
    });
}));

passport.use('adminsignin', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, function (req, email, password, done) {
    req.checkBody('email', 'Invalid email').notEmpty().isEmail();
    req.checkBody('password', 'Invalid password').notEmpty().isLength({min:4});
    var errors = req.validationErrors();
    if(errors){
        var messages = [];
        errors.forEach(function (error) {
            message.push(error.msg);
        });
        return done(null, false, req.flash('error', messages));
    }
    admins.findOne({'email': email}, function (err, user) {
        if(err){
            return done(err);
        }
        if(!user){
            return done(null, false, {message: 'no admin found'});
        }
        if(!user.validPassword(password)){
            return done(null, false, {message: 'wrong password'});
        }
        return  done(null, user);
    });
}));

passport.use(new FacebookStrategy({
        clientID: configAuth.facebookAuth.clientID,
        clientSecret: configAuth.facebookAuth.clientSecret,
        callbackURL: configAuth.facebookAuth.callbackURL
    },
    function(accessToken, refreshToken, profile, done) {
        process.nextTick(function(){
            users.findOne({'facebook.id': profile.id}, function(err, user){
                if(err)
                    return done(err);
                if(user)
                    return done(null, user);
                else {
                    var newUser = new users();
                    newUser.facebook.id = profile.id;
                    newUser.facebook.token = accessToken;
                    newUser.facebook.name = profile.name.givenName + ' ' + profile.name.familyName;
                    newUser.facebook.email = profile.emails[0].value;

                    newUser.save(function(err){
                        if(err)
                            throw err;
                        return done(null, newUser);
                    })
                    console.log(profile);
                }
            });
        });
    }

));

passport.use(new GoogleStrategy({
        clientID: configAuth.googleAuth.clientID,
        clientSecret: configAuth.googleAuth.clientSecret,
        callbackURL: configAuth.googleAuth.callbackURL
    },
    function(accessToken, refreshToken, profile, done) {
        process.nextTick(function(){
            users.findOne({'google.id': profile.id}, function(err, user){
                if(err)
                    return done(err);
                if(user)
                    return done(null, user);
                else {
                    var newUser = new users();
                    newUser.google.id = profile.id;
                    newUser.google.token = accessToken;
                    newUser.google.name = profile.displayName;
                    newUser.google.email = profile.emails[0].value;

                    newUser.save(function(err){
                        if(err)
                            throw err;
                        return done(null, newUser);
                    })
                    console.log(profile);
                }
            });
        });
    }

));