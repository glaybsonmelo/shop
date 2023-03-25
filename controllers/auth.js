const User = require("../models/User");

exports.auth = (req, res, next) => {
    if (req.session.isLoggedIn){
        next();
    }
    else{
        res.redirect("/login");
    }
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
    User.find({email}).then(([user]) => {
        if(password === user.password){
            req.session.user = user;
            req.session.isLoggedIn = true;
            res.redirect("/");
            return;
        }else
            res.redirect("/login");
    }).catch(err => console.log(err));
};

exports.postLogout = (req, res) => {
    req.session.destroy(err => {
        console.log(err);
        res.redirect("/");
    });
};