const translations = {
    en: {
        businessNameShort: "Shri Swast Aushadhi Seva",
        heroTitle: "Quality Generic Medicines",
        heroSubtitle: "Affordable Healthcare for All",
        aboutTitle: "About Shri Swast Aushadhi Seva",
        aboutText: "We are a trusted generic medicine store committed to providing high-quality, affordable healthcare to our community. Our mission is to make essential medicines accessible to everyone.",
        timingLabel: "Mon-Sat: 9AM - 9PM",
        locationLabel: "Pune, Maharashtra",
        medicinesTitle: "Our Medicines",
        medicinesSubtitle: "Check availability & place order via WhatsApp",
        galleryTitle: "Our Gallery",
        gallerySubtitle: "Moments from our store and community work",
        orderModalTitle: "Place Order",
        medicineLabel: "Medicine",
        priceLabel: "Price",
        inStock: "In Stock",
        units: "units available",
        orderNow: "Order Now",
        outOfStock: "Out of Stock",
        footerContact: "Contact: +91 9373389921",
        footerTagline: "Serving health with care and affordability."
    },
    mr: {
        businessNameShort: "श्री स्वस्त औषधी सेवा",
        heroTitle: "गुणवत्तापूर्ण जेनेरिक औषधे",
        heroSubtitle: "सर्वांसाठी परवडणारी आरोग्यसेवा",
        aboutTitle: "श्री स्वस्त औषधी सेवा बद्दल",
        aboutText: "आम्ही एक विश्वासू जेनेरिक औषधांचे दुकान आहोत, जे आपल्या समाजाला दर्जेदार, परवडणारी आरोग्यसेवा पुरवण्यासाठी वचनबद्ध आहे.",
        timingLabel: "सोम-शनि: सकाळी 9 - रात्री 9",
        locationLabel: "पुणे, महाराष्ट्र",
        medicinesTitle: "आमची औषधे",
        medicinesSubtitle: "उपलब्धता तपासा आणि व्हॉट्सअॅपवर ऑर्डर करा",
        galleryTitle: "आमची प्रदर्शन",
        gallerySubtitle: "आमच्या दुकानातील आणि समाजसेवेतील क्षण",
        orderModalTitle: "ऑर्डर करा",
        medicineLabel: "औषध",
        priceLabel: "किंमत",
        inStock: "स्टॉकमध्ये",
        units: "युनिट्स उपलब्ध",
        orderNow: "ऑर्डर करा",
        outOfStock: "स्टॉक संपला",
        footerContact: "संपर्क: +91 9373389921",
        footerTagline: "काळजीने आरोग्य सेवा."
    }
};

let currentLanguage = localStorage.getItem('preferredLanguage') || 'en';
let currentOrderMedicine = null;

function setLanguage(lang) {
    currentLanguage = lang;
    localStorage.setItem('preferredLanguage', lang);
    const t = translations[lang];
    document.getElementById('businessNameShort').innerText = t.businessNameShort;
    document.getElementById('heroTitle').innerText = t.heroTitle;
    document.getElementById('heroSubtitle').innerText = t.heroSubtitle;
    document.getElementById('aboutTitle').innerText = t.aboutTitle;
    document.getElementById('aboutText').innerText = t.aboutText;
    document.getElementById('timingLabel').innerText = t.timingLabel;
    document.getElementById('locationLabel').innerText = t.locationLabel;
    document.getElementById('medicinesTitle').innerText = t.medicinesTitle;
    document.getElementById('medicinesSubtitle').innerText = t.medicinesSubtitle;
    document.getElementById('galleryTitle').innerText = t.galleryTitle;
    document.getElementById('gallerySubtitle').innerText = t.gallerySubtitle;
    document.getElementById('orderModalTitle').innerText = t.orderModalTitle;
    document.getElementById('footerContact').innerHTML = t.footerContact;
    document.getElementById('footerTagline').innerText = t.footerTagline;

    document.querySelectorAll('.order-btn').forEach(btn => btn.innerText = t.orderNow);
    if (document.getElementById('medicinesList')?.children.length) loadMedicines();
}

