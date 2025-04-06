import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import DOMPurify from "dompurify";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
const API_URL = `${API_BASE_URL}/posts`;
const POSTS_PER_PAGE = 5;

const BlogList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [blogs, setBlogs] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [visible, setVisible] = useState([]);
  const [page, setPage] = useState(1);
  const observer = useRef(null);

  useEffect(() => { fetchBlogs(); }, []);
  useEffect(() => { setFiltered(blogs); setVisible(blogs.slice(0, POSTS_PER_PAGE)); }, [blogs]);

  const fetchBlogs = async () => {
    try {
      const res = await axios.get(API_URL);
      setBlogs(res.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
    } catch (error) { console.error("Fetch error:", error); }
  };

  const handleSearch = async (e) => {
    const val = e.target.value.toLowerCase();
    setSearchTerm(val);
    setPage(1); // reset pagination
  
    if (val === "") {
      // Empty search, fetch all blogs again
      fetchBlogs();
      return;
    }
  
    try {
      const res = await axios.get(`${API_URL}/search?q=${encodeURIComponent(val)}`);
      const sorted = res.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setFiltered(sorted);
      setVisible(sorted.slice(0, POSTS_PER_PAGE));
    } catch (error) {
      console.error("Search fetch error:", error);
    }
  };

  const loadMore = () => {
    const next = page + 1;
    setVisible(filtered.slice(0, next * POSTS_PER_PAGE));
    setPage(next);
  };

  const lastRef = useCallback(node => {
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && visible.length < filtered.length) loadMore();
    });
    if (node) observer.current.observe(node);
  }, [filtered, visible]);

  // Truncate function to limit content to 64 words
  const truncate = (text) => {
    const words = text.split(" ");
    if (words.length > 64) {
      return DOMPurify.sanitize(words.slice(0, 64).join(" ") + "...");
    }
    return DOMPurify.sanitize(text);
  };
  
  return (
    <div className="container mt-4">
      <input type="text" className="form-control mb-3" placeholder="Search" value={searchTerm} onChange={handleSearch} />
      <div className="row">
        {visible.length > 0 ? visible.map((b, i) => (
          <div key={b.id} className="col-md-12 mb-3" ref={i === visible.length - 1 ? lastRef : null}>
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">{b.title}</h5>
                <p className="card-text" dangerouslySetInnerHTML={{ __html: truncate(b.content) }}></p>
                <a href={`/post/${b.id}`} className="btn btn-primary mt-auto">Read More</a>
              </div>
            </div>
          </div>
        )) : <div className="col-md-12 text-center">No blogs.</div>}
      </div>
    </div>
  );
};

export default BlogList;