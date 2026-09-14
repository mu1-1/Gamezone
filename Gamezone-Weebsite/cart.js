(function(){
  'use strict';
  const KEY='gamezoneCartV1';
  const currencyConfig={JOD:{label:'JOD'},USD:{label:'USD'},SAR:{label:'SAR'}};
  const state={currency:localStorage.getItem('gamezoneCurrency')||'JOD',items:load()};

  function load(){try{const x=JSON.parse(localStorage.getItem(KEY)||'[]');return Array.isArray(x)?x:[]}catch{return []}}
  function save(){localStorage.setItem(KEY,JSON.stringify(state.items));updateBadge()}
  function updateBadge(){const count=state.items.reduce((n,i)=>n+i.qty,0);document.querySelectorAll('.cart-count').forEach(e=>e.textContent=count)}
  function price(i){return Number(i.prices?.[state.currency]||0)}
  function total(){return state.items.reduce((s,i)=>s+price(i)*i.qty,0)}
  function fmt(n){return Number(n).toFixed(2).replace(/\.00$/,'')}
  function esc(s){return String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}

  function buildDrawer(){
    if(document.querySelector('#gz-cart-drawer'))return;
    const el=document.createElement('div');
    el.innerHTML=`<button class="gz-floating-cart" type="button" data-open-cart aria-label="Open cart">🛒 <span class="cart-count">0</span></button>
      <div class="gz-cart-overlay" id="gz-cart-overlay" hidden></div>
      <aside class="gz-cart-drawer" id="gz-cart-drawer" aria-hidden="true" aria-label="Shopping cart">
        <div class="gz-cart-head"><div><span>CART</span><h2>Your <b>Order</b></h2></div><button class="gz-cart-close" id="gz-cart-close" aria-label="Close cart">×</button></div>
        <div class="gz-cart-body">
          <div id="gz-cart-items"></div>
          <div class="gz-cart-empty" id="gz-cart-empty"><div class="gz-cart-empty-icon">🛒</div><h3>Your cart is empty</h3><p>Add products from any GameZone page. They will stay in the same cart.</p><button class="gz-cart-shop" data-close-cart>CONTINUE SHOPPING</button></div>
        </div>
        <div class="gz-cart-foot" id="gz-cart-foot" hidden>
          <div class="gz-cart-total"><span>TOTAL</span><strong id="gz-cart-total">0 JOD</strong></div>
          <button class="gz-checkout-btn" id="gz-checkout-btn">CHECKOUT <span>→</span></button>
        </div>
      </aside>
      <div class="gz-modal" id="gz-checkout-modal" hidden>
        <div class="gz-modal-card" role="dialog" aria-modal="true" aria-labelledby="gz-checkout-title">
          <button class="gz-modal-x" data-close-checkout aria-label="Close">×</button>
          <span>CHECKOUT</span><h2 id="gz-checkout-title">Review your <b>order.</b></h2>
          <div id="gz-checkout-preview"></div>
          <div class="gz-checkout-fields">
            <label>Discord username <small>required for order contact</small><input id="gz-customer-contact" maxlength="80" autocomplete="off" placeholder="example: username"></label>
            <label>Order note <small>optional</small><textarea id="gz-customer-note" maxlength="500" placeholder="Anything we should know?"></textarea></label>
          </div>
          <p class="gz-checkout-warning">Are you sure you want to place this order?</p>
          <div class="gz-modal-actions"><button class="gz-cancel-btn" data-close-checkout>CANCEL</button><button class="gz-confirm-btn" id="gz-confirm-order">CONFIRM ORDER</button></div>
          <div class="gz-form-error" id="gz-checkout-error"></div>
        </div>
      </div>
      <div class="gz-modal" id="gz-success-modal" hidden>
        <div class="gz-modal-card gz-success-card" role="dialog" aria-modal="true">
          <span>ORDER CREATED</span><h2>Your invoice is <b>ready.</b></h2>
          <p>Send this Invoice ID to GameZone through Discord or Instagram.</p>
          <div class="gz-invoice" id="gz-invoice-id">GZ-2026-000000</div>
          <div class="gz-modal-actions"><button class="gz-confirm-btn" id="gz-copy-invoice">COPY INVOICE ID</button></div>
          <div class="gz-modal-actions gz-social-actions"><a href="https://discord.gg/KQDdDcYyf8" target="_blank" rel="noopener" class="gz-discord">DISCORD ↗</a><a href="https://www.instagram.com/gam_ezone.jo/" target="_blank" rel="noopener" class="gz-instagram">INSTAGRAM ↗</a></div>
          <button class="gz-cancel-btn" id="gz-close-success">CLOSE</button>
        </div>
      </div>`;
    document.body.appendChild(el);
  }

  function openCart(){buildDrawer();const d=document.querySelector('#gz-cart-drawer'),o=document.querySelector('#gz-cart-overlay');d.classList.add('open');o.hidden=false;requestAnimationFrame(()=>o.classList.add('open'));d.setAttribute('aria-hidden','false');document.body.classList.add('gz-no-scroll');render()}
  function closeCart(){const d=document.querySelector('#gz-cart-drawer'),o=document.querySelector('#gz-cart-overlay');if(!d)return;d.classList.remove('open');o.classList.remove('open');setTimeout(()=>o.hidden=true,220);d.setAttribute('aria-hidden','true');document.body.classList.remove('gz-no-scroll')}
  function openCheckout(){if(!state.items.length)return;closeCart();buildDrawer();const p=document.querySelector('#gz-checkout-preview');p.innerHTML=state.items.map(i=>`<div class="gz-checkout-row"><span>${esc(i.name)} × ${i.qty}</span><strong>${fmt(price(i)*i.qty)} ${state.currency}</strong></div>`).join('')+`<div class="gz-checkout-row total"><strong>TOTAL</strong><strong>${fmt(total())} ${state.currency}</strong></div>`;document.querySelector('#gz-checkout-error').textContent='';document.querySelector('#gz-checkout-modal').hidden=false;document.body.classList.add('gz-no-scroll');setTimeout(()=>document.querySelector('#gz-customer-contact')?.focus(),50)}
  function closeCheckout(){const m=document.querySelector('#gz-checkout-modal');if(m)m.hidden=true;document.body.classList.remove('gz-no-scroll')}
  function toast(msg){let t=document.querySelector('.gz-toast');if(!t){t=document.createElement('div');t.className='gz-toast';document.body.appendChild(t)}t.textContent=msg;t.classList.add('show');clearTimeout(t._t);t._t=setTimeout(()=>t.classList.remove('show'),1500)}
  function add(item){const found=state.items.find(i=>i.id===item.id);if(found){found.qty=Math.min(50,found.qty+1)}else state.items.push({...item,qty:1});save();render();toast('Added to cart ✓')}
  function render(){buildDrawer();const box=document.querySelector('#gz-cart-items'),empty=document.querySelector('#gz-cart-empty'),foot=document.querySelector('#gz-cart-foot');box.innerHTML='';if(!state.items.length){empty.hidden=false;foot.hidden=true;updateBadge();return}empty.hidden=true;foot.hidden=false;state.items.forEach(i=>{const row=document.createElement('div');row.className='gz-cart-item';row.innerHTML=`<div class="gz-cart-item-main"><strong>${esc(i.name)}</strong><small>${esc(i.category)}</small><b>${fmt(price(i))} ${state.currency}</b></div><div class="gz-qty"><button data-cart-action="dec" data-id="${esc(i.id)}">−</button><span>${i.qty}</span><button data-cart-action="inc" data-id="${esc(i.id)}">+</button></div><button class="gz-remove" data-cart-action="remove" data-id="${esc(i.id)}">REMOVE</button>`;box.appendChild(row)});document.querySelector('#gz-cart-total').textContent=`${fmt(total())} ${state.currency}`;updateBadge()}

  document.addEventListener('click',e=>{
    const addBtn=e.target.closest('[data-cart-add]');
    if(addBtn){e.preventDefault();e.stopPropagation();add({id:addBtn.dataset.id,name:addBtn.dataset.name,category:addBtn.dataset.category,prices:{JOD:addBtn.dataset.jod,USD:addBtn.dataset.usd,SAR:addBtn.dataset.sar}});openCart();return}
    const cartOpen=e.target.closest('[data-open-cart],.cart-trigger');if(cartOpen){e.preventDefault();openCart();return}
    const action=e.target.closest('[data-cart-action]');if(action){const item=state.items.find(x=>x.id===action.dataset.id);if(!item)return;if(action.dataset.cartAction==='inc')item.qty=Math.min(50,item.qty+1);if(action.dataset.cartAction==='dec')item.qty--;if(action.dataset.cartAction==='remove'||item.qty<1)state.items=state.items.filter(x=>x.id!==item.id);save();render();return}
    if(e.target.closest('#gz-cart-close')||e.target.closest('[data-close-cart]')){closeCart();return}
    if(e.target.id==='gz-cart-overlay'){closeCart();return}
    if(e.target.closest('#gz-checkout-btn')){openCheckout();return}
    if(e.target.closest('[data-close-checkout]')){closeCheckout();return}
    if(e.target.id==='gz-confirm-order')createOrder();
    if(e.target.id==='gz-copy-invoice')copyInvoice();
    if(e.target.id==='gz-close-success'){document.querySelector('#gz-success-modal').hidden=true;document.body.classList.remove('gz-no-scroll')}
  });

  async function createOrder(){
    const err=document.querySelector('#gz-checkout-error'),btn=document.querySelector('#gz-confirm-order'),contact=document.querySelector('#gz-customer-contact').value.trim(),note=document.querySelector('#gz-customer-note').value.trim();
    if(!contact){err.textContent='Please enter your Discord username.';return}
    btn.disabled=true;btn.textContent='CREATING ORDER…';err.textContent='';
    try{const r=await fetch('/api/orders',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({currency:state.currency,items:state.items.map(i=>({product_id:i.id,quantity:i.qty})),discord_username:contact,note})});const d=await r.json().catch(()=>({}));if(!r.ok)throw new Error(d.error||'Unable to create order.');closeCheckout();state.items=[];save();document.querySelector('#gz-invoice-id').textContent=d.invoice_id;document.querySelector('#gz-success-modal').hidden=false;document.body.classList.add('gz-no-scroll')}catch(e){err.textContent=e.message}finally{btn.disabled=false;btn.textContent='CONFIRM ORDER'}
  }
  async function copyInvoice(){const id=document.querySelector('#gz-invoice-id').textContent;try{await navigator.clipboard.writeText(id);document.querySelector('#gz-copy-invoice').textContent='COPIED ✓';setTimeout(()=>document.querySelector('#gz-copy-invoice').textContent='COPY INVOICE ID',1400)}catch{}}

  window.GameZoneCart={get items(){return state.items},get currency(){return state.currency},get total(){return total()},open:openCart,close:closeCart,clear(){state.items=[];save();render()}};
  window.addEventListener('DOMContentLoaded',()=>{buildDrawer();const s=document.querySelector('#currency-select');if(s){state.currency=s.value||state.currency;s.addEventListener('change',()=>{state.currency=s.value;localStorage.setItem('gamezoneCurrency',state.currency);render()})}render();updateBadge()});
  window.addEventListener('keydown',e=>{if(e.key==='Escape'){closeCart();closeCheckout();const sm=document.querySelector('#gz-success-modal');if(sm&&!sm.hidden){sm.hidden=true;document.body.classList.remove('gz-no-scroll')}}});
})();
