const express = require("express");
const { body } = require("express-validator");

const router = express.Router();
const adminController = require("../controllers/admin");

router.get("/add-product", adminController.getAddProduct);

router.post("/add-product", [
    body('title', "Please intert a title valid.")
        .trim()
        .isString()
        .isLength({min: 3, max: 64}),
    // file('image')
    //     .custom((imageFile, { req }) => {
    //         if(imageFile == undefined)
    //             throw new Error("Attached file is not an image.");
    //         return true;
    //     })
    //     .trim(),
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
    // body('imageUrl', "Url is invalid.")
    //     .trim()
    //     .isURL(),
    body('price')
        .trim()
        .isFloat(),
    body('description', "Please enter a description of at least 5 characters.")
        .trim()
        .isLength({min: 5, max: 5000})
], adminController.postEditProduct);

router.delete("/product/:productId", adminController.deleteProduct);

router.get("/products", adminController.getProducts);

module.exports = router;