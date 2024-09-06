const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    enum: ['US', 'EU', 'IN'], 
    required: true 
  },
  image: {
    type: String,
    required: true
  },
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Vendor",
    required: true,
  },
  availableQuantity: {
    type: Number,
    required: true,
  },
},{
  timestamps: true
}
);

module.exports = mongoose.model("Product", ProductSchema);
