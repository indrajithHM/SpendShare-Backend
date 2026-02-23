import admin from "firebase-admin";

const serviceAccount = JSON.parse(
  process.env.FIREBASE_SERVICE_ACCOUNT
);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export async function onRequest(context) {
  try {
    const { tokens, title, body } = await context.request.json();

    if (!tokens || tokens.length === 0) {
      return new Response("No tokens", { status: 400 });
    }

    const message = {
      notification: { title, body },
      tokens,
    };

    const response = await admin.messaging().sendEachForMulticast(message);

    return new Response(JSON.stringify({
      sent: response.successCount
    }), { status: 200 });

  } catch (err) {
    return new Response("Error", { status: 500 });
  }
}