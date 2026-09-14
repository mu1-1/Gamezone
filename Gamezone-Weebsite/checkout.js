(function(){
  const open=()=>{const m=document.querySelector('#checkout-modal');if(!m)return;const p=document.querySelector('#checkout-preview');p.innerHTML=GameZoneCart.items.map(i=>`<div class="checkout-row"><span>${esc(i.name)} × ${i.qty}</span><strong>${fmt(i.prices[GameZoneCart.currency]*i.qty)} ${GameZoneCart.currency}</strong></div>`).join('')+`<div class="checkout-row"><strong>TOTAL</strong><strong>${fmt(GameZoneCart.total)} ${GameZoneCart.currency}</strong></div>`;m.hidden=false};
  const close=()=>{const m=document.querySelector('#checkout-modal');if(m)m.hidden=true};
  const esc=s=>String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const fmt=n=>Number(n).toFixed(2).replace(/\.00$/,'');
  document.addEventListener('DOMContentLoaded',()=>{
    document.querySelector('#checkout-btn')?.addEventListener('click',()=>{if(GameZoneCart.items.length)open()});
    document.querySelectorAll('[data-close]').forEach(b=>b.addEventListener('click',close));
    document.querySelector('#close-success')?.addEventListener('click',()=>document.querySelector('#order-success').hidden=true);
    document.querySelector('#copy-invoice')?.addEventListener('click',async()=>{const id=document.querySelector('#invoice-id').textContent;try{await navigator.clipboard.writeText(id);document.querySelector('#copy-invoice').textContent='COPIED ✓';setTimeout(()=>document.querySelector('#copy-invoice').textContent='COPY INVOICE ID',1500)}catch{}});
    document.querySelector('#confirm-order')?.addEventListener('click',async()=>{
      const err=document.querySelector('#checkout-error'), btn=document.querySelector('#confirm-order');err.textContent='';btn.disabled=true;btn.textContent='CREATING ORDER…';
      try{const r=await fetch('/api/orders',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({currency:GameZoneCart.currency,items:GameZoneCart.items.map(i=>({product_id:i.id,quantity:i.qty})),discord_username:document.querySelector('#customer-contact').value.trim(),note:document.querySelector('#customer-note').value.trim()})});const d=await r.json();if(!r.ok)throw new Error(d.error||'Unable to create order.');close();document.querySelector('#invoice-id').textContent=d.invoice_id;document.querySelector('#order-success').hidden=false;GameZoneCart.clear()}catch(e){err.textContent=e.message}finally{btn.disabled=false;btn.textContent='CONFIRM ORDER'}
    });
  });
})();
