// 🔥 Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBqrO6qxMSEzP-QX8WYIxSDruHvHbweR3w",
  authDomain: "ticket-ab343.firebaseapp.com",
  projectId: "ticket-ab343",
};

document.addEventListener("DOMContentLoaded", () => {
  console.log(firebase)
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

const resultDiv = document.getElementById("result");

let scanning = true; // prevent double scans

// ============================
// 🎯 VALIDATE TICKET
// ============================
async function validateTicket(ticketId) {
  if (!scanning) return;

  scanning = false; // stop rapid re-scan
  resultDiv.innerHTML = "⏳ Checking...";

  try {
    // 🔍 find ticket
    const doc = await db.collection("tickets").doc(ticketId).get();

    let found = null;

    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.ticketId === ticketId) {
        found = { id: doc.id, ...data };
      }
    });

    // ❌ INVALID
    if (!found) {
      showResult("❌ INVALID TICKET", "red");
      resetScanner();
      return;
    }

    // ⚠️ ALREADY USED
    if (found.used) {
      showResult("⚠️ TICKET ALREADY USED", "orange");
      resetScanner();
      return;
    }

    // ✅ VALID → MARK USED
    await db.collection("tickets").doc(found.id).update({
      used: true
    });

    showResult("✅ ACCESS GRANTED", "green");

    // 🎉 Optional vibration (mobile)
    if (navigator.vibrate) navigator.vibrate(200);

  } catch (err) {
    console.error(err);
    showResult("❌ ERROR", "red");
  }

  resetScanner();
}

// ============================
// 🎨 RESULT UI
// ============================
function showResult(message, color) {
  resultDiv.innerHTML = message;
  resultDiv.style.color = color;
}

// ============================
// 🔄 RESET SCANNER
// ============================
function resetScanner() {
  setTimeout(() => {
    scanning = true;
    resultDiv.innerHTML = "📡 Ready to scan...";
    resultDiv.style.color = "#fff";
  }, 3000);
}

// ============================
// 📷 START CAMERA
// ============================
function startScanner() {
  const scanner = new Html5Qrcode("reader");

  scanner.start(
    { facingMode: "environment" }, // back camera
    { fps: 10, qrbox: 250 },

    (decodedText) => {
      console.log("Scanned:", decodedText);

      let ticketId = decodedText;

      // If QR contains URL → extract ticket
      if (decodedText.includes("ticket=")) {
        const url = new URL(decodedText);
        ticketId = url.searchParams.get("ticket");
      }

      validateTicket(ticketId);
    },

    (error) => {
      // ignore scan errors
    }
  );
}

// ============================
// 🚀 INIT
// ============================
window.onload = () => {
  resultDiv.innerHTML = "📡 Ready to scan...";
  startScanner();
};

});