from flask import Flask, request, jsonify
import firebase_admin
from firebase_admin import credentials, firestore
import jwt
import datetime
import functools
import bcrypt
import pytz
from flask_cors import CORS

jakarta_tz = pytz.timezone("Asia/Jakarta")

# Initialize Flask app
app = Flask(__name__)
app.config['SECRET_KEY'] = 'socialnomad77'

CORS(app)

# Firebase setup
cred = credentials.Certificate("firebase_credentials.json")
firebase_admin.initialize_app(cred)
db = firestore.client()

# Collection names
USER_COLLECTION = "users"
BLOG_COLLECTION = "blogs"

def token_required(f):
    @functools.wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get("Authorization")
        if not auth_header:
            return jsonify({"error": "Token is missing"}), 403
        
        parts = auth_header.split()
        if len(parts) != 2 or parts[0].lower() != "bearer":
            return jsonify({"error": "Invalid token format"}), 403
        
        token = parts[1]

        try:
            decoded_token = jwt.decode(token, app.config["SECRET_KEY"], algorithms=["HS256"])
            request.user_id = decoded_token["user_id"]
            request.username = decoded_token["username"]
            request.user_role = decoded_token["role"]
        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Token has expired"}), 403
        except jwt.InvalidTokenError:
            return jsonify({"error": "Invalid token"}), 403
        
        return f(*args, **kwargs)
    return decorated

# Create a backup
@app.route("/backup", methods=["GET"])
@token_required
def backup():
    if request.user_role != "owner":
        return jsonify({"error": "Permission denied"}), 403
    
    users = [doc.to_dict() | {"id": doc.id} for doc in db.collection(USER_COLLECTION).stream()]
    blogs = [doc.to_dict() | {"id": doc.id} for doc in db.collection(BLOG_COLLECTION).stream()]
    
    return jsonify({"users": users, "blogs": blogs}), 200

# Restore from backup
@app.route("/restore", methods=["POST"])
@token_required
def restore_backup():
    # Check if user has owner role
    if request.user_role != "owner":
        return jsonify({"error": "Permission denied. Only owners can restore backups"}), 403
    
    # Get backup data from request
    backup_data = request.json
    
    # Validate backup data structure
    if not isinstance(backup_data, dict) or "users" not in backup_data or "blogs" not in backup_data:
        return jsonify({"error": "Invalid backup format"}), 400
    
    try:
        # Start a batch operation for atomicity
        batch = db.batch()
        
        # Clear existing collections (optional - you may want to confirm this behavior)
        # Delete existing blogs
        blog_docs = db.collection(BLOG_COLLECTION).stream()
        for doc in blog_docs:
            batch.delete(doc.reference)
            
        # Delete existing users
        user_docs = db.collection(USER_COLLECTION).stream()
        for doc in user_docs:
            batch.delete(doc.reference)
        
        # Restore users
        for user in backup_data["users"]:
            user_id = user.pop("id", None)  # Extract and remove id from the dict
            if user_id:
                user_ref = db.collection(USER_COLLECTION).document(user_id)
                batch.set(user_ref, user)
            else:
                # If no ID, create with auto-generated ID
                new_user_ref = db.collection(USER_COLLECTION).document()
                batch.set(new_user_ref, user)
        
        # Restore blogs
        for blog in backup_data["blogs"]:
            blog_id = blog.pop("id", None)  # Extract and remove id from the dict
            
            # Convert timestamp strings back to Firestore timestamps if needed
            if "created_at" in blog and isinstance(blog["created_at"], str):
                # Parse the timestamp string to datetime
                try:
                    # Try to parse ISO format
                    created_at = datetime.datetime.fromisoformat(blog["created_at"].replace('Z', '+00:00'))
                    # Convert to Jakarta timezone if needed
                    blog["created_at"] = created_at.astimezone(jakarta_tz)
                except ValueError:
                    # Keep as string if parsing fails
                    pass
            
            if blog_id:
                blog_ref = db.collection(BLOG_COLLECTION).document(blog_id)
                batch.set(blog_ref, blog)
            else:
                # If no ID, create with auto-generated ID
                new_blog_ref = db.collection(BLOG_COLLECTION).document()
                batch.set(new_blog_ref, blog)
        
        # Commit all the changes
        batch.commit()
        
        return jsonify({"message": "Backup restored successfully"}), 200
    
    except Exception as e:
        return jsonify({"error": f"Failed to restore backup: {str(e)}"}), 500

# Create a new blog post
@app.route("/posts", methods=["POST"])
@token_required
def create_post():
    data = request.json
    if "title" not in data or "content" not in data:
        return jsonify({"error": "Title and content are required"}), 400
    
    post_data = {
        "title": data["title"],
        "content": data["content"],
        "writer": request.user_id, 
        "created_at": datetime.datetime.now(jakarta_tz)
    }

    post_ref = db.collection(BLOG_COLLECTION).add(post_data)
    return jsonify({"id": post_ref[1].id, "message": "Post created"}), 201

