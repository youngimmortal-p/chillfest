// 🔥 Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBqrO6qxMSEzP-QX8WYIxSDruHvHbweR3w",
  authDomain: "ticket-ab343.firebaseapp.com",
  projectId: "ticket-ab343",
  storageBucket: "ticket-ab343.firebasestorage.app",
  messagingSenderId: "248675766848",
  appId: "1:248675766848:web:79aa612820e7ee7ec605a5"
};

// Initialize Firebase
if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Initialize EmailJS
emailjs.init("u9yWeM-XyHO8w3jK6");

// DOM Elements
const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const generateBtn = document.getElementById("generateBtn");

// Event Listener (CLEAN WAY ✅)
generateBtn.addEventListener("click", generateTicket);

// 🎫 Main Function
async function generateTicket(e) {
  console.log("🚀 Step 1: Button clicked");

  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim().toLowerCase();

  console.log("🧾 Step 2: Inputs read", { name, email });

  if (!name || !email) {
    console.log("❌ Step 3: Missing input");
    alert("Fill all fields");
    return;
  }

  try {
    const docRef = db.collection("tickets").doc(email);

    console.log("📡 Step 4: Checking Firestore...");
    const doc = await docRef.get();

    console.log("📄 Step 5: Firestore response received");

    if (doc.exists) {
  console.log("⚠️ Step 6: Ticket already exists");

  const data = doc.data();

  // 🔥 STILL SEND EMAIL
  console.log("📧 Sending email for existing ticket...");
  await sendConfirmationEmail(data.ticketId, data.name, data.email);

  console.log("✅ Email sent for existing ticket");

  showTicket(data.ticketId, data.name, data.email, "valid");

  return;
}

    const ticketId = "TICKET-" + Date.now();
    console.log("🎟 Step 7: Ticket ID generated:", ticketId);

    await docRef.set({
      ticketId,
      name,
      email,
      used: false,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    console.log("💾 Step 8: Saved to Firestore");

    // 🔥 IMPORTANT DEBUG LINE
    console.log("📧 Step 9: About to call sendConfirmationEmail");

    await sendConfirmationEmail(ticketId, name, email);

    console.log("✅ Step 10: Email function FINISHED");

  } catch (error) {
    console.error("❌ ERROR CAUGHT:", error);
  }
}

// 📧 Email Function
async function sendConfirmationEmail(ticketId, name, email) {
  console.log("📨 Step A: Inside sendConfirmationEmail");

  try {
    console.log("📡 Step B: Sending request to EmailJS...");

    const response = await emailjs.send(
      "service_dsqdvyn",
      "template_epdeeln",
      {
        to_name: name,
        to_email: email,
        ticket_id: ticketId,
        generator_url: window.location.href
      },
      "u9yWeM-XyHO8w3jK6"
    );

    console.log("✅ Step C: EmailJS SUCCESS", response);

  } catch (error) {
    console.error("❌ Step D: EmailJS FAILED", error);
    throw error;
  }
}

// 🎟 UI Renderer
function showTicket(ticketId, name, email, status) {
  document.getElementById("ticketId").textContent = ticketId;
  document.getElementById("ticketName").textContent = name;
  document.getElementById("ticketEmail").textContent = email;

  const statusEl = document.getElementById("status");

  if (status === "valid") {
    statusEl.textContent = "✅ Ticket created & email sent!";
  } else if (status === "used") {
    statusEl.textContent = "⚠️ Ticket already used";
  } else {
    statusEl.textContent = "⚠️ Email failed";
  }

  const qrContainer = document.getElementById("qrCode");
  qrContainer.innerHTML = "";

  new QRCode(qrContainer, {
    text: ticketId,
    width: 220,
    height: 220
  });

  document.getElementById("ticket").style.display = "block";
}

console.log("EmailJS:", emailjs);