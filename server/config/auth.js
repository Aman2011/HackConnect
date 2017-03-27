
exports.isLoggedIn = function (req, res, next) {
    if(req.isAuthenticated()) {
        next();
    } else {
        res.redirect('/login');
    }
}

exports.redirectIfLoggedIn = function(req, res, next) {
    if(req.isAuthenticated()) {
        res.redirect('/');
    } else {
        next();
    }
}


