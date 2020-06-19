const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const orderSchema = new Schema({
  date: {type: Date},
  time: {type: String},
  type: {type: String},
  subType: {type: String},
  buyer: {type: Schema.Types.ObjectId,ref: 'Product'},
  products: [{type: Schema.Types.ObjectId,ref: 'Product'}],
  tax: {
    description: {type: String},
    amount: {type: Number}
  },
  shipping: {
    amount: {type: Number},
    description: {type: String}
  },
  total: {type: Number},
  description: {type: String},
  notes: {type: String},
  payment: {type: String},
  billingAddress: {
    number: {type:Number},
    street: {type: String},
    town: {type: String},
    city: {type:String},
    country: {type:String},
    postalCode: {type:String},
  },
  shippingAddress: {
    number: {type:Number},
    street: {type: String},
    town: {type: String},
    city: {type:String},
    country: {type:String},
    postalCode: {type:String},
  },
  status: [{
    type: {
      type: String,
      enum: ['cancelled', 'held', 'paid', 'checkedOut','emailSent','confirmed','packaged','shipped','delivered','confirmedDelivery']
    },
    value: {type: Boolean},
    date: {type: Date}
  }],
  feedback: {type: String}
},
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
