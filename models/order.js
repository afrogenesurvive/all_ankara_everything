const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const orderSchema = new Schema({
  date: {type: Date},
  time: {type: String},
  type: {type: String},
  subType: {type: String},
  buyer: {type: Schema.Types.ObjectId,ref: 'User'},
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
  status: {
    cancelled: {
      value: {type: Boolean},
      date: {type: Date},
    },
    held: {
      value: {type: Boolean},
      date: {type: Date},
    },
    paid: {
      value: {type: Boolean},
      date: {type: Date},
    },
    checkedOut: {
      value: {type: Boolean},
      date: {type: Date},
    },
    emailSent: {
      value: {type: Boolean},
      date: {type: Date},
    },
    confirmed: {
      value: {type: Boolean},
      date: {type: Date},
    },
    packaged: {
      value: {type: Boolean},
      date: {type: Date},
    },
    shipped: {
      value: {type: Boolean},
      date: {type: Date},
    },
    delivered: {
      value: {type: Boolean},
      date: {type: Date},
    },
    confirmedDelivery: {
      value: {type: Boolean},
      date: {type: Date},
    }
  },
  feedback: {type: String}
},
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
