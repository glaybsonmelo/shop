const bcrypt = require("bcrypt");
const sgMail = require("@sendgrid/mail");
// const sendgridTransport = require("nodemailer-sendgrid-transport");

const User = require("../models/User");

// const transporter = nodemailer.createTransport(sendgridTransport({
//     auth: {
//         api_key: process.env.SENDGRID_API_KEY
//     }
// }));
sgMail.setApiKey('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');

exports.getLogin = (req, res) => {
    let message = req.flash('error');
    message = message.length > 0 ? message[0] : undefined;
    res.render("auth/login", {
        pageTitle: "Login",
        path: "/login",
        isAuthenticated: req.session.user,
        errorMessage: message
    })
};

exports.postLogin = (req, res, next) => {
    const { email, password } = req.body;
    User.findOne({email}).then(user => {
        if(!user){
            req.flash("error", "Invalid email or password.");
            return res.redirect("/login");
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
            req.flash("error", "Invalid email or password.");
            res.redirect('/login');
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
        errorMessage: message
    });
};

exports.postSignup = (req, res) => {
    const { name, email, password, confirmPassword } = req.body;

    User.findOne({email})
    .then(userDoc => {
        if(userDoc){
            req.flash("error", "E-mail exists alredy, please pick a different one");
            return res.redirect("/signup");
        }

        bcrypt.hash(password, 10).then(hashedPassword => {
            const newUser = new User({
                name, email, password: hashedPassword, cart: { items:[] }
            })
            return newUser.save();
        }).then(() => {
            res.redirect("/login");
            const msg = {
                to: "glaybsonrrr@gmail.com",
                from: "jazjsgxmrv@eurokool.com",
                subject: "Signup succeeded!",
                text: "You successfully signed up!"
            } 
            sgMail.send(msg, (err, res) => {
                if(err) {
                    console.log(rr)
                }
                console.log("Success to",email);
            });
        }).catch(err => {
            console.log(err);
        });
   
    }).catch(err => console.log(err));
};

exports.postLogout = (req, res) => {
    req.session.destroy(err => {
        console.log(err);
        res.redirect("/");
    });
};
