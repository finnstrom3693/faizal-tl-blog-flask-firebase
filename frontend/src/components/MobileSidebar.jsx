import React from "react";
import { Link } from "react-router-dom";

const MobileSidebar = () => {
  const username = localStorage.getItem('username'); 
  return (
    <div 
      className="offcanvas offcanvas-start bg-dark text-white"
      tabIndex="-1"
      id="mobileSidebar"
      aria-labelledby="offcanvasLabel"
    >
      <div className="offcanvas-header">
        <h5 className="offcanvas-title" id="offcanvasLabel">Dashboard</h5>
        <button type="button" className="btn-close text-reset" data-bs-dismiss="offcanvas"></button>
      </div>
      {username && (
        <div className="mb-3 mt-3 text-center">
          <h5>Welcome, {username}!</h5> {/* Display username */}
        </div>
      )}
      <div className="offcanvas-body">
        <hr />
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
    </div>
  );
};

export default MobileSidebar;
