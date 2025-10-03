
/* app.js — front-end logic and mock AI demos
   This file provides:
   - Product rendering
   - Mock negotiation bot logic (client-side heuristic)
   - Chatbot UI (mocked, shows how to hook to real LLM backend)
   - Crowd-powered trends (local votes, demonstrates aggregation)
   - Dream-to-product converter (mock generation + instructions to replace with real AI)
   - Virtual camera overlay (getUserMedia + draggable/scalable overlay)
*/

const products = [
  {id:1,title:'Handcrafted Mango Wood Lamp',price:2499,img:'https://images.unsplash.com/photo-1578894381034-4f1a6403b9b8?auto=format&fit=crop&w=800&q=60',seller:'Ravi Crafts',pop:5},
  {id:2,title:'Warli Painted Cushion',price:799,img:'https://images.unsplash.com/photo-1582719478173-1b7b4af8f1a1?auto=format&fit=crop&w=800&q=60',seller:'Asha Handloom',pop:12},
  {id:3,title:'Recycled Glass Mango Bowl',price:1199,img:'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=60',seller:'GreenGlass',pop:8}
];

// --- DOM refs
const productGrid = document.getElementById('productGrid');
const searchInput = document.getElementById('search');
const sortSelect = document.getElementById('sort');
const negotiationDrawer = document.getElementById('negotiationDrawer');
const negProductName = document.getElementById('negProductName');
const negListPrice = document.getElementById('negListPrice');
const offerInput = document.getElementById('offerInput');
const sendOffer = document.getElementById('sendOffer');
const negFeedback = document.getElementById('negFeedback');
let selectedProduct = null;

// render products
function renderProducts(list){
  productGrid.innerHTML = '';
  list.forEach(p=>{
    const card = document.createElement('article');
    card.className = 'product-card';
    card.innerHTML = `
      <img src="${p.img}" alt="${p.title}">
      <div class="product-title">${p.title}</div>
      <div class="muted">by ${p.seller}</div>
      <div class="price">₹${p.price}</div>
      <div class="card-actions">
        <button class="btn" data-buy="${p.id}">Buy</button>
        <button class="btn" data-negotiate="${p.id}">Negotiate</button>
        <button class="btn" data-preview="${p.id}">Preview</button>
      </div>
    `;
    productGrid.appendChild(card);
  })
}

renderProducts(products);

// filters
searchInput.addEventListener('input', ()=>{
  const q = searchInput.value.toLowerCase().trim();
  const filtered = products.filter(p => p.title.toLowerCase().includes(q) || p.seller.toLowerCase().includes(q));
  renderProducts(filtered);
});
sortSelect.addEventListener('change', ()=>{
  const v = sortSelect.value;
  const copy = [...products];
  if(v==='price-asc') copy.sort((a,b)=>a.price-b.price);
  else if(v==='new') copy.sort((a,b)=>b.id-a.id);
  else copy.sort((a,b)=>b.pop-a.pop);
  renderProducts(copy);
});

// delegation for product buttons
productGrid.addEventListener('click', (e)=>{
  const neg = e.target.closest('[data-negotiate]');
  const preview = e.target.closest('[data-preview]');
  if(neg){
    const id = Number(neg.dataset.negotiate);
    openNegotiation(id);
  }
  if(preview){
    const id = Number(preview.dataset.preview);
    openCameraWithProduct(id);
  }
});

// --- Negotiation bot (client-side heuristic demo)
function openNegotiation(id){
  selectedProduct = products.find(p=>p.id===id);
  negotiationDrawer.setAttribute('aria-hidden','false');
  negProductName.textContent = selectedProduct.title;
  negListPrice.textContent = selectedProduct.price;
  negFeedback.innerHTML = `<p class="muted">Negotiation started. Tip: offer between 70%–95% of listed price depending on supply/demand.</p>`;
}

document.getElementById('closeNegotiate').addEventListener('click', ()=>{
  negotiationDrawer.setAttribute('aria-hidden','true');
});

