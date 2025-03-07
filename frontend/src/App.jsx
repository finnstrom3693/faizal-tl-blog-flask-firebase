import { Routes, Route, Link, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import BlogList from './pages/BlogList';
import Post from './pages/Post';

import Login from './pages/Login';
import Logout from './pages/Logout';
import Register from './pages/Register';

import HomeAdmin from './pages/HomeAdmin';
import PostsAdmin from './pages/PostsAdmin';
import AddPostAdmin from './pages/AddPostAdmin';
import EditPostAdmin from './pages/EditPostAdmin';


import './style/Navbar.css';

function App() {
  const location = useLocation(); // Get the current route

  // Define admin routes where the navbar SHOULD HAVE the custom brand
  const adminRoutes = ["/dashboard-admin", "/posts-admin", "/add-post-admin"];
  const isAdminRoute = adminRoutes.includes(location.pathname);

  return (
    <div>
      {/* Show navbar for all routes except login and register */}
      {!(location.pathname === "/login" || location.pathname === "/register") && (
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark p-3">
          <div className="container">
            {/* Show custom navbar brand ONLY on admin routes */}
            {isAdminRoute ? (
              <Link className="navbar-brand custom-navbar-brand" to="/dashboard-admin">
                Faizal Translation Blog
              </Link>
            ) : (
              <Link className="navbar-brand" to="/">
                Faizal Translation Blog
              </Link>
            )}
          </div>
        </nav>
      )}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/posts" element={<BlogList/>} />
        <Route path="/post/:id" element={<Post/>} />

        <Route path="/login" element={<Login />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/register" element={<Register />} />

        <Route path="/dashboard-admin" element={<HomeAdmin />} />
        <Route path="/posts-admin" element={<PostsAdmin />} />
        <Route path="/add-post-admin" element={<AddPostAdmin />} />
        <Route path="/edit-post-admin/:id" element={<EditPostAdmin />} />
      </Routes>
    </div>
  );
}

export default App;
