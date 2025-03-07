import React from "react";
import { Link } from "react-router-dom"; // Import Link from react-router-dom

class HomeHeader extends React.Component {
  render() {
    return (
      <header className="bg-primary bg-gradient text-white py-5">
        <div className="container text-center">
          <div className="py-4">
            <h1 className="display-4 fw-bold mb-3">Welcome to Faizal TL Blog</h1>
            <p className="lead fs-4 mb-4">Hosting Original Story and Translating Web Novel</p>
            <div className="d-flex justify-content-center gap-3 mt-4">
              {/* Use Link component for routing */}
              <Link to="/posts" className="btn btn-outline-light btn-lg px-4">
                Go to Blog list
              </Link>
            </div>
          </div>
        </div>
      </header>
    );
  }
}

export default HomeHeader;