sendOffer.addEventListener('click', ()=>{
  const offer = Number(offerInput.value);
  if(!selectedProduct){ negFeedback.textContent='Select a product first'; return; }
  if(!offer || offer<=0){ negFeedback.textContent='Enter a valid offer'; return; }
  // simple heuristic: willingness threshold based on popularity
  const demandFactor = Math.max(0.6, 1 - (selectedProduct.pop/30)); // high pop => less discount
  const acceptable = Math.round(selectedProduct.price * (0.9 - (demandFactor-0.6)/2));
  // simulate "seller intelligence" that sometimes counters
  if(offer >= selectedProduct.price * 0.98){
    negFeedback.innerHTML = `<div class="chat-message"><div class="meta">Seller:</div><div>Accepted ✅ — order placed at ₹${offer}</div></div>`;
  } else if(offer >= acceptable){
    const counter = Math.round((offer + selectedProduct.price)/2);
    negFeedback.innerHTML = `<div class="chat-message"><div class="meta">Seller:</div><div>I'd accept ₹${counter} — or we can include free shipping. Accept?</div></div>`;
  } else {
    const rejectReason = offer < selectedProduct.price*0.5 ? 'too low' : 'below expected range';
    negFeedback.innerHTML = `<div class="chat-message"><div class="meta">Seller:</div><div>Sorry, offer ₹${offer} is ${rejectReason}. Suggested minimum ₹${Math.round(selectedProduct.price*0.75)}</div></div>`;
  }
  // In production: send offer to server (seller agent) and let real AI/negotiation engine respond
  // fetch('/api/negotiate',{method:'POST',body:JSON.stringify({productId:selectedProduct.id,offer})})
});

// --- Chatbot UI (mock). Replace with real LLM endpoint in production.
const chatModal = document.getElementById('chatModal');
const chatLog = document.getElementById('chatLog');
const chatForm = document.getElementById('chatForm');
const chatInput = document.getElementById('chatInput');
document.getElementById('openChat').addEventListener('click', ()=>{chatModal.setAttribute('aria-hidden','false');});
document.getElementById('closeChat').addEventListener('click', ()=>{chatModal.setAttribute('aria-hidden','true');});

chatForm.addEventListener('submit', async (e)=>{
  e.preventDefault();
  const q = chatInput.value.trim(); if(!q) return;
  appendChat('You', q);
  chatInput.value='';
  appendChat('Bot', 'Thinking...');
  // demo: simple rule-based responses
  setTimeout(()=>{
    chatLog.lastElementChild.innerHTML = '<div class="meta">Bot:</div><div>We recommend hand-washing or mild detergent for our textiles. For bargaining, start at 80% and be polite; sellers value relationships.</div>';
    chatLog.scrollTop = chatLog.scrollHeight;
  },700);

  // PRODUCTION: call a real LLM endpoint with product context
  /*
  const res = await fetch('/api/ai-chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({prompt:q,context:{products}})}).then(r=>r.json());
  appendChat('Bot', res.answer);
  */
});

function appendChat(who, text){
  const div = document.createElement('div');
  div.className='chat-message';
  div.innerHTML = `<div class="meta">${who}:</div><div>${text}</div>`;
  chatLog.appendChild(div);
  chatLog.scrollTop = chatLog.scrollHeight;
}

// --- Crowd-Powered Trends (local demo)
const trends = { 'Warli Painted Cushion': 12, 'Mango Wood Lamp': 5, 'Recycled Glass': 8 };
// button
const trendsBtn = document.getElementById('trendsBtn');
trendsBtn.addEventListener('click', ()=>{
  showTrends();
});
function showTrends(){
  const body = document.querySelector('.panel-body');
  body.innerHTML = '<h4>Top trending products</h4>' + Object.entries(trends).sort((a,b)=>b[1]-a[1]).map(([k,v])=>`<div>${k} — ${v} votes <button class="btn tiny" data-vote="${k}">Vote</button></div>`).join('');
  body.querySelectorAll('[data-vote]').forEach(b=>b.addEventListener('click', (e)=>{
    const key = e.currentTarget.dataset.vote;
    trends[key] = (trends[key]||0) + 1;
    // In production: record vote on the server so aggregated trends are reliable
    showTrends();
  }));
}

// --- Dream → Product (mock generator)
const openDream = document.getElementById('openDream');
const dreamModal = document.getElementById('dreamModal');
openDream.addEventListener('click', ()=> dreamModal.setAttribute('aria-hidden','false'));
document.getElementById('closeDream').addEventListener('click', ()=> dreamModal.setAttribute('aria-hidden','true'));

