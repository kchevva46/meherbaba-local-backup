import os
import json
import time
from flask import Flask, request, jsonify
from flask_cors import CORS
from openai import OpenAI
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)

# ── CORS — allow meherbaba.ai and localhost ───────────────────────
# ── for testing
CORS(app, origins=[
    "https://meherbaba.ai",
    "https://www.meherbaba.ai",
    "https://meherbaba-ai-app.netlify.app",
    "http://localhost:3000",
    "http://localhost:8080",
])

# ── OpenAI — ONLY from environment variable, no hardcoded key ────────────────
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")
if not OPENAI_API_KEY:
    raise ValueError("OPENAI_API_KEY environment variable is not set!")
client = OpenAI(api_key=OPENAI_API_KEY)

# ── File paths — Railway uses /data volume for persistent storage ─────────────
# On Railway: set STORAGE_DIR=/data in environment variables
# Locally:    defaults to the same folder as app.py
STORAGE_DIR = os.environ.get("STORAGE_DIR", os.path.dirname(os.path.abspath(__file__)))
USERS_FILE  = os.path.join(STORAGE_DIR, 'users_db.json')
HISTORY_DIR = os.path.join(STORAGE_DIR, 'chat_history')
os.makedirs(HISTORY_DIR, exist_ok=True)

print(f"Storage directory: {STORAGE_DIR}")
print(f"Users file: {USERS_FILE}")

# ── User DB helpers ───────────────────────────────────────────────────────────
def load_users():
    if os.path.exists(USERS_FILE):
        try:
            with open(USERS_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            print(f"Error loading users: {e}")
            return {}
    # Seed default admin account on first run
    default = {
        "meher_admin@meherbaba.ai": {
            "username":     "meher_admin",
            "email":        "meher_admin@meherbaba.ai",
            "first_name":   "Meher",
            "last_name":    "Admin",
            "phone":        "",
            "country_code": "+1",
            "password":     generate_password_hash("baba123"),
            "active":       True,
            "created_at":   int(time.time())
        }
    }
    save_users(default)
    return default

def save_users(users):
    try:
        with open(USERS_FILE, 'w', encoding='utf-8') as f:
            json.dump(users, f, ensure_ascii=False, indent=2)
    except Exception as e:
        print(f"Error saving users: {e}")

# ── Chat history helpers ──────────────────────────────────────────────────────
def get_history_path(email):
    safe = email.replace('@', '_at_').replace('.', '_')
    return os.path.join(HISTORY_DIR, f"{safe}.json")

def load_history(email):
    path = get_history_path(email)
    if os.path.exists(path):
        try:
            with open(path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except:
            return []
    return []

def save_history(email, history):
    try:
        path = get_history_path(email)
        with open(path, 'w', encoding='utf-8') as f:
            json.dump(history, f, ensure_ascii=False, indent=2)
    except Exception as e:
        print(f"Error saving history: {e}")

# ── Health check — Railway uses this to verify app is running ─────────────────
@app.route('/', methods=['GET'])
def health():
    return jsonify({"status": "ok", "app": "MeherBaba.AI"}), 200

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "ok"}), 200

# ─────────────────────────────────────────────────────────────────────────────
# AUTH ROUTES
# ─────────────────────────────────────────────────────────────────────────────

@app.route('/register', methods=['POST'])
def register():
    data         = request.json
    email        = data.get("email", "").strip().lower()
    password     = data.get("password", "")
    confirm      = data.get("confirm_password", "")
    first_name   = data.get("first_name", "").strip()
    last_name    = data.get("last_name", "").strip()
    phone        = data.get("phone", "").strip()
    country_code = data.get("country_code", "+1")

    if not email or not password or not first_name or not last_name:
        return jsonify({"success": False, "message": "All fields are required."}), 400
    if password != confirm:
        return jsonify({"success": False, "message": "Passwords do not match."}), 400
    if len(password) < 6:
        return jsonify({"success": False, "message": "Password must be at least 6 characters."}), 400

    users = load_users()
    if email in users:
        return jsonify({"success": False, "message": "An account with this email already exists."}), 400

    users[email] = {
        "username":     email.split('@')[0],
        "email":        email,
        "first_name":   first_name,
        "last_name":    last_name,
        "phone":        phone,
        "country_code": country_code,
        "password":     generate_password_hash(password),
        "active":       True,
        "created_at":   int(time.time())
    }
    save_users(users)
    return jsonify({
        "success":    True,
        "message":    "Account created successfully.",
        "email":      email,
        "first_name": first_name,
        "last_name":  last_name,
    }), 201


