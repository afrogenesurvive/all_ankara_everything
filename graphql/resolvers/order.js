const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const DataLoader = require('dataloader');
const User = require('../../models/user');
const Product = require('../../models/product');
const Order = require('../../models/order');
const Review = require('../../models/review');
const util = require('util');
const moment = require('moment');

const { transformOrder } = require('./merge');
const { dateToString } = require('../../helpers/date');
const { pocketVariables } = require('../../helpers/pocketVars');

const sgMail = require('@sendgrid/mail');
const AWS = require('aws-sdk');
// const stripe = require('stripe')(process.env.STRIPE_B);

module.exports = {
  getAllOrders: async (args, req) => {

    console.log("Resolver: getAllOrders...");

    if (!req.isAuth) {
      throw new Error('Unauthenticated!');
    }
    try {
      const orders = await Order.find({})

      return orders.map(order => {
        return transformOrder(order,);
      });
    } catch (err) {
      throw err;
    }
  },
  getOrderById: async (args, req) => {
    console.log("Resolver: getOrderById...");
    if (!req.isAuth) {
      throw new Error('Unauthenticated!');
    }
    try {

      const order = await Order.findById(args.orderId)
      .populate('buyer')
      .populate('receiver')
      .populate('lessons.ref');

        return {
            ...order._doc,
            _id: order.id,
            date: order.date,
            type: order.type
        };
    } catch (err) {
      throw err;
    }
  },
  getOrdersByField: async (args, req) => {
    console.log("Resolver: getOrderByField...");
    if (!req.isAuth) {
      throw new Error('Unauthenticated!');
    }
    try {
      let fieldType = null;
      let resolverField = args.field;
      let resolverQuery = args.query;
      const query = {[resolverField]:resolverQuery};
      const orders = await Order.find(query)

      return orders.map(order => {
        return transformOrder(order);

      });
    } catch (err) {
      throw err;
    }
  },
  deleteOrder: async (args, req) => {
    console.log("Resolver: deleteOrder...");
    if (!req.isAuth) {
      throw new Error('Unauthenticated!');
    }
    try {
      const order = await Order.findByIdAndRemove(args.orderId);

      // remove from user and products
        return {
            ...order._doc,
            _id: order.id,
            date: order.date,
            type: order.type
        };
    } catch (err) {
      throw err;
    }
  },
  createOrder: async (args, req) => {
    console.log("Resolver: createOrder...");
    try {
      const buyer = await User.findById({_id: args.buyerId})
      .populate('cart');
      const datetime = moment().local().format("YYYY-MM-DD,hh:mm:ss a");
      const datetime2 = moment().local().format("YYYY-MM-DD,hh:mm:ss a").split(',');
      console.log('1',datetime);
      console.log('2',datetime2);
      const date = datetime2[0];
      const time = datetime2[1];
      const preCart = buyer.cart;
      if (preCart.length === 0) {
        throw new Error('Ummm just no! Your cart is empty...')
      }
      // let orderProductsX = [];
      let orderTotal = 0;
      for (let index = 0; index < preCart.length; index++) {
        let preCartItem = preCart[index];
        let price = preCartItem.price;
        orderTotal = orderTotal + price;
        // console.log(`
        //     index: ${index},
        //     price: ${price},
        //     total: ${orderTotal}
        //   `);
      }

      const order = new Order({
        date: date,
        time: time,
        type: args.orderInput.type,
        subType: args.orderInput.subType,
        buyer: buyer,
        products: preCart,
        tax:{
          description: args.orderInput.taxDescription,
          amount: args.orderInput.taxAmount,
        },
        shipping: {
          description: args.orderInput.shippingDescription,
          amount: args.orderInput.shippingAmount
        },
        total: orderTotal,
        description: args.orderInput.description,
        notes: args.orderInput.notes,
        payment: args.orderInput.payment,
        billingAddress:{
          number: args.orderInput.billingAddressNumber,
          street: args.orderInput.billingAddressStreet,
          town: args.orderInput.billingAddressTown,
          city: args.orderInput.billingAddressCity,
          country: args.orderInput.billingAddressCountry,
          postalCode: args.orderInput.billingAddressPostalCode,
        },
        shippingAddress:{
          number: args.orderInput.shippingAddressNumber,
          street: args.orderInput.shippingAddressStreet,
          town: args.orderInput.shippingAddressTown,
          city: args.orderInput.shippingAddressCity,
          country: args.orderInput.shippingAddressCountry,
          postalCode: args.orderInput.shippingAddressPostalCode,
        },
        status: [
          {
            type: 'checkedOut',
            value: true,
            date: date
          },
          {
            type: 'paid',
            value: true,
            date: date
          }
        ],
        feedback: ''
      });

      const result = await order.save();
      const updateUser = await User.findOneAndUpdate(
        {_id: buyer._id},
        {
          $addToSet: {orders: order},
          // cart: []
        },
        {new: true, useFindAndModify: false}
      )

      console.log('updateUser',updateUser.orders);
      let updatedProducts = [];
      for (let index = 0; index < preCart.length; index++) {
        let preCartItem = preCart[index];

        const updateProduct = await Product.findOneAndUpdate(
          {_id: preCartItem._id},
          {$addToSet:
            {orders: order, buyers: buyer}
          },
          {new: true, useFindAndModify: false}
        )
        console.log(`
            index: ${index},
            productId: ${preCartItem._id},
            updatedProduct-orders: ${updateProduct.orders}
            updatedProduct-buyers: ${updateProduct.buyers}
          `);
        }

      // return {
      //   ...updateUser._doc,
      //   _id: updateUser._id
      // };
      return {
        ...result._doc,
        _id: result._id
      };
    } catch (err) {
      throw err;
    }
  }
};
