exports.get404 = (req, res, next) => {  
    res.status(404).render("404", {pageTitle:"Page not found", path:"/404",
    isAuthenticated: req.isLoggedIn});
}

exports.get500 = (error, req, res, next) => {  
    res.status(500).render("500", {
        pageTitle:"Internal server error",
        path:"/500",
        isAuthenticated: req.isLoggedIn
    });
}