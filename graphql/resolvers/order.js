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
      .populate('buyer')
      .populate('receiver')
      .populate('lessons.ref');

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

      const buyer = await User.findById({_id: args.buyerId}).populate('cart.lesson.ref');
      const receiver = await User.findById({_id: args.receiverId});
      const date = new Date().toLocaleDateString().substr(0,10);
      const time = new Date().toLocaleDateString().substr(11,5);
      const preCart = buyer.cart;
      if (preCart.length === 0) {
        throw new Error('Ummm just no! Your cart is empty...')
      }
      let orderLessonsX = [];
      for (let index = 0; index < preCart.length; index++) {
        let preCartItem = preCart[index];
        let lessonBeta = await Lesson.findById({_id: preCartItem.lesson});
        let preCartItem2 = {
          sku: lessonBeta.sku,
          price: lessonBeta.price,
          date: preCartItem.sessionDate,
          title: preCartItem.sessionTitle,
          ref: lessonBeta
        }
        orderLessonsX.push(preCartItem2);
        // console.log(`
        //     formatting order lessons stage 1:
        //     index: ${index},
        //     preCartItem2: ${preCartItem2},
        //     orderLessonsX.lenght: ${orderLessonsX.length},
        //     orderLessonsX: ${orderLessonsX}
        //   `);
      }


      // const preOrderLessons = preCart.map(lesson => lesson.lesson);
      // const orderLessons = await Lesson.find({_id: {$in: preOrderLessons }});


      // const orderLessons2 = orderLessons.map(lesson => ({
      //   sku: lesson.sku,
      //   price: lesson.price,
      //   date: lesson.sessionDate,
      //   title: lesson.sessionTitle,
      //   ref: lesson,
      //   sessionQty: 0
      // }));
      // const orderLessons3 = orderLessons.map(x => x.price);
      // const orderLessons4 = orderLessons3.reduce((a, b) => a + b, 0);
      // console.log(orderLessons2,orderLessons4);
      // console.log('preCart',preCart);
      // console.log('preOrderLessons',preOrderLessons);
      // console.log('orderLessons2',orderLessons2);
      // console.log('orderLessons3',orderLessons3);
      // console.log('orderLessons4',orderLessons4);


      const order = new Order({
        date: date,
        time: time,
        type: args.orderInput.type,
        buyer: buyer,
        receiver: receiver,
        lessons: orderLessonsX,
        totals:{
          a: args.orderInput.totalA,
          b: args.orderInput.totalB,
          c: args.orderInput.totalC,
        },
        tax:{
          description: args.orderInput.taxDescription,
          amount: args.orderInput.taxAmount,
        },
        description: args.orderInput.description,
        notes: args.orderInput.notes,
        payment: args.orderInput.payment,
        shipping: args.orderInput.shipping,
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
        status: {
          cancelled: {
            value: false,
            date: 0,
          },
          held: {
            value: false,
            date: 0,
          },
          paid: {
            value: true,
            date: date,
          },
          checkedOut: {
            value: true,
            date: date,
          },
          emailSent: {
            value: false,
            date: 0,
          },
          confirmed: {
            value: false,
            date: 0,
          },
          packaged: {
            value: false,
            date: 0,
          },
          shipped: {
            value: false,
            date: 0,
          },
          delivered: {
            value: false,
            date: 0,
          },
          confirmedDelivery: {
            value: false,
            date: 0,
          }
        }
      });

      // console.log('order',order);

      const result = await order.save();
      // console.log('result',result);

      user = await User.findOneAndUpdate(
        {_id: buyer._id},
        {
          $addToSet: {orders: order},
        },
        {new: true, useFindAndModify: false})


      return {
        ...user._doc,
      };
    } catch (err) {
      throw err;
    }
  }
};
