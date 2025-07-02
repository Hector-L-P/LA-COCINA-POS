let cart = [];
let savedReceipts = JSON.parse(localStorage.getItem("savedReceipts") || "[]");
let receiptCounter = parseInt(localStorage.getItem("receiptNumber") || "57");

function switchTab(tabId) {
  document.querySelectorAll(".tab-content").forEach(tab => (tab.style.display = "none"));
  document.querySelectorAll(".tabs button").forEach(btn => btn.classList.remove("active"));
  document.getElementById(tabId).style.display = "block";
  event.target.classList.add("active");

  if (tabId === "adminTab") renderSavedReceipts();
}

function toggleBundleOptions() {
  const item = document.getElementById("itemName").value;
  document.getElementById("bundleOptions").style.display = item === "Empanada Mix" ? "block" : "none";
}

function addItem() {
  const itemName = document.getElementById("itemName").value;
  const qtyInput = parseInt(document.getElementById("itemQty").value) || 1;

  if (itemName === "Empanada Mix") {
    const beef = parseInt(document.getElementById("beefQty").value) || 0;
    const chicken = parseInt(document.getElementById("chickenQty").value) || 0;
    const potato = parseInt(document.getElementById("potatoQty").value) || 0;
    const totalFlavors = beef + chicken + potato;

    if (totalFlavors !== 3) {
      alert("Empanada Mix must include exactly 3 empanadas.");
      return;
    }

    let breakdown = [];
    if (beef > 0) breakdown.push(`${beef} Beef`);
    if (chicken > 0) breakdown.push(`${chicken} Chicken`);
    if (potato > 0) breakdown.push(`${potato} Potato`);

    const description = `Empanada Mix (${breakdown.join(", ")})`;
    cart.push({ name: description, price: 35, qty: 1 });

    document.getElementById("beefQty").value = 0;
    document.getElementById("chickenQty").value = 0;
    document.getElementById("potatoQty").value = 0;
  } else {
    let price = itemName.includes("Cookies") ? 30 : 35;
    const existing = cart.find(i => i.name === itemName);
    if (existing) {
      existing.qty += qtyInput;
    } else {
      cart.push({ name: itemName, price, qty: qtyInput });
    }
  }

  document.getElementById("itemQty").value = 1;
  updateCart();
}

function updateCart() {
  const list = document.getElementById("cartList");
  list.innerHTML = "";
  let subtotal = 0;

  cart.forEach((item, i) => {
    subtotal += item.price * item.qty;
    const li = document.createElement("li");
    li.innerHTML = `${item.name} x${item.qty} - $${(item.price * item.qty).toFixed(2)}
      <button onclick="removeItem(${i})">❌</button>`;
    list.appendChild(li);
  });

  document.getElementById("subtotal").textContent = subtotal.toFixed(2);
  const delivery = parseFloat(document.getElementById("deliveryFee").value) || 0;
  document.getElementById("total").textContent = (subtotal + delivery).toFixed(2);
}

function removeItem(index) {
  cart.splice(index, 1);
  updateCart();
}

function clearCart() {
  cart = [];
  updateCart();
  document.getElementById("receipt").innerHTML = "";
}

function generateReceipt() {
  const name = document.getElementById("customerName").value || "N/A";
  const address = document.getElementById("deliveryAddress").value || "N/A";
  const contact = document.getElementById("contactNumber").value || "N/A";
  const delivery = parseFloat(document.getElementById("deliveryFee").value) || 0;
  const subtotal = parseFloat(document.getElementById("subtotal").textContent);
  const total = subtotal + delivery;
  const today = new Date().toLocaleDateString();

  const manualNumber = document.getElementById("manualReceiptNumber").value.trim();
  const receiptNum = manualNumber || (++receiptCounter).toString().padStart(3, "0");

  if (!manualNumber) localStorage.setItem("receiptNumber", receiptCounter);

  let receipt = `
    <div style="text-align:center;">
      <img src="images/logo.png" alt="Logo" style="width: 350px; margin-bottom: -150px; margin-top: -150px" />
    </div>
    <pre style="text-align:left; font-family: monospace; font-size: 12px;">
Date: ${today}
Receipt #: ${receiptNum}
Customer: ${name}
Address: ${address}
Contact: ${contact}
------------------------------
${cart.map(item => `${item.name} x${item.qty} - $${(item.price * item.qty).toFixed(2)}`).join("\n")}
------------------------------
SUBTOTAL: $${subtotal.toFixed(2)}
DELIVERY FEE: $${delivery.toFixed(2)}
TOTAL: $${total.toFixed(2)}
------------------------------
Thank you for your order!
We appreciate your support and
hope you enjoy every bite.
¡Buen provecho!

📞 719-9251  |  📷 @La.Cocina.Venezolana
</pre>
`;

  document.getElementById("receipt").innerHTML = receipt;
  savedReceipts.push({ id: receiptNum, content: receipt });
  localStorage.setItem("savedReceipts", JSON.stringify(savedReceipts));
}

function downloadImage() {
  const receipt = document.getElementById("receipt");
  if (!receipt.innerHTML.trim()) return alert("Please generate the receipt first.");

  const scaleFactor = 6; // scale up
  html2canvas(receipt, {
    scale: scaleFactor,
    useCORS: true
  }).then(canvas => {
    const link = document.createElement("a");
    link.download = `receipt_${Date.now()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  });
}

function renderSavedReceipts() {
  const container = document.getElementById("receiptList");
  if (!savedReceipts.length) {
    container.innerHTML = "No saved receipts.";
    return;
  }

  container.innerHTML = "";
  savedReceipts.slice().reverse().forEach(r => {
    const div = document.createElement("div");
    div.classList.add("receipt-entry");
    div.innerHTML = r.content;
    container.appendChild(div);
  });
}