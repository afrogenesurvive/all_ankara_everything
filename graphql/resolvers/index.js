const authResolver = require('./auth');
const userResolver = require('./user');
const productResolver = require('./product');
const orderResolver = require('./order');
const reviewResolver = require('./review');

const rootResolver = {
  ...authResolver,
  ...userResolver,
  ...productResolver,
  ...orderResolver,
  // ...reviewResolver,
};

module.exports = rootResolver;
