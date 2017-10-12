// load all the things we need
var LocalStrategy   = require('passport-local').Strategy;


// load up the user model
var authResourceUtil = require('./library/authResourceUtil');


// definitions
module.exports = function(passport){
    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        // console.log('passport.serializeUser', user);
        done(null, user.email);
    });

    // used to deserialize the user
    passport.deserializeUser(function(email, done) {
        // console.log('passport.deserializeUser', email);

        authResourceUtil.findLocalUser(email)
            .then(function(user) {
                if(user.length > 0){
                    // console.log('found', email, user);
                    done(null, user[0]);
                } else {
                    // console.log('not found', email, user);
                    done('not found...', null);
                }
            });
    });




    // =========================================================================
    // LOCAL SIGNUP ============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'
    passport.use('local-signup', new LocalStrategy({
            // by default, local strategy uses username and password, we will override with email
            usernameField : 'email',
            passwordField : 'password',
            passReqToCallback : true // allows us to pass back the entire request to the callback
        },
        function(req, email, password, done) {
            email = email || '';
            password = password || '';
            var firstName = req.body.firstName || '';
            var lastName = req.body.lastName || '';

            if(!email || !password || !firstName || !lastName){
                return done(null, false, req.flash('signupMessage', 'Email, First Name, Last Name and Password are all required.'));
            }


            // find a user whose email is the same as the forms email
            // we are checking to see if the user trying to login already exists
            authResourceUtil.findLocalUser(email)
                .then(function(user){
                    // TODO: remove console.log
                    // console.log(email)
                    if (user.length > 0) {
                        return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
                    } else {
                        return authResourceUtil.createUserLocal(email, firstName, lastName, password)
                            .then(function(newUser){
                                // console.log('done',email, newUser)
                                return done(null, newUser);
                            });
                    }
                })
        })
    );


    passport.use('local-login', new LocalStrategy({
            // by default, local strategy uses username and password, we will override with email
            usernameField : 'email',
            passwordField : 'password',
            passReqToCallback : true // allows us to pass back the entire request to the callback
        },
        function(req, email, password, done) { // callback with email and password from our form
            authResourceUtil.findLocalUserByEmailAndPassword(email, password)
                .then(function(user) {
                    if(user.length > 0){
                        return done(null, user[0]);
                    } else {
                        return done(null, false, req.flash('loginMessage', 'No user found.')); // req.flash is the way to set flashdata using connect-flash
                    }
                });
        }
    ));


}
