const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const DataLoader = require('dataloader');

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
  updateReviewBasic: async (args, req) => {
    console.log("Resolver: updateReviewBasic...");
    if (!req.isAuth) {
      throw new Error('Unauthenticated!');
    }
    try {
      const review = await Review.findOneAndUpdate({_id:args.reviewId},{
        type: args.reviewInput.type,
        title: args.reviewInput.title,
        body: args.reviewInput.body,
        rating: args.reviewInput.rating
        },{new: true, useFindAndModify: false})
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
  updateReviewByField: async (args, req) => {
    console.log("Resolver: updateReviewField...");

    if (!req.isAuth) {
      throw new Error('Unauthenticated!');
    }
    try {
      const resolverField = args.field;
      const resolverQuery = args.query;
      const query = {[resolverField]:resolverQuery};
      const review = await Review.findOneAndUpdate({_id:args.reviewId},query,{new: true, useFindAndModify: false});

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
      const perk = await Review.findByIdAndRemove(args.perkId);
      return {
          ...perk._doc,
          _id: perk.id,
          name: perk.name
      };
    } catch (err) {
      throw err;
    }
  },
  createReview: async (args, req) => {
    console.log("Resolver: createReview...");
    try {
      const user = await User.findById({_id: args.userId})
      // const lessonAttendees = await Lesson.aggregate([
      //   // {$unwind: {path: '$sessions'}},
      //   {$unwind: '$sessions'},
      //   {$unwind: '$sessions.booked'},
      //   // {$unwind: '$sessions.attended'},
      //   // {$group: {_id:{booked:'$sessions.booked',attended:'$sessions.attended'}}}
      //   // {$group: {_id:'$sessions'}}
      //   // {$group: {_id:'$sessions',user:{$sum: '$sessions.booked'}}}
      //   // {$group: {_id:'$sessions',user:{$sum: '$sessions.attended'}}}
      //   // {$group: {_id:'$sessions.booked'}}
      //   {$group: {_id:{lessonId:'$_id',lessonTitle:'$title',sessionTitle:'$sessions.title'},booked:{$addToSet: '$sessions.booked'}}},
      //   // {$group: {_id:{lessonId:'$_id',sessionTitle:'$sessions.title'},attended:{$addToSet: '$sessions.attended'}}},
      //   // {$group: {_id:'$_id',attended:{$addToSet: '$sessions.attended'}}}
      //   // {$group: {_id:'$_id'}}
      //   // {$group: {_id:'$sessions.attended'}}
      //   // {$match: {_id.lessonId: {$eq: args.lessonId }}}
      //   // {$match: {_id: {$eq: session }}}
      //   // {$group: {_id:'$sessions.date', booked: { $addToSet: '$sessions.booked'}}},
      //   // {$match: {_id: {$eq: sessionDate }}}
      //   // {$group: {_id:'$sessions.title', date: { $addToSet: '$sessions.date'}}}
      // ]);
      const lessonAttendees = await Lesson.aggregate([
        {$unwind: '$attendees'},
        {$group: {_id: '$attendees'}}
      ]);
      const lessonAttendees2 = lessonAttendees.map(x => x = x._id)
      const lessonAttendees3 = JSON.stringify(lessonAttendees2)
      let x = {_id: args.userId};

      let userIsLessonAttendee = lessonAttendees3.includes(user._id.toString());
      // let userIsLessonAttendee = lessonAttendees2.filter(x => x === user._id);
      // let userIsLessonAttendee2 = userIsLessonAttendee !== [];
      console.log('userId',user._id,'lessonAttendees',lessonAttendees3,'userIsLessonAttendee',userIsLessonAttendee);
      if (userIsLessonAttendee !== true) {
        throw new Error('Ummm no! Only users whove attended a session of this class can review it');
      }

      const today = new Date().toLocaleDateString().substr(0,10);
      const time = new Date().toLocaleDateString().substr(11,5);
      const author = user;
      const lesson = await Lesson.findById({_id: args.lessonId});

      const existingReview = await Review.findOne({author: author, lesson: lesson});
      if (existingReview) {
        throw new Error('This user has already reviewed this lesson... One review per lesson per user please...');
      }
      const review = new Review({
        date: today,
        type: args.reviewInput.type,
        title: args.reviewInput.title,
        lesson: lesson,
        author: author,
        body: args.reviewInput.body,
        rating: args.reviewInput.rating
      });

      const result = await review.save();
      const updateLesson = await Lesson.findOneAndUpdate({_id: args.lessonId},{$addToSet: {reviews: review} },{new: true, useFindAndModify: false})
      const updateAuthor = await User.findOneAndUpdate(
        {_id: args.userId},
        {$addToSet: {reviews: review} },
        {new: true, useFindAndModify: false}
      )
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
        ...updateAuthor._doc,
        _id: updateAuthor.id,
        email: updateAuthor.contact.email ,
        name: updateAuthor.name,
      };
      // return {
      //   ...result._doc,
      //   date: result.date,
      //   type: result.type,
      //   title: result.title,
      //   lesson: result.lesson,
      //   author: result.author,
      //   body: result.body,
      //   rating: result.rating
      // };
    } catch (err) {
      throw err;
    }
  }
};