async function loadMedicines() {
    try {
        const res = await fetch('/api/medicines');
        const data = await res.json();
        const container = document.getElementById('medicinesList');
        if (!container) return;
        container.innerHTML = '';
        const t = translations[currentLanguage];
        data.medicines.forEach(med => {
            const available = med.stock_quantity > 0;
            const card = document.createElement('div');
            card.className = 'medicine-card bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition transform hover:-translate-y-1';
            card.innerHTML = `
                <div class="p-5">
                    <div class="flex justify-between items-start">
                        <h3 class="text-xl font-bold text-green-800 med-name">${med.name}</h3>
                        <span class="px-2 py-1 rounded text-xs font-semibold ${available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}">
                            ${available ? t.inStock : t.outOfStock}
                        </span>
                    </div>
                    <p class="text-gray-600 text-sm mt-2">${med.description || 'No description'}</p>
                    <div class="mt-4 flex justify-between items-center">
                        <span class="text-2xl font-bold text-green-600">₹${med.price}</span>
                        <span class="text-sm text-gray-500">${med.stock_quantity} ${t.units}</span>
                    </div>
                    <button onclick='openOrderModal(${JSON.stringify(med)})' 
                        class="order-btn w-full mt-4 ${available ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-400 cursor-not-allowed'} text-white py-2 rounded-lg transition"
                        ${!available ? 'disabled' : ''}>
                        ${t.orderNow}
                    </button>
                </div>
            `;
            container.appendChild(card);
        });
        filterMedicines();  // reapply search filter
    } catch(e) { console.error(e); }
}

function filterMedicines() {
    const searchInput = document.getElementById('searchMedicine');
    if (!searchInput) return;
    const term = searchInput.value.toLowerCase();
    document.querySelectorAll('.medicine-card').forEach(card => {
        const name = card.querySelector('.med-name')?.innerText.toLowerCase() || '';
        card.style.display = (term === '' || name.includes(term)) ? '' : 'none';
    });
}

async function loadGallery() {
    try {
        const res = await fetch('/api/gallery');
        const data = await res.json();
        const galleryDiv = document.getElementById('galleryImages');
        if (!galleryDiv) return;
        if (data.images.length === 0) {
            galleryDiv.innerHTML = '<div class="col-span-full text-center text-gray-500 py-12">No images in gallery yet.</div>';
            return;
        }
        galleryDiv.innerHTML = data.images.map(img => `
            <div class="bg-white rounded-lg shadow-md overflow-hidden">
                <img src="/${img.filepath}" alt="${img.filename}" class="w-full h-48 object-cover transition hover:scale-105 duration-300">
                <div class="p-2 text-center text-sm text-gray-600">${new Date(img.uploaded_at).toLocaleDateString()}</div>
            </div>
        `).join('');
    } catch(e) { console.error(e); }
}

function openOrderModal(medicine) {
    if (medicine.stock_quantity <= 0) {
        alert(translations[currentLanguage].outOfStock);
        return;
    }
    currentOrderMedicine = medicine;
    const t = translations[currentLanguage];
    document.getElementById('orderMedicineInfo').innerHTML = `
        <p><strong>${t.medicineLabel}:</strong> ${medicine.name}</p>
        <p><strong>${t.priceLabel}:</strong> ₹${medicine.price} | ${t.inStock}: ${medicine.stock_quantity}</p>
    `;
    document.getElementById('orderQuantity').value = 1;
    document.getElementById('customerName').value = '';
    document.getElementById('customerPhone').value = '';
    document.getElementById('deliveryAddress').value = '';
    document.getElementById('orderModal').classList.remove('hidden');
    document.getElementById('orderModal').classList.add('flex');
}

function closeOrderModal() {
    document.getElementById('orderModal').classList.add('hidden');
    document.getElementById('orderModal').classList.remove('flex');
    currentOrderMedicine = null;
}

function sendWhatsAppOrder() {
    if (!currentOrderMedicine) return;
    const quantity = document.getElementById('orderQuantity').value;
    const customerName = document.getElementById('customerName').value;
    const customerPhone = document.getElementById('customerPhone').value;
    const address = document.getElementById('deliveryAddress').value;
    if (!quantity || quantity <= 0) { alert('Enter valid quantity'); return; }
    if (quantity > currentOrderMedicine.stock_quantity) { alert(`Only ${currentOrderMedicine.stock_quantity} available`); return; }
    if (!customerName || !customerPhone || !address) { alert('Please fill all details'); return; }
    const total = currentOrderMedicine.price * quantity;
    const message = `*NEW ORDER FROM WEBSITE*%0A%0A` +
                    `*Medicine:* ${currentOrderMedicine.name}%0A` +
                    `*Quantity:* ${quantity}%0A` +
                    `*Customer:* ${customerName} (${customerPhone})%0A` +
                    `*Address:* ${address}%0A` +
                    `*Total:* ₹${total}%0A%0A` +
                    `Please confirm availability.`;
    window.open(`https://wa.me/919373389921?text=${message}`, '_blank');
    closeOrderModal();
    setTimeout(() => alert('Order sent via WhatsApp! The store will contact you.'), 500);
}

window.setLanguage = setLanguage;
window.openOrderModal = openOrderModal;
window.closeOrderModal = closeOrderModal;
window.sendWhatsAppOrder = sendWhatsAppOrder;
window.filterMedicines = filterMedicines;

document.addEventListener('DOMContentLoaded', () => setLanguage(currentLanguage));