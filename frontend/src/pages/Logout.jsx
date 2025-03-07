import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Logout() {
  const navigate = useNavigate();

  useEffect(() => {
    // Remove token from localStorage
    localStorage.removeItem('token');

    // Redirect to login page
    navigate('/login');
  }, [navigate]);

  return (
    <div className="col-md-4 mx-auto mt-5 text-center">
      <h2>Logging out...</h2>
    </div>
  );
}
