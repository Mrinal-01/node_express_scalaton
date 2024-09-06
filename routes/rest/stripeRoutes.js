const express = require("express");
const stripeLib = require("../../lib/stripe");
const Product = require("../../models/product");
const Vendor = require("../../models/vendor");
const Customer = require("../../models/customer");
const Transaction = require("../../models/transaction");

const app = express();

module.exports = {
  async addCustomerToStripe(req, res) {
    try {
      //Remember to add paymentMethod(e.g: pm_card_amex) in the postman body
      const customerData = req.body;
      const emailExist = await Customer.findOne({ email: customerData.email });
      if (emailExist) {
        return res.status(500).json({ Error: "email already exists" });
      }
      if (customerData.name === undefined)
        return res
          .status(400)
          .json({ error: true, reason: "Missing name of the Customer!" });
      if (customerData.email === undefined)
        return res
          .status(400)
          .json({ error: true, reason: "Missing email of the Customer!" });

      const customerObjects = await stripeLib.addCustomerToStripe(customerData);
      const customer = await Customer.create({
        name: customerData.name,
        email: customerData.email,
        stripeCustomerId: customerObjects.id,
      });
      res.status(200).json(customer);
    } catch (error) {
      res.status(400).json({ error: true, reason: error.message });
    }
  },
  async addVendors(req, res) {
    try {
      const vendorsData = req.body;
      const emailExist = await Customer.findOne({ email: vendorsData.email });
      if (emailExist) {
        return res.status(500).json({ Error: "email already exists" });
      }
      if (vendorsData.email === undefined)
        return res
          .status(400)
          .json({ error: true, reason: "Missing email of the Vendor!" });

      const { account, accountLink } = await stripeLib.addVendors(vendorsData);

      const response = await Vendor.create({
        vendorId: account.id,
        email: account.email,
        name: account.name,
      });
      res.status(200).json({ response, accountLink });
    } catch (error) {
      res.status(400).json({ error: true, reason: error.message });
    }
  },
  async activateAccount(req, res) {
    res.send("Account activated successfully");
  },
  async reauth(req, res) {
    // Inform users they need to re-authenticate or provide additional information
    res.send("Please re-authenticate or provide additional information.");
  },

  async addProducts(req, res) {
    try {
      // const addedProduct=stripeLib.addProduct(product)
      const { name, price, currency, image, vendorId, availableQuantity } =
        req.body;

      if (name === undefined)
        return res
          .status(400)
          .json({ error: true, reason: "Missing name of the product!" });

      if (price === undefined || isNaN(price))
        return res
          .status(400)
          .json({ error: true, reson: "Missing price of the product!" });

      if (currency === undefined || !["US", "EU", "IN"].includes(currency))
        return res
          .status(400)
          .json({
            error: true,
            reason:
              "Missing currency or you select a wrong currency of the product!",
          });

      if (image === undefined)
        return res
          .status(400)
          .json({ error: true, reason: "Image link(url) is missing!" });

      if (vendorId === undefined)
        return res
          .status(400)
          .json({ error: true, reason: "VendorId is required" });

      if (availableQuantity === undefined)
        return res
          .status(400)
          .json({ error: true, reason: "Quantityt is not provided" });

      const product = await Product.create({
        name,
        price,
        currency,
        image,
        vendorId,
        availableQuantity,
      });

      res.status(200).json(product);
    } catch (error) {
      res
        .status(error)
        .json({
          error: "Prduct not added due to this error: " + error.message,
        });
    }
  },

  async buyProduct(req, res) {
    try {
      const { productIds, userId, quantity } = req.body;
      const user = await Customer.findById(userId).exec();
      const products = await Product.find({ _id: { $in: productIds } }).exec();
      const vendorIds = await Product.find({ _id: { $in: productIds } })
        .distinct("vendorId")
        .exec();
      const stripeAcountIds = await Vendor.find({ _id: { $in: vendorIds } })
        .distinct("vendorId")
        .exec();
      if (!user)
        return res
          .status(400)
          .json({ error: true, reason: "User is not available" });
      if (!products)
        return res
          .status(400)
          .json({ error: true, reason: "Products are not available" });

      let totalAmount = 0;
      products.forEach((el) => {
        totalAmount += el.price;
      });
      let chargeObject;
      if (totalAmount > 0) {
        chargeObject = await stripeLib.payment(
          user.stripeCustomerId,
          totalAmount,
          stripeAcountIds[0]
        );
      }
      console.log(vendorIds, stripeAcountIds);

      // const captureCharge = await stripeLib.captureCharge("ch_3PvOau2N6Zg21DrW0GfFvO57", 600)
      // const refundObj  = await stripeLib.refundPayment("ch_3PvOzw2N6Zg21DrW051Fmm0Q")
      // res.status(200).json({error:false,chargeObject, captureCharge})
      // res.status(200).json({error:false,chargeObject, refundObj})

      res.status(200).json({ error: false, chargeObject });
    } catch (error) {
      res.status(400).json({ error: true, reason: error.message });
    }
  },

  async  productPurchase(req, res) {
    try {
      const { productIds, userId, quantities } = req.body; // productIds and quantities are arrays
  
      // Fetch the user and the products being purchased
      const user = await Customer.findById(userId).exec();
      const products = await Product.find({ _id: { $in: productIds } }).exec();
  
      // Check if user and products exist
      if (!user) return res.status(400).json({ error: true, reason: "User not found" });
      if (products.length === 0) return res.status(400).json({ error: true, reason: "Products not found" });
  
      // Create a map to accumulate product amounts per vendor
      let vendorAmounts = {}; // { vendorId: totalAmount }
  
      products.forEach((product, index) => {
        const quantity = quantities[index] || 1;
        
        // Deduct from available quantity
        if (product.availableQuantity < quantity) {
          return res.status(400).json({ error: true, reason: `Not enough quantity for product ${product.name}` });
        }
        product.availableQuantity -= quantity;
        product.save();
  
        // Accumulate amount for each vendor
        const productTotal = product.price * quantity;
        if (!vendorAmounts[product.vendorId]) {
          vendorAmounts[product.vendorId] = 0;
        }
        vendorAmounts[product.vendorId] += productTotal;
      });
  
      // Loop through vendors and create individual charges
      for (let vendorId in vendorAmounts) {
        const vendor = await Vendor.findById(vendorId);
        const amountForVendor = vendorAmounts[vendorId];
        const amountInCents = Math.round(amountForVendor * 100); // Stripe works with cents
  
        // Create a charge for each vendor with transfer_data
        const charge = await stripeLib.creatingCharge(amountInCents,user.stripeCustomerId,vendor.vendorId,vendor.email)
        
        console.log(amountInCents+" "+user.stripeCustomerId+" "+vendor.vendorId+" "+vendor.email);
        
      
        // Log transaction in database for each vendor
        await Transaction.create({
          customerId: user._id,
          vendorId: vendor._id,
          productId: productIds.filter(pid => products.find(p => p._id.toString() === pid && p.vendorId.toString() === vendorId)), // Products belonging to this vendor
          amount: amountForVendor,
          currency: 'usd',
          chargeId: charge.id,
        });
      }
  
      res.status(200).json({ success: true, message: 'Products purchased and charges created successfully' });
  
    } catch (error) {
      console.log(error);
      
      res.status(500).json({ error: true, message: error.message });
    }
  },

  async checkAccBalance(req, res) {
    try {
      const balanceObj = await stripeLib.checkAccountBalance();
      res.status(200).json({ error: false, balance: balanceObj });
    } catch (error) {
      res.status(400).send(error);
    }
  },

  async createCharge(req, res) {
    try {
      const { customerId, amount, vendorId } = req.body
      const stripeRes = await stripeLib.payment(customerId, amount, vendorId);
      console.log("stripeRes", stripeRes);
      return res.status(200).json({ error: false });
    } catch (error) {
      return res.status(400).send(error);
    }
  },
  async createTransfer(req, res) {
    try {
      const { amount, destination, transfer_group } = req.body
      const stripeRes = await stripeLib.transfer(amount, destination, transfer_group);
      console.log("stripeRes", stripeRes);
      return res.status(200).json({ error: false });
    } catch (error) {
      return res.status(400).send(error);
    }
  },
};
