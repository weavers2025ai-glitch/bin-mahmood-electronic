/* Bin Mahmood Electronic — store engine (cart, orders, accounts, settings)
   Demo-level: everything is stored in this browser's localStorage. */
(function(){
const K = {cart:"bm_cart", orders:"bm_orders", users:"bm_users", session:"bm_session",
           override:"bm_override", settings:"bm_settings", pw:"bm_admin_pw"};
const load=(k,d)=>{try{const v=JSON.parse(localStorage.getItem(k));return v==null?d:v}catch(e){return d}};
const save=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
const DEFAULT_SETTINGS={wa:"923349001195",email:"weavers2025ai@gmail.com",phone:"+92 334 900 1195",googleClientId:""};
window.BM={
 K,
 money:n=>"Rs. "+Number(n||0).toLocaleString("en-US"),
 products(){ const o=load(K.override,null); if(Array.isArray(o)&&o.length) return o; return (typeof PRODUCTS!=="undefined"&&Array.isArray(PRODUCTS))?PRODUCTS:[]; },
 saveProducts(list){ save(K.override,list); },
 settings(){ return Object.assign({},DEFAULT_SETTINGS,load(K.settings,{})); },
 saveSettings(s){ save(K.settings,s); },
 cart(){ return load(K.cart,[]); },
 cartCount(){ return this.cart().reduce((a,i)=>a+i.qty,0); },
 cartTotal(){ const ps=this.products(); return this.cart().reduce((a,i)=>{const p=ps.find(x=>x.id===i.id);return a+(p?p.price*i.qty:0)},0); },
 addToCart(id,qty){ const c=this.cart(); const it=c.find(i=>i.id===id); if(it)it.qty+=(qty||1); else c.push({id,qty:qty||1}); save(K.cart,c); this.badge(); this.toast("Added to cart"); },
 setQty(id,q){ let c=this.cart(); const it=c.find(i=>i.id===id); if(it){it.qty=q; if(q<=0)c=c.filter(i=>i.id!==id);} save(K.cart,c); this.badge(); },
 clearCart(){ save(K.cart,[]); this.badge(); },
 badge(){ document.querySelectorAll(".cartCount").forEach(e=>{const n=this.cartCount(); e.textContent=n; e.style.display=n?"grid":"none";}); },
 orders(){ return load(K.orders,[]); },
 addOrder(o){ const os=this.orders(); os.unshift(o); save(K.orders,os); },
 saveOrders(os){ save(K.orders,os); },
 users(){ return load(K.users,[]); },
 signup(name,email,phone,pass){ const us=this.users(); if(us.some(u=>u.email===email)) return {err:"This email is already registered. Please log in."};
   us.push({name,email,phone,pass,provider:"manual",at:Date.now()}); save(K.users,us); save(K.session,{name,email}); return {ok:1}; },
 login(email,pass){ const u=this.users().find(u=>u.email===email&&u.pass===pass); if(!u) return {err:"Email or password is incorrect."};
   save(K.session,{name:u.name,email:u.email}); return {ok:1}; },
 googleLogin(profile){ const us=this.users(); if(!us.some(u=>u.email===profile.email)){ us.push({name:profile.name,email:profile.email,phone:"",pass:"",provider:"google",at:Date.now()}); save(K.users,us);} save(K.session,{name:profile.name,email:profile.email}); },
 user(){ return load(K.session,null); },
 logout(){ localStorage.removeItem(K.session); },
 toast(msg){ let t=document.getElementById("bmToast"); if(!t){ t=document.createElement("div"); t.id="bmToast";
   t.style.cssText="position:fixed;bottom:24px;left:50%;transform:translateX(-50%) translateY(20px);background:#24246c;color:#fff;padding:13px 22px;border-radius:99px;font-weight:600;font-size:14px;z-index:300;opacity:0;transition:.35s;box-shadow:0 16px 36px rgba(16,16,52,.35)"; document.body.appendChild(t);}
   t.textContent=msg; t.style.opacity="1"; t.style.transform="translateX(-50%) translateY(0)";
   clearTimeout(t._h); t._h=setTimeout(()=>{t.style.opacity="0"; t.style.transform="translateX(-50%) translateY(20px)"},2200); }
};
document.addEventListener("DOMContentLoaded",()=>BM.badge());
})();
