from fastapi import FastAPI, HTTPException, UploadFile, File, Form, Request
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
import sqlite3
import os
import shutil
import uuid

app = FastAPI(title="Shri Swast Aushadhi Seva Medical Store")

# Create directories
os.makedirs("static", exist_ok=True)
os.makedirs("templates", exist_ok=True)
os.makedirs("uploads/gallery", exist_ok=True)

app.mount("/static", StaticFiles(directory="static"), name="static")
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")
templates = Jinja2Templates(directory="templates")

# Database setup
def init_db():
    conn = sqlite3.connect("database.db")
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS medicines (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        stock_quantity INTEGER DEFAULT 0,
        price REAL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )''')
    c.execute('''CREATE TABLE IF NOT EXISTS gallery (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        filename TEXT NOT NULL,
        filepath TEXT NOT NULL,
        uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )''')
    c.execute("SELECT COUNT(*) FROM medicines")
    if c.fetchone()[0] == 0:
        sample_meds = [
            ("Paracetamol 500mg", "Fever and pain relief", 100, 25.0),
            ("Cetirizine 10mg", "Antihistamine for allergies", 50, 35.0),
            ("Amoxicillin 250mg", "Antibiotic", 75, 120.0),
            ("Vitamin C Tablets", "Immunity booster", 200, 45.0),
            ("Dolo 650mg", "Fever & body pain", 150, 30.0),
        ]
        c.executemany("INSERT INTO medicines (name, description, stock_quantity, price) VALUES (?,?,?,?)", sample_meds)
    conn.commit()
    conn.close()

init_db()
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "admin123")

def verify_token(token: str):
    return token == ADMIN_PASSWORD

@app.get("/")
async def home(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.get("/admin")
async def admin_panel(request: Request):
    return templates.TemplateResponse("admin.html", {"request": request})

# Medicines API
@app.get("/api/medicines")
async def get_medicines():
    conn = sqlite3.connect("database.db")
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    c.execute("SELECT id, name, description, stock_quantity, price FROM medicines ORDER BY name")
    medicines = [dict(row) for row in c.fetchall()]
    conn.close()
    return {"medicines": medicines}

@app.post("/api/medicines")
async def add_medicine(name: str = Form(...), description: str = Form(""),
                       stock_quantity: int = Form(0), price: float = Form(0),
                       token: str = Form(...)):
    if not verify_token(token):
        raise HTTPException(401, "Invalid token")
    conn = sqlite3.connect("database.db")
    c = conn.cursor()
    c.execute("INSERT INTO medicines (name, description, stock_quantity, price) VALUES (?,?,?,?)",
              (name, description, stock_quantity, price))
    conn.commit()
    conn.close()
    return {"success": True}

@app.put("/api/medicines/{med_id}")
async def update_medicine(med_id: int, name: str = Form(...), description: str = Form(""),
                          stock_quantity: int = Form(0), price: float = Form(0),
                          token: str = Form(...)):
    if not verify_token(token):
        raise HTTPException(401, "Invalid token")
    conn = sqlite3.connect("database.db")
    c = conn.cursor()
    c.execute("UPDATE medicines SET name=?, description=?, stock_quantity=?, price=? WHERE id=?",
              (name, description, stock_quantity, price, med_id))
    conn.commit()
    conn.close()
    return {"success": True}

@app.delete("/api/medicines/{med_id}")
async def delete_medicine(med_id: int, token: str):
    if not verify_token(token):
        raise HTTPException(401, "Invalid token")
    conn = sqlite3.connect("database.db")
    c = conn.cursor()
    c.execute("DELETE FROM medicines WHERE id=?", (med_id,))
    conn.commit()
    conn.close()
    return {"success": True}

# Gallery API
@app.get("/api/gallery")
async def get_gallery():
    conn = sqlite3.connect("database.db")
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    c.execute("SELECT id, filename, filepath, uploaded_at FROM gallery ORDER BY uploaded_at DESC")
    images = [dict(row) for row in c.fetchall()]
    conn.close()
    return {"images": images}

@app.post("/api/gallery/upload")
async def upload_gallery_image(file: UploadFile = File(...), token: str = Form(...)):
    if not verify_token(token):
        raise HTTPException(401, "Invalid token")
    if not file.content_type.startswith("image/"):
        raise HTTPException(400, "Only images allowed")
    ext = file.filename.split(".")[-1]
    unique = f"{uuid.uuid4().hex}.{ext}"
    path = f"uploads/gallery/{unique}"
    with open(path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    conn = sqlite3.connect("database.db")
    c = conn.cursor()
    c.execute("INSERT INTO gallery (filename, filepath) VALUES (?,?)", (file.filename, path))
    conn.commit()
    conn.close()
    return {"success": True, "filepath": path}

@app.delete("/api/gallery/{img_id}")
async def delete_gallery_image(img_id: int, token: str):
    if not verify_token(token):
        raise HTTPException(401, "Invalid token")
    conn = sqlite3.connect("database.db")
    c = conn.cursor()
    c.execute("SELECT filepath FROM gallery WHERE id=?", (img_id,))
    row = c.fetchone()
    if row:
        if os.path.exists(row[0]):
            os.remove(row[0])
        c.execute("DELETE FROM gallery WHERE id=?", (img_id,))
        conn.commit()
    conn.close()
    return {"success": True}

@app.post("/api/admin/login")
async def admin_login(password: str = Form(...)):
    if password == ADMIN_PASSWORD:
        return {"success": True, "token": ADMIN_PASSWORD}
    raise HTTPException(401, "Invalid password")