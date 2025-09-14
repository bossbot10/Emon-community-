
    {
      uri: "https://graph.facebook.com/v17.0/me/messages",
      qs: { access_token: PAGE_ACCESS_TOKEN },
      method: "POST",
      json: requestBody
    },
    (err, res, body) => {
      if (!err) {
        console.log("💬 const express = require("express");
const bodyParser = require("body-parser");
const request = require("request");

const app = express();
app.use(bodyParser.json());

// 👉 এখানে তোমার Facebook Page Access Token বসাও
const PAGE_ACCESS_TOKEN = "YOUR_PAGE_ACCESS_TOKEN";61580464035642

// 👉 এখানে নিজের তৈরি VERIFY TOKEN দাও (যেটা webhook setup করার সময় লাগবে)
const VERIFY_TOKEN = "YOUR_VERIFY_TOKEN";const VERIFY_TOKEN = "emon123";

// -------------------------
// Webhook Verification
// -------------------------
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode && token === VERIFY_TOKEN) {
    console.log("✅ WEBHOOK_VERIFIED");
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// -------------------------
// Incoming Messages Handle
// -------------------------
app.post("/webhook", (req, res) => {
  const body = req.body;

  if (body.object === "page") {
    body.entry.forEach(entry => {
      const webhookEvent = entry.messaging[0];
      const senderPsid = webhookEvent.sender.id;

      if (webhookEvent.message) {
        handleMessage(senderPsid, webhookEvent.message);
      }
    });

    res.status(200).send("EVENT_RECEIVED");
  } else {
    res.sendStatus(404);
  }
});

// -------------------------
// Handle Message
// -------------------------
function handleMessage(senderPsid, receivedMessage) {
  let response;

  if (receivedMessage.text) {
    response = {
      text: `আপনার মেসেজ পেয়েছি: "${receivedMessage.text}" ✅`
    };
  } else {
    response = { text: "আমি শুধু টেক্সট রিপ্লাই দিতে পারি 🙂" };
  }

  callSendAPI(senderPsid, response);
}

// -------------------------
// Send Message Back
// -------------------------
function callSendAPI(senderPsid, response) {
  const requestBody = {
    recipient: { id: senderPsid },
    message: response
  };

  request(
    {
      uri: "https://graph.facebook.com/v17.0/me/messages",
      qs: { access_token: PAGE_ACCESS_TOKEN },
      method: "POST",
      json: requestBody
    },
    (err, res, body) => {
      if (!err) {
        console.log("💬 Message sent!");
      } else {
        console.error("❌ Unable to send message:" + err);
      }
    }
  );
}

// -------------------------
// Start Server
// -------------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Bot running on port ${PORT}`));
