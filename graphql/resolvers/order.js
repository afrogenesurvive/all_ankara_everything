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
      .populate('products');
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
      .populate('products');
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
      let resolverField = args.field;
      let resolverQuery = args.query;
      const query = {[resolverField]:resolverQuery};
      const orders = await Order.find(query)
      .populate('buyer')
      .populate('products');
      return orders.map(order => {
        return transformOrder(order);
      });
    } catch (err) {
      throw err;
    }
  },
  getOrdersByFieldRegex: async (args, req) => {
    console.log("Resolver: getOrderByFieldRegex...");
    if (!req.isAuth) {
      throw new Error('Unauthenticated!');
    }
    try {
      let resolverField = args.field;
      const regExpQuery = new RegExp(args.query)
      let resolverQuery = {$regex: regExpQuery, $options: 'i'};
      const query = {[resolverField]:resolverQuery};
      const orders = await Order.find(query)
      .populate('buyer')
      .populate('products');
      return orders.map(order => {
        return transformOrder(order);

      });
    } catch (err) {
      throw err;
    }
  },
  getOrdersByBillingAddress: async (args, req) => {
    console.log("Resolver: getOrderByBillingAddress...");
    if (!req.isAuth) {
      throw new Error('Unauthenticated!');
    }
    try {
      const address = {
        number: args.orderInput.billingAddressNumber,
        street: args.orderInput.billingAddressStreet,
        town: args.orderInput.billingAddressTown,
        city: args.orderInput.billingAddressCity,
        country: args.orderInput.billingAddressCountry,
        postalCode: args.orderInput.billingAddressPostalCode
      };
      const orders = await Order.find({
        billingAddress: address
      })
      .populate('buyer')
      .populate('products');
      return orders.map(order => {
        return transformOrder(order);
      });
    } catch (err) {
      throw err;
    }
  },
  getOrdersByShippingAddress: async (args, req) => {
    console.log("Resolver: getOrderByShippingAddress...");
    if (!req.isAuth) {
      throw new Error('Unauthenticated!');
    }
    try {
      const address = {
        number: args.orderInput.shippingAddressNumber,
        street: args.orderInput.shippingAddressStreet,
        town: args.orderInput.shippingAddressTown,
        city: args.orderInput.shippingAddressCity,
        country: args.orderInput.shippingAddressCountry,
        postalCode: args.orderInput.shippingAddressPostalCode
      };
      const orders = await Order.find({
        shippingAddress: address
      })
      .populate('buyer')
      .populate('products');
      return orders.map(order => {
        return transformOrder(order);
      });
    } catch (err) {
      throw err;
    }
  },
  // getOrdersByStatus: async (args, req) => {
  //   console.log("Resolver: getOrderByStatus...");
  //   if (!req.isAuth) {
  //     throw new Error('Unauthenticated!');
  //   }
  //   try {
  //     const status = {
  //       type: args.orderInput.statusType,
  //       value: args.orderInput.statusValue,
  //       date: args.orderInput.statusDate
  //     };
  //     let query = 'status.'+status.type+'.value';
  //     let query2 = 'status.'+status.type+'';
  //     console.log(query,query2,status.value);
  //     const orders = await Order.find({
  //       query: status.value
  //     })
  //     .populate('buyer')
  //     .populate('products');
  //     return orders.map(order => {
  //       return transformOrder(order);
  //     });
  //   } catch (err) {
  //     throw err;
  //   }
  // },
  updateOrderSingleField: async (args, req) => {
    console.log("Resolver: updateOrderSingleField...");
    if (!req.isAuth) {
      throw new Error('Unauthenticated!');
    }
    try {
      const resolverField = args.field;
      const resolverQuery = args.query;
      query = {[resolverField]:resolverQuery};
      const order = await Order.findOneAndUpdate(
        {_id: args.orderId},
        query,
        {new: true, useFindAndModify: false}
      )
      .populate('buyer')
      .populate('products');
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
  updateOrderShipping: async (args, req) => {
    console.log("Resolver: updateOrderShipping...");
    if (!req.isAuth) {
      throw new Error('Unauthenticated!');
    }
    try {
      const shipping = {
        amount: args.orderInput.shippingAmount,
        description: args.orderInput.shippingDescription
      }
      const order = await Order.findOneAndUpdate(
        {_id: args.orderId},
        {shipping: shipping},
        {new: true, useFindAndModify: false}
      )
      .populate('buyer')
      .populate('products');
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
      const datetime2 = moment().local().format("YYYY-MM-DD,hh:mm:ss a").split(',');
      const date = datetime2[0];
      const time = datetime2[1];
      const status = args.orderInput.status;
      const statusObject = {
        value: args.orderInput.statusValue,
        date: date,
      };
      const query = 'status.'+args.orderInput.statusType+'';
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
  // addOrderStatus: async (args, req) => {
  //   console.log("Resolver: addOrderStatus...");
  //   if (!req.isAuth) {
  //     throw new Error('Unauthenticated!');
  //   }
  //   try {
  //     const status = {
  //       type: args.orderInput.statusType,
  //       value: args.orderInput.statusValue,
  //       date: moment().format('YYYY-MM-DD')
  //     }
  //     const statusTypes = ['cancelled', 'held', 'paid', 'checkedOut','emailSent','confirmed','packaged','shipped','delivered','confirmedDelivery'];
  //     console.log(statusTypes.includes(status.type));
  //     const order = await Order.findOneAndUpdate(
  //       {_id: args.orderId},
  //       // {status: []},
  //       {$addToSet: {status: status}},
  //       {new: true, useFindAndModify: false}
  //     )
  //     .populate('buyer')
  //     .populate('products');
  //       return {
  //           ...order._doc,
  //           _id: order.id,
  //           date: order.date,
  //           type: order.type
  //       };
  //   } catch (err) {
  //     throw err;
  //   }
  // },
  // deleteOrderStatus: async (args, req) => {
  //   console.log("Resolver: deleteOrderStatus...");
  //   if (!req.isAuth) {
  //     throw new Error('Unauthenticated!');
  //   }
  //   try {
  //     const status = {
  //       type: args.orderInput.statusType,
  //       value: args.orderInput.statusValue,
  //       date: args.orderInput.statusDate
  //     }
  //     const order = await Order.findOneAndUpdate(
  //       {
  //         _id: args.orderId,
  //       },
  //       {$pull: {status: status}},
  //       {new: true, useFindAndModify: false}
  //     )
  //     .populate('buyer')
  //     .populate('products');
  //       return {
  //           ...order._doc,
  //           _id: order.id,
  //           date: order.date,
  //           type: order.type
  //       };
  //   } catch (err) {
  //     throw err;
  //   }
  // },
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
      }
      const order = await Order.findOneAndUpdate(
        {_id: args.orderId},
        {billingAddress: billingAddress},
        {new: true, useFindAndModify: false}
      )
      .populate('buyer')
      .populate('products');
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
      }
      const order = await Order.findOneAndUpdate(
        {_id: args.orderId},
        {shippingAddress: shippingAddress},
        {new: true, useFindAndModify: false}
      )
      .populate('buyer')
      .populate('products');
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
  deleteOrderById: async (args, req) => {
    console.log("Resolver: deleteOrderById...");
    if (!req.isAuth) {
      throw new Error('Unauthenticated!');
    }
    try {
      const preOrder = await Order.findById({_id: args.orderId});
      const updateUser = await User.findOneAndUpdate(
        {_id: preOrder.buyer},
        {$pull: {orders: args.orderId}},
        {new: true, useFindAndModify: false}
      );
      // console.log('1',updateUser.orders);
      for (let index = 0; index < preOrder.products.length; index++) {
        let preOrderProduct = preOrder.products[index];
        const updateProduct = await Product.findOneAndUpdate(
          {_id: preOrderProduct},
          {$pull: {orders: args.orderId}},
          {new: true, useFindAndModify: false}
        )
        // console.log('2',updateProduct.orders);
      }
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
      const buyer = await User.findById({_id: args.buyerId})
      .populate('cart');
      const datetime = moment().local().format("YYYY-MM-DD,hh:mm:ss a");
      const datetime2 = moment().local().format("YYYY-MM-DD,hh:mm:ss a").split(',');
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
        },
        feedback: ''
      });

      const result = await order.save();
      const updateUser = await User.findOneAndUpdate(
        {_id: buyer._id},
        {
          $addToSet: {orders: order},
          cart: []
        },
        {new: true, useFindAndModify: false}
      )

      // console.log('updateUser',updateUser.orders);
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
        // console.log(`
        //     index: ${index},
        //     productId: ${preCartItem._id},
        //     updatedProduct-orders: ${updateProduct.orders}
        //     updatedProduct-buyers: ${updateProduct.buyers}
        //   `);
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
