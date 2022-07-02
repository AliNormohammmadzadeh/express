const localSterategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('../models/User')

module.exports = function(passport) {
    passport.use(
        new localSterategy({ usernameField: 'email' }, (email, password, done) => {
            // match uesr 
            User.findOne({ email: email })
                .then(user => {
                    if (!user)
                        return done(null, false, { message: "That email not Registered" })
                    bcrypt.compare(password, user.password, (err, isMatch) => {
                        if (err)
                            throw (err)
                        if (isMatch) {
                            return done(null, user)
                        }
                        return done(null, false, { message: "Passwrod incorrect ! not Registered" });
                    })
                }).catch(err => console.log(err));
        })
    );

    passport.serializeUser((user, done) => {
        done(null, user.id);
    });
    passport.deserializeUser((id, done) => {
        User.findById(id, (err, user) => {
            done(err, user)
        });
    });
}