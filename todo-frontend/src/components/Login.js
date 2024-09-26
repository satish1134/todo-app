// src/components/Login.js
import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom'; // Import Link and useNavigate
import './style.css'; // Ensure you have the appropriate CSS file for styles

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate(); // Use useNavigate for redirect

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null); // Reset error state

    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password,
      });
      console.log('Login successful:', response.data);
      localStorage.setItem('token', response.data.token); // Store token in local storage
      navigate('/dashboard'); // Redirect to dashboard
    } catch (err) {
      if (err.response) {
        setError(err.response.data.message); // Set the error from the response
      } else {
        setError('An error occurred. Please try again.'); // Fallback error message
      }
      console.error('Login error:', err);
    }
  };

  return (
    <div className="login-container">
      {/* Welcome Message */}
      <div className="welcome-message">
        <h1>Welcome to the To-Doo App!</h1>
        <p>Please log in or sign up to proceed.</p>
      </div>

      <form onSubmit={handleSubmit} className="p-4 bg-white rounded shadow">
        <h2 className="text-center mb-4">Login</h2>
        {error && <div className="alert alert-danger">{error}</div>}
        <div className="mb-3">
          <input
            type="email"
            className="form-control"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <input
            type="password"
            className="form-control"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button className="btn btn-primary w-100" type="submit">
          Login
        </button>

        {/* Forgot Password and Signup Links */}
        <div className="text-center mt-3">
          <Link to="/forgot-password">Forgot Password?</Link>
        </div>
        <div className="text-center mt-2">
          <span>Not registered? </span>
          <Link to="/signup">Sign Up</Link>
        </div>
      </form>
    </div>
  );
};

export default Login;
