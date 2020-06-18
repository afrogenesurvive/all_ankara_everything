const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
  password: {type: String,required: true},
  name: {type: String,required: true},
  role: {type: String},
  username: {type: String,required: true},
  dob:{type: Date},
  public: {type: Boolean},
  age: {type:Number},
  addresses: [{
    type: {type:String, enum: ['Shipping', 'Billing']},
    number: {type:Number},
    street: {type: String},
    town: {type: String},
    city: {type:String},
    country: {type:String},
    postalCode: {type:String},
    primary: {type: Boolean},
    _id : false
  }],
  contact: {
    phone: {type: String},
    phone2: {type: String},
    email: {type: String,required: true},
  },
  bio: {type: String},
  profileImages: [{
    name: {type:String},
    type: {type: String},
    path: {type: String},
    public: {type: Boolean},
    _id : false
  }],
  socialMedia: [{
    platform: {type:String},
    handle: {type:String},
    link: {type: String},
    _id : false
  }],
  interests: [{type: String}],
  perks: [{type: Schema.Types.ObjectId,ref: 'Perk'}],
  promos: [{type: Schema.Types.ObjectId,ref: 'Promo'}],
  friends:[{type: Schema.Types.ObjectId,ref: 'User'}],
  points: {type: Number},
  tags: [{type: String}],
  loggedIn: {type: Boolean},
  clientConnected: {type: Boolean},
  verification:{
    verified:{type: Boolean},
    type:{type: String},
    code:{type: String}
  },
  activity:[{
    date: {type: Date},
    request: {type: String},
    _id : false
  }],
  likedLessons: [{type: Schema.Types.ObjectId,ref: 'Lesson'}],
  bookedLessons: [{
    date: {type: Date},
    session:{
      title: {type: String},
      date: {type: Date},
      time: {type: String}
    },
    ref: {type: Schema.Types.ObjectId,ref: 'Lesson'},
    _id : false
  }],
  attendedLessons: [{
    date: {type: Date},
    ref: {type: Schema.Types.ObjectId,ref: 'Lesson'},
    _id : false
  }],
  taughtLessons: [{
    date: {type: Date},
    ref: {type: Schema.Types.ObjectId,ref: 'Lesson'},
    _id : false
  }],
  toTeachLessons: [{type: Schema.Types.ObjectId,ref: 'Lesson'}],
  wishlist: [{
    date: {type: Date},
    ref: {type: Schema.Types.ObjectId,ref: 'Lesson'},
    booked: {type: Boolean},
    _id : false
  }],
  cart: [{
    dateAdded: {type: Date},
    sessionDate: {type: Date},
    sessionTitle: {type: String},
    lesson: {type: Schema.Types.ObjectId,ref: 'Lesson'},
    _id : false
  }],
  reviews: [{type: Schema.Types.ObjectId,ref: 'Review'}],
  comments: [{type: Schema.Types.ObjectId,ref: 'Comment'}],
  messages: [{type: Schema.Types.ObjectId,ref: 'Message'}],
  orders: [{type: Schema.Types.ObjectId,ref: 'Order'}],
  paymentInfo: [{
    date: {type: Date},
    type: {type: String},
    description: {type: String},
    body: {type: String},
    valid: {type: Boolean},
    primary: {type: Boolean},
    _id : false
  }],
  friendRequests: [{
    date: {type: Date},
    sender: {type: Schema.Types.ObjectId,ref: 'User'},
    receiver: {type: Schema.Types.ObjectId,ref: 'User'},
    _id : false
  }],
  affiliate: {
    referrer: {type: Schema.Types.ObjectId,ref: 'User'},
    code: {type: String},
    referees: [{
      date: {type: Date},
      referee: {type: Schema.Types.ObjectId,ref: 'User'}
    }],
    reward: {type: Number},
    _id : false
  },
  cancellations: [{
    date: {type: String},
    reason: {type: String},
    sessionDate: {type: Date},
    sessionTitle: {type: String},
    lesson: {type: Schema.Types.ObjectId,ref: 'Lesson'}
  }],
  notifications: [{type: Schema.Types.ObjectId,ref: 'Notification'}]
},
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
