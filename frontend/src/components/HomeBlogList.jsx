import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from 'react-router-dom';


const HomeBlogList = () => {
    const [blogs, setBlogs] = useState([]);
    const [showAll, setShowAll] = useState(false);
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

    useEffect(() => {
        fetchBlogs();
    }, []);

    const fetchBlogs = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/posts`);
            // Sort blogs by created_at in descending order (latest first)
            const sortedBlogs = response.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            setBlogs(sortedBlogs);
        } catch (error) {
            console.error("Error fetching blogs:", error);
        }
    };

    const displayedBlogs = showAll ? blogs : blogs.slice(0, 6);

    const truncateWords = (text, limit) => {
        const words = text.split(" ");
        if (words.length > limit) {
            return words.slice(0, limit).join(" ") + "...";
        }
        return text;
    };

    return (
        <section id="blog-list" className="py-5">
            <div className="container">
                <h2 className="text-center mb-4">Latest Blogs</h2>
                <div className="row">
                    {displayedBlogs.map((blog) => (
                        <div key={blog.id} className="col-md-4 mb-4">
                            <div className="card blog-card h-100">
                                <div className="card-body d-flex flex-column">
                                    <h5 className="card-title">{blog.title}</h5>
                                    <p className="card-text flex-grow-1" dangerouslySetInnerHTML={{ __html: truncateWords(blog.content, 64) }}></p>
                                    <a href={`/post/${blog.id}`} className="btn btn-primary mt-auto">Read More</a>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Show Read More button only if there are more than 6 blogs */}
                {blogs.length > 6 && (
                    <div className="text-center mt-4">
                        {showAll ? (
                            <button className="btn btn-secondary" onClick={() => setShowAll(false)}>
                                Show Less
                            </button>
                        ) : (
                            <Link to="/posts" className="btn btn-secondary">
                                Read More
                            </Link>
                        )}
                    </div>
                )}
            </div>
        </section>
    );
};

export default HomeBlogList;