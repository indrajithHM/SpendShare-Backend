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
});

/* ========= SEND NOTIFICATION ========= */
app.post("/send-notification", async (req, res) => {
  try {
    const { tokens, title, body } = req.body;

    if (!tokens || tokens.length === 0) {
      return res.status(400).json({ error: "No tokens provided" });
    }

    const response = await admin.messaging().sendEachForMulticast({
      notification: { title, body },
      tokens,
    });

    res.json({
      success: true,
      sent: response.successCount,
      failed: response.failureCount,
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