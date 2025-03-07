import React from 'react';
import PaginationCard from "./PaginationCard";

const Dashboard = ({ page }) => {
  return (
    <div className="ms-5 mt-2">
      {/* Conditional Rendering Based on the Page */}
      {page === "home" && (
        <>
          <h1 className="ms-3 ms-sm-0">Welcome to My Blog</h1>
          <p className="ms-4 ms-sm-0">This is the home admin page of my blog.</p>
        </>
      )}

      {page === "posts" && (
        <>
          <h1 className="ms-3 ms-sm-0">Posts Management</h1>
          <PaginationCard />
        </>
      )}
    </div>
  );
};

export default Dashboard;