@app.route('/login', methods=['POST'])
def login():
    data     = request.json
    email    = data.get("email", "").strip().lower()
    password = data.get("password", "")

    users = load_users()
    user  = users.get(email)

    if not user:
        return jsonify({"success": False, "message": "No account found with this email."}), 401
    if not user.get("active", True):
        return jsonify({"success": False, "message": "This account has been deactivated."}), 403
    if not check_password_hash(user["password"], password):
        return jsonify({"success": False, "message": "Incorrect password."}), 401

    return jsonify({
        "success":      True,
        "message":      "Login successful",
        "email":        email,
        "first_name":   user.get("first_name", ""),
        "last_name":    user.get("last_name", ""),
        "phone":        user.get("phone", ""),
        "country_code": user.get("country_code", "+1"),
    }), 200


@app.route('/change-password', methods=['POST'])
def change_password():
    data         = request.json
    email        = data.get("email", "").strip().lower()
    old_password = data.get("old_password", "")
    new_password = data.get("new_password", "")
    confirm      = data.get("confirm_password", "")

    if new_password != confirm:
        return jsonify({"success": False, "message": "New passwords do not match."}), 400
    if len(new_password) < 6:
        return jsonify({"success": False, "message": "Password must be at least 6 characters."}), 400

    users = load_users()
    user  = users.get(email)
    if not user:
        return jsonify({"success": False, "message": "Account not found."}), 404
    if not check_password_hash(user["password"], old_password):
        return jsonify({"success": False, "message": "Current password is incorrect."}), 401

    users[email]["password"] = generate_password_hash(new_password)
    save_users(users)
    return jsonify({"success": True, "message": "Password changed successfully."}), 200


@app.route('/deactivate', methods=['POST'])
def deactivate():
    data     = request.json
    email    = data.get("email", "").strip().lower()
    password = data.get("password", "")

    users = load_users()
    user  = users.get(email)
    if not user:
        return jsonify({"success": False, "message": "Account not found."}), 404
    if not check_password_hash(user["password"], password):
        return jsonify({"success": False, "message": "Incorrect password."}), 401

    users[email]["active"] = False
    save_users(users)
    return jsonify({"success": True, "message": "Account deactivated."}), 200


@app.route('/profile', methods=['GET'])
def get_profile():
    email = request.args.get("email", "").strip().lower()
    users = load_users()
    user  = users.get(email)
    if not user:
        return jsonify({"success": False, "message": "Account not found."}), 404
    return jsonify({
        "success":      True,
        "first_name":   user.get("first_name", ""),
        "last_name":    user.get("last_name", ""),
        "email":        email,
        "phone":        user.get("phone", ""),
        "country_code": user.get("country_code", "+1"),
        "created_at":   user.get("created_at", 0),
    }), 200

# ─────────────────────────────────────────────────────────────────────────────
# HISTORY ROUTES
# ─────────────────────────────────────────────────────────────────────────────

@app.route('/history', methods=['GET'])
def get_history():
    email = request.args.get("email", "").strip().lower()
    if not email:
        return jsonify({"history": []}), 200
    return jsonify({"history": load_history(email)}), 200

@app.route('/history/clear', methods=['POST'])
def clear_history():
    email = request.json.get("email", "").strip().lower()
    save_history(email, [])
    return jsonify({"success": True}), 200

# ─────────────────────────────────────────────────────────────────────────────
# ASK ROUTE
# ─────────────────────────────────────────────────────────────────────────────

