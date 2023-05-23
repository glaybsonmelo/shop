const slugify = require("slugify");
const { validationResult } = require("express-validator");
const fileHelper = require("../utils/file");
const multer = require("multer")
const Product = require("../models/Product");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");

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

exports.getAddProduct = (req, res) => {
    console.log(res.locals.csrfToken);
    res.render("admin/add-product",  {
        pageTitle:"Add Product",
        path:"/admin/add-product",
        validationErrors: [],
        errorMessage: null,
        oldInput: null,
        csrfToken: req.csrfToken(),
        isAuthenticated: true
    })
}

exports.postAddProduct = async (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({ error: "No image file provided." });
  }

  const errors = validationResult(req);
  const { title, price, description } = req.body;

//   if (!errors.isEmpty()) {
//     return res.status(422).render("admin/add-product", {
//       pageTitle: "Add Product",
//       path: "/admin/add-product",
//       oldInput: { title, price, description },
//       validationErrors: errors.array(),
//       errorMessage: errors.array()[0].msg
//     });
//   }

  const fileName = `${new Date().toISOString()}-${req.file.originalname}`;
  
  try {
    const s3Params = {
      Bucket: "shop-node",
      Key: "images/" + fileName,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
    };

    const command = new PutObjectCommand(s3Params);
    await s3Client.send(command);

    const product = new Product({
      title,
      slug: slugify(title, { lower: true }),
      price,
      description,
      imageUrl: "fileName",
      userId: req.user
    });

    await product.save();

    res.redirect("/");
  } catch (error) {
    console.error("Error uploading file to S3:", error);
    res.status(500).json({ error: "Failed to upload file to S3." });
  }
};

exports.getEditProduct = (req, res, next) => {
    const productId = req.params.id;
    Product.findById(productId).then(product => {
        if(!product) {
            res.redirect("/");
        }
        res.render("admin/edit-product",{
            pageTitle:"Edit Product",
            path:"/admin/products",
            product,
            errorMessage: null,
            validationErrors: [],
            csrfToken: res.locals.csrfToken
        });
    }).catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });
}

exports.postEditProduct = async (req, res, next) => {
    const { prodId, title, price, description } = req.body;
    const image = req.file;

    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.render("admin/edit-product",{
            pageTitle:"Edit Product",
            path:"/admin/products",
            // old input
            product: {_id: prodId, title, price, description},
            errorMessage: errors.array()[0].msg,
            validationErrors: errors.array()
        });
    }
    try {
        const product = await Product.findOne({_id: prodId})

        if (product.userId.toString() !== req.user._id.toString()){
            return res.redirect("/");
        }
        product.title = title,
        product.slug = slugify(title, {lower: true}),
        product.price = price,
        product.description = description

        if(image){
            const fileName = `${new Date().toISOString()}-${req.file.originalname}`;
                const s3Params = {
                Bucket: "shop-node",
                Key: "images/" + fileName,
                Body: req.file.buffer,
                ContentType: req.file.mimetype,
                };

                const command = new PutObjectCommand(s3Params);
                await s3Client.send(command);
                console.log("upload sucessfully")
                product.imageUrl = fileName;
            }
            // fileHelper.deleteFile(product.imageUrl);
            await product.save();
            res.redirect('/admin/products');
        
        } catch(err) {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        };
};

exports.getProducts = (req, res, next) => {
    Product.find({userId: req.user._id})
    .select("title price imageUrl _id")
    .populate("userId", "name")
    .then(products => {
        res.render("admin/products", {
            pageTitle:"Admin Products", 
            path:"/admin/products",
            products,
            csrfToken: req.csrfToken(),
            isAuthenticated: true
        })
    }).catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });
}

exports.deleteProduct = (req, res, next) => {
    const productId = req.params.productId;
    console.log(productId);
    Product.findById(productId).then(product => {
        if(!product) {
            return next(new Error("Product not found."))
        }
        fileHelper.deleteFile(product.imageUrl);
        return Product.deleteOne({ _id: productId, userId: req.user._id })
    }).then(() => {
        res.status(200).json({message: "Success!"});
    })
    .catch(err => {
        res.status(500).json({message: "Deleting product failed."})
    });
    
}