const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  customerId: { type:mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },
  productId: [{ type:mongoose.Schema.Types.ObjectId, ref: 'Product', required: true }], // Array of ObjectIds
  amount: { type: Number, required: true },
  currency: { type: String, required: true },
  chargeId: { type: String, required: true }
});

module.exports = mongoose.model('Transaction', transactionSchema);