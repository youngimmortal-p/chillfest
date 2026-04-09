console.log(firebase)
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const { collection, doc, getDoc, setDoc, serverTimestamp } = firebase.firestore;


async function generateTicket(event) {
  const btn = event.target;
  const email = document.getElementById("email").value.trim().toLowerCase();
  const name = document.getElementById("name").value.trim();
  
  if (!email || !name) {
    alert("Please fill all fields!");
    return;
  }
  
  btn.disabled = true;
  btn.innerText = "🎮 Creating Ticket...";
  
  try {
    const ticketId = "TICKET-" + Date.now();
    await setDoc(doc(db, "tickets", ticketId), {
      ticketId,
      name,
      email,
      used: false,
      createdAt: serverTimestamp()
    });
    
    sendConfirmationEmail(ticketId, name, email);
    showTicket(ticketId, name, email, "valid");
  } catch (err) {
    console.error(err);
    alert("Error: " + err.message);
  }
  
  btn.disabled = false;
  btn.innerText = "🎫 Generate Ticket";
}



// OPTIONAL EMAIL FUNCTION
async function sendConfirmationEmail(ticketId, name, email) {
  try {
    emailjs.send("service_dsqdvyn", "template_epdeeln", {
      to_name: name,
      to_email: email,
      ticket_id: ticketId
    });
  } catch (e) {
    console.error("Email failed", e);
  }
}

function showTicket(ticketId, name, email, status) {
  document.getElementById("ticketId").textContent = ticketId;
  document.getElementById("ticketName").textContent = name;
  document.getElementById("ticketEmail").textContent = email;

  document.getElementById("status").textContent =
    status === "valid" ? "✅ Ticket Created" : "⚠️ Exists";

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
