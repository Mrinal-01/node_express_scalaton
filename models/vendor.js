const mongoose = require("mongoose");

const VendorSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  vendorId: {
    type: String
  }
});

module.exports = mongoose.model("Vendor", VendorSchema);
