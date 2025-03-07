import React from "react";
import { Link } from "react-router-dom";

const Sidebar = () => {
  const username = localStorage.getItem("username");

  return (
    <div
      className="d-flex flex-column flex-shrink-0 p-3 text-white bg-secondary"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        bottom: 0,
        width: "250px", // Adjust width as needed
        height: "100vh",
        overflowY: "auto", // Enables scrolling for long content
      }}
    >
      <Link to="#" className="d-flex align-items-center mb-3 mb-md-0 me-md-auto text-white text-decoration-none">
        <span className="fs-4">Dashboard</span>
      </Link>
      <hr />
      {username && (
        <div className="mb-3 text-center">
          <h5>Welcome, {username}!</h5>
        </div>
      )}
      <ul className="nav nav-pills flex-column mb-auto">
        <li className="nav-item">
          <Link to="/dashboard-admin" className="nav-link text-white">
            Home
          </Link>
        </li>
        <li>
          <Link to="/posts-admin" className="nav-link text-white">
            Posts
          </Link>
        </li>
        <li>
          <Link to="/logout" className="nav-link text-white">
            Logout
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