# Retrieve all blog posts
@app.route("/posts", methods=["GET"])
def get_posts():
    posts = [doc.to_dict() | {"id": doc.id} for doc in db.collection(BLOG_COLLECTION).stream()]
    return jsonify(posts)

# Retrieve a single blog post by ID
@app.route("/posts/<post_id>", methods=["GET"])
def get_post(post_id):
    doc = db.collection(BLOG_COLLECTION).document(post_id).get()
    if doc.exists:
        return jsonify(doc.to_dict() | {"id": doc.id})
    return jsonify({"error": "Post not found"}), 404

# Update a blog post (Only the writer or owner can update)
@app.route("/posts/<post_id>", methods=["PUT"])
@token_required
def update_post(post_id):
    data = request.json
    doc_ref = db.collection(BLOG_COLLECTION).document(post_id)
    doc = doc_ref.get()

    if not doc.exists:
        return jsonify({"error": "Post not found"}), 404

    post = doc.to_dict()

    # Ensure only the owner or the original writer can update the post
    if request.user_role != "owner" and post["writer"] != request.user_id:
        return jsonify({"error": "Permission denied"}), 403

    # Remove 'writer' from data to prevent modification
    data.pop("writer", None)

    doc_ref.update(data)
    return jsonify({"message": "Post updated"})


# Delete a blog post (Only the writer or owner can delete)
@app.route("/posts/<post_id>", methods=["DELETE"])
@token_required
def delete_post(post_id):
    doc_ref = db.collection(BLOG_COLLECTION).document(post_id)
    doc = doc_ref.get()

    if not doc.exists:
        return jsonify({"error": "Post not found"}), 404

    post = doc.to_dict()
    if request.user_role != "owner" and post["writer"] != request.user_id:
        return jsonify({"error": "Permission denied"}), 403

    doc_ref.delete()
    return jsonify({"message": "Post deleted"})

# Register a new user
@app.route("/register", methods=["POST"])
def register():
    data = request.json
    username = data.get("username")
    email = data.get("email")
    password = data.get("password")
    role = data.get("role", "writer") 

    if role not in ["owner", "writer"]:
        return jsonify({"error": "Invalid role"}), 400

    if not username or not email or not password:
        return jsonify({"error": "Username, email, and password are required"}), 400

    # Check if email already exists
    user_ref = db.collection(USER_COLLECTION).where("email", "==", email).stream()
    if any(user_ref):
        return jsonify({"error": "Email already exists"}), 400
    
    # Hash the password
    hashed_pw = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    db.collection(USER_COLLECTION).add({
        "username": username,
        "email": email,
        "password": hashed_pw,
        "role": role
    })

    return jsonify({"message": "User registered successfully"}), 201

# User login using email
@app.route("/login", methods=["POST"])
def login():
    data = request.json
    email = data.get("email")
    password = data.get("password")
    
    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400
    
    # Retrieve user by email
    user_docs = list(db.collection(USER_COLLECTION).where("email", "==", email).stream())
    if not user_docs:
        return jsonify({"error": "Invalid email or password"}), 401
    
    user_doc = user_docs[0]  # Get the first matching document
    user_data = user_doc.to_dict()

    if not bcrypt.checkpw(password.encode('utf-8'), user_data['password'].encode('utf-8')):
        return jsonify({"error": "Invalid email or password"}), 401
    
    # Generate token
    token = jwt.encode({
        'user_id': user_doc.id, 
        'username': user_data['username'],
        'role': user_data['role'],
        'exp': datetime.datetime.now(jakarta_tz) + datetime.timedelta(hours=1)
    }, app.config['SECRET_KEY'], algorithm='HS256')

    return jsonify({'token': token, 'username': user_data['username']})

# Protected route example
@app.route("/profile", methods=["GET"])
@token_required
def profile():
    return jsonify({
        "message": "User profile retrieved successfully",
        "user_id": request.user_id,
        "username": request.username, 
        "role": request.user_role
    })
    
@app.route("/protected", methods=["GET"])
@token_required
def protected():
    return jsonify({
        "message": "This is a protected route",
        "user_id": request.user_id,
        "username": request.username,
        "role": request.user_role
    })
    
@app.route("/users/<user_id>", methods=["GET"])
@token_required
def get_user(user_id):
      doc = db.collection(USER_COLLECTION).document(user_id).get()
      if doc.exists:
          return jsonify(doc.to_dict())
      return jsonify({"error": "User not found"}), 404
  
if __name__ == "__main__":
    app.run(debug=True)
