var express = require('express'),
    less = require('less-middleware'),
    logger = require('morgan'),
    bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser'),
    session = require('express-session'),
    passport = require('passport'),
    flash = require('connect-flash'),
    auth = require('./auth');

module.exports = function(app, config) {
    app.set('views', config.rootPath + '/server/views');
    app.set('view engine', 'pug');
    app.use(logger('dev'));
    app.use(cookieParser());
    app.use(bodyParser.urlencoded({extended: true}));
    app.use(bodyParser.json());
    app.use(session({secret: 'hack connect works', resave: true, saveUninitialized:true}));
    app.use(flash());
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(less(config.rootPath + '/public', {compress: true}));
    app.use(express.static(config.rootPath + '/public'));
    app.use('/uploads', auth.isLoggedIn);
    app.use('/uploads', express.static(config.rootPath + '/uploads'));


}