const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const DataLoader = require('dataloader');
// const nodemailer = require('nodemailer');
const User = require('../../models/user');
const util = require('util');

const { transformUser } = require('./merge');
const { dateToString } = require('../../helpers/date');
const { pocketVariables } = require('../../helpers/pocketVars');

// const mailjet = require ('node-mailjet')
// .connect(pocketVariables.mailjet.a, pocketVariables.mailjet.b)

const sgMail = require('@sendgrid/mail');
// const S3 = require('aws-sdk/clients/s3');
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
          // console.log('sendStatus',sendStatus);
        })
        .catch(error => {
          // console.error(error.toString());
          const {message, code, response} = error;
          const {headers, body} = response;
          sendStatus = error.toString()+response;
          // console.log('sendStatus',sendStatus);
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
      const users = await User.find({})


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
      let fieldType = null;
      let resolverField = args.field;
      let resolverQuery = args.query;
      const query = {[resolverField]:resolverQuery};
      // console.log(query);
      const users = await User.find(query)


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
      let fieldType = null;
      let resolverField = args.field;
      const regExpQuery = new RegExp(args.query)
      let resolverQuery = {$regex: regExpQuery, $options: 'i'};
      const query = {[resolverField]:resolverQuery};
      // console.log(query);
      const users = await User.find(query)


      return users.map(user => {
        return transformUser(user);

      });
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
      // console.log('pocketVars',pocketVars);
      // const pocketVars = JSON.stringify(pocketVariables);
      // console.log(pocketVariables,pocketVars);
      return pocketVars;
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
      const today = new Date();
      let age = 0;
      let dob = new Date(args.userInput.dob);
      let ageDifMs = Date.now() - dob.getTime();
      let ageDate = new Date(ageDifMs);
      age =  Math.abs(ageDate.getUTCFullYear() - 1970);
      let verfCode = null;
      const user = new User({
        password: hashedPassword,
        name: args.userInput.name,
        role: args.userInput.role,
        username: args.userInput.username,
        dob: args.userInput.dob,
        age: age,
        public: args.userInput.public,
        contact: {
          email: args.userInput.contactEmail,
          phone: args.userInput.contactPhone,
          phone2: args.userInput.contactPhone2
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
        profileImages: [],
        socialMedia: [],
        interests: [],
        perks: [],
        promos: [],
        friends: [],
        points: 0,
        tags: [],
        clientConnected: false,
        loggedIn:false,
        verification: {
          verified: false,
          type: "email",
          code: 'VERF001'
        },
        activity: [{
          date: today,
          request: "initial activity... profile created..."
        }],
        likedLessons: [],
        bookedLessons: [],
        attendedLessons: [],
        taughtLessons: [],
        wishlist: [],
        cart: [],
        comments: [],
        messages: [],
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
          // console.log('sendStatus',sendStatus);
        })
        .catch(error => {
          // console.error(error.toString());
          const {message, code, response} = error;
          const {headers, body} = response;
          sendStatus = error.toString()+response;
          // console.log('sendStatus',sendStatus);
        });
        console.log('verification: ',sendStatus);

      return {
        ...result._doc,
        password: hashedPassword,
        _id: result.id,
        name: result.name,
        role: result.role,
        username: result.username,
        dob: result.dob,
        content: {
          email: result.contact.email,
          phone: result.contact.phone,
          phone2: result.contact.phone2
        },
        addresses: [{
          type: result.addresses[0].type,
          number: result.addresses[0].number,
          street: result.addresses[0].street,
          town: result.addresses[0].town,
          city: result.addresses[0].city,
          country: result.addresses[0].country,
          postalCode: result.addresses[0].postalCode
        }],
        bio: result.bio
      };
    } catch (err) {
      throw err;
    }
  }
};
