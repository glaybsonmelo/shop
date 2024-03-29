const express = require("express");
const router = express.Router();
const { check, body } = require("express-validator");
const authController = require("../controllers/auth");
const User = require("../models/User");

router.get('/login', authController.getLogin);

router.post('/login', [
    body("email")
        .isEmail()
        .withMessage("Please enter a valid email address.")
        .normalizeEmail(),
    body("password", "Password has to be valid.")
        .isLength({min: 5})
        .isAlphanumeric()
        .trim()
], authController.postLogin);

router.post('/logout', authController.postLogout);

router.get("/signup", authController.getSignup);

router.post("/signup", [
    check("email")
        .isEmail().withMessage("Please enter a valid email.")
        .custom((value, { req }) => {
            return User.findOne({email: value})
            .then(userDoc => {
                if(userDoc){
                    return Promise.reject("E-mail exists alredy, please pick a different one");
                }
            })
        })
        .normalizeEmail(),
    body("password", "Please enter a password only numbers and text and at least 5 characters.")
        .trim()
        .isLength({min: 6})
        .isAlphanumeric(),
    body("confirmPassword")
        .trim()
        .custom((value, { req }) => {
            if(value !== req.body.password) {
                throw new Error("Passwords have to match!");
            }
            return true;
        })
    ],
    authController.postSignup)
    
router.get("/reset", authController.getReset);

router.post("/reset", authController.postReset)

router.get("/reset/:token", authController.getNewPassword);

router.post("/new-password", authController.postNewPassword);

module.exports = router;