const express = require("express");
const router = express.Router();
const { body } = require("express-validator");

const adminController = require("../controllers/admin");

router.get("/add-product", adminController.getAddProduct);

router.post("/add-product", [
    body('title', "Please intert a title valid.")
        .trim()
        .isString()
        .isLength({min: 3, max: 64}),
    body('imageUrl', "Url is invalid.")
        .trim()
        .isURL(),
    body('price')
        .trim()
        .isFloat(),
    body('description')
        .trim()
        .isLength({min: 5, max: 5000})
], adminController.postAddProduct);

router.get("/edit-product/:id", adminController.getEditProduct);

router.post("/edit-product",  [
    body('title', "Please intert a title valid.")
        .trim()
        .isString()
        .isLength({min: 3, max: 64}),
    body('imageUrl', "Url is invalid.")
        .trim()
        .isURL(),
    body('price')
        .trim()
        .isFloat(),
    body('description', "Please enter a description of at least 5 characters.")
        .trim()
        .isLength({min: 5, max: 5000})
], adminController.postEditProduct);

router.post("/delete-product", adminController.postDeleteProduct);

router.get("/products", adminController.getProducts);

module.exports = router;