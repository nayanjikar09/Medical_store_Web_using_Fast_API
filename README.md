# 🏥 Shri Swast Aushadhi Seva – Generic Medicine Store Website

A full‑stack web application for a generic medical store with bilingual support (English / Marathi), dynamic medicine catalog, gallery management, real‑time stock availability, and WhatsApp‑based order placement.

## ✨ Features

- 🌐 **Bilingual Interface** – Switch between English and मराठी; language preference is saved.
- 💊 **Medicine Catalog** – List all medicines with name, description, price, and stock quantity.
- 🔍 **Search Medicines** – Instant client‑side filtering by medicine name.
- 🖼️ **Image Gallery** – Admin uploads photos; they auto‑appear in a rotating carousel and gallery grid.
- 📦 **Stock Awareness** – “In Stock” / “Out of Stock” badges, order button disabled when stock is zero.
- 📱 **WhatsApp Order** – Customers fill a form (name, phone, address, quantity) and an order summary is sent directly to the store via WhatsApp (`+91 9373389921`).
- 🛠️ **Admin Panel** – Secure login, manage medicines (add, edit, delete, update stock/price), upload and delete gallery images.
- 🎨 **Medical Green Theme** – Professional UI with Tailwind CSS.
- 💾 **Persistence** – Selected language and active tab are stored in `localStorage`.

## 🧰 Tech Stack

| Layer       | Technology                         |
|-------------|------------------------------------|
| Backend     | FastAPI (Python)                   |
| Frontend    | HTML5, Tailwind CSS, Vanilla JS    |
| Database    | SQLite (auto‑created)              |
| File Upload | `python-multipart`                 |
| Templating  | Jinja2                             |

## 📁 Project Structure
medical-store/
├── main.py # FastAPI application
├── requirements.txt # Python dependencies
├── database.db # SQLite database (auto‑generated)
├── static/
│ ├── style.css # Custom styles & carousel transitions
│ └── script.js # Frontend logic, language, search, order modal
├── templates/
│ ├── index.html # Customer facing page (navbar, carousel, sections)
│ └── admin.html # Admin panel (login, medicine & gallery management)
└── uploads/gallery/ # Uploaded gallery images (auto‑created)
