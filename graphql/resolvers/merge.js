const DataLoader = require('dataloader');
const User = require('../../models/user');
const Product = require('../../models/product');
const Order = require('../../models/order');
const Review = require('../../models/review');
const { dateToString } = require('../../helpers/date');

const userLoader = new DataLoader(userIds => {
  return users(userIds);
});
const productLoader = new DataLoader(productIds => {
  return products(productIds);
});
const orderLoader = new DataLoader(orderIds => {
  return orders(orderIds);
});
const reviewLoader = new DataLoader(reviewIds => {
  return reviews(reviewIds);
});


const users = async userIds => {
  try {
    const users = await User.find({ _id: { $in: userIds } });
    users.sort((a, b) => {
      return (
        userIds.indexOf(a._id.toString()) - userIds.indexOf(b._id.toString())
      );
    });
    return users.map(user => {
      return transformUser(user);
    });
  } catch (err) {
    throw err;
  }
};
const products = async productIds => {
  try {
    const products = await Product.find({ _id: { $in: productIds } });
    products.sort((a, b) => {
      return (
        productIds.indexOf(a._id.toString()) - productIds.indexOf(b._id.toString())
      );
    });
    return products.map(product => {
      return transformProduct(product);
    });
  } catch (err) {
    throw err;
  }
};
const orders = async orderIds => {
  try {
    const orders = await Order.find({ _id: { $in: orderIds } });
    orders.sort((a, b) => {
      return (
        orderIds.indexOf(a._id.toString()) - orderIds.indexOf(b._id.toString())
      );
    });
    return orders.map(order => {
      return transformOrder(order);
    });
  } catch (err) {
    throw err;
  }
};
const reviews = async orderIds => {
  try {
    const reviews = await Review.find({ _id: { $in: reviewIds } });
    reviews.sort((a, b) => {
      return (
        reviewIds.indexOf(a._id.toString()) - reviewIds.indexOf(b._id.toString())
      );
    });
    return reviews.map(review => {
      return transformReview(review);
    });
  } catch (err) {
    throw err;
  }
};


const singleUser = async userId => {
  try {
    const user = await userLoader.load(userId.toString());
    return user;
  } catch (err) {
    throw err;
  }
};
const singleProduct = async productId => {
  try {
    const product = await productLoader.load(productId.toString());
    return product;
  } catch (err) {
    throw err;
  }
};
const singleOrder = async orderId => {
  try {
    const order = await orderLoader.load(orderId.toString());
    return order;
  } catch (err) {
    throw err;
  }
};
const singleReview = async orderId => {
  try {
    const review = await reviewLoader.load(reviewId.toString());
    return review;
  } catch (err) {
    throw err;
  }
};


const transformUser = user => {
  return {
    ...user._doc,
    _id: user.id,
    name: user.name,
    email: user.email,
  };
};
const transformProduct = product => {
  return {
    ...product._doc,
    _id: product.id,
    name: product.name,
    public: product.public
  };
};
const transformOrder = order => {
  return {
    ...order._doc,
    _id: order.id,
    date: order.date,
    type: order.type,
  };
};
const transformReview = review => {
  return {
    ...review._doc,
    _id: review.id,
    type: review.type,
    title: review.title,
  };
};


exports.transformUser = transformUser;
exports.transformProduct = transformProduct;
exports.transformOrder = transformOrder;
exports.transformReview = transformReview;
