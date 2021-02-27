var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  cart: { type: Object, required: true },
  address: { type: String, required: true },
  name: { type: String, required: true },
  type: { type: String, enum: ['COD', 'CARD'], required: true },
  status: {
    type: String,
    enum: [
      'PLACED',
      'PROCESSING',
      'DISPATCHED',
      'TRANSIT',
      'OUT FOR DELIVERY',
      'COMPLETED'
    ],
    required: true,
    default: 'PLACED'
  },
  paymentId: {
    type: String,
    validate: [
      value => !(this.type == 'CARD' && !value),
      'Payement Id is required'
    ]
  },
  others: { type: Object }
});

module.exports = mongoose.model('Order', schema);
