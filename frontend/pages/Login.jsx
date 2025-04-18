import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthLayout, FormInput, Alert, Button, Loading } from '../components';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Get API URL from environment variables
  const API_URL = import.meta.env.VITE_API_URL;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/jwt/create/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      console.log('Login response:', data);

      if (response.ok) {
        if (data.access) {
          localStorage.setItem('access_token', data.access);
          
          // Fetch the user ID from the /me endpoint
          const meResponse = await fetch(`${API_URL}/auth/users/me/`, {
            headers: {
              'Authorization': `Bearer ${data.access}`
            }
          });
          
          if (meResponse.ok) {
            const userData = await meResponse.json();
            localStorage.setItem('user_id', userData.user_id);
          }
          
          setSuccess('Login successful!');
          setIsLoading(false);
          navigate('/flightlog');
        } else {
          setError('No access token received.');
          setIsLoading(false);
        }
      } else {
        setError(data.detail || 'Invalid credentials');
        setIsLoading(false);
      }
    } catch (err) {
      setError('An error occurred. Please try again later.');
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <Loading message="Logging in..." />;
  }

  return (
    <AuthLayout title="Login">
      <Alert type="error" message={error} />
      <Alert type="success" message={success} />

      <form onSubmit={handleSubmit}>
        <FormInput
          label="E-Mail"
          type="email"
          name="email"
          id="email"
          value={formData.email}
          onChange={handleChange}
          required
          labelClassName="text-white"
        />

        <FormInput
          label="Password"
          type="password"
          name="password"
          id="password"
          value={formData.password}
          onChange={handleChange}
          required
          className="mb-6"
          labelClassName="text-white"
        />

        <Button type="submit">Login</Button>
        
        <div className="mt-4 text-center">
          <span className="text-gray-300">Don't have an account? </span>
          <Link to="/register" className="text-blue-400 hover:text-blue-300">
            Register
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
};

export default Login;