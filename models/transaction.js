const mongoose = require('mongoose')

const TransactionSchema = new mongoose.Schema({
  customerId : {type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required : true},
  vendorId : {type: mongoose.Schema.Types.ObjectId, ref : 'Vendor', required: true},
  productId : {type: mongoose.Schema.Types.ObjectId, ref : 'Product', required: true},
  quantity : {type: Number, required : true},
  totalAmount : {type: Number, required: true},
  paymentIntentId : {type: String, required : true},
  checkOutSessionId: {type: String, rquired: true},
  paymentMethod : {type: String},
  platformFee : {type: Number, required: true},
  status : {type: String, required: true},
   timestamps: true 

})

module.exports = mongoose.model('Transaction', TransactionSchema)