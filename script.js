// Navigation Logic
function showSection(id) {
    document.querySelectorAll('section').forEach(section => section.classList.remove('visible'));
    document.getElementById(id).classList.add('visible');
}

// Product Data
const products = [
    {
        id: 1,
        name: "Shanawaz Woodden jwellery box",
        image: "shanawaz.webp",
        price: 2500,
        sensory: "Artistic Jwellery Box",
    },
    {
        id: 2,
        name: "Dhokra Crafted Horse by Utkalika",
        image: "horse.webp",
        price: 1599,
        sensory: "Best Antique for home decor",
    },
    {
        id: 3,
        name: "Rajasthani Home Decor Items Musician Bawla",
        image: "musician.webp",
        price: 1599,
        sensory: "Home decor",
    },
];

// Cart Logic
let cart = [];

function addToCart(pid) {
    const existing = cart.find(item => item.id === pid);
    if (existing) {
        existing.qty++;
    } else {
        cart.push({ id: pid, qty: 1 });
    }
    updateCart();
    emotionalCurator();
    impulseCheck(pid);
}

function updateCart() {
    const cartItems = document.getElementById("cart-items");
    cartItems.innerHTML = '';
    cart.forEach(item => {
        const prod = products.find(p => p.id === item.id);
        cartItems.innerHTML += `
            <div class="cart-item">
                <img src="${prod.image}" alt="${prod.name}" style="width:40px; border-radius:8px;">
                <span>${prod.name}</span>
                <span class="price">₹${prod.price}</span>
                <span>Qty: ${item.qty}</span>
                <span class="ai-negotiator" onclick="negotiate(${prod.id})">🤖 Negotiate</span>
                <button onclick="removeFromCart(${prod.id})">Remove</button>
                <button onclick="sensoryPreview(${prod.id})">Sensory Preview</button>
            </div>
        `;
    });
}

function removeFromCart(pid) {
    cart = cart.filter(item => item.id !== pid);
    updateCart();
    emotionalCurator();
}

// Emotional Cart Curator Feature
function emotionalCurator() {
    const msg = document.getElementById("cart-emotion");
    if (cart.length === 0) {
        msg.innerHTML = '';
        return;
    }
    let text = '';
    // Randomly simulate hesitation detection
    if (cart.length === 1 && cart[0].qty === 1) {
        text = "Not sure? This is trending! 92% satisfaction rate.";
    } else if (cart.length > 2) {
        text = "Eco-friendly and budget options are now highlighted for you!";
    } else {
        text = "Looks like you want the best! Limited stock available.";
    }
    msg.innerHTML = `<em>${text}</em>`;
}

// AI Negotiation Bot
function negotiate(pid) {
    const prod = products.find(p => p.id === pid);
    let discount = Math.floor(Math.random() * 1000) + 150; // ₹150-₹1150
    alert(`🤖 Your AI bot negotiated! You can buy "${prod.name}" for ₹${prod.price - discount} (Save ₹${discount}).`);
}

// Dream-to-Product Converter
function dreamToProduct() {
    const input = document.getElementById("dream-input").value.toLowerCase();
    const results = document.getElementById("dream-results");
    results.innerHTML = '';
    if (input.includes("blue") && input.includes("chair")) {
        results.innerHTML = `
            <div class="product">
                <img src="chair.jpg" alt="Futuristic Blue Chair" />
                <h3>Futuristic Blue Chair (Dream Matched)</h3>
                <span class="price">₹250</span>
                <button onclick="addToCart(1)">Add to Cart</button>
            </div>
        `;
    } else {
        results.innerHTML = "<p>No perfect match found! But try similar styles above in our Shop.</p>";
    }
}

// AI Impulse Check System
function impulseCheck(pid) {
    // Simulate: if buying too many similar items (id==1), popup triggers
    let shoesBought = cart.find(item => item.id === 1 && item.qty > 2);
    if (shoesBought) {
        document.getElementById("impulse-message").innerText =
            "You bought 3 similar chairs this week. Are you sure you want another one?";
        document.getElementById("impulse-popup").style.display = "flex";
    }
}

function closeImpulseCheck() {
    document.getElementById("impulse-popup").style.display = "none";
}
function proceedImpulse() {
    closeImpulseCheck();
}
function cancelImpulse() {
    removeFromCart(1);
    closeImpulseCheck();
}

// Sensory Commerce Preview
function sensoryPreview(pid) {
    const prod = products.find(p => p.id === pid);
    document.getElementById('sensory-message').innerText = prod.sensory;
    document.getElementById('sensory-modal').style.display = 'flex';
}
function closeSensory() {
    document.getElementById('sensory-modal').style.display = 'none';
}

// AI Closet Feature
function analyzeCloset() {
    let files = document.getElementById('closet-upload').files;
    let msg = document.getElementById('closet-results');
    if (files.length == 0) {
        msg.innerHTML = "<p>Please upload wardrobe pics!</p>";
        return;
    }
    msg.innerHTML =
        "<p>Duplicate items detected: None. New arrivals matched to your style! <b>Suggested: Futuristic Blue Chair for your modern lounge.</b></p>";
}

// Predictive Repair / Replacement Commerce
function checkout() {
    let msg = "Thankyou for shopping, Your product replacement or expiry will be updated to the you";
    alert(msg);
}

// Micro-Moment Shopping
function microMomentShopping() {
    let time = new Date().getHours();
    let msg = '';
    if (time >= 21 || time <= 3) msg = "Late night? Try healthy snacks!";
    else if (time >= 6 && time <= 8) msg = "Morning rush? Hot coffee deals!";
    else if (Math.random() > 0.8) msg = "Rain approaching soon – get your umbrella!";
    if (msg !== '') {
        let mm = document.getElementById('micro-moment');
        mm.innerText = msg;
        mm.style.display = 'block';
        setTimeout(()=>{mm.style.display='none';}, 4200);
    }
}
setTimeout(microMomentShopping, 1200);

// Crowd-Powered Trend Generator (simulated, shown above Shop)
document.getElementById('products').insertAdjacentHTML('afterbegin',
    '<div style="padding:9px 0 14px;color:var(--accent);font-size:1.1em;">🌟 From Local Hands to Global Brands – MSMEs Powering Bharat 2047!.</div>'
);
