const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const DataLoader = require('dataloader');
const User = require('../../models/user');
const Product = require('../../models/product');
const Order = require('../../models/order');
const Review = require('../../models/review');
const util = require('util');
const moment = require('moment');

const { transformUser } = require('./merge');
const { dateToString } = require('../../helpers/date');
const { pocketVariables } = require('../../helpers/pocketVars');

const sgMail = require('@sendgrid/mail');
const AWS = require('aws-sdk');
// const stripe = require('stripe')(process.env.STRIPE_B);

module.exports = {
  cronTest: async (args) => {
    console.log("Resolver: cronTest...",args);
    // try {
    //   return
    // } catch (err) {
    //   throw err;
    // }
  },
  testEmail: async () => {
    console.log("Resolver: test email...");
    try {
      let sendStatus = null;
      // console.log(process.env.SENDGRID_A);
      sgMail.setApiKey(process.env.SENDGRID_A);
      const msg = {
        to: 'michael.grandison@gmail.com',
        from: 'african.genetic.survival@gmail.com',
        subject: 'Its yah Booiii!!!',
        text: 'and easy to do anywhere, even with Node.js',
        html: '<strong>and easy to do anywhere, even with Node.js</strong>',
      };
      sgMail
        .send(msg)
        .then(() => {
          // console.log('Email Sent!');
          sendStatus = 'Email Sent!';
          console.log('sendStatus',sendStatus);
        })
        .catch(error => {
          // console.error(error.toString());
          const {message, code, response} = error;
          const {headers, body} = response;
          sendStatus = error.toString()+response;
          console.log('sendStatus',sendStatus);
        });

      // return users.map(user => {
      //   return transformUser(user,);
      // });

      return sendStatus;
    } catch (err) {
      throw err;
    }
  },
  getAllUsers: async (args, req) => {
    console.log("Resolver: getAllUsers...");
    if (!req.isAuth) {
      throw new Error('Unauthenticated!');
    }
    try {
      const users = await User.find()
      .populate('wishlist')
      .populate('liked')
      .populate('cart')
      .populate('reviews')
      .populate('orders')
      .populate('affiliate.referrer');
      return users.map(user => {
        return transformUser(user,);
      });
    } catch (err) {
      throw err;
    }
  },
  getUserById: async (args, req) => {
    console.log("Resolver: getUserById...");
    if (!req.isAuth) {
      throw new Error('Unauthenticated!');
    }
    try {
      const user = await User.findById(args.userId)
      .populate('wishlist')
      .populate('liked')
      .populate('cart')
      .populate('reviews')
      .populate('orders')
      .populate('affiliate.referrer');
        return {
            ...user._doc,
            _id: user.id,
            name: user.name
        };
    } catch (err) {
      throw err;
    }
  },
  getUsersByField: async (args, req) => {
    console.log("Resolver: getUsersByField...");
    if (!req.isAuth) {
      throw new Error('Unauthenticated!');
    }
    try {
      let resolverField = args.field;
      let resolverQuery = args.query;
      const query = {[resolverField]:resolverQuery};
      const users = await User.find(query)
      .populate('wishlist')
      .populate('liked')
      .populate('cart')
      .populate('reviews')
      .populate('orders')
      .populate('affiliate.referrer');
      return users.map(user => {
        return transformUser(user);
      });
    } catch (err) {
      throw err;
    }
  },
  getUsersByFieldRegex: async (args, req) => {
    console.log("Resolver: getUsersByFieldRegex...");
    if (!req.isAuth) {
      throw new Error('Unauthenticated!');
    }
    try {
      let resolverField = args.field;
      const regExpQuery = new RegExp(args.query)
      let resolverQuery = {$regex: regExpQuery, $options: 'i'};
      const query = {[resolverField]:resolverQuery};
      const users = await User.find(query)
      .populate('wishlist')
      .populate('liked')
      .populate('cart')
      .populate('reviews')
      .populate('orders')
      .populate('affiliate.referrer');
      return users.map(user => {
        return transformUser(user);

      });
    } catch (err) {
      throw err;
    }
  },
  getUsersByInterests: async (args, req) => {
    console.log("Resolver: getUsersByInterests...");
    if (!req.isAuth) {
      throw new Error('Unauthenticated!');
    }
    try {
      const interests = args.userInput.interests.split(',');
      const users = await User.find({'interests': {$all: interests}})
      .populate('wishlist')
      .populate('liked')
      .populate('cart')
      .populate('reviews')
      .populate('orders')
      .populate('affiliate.referrer');
      return users.map(user => {
        return transformUser(user);
      });
    } catch (err) {
      throw err;
    }
  },
  getUsersByPointRange: async (args, req) => {
    console.log("Resolver: getUsersByPointRange...");
    if (!req.isAuth) {
      throw new Error('Unauthenticated!');
    }
    try {
      const users = await User.find({points: {$gte: args.lower, $lte: args.upper}})
      return users.map(user => {
        return transformUser(user);
      });
    } catch (err) {
      throw err;
    }
  },
  getThisUser: async (args, req) => {
    console.log("Resolver: getThisUser...");
    if (!req.isAuth) {
      throw new Error('Unauthenticated!');
    }
    try {
      const user = await User.findById({_id: args.activityId})
      .populate('wishlist')
      .populate('liked')
      .populate('cart')
      .populate('reviews')
      .populate('orders')
      .populate('affiliate.referrer');
      return {
        ...user._doc,
        _id: user.id,
        email: user.contact.email ,
        name: user.name,
      };
    } catch (err) {
      throw err;
    }
  },
  getPocketVars: async (args, req) => {
    console.log('Resolver: getPocketVars...');
    if (!req.isAuth) {
      throw new Error('Unauthenticated!');
    }
    try {
      const pocketVars = process.env.CREDS;
      return pocketVars;
    } catch (err) {
      throw err;
    }
  },
  requestPasswordReset: async (args) => {
    console.log('Resolver: requestPasswordReset...');
    try {
      const username = args.userInput.username;
      const email = args.userInput.email;
      const userExists = await User.findOne({username: args.userInput.username, 'contact.email': args.userInput.contactEmail})
      if (!userExists) {
        console.log('...user doesnt exist. Check your credentials and try again...');
        throw new Error('...user doesnt exist. Check your credentials and try again...')
      }

      let verificationCode = '0';
      console.log(`
        args: ${args},
        moment: ${moment}
        `);
        // verification code = today's date user id * random btwn 1-5

      const user = await User.findOneAndUpdate(
        {_id: userExists._id},
        {verification: {
          verified: false,
          type: 'passwordReset',
          code: verificationCode
        }},
        {new: true, useFindAndModify: false}
      )
      const key = 'Request_All_Ankara_New_Everything_Password';
      const encryptor = require('simple-encryptor')(key);
      const encrypted = encryptor.encrypt(verificationCode);
      const resetUrl = 'localhost:3000/passwordReset/'+userExists._id+'@'+encrypted+'';
      const userEmail = user.contact.email;
      // console.log('resetUrl',resetUrl);

      let sendStatus = null;

      sgMail.setApiKey(process.env.SENDGRID_A);
      const msg = {
        to: userEmail,
        from: 'african.genetic.survival@gmail.com',
        subject: 'Password Reset',
        text: `
          ... use this url to reset your password...
          ${resetUrl} ...
        `,
        html: `
        <strong>
        ... use this url to reset your password...
        <a target="_blank">
        ${resetUrl}
        </a> ...
        </strong>`,
      };
      sgMail
        .send(msg)
        .then(() => {
          sendStatus = 'Email Sent!';
          console.log('sendStatus',sendStatus);
        })
        .catch(error => {
          const {message, code, response} = error;
          const {headers, body} = response;
          sendStatus = error.toString()+response;
          console.log('sendStatus',sendStatus);
        });

      return {
          ...user._doc,
          _id: user.id,
          name: user.name
      };
    } catch (err) {
      throw err;
    }
  },
  resetUserPassword: async (args) => {
    console.log('Resolver: resetUserPassword...');
    try {

      let verificationChallengeCode = 0;
      const key = 'All_Ankara_Everything_Reset';
      const encryptor = require('simple-encryptor')(key);
      verificationChallengeCode = encryptor.decrypt(args.verification);
      console.log('verificationChallengeCode',verificationChallengeCode);
      const preUser = await User.findById({_id: args.userId});
      const verificationResponse = preUser.verification;
      if (verificationResponse.type !== 'passwordReset') {
        console.log('...umm no... reset request doesnt match our records... are you hacking??');
        throw new Error('...umm no... reset request doesnt match our records... are you hacking??')
      }
      if (verificationResponse.code !== verificationChallengeCode) {
        console.log('...there was an error with password reset verification... contact tech support or request a new reset email...');
        throw new Error('...there was an error with password reset verification... contact tech support or request a new reset email...')
      }
      else {
        console.log('...password reset verification success... resetting password...');
      }
      const password = args.userInput.password;
      const hashedPassword = await bcrypt.hash(password, 12);
      const user = await User.findOneAndUpdate(
        {_id: args.userId},
        { $set:
          {password: hashedPassword,
            verification: {
              verified: true,
              type: null,
              code: null
          }}
        },
        {new: true, useFindAndModify: false}
      )
      return {
          ...user._doc,
          _id: user.id,
          name: user.name
      };
    } catch (err) {
      throw err;
    }
  },
  verifyUser: async (args, req) => {
    console.log("Resolver: verifyUser...");
    // if (!req.isAuth) {
    //   throw new Error('Unauthenticated!');
    // }
    try {
      const challenge = {
        type: args.userInput.verificationType,
        code: args.userInput.verificationCode,
      }
      const preUser = await User.findOne({'contact.email': args.userInput.contactEmail});
      const response = {
        type: preUser.verification.type,
        code: preUser.verification.code,
      };
      console.log('challenge', challenge, 'response',response, 'match',challenge.type === response.type && challenge.code === response.code);
      if (challenge.type !== response.type && challenge.code !== response.code) {
        throw new Error('challenge and response do not match. Check the type and code sent in the verification email and try again');
      }
      if (challenge.type === response.type && challenge.code === response.code) {
        console.log("success");;
      }
      const user = await User.findOneAndUpdate({_id: preUser._id},{
        verification: {
          verified: true,
          type: response.type,
          code: null
        }
      },{new: true, useFindAndModify: false});
      return {
        ...user._doc,
        _id: user.id,
        name: user.name,
        username: user.username
      };
    } catch (err) {
      throw err;
    }
  },
  userOnline: async (args, req) => {
    console.log("Resolver: userOnline...");
    if (!req.isAuth) {
      throw new Error('Unauthenticated!');
    }
    try {
      const user = await User.findOneAndUpdate({_id:args.userId},{clientConnected: true},{new: true, useFindAndModify: false})
      .populate('wishlist')
      .populate('liked')
      .populate('cart')
      .populate('reviews')
      .populate('orders')
      .populate('affiliate.referrer');
      return {
        ...user._doc,
        _id: user.id,
        email: user.contact.email ,
        name: user.name,
      };
    } catch (err) {
      throw err;
    }
  },
  userOffline: async (args, req) => {
    console.log("Resolver: userOffline...");
    if (!req.isAuth) {
      throw new Error('Unauthenticated!');
    }
    try {
      const user = await User.findOneAndUpdate({_id:args.userId},{clientConnected: false},{new: true, useFindAndModify: false})
      .populate('wishlist')
      .populate('liked')
      .populate('cart')
      .populate('reviews')
      .populate('orders')
      .populate('affiliate.referrer');
      return {
        ...user._doc,
        _id: user.id,
        email: user.contact.email ,
        name: user.name,
      };
    } catch (err) {
      throw err;
    }
  },
  updateUserAllFields: async (args, req) => {
    console.log("Resolver: updateUserAllFields...");
    if (!req.isAuth) {
      throw new Error('Unauthenticated!');
    }
    try {
      let dob = moment(args.userInput.dob).format('YYYY-MM-DD');
      let dob2 = new Date(args.userInput.dob);
      let ageDifMs = new Date() - dob2.getTime();
      let ageDate = new Date(ageDifMs);
      let age =  Math.abs(ageDate.getUTCFullYear() - 1970);

      const user = await User.findOneAndUpdate(
        {_id:args.userId},
        {
          name: args.userInput.name,
          role: args.userInput.role,
          type: args.userInput.type,
          username: args.userInput.username,
          dob: dob,
          age: age,
          contact: {
            email: args.userInput.contactEmail,
            phone: args.userInput.contactPhone,
          },
          bio: args.userInput.bio
        },
        {new: true, useFindAndModify: false})
      .populate('wishlist')
      .populate('liked')
      .populate('cart')
      .populate('reviews')
      .populate('orders')
      .populate('affiliate.referrer');
      return {
        ...user._doc,
        _id: user.id,
        email: user.contact.email ,
        name: user.name,
      };
    } catch (err) {
      throw err;
    }
  },
  updateUserSingleField: async (args, req) => {
    console.log("ResolverupdateUserSingleField...");
    if (!req.isAuth) {
      throw new Error('Unauthenticated!');
    }
    try {
      let query =  '';
      const resolverField = args.field;
      const resolverQuery = args.query;
      query = {[resolverField]:resolverQuery};
      if (args.field === 'dob') {
        let dob = moment(args.query).format('YYYY-MM-DD');
        let dob2 = new Date(args.query);
        let ageDifMs = new Date() - dob2.getTime();
        let ageDate = new Date(ageDifMs);
        let age =  Math.abs(ageDate.getUTCFullYear() - 1970);
        query = {
          dob: dob,
          age: age
        }
      }
      const user = await User.findOneAndUpdate(
        {_id:args.userId},
        query,
        {new: true, useFindAndModify: false})
      .populate('wishlist')
      .populate('liked')
      .populate('cart')
      .populate('reviews')
      .populate('orders')
      .populate('affiliate.referrer');
      return {
        ...user._doc,
        _id: user.id,
        name: user.name,
        username: user.username,
      };
    } catch (err) {
      throw err;
    }
  },
  addUserAddress: async (args, req) => {
    console.log("Resolver: addUserAddress...");
    if (!req.isAuth) {
      throw new Error('Unauthenticated!');
    }
    try {
      const address = {
        type: args.userInput.addressType,
        number: args.userInput.addressNumber,
        street: args.userInput.addressStreet,
        town: args.userInput.addressTown,
        city: args.userInput.addressCity,
        country: args.userInput.addressCountry,
        postalCode: args.userInput.addressPostalCode,
        primary: false
      };

      const user = await User.findOneAndUpdate(
        {_id:args.userId},
        {$addToSet: {addresses: address}},
        {new: true, useFindAndModify: false}
      )
      .populate('wishlist')
      .populate('liked')
      .populate('cart')
      .populate('reviews')
      .populate('orders')
      .populate('affiliate.referrer');
      return {
        ...user._doc,
        _id: user.id,
        name: user.name,
        username: user.username,
      };
    } catch (err) {
      throw err;
    }
  },
  deleteUserAddress: async (args, req) => {
    console.log("Resolver: deleteUserAddress...");
    if (!req.isAuth) {
      throw new Error('Unauthenticated!');
    }
    try {
      // const activityUser = await User.findById({_id: args.activityId});
      // if (activityUser.role !== "Admin" && args.activityId !== args.userId) {
      //   throw new Error("Yaah.. No! Only the owner or Admin can delete a User Address");
      // };
        const address = {
          type: args.userInput.addressType,
          number: args.userInput.addressNumber,
          street: args.userInput.addressStreet,
          town: args.userInput.addressTown,
          city: args.userInput.addressCity,
          country: args.userInput.addressCountry,
          postalCode: args.userInput.addressPostalCode,
          primary: args.userInput.addressPrimary
        };
        const user = await User.findOneAndUpdate(
          {_id:args.userId},
          {$pull: { 'addresses': address }},
          {new: true, useFindAndModify: false}
        )
        .populate('wishlist')
        .populate('liked')
        .populate('cart')
        .populate('reviews')
        .populate('orders')
        .populate('affiliate.referrer');

        return {
          ...user._doc,
          _id: user.id,
          email: user.contact.email ,
          name: user.name,
        };
    } catch (err) {
      throw err;
    }
  },
  setUserAddressPrimary: async (args, req) => {
    console.log("Resolver: setUserAddressPrimary...");
    if (!req.isAuth) {
      throw new Error('Unauthenticated!');
    }
    try {
      const nerfLikeAddresses = await User.findOneAndUpdate(
        {_id: args.userId, 'addresses.type':args.userInput.addressType},
        {$set: {'addresses.$[elem].primary': false}},
        {
          arrayFilters: [ { "elem.type": args.userInput.addressType } ],
          new: true,
          useFindAndModify: false
        }
      )
      const address = {
        type: args.userInput.addressType,
        number: args.userInput.addressNumber,
        street: args.userInput.addressStreet,
        town: args.userInput.addressTown,
        city: args.userInput.addressCity,
        country: args.userInput.addressCountry,
        postalCode: args.userInput.addressPostalCode,
        primary: args.userInput.addressPrimary,
      };
      const user = await User.findOneAndUpdate(
        {_id:args.userId,
          addresses: address
        },
        {'addresses.$.primary': true},
        {new: true, useFindAndModify: false}
      )
      .populate('wishlist')
      .populate('liked')
      .populate('cart')
      .populate('reviews')
      .populate('orders')
      .populate('affiliate.referrer');
      return {
        ...user._doc,
        _id: user.id,
        email: user.contact.email,
        name: user.name,
      };
    } catch (err) {
      throw err;
    }
  },
  addUserPoints: async (args, req) => {
    console.log("Resolver: addUserPoints...");
    if (!req.isAuth) {
      throw new Error('Unauthenticated!');
    }
    try {
      const activityUser = await User.findById({_id: args.activityId});
      if (activityUser.role !== "Admin") {
        throw new Error("How'd you find this!? Silly User. Tokens are for Admin");
      }
      const prevAmountUser = await User.findById({_id: args.userId});
      const prevAmount = prevAmountUser.points;
      const amountToAdd = args.userInput.points;
      let newAmount = prevAmount + amountToAdd;
      const user = await User.findOneAndUpdate(
        {_id:args.userId},
        { points: newAmount },
        {new: true, useFindAndModify: false}
      )
      .populate('wishlist')
      .populate('liked')
      .populate('cart')
      .populate('reviews')
      .populate('orders')
      .populate('affiliate.referrer');

        return {
          ...user._doc,
          _id: user.id,
          email: user.contact.email ,
          name: user.name,
        };
    } catch (err) {
      throw err;
    }
  },
  addUserLikedProduct: async (args, req) => {
    console.log("Resolver: addUserLikedProduct...");
    if (!req.isAuth) {
      throw new Error('Unauthenticated!');
    }
    try {
      const product = await Product.findById({_id: args.productId});
      const user = await User.findOneAndUpdate(
        {_id:args.userId},
        {$addToSet: { liked: product }},
        {new: true, useFindAndModify: false}
      )
      .populate('wishlist')
      .populate('liked')
      .populate('cart')
      .populate('reviews')
      .populate('orders')
      .populate('affiliate.referrer');

        return {
          ...user._doc,
          _id: user.id,
          email: user.contact.email ,
          name: user.name,
        };
    } catch (err) {
      throw err;
    }
  },
  deleteUserLikedProduct: async (args, req) => {
    console.log("Resolver: deleteUserLikedProduct...");
    if (!req.isAuth) {
      throw new Error('Unauthenticated!');
    }
    try {
      const product = await Product.findById({_id: args.productId});

      const user = await User.findOneAndUpdate(
        {_id:args.userId},
        {$pull: { liked: product }},
        {new: true, useFindAndModify: false}
      )
      .populate('wishlist')
      .populate('liked')
      .populate('cart')
      .populate('reviews')
      .populate('orders')
      .populate('affiliate.referrer');
      console.log('user',user);

        return {
          ...user._doc,
          _id: user.id,
          email: user.contact.email ,
          name: user.name,
        };
    } catch (err) {
      throw err;
    }
  },
  addUserPaymentInfo: async (args, req) => {
    console.log("Resolver: addUserPaymentInfo...");
    if (!req.isAuth) {
      throw new Error('Unauthenticated!');
    }
    try {
      const paymentInfo = {
        date: moment().format('YYYY-MM-DD'),
        type: args.userInput.paymentInfoType,
        description: args.userInput.paymentInfoDescription,
        body: args.userInput.paymentInfoBody,
        valid: args.userInput.paymentInfoValid,
        primary: false,
      };
      const user = await User.findOneAndUpdate(
        {_id:args.userId},
        {$addToSet:{paymentInfo: paymentInfo}},
        {new: true, useFindAndModify: false}
      )
      .populate('wishlist')
      .populate('liked')
      .populate('cart')
      .populate('reviews')
      .populate('orders')
      .populate('affiliate.referrer');

      return {
        ...user._doc,
        _id: user.id,
        name: user.name,
        username: user.username,
      };
    } catch (err) {
      throw err;
    }
  },
  deleteUserPaymentInfo: async (args, req) => {
    console.log("Resolver: deleteUserPaymentInfo...");
    if (!req.isAuth) {
      throw new Error('Unauthenticated!');
    }
    try {
      const activityUser = await User.findById({_id: args.activityId});
      if (activityUser.role !== "Admin" && args.activityId !== args.userId) {
        throw new Error("Yaah.. No! Only the owner or Admin can delete a User PaymentInfo");
      };
        const paymentInfo = {
          date: args.userInput.paymentInfoDate,
          type: args.userInput.paymentInfoType,
          description: args.userInput.paymentInfoDescription,
          body: args.userInput.paymentInfoBody,
          valid: args.userInput.paymentInfoValid,
          primary: args.userInput.paymentInfoPrimary,
        };
        const user = await User.findOneAndUpdate(
          {_id:args.userId},
          // {'paymentInfo': [] },
          {$pull: { 'paymentInfo': paymentInfo }},
          {new: true, useFindAndModify: false}
        )
        .populate('wishlist')
        .populate('liked')
        .populate('cart')
        .populate('reviews')
        .populate('orders')
        .populate('affiliate.referrer');

        return {
          ...user._doc,
          _id: user.id,
          email: user.contact.email ,
          name: user.name,
        };
    } catch (err) {
      throw err;
    }
  },
  setUserPaymentInfoPrimary: async (args, req) => {
    console.log("Resolver: setUserPaymentInfoPrimary...");
    if (!req.isAuth) {
      throw new Error('Unauthenticated!');
    }
    try {
      const nerfAllPaymentInfo = await User.findOneAndUpdate(
        {_id: args.userId},
        {'paymentInfo.$[].primary': false},
        {new: true, useFindAndModify: false}
      )
      const paymentInfo = {
        date: args.userInput.paymentInfoDate,
        type: args.userInput.paymentInfoType,
        description: args.userInput.paymentInfoDescription,
        body: args.userInput.paymentInfoBody,
        valid: args.userInput.paymentInfoValid,
        primary: args.userInput.paymentInfoPrimary
      };
      const user = await User.findOneAndUpdate(
        {_id:args.userId, paymentInfo: paymentInfo},
        {'paymentInfo.$.primary': true},
        {new: true, useFindAndModify: false}
      )
      .populate('wishlist')
      .populate('liked')
      .populate('cart')
      .populate('reviews')
      .populate('orders')
      .populate('affiliate.referrer');

      return {
        ...user._doc,
        _id: user.id,
        email: user.contact.email,
        name: user.name,
      };
    } catch (err) {
      throw err;
    }
  },
  addUserInterests: async (args, req) => {
    console.log("Resolver: addUserInterests...");
    if (!req.isAuth) {
      throw new Error('Unauthenticated!');
    }
    try {
      const interests = args.userInput.interests;
      const splitInterests = interests.split(",");
      const user = await User.findOneAndUpdate(
        {_id:args.userId},
        {$addToSet: { interests: {$each: splitInterests} }},
        {new: true, useFindAndModify: false}
      )
      .populate('wishlist')
      .populate('liked')
      .populate('cart')
      .populate('reviews')
      .populate('orders')
      .populate('affiliate.referrer');

      return {
        ...user._doc,
        _id: user.id,
        email: user.contact.email ,
        name: user.name,
      };
    } catch (err) {
      throw err;
    }
  },
  deleteUserInterest: async (args, req) => {
    console.log("Resolver: deleteUserInterest...");
    if (!req.isAuth) {
      throw new Error('Unauthenticated!');
    }
    try {
        const interest = args.userInput.interest;
        const user = await User.findOneAndUpdate(
          {_id:args.userId},
          {$pull: { interests: interest }},
          {new: true, useFindAndModify: false}
        )
        .populate('wishlist')
        .populate('liked')
        .populate('cart')
        .populate('reviews')
        .populate('orders')
        .populate('affiliate.referrer');
        return {
          ...user._doc,
          _id: user.id,
          email: user.contact.email ,
          name: user.name,
        };
    } catch (err) {
      throw err;
    }
  },
  addUserActivity: async (args, req) => {
    console.log("Resolver: addUserActivity...");

    if (!req.isAuth) {
      throw new Error('Unauthenticated!');
    }
    try {
      const date = moment().format('YYYY-MM-DD');
      const request = args.userInput.activityRequest;
      const activity = {
        date: date,
        request: request,
      };
      const user = await User.findOneAndUpdate(
        {_id:args.userId},
        {$addToSet: {activity: activity}},
        {new: true, useFindAndModify: false}
      )
      .populate('wishlist')
      .populate('liked')
      .populate('cart')
      .populate('reviews')
      .populate('orders')
      .populate('affiliate.referrer');
      return {
        ...user._doc,
        _id: user.id,
        name: user.name,
        username: user.username,
      };
    } catch (err) {
      throw err;
    }
  },
  deleteUserActivity: async (args, req) => {
    console.log("Resolver: deleteUserActivity...");
    if (!req.isAuth) {
      throw new Error('Unauthenticated!');
    }
    try {
      const activityUser = await User.findById({_id: args.activityId});
      if (activityUser.role !== "Admin") {
        throw new Error("Yaah.. No! Only Admin can delete a User Activity");
      };
        const activity = {
          date: args.userInput.activityDate,
          request: args.userInput.activityRequest,
        };
        const user = await User.findOneAndUpdate({_id:args.userId},{$pull: { activity: activity }},{new: true, useFindAndModify: false})


        return {
          ...user._doc,
          _id: user.id,
          email: user.contact.email ,
          name: user.name,
        };
    } catch (err) {
      throw err;
    }
  },
  createUser: async (args, req) => {
    console.log("Resolver: createUser...");
    try {
      const existingUserName = await User.findOne({ username: args.userInput.username});
      if (existingUserName) {
        throw new Error('User w/ that username exists already.');
      }
      const hashedPassword = await bcrypt.hash(args.userInput.password, 12);
      const today = moment();
      let age = 0;
      let dob = moment(args.userInput.dob).format('YYYY-MM-DD');
      let dob2 = new Date(args.userInput.dob);
      let ageDifMs = new Date() - dob2.getTime();
      let ageDate = new Date(ageDifMs);
      age =  Math.abs(ageDate.getUTCFullYear() - 1970);
      // console.log('dob',dob,'age',age);
      let rando = Math.floor(Math.random() * 5) + 1;
      let verfCode = moment().format()+'?'+args.userInput.username+'?'+rando+'';
      const key = 'All_Ankara_Everything_Signup';
      const encryptor = require('simple-encryptor')(key);
      const encrypted = encryptor.encrypt(verfCode);
      // console.log('rando',rando,'verfCode',verfCode,'encrypted',encrypted);
      verfCode = encrypted;

      const user = new User({
        password: hashedPassword,
        name: args.userInput.name,
        role: args.userInput.role,
        type: args.userInput.type,
        username: args.userInput.username,
        dob: args.userInput.dob,
        age: age,
        contact: {
          email: args.userInput.contactEmail,
          phone: args.userInput.contactPhone
        },
        addresses: [{
          type: args.userInput.addressType,
          number: args.userInput.addressNumber,
          street: args.userInput.addressStreet,
          town: args.userInput.addressTown,
          city: args.userInput.addressCity,
          country: args.userInput.addressCountry,
          postalCode: args.userInput.addressPostalCode,
          primary: true
        }],
        bio: args.userInput.bio,
        interests: [],
        points: 0,
        clientConnected: false,
        loggedIn:false,
        verification: {
          verified: false,
          type: "email",
          code: verfCode
        },
        activity: [{
          date: today,
          request: "initial activity... profile created..."
        }],
        liked: [],
        wishlist: [],
        cart: [],
        reviews: [],
        orders: [],
        paymentInfo: []
      });

      const result = await user.save();


      let sendStatus = null;

      sgMail.setApiKey(process.env.SENDGRID_A);
      const msg = {
        to: result.contact.email,
        from: 'african.genetic.survival@gmail.com',
        subject: 'Signup Verification',
        text: `
          Thanks for signing up... use this code to verify your account at login...
          ${result.verification.code}...
        `,
        html: `
        <strong>
        Thanks for signing up... use this code to verify your account at login...
        ${result.verification.code}...
        </strong>`,
      };
      sgMail
        .send(msg)
        .then(() => {
          // console.log('Email Sent!');
          sendStatus = 'Email Sent!';
          console.log('sendStatus',sendStatus);
        })
        .catch(error => {
          // console.error(error.toString());
          const {message, code, response} = error;
          const {headers, body} = response;
          sendStatus = error.toString()+response;
          console.log('sendStatus',sendStatus);
        });
        console.log('verification: ',sendStatus);

      return {
        ...result._doc,
        _id: result.id
      };
    } catch (err) {
      throw err;
    }
  }
};
