const express = require("express")
const router = express.Router()
const expressJwt = require("express-jwt");
const checkJwt = expressJwt({ secret: process.env.SECRET }); // the JWT auth check middleware
const multer = require("multer");


const users = require("./users")
const login = require("./auth")
const signup = require("./auth/signup")
const forgotpassword = require("./auth/password")
const shoppingCart=require('./stripeRoutes')
const awsRoutes=require('./awsRoutes')
const aws = require('../../lib/aws')
const chat=require('./chat')
const smsRoutes=require('./sendSms')

router.post("/login", login.post) // UNAUTHENTICATED
router.post("/signup", signup.post) // UNAUTHENTICATED
router.post("/forgotpassword", forgotpassword.startWorkflow) // UNAUTHENTICATED; AJAX
router.post("/resetpassword", forgotpassword.resetPassword) // UNAUTHENTICATED; AJAX

// This routes are all related to Shopping cart
router.post("/add-customer",shoppingCart.addCustomerToStripe)

router.post("/add-vendor",shoppingCart.addVendors)
router.get('/return',shoppingCart.activateAccount)
router.get("/reauth", shoppingCart.reauth);

router.post('/add-products',shoppingCart.addProducts)
// router.post('/buy/products',shoppingCart.buyProduct)
router.post('/purchase/products',shoppingCart.productPurchase)
router.get('/chek-balance', shoppingCart.checkAccBalance)

router.post('/create-charge', shoppingCart.createCharge)
router.post('/create-transfer', shoppingCart.createTransfer)

// This is related to AWS implementaion
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // limit file size to 5MB
  },
});
router.post('/upload-image',upload.single('file'),awsRoutes.uploadImage)
router.get('/view-image/:filename',awsRoutes.viewImage)

//Route to implement socket.io
router.get("/chat-app",chat.chatApp)

//Router to Implement Twilio for send Messages

router.post("/send-sms",smsRoutes.sendSms)
router.post('/receive-message',smsRoutes.receiveSms)


router.all("*", checkJwt) // use this auth middleware for ALL subsequent routes

router.get("/user/:id", users.get)

module.exports = router
