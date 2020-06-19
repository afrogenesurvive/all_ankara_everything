const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
  password: {type: String,required: true},
  name: {type: String,required: true},
  role: {type: String},
  type: {type: String},
  username: {type: String,required: true},
  dob:{type: Date},
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
    email: {type: String,required: true}
  },
  interests: [{type: String}],
  points: {type: Number},
  loggedIn: {type: Boolean},
  clientConnected: {type: Boolean},
  verification:{
    verified:{type: Boolean},
    type:{type: String},
    code:{type: String}
  },
  wishlist: [{type: Schema.Types.ObjectId,ref: 'Product'}],
  liked: [{type: Schema.Types.ObjectId,ref: 'Product'}],
  cart: [{type: Schema.Types.ObjectId,ref: 'Product'}],
  reviews: [{type: Schema.Types.ObjectId,ref: 'Review'}],
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
  activity:[{
    date: {type: Date},
    request: {type: String},
    _id : false
  }],
},
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
