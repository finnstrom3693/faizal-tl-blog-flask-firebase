import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'writer' // Default role
  });
  const [alertMessage, setAlertMessage] = useState(null);
  const [alertType, setAlertType] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      setAlertMessage("Passwords don't match");
      setAlertType("danger");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      // Replace with your actual API endpoint
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          role: formData.role
        }),
      });
      
      const result = await response.json();

      if (response.ok) {
        console.log('Registration successful:', result);
        setAlertMessage('Registration successful! Please log in.');
        setAlertType('success');
        
        // Redirect to login after 2 seconds
        setTimeout(() => navigate('/login'), 2000);
      } else {
        console.error('Registration failed:', result.error);
        setAlertMessage('Registration failed: ' + result.error);
        setAlertType('danger');
      }
    } catch (error) {
      console.error('Error:', error);
      setAlertMessage('An error occurred. Please try again.');
      setAlertType('danger');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container-fluid">
      <div className="row justify-content-center">
        <div className="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-4">
          <div className="card shadow-sm mt-5">
            <div className="card-body p-4">
              {alertMessage && (
                <div className={`alert alert-${alertType} alert-dismissible fade show`} role="alert">
                  {alertMessage}
                  <button 
                    type="button" 
                    className="btn-close" 
                    onClick={() => setAlertMessage(null)} 
                    aria-label="Close"
                  ></button>
                </div>
              )}
              
              <h2 className="card-title text-center mb-4">Create Account</h2>
              
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="username" className="form-label">Username</label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="bi bi-person"></i>
                    </span>
                    <input 
                      type="text" 
                      className="form-control" 
                      id="username"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      placeholder="Choose a username"
                      required 
                    />
                  </div>
                </div>
                
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">Email</label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="bi bi-envelope"></i>
                    </span>
                    <input 
                      type="email" 
                      className="form-control" 
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter your email"
                      required 
                    />
                  </div>
                </div>
                
                <div className="mb-3">
                  <label htmlFor="role" className="form-label">Select Role</label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="bi bi-person-badge"></i>
                    </span>
                    <select
                      className="form-select"
                      id="role"
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      required
                    >
                      <option value="writer">Writer</option>
                      <option value="owner">Owner</option>
                    </select>
                  </div>
                  <div className="form-text text-muted">
                    {formData.role === 'owner' ? 'Owners can manage all content and users' : 'Writers can create and edit content'}
                  </div>
                </div>
                
                <div className="mb-3">
                  <label htmlFor="password" className="form-label">Password</label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="bi bi-lock"></i>
                    </span>
                    <input 
                      type="password" 
                      className="form-control" 
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Create a password"
                      required 
                    />
                  </div>
                  <div className="form-text text-muted">
                    Password must be at least 8 characters
                  </div>
                </div>
                
                <div className="mb-4">
                  <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="bi bi-lock-fill"></i>
                    </span>
                    <input 
                      type="password" 
                      className="form-control" 
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirm your password"
                      required 
                    />
                  </div>
                </div>
                
                <div className="d-grid gap-2">
                  <button 
                    className="btn btn-success py-2" 
                    type="submit"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Creating Account...
                      </>
                    ) : 'Register'}
                  </button>
                </div>
                
                <div className="text-center mt-3">
                  <p className="mb-0">
                    Already have an account? <a href="/login" className="text-decoration-none">Login</a>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}