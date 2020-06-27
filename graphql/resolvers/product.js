const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const DataLoader = require('dataloader');
const User = require('../../models/user');
const Product = require('../../models/product');
const Order = require('../../models/order');
const Review = require('../../models/review');
const util = require('util');
const moment = require('moment');

const { transformProduct } = require('./merge');
const { dateToString } = require('../../helpers/date');
const { pocketVariables } = require('../../helpers/pocketVars');

const sgMail = require('@sendgrid/mail');
const AWS = require('aws-sdk');
// const stripe = require('stripe')(process.env.STRIPE_B);

module.exports = {
  getAllProducts: async (args, req) => {
    console.log("Resolver: getAllProducts...");
    if (!req.isAuth) {
      throw new Error('Unauthenticated!');
    }
    try {
      const products = await Product.find()
      .populate('listedBy')
      .populate('likers')
      .populate('buyers')
      .populate('wishlisters')
      .populate('orders')
      .populate('reviews');
      return products.map(product => {
        return transformProduct(product,);
      });
    } catch (err) {
      throw err;
    }
  },
  getProductById: async (args, req) => {
    console.log("Resolver: getProductById...");
    if (!req.isAuth) {
      throw new Error('Unauthenticated!');
    }
    try {
      const product = await Product.findById({_id: args.productId})
      .populate('listedBy')
      .populate('likers')
      .populate('buyers')
      .populate('wishlisters')
      .populate('orders')
      .populate('reviews');
      return {
        ...product._doc,
        _id: product.id,
        name: product.name
      };
    } catch (err) {
      throw err;
    }
  },
  getProductsByField: async (args, req) => {
    console.log("Resolver: getProductsByField...");
    if (!req.isAuth) {
      throw new Error('Unauthenticated!');
    }
    try {
      let resolverField = args.field;
      let resolverQuery = args.query;
      const query = {[resolverField]:resolverQuery};
      const products = await Product.find(query)
      .populate('listedBy')
      .populate('likers')
      .populate('buyers')
      .populate('wishlisters')
      .populate('orders')
      .populate('reviews');
      return products.map(product => {
        return transformProduct(product,);
      });
    } catch (err) {
      throw err;
    }
  },
  getProductsByFieldRegex: async (args, req) => {
    console.log("Resolver: getProductsByFieldRegex...");
    if (!req.isAuth) {
      throw new Error('Unauthenticated!');
    }
    try {
      let resolverField = args.field;
      const regExpQuery = new RegExp(args.query)
      let resolverQuery = {$regex: regExpQuery, $options: 'i'};
      const query = {[resolverField]:resolverQuery};
      const products = await Product.find(query)
      .populate('listedBy')
      .populate('likers')
      .populate('buyers')
      .populate('wishlisters')
      .populate('orders')
      .populate('reviews');
      return products.map(product => {
        return transformProduct(product,);
      });
    } catch (err) {
      throw err;
    }
  },
  getProductsByTags: async (args, req) => {
    console.log("Resolver: getProductsByTags...");
    if (!req.isAuth) {
      throw new Error('Unauthenticated!');
    }
    try {
      const tags = args.productInput.tags.split(',');
      const products = await Product.find({tags: {$all: tags}})
      .populate('listedBy')
      .populate('likers')
      .populate('buyers')
      .populate('wishlisters')
      .populate('orders')
      .populate('reviews');
      return products.map(product => {
        return transformProduct(product,);
      });
    } catch (err) {
      throw err;
    }
  },
  getProductsByPointRange: async (args, req) => {
    console.log("Resolver: getProductsByPointRange...");
    if (!req.isAuth) {
      throw new Error('Unauthenticated!');
    }
    try {
      const products = await Product.find({points: {$gte: args.lower, $lte: args.upper}})
      .populate('listedBy')
      .populate('likers')
      .populate('buyers')
      .populate('wishlisters')
      .populate('orders')
      .populate('reviews');
      return products.map(product => {
        return transformProduct(product,);
      });
    } catch (err) {
      throw err;
    }
  },
  updateProductAllFields: async (args, req) => {
    console.log("Resolver: updateProductAllFields...");
    if (!req.isAuth) {
      throw new Error('Unauthenticated!');
    }
    try {
      const nameExists = await Product.find({name: args.productInput.name});
      if (nameExists.length !== 0) {
        console.log('nameExists',nameExists.length);
        console.log('...Product name already exists! Variety is the spice of... something');
        throw new Error('...Product name already exists! Variety is the spice of... something');
      }
      const product = await Product.findOneAndUpdate(
        {_id: args.productId},
        {
          public: args.productInput.public,
          name: args.productInput.name,
          subtitle: args.productInput.subtitle,
          sku: args.productInput.sku,
          type: args.productInput.type,
          subType: args.productInput.subType,
          category: args.productInput.category,
          description: args.productInput.description,
          variant: args.productInput.variant,
          size: args.productInput.size,
          dimensions: args.productInput.dimensions,
          price: args.productInput.price,
          points: args.productInput.points,
          quantity: args.productInput.quantity,
          inStock: args.productInput.inStock,
          unit: args.productInput.unit,
          delivery: args.productInput.delivery
        },
        {new: true, useFindAndModify: false}
      )
      .populate('listedBy')
      .populate('likers')
      .populate('buyers')
      .populate('wishlisters')
      .populate('orders')
      .populate('reviews');
      return {
        ...product._doc,
        _id: product.id,
        name: product.name
      }
    } catch (err) {
      throw err;
    }
  },
  updateProductSingleField: async (args, req) => {
    console.log("Resolver: updateProductSingleField...");
    if (!req.isAuth) {
      throw new Error('Unauthenticated!');
    }
    try {
      const nameExists = await Product.find({name: args.query});
      let query =  '';
      const resolverField = args.field;
      const resolverQuery = args.query;
      query = {[resolverField]:resolverQuery};
      if (args.field === 'name') {
        if (nameExists.length !== 0) {
          console.log('nameExists',nameExists.length);
          console.log('...Product name already exists! Variety is the spice of... something');
          throw new Error('...Product name already exists! Variety is the spice of... something');
        }
      }
      if (args.field === 'aaeId') {
        console.log("...um just no! AaeId can't be edited. Delete and/or Create a new product instead...");
        throw new Error("...um just no! AaeId can't be edited. Delete and/or Create a new product instead...");
      }
      const product = await Product.findOneAndUpdate(
        {_id: args.productId},
        query,
        {new: true, useFindAndModify: false}
      )
      .populate('listedBy')
      .populate('likers')
      .populate('buyers')
      .populate('wishlisters')
      .populate('orders')
      .populate('reviews');
      return {
        ...product._doc,
        _id: product.id,
        name: product.name
      }
    } catch (err) {
      throw err;
    }
  },
  addProductTags: async (args, req) => {
    console.log("Resolver: addProductTags...");
    if (!req.isAuth) {
      throw new Error('Unauthenticated!');
    }
    try {
      const tags = args.productInput.tags;
      const splitTags = tags.split(",");
      const product = await Product.findOneAndUpdate(
        {_id:args.productId},
        {$addToSet: { tags: {$each: splitTags} }},
        {new: true, useFindAndModify: false}
      )
      .populate('listedBy')
      .populate('likers')
      .populate('buyers')
      .populate('wishlisters')
      .populate('orders')
      .populate('reviews');
      return {
        ...product._doc,
        _id: product.id,
        name: product.name,
      };
    } catch (err) {
      throw err;
    }
  },
  deleteProductTag: async (args, req) => {
    console.log("Resolver: deleteProductTag...");
    if (!req.isAuth) {
      throw new Error('Unauthenticated!');
    }
    try {
      let tag = args.productInput.tag;
      const product = await Product.findOneAndUpdate(
        {_id:args.productId},
        {$pull: { tags: tag }},
        {new: true, useFindAndModify: false}
      )
      .populate('listedBy')
      .populate('likers')
      .populate('buyers')
      .populate('wishlisters')
      .populate('orders')
      .populate('reviews');
      return {
        ...product._doc,
        _id: product.id,
        name: product.name,
      };
    } catch (err) {
      throw err;
    }
  },
  addProductImage: async (args, req) => {
    console.log("Resolver: addProductImage...");
    if (!req.isAuth) {
      throw new Error('Unauthenticated!');
    }
    try {
      let image = {
        name: args.productInput.imageName,
        type: args.productInput.imageType,
        link: args.productInput.imageLink
      }
      const product = await Product.findOneAndUpdate(
        {_id:args.productId},
        // { images: [] },
        {$addToSet: { images: image }},
        {new: true, useFindAndModify: false}
      )
      .populate('listedBy')
      .populate('likers')
      .populate('buyers')
      .populate('wishlisters')
      .populate('orders')
      .populate('reviews');
      return {
        ...product._doc,
        _id: product.id,
        name: product.name,
      };
    } catch (err) {
      throw err;
    }
  },
  deleteProductImage: async (args, req) => {
    console.log("Resolver: deleteProductImage...");
    if (!req.isAuth) {
      throw new Error('Unauthenticated!');
    }
    try {
      let image = {
        name: args.productInput.imageName,
        type: args.productInput.imageType,
        link: args.productInput.imageLink
      }
      const product = await Product.findOneAndUpdate(
        {_id:args.productId},
        {$pull: { images: image }},
        {new: true, useFindAndModify: false}
      )
      .populate('listedBy')
      .populate('likers')
      .populate('buyers')
      .populate('wishlisters')
      .populate('orders')
      .populate('reviews');
      return {
        ...product._doc,
        _id: product.id,
        name: product.name,
      };
    } catch (err) {
      throw err;
    }
  },
  addProductFile: async (args, req) => {
    console.log("Resolver: addProductFile...");
    if (!req.isAuth) {
      throw new Error('Unauthenticated!');
    }
    try {
      let file = {
        name: args.productInput.fileName,
        type: args.productInput.fileType,
        link: args.productInput.fileLink
      }
      const product = await Product.findOneAndUpdate(
        {_id:args.productId},
        {$addToSet: { files: file }},
        {new: true, useFindAndModify: false}
      )
      .populate('listedBy')
      .populate('likers')
      .populate('buyers')
      .populate('wishlisters')
      .populate('orders')
      .populate('reviews');
      return {
        ...product._doc,
        _id: product.id,
        name: product.name,
      };
    } catch (err) {
      throw err;
    }
  },
  deleteProductFile: async (args, req) => {
    console.log("Resolver: deleteProductFile...");
    if (!req.isAuth) {
      throw new Error('Unauthenticated!');
    }
    try {
      let file = {
        name: args.productInput.fileName,
        type: args.productInput.fileType,
        link: args.productInput.fileLink
      }
      const product = await Product.findOneAndUpdate(
        {_id:args.productId},
        {$pull: { files: file }},
        {new: true, useFindAndModify: false}
      )
      .populate('listedBy')
      .populate('likers')
      .populate('buyers')
      .populate('wishlisters')
      .populate('orders')
      .populate('reviews');
      return {
        ...product._doc,
        _id: product.id,
        name: product.name,
      };
    } catch (err) {
      throw err;
    }
  },
  addProductLiker: async (args, req) => {
    console.log("Resolver: addProductLiker...");
    if (!req.isAuth) {
      throw new Error('Unauthenticated!');
    }
    try {
      const liker = await User.findById({_id: args.userId});
      const product = await Product.findOneAndUpdate(
        {_id:args.productId},
        {$addToSet: { likers: liker }},
        {new: true, useFindAndModify: false}
      )
      .populate('listedBy')
      .populate('likers')
      .populate('buyers')
      .populate('wishlisters')
      .populate('orders')
      .populate('reviews');
      return {
        ...product._doc,
        _id: product.id,
        name: product.name,
      };
    } catch (err) {
      throw err;
    }
  },
  deleteProductLiker: async (args, req) => {
    console.log("Resolver: deleteProductLiker...");
    if (!req.isAuth) {
      throw new Error('Unauthenticated!');
    }
    try {
      const product = await Product.findOneAndUpdate(
        {_id:args.productId},
        {$pull: { likers: args.userId }},
        {new: true, useFindAndModify: false}
      )
      .populate('listedBy')
      .populate('likers')
      .populate('buyers')
      .populate('wishlisters')
      .populate('orders')
      .populate('reviews');
      return {
        ...product._doc,
        _id: product.id,
        name: product.name,
      };
    } catch (err) {
      throw err;
    }
  },
  addProductBuyer: async (args, req) => {
    console.log("Resolver: addProductBuyer...");
    if (!req.isAuth) {
      throw new Error('Unauthenticated!');
    }
    try {
      const buyer = await User.findById({_id: args.userId});
      const product = await Product.findOneAndUpdate(
        {_id:args.productId},
        {$addToSet: { buyers: buyer }},
        {new: true, useFindAndModify: false}
      )
      .populate('listedBy')
      .populate('likers')
      .populate('buyers')
      .populate('wishlisters')
      .populate('orders')
      .populate('reviews');
      return {
        ...product._doc,
        _id: product.id,
        name: product.name,
      };
    } catch (err) {
      throw err;
    }
  },
  deleteProductBuyer: async (args, req) => {
    console.log("Resolver: deleteProductBuyer...");
    if (!req.isAuth) {
      throw new Error('Unauthenticated!');
    }
    try {
      const product = await Product.findOneAndUpdate(
        {_id:args.productId},
        {$pull: { buyers: args.userId }},
        {new: true, useFindAndModify: false}
      )
      .populate('listedBy')
      .populate('likers')
      .populate('buyers')
      .populate('wishlisters')
      .populate('orders')
      .populate('reviews');
      return {
        ...product._doc,
        _id: product.id,
        name: product.name,
      };
    } catch (err) {
      throw err;
    }
  },
  addProductWishlister: async (args, req) => {
    console.log("Resolver: addProductWishlister...");
    if (!req.isAuth) {
      throw new Error('Unauthenticated!');
    }
    try {
      const wishlister = await User.findById({_id: args.userId});
      const product = await Product.findOneAndUpdate(
        {_id:args.productId},
        {$addToSet: { wishlisters: wishlister }},
        {new: true, useFindAndModify: false}
      )
      .populate('listedBy')
      .populate('likers')
      .populate('buyers')
      .populate('wishlisters')
      .populate('orders')
      .populate('reviews');
      return {
        ...product._doc,
        _id: product.id,
        name: product.name,
      };
    } catch (err) {
      throw err;
    }
  },
  deleteProductWishlister: async (args, req) => {
    console.log("Resolver: deleteProductWishlister...");
    if (!req.isAuth) {
      throw new Error('Unauthenticated!');
    }
    try {
      const product = await Product.findOneAndUpdate(
        {_id:args.productId},
        {$pull: { wishlisters: args.userId }},
        {new: true, useFindAndModify: false}
      )
      .populate('listedBy')
      .populate('likers')
      .populate('buyers')
      .populate('wishlisters')
      .populate('orders')
      .populate('reviews');
      return {
        ...product._doc,
        _id: product.id,
        name: product.name,
      };
    } catch (err) {
      throw err;
    }
  },

  addProductOrder: async (args, req) => {
    console.log("Resolver: addProductOrder...");
    if (!req.isAuth) {
      throw new Error('Unauthenticated!');
    }
    try {
      const order = await Order.findById({_id: args.orderId});
      const product = await Product.findOneAndUpdate(
        {_id:args.productId},
        {$addToSet: { orders: order }},
        {new: true, useFindAndModify: false}
      )
      .populate('listedBy')
      .populate('likers')
      .populate('buyers')
      .populate('wishlisters')
      .populate('orders')
      .populate('reviews');
      return {
        ...product._doc,
        _id: product.id,
        name: product.name,
      };
    } catch (err) {
      throw err;
    }
  },
  deleteProductOrder: async (args, req) => {
    console.log("Resolver: deleteProductOrder...");
    if (!req.isAuth) {
      throw new Error('Unauthenticated!');
    }
    try {
      const product = await Product.findOneAndUpdate(
        {_id:args.productId},
        {$pull: { orders: args.orderId }},
        {new: true, useFindAndModify: false}
      )
      .populate('listedBy')
      .populate('likers')
      .populate('buyers')
      .populate('wishlisters')
      .populate('orders')
      .populate('reviews');
      return {
        ...product._doc,
        _id: product.id,
        name: product.name,
      };
    } catch (err) {
      throw err;
    }
  },
  addProductReview: async (args, req) => {
    console.log("Resolver: addProductReview...");
    if (!req.isAuth) {
      throw new Error('Unauthenticated!');
    }
    try {
      const review = await Review.findById({_id: args.reviewId});
      const product = await Product.findOneAndUpdate(
        {_id:args.productId},
        {$addToSet: { reviews: review }},
        {new: true, useFindAndModify: false}
      )
      .populate('listedBy')
      .populate('likers')
      .populate('buyers')
      .populate('wishlisters')
      .populate('orders')
      .populate('reviews');
      return {
        ...product._doc,
        _id: product.id,
        name: product.name,
      };
    } catch (err) {
      throw err;
    }
  },
  deleteProductReview: async (args, req) => {
    console.log("Resolver: deleteProductReview...");
    if (!req.isAuth) {
      throw new Error('Unauthenticated!');
    }
    try {
      const product = await Product.findOneAndUpdate(
        {_id:args.productId},
        {$pull: { reviews: args.reviewId }},
        {new: true, useFindAndModify: false}
      )
      .populate('listedBy')
      .populate('likers')
      .populate('buyers')
      .populate('wishlisters')
      .populate('orders')
      .populate('reviews');
      return {
        ...product._doc,
        _id: product.id,
        name: product.name,
      };
    } catch (err) {
      throw err;
    }
  },

  deleteProductById: async (args, req) => {
    console.log("Resolver: deleteProductById...");
    if (!req.isAuth) {
      throw new Error('Unauthenticated!');
    }
    try {
      const activityUser = await User.findById({_id: args.activityId});
      const preProduct = await Product.findById({_id: args.productId});
      console.log('preProduct',preProduct,args.productId);
      const isLister = preProduct.listedBy === args.activityId;
      const isAdmin = activityUser.role === 'Admin';
      if (isLister === false && isAdmin === false) {
        console.log('...umm no! Only Admin or the Listing User may delete Products...');
        throw new Error('...umm no! Only Admin or the Listing User may delete Products...');
      }
      const deleteProduct = await Product.findByIdAndRemove(args.productId)
      return {
        ...deleteProduct._doc,
        _id: deleteProduct.id,
        name: deleteProduct.name,
      };
    } catch (err) {
      throw err;
    }
  },
  createProduct: async (args,req) => {
    console.log("Resolver: createProduct...");
    if (!req.isAuth) {
      throw new Error('Unauthenticated!');
    }
    try {
      const existingProduct1 = await Product.findOne({
        name: args.productInput.name
      });
      const existingProduct2 = await Product.findOne({
        aaeId: args.productInput.aaeId
      });
      if (existingProduct1 || existingProduct2) {
        console.log('Product like that exists already! Variety is the spice of ...check name and aaeId');
        throw new Error('Product like that exists already! Variety is the spice of ...check name and aaeId');
      }

      const listedBy = await User.findById({_id: args.activityId});
      let today = moment().format('YYYY-MM-DD');
      const product = new Product({
        public: args.productInput.public,
        name: args.productInput.name,
        subtitle: args.productInput.subtitle,
        aaeId: args.productInput.aaeId,
        sku: args.productInput.sku,
        dateAdded: today,
        type: args.productInput.type,
        subType: args.productInput.subType,
        category: args.productInput.category,
        description: args.productInput.description,
        variant: args.productInput.variant,
        size: args.productInput.size,
        dimensions: args.productInput.dimensions,
        price: args.productInput.price,
        points: args.productInput.points,
        quantity: args.productInput.quantity,
        inStock: args.productInput.inStock,
        tags: [],
        unit: args.productInput.unit,
        delivery: args.productInput.delivery,
        images: [],
        files: [],
        listedBy: listedBy,
        likers: [],
        buyers: [],
        wishlisters: [],
        reviews: [],
        orders: []
      });
      const result = await product.save();
      return{
        ...result._doc,
        _id: result.id
      }
    } catch (err) {
      throw err;
    }
  },
};
