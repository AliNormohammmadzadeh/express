const express = require('express')
const router = express.Router();
const User = require('../models/User')
const bcrypt = require('bcryptjs')
const flash = require('connect-flash')
const passport = require('passport')


router.get("/", (req, res) => {
    res.render("index")
})
router.get('/login', (req, res) => {
    res.render("login")
})

router.get('/register', (req, res) => {
    res.render("register")
})

router.post('/register', (req, res) => {
    const { name, email, password, password2 } = req.body

    let errors = [];

    if (!name || !email || !password || !password2) {
        errors.push({ msg: "All fields Required" })
    }
    if (password !== password2) {
        errors.push({ msg: "Password not match!" })
    }
    if (password.length < 6) {
        errors.push({ msg: "Password should at least 6 characters" })
    }
    if (errors.length > 0) {
        res.render('register', { errors, name, email, password, password2 });
    } else {
        User.findOne({ email: email })
            .then(user => {
                if (user) {
                    errors.push({ msg: 'This email already exist' });
                    res.render('register', { errors, name, email, password, password2 });
                } else {
                    const newUser = new User({ name, email, password });

                    bcrypt.genSalt(10, (err, salt) => {
                        if (err) throw err;

                        bcrypt.hash(newUser.password, salt, (err, hash) => {
                            if (err) throw err;

                            newUser.password = hash;
                            newUser.save()
                                .then(user => {
                                    req.flash('success_msg', "You are now Register")
                                    res.redirect('login')
                                })
                                .catch(err => console.log(err))
                        })
                    })

                }

            }).catch(err => console.log(err))
    }
})

// login process
// router.post("/login", (req, res, next) => {
//     passport.authenticate('local', {
//         failureRedirect: '/users/login',
//         failureFlash: true
//     }), (req, res) => {
//         res.redirect('/dashboard', { login: true })
//         next()
//     }
// })

router.post("/login", (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/dashboard',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req, res, next);
});

//logout process
// router.get('/logout', function(req, res) {
//     req.logout()
//     req.flash('success_msg', 'You are Logged out');
//     res.redirect('/users/login');
// })
router.get('/logout', function(req, res, next) {
    req.logout(function(err) {
        if (err) { return next(err); }
        req.flash('success_msg', 'You are Logged out');
        res.redirect('/users/login');
    });
});

module.exports = router;