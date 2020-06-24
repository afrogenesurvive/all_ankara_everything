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
  createProduct: async (args,req) => {
    console.log("Resolver: createProduct...");
    if (!req.isAuth) {
      throw new Error('Unauthenticated!');
    }
    try {
      const existingProduct = await Product.findOne({
        name: args.productInput.name,
        aaeId: args.productInput.aaeId
      });
      if (existingProduct) {
        console.log('Product like that exists already! Variety is the spice of ...something');
        throw new Error('Product like that exists already! Variety is the spice of ...something');
      }
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