document.getElementById('dreamGenerate').addEventListener('click', ()=>{
  const text = document.getElementById('dreamInput').value.trim();
  const out = document.getElementById('dreamResults');
  if(!text){ out.innerHTML = '<div class="muted">Describe your dream or need.</div>'; return; }
  out.innerHTML = '<div class="muted">Generating handcrafted suggestions…</div>';
  // mock: transform description to products
  setTimeout(()=>{
    const suggestions = [
      {title:`Custom ${text.split(' ').slice(0,3).join(' ')} Lamp`, desc:'Locally carved mango wood with warli etchings', estPrice:1999},
      {title:`Artisan ${text.split(' ').slice(0,2).join(' ')} Set`, desc:'Hand-painted by village artisans', estPrice:899}
    ];
    out.innerHTML = suggestions.map(s=>`<div class="product-card"><div class="product-title">${s.title}</div><div class="muted">${s.desc}</div><div class="price">₹${s.estPrice}</div><div class="card-actions"><button class="btn">Request Quote</button></div></div>`).join('');
  },900);

  // PRODUCTION: call an LLM (text-to-design) endpoint or image generation + artisan matching
  /*
  fetch('/api/dream-to-product',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({prompt:text})}).then(r=>r.json()).then(data=>{
    render suggestions from data
  })
  */
});

// --- Virtual Room Camera (client-only overlay)
const cameraModal = document.getElementById('cameraModal');
const cameraVideo = document.getElementById('cameraVideo');
const overlaySelect = document.getElementById('overlaySelect');
const snapShot = document.getElementById('snapShot');
const cameraCanvas = document.getElementById('cameraCanvas');
let overlayImg = null;

function openCameraWithProduct(productId){
  cameraModal.setAttribute('aria-hidden','false');
  startCamera();
  // populate overlay options
  overlaySelect.innerHTML = products.map(p=>`<option value="${p.id}">${p.title}</option>`).join('');
  overlaySelect.value = productId;
  setOverlayImage(productId);
}

document.getElementById('cameraBtn').addEventListener('click', ()=>{
  cameraModal.setAttribute('aria-hidden','false');
  startCamera();
  overlaySelect.innerHTML = products.map(p=>`<option value="${p.id}">${p.title}</option>`).join('');
});

document.getElementById('closeCamera').addEventListener('click', ()=>{
  cameraModal.setAttribute('aria-hidden','true');
  stopCamera();
});

overlaySelect.addEventListener('change',(e)=> setOverlayImage(Number(e.target.value)));

function setOverlayImage(productId){
  const p = products.find(x=>x.id==productId);
  if(!p) return;
  // create overlay image element inside camera modal
  if(overlayImg) overlayImg.remove();
  overlayImg = document.createElement('img');
  overlayImg.src = p.img; overlayImg.alt = p.title;
  overlayImg.style.position='absolute';
  overlayImg.style.width='30%';
  overlayImg.style.left='30%'; overlayImg.style.top='30%';
  overlayImg.style.opacity='0.95'; overlayImg.style.border='2px dashed rgba(0,0,0,0.12)';
  overlayImg.style.borderRadius='8px';
  overlayImg.draggable=false;
  document.querySelector('.camera-body').appendChild(overlayImg);
  makeDraggableAndScalable(overlayImg);
}

function startCamera(){
  navigator.mediaDevices && navigator.mediaDevices.getUserMedia({video:{facingMode:'environment'}}).then(stream=>{
    cameraVideo.srcObject = stream;
  }).catch(err=>{
    alert('Cannot access camera: ' + err.message + '\nThis demo works better on mobile with camera permissions enabled.');
  });
}
function stopCamera(){
  const stream = cameraVideo.srcObject;
  if(stream){ stream.getTracks().forEach(t=>t.stop()); cameraVideo.srcObject = null; }
  if(overlayImg) overlayImg.remove(); overlayImg=null;
}

