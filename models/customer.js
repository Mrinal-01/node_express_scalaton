const mongoose = require("mongoose");

const CustomerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    require: true,
    unique: true,
  },
  stripeCustomerId: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Customer", CustomerSchema);
