const mongoose=require('mongoose')

const ProductSchema = new mongoose.Schema({
  name : {type: String, required: true},
  price : {type: Number, required: true},
  vendorId : {type: mongoose.Schema.Type.ObjectId, ref: 'Vendor', required: true},
  availableQuantity: {type: Number, required: true}
})

module.exports=mongoose.model('Product', ProductSchema)