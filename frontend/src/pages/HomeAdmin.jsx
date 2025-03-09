import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // For redirection
import Sidebar from "../components/Sidebar";
import Dashboard from "../components/Dashboard";
import MobileSidebar from "../components/MobileSidebar";

function HomeAdmin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login"); // Redirect to login if no token
      return;
    }

    fetch(`${API_BASE_URL}/protected`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
    })
      .then((response) => {
        if (response.ok) {
          setIsAuthenticated(true);
        } else {
          throw new Error("Unauthorized");
        }
      })
      .catch(() => {
        localStorage.removeItem("token"); // Clear invalid token
        navigate("/login"); // Redirect to login if auth fails
      });
  }, [navigate]);

  if (!isAuthenticated) {
    return <p>Loading...</p>; // Show a loading message while checking auth
  }

  return (
    <div className="row">
      {/* Sidebar (Hidden on mobile, Offcanvas applied) */}
      <div className="col-md-2 d-none d-md-block">
        <Sidebar />
      </div>

      {/* Offcanvas Sidebar for Mobile */}
      <div className="d-md-none">
        <button
          className="btn btn-primary m-3"
          type="button"
          data-bs-toggle="offcanvas"
          data-bs-target="#mobileSidebar"
        >
          ☰ Open Sidebar
        </button>
      </div>

      {/* Main Content */}
      <div className="col-md-10 col-12">
        <Dashboard page="home" />
      </div>

      <MobileSidebar />
    </div>
  );
}

export default HomeAdmin;
