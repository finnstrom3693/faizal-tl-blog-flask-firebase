import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const PaginationCard = () => {
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const itemsPerPage = 6;
  const [users, setUsers] = useState({}); // Store user data by ID

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("No authentication token found");
          return;
        }
  
        // Fetch posts
        const postsResponse = await fetch("http://localhost:5000/posts");
  
        if (!postsResponse.ok) {
          throw new Error(`Error fetching posts: ${postsResponse.status}`);
        }
  
        let postsJson = await postsResponse.json();
  
        // Sort posts by created_at in descending order
        postsJson.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  
        setData(postsJson);
  
        // Fetch user data
        const userIds = [...new Set(postsJson.map((blog) => blog.writer))]; // Get unique writer IDs
        const usersData = {};
  
        for (const userId of userIds) {
          try {
            const userResponse = await fetch(`http://localhost:5000/users/${userId}`, {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            });
  
            if (userResponse.ok) {
              const userJson = await userResponse.json();
              usersData[userId] = userJson.username; // Store username by user ID
            } else {
              console.error(`Error fetching user ${userId}: ${userResponse.status}`);
              usersData[userId] = "Unknown User";
            }
          } catch (userError) {
            console.error(`Error fetching user ${userId}:`, userError);
            usersData[userId] = "Unknown User";
          }
        }
        setUsers(usersData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
  
    fetchData();
  }, []);
  

  const filteredData = data.filter((blog) =>
    blog.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleDelete = async (postId) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;

    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No authentication token found");
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/posts/${postId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete post");
      }

      // Remove the deleted post from state
      setData((prevData) => prevData.filter((blog) => blog.id !== postId));
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  return (
    <div className="container mt-4">
      {/* Header Section */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-3">
        <Link to="/add-post-admin" className="mx-5">
          <button className="btn btn-primary mb-2 mb-md-0">Add New</button>
        </Link>
        <input
          type="text"
          placeholder="Search by title..."
          className="form-control w-50 w-md-50"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <hr />
      {/* Cards Grid */}
      <div className="row">
        {currentData.map((blog) => (
          <div key={blog.id} className="col-md-6 col-lg-4 mb-4">
            <div className="card shadow-sm">
              <div className="card-body">
                <h5 className="card-title">{blog.title}</h5>
                <p
                  className="card-text"
                  dangerouslySetInnerHTML={{
                    __html:
                      blog.content.split(" ").slice(0, 64).join(" ") +
                      (blog.content.split(" ").length > 64 ? "..." : ""),
                  }}
                />
                <p className="text-muted small">Written by: {users[blog.writer] || "Unknown User"}</p>

                {/* Buttons */}
                <div className="d-flex justify-content-center gap-2">
                  <Link to={`/post/${blog.id}`} className="btn btn-info btn-sm">
                    View
                  </Link>
                  <Link to={`/edit-post-admin/${blog.id}`} className="btn btn-warning btn-sm">
                    Edit
                  </Link>
                  <button onClick={() => handleDelete(blog.id)} className="btn btn-danger btn-sm">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="d-flex justify-content-center mt-4">
        <button
          className={`btn btn-secondary mx-1 ${currentPage === 1 ? "disabled" : ""}`}
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Prev
        </button>

        {[...Array(totalPages).keys()].map((num) => (
          <button
            key={num + 1}
            className={`btn mx-1 ${num + 1 === currentPage ? "btn-primary" : "btn-outline-primary"}`}
            onClick={() => handlePageChange(num + 1)}
          >
            {num + 1}
          </button>
        ))}

        <button
          className={`btn btn-secondary mx-1 ${currentPage === totalPages ? "disabled" : ""}`}
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default PaginationCard;
