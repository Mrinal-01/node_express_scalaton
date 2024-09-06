const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

module.exports = {
  async addCustomerToStripe(customer) {
    try {
      const Newcustomer = await stripe.customers.create({
        email: customer.email,
        name: customer.name,
        // payment_method: customer.paymentMethodId,
        // invoice_settings: {
        //   default_payment_method: customer.paymentMethodId,
        // },
      });
      console.log("customer created:",Newcustomer.id);
      
      let source="tok_visa_debit"
      await stripe.customers.createSource(Newcustomer.id, {
        source: source,
      });
      return Newcustomer;
    } catch (error) {
      throw new Error("Error creating customer:", error);
    }
  },

  async addVendors(vendorsData) {
    try {
      const { name, email } = vendorsData;

      const account = await stripe.accounts.create({
        email: email,
        country: "US",
        business_profile: {
          name,
          support_email: email,
        },
        controller: {
          fees: {
            payer: "application",
          },
          losses: {
            payments: "application",
          },
          stripe_dashboard: {
            type: "express",
          },
        },
        capabilities: {
          transfers: {
            requested: true,
          },
          card_payments: { requested: true },
        },
      });
      const accountLink = await stripe.accountLinks.create({
        account: account.id,
        refresh_url: "http://localhost:3000/api/v1/reauth",
        return_url: "http://localhost:3000/api/v1/return",
        type: "account_onboarding",
      });

      return { account, accountLink };
    } catch (error) {
      throw new Error("Error Creating Vendor");
    }
  },

  async payment(customerId, amount, vendorId) {
    try {
      const amountInCent = amount * 100;
      const charge = await stripe.charges.create({
        amount: amountInCent,
        currency: "usd",
        customer: customerId,
        capture: true,
        transfer_data: {
          destination: vendorId,
          amount: amountInCent,
        },
      });
      console.log("Inside create charge");
      
      return charge;
    } catch (error) {
      throw new Error(error);
    }
  },

  async creatingCharge(amountInCents,stripeCustomerId,stripeAccountId,email) {
    try {
      const charge = await stripe.charges.create({
        amount: amountInCents, // in cents
        currency: 'usd',
        customer: stripeCustomerId,
        description: `Purchase of products from vendor ${email}`,
        transfer_data: {
          destination: stripeAccountId, // Send funds to vendor's connected account
          // amount: amountInCents,  // Full amount or adjusted if fees are needed (if platform fees apply)
        },
      });
      

      return charge;
    } catch (error) {
      console.log("######################3", error);

      throw new Error(error);
    }
  },

  async captureCharge(chargeId, captureAmount) {
    try {
      const charge = await stripe.charges.capture(chargeId, {
        amount: captureAmount,
      });
      return charge;
    } catch (error) {
      throw new Error(error);
    }
  },

  async refundPayment(chargeId) {
    try {
      const refund = await stripe.refunds.create({
        charge: chargeId,
        reverse_transfer: true,
      });

      return refund;
    } catch (error) {
      throw new Error(error);
    }
  },
  async checkAccountBalance() {
    try {
      const balance = await stripe.balance.retrieve({});

      return balance;
    } catch (error) {
      // throw new Error(error)
      return error;
    }
  },

  async transfer(amount, destination, transfer_group) {
    const transfer = await stripe.transfers.create({
      amount,
      currency: "usd",
      destination,
      transfer_group,
    });
    return transfer;
  },
};
