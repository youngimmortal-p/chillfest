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
document.addEventListener("DomContentLoaded", () => {
console.log(firebase)
firebase.initializeApp(firebaseConfig);
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
   generateBtn.disabled = true;
  generateBtn.innerHTML = `
    🎮 Creating Ticket
    <span class="dots">
      <span>.</span><span>.</span><span>.</span>
    </span>
  `;
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
  } finally {
    // 🔄 RESET BUTTON
    generateBtn.disabled = false;
    generateBtn.innerHTML = "🎫 Generate Ticket";
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
    text: `${window.location.origin}/scan.html?ticket=${ticketId}`,
    width: 220,
    height: 220
  });

  document.getElementById("ticket").style.display = "block";
  setTimeout(() => {
    const downloadBtn = document.getElementById("downloadBtn");
    if (downloadBtn) {
      downloadBtn.onclick = downloadTicket;
    }
  }, 300);
}

async function downloadTicket() {
  const btn = document.getElementById("downloadBtn");

  btn.innerText = "📄 Generating PDF...";
  btn.disabled = true;

  try {
    const ticketId = document.getElementById("ticketId").textContent;
    const name = document.getElementById("ticketName").textContent;
    const email = document.getElementById("ticketEmail").textContent;

    // ⏳ Wait for QR to render
    await new Promise(resolve => setTimeout(resolve, 400));

    // 📸 Capture ONLY QR
    const qrCanvas = await html2canvas(document.getElementById("qrCode"));
    const qrImage = qrCanvas.toDataURL("image/png");

    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF("p", "mm", "a4");

    // ===== BACKGROUND =====
    pdf.setFillColor(5, 15, 40); // dark blue
    pdf.rect(0, 0, 210, 297, "F");

    // ===== HEADER =====
    pdf.setTextColor(255, 215, 0); // gold
    pdf.setFontSize(22);
    pdf.text("🎮 GAMING EVENT TICKET", 105, 25, null, null, "center");

    // ===== SUB HEADER =====
    pdf.setFontSize(10);
    pdf.setTextColor(180, 180, 180);
    pdf.text("Official Entry Pass", 105, 32, null, null, "center");

    // ===== CARD BACKGROUND =====
    pdf.setFillColor(10, 30, 70);
    pdf.roundedRect(20, 45, 170, 180, 6, 6, "F");

    // ===== BORDER =====
    pdf.setDrawColor(0, 150, 255);
    pdf.setLineWidth(1);
    pdf.roundedRect(20, 45, 170, 180, 6, 6);

    // ===== USER INFO =====
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(12);

    pdf.text("Name:", 30, 70);
    pdf.text(name, 60, 70);

    pdf.text("Email:", 30, 85);
    pdf.text(email, 60, 85);

    pdf.text("Ticket ID:", 30, 100);
    pdf.text(ticketId, 60, 100);

    pdf.text("Issued:", 30, 115);
    pdf.text(new Date().toLocaleString(), 60, 115);

    // ===== QR CODE =====
    pdf.addImage(qrImage, "PNG", 65, 130, 80, 80);

    // ===== FOOTER =====
    pdf.setFontSize(9);
    pdf.setTextColor(200, 200, 200);
    pdf.text("Scan QR code at entrance", 105, 220, null, null, "center");

    pdf.setTextColor(255, 215, 0);
    pdf.text("Powered by Gaming Ticket System", 105, 230, null, null, "center");

    // ===== SAVE =====
    pdf.save(`Ticket-${ticketId}.pdf`);

  } catch (error) {
    console.error("❌ PDF error:", error);
    alert("Failed to generate PDF");
  } finally {
    btn.innerText = "📥 Download Ticket";
    btn.disabled = false;
  }
}
console.log("EmailJS:", emailjs);
});
