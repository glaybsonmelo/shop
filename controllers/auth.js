const bcrypt = require("bcrypt");
const sgMail = require("@sendgrid/mail");
const crypto = require("crypto");
const { validationResult } = require("express-validator");

const User = require("../models/User");

require('dotenv').config();

sgMail.setApiKey(process.env.SGMAIL_API_KEY);

exports.getLogin = (req, res) => {
    let message = req.flash('error');
    message = message.length > 0 ? message[0] : undefined;
    res.render("auth/login", {
        pageTitle: "Login",
        path: "/login",
        isAuthenticated: req.session.user,
        errorMessage: message,
        oldInput: { email: '', password: '' },
        validationErrors: []
    })
};

exports.postLogin = (req, res, next) => {
    const { email, password } = req.body;
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        return res.status(422).render("auth/login", {
            pageTitle: "Login",
            path: "/login",
            isAuthenticated: req.session.user,
            errorMessage: errors.array()[0].msg,
            oldInput: { email, password },
            validationErrors: errors.array()
        })
    }
    User.findOne({email}).then(user => {
        if(!user){
            return res.status(422).render("auth/login", {
                pageTitle: "Login",
                path: "/login",
                isAuthenticated: req.session.user,
                errorMessage: "Invalid email or password.",
                oldInput: { email, password },
                validationErrors: [{ param: 'email'}, {param: 'password'}]
            })
        }
        bcrypt.compare(password, user.password).then(doMatch => {
            if(doMatch){
                req.session.user = user;
                req.session.isLoggedIn = true;
                // Garantir que só redicionarei apos a sessão for salva no db (evitar não carregamentos de dados no front)
                return req.session.save(err => {
                    console.log(err);
                    res.redirect("/");
                });
            }
            return res.status(422).render("auth/login", {
                pageTitle: "Login",
                path: "/login",
                isAuthenticated: req.session.user,
                errorMessage: "Invalid email or password.",
                oldInput: { email, password },
                validationErrors: [{ param: 'email'}, { param: 'password' }]
            })
        }).catch(err => {
            res.redirect("/login");
        });
    }).catch(err => console.log(err));
};

exports.getSignup = (req, res) => {
    let message = req.flash('error');
    message = message.length > 0 ? message[0] : undefined;
    res.render("auth/signup", {
        pageTitle: "Signup",
        path: "/signup",
        isAuthenticated: req.session.isLoggedIn,
        errorMessage: message,
        oldInput: { name: "", email: "", password: "", confirmPassword: "" },
        validationErrors: []
    });
};

exports.postSignup = (req, res) => {
    const { name, email, password, confirmPassword } = req.body;
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        console.log(errors.array())
        return res.status(422).render("auth/signup", {
            pageTitle: "Sign Up",
            path: "/signup",
            isAuthenticated: req.session.user,
            errorMessage: errors.array()[0].msg,
            oldInput: { name, email, password, confirmPassword },
            validationErrors: errors.array()
        })
    }

    bcrypt.hash(password, 10).then(hashedPassword => {
        const newUser = new User({
            name, email, password: hashedPassword, cart: { items:[] }
        })
        return newUser.save();
    }).then(() => {
        res.redirect("/login");
        const msg = {
            to: email,
            from: "gleybsonmelo998@gmail.com",
            subject: "Signup succeeded!",
            text: "You successfully signed up!"
        } 
        sgMail.send(msg, (err, res) => {
            if(err) {
                console.log(err)
            }
        });
    }).catch(err => {
        console.log(err);
    });
};

exports.postLogout = (req, res) => {
    req.session.destroy(err => {
        console.log(err);
        res.redirect("/");
    });
};

exports.getReset = (req, res) => {
    let message = req.flash("error");
    message = message.length > 0 ? message[0] : undefined
    res.render("auth/reset", {
        pageTitle: "Reset Password",
        path: "/reset",
        errorMessage: message
    });
};

exports.postReset = (req, res) => {
    const { email } = req.body;
    crypto.randomBytes(32, (err, buffer) => {
        if(err) {
            console.log(err);
            return res.redirect("/reset");
        }
        const token = buffer.toString('hex');
        User.findOne({email})
        .then(user => {
            if(!user){
                req.flash("error", "No account with that email found.");
                return res.redirect("/reset");
            }
            user.resetToken= token;
            user.resetTokenExpiration = 3600000; // 1 hour
            return user.save();
        }).then(() => {
            res.redirect('/');
            const msg = {
                to: email,
                from: "gleybsonmelo998@gmail.com",
                subject: "Password reset",
                html:  `<p>You request a password reset</p>
                        <p>Click this  <a href="http://localhost:3000/reset/${token}">Link</a> to set a new password.</p>`
            }
            sgMail.send(msg, (err, res) => {
                if(err) {
                    console.log(err)
                }
                console.log("Success to",email);
            });
        }).catch(err => console.log(err));
    });
};

exports.getNewPassword = (req, res) => {
    const token = req.params.token;
    // resetTokenExpiration: {$gt: Date.now()}
    User.findOne({resetToken: token})
    .then(user => {
        if(!user) return res.redirect("/login");

        let message = req.flash("error");
        message = message.length > 0 ? message[0] : undefined;
        res.render("auth/new-password", {
            pageTitle: "New password",
            path: "/new-password",
            errorMessage: message,
            userId: user._id,
            passwordToken: token
        });
    })
    .catch(err => console.log(err));
}

exports.postNewPassword = (req, res) => {
    const { password, userId, passwordToken } = req.body;
    let resetUser;
    User.findOne({_id: userId, resetToken: passwordToken, resetTokenExpiration: {$gt: Date.now()}})
    .then(user => {
        resetUser = user;
        return bcrypt.hash(password, 12)

    }).then(hashedPassword => {
        resetUser.password = hashedPassword;
        resetUser.resetToken = undefined;
        resetUser.resetTokenExpiration = undefined;
        return resetUser.save();
    }).then(() => {
        res.redirect("/login");
    }).catch(err => console.log(err)).catch(err => {
        console.log(err);
    })
}