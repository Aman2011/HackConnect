var LocalStrategy = require('passport-local').Strategy,
     LinkedInStrategy = require('passport-linkedin').Strategy,
     mongoose = require('mongoose'),
     User = mongoose.model('User');



 module.exports = function(passport, config) {

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });

    passport.use('local-login', new LocalStrategy({
            // by default, local strategy uses username and password, we will override with email
            usernameField : 'email',
            passwordField : 'password',
            passReqToCallback : true
        },
        function(req, email, password, done) {
            if (email)
                email = email.toLowerCase();

            // asynchronous
            process.nextTick(function() {
                User.findOne({ email :  email }, function(err, user) {
                    if(user && user.authenticate(password)){
                        return done(null, user);
                    } else {
                        return done(null, false, {message: "incorrect email or password"});
                    }
                });
            });

        }));

    passport.use(new LinkedInStrategy({
        consumerKey       : config.linkedInAuth.clientID,
        consumerSecret    : config.linkedInAuth.clientSecret,
        callbackURL     : config.linkedInAuth.callbackURL,
        profileFields: ['id', 'first-name', 'last-name','summary', 'positions', 'email-address', 'location','picture-urls::(original)'],
        state: true
    }, function (accessToken, refreshToken, profile, done) {
        process.nextTick(function () {
            User.findOne({'linkedIn.id': profile.id}, function (err, user) {
                if (err) return done(err);

                if(user) {
                    return done(null, user);
                } else {
                    var newUser = new User();
                    var profileJson = profile._json;
                    var location = profileJson.location.name;
                    var position = profileJson.positions.values && profileJson.positions.values.length > 0 ? profileJson.positions.values[0]:false;
                    var picture = profileJson.pictureUrls.values && profileJson.pictureUrls.values.length > 0 ? profileJson.pictureUrls.values[0]:false;
                    newUser.linkedIn.id = profileJson.id;
                    newUser.linkedIn.token = accessToken;
                    newUser.name = profileJson.firstName + " " + profileJson.lastName;
                    newUser.email = profileJson.emailAddress;
                    newUser.profile.address.country = location.substring(location.lastIndexOf(",")+1, location.length).trim();
                    newUser.profile.address.city = location.substring(0, location.indexOf(","));
                    newUser.profile.picture = picture?picture:"../img/default-profile-pic.png";
                    newUser.profile.employment.company = position ? position.company.name : "";
                    newUser.profile.employment.job_title = position? position.title : "";
                    newUser.profile.bio = profileJson.summary;
                    newUser.verify = true;
                    newUser.save(function (err, user) {
                        if (err)
                            throw err;

                        // if successful, return the new user
                        return done(null, user);
                    })

                }
            })
        })
    }))
};
