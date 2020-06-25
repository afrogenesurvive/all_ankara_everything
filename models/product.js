const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const productSchema = new Schema({
  public: {type: Boolean},
  name: {type: String,required: true},
  subtitle: {type: String},
  aaeId: {type: String},
  sku: {type: String},
  dateAdded:{type: Date},
  type: {type: String},
  subType: {type: String},
  category: {type: String},
  description: {type: String},
  variant: [{type: String}],
  size: {type: String},
  dimensions: {type: String},
  price: {type: Number},
  points: {type: Number},
  quantity: {type: Number, min: [0, 'No negative product quantities']},
  inStock: {type: Boolean},
  tags: [{type: String}],
  unit: {type: String},
  delivery: {type: String},
  images: [{
    name: {type: String},
    type: {type: String},
    link: {type: String},
    _id: false
  }],
  files: [{
    name: {type: String},
    type: {type: String},
    link: {type: String},
    _id: false
  }],
  listedBy: {type: Schema.Types.ObjectId,ref: 'User'},
  likers: [{type: Schema.Types.ObjectId,ref: 'User'}],
  buyers: [{type: Schema.Types.ObjectId,ref: 'User'}],
  wishlisters: [{type: Schema.Types.ObjectId,ref: 'User'}],
  reviews: [{type: Schema.Types.ObjectId,ref: 'Review'}],
  orders: [{type: Schema.Types.ObjectId,ref: 'Order'}]
},
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);
