import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ReactQuill from "react-quill";

const EditPostAdmin = () => {
  const { id } = useParams(); // Get post ID from URL
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login"); // Redirect to login if no token
      return;
    }

    // Fetch existing post by ID
    fetch(`http://localhost:5000/posts/${id}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch post");
        }
        return response.json();
      })
      .then((data) => {
        setTitle(data.title);
        setContent(data.content);
      })
      .catch((error) => {
        console.error("Error fetching post:", error);
      });
  }, [id, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No authentication token found");
      return;
    }

    const writer = localStorage.getItem("username"); // Fetch writer from localStorage

    const updatedPost = { title, content, writer };

    try {
      const response = await fetch(`http://localhost:5000/posts/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(updatedPost),
      });

      if (!response.ok) {
        throw new Error("Failed to update post");
      }

      navigate("/posts-admin");
    } catch (error) {
      console.error("Error updating post:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Edit Post</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Title</label>
          <input
            type="text"
            className="form-control"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Content</label>
          <ReactQuill
            theme="snow"
            value={content}
            onChange={setContent}
            className="bg-white"
            style={{ height: "300px" }}
          />
        </div>
        <br></br>
        <br></br>
        <div className="d-flex justify-content-center">
          <button type="submit" className="btn btn-primary mb-3" disabled={loading}>
            {loading ? "Updating..." : "Update Post"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditPostAdmin;
