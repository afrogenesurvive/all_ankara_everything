const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const DataLoader = require('dataloader');
const User = require('../../models/user');
const Product = require('../../models/product');
const Order = require('../../models/order');
const Review = require('../../models/review');
const util = require('util');
const moment = require('moment');

const { transformReview } = require('./merge');
const { dateToString } = require('../../helpers/date');
const { pocketVariables } = require('../../helpers/pocketVars');


module.exports = {
  getAllReviews: async (args, req) => {

    console.log("Resolver: getAllReviews...");

    if (!req.isAuth) {
      throw new Error('Unauthenticated!');
    }
    try {
      const reviews = await Review.find({})
      .populate('author')
      .populate('lesson');

      return reviews.map(review => {
        return transformReview(review,);
      });
    } catch (err) {
      throw err;
    }
  },
  getReviewById: async (args, req) => {
    console.log("Resolver: getReviewById...");
    if (!req.isAuth) {
      throw new Error('Unauthenticated!');
    }
    try {

      const review = await Review.findById(args.reviewId)
      .populate('author')
      .populate('lesson');

        return {
            ...review._doc,
            _id: review.id,
            title: review.title
        };
    } catch (err) {
      throw err;
    }
  },
  getReviewsByField: async (args, req) => {
    console.log("Resolver: getReviewByField...");
    if (!req.isAuth) {
      throw new Error('Unauthenticated!');
    }
    try {
      let fieldType = null;
      let resolverField = args.field;
      let resolverQuery = args.query;
      const query = {[resolverField]:resolverQuery};
      const reviews = await Review.find(query)
      .populate('author')
      .populate('lesson');

      return reviews.map(review => {
        return transformReview(review);

      });
    } catch (err) {
      throw err;
    }
  },
  getReviewsByFieldRegex: async (args, req) => {
    console.log("Resolver: getReviewByFieldRegex...");
    if (!req.isAuth) {
      throw new Error('Unauthenticated!');
    }
    try {
      let resolverField = args.field;
      const regExpQuery = new RegExp(args.query)
      let resolverQuery = {$regex: regExpQuery, $options: 'i'};
      const query = {[resolverField]:resolverQuery};
      const reviews = await Review.find(query)
      .populate('author')
      .populate('lesson');

      return reviews.map(review => {
        return transformReview(review);

      });
    } catch (err) {
      throw err;
    }
  },
  updateReviewSingleField: async (args, req) => {
    console.log("Resolver: updateReviewField...");

    if (!req.isAuth) {
      throw new Error('Unauthenticated!');
    }
    try {
      const resolverField = args.field;
      const resolverQuery = args.query;
      const query = {[resolverField]:resolverQuery};
      const review = await Review.findOneAndUpdate(
        {_id:args.reviewId},
        query,
        {new: true, useFindAndModify: false}
      );

      return {
        ...review._doc,
        _id: review.id,
        title: review.title
      };
    } catch (err) {
      throw err;
    }
  },
  deleteReview: async (args, req) => {
    console.log("Resolver: deleteReview...");
    if (!req.isAuth) {
      throw new Error('Unauthenticated!');
    }
    try {
      const preReview = await Review.findById({_id: args.reviewId});

      const review = await Review.findByIdAndRemove(
        {_id: args.reviewId},
        {new: true, useFindAndModify: false}
      );
      const updateAuthor = await User.findOneAndUpdate(
        {_id: review.author},
        {$pull: {reviews: preReview._id}},
        {new: true, useFindAndModify: false}
      )
      const updateProduct = await Product.findOneAndUpdate(
        {_id: review.product},
        {$pull: {reviews: preReview._id}},
        {new: true, useFindAndModify: false}
      )
      return {
          ...review._doc,
          _id: review.id
      };
    } catch (err) {
      throw err;
    }
  },
  createReview: async (args, req) => {
    console.log("Resolver: createReview...");
    try {
      const user = await User.findById({_id: args.userId})

      // const userOrderProducts = await Product.aggregate([
      //   {$unwind: '$buyers'},
      //   {$group: {_id: '$buyers'}},
      //   // {$match: {
      //   //   '_id.date': {$eq: sessionDate },
      //   // }}
      // ]);
      // console.log('user',user._id);
      // console.log('userOrderProducts',userOrderProducts.map(x =>x._id));
      // console.log('x',userOrderProducts.map(x =>x._id).includes(product._id));
      // console.log('y',userOrderProducts.map(x =>x._id).filter(x => x === user._id));
      // const userOrderProducts = await Order.find({_id: {$in: userOders}})

      const datetime = moment().format('YYY-MM-DD,h:mm:ss a').split(',');
      const today = datetime[0];
      const time = datetime[1];
      const author = user;
      const product = await Product.findById({_id: args.productId});
      const hasBought = product.buyers.includes(user._id);
      const existingReview = await Review.findOne({author: author, product: product});
      console.log(`
          hasBought: ${hasBought},
          existingReview: ${existingReview}
        `);
      if (hasBought !== true) {
        console.log('...umm no! You can only review products youve bought');
        throw new Error('...umm no! You can only review products youve bought');
      }
      if (existingReview) {
        console.log('This user has already reviewed this product... One review per product per user please...');
        throw new Error('This user has already reviewed this product... One review per product per user please...');
      }
      const review = new Review({
        date: today,
        type: args.reviewInput.type,
        title: args.reviewInput.title,
        product: product,
        author: author,
        body: args.reviewInput.body,
        rating: args.reviewInput.rating
      });

      const result = await review.save();
      const updateProduct = await Product.findOneAndUpdate(
        {_id: args.productId},
        {$addToSet: {reviews: review} },
        {new: true, useFindAndModify: false}
      )
      const updateAuthor = await User.findOneAndUpdate(
        {_id: args.userId},
        {$addToSet: {reviews: review} },
        {new: true, useFindAndModify: false}
      )

      // return {
      //   ...updateAuthor._doc,
      //   _id: updateAuthor.id,
      //   email: updateAuthor.contact.email ,
      //   name: updateAuthor.name,
      // };

      return {
        ...result._doc,
        date: result.date,
        type: result.type,
        title: result.title,
        lesson: result.lesson,
        author: result.author,
        body: result.body,
        rating: result.rating
      };
    } catch (err) {
      throw err;
    }
  }
};
