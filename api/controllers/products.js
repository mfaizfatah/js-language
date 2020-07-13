const mongoose = require('mongoose');
const multer = require('multer');
const fs = require('fs');
const logger = require('../utils/logger');
const response = require('../utils/response');

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

const error_msg = "Something went wrong. Please try again later. Thank You!"

exports.upload = multer({
    storage: storage, 
    limits: {
        fileSize: 1024 * 1024 * 5
    },
    fileFilter: fileFilter
});

exports.products_get_all = (req,res,next) => {
    const { pages, size } = req.query
    var where = {}
    let limit, offset = 0
    limit   = parseInt(size)
    offset  = parseInt((pages - 1) * limit)

    Product.find(where, (err, docs) => {
        if (err) {
            response.error(res, 500, err, error_msg)
            return
        }

        const outRs = {
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
        response.success(res, 200, outRs)
    })
}

exports.product_create_product = (req,res,next) => {
    logger.logger.info(req.file);
    const product = new Product({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        price: req.body.price,
        productImage: req.file.path,
        created_at: new Date(),
        update_at: new Date()
    });

    product.save((err, data) => {
        if (err) {
            response.error(res, 500, err, error_msg)
        }

        const outRs = {
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
        }
        response.success(res, 201, outRs)
    })
}

exports.product_get_one = (req,res,next) => {
    const id = req.params.productId;

    Product.findById(id, (err, data) => {
        if (err) {
            response.error(res, 500, err, error_msg)
        }

        const outRs = {
            product: data,
                request: {
                    type: 'GET',
                    description: 'GET_ALL_PRODUCT',
                    url: "http://localhost:3000/products"
                }
        }

        response.success(res,200,outRs)
    })   
}

exports.product_update_product = (req,res,next) => {
    const id = req.params.productId;
    const updateOps = {};
    for (const ops of req.body){
        updateOps[ops.propName] = ops.value;
    }
    updateOps[update_at] = new Date()

    Product.update(id, {$set: updateOps}, (err, data) => {
        if (err) {
            response.error(res, 500, err, error_msg)
            return
        }

        const outRs = {
            request: {
                type: 'GET',
                url: 'http://localhost:3000/products/' + id
            }
        }
        response.success(res, 200, outRs, "Product Updated")
    })
}

exports.product_delete_product = (req,res,next) => {
    const id = req.params.productId;
    var productImage = ""

    Product.findById(id, (err, data) => {
        if (err) {
            response.error(res, 500, err, error_msg)
            return
        }
        logger.logger.info("From Database", data)
        data.remove((err, result) => {
            if (err) {
                response.error(res, 500, err, error_msg)
                return
            }

            fs.unlink(productImage, (err) => {
                if (err) {
                    logger.logger.error(err);
                    res.status(500).json({error: err});
                }
                logger.logger.info(`successfully deleted ${productImage}`);
            })

            const outRs = {
                request: {
                    type: 'POST',
                    url: 'http://localhost:3000/products',
                    body: { name: 'String', price: 'Number'}
                }
            }

            response.success(res, 200, outRs, "Product Deleted")
        })
    })
}