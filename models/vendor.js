const mongoose=require('mongoose')

const VendorSchema=new mongoose.Schema({
    email : {type: String, required: true},
    stripeAccountId : {type: String, required: true, unique: true}
})

module.exports = mongoose.model('Vendor',VendorSchema)