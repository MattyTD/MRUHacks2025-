import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Login.css';
import GoogleAuthButton from '../components/GoogleAuthButton';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(formData.email, formData.password);
    
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message);
    }
    
    setLoading(false);
  };

  return (
  <div className="login-container">
      {/* Background nodes */}
      <div className="auth-background-nodes">
        {/* Left side nodes */}
        <div className="bg-node" style={{ backgroundColor: '#FF6B9D', top: '5%', left: '5%', width: '50px', height: '50px', animationDelay: '0s' }}></div>
        <div className="bg-node" style={{ backgroundColor: '#00B894', top: '15%', left: '10%', width: '45px', height: '45px', animationDelay: '1s' }}></div>
        <div className="bg-node" style={{ backgroundColor: '#C44569', top: '25%', left: '3%', width: '48px', height: '48px', animationDelay: '2s' }}></div>
        <div className="bg-node" style={{ backgroundColor: '#A29BFE', top: '35%', left: '8%', width: '52px', height: '52px', animationDelay: '3s' }}></div>
        <div className="bg-node" style={{ backgroundColor: '#FF6B9D', top: '45%', left: '12%', width: '44px', height: '44px', animationDelay: '1.4s' }}></div>
        <div className="bg-node" style={{ backgroundColor: '#4ECDC4', top: '55%', left: '6%', width: '44px', height: '44px', animationDelay: '4s' }}></div>
        <div className="bg-node" style={{ backgroundColor: '#F8B500', top: '65%', left: '10%', width: '42px', height: '42px', animationDelay: '2.5s' }}></div>
        <div className="bg-node" style={{ backgroundColor: '#95E1D3', top: '75%', left: '4%', width: '50px', height: '50px', animationDelay: '4.5s' }}></div>
        <div className="bg-node" style={{ backgroundColor: '#00B894', top: '85%', left: '9%', width: '46px', height: '46px', animationDelay: '2.8s' }}></div>
        <div className="bg-node" style={{ backgroundColor: '#FDCB6E', top: '95%', left: '7%', width: '48px', height: '48px', animationDelay: '5s' }}></div>
        
        {/* Center-left nodes */}
        <div className="bg-node" style={{ backgroundColor: '#6C5CE7', top: '10%', left: '20%', width: '40px', height: '40px', animationDelay: '0.5s' }}></div>
        <div className="bg-node" style={{ backgroundColor: '#FD79A8', top: '30%', left: '18%', width: '46px', height: '46px', animationDelay: '3.5s' }}></div>
        <div className="bg-node" style={{ backgroundColor: '#FCBAD3', top: '50%', left: '22%', width: '38px', height: '38px', animationDelay: '0.7s' }}></div>
        <div className="bg-node" style={{ backgroundColor: '#A29BFE', top: '70%', left: '16%', width: '49px', height: '49px', animationDelay: '2.1s' }}></div>
        <div className="bg-node" style={{ backgroundColor: '#FF6B6B', top: '90%', left: '20%', width: '43px', height: '43px', animationDelay: '5.5s' }}></div>
        
        {/* Center-right nodes */}
        <div className="bg-node" style={{ backgroundColor: '#FDCB6E', top: '8%', left: '75%', width: '55px', height: '55px', animationDelay: '1.5s' }}></div>
        <div className="bg-node" style={{ backgroundColor: '#FCBAD3', top: '22%', left: '78%', width: '38px', height: '38px', animationDelay: '0.7s' }}></div>
        <div className="bg-node" style={{ backgroundColor: '#00B894', top: '38%', left: '72%', width: '44px', height: '44px', animationDelay: '1.4s' }}></div>
        <div className="bg-node" style={{ backgroundColor: '#6C5CE7', top: '52%', left: '77%', width: '49px', height: '49px', animationDelay: '2.1s' }}></div>
        <div className="bg-node" style={{ backgroundColor: '#F8B500', top: '68%', left: '74%', width: '42px', height: '42px', animationDelay: '2.5s' }}></div>
        <div className="bg-node" style={{ backgroundColor: '#C44569', top: '82%', left: '76%', width: '48px', height: '48px', animationDelay: '2s' }}></div>
        
        {/* Right side nodes */}
        <div className="bg-node" style={{ backgroundColor: '#6C5CE7', top: '5%', left: '92%', width: '40px', height: '40px', animationDelay: '0.5s' }}></div>
        <div className="bg-node" style={{ backgroundColor: '#FDCB6E', top: '15%', left: '88%', width: '55px', height: '55px', animationDelay: '1.5s' }}></div>
        <div className="bg-node" style={{ backgroundColor: '#F8B500', top: '25%', left: '94%', width: '42px', height: '42px', animationDelay: '2.5s' }}></div>
        <div className="bg-node" style={{ backgroundColor: '#FD79A8', top: '35%', left: '90%', width: '46px', height: '46px', animationDelay: '3.5s' }}></div>
        <div className="bg-node" style={{ backgroundColor: '#A29BFE', top: '45%', left: '93%', width: '52px', height: '52px', animationDelay: '3s' }}></div>
        <div className="bg-node" style={{ backgroundColor: '#95E1D3', top: '55%', left: '89%', width: '50px', height: '50px', animationDelay: '4.5s' }}></div>
        <div className="bg-node" style={{ backgroundColor: '#4ECDC4', top: '65%', left: '91%', width: '44px', height: '44px', animationDelay: '4s' }}></div>
        <div className="bg-node" style={{ backgroundColor: '#FF6B9D', top: '75%', left: '87%', width: '50px', height: '50px', animationDelay: '0s' }}></div>
        <div className="bg-node" style={{ backgroundColor: '#00B894', top: '85%', left: '93%', width: '46px', height: '46px', animationDelay: '2.8s' }}></div>
        <div className="bg-node" style={{ backgroundColor: '#FCBAD3', top: '95%', left: '90%', width: '38px', height: '38px', animationDelay: '0.7s' }}></div>
      </div>

      <div className="login-card">
        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          
          {error && <div className="error">{error}</div>}
          
          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={loading}
            style={{ width: '100%', marginTop: '1rem' }}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div style={{ textAlign: 'center', margin: '1rem 0' }}>
          <GoogleAuthButton text="Sign in with Google" />
        </div>
        
        <p style={{ textAlign: 'center', marginTop: '1rem' }}>
          Don't have an account? <Link to="/register">Register here</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
