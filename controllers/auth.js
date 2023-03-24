exports.getLogin = (req, res) => {
    res.render("auth/login", {
        pageTitle: "Login",
        path: "/login",
        isAuthenticated: true
    })
};

exports.postLogin = (req, res, next) => {
    const { email, passowrd } = req.body;
    req.session.isLoggedIn = true;
    res.redirect("/");
};