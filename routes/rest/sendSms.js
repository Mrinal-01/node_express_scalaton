// const authSid = process.env.TWILIO_ACCOUNT_SID
// const authToken = process.env.TWILIO_AUTH_TOKEN
// const client = require('twilio')(authSid, authToken);

// module.exports={
//   async sendSms(req,res){
//     try {
//       const {sender,recepient,message} = req.body;
//       const response = await client.messages
//         .create({
//            body: message,
//            from: sender,
//            to: recepient
//          })
//          console.log(message.sid)
//          res.status(201).send(response)
//     } catch (error) {
//       res.status(400).json({error:true, reason:error.message})
//     }

//   },

// }

const Twilio = require("twilio");
const messagingResponse = require("twilio").twiml.MessagingResponse;
module.exports = {
  /**
   * @param {*} toNo
   * @param {*} msg
   */
  async sendSms(req, res) {
    try {
      const { sender, recepient, message } = req.body;
      const twilio = new Twilio(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
      );
      const response = await twilio.messages.create({
        body: message,
        to: recepient, // Text this number +918172059732
        from: sender, // From a valid Twilio number
      });
      res.status(201).send(response);
    } catch (error) {
      // Handle error here; so that it is non fatal upstream:
      res.status(400).json({ error: true, reason: error.message });
    }
  },

  async receiveSms(req, res) {
    try {
      const twiml = new messagingResponse();

      const incomingMessage = req.body.Body; // Incoming reply message
      const fromNumber = req.body.From; // Customer's phone number

      console.log(`Incoming message from ${fromNumber}: ${incomingMessage}`);

      // Respond to the customer based on their reply
      if (incomingMessage.toLowerCase().includes("driver")) {
        twiml.message("We will inform your driver.");
      } else {
        twiml.message(
          "Thank you for your message! We will get back to you soon."
        );
      }

      res.type("text/xml").send(twiml.toString());
    } catch (error) {
      res.status(400).json({ error: true, reason: error.message });
    }
  },
};
