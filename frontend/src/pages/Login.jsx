import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [alertMessage, setAlertMessage] = useState(null);
  const [alertType, setAlertType] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await fetch('http://localhost:5000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const result = await response.json();

      if (response.ok) {
        localStorage.setItem('token', result.token);
        localStorage.setItem('username', result.username);
        console.log('Login successful:', result);

        setAlertMessage('Login successful! Redirecting...');
        setAlertType('success');

        setTimeout(() => navigate('/dashboard-admin'), 2000);
      } else {
        console.error('Login failed:', result.error);
        setAlertMessage('Login failed: ' + result.error);
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
              
              <h2 className="card-title text-center mb-4">Login</h2>
              
              <form onSubmit={handleSubmit}>
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
                
                <div className="mb-4">
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
                      placeholder="Enter your password"
                      required 
                    />
                  </div>
                </div>
                
                <div className="d-grid gap-2">
                  <button 
                    className="btn btn-primary py-2" 
                    type="submit"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Logging in...
                      </>
                    ) : 'Login'}
                  </button>
                </div>
                
                <div className="text-center mt-3">
                  <a href="#" className="text-decoration-none">Forgot password?</a>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}