@app.route('/ask', methods=['POST'])
def ask_gpt():
    try:
        data          = request.json
        user_question = data.get("question", "Hello!")
        email         = data.get("email", "").strip().lower()
        print(f"/ask — email: '{email}', question: '{user_question[:40]}'")

        instructions = """
        You are Beloved Archives bot, a strict document-grounded archival assistant.
        You are NOT a conversational assistant.
        You are NOT a teacher, interpreter, philosopher, or explainer.
        You are a textual archivist whose primary obligation is fidelity to the books.
        Your default behavior is to retrieve and quote verbatim text from the uploaded and indexed books.
        You may only depart from direct quotation under explicitly defined conditions below.
        You must never rely on recognition, familiarity, training data, or assumed knowledge unless explicitly permitted.
        MANDATORY TWO-STEP PROCESS (HARD GATE)
        You MUST follow this process for EVERY user question, without exception.
        STEP 1 — BOOK SEARCH (ALWAYS REQUIRED)
        Search the uploaded and indexed books for text relevant to the question.
        Ask yourself: "Do I have at least ONE sentence or passage that I can copy
        character-for-character from the books that directly relates to this question?"
        If YES → Proceed to STEP 2A — QUOTED RESPONSE
        If NO  → Proceed to STEP 1B — QUESTION CLASSIFICATION
        STEP 1B — QUESTION CLASSIFICATION
        A. Factual / Doctrinal / Textual / Historical
        If no explicit text exists: STOP. Output ONLY:
        "I can't find explicit supporting text for this question in the provided books."
        B. Personal / Abstract / Reflective → Proceed to STEP 2B.
        STEP 2A — QUOTED RESPONSE
        Answer (from the books): 2-4 bullet points stating ONLY what the books explicitly say.
        Exact excerpts: Quote 1 (verbatim), Quote 2 (verbatim, only if necessary).
        RULES: Quotes must be copied character-for-character. Do NOT paraphrase.
        STEP 2B — PERSONAL / ABSTRACT RESPONSE
        Check for contextual parallels. If found, quote verbatim and explain similarity.
        If no context exists, disclose response is not from books.
        ABSOLUTE RULES: No fabrication. No implied authority. No interpretive language.
        Forbidden: "this implies", "this suggests", "in essence", "the teaching means"."""

        tools = [{"type": "file_search", "vector_store_ids": ['vs_694d9825e0a48191a210172fc49320da']}]

        response = client.responses.create(
            model="gpt-4-turbo",
            input=[
                {"role": "developer", "content": instructions},
                {"role": "user",      "content": user_question}
            ],
            tools=tools
        )

        answer_text = response.output_text

        # Extract citations
        citations = []
        seen = set()
        try:
            for item in response.output:
                for block in getattr(item, 'content', []):
                    for ann in getattr(block, 'annotations', []):
                        if getattr(ann, 'type', '') == 'file_citation':
                            file_id  = getattr(ann, 'file_id', '')
                            filename = getattr(ann, 'filename', '')
                            quote    = getattr(ann, 'quote', '')
                            if not filename and file_id:
                                try:
                                    filename = getattr(client.files.retrieve(file_id), 'filename', file_id)
                                except:
                                    filename = file_id
                            display_name = filename.replace('_', ' ').replace('.pdf', '')
                            if display_name and display_name not in seen:
                                seen.add(display_name)
                                citations.append({
                                    "filename": display_name,
                                    "quote": quote[:120] if quote else ""
                                })
        except Exception as ce:
            print(f"Citation warning: {ce}")

        # Save to history
        if email:
            history = load_history(email)
            ts = int(time.time() * 1000)
            history.append({"id": ts,     "text": user_question, "citations": [],        "from": "user"})
            history.append({"id": ts + 1, "text": answer_text,   "citations": citations, "from": "bot"})
            if len(history) > 12:
                history = history[-12:]
            save_history(email, history)

        return jsonify({"answer": answer_text, "citations": citations})

    except Exception as e:
        print(f"Error in /ask: {e}")
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    port = int(os.environ.get("PORT", 8080))
    app.run(host='0.0.0.0', port=port)
