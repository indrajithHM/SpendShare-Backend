import express from "express";
import cors from "cors";
import admin from "firebase-admin";

const app = express();
app.use(cors());
app.use(express.json());

/* ========= INITIALIZE FIREBASE ========= */
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://spendshare-app-default-rtdb.asia-southeast1.firebasedatabase.app"
});

/* ========= SEND NOTIFICATION ========= */
app.post("/send-notification", async (req, res) => {
  try {
    const { participantIds, title, body, splitId } = req.body;

    if (!participantIds || participantIds.length === 0) {
      return res.status(400).json({ error: "No participants provided" });
    }

    const db = admin.database();
    const tokens = [];

    for (const uid of participantIds) {
      const snap = await db.ref(`users/${uid}/fcmToken`).get();
      if (snap.exists()) {
        tokens.push(snap.val());
      }
    }

    if (tokens.length === 0) {
      return res.json({ success: true, sent: 0 });
    }

    const response = await admin.messaging().sendEachForMulticast({
      notification: {
        title,
        body
      },
      webpush: {
        notification: {
          icon: "https://spendshare-app.web.app/SpendShare.png",
          data: {
            url: `https://spendshare-app.web.app/split/${splitId}`
          }
        }
      },
      tokens
    });

    res.json({
      success: true,
      sent: response.successCount,
      failed: response.failureCount
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to send notification" });
  }
});

app.get("/", (req, res) => {
  res.send("SpendShare backend running");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});