var auth = require('./auth'),
    users = require('../controllers/users'),
    chat = require('../controllers/chat'),
    request = require('../controllers/request'),
    notification = require('../controllers/notification'),
    hackathon = require('../controllers/hackathon'),
    emailVerification = require('../config/emailVerification'),
    User = require('mongoose').model('User');

module.exports = function (app, passport) {
    // sending json data for options
    app.get('/data/*', function (req, res) {
        var data = require('../data/'+req.params[0]);
        res.send(data);
    });

    //partials
    app.get('/partials/*', function (req, res) {
        res.render('../../public/app/' + req.params[0]);
    });

    app.get('/home', auth.isLoggedIn, users.isUserVerified, users.isProfileCreated, function (req, res) {
        res.render('index', {
            bootstrappedUser: req.user
        });
    });

    app.get('/create_profile', auth.isLoggedIn, users.isUserVerified, function (req, res) {
        res.render('create-profile', {
            bootstrappedUser: req.user
        });
    })
    app.post('/create_profile', users.createProfile);
    app.post('/create_profile/upload', auth.isLoggedIn, users.isUserVerified, users.uploadImage)

    app.get('/verify/:token', users.verifyEmail);

    app.get('/verify', function(req, res) {
       res.render('verify-email')
    });

    app.get('/login', auth.redirectIfLoggedIn, function(req, res) {
            res.render('login', { signUpMessage: req.flash('signUpError'), loginMessage: req.flash('error')});
    });
    app.post('/login', passport.authenticate('local-login', {
        successRedirect: '/home',
        failureRedirect: '/login',
        failureFlash: true
    }));
    app.post('/signup', users.createUser);
    app.post('/logout', function(req, res) {
        req.logout();
        res.send(true);
    });

    // forgot password
    app.post('/forgot-password', users.sendForgotPasswordEmail)
    app.get('/forgot-password/:token', users.verifyUser)
    app.get('/reset-password', function (req, res) {
        if(req.flash("valid")[0]) {
            res.render('reset-password');
            req.flash('valid', false);
        }
        else
            res.redirect('/login');
    })
    app.post('/reset-password', users.resetPassword)

    // linkedin auth routes
    app.get('/auth/linkedin', passport.authenticate('linkedin',{ scope: ['r_basicprofile', 'r_emailaddress'], state: 'SOME LINKEDIN STATE'}));

    app.get('/auth/linkedin/callback',
        passport.authenticate('linkedin', {successRedirect: '/home',
        failureRedirect: '/login',
        failureFlash: true}));


    //ajax
    app.get('/resendVerificationLink', emailVerification.resendVerificationLink)

    app.get('/profile/data', auth.isLoggedIn, users.isUserVerified, function (req, res) {
        users.getProfileData(req.user._id, function(data) {
            res.send(JSON.stringify(data));
        })
    })
    app.get('/profile/similar', auth.isLoggedIn, users.isUserVerified, function(req, res){
        users.getSimilarUsers(req.user, res)
    })
    app.get('/profile/hackathons', auth.isLoggedIn, function (req, res) {
        users.getHackathons(req.user._id, res);
    })
    app.get('/profile/connections', auth.isLoggedIn, function (req, res) {
        users.getConnections(req.user._id, res);
    })
    app.get('/profile/data/:id', auth.isLoggedIn, users.isUserVerified, users.isProfileCreated, function (req, res) {
        var id = req.params.id;
        users.getProfileData(id, function(data) {
            res.send(JSON.stringify(data));
        })
    })
    app.get('/profile/notifications', auth.isLoggedIn, users.isUserVerified, users.getAllNotifications)
    app.post('/profile/notifications/read', auth.isLoggedIn, notification.markNotificationAsRead)
    app.post('/profile/requests/read', auth.isLoggedIn, request.markRequestAsRead)
    app.post('/profile/conversations/old', auth.isLoggedIn, chat.markConversationAsOld)


    //api routes
    app.get('/api/users', auth.isLoggedIn, users.isUserVerified, users.getUsers);
    app.get('/api/users/user', auth.isLoggedIn, users.isUserVerified, users.getUserData);
    app.get('/user/connection-status/:id', auth.isLoggedIn, users.getConnectionStatus);
    app.get('/api/users/search', auth.isLoggedIn, users.search);
    app.get('/user/hackathons/:id', auth.isLoggedIn, function (req, res) {
        users.getHackathons(req.params.id, res);
    })
    app.get('/user/connections/:id', auth.isLoggedIn, function (req, res) {
        users.getConnections(req.params.id, res);
    })
    app.get('/user/similar/:id', auth.isLoggedIn, function (req, res) {
        User.findById(req.params.id, function (err, user) {
            if(err) console.log(err);
            if(user) {
                users.getSimilarUsers(user, res);
            }
            else
                res.send(false);
        })
    })
    //message routes
    app.get('/messages', auth.isLoggedIn, chat.getConversations)
    app.get('/messages/:conversationId', auth.isLoggedIn, chat.getConversation)
    app.post('/messages/send/:recipient', auth.isLoggedIn, chat.sendMessage)
    app.post('/messages/:conversationId/read', auth.isLoggedIn, chat.markConversationAsRead)

    //connection routes
    app.post('/connections/send/:recipient', auth.isLoggedIn, request.sendRequest)
    app.post('/connections/accept/:sender', auth.isLoggedIn, request.acceptRequest)
    app.post('/connections/reject/:id', auth.isLoggedIn, request.rejectRequest)
    app.post('/connections/notify/:recipient', auth.isLoggedIn, notification.sendNotification)
    // hackathon routes
    app.get('/api/hackathons', auth.isLoggedIn, hackathon.getHackathons)
    app.get('/api/hackathons/hackathon', auth.isLoggedIn, hackathon.getHackathon)
    app.get('/api/hackathons/search', auth.isLoggedIn, hackathon.search);

    app.get('/hackathon/getTeam/:hackathon', auth.isLoggedIn, hackathon.findPotentialTeammates)
    app.get('/hackathon/participants', auth.isLoggedIn, hackathon.getParticipants)
    app.post('/hackathon/attend/:hackathon', auth.isLoggedIn, hackathon.attendHackathon)

    // default route
    app.get('*', auth.isLoggedIn, users.isUserVerified, users.isProfileCreated, function (req, res) {
        res.render('index', {
            bootstrappedUser: req.user
        });
    });

    app.post('/profile/data/update', auth.isLoggedIn, users.updateProfile)
    app.post('/profile/upload', auth.isLoggedIn, users.isUserVerified, users.uploadImage)
}
