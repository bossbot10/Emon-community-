// index.js
const express = require("express");
const bodyParser = require("body-parser");
const request = require("request");

const app = express();
app.use(bodyParser.json());

// ====== CONFIGURE THESE ======
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN || "YOUR_PAGE_ACCESS_TOKEN";61580464035642
const VERIFY_TOKEN = process.env.VERIFY_TOKEN || "YOUR_VERIFY_TOKEN";61580464035642
// ==============================

// Webhook verification
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

// Webhook receiver for messages and page feed events
app.post("/webhook", (req, res) => {
  const body = req.body;

  // Messenger messages (page inbox)
  if (body.object === "page") {
    // `entry` can contain messaging events OR changes (for feed)
    body.entry.forEach(entry => {
      // 1) Messaging events (inbox)
      if (entry.messaging) {
        entry.messaging.forEach(event => {
          if (event.message && !event.message.is_echo) {
            const senderPsid = event.sender.id;
            const text = event.message.text || "";
            handleInboxMessage(senderPsid, text);
          }
        });
      }

      // 2) Feed changes (comments / posts)
      if (entry.changes) {
        entry.changes.forEach(change => {
          // change.field === 'feed' -> new comments/posts on page
          if (change.field === "feed") {
            // change.value has details
            const val = change.value || {};
            // comment creation example: val.item === "comment"
            if (val.item === "comment" && val.verb === "add") {
              const commentId = val.comment_id || val.comment?.id || null;
              const message = val.message || "";
              const from = val.from || {};
              // reply to the comment (create a sub-comment)
              if (commentId) {
                replyToComment(commentId, `ধন্যবাদ! আমরা আপনার কমেন্ট পেয়েছি।`);
              }
            }

            // new post example (if you want to comment on post)
            if (val.item === "post" && val.verb === "add") {
              const postId = val.post_id || val.post?.id || null;
              if (postId) {
                // optional: comment on the post
                commentOnPost(postId, `ধন্যবাদ পোস্ট করার জন্য!`);
              }
            }
          }
        });
      }
    });

    res.status(200).send("EVENT_RECEIVED");
  } else {
    res.sendStatus(404);
  }
});

// ----------------- Handler functions -----------------
function handleInboxMessage(senderPsid, text) {
  // customize auto-reply logic here
  const replyText = `আপনার মেসেজ পেয়েছি: "${text}".  শুনলাম — আমরা শীঘ্রই রেসপন্ড করব। ✅`;
  callSendAPI(senderPsid, { text: replyText });
}

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
      if (!err) console.log("💬 Message sent to inbox!");
      else console.error("❌ send message error:", err, body);
    }
  );
}

function replyToComment(commentId, text) {
  // POST /{comment-id}/comments
  request(
    {
      uri: `https://graph.facebook.com/v17.0/${commentId}/comments`,
      qs: { access_token: PAGE_ACCESS_TOKEN, message: text },
      method: "POST"
    },
    (err, res, body) => {
      if (!err) console.log("💬 Replied to comment:", commentId);
      else console.error("❌ reply comment error:", err, body);
    }
  );
}

function commentOnPost(postId, text) {
  // POST /{post-id}/comments
  request(
    {
      uri: `https://graph.facebook.com/v17.0/${postId}/comments`,
      qs: { access_token: PAGE_ACCESS_TOKEN, message: text },
      method: "POST"
    },
    (err, res, body) => {
      if (!err) console.log("💬 Commented on post:", postId);
      else console.error("❌ comment post error:", err, body);
    }
  );
}

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
