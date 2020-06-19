const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const DataLoader = require('dataloader');
const mongoose = require('mongoose');


const User = require('../../models/user');
const Lesson = require('../../models/lesson');
const Order = require('../../models/order');
const Review = require('../../models/review');
const Perk = require('../../models/perk');
const Promo = require('../../models/promo');
const Comment = require('../../models/comment');
const Message = require('../../models/message');
const Notification = require('../../models/notification');

const util = require('util');

const { transformOrder } = require('./merge');
const { dateToString } = require('../../helpers/date');
const { pocketVariables } = require('../../helpers/pocketVars');


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
  getOrdersByTotalsRange: async (args, req) => {
    console.log("Resolver: getOrdersByTotalsRange...");
    if (!req.isAuth) {
      throw new Error('Unauthenticated!');
    }
    try {

      const orders = await Order.find({'schedule': {$gte: startDate, $lte: endDate}});

      return orders.map(order => {
        return transformOrder(order);
      });
    } catch (err) {
      throw err;
    }
  },
  getOrdersByBuyer: async (args, req) => {
    console.log("Resolver: getOrdersByBuyer...");
    if (!req.isAuth) {
      throw new Error('Unauthenticated!');
    }
    try {
      const buyer = await User.findById({_id: args.buyerId});
      const orders = await Order.find({buyer: buyer});

      return orders.map(order => {
        return transformOrder(order);
      });
    } catch (err) {
      throw err;
    }
  },
  getOrdersByReceiver: async (args, req) => {
    console.log("Resolver: getOrdersByReceiver...");
    if (!req.isAuth) {
      throw new Error('Unauthenticated!');
    }
    try {
      const reciever = await User.findById({_id: args.recieverId});
      const orders = await Order.find({reciever: reciever});

      return orders.map(order => {
        return transformOrder(order);
      });
    } catch (err) {
      throw err;
    }
  },
  getOrdersByBuyerReceiver: async (args, req) => {
    console.log("Resolver: getOrdersByBuyerReceiver...");
    if (!req.isAuth) {
      throw new Error('Unauthenticated!');
    }
    try {
      const user = await User.findById({_id: args.userId});
      const orders = await Order.find({[args.role]: user});

      return orders.map(order => {
        return transformOrder(order);
      });
    } catch (err) {
      throw err;
    }
  },
  getOrdersByLesssons: async (args, req) => {
    console.log("Resolver: getOrdersByLesssons...");
    if (!req.isAuth) {
      throw new Error('Unauthenticated!');
    }
    try {
      const lessons = await Lesson.find({_id: {$in: args.lessonIds}});
      const orders = await Order.find({'lessons.ref': {$all: lessons}});

      return orders.map(order => {
        return transformOrder(order);
      });
    } catch (err) {
      throw err;
    }
  },
  getOrdersByBillingAddress: async (args, req) => {
    console.log("Resolver: getOrdersByBillingAddress...");
    if (!req.isAuth) {
      throw new Error('Unauthenticated!');
    }
    try {
      const billingAddress = {
        number: args.orderInput.billingAddressNumber,
        street: args.orderInput.billingAddressStreet,
        town: args.orderInput.billingAddressTown,
        city: args.orderInput.billingAddressCity,
        counrty: args.orderInput.billingAddressCountry,
        postCode: args.orderInput.billingAddressPostalCode
      };
      const orders = await Order.find({'billingAddress': billingAddress});

      return orders.map(order => {
        return transformOrder(order);
      });
    } catch (err) {
      throw err;
    }
  },
  getOrdersByShippingAddress: async (args, req) => {
    console.log("Resolver: getOrdersByShippingAddress...");
    if (!req.isAuth) {
      throw new Error('Unauthenticated!');
    }
    try {
      const shippingAddress = {
        number: args.orderInput.shippingAddressNumber,
        street: args.orderInput.shippingAddressStreet,
        town: args.orderInput.shippingAddressTown,
        city: args.orderInput.shippingAddressCity,
        counrty: args.orderInput.shippingAddressCountry,
        postCode: args.orderInput.shippingAddressPostalCode
      };
      const orders = await Order.find({'shippingAddress': shippingAddress});

      return orders.map(order => {
        return transformOrder(order);
      });
    } catch (err) {
      throw err;
    }
  },
  getOrdersByAddresses: async (args, req) => {
    console.log("Resolver: getOrdersByShippingAddress...");
    if (!req.isAuth) {
      throw new Error('Unauthenticated!');
    }
    try {
      const billingAddress = {
        number: args.orderInput.billingAddressNumber,
        street: args.orderInput.billingAddressStreet,
        town: args.orderInput.billingAddressTown,
        city: args.orderInput.billingAddressCity,
        counrty: args.orderInput.billingAddressCountry,
        postCode: args.orderInput.billingAddressPostalCode
      };
      const shippingAddress = {
        number: args.orderInput.shippingAddressNumber,
        street: args.orderInput.shippingAddressStreet,
        town: args.orderInput.shippingAddressTown,
        city: args.orderInput.shippingAddressCity,
        counrty: args.orderInput.shippingAddressCountry,
        postCode: args.orderInput.shippingAddressPostalCode
      };
      const orders = await Order.find({'shippingAddress': shippingAddress, 'billingAddress': billingAddress});

      return orders.map(order => {
        return transformOrder(order);
      });
    } catch (err) {
      throw err;
    }
  },
  updateOrderBasic: async (args, req) => {
    console.log("Resolver: updateOrderBasic...");
    if (!req.isAuth) {
      throw new Error('Unauthenticated!');
    }
    try {
      const order = await Order.findOneAndUpdate({_id:args.orderId},{
          date: args.orderInput.date,
          time: args.orderInput.time,
          type: args.orderInput.type,
          description: args.orderInput.description,
          notes: args.orderInput.notes,
          payment: args.orderInput.payment,
          shipping: args.orderInput.shipping,
        },{new: true, useFindAndModify: false})
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
  updateOrderByField: async (args, req) => {
    console.log("Resolver: updateOrderField...");
    if (!req.isAuth) {
      throw new Error('Unauthenticated!');
    }
    try {
      const resolverField = args.field;
      const resolverQuery = args.query;
      const query = {[resolverField]:resolverQuery};
      const order = await Order.findOneAndUpdate({_id:args.orderId},query,{new: true, useFindAndModify: false})
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
  updateOrderBuyerReceiver: async (args, req) => {
    console.log("Resolver: updateOrderBuyerReceiver...");
    if (!req.isAuth) {
      throw new Error('Unauthenticated!');
    }
    try {
      const role = args.role;
      const user = await User.findById({_id: args.userId});
      const order = await Order.findOneAndUpdate({_id:args.orderId},
        {[role]: user},
        {new: true, useFindAndModify: false})
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
  updateOrderTax: async (args, req) => {
    console.log("Resolver: updateOrderTax...");
    if (!req.isAuth) {
      throw new Error('Unauthenticated!');
    }
    try {
      const tax = {
        description: args.orderInput.taxDescription,
        amount: args.orderInput.taxAmount,
      };
      const order = await Order.findOneAndUpdate({_id:args.orderId},
        {tax: tax},
        {new: true, useFindAndModify: false})
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
  updateOrderTotals: async (args, req) => {
    console.log("Resolver: updateOrderTotals...");
    if (!req.isAuth) {
      throw new Error('Unauthenticated!');
    }
    try {
      const totals = {
        a: args.orderInput.totalA,
        b: args.orderInput.totalB,
        c: args.orderInput.totalC,
      };
      const order = await Order.findOneAndUpdate({_id:args.orderId},
        {totals: totals},
        {new: true, useFindAndModify: false})
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
  updateOrderBillingAddress: async (args, req) => {
    console.log("Resolver: updateOrderBillingAddress...");
    if (!req.isAuth) {
      throw new Error('Unauthenticated!');
    }
    try {
      const billingAddress = {
        number: args.orderInput.billingAddressNumber,
        street: args.orderInput.billingAddressStreet,
        town: args.orderInput.billingAddressTown,
        city: args.orderInput.billingAddressCity,
        country: args.orderInput.billingAddressCountry,
        postalCode: args.orderInput.billingAddressPostalCode
      };
      const order = await Order.findOneAndUpdate({_id:args.orderId},
        {billingAddress: billingAddress},
        {new: true, useFindAndModify: false})
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
  updateOrderShippingAddress: async (args, req) => {
    console.log("Resolver: updateOrderShippingAddress...");
    if (!req.isAuth) {
      throw new Error('Unauthenticated!');
    }
    try {
      const shippingAddress = {
        number: args.orderInput.shippingAddressNumber,
        street: args.orderInput.shippingAddressStreet,
        town: args.orderInput.shippingAddressTown,
        city: args.orderInput.shippingAddressCity,
        country: args.orderInput.shippingAddressCountry,
        postalCode: args.orderInput.shippingAddressPostalCode
      };
      const order = await Order.findOneAndUpdate({_id:args.orderId},
        {shippingAddress: shippingAddress},
        {new: true, useFindAndModify: false})
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
  updateOrderStatus: async (args, req) => {
    console.log("Resolver: updateOrderStatus...");
    if (!req.isAuth) {
      throw new Error('Unauthenticated!');
    }
    try {

      const status = args.orderInput.status;
      const statusObject = {
        value: args.orderInput.statusValue,
        date: args.orderInput.statusDate,
      };
      const query = 'status.'+status+'';
      const order = await Order.findOneAndUpdate({_id:args.orderId},
        {[query]: statusObject},
        {new: true, useFindAndModify: false})
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
  addOrderLesson: async (args, req) => {
    console.log("Resolver: addOrderLesson...");
    if (!req.isAuth) {
      throw new Error('Unauthenticated!');
    }
    try {
      const lesson = await Lesson.findById({_id: args.lessonId});
      const lessonObject = {
        price: lesson.price,
        date: 0,
        ref: lesson
      };
      const order = await Order.findOneAndUpdate({_id:args.orderId},
        {$addToSet: {lessons: lessonObject}},
        {new: true, useFindAndModify: false})
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
  deleteOrderLesson: async (args, req) => {
    console.log("Resolver: deleteOrderLesson...");
    if (!req.isAuth) {
      throw new Error('Unauthenticated!');
    }
    try {
      const lesson = await Lesson.findById({_id: args.lessonId});
      const order = await Order.findOneAndUpdate({_id:args.orderId},
        {$pull: {lessons: {ref: lesson}}},
        {new: true, useFindAndModify: false})
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
      .populate('perks')
      .populate('promos')
      .populate('friends')
      .populate('likedLessons')
      .populate('toTeachLessons')
      .populate('bookedLessons.ref')
      .populate('attendedLessons.ref')
      .populate('taughtLessons.ref')
      .populate('wishlist.ref')
      .populate('cart.lesson')
      .populate({
        path:'reviews',
        populate: {
          path: 'author',
          model: 'User'
        }
      })
      .populate({
        path:'reviews',
        populate: {
          path: 'lesson',
          model: 'Lesson'
        }
      })
      .populate({
        path: 'messages',
        populate: {
          path: 'sender',
          model: 'User'
        }})
      .populate({
        path: 'messages',
        populate: {
          path: 'receiver',
          model: 'User'
        }})
      .populate({
        path: 'orders',
        populate: {
          path: 'buyer',
          model: 'User'
        }})
      .populate({
        path: 'orders',
        populate: {
          path: 'receiver',
          model: 'User'
        }})
      .populate({
        path: 'orders',
        populate: {
          path: 'lessons.ref',
          model: 'Lesson'
        }})
      .populate({
        path: 'notifications',
        populate: {
          path: 'creator',
          model: 'User'
        }
      })
      .populate({
        path: 'notifications',
        populate: {
          path: 'recipients',
          model: 'User'
        }
      })
      .populate({
        path: 'notifications',
        populate: {
          path: 'lesson',
          model: 'Lesson'
        }
      })
      .populate('friendRequests.sender')
      .populate('cancellations.lesson')
      .populate('friendRequests.receiver');

      return {
        ...user._doc,
      };
    } catch (err) {
      throw err;
    }
  }
};
