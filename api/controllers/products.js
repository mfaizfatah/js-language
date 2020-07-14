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
    const { pages, size } = req.query
    var where = {}
    let limit, offset = 0
    limit   = parseInt(size)
    offset  = parseInt((pages - 1) * limit)

    Product.find(where, (err, docs) => {
        if (err) {
            return res.status(500).json({
                error: err
            })
        }
        
        if (docs.length >= 0) {
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
            res.status(200).json(outRs)
        } else {
            res.status(404).json({
                message: 'No entries found'
            })
        }
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
            return res.status(500).json({
                error: err
            })
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
        res.status(201).json(outRs)
    })
}

exports.product_get_one = (req,res,next) => {
    const id = req.params.productId;

    Product.findById(id, (err, data) => {
        if (err) {
            return res.status(500).json({
                error: err
            })
        }

        if (data){
            const outRs = {
                product: data,
                    request: {
                        type: 'GET',
                        description: 'GET_ALL_PRODUCT',
                        url: "http://localhost:3000/products"
                    }
            }    
            res.status(200).json(outRs)
        } else {
            res.status(404).json({
                message: 'No valid entry found for provicded ID'
            })
        }
    })   
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

    Product.findById(id, (err, data) => {
        if (err) {
            return res.status(500).json({
                error: err
            })
        }
        logger.logger.info("From Database", data)

        if (data) {
            data.remove((err, result) => {
                if (err) {
                    return res.status(500).json({
                        error: err
                    })
                }
    
                fs.unlink(productImage, (err) => {
                    if (err) {
                        logger.logger.error(err);
                        return res.status(500).json({
                            error: err
                        })
                    }
                    logger.logger.info(`successfully deleted ${productImage}`);
                })
    
                const outRs = {
                    message: 'Product deleted',
                    request: {
                        type: 'POST',
                        url: 'http://localhost:3000/products',
                        body: { name: 'String', price: 'Number'}
                    }
                }
    
                res.status(200).json(outRs)
            })
        } else {
            res.status(404).json({
                message: "No valid entry found for provided ID"
            })
        }
    })
}