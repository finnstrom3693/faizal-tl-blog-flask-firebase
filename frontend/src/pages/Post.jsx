import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const Post = () => {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/posts/${id}`)
      .then((response) => {
        setBlog(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching post:", error);
        setLoading(false);
      });
  }, [id]);

  return (
    <div className="container mt-4">
      {loading ? (
        <div className="text-center">
          <div className="spinner-border text-primary"></div>
        </div>
      ) : blog ? (
        <div className="card shadow-sm mb-3">
          <div className="card-body">
            <h2 className="card-title">{blog.title}</h2>
            {/* ✅ Render HTML safely */}
            <div className="card-text" dangerouslySetInnerHTML={{ __html: blog.content }}></div>
          </div>
        </div>
      ) : (
        <h3 className="text-center text-danger">Blog Not Found</h3>
      )}
    </div>
  );
};

export default Post;
