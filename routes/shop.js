const express = require("express");
const { auth } = require("../controllers/auth");
const router = express.Router();
const shopController = require("../controllers/shop");

router.get("/", shopController.getIndex);

router.get("/products/:slug", shopController.getProduct);

router.get("/products", shopController.getProducts);

router.get("/cart", auth, shopController.getCart);

router.post("/cart", auth, shopController.postCart);

router.post("/cart-delete-item", shopController.postCartDeleteProduct);

router.post("/create-order", shopController.postOrder);

router.get("/orders", shopController.getOrders);

// router.get("/checkout", shopController.getCheckout);

module.exports = router;