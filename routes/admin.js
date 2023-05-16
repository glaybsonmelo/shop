const express = require("express");
const { body } = require("express-validator");
const multer = require("multer");
const fs = require("fs");
const router = express.Router();
const adminController = require("../controllers/admin");

const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
router.get("/add-product", adminController.getAddProduct);

// const originalName = file.originalname;
// const extension = path.extname(originalName);
// const newName = Date.now().toString() + extension;
// const newPath = path.join(__dirname, '..', 'public', 'images', newName);
// fs.renameSync(file.path, newPath);


// const s3Params = {
//     Bucket: 'my-bucket',
//     Key: newName,
//     Body: fs.createReadStream(newPath),
//     ACL: 'public-read',
//     ContentType: file.mimetype,
//   };

const s3Client = new S3Client({
    region: "us-east-2",
    credentials: {
      accessKeyId: "AKIAW2V2KQYHB5Y7TXJI",
      secretAccessKey: "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",
    },
    key: function(req, file, cb) {
        const fileName = file.originalname;
        cb(null, fileName);
      },
  });

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