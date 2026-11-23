/* Bin Mahmood Electronic — store engine */
const BM_DEFAULTS = {
  storeName: "Bin Mahmood Electronic",
  tagline: "Pakistan's trusted electronics store since 1956 — 100% original products with official warranty.",
  announce: "Since 1956 · 17 showrooms in Peshawar · Free delivery across Pakistan · 100% original products with official warranty",
  heroKicker: "Bin Mahmood Electronic — Since 1956",
  heroTitle: "Quality products, <em>honest prices</em>, delivered to your door.",
  heroText: "Pakistan's trusted electronics destination — original products with official manufacturer warranty, free nationwide delivery and easy installments.",
  heroImg: "",
  stripTitle: "Order on WhatsApp",
  stripText: "Send us your order on WhatsApp and our team will confirm it right away.",
  shipFlat: 0, shipFree: 0,
  wa: "923349001195",
  address: "Peshawar, Pakistan — 17 Showrooms",
  email: ""
};
const bmGet = (k, d) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } };
const bmSet = (k, v) => localStorage.setItem(k, JSON.stringify(v));
const settings = Object.assign({}, BM_DEFAULTS, bmGet("bm_settings", {}));
const overrides = bmGet("bm_override", { products: {}, deleted: [], added: [] });
function catalog() {
  let list = (typeof PRODUCTS!=="undefined"?PRODUCTS:[]).map(p => {
    const o = overrides.products[p.id];
    return o ? Object.assign({}, p, o) : p;
  }).filter(p => !overrides.deleted.includes(p.id));
  return list.concat(overrides.added || []);
}
let cart = bmGet("bm_cart", []);
const rs = n => "Rs. " + Number(n || 0).toLocaleString("en-PK");
const esc = s => String(s == null ? "" : s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const disc = p => (p.compare && p.compare > p.price) ? Math.round((1 - p.price / p.compare) * 100) : 0;

function logoHTML() { return `<a class="logo" href="index.html" aria-label="${esc(settings.storeName)}"><img src="assets/logo.svg" alt="${esc(settings.storeName)}"></a>`; }
function headerHTML(active) {
  const links = [["index.html", "Home"], ["shop.html", "Shop"], ["about.html", "About"], ["contact.html", "Contact"]];
  return `<div class="announce">${esc(settings.announce)}</div>
  <header class="site"><div class="wrap head-in">
    <button class="icon-btn burger" onclick="document.querySelector('nav.main').classList.toggle('open')" aria-label="Menu">☰</button>
    ${logoHTML()}
    <nav class="main">${links.map(l => `<a href="${l[0]}" class="${active === l[0] ? "on" : ""}">${l[1]}</a>`).join("")}</nav>
    <div class="head-actions">
      <form class="search-box" action="shop.html" method="get"><input name="q" placeholder="Search products…" aria-label="Search"><button class="icon-btn" style="border:0" aria-label="Search">⌕</button></form>
      <button class="icon-btn" onclick="openCart()" aria-label="Cart">🛍<span class="cart-count" id="cartCount">0</span></button>
    </div>
  </div></header>`;
}
function footerHTML() {
  return `<footer class="site"><div class="wrap">
    <div class="foot-grid">
      <div><h4>${esc(settings.storeName)}</h4><p style="font-size:14.5px;max-width:300px">${esc(settings.tagline)}</p></div>
      <div><h4>Shop</h4><a href="shop.html">All Products</a><a href="shop.html?sale=1">Sale Items</a><a href="shop.html?cat=Runners">Runners</a><a href="shop.html?cat=Sneakers">Sneakers</a></div>
      <div><h4>Help</h4><a href="about.html">About Us</a><a href="contact.html">Contact</a><a href="checkout.html">Checkout</a><a href="admin/admin.html">Admin Panel</a></div>
      <div><h4>Visit Us</h4><p style="font-size:14.5px">${esc(settings.address)}</p><p style="font-size:14.5px;margin-top:8px">WhatsApp: +92 334 900 1195</p></div>
    </div>
    <div class="foot-bottom"><span>© 2026 ${esc(settings.storeName)}. All rights reserved.</span><span>Cash on Delivery · Easypaisa · JazzCash · Cards</span></div>
  </div></footer>`;
}
function drawerHTML() {
  return `<div class="scrim" id="scrim" onclick="closeAll()"></div>
  <aside class="drawer" id="cartDrawer">
    <header><h3 class="serif">Your Cart</h3><button class="icon-btn" onclick="closeAll()">✕</button></header>
    <div class="items" id="cartItems"></div>
    <footer><div class="summary-line total" style="border:0;margin:0;padding:0 0 12px"><span>Total</span><span id="cartTotal">Rs. 0</span></div>
    <a class="btn" style="width:100%;justify-content:center" href="checkout.html">Proceed to Checkout</a></footer>
  </aside>
  <div class="modal" id="qvModal"><div class="box" id="qvBox"></div></div>
  <div class="toast" id="toast"></div>`;
}
function mount(active) {
  document.body.insertAdjacentHTML("afterbegin", headerHTML(active));
  document.body.insertAdjacentHTML("beforeend", footerHTML() + drawerHTML());
  updateCartUI();
}
function toast(msg) { const t = document.getElementById("toast"); t.textContent = msg; t.classList.add("on"); setTimeout(() => t.classList.remove("on"), 2200); }
function saveCart() { bmSet("bm_cart", cart); updateCartUI(); }
function cartQty() { return cart.reduce((a, c) => a + c.qty, 0); }
function cartTotal() { return cart.reduce((a, c) => a + c.qty * c.price, 0); }
function updateCartUI() {
  const cc = document.getElementById("cartCount"); if (cc) cc.textContent = cartQty();
  const box = document.getElementById("cartItems"); if (!box) return;
  if (!cart.length) { box.innerHTML = `<p style="color:var(--muted);padding:22px 0;text-align:center">Your cart is empty.</p>`; }
  else box.innerHTML = cart.map((c, i) => `<div class="mini-item"><img src="${esc(c.img)}" alt=""><div class="t"><b>${esc(c.name)}</b><span>Size: ${esc(c.size)} · ${rs(c.price)}</span></div>
    <span class="qty"><button onclick="chQty(${i},-1)">−</button><b>${c.qty}</b><button onclick="chQty(${i},1)">+</button></span>
    <button class="qv-btn" onclick="rmItem(${i})" aria-label="Remove">✕</button></div>`).join("");
  const ct = document.getElementById("cartTotal"); if (ct) ct.textContent = rs(cartTotal());
}
function chQty(i, d) { cart[i].qty += d; if (cart[i].qty < 1) cart.splice(i, 1); saveCart(); }
function rmItem(i) { cart.splice(i, 1); saveCart(); }
function openCart() { document.getElementById("cartDrawer").classList.add("open"); document.getElementById("scrim").classList.add("on"); }
function closeAll() { document.getElementById("cartDrawer").classList.remove("open"); document.getElementById("scrim").classList.remove("on"); const m = document.getElementById("qvModal"); if (m) m.classList.remove("open"); }
function findP(id) { return catalog().find(p => String(p.id) === String(id)); }
function addToCart(id, size, qty) {
  const p = findP(id); if (!p) return;
  size = size || (p.sizes && p.sizes[0]) || "—"; qty = qty || 1;
  const ex = cart.find(c => String(c.id) === String(id) && c.size === size);
  if (ex) ex.qty += qty; else cart.push({ id: p.id, name: p.name, price: p.price, img: p.img, size, qty });
  saveCart(); toast("Added to cart ✔"); openCart();
}
function cardHTML(p) {
  const d = disc(p);
  return `<article class="card">
    <div class="ph"><img loading="lazy" src="${esc(p.img)}" alt="${esc(p.name)}" onerror="this.style.opacity=.25">
    ${d ? `<span class="badge">−${d}%</span>` : ""}${p.available === false ? `<span class="badge out" style="left:auto;right:10px">Sold Out</span>` : ""}</div>
    <div class="bd"><span class="brand">${esc(p.brand || "")}</span><h3>${esc(p.name)}</h3>
    <span class="sizes">${esc(p.category || "")}${p.sizes && p.sizes.length ? " · EU " + p.sizes.join(", ") : ""}</span>
    <div class="price"><b>${rs(p.price)}</b>${p.compare ? `<s>${rs(p.compare)}</s>` : ""}</div>
    <div class="row"><button class="btn" ${p.available === false ? "disabled" : ""} onclick="addToCart('${p.id}')">Add to Cart</button>
    <button class="qv-btn" onclick="quickView('${p.id}')" aria-label="Quick view">👁</button></div></div></article>`;
}
let qvSize = null;
function quickView(id) {
  const p = findP(id); if (!p) return; qvSize = (p.sizes && p.sizes[0]) || null;
  const d = disc(p);
  document.getElementById("qvBox").innerHTML = `<button class="x" onclick="closeAll()">✕</button>
    <img src="${esc(p.img)}" alt="${esc(p.name)}">
    <div class="info"><span class="brand" style="color:var(--accent);font-weight:700;letter-spacing:1.4px;font-size:12px;text-transform:uppercase">${esc(p.brand || "")}</span>
    <h3 class="serif" style="font-size:24px;margin:6px 0">${esc(p.name)}</h3>
    <div class="price"><b style="font-size:21px">${rs(p.price)}</b>${p.compare ? `<s>${rs(p.compare)}</s>` : ""}${d ? `<span class="chip">Save ${d}%</span>` : ""}</div>
    <p style="color:var(--muted);font-size:14px;margin-top:8px">Category: ${esc(p.category || "—")} · ${p.available === false ? "Currently sold out" : "In stock, ready to ship"}</p>
    ${p.sizes && p.sizes.length ? `<b style="font-size:13.5px">Select size (EU)</b><div class="size-pick">${p.sizes.map((s, i) => `<button class="${i === 0 ? "sel" : ""}" onclick="qvPick(this,'${s}')">${s}</button>`).join("")}</div>` : ""}
    <button class="btn" style="width:100%;justify-content:center" ${p.available === false ? "disabled" : ""} onclick="addToCart('${p.id}', qvSize)">Add to Cart</button>
    <a class="btn ghost" style="width:100%;justify-content:center;margin-top:9px" target="_blank" href="https://wa.me/${settings.wa}?text=${encodeURIComponent("Assalam o Alaikum! I am interested in: " + p.name + " (" + rs(p.price) + ")")}">Ask on WhatsApp</a>
    </div>`;
  document.getElementById("qvModal").classList.add("open");
}
function qvPick(btn, s) { qvSize = s; btn.parentElement.querySelectorAll("button").forEach(b => b.classList.remove("sel")); btn.classList.add("sel"); }
