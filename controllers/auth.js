const User = require("../models/User");
const bcrypt = require("bcrypt");


exports.auth = (req, res, next) => {
    if (req.session.isLoggedIn){
        return next();
    }
    res.redirect("/login");

}

exports.getLogin = (req, res) => {
    res.render("auth/login", {
        pageTitle: "Login",
        path: "/login",
        isAuthenticated: req.session.user
    })
};

exports.postLogin = (req, res, next) => {
    const { email, password } = req.body;
    if(password == "" || email == "" ){
        res.redirect("/login");
    }
    User.find({email}).then( async ([user]) => {
        const result = await bcrypt.compare(password, user.password);
        if(result){
            req.session.user = user;
            req.session.isLoggedIn = true;
            // Garantir que só redicionarei apos a sessão for salva no db (evitar não carregamentos de dados no front)
            return req.session.save(err => {
                console.log(err);
                res.redirect("/");
            })
        }else
            res.redirect("/login");
    }).catch(err => console.log(err));
};

exports.getSignup = (req, res) => {
    res.render("auth/signup", {
        pageTitle: "Signup",
        path: "/signup",
        isAuthenticated: req.session.isLoggedIn
    });
};

exports.postSignup = (req, res) => {
    const { name, email, password, confirmPassword } = req.body;

    const userInDB = User.findOne({email})
    .then(userDoc => {
        if(userDoc)
            return res.redirect("/signup");

        return bcrypt.hash(password, 10);
   
    }).then(hashedPassword => {
        const newUser = new User({
            name, email, password: hashedPassword, cart: { items:[] }
        })
        return newUser.save();
    }).then(() => {
        return res.redirect("/");
    }).catch(err => console.log(err));
};

exports.postLogout = (req, res) => {
    req.session.destroy(err => {
        console.log(err);
        res.redirect("/");
    });
};
