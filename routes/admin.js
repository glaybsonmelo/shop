const express = require("express");
const { body } = require("express-validator");
const multer = require("multer");
const fs = require("fs");
const router = express.Router();
const adminController = require("../controllers/admin");

router.get("/add-product", adminController.getAddProduct);

  const upload = multer({
    storage: multer.memoryStorage(),
    fileFilter: function (req, file, cb) {
      if (
        file.mimetype === "image/jpeg" ||
        file.mimetype === "image/png" ||
        file.mimetype === "image/jpg"
      ) {
        cb(null, true);
      } else {
        cb(null, false);
      }
    },
  });
  
  router.post(
    "/add-product", upload.single("image"),
    [
      body("title", "Please insert a valid title.")
        .trim()
        .isString()
        .isLength({ min: 3, max: 64 }),
      body("price").trim().isFloat(),
      body("description").trim().isLength({ min: 5, max: 5000 }),
    ],
    adminController.postAddProduct);
  

router.get("/edit-product/:id", adminController.getEditProduct);

router.post("/edit-product", upload.single("image"),  [
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