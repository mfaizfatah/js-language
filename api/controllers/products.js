const mongoose = require('mongoose');
const multer = require('multer');
const fs = require('fs');
const logger = require('../utils/logger');

const Product = require('../models/product');

const storage = multer.diskStorage({
    destination: function(req, file, cb) {  
      cb(null, './uploads/');  
    },  
    filename: function(req, file, cb) {  
      cb(null, new Date().toISOString().replace(/:|\./g,'') + file.originalname);  
    }  
});

const fileFilter = (req, file, cb) => {
    // reject a file
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png'){
        cb(null, true);
    } else {
        cb(null, false);
    }    
};

exports.upload = multer({
    storage: storage, 
    limits: {
        fileSize: 1024 * 1024 * 5
    },
    fileFilter: fileFilter
});

exports.products_get_all = (req,res,next) => {
    Product.find()
    .select('name price _id productImage')
    .exec()
    .then(docs => {
        const response = {
            count:docs.length,
            products: docs.map(doc => {
                return {
                    name: doc.name,
                    price: doc.price,
                    productImage : doc.productImage,
                    _id: doc.id,
                    request: {
                        type: 'GET',
                        url: 'http://localhost:3000/products/'+ doc._id
                    }
                }
            })
        }
        // console.log(response);
        if (docs.length >= 0){
            res.status(200).json(response);
        } else {
            res.status(404).json({
                message: 'No entries found'
            });
        }
    })
    .catch(err => {
        logger.logger.error(err);
        res.status(500).json({
            error: err
        });
    });
}

exports.product_create_product = (req,res,next) => {
    logger.logger.info(req.file);
    const product = new Product({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        price: req.body.price,
        productImage: req.file.path
    });
    product
        .save()
        .then(result => {
        logger.logger.info(result);
        res.status(201).json({
            message: 'Created product successfully',
            createdProduct: {
                name: result.name,
                price: result.price,
                _id: result._id,
                request: {
                    type: 'GET',
                    url: 'http://localhost:3000/products/'+ result._id
                }
            }
        });
    })
    .catch(err => {
        logger.logger.error(err);
        res.status(500).json({
            error: err
        })
    });
}

exports.product_get_one = (req,res,next) => {
    const id = req.params.productId;
    Product.findById(id)
    .select('name price _id productImage')
    .exec()
    .then(doc => {
        // console.log("From database", doc);
        if (doc) {
            res.status(200).json({
                product: doc,
                request: {
                    type: 'GET',
                    description: 'GET_ALL_PRODUCT',
                    url: "http://localhost:3000/products"
                }
            });
        } else {
            res.status(404).json({message: "No valid entry found for provided ID"});
        }
        
    })
    .catch(err => {
        logger.logger.error(err);
        res.status(500).json({error: err});
    });    
}

exports.product_update_product = (req,res,next) => {
    const id = req.params.productId;
    const updateOps = {};
    for (const ops of req.body){
        updateOps[ops.propName] = ops.value;
    }
    Product.update({_id: id}, { $set: updateOps })
    .exec()
    .then(result => {
        // console.log(result);
        res.status(200).json({
            message: 'Product Updated',
            request: {
                type: 'GET',
                url: 'http://localhost:3000/products/' + id
            }
        });
    })
    .catch(err => {
        logger.logger.error(err);
        res.status(500).json({
            error: err
        });
    });
}

exports.product_delete_product = (req,res,next) => {
    const id = req.params.productId;
    var productImage = ""
    Product.findById(id)
    .select('productImage')
    .exec()
    .then(doc => {
        logger.logger.info("From database", doc);
        if (doc) {
            productImage = doc.productImage
        } else {
            res.status(404).json({message: "No valid entry found for provided ID"});
        }
        
    })
    .catch(err => {
        logger.logger.error(err);
        res.status(500).json({error: err});
    }); 

    Product.remove({_id: id})
    .exec()
    .then(result => {
        res.status(200).json({
            message: 'Product Deleted',
            request: {
                type: 'POST',
                url: 'http://localhost:3000/products',
                body: { name: 'String', price: 'Number'}
            }
        });
        
        fs.unlink(productImage, (err) => {
            if (err) {
                logger.logger.error(err);
                res.status(500).json({error: err});
            };
            logger.logger.info(`successfully deleted ${productImage}`);
            });
    })
    .catch(err => {
        logger.logger.error(err);
        res.status(500).json({error: err});
    });
}