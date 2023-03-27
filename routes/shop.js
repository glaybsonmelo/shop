const express = require("express");
const isAuth = require("../middlewares/is-auth");
const router = express.Router();
const shopController = require("../controllers/shop");

router.get("/", shopController.getIndex);

router.get("/products/:slug", shopController.getProduct);

router.get("/products", shopController.getProducts);

router.get("/cart", isAuth, shopController.getCart);

router.post("/cart", isAuth, shopController.postCart);

router.post("/cart-delete-item", isAuth, shopController.postCartDeleteProduct);

router.post("/create-order", isAuth, shopController.postOrder);

router.get("/orders", isAuth, shopController.getOrders);

// router.get("/checkout", shopController.getCheckout);

module.exports = router;