snapShot.addEventListener('click', ()=>{
  cameraCanvas.width = cameraVideo.videoWidth;
  cameraCanvas.height = cameraVideo.videoHeight;
  const ctx = cameraCanvas.getContext('2d');
  ctx.drawImage(cameraVideo,0,0,cameraCanvas.width,cameraCanvas.height);
  if(overlayImg){
    // draw overlay image relative to video size
    const rect = overlayImg.getBoundingClientRect();
    const videoRect = cameraVideo.getBoundingClientRect();
    // compute normalized coords
    const sx = (rect.left - videoRect.left) / videoRect.width;
    const sy = (rect.top - videoRect.top) / videoRect.height;
    const sw = rect.width / videoRect.width;
    const sh = rect.height / videoRect.height;
    // create temporary img to draw scaled
    const tmp = new Image();
    tmp.crossOrigin = 'anonymous';
    tmp.onload = ()=>{
      ctx.drawImage(tmp, sx*cameraCanvas.width, sy*cameraCanvas.height, sw*cameraCanvas.width, sh*cameraCanvas.height);
      const dataUrl = cameraCanvas.toDataURL('image/png');
      const w = window.open();
      w.document.body.style.margin='0';
      const img = new Image(); img.src = dataUrl; w.document.body.appendChild(img);
    };
    tmp.src = overlayImg.src;
  }
});

// minimal drag & scale implementation
function makeDraggableAndScalable(el){
  let dragging=false, startX=0, startY=0, origX=0, origY=0;
  el.addEventListener('pointerdown', (e)=>{
    dragging=true; el.setPointerCapture(e.pointerId); startX=e.clientX; startY=e.clientY;
    origX = parseFloat(el.style.left);
    origY = parseFloat(el.style.top);
  });
  window.addEventListener('pointermove', (e)=>{
    if(!dragging) return;
    const dx = e.clientX - startX; const dy = e.clientY - startY;
    el.style.left = (origX + dx) + 'px';
    el.style.top = (origY + dy) + 'px';
  });
  window.addEventListener('pointerup', (e)=>{ dragging=false; try{el.releasePointerCapture(e.pointerId)}catch(e){} });
  // scaling with wheel
  el.addEventListener('wheel', (ev)=>{
    ev.preventDefault();
    const cur = parseFloat(el.style.width) || el.getBoundingClientRect().width;
    const next = Math.max(40, cur + (ev.deltaY>0?-10:10));
    el.style.width = next + 'px';
  });
}

// Setup side panel interactions
const sidePanel = document.getElementById('sidePanel');
document.getElementById('openCart').addEventListener('click', ()=>{
  sidePanel.style.display = sidePanel.style.display === 'none' ? 'block' : 'block';
  // focus on negotiation tool as default
});

const closePanel = document.getElementById('closePanel');
if(closePanel) closePanel.addEventListener('click', ()=>{ document.getElementById('sidePanel').style.display='none'; });

// show panel buttons
document.getElementById('negotiationBtn').addEventListener('click', ()=>{
  // open negotiation for first product by default
  openNegotiation(products[0].id);
});

document.getElementById('chatbotBtn').addEventListener('click', ()=>{
  chatModal.setAttribute('aria-hidden','false');
});

// init
renderProducts(products);

// Accessibility helper: close modals with Escape
window.addEventListener('keydown', (e)=>{
  if(e.key==='Escape'){
    document.querySelectorAll('.modal').forEach(m=>m.setAttribute('aria-hidden','true'));
    negotiationDrawer.setAttribute('aria-hidden','true');
  }
});

// Notes for production integration:
/*
 1) Replace mock negotiation heuristics with a server-side negotiation engine that uses seller inventory, history, and an LLM to present counter-offers.
 2) Hook the chatbot to a secure LLM backend (OpenAI/other) and pass product metadata as context. Rate-limit and moderate responses.
 3) Crowd-powered trends must store votes server-side, deduplicate users (auth) and remove suspicious voting. Use aggregated scoring and time-decay to highlight rising trends.
 4) Dream→Product: use an LLM to produce structured design prompts, then pass to image-generation or artisan-matching system. Store generated drafts as proposals for manual artisan approval.
 5) Virtual camera: this client-side overlay is a convenience. For higher fidelity, use WebXR or ARCore/ARKit wrappers and provide 3D models (.glTF). Also implement measurement calibration and occlusion if possible.
*/
