import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthLayout, FormInput, Alert, Button, Loading } from '../components';
import { CountryDropdown } from 'react-country-region-selector';

const AdditionalDetails = () => {
  const navigate = useNavigate();
  const [details, setDetails] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    street: '',
    zip: '',
    city: '',
    country: '',
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const user_id = localStorage.getItem('user_id');

    // Wenn nicht eingeloggt, zur Login-Seite weiterleiten
    if (!token || !user_id) {
      navigate('/login');
      return;
    }

    setIsLoading(true);
    // Daten des aktuellen Benutzers abrufen und Formularfelder vorbelegen
    fetch(`${API_URL}/api/users/${user_id}/`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    })
      .then(response => {
        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem('access_token');
            localStorage.removeItem('user_id');
            navigate('/login');
            throw new Error('Token expired. Please login again.');
          }
          throw new Error('Failed to fetch user data');
        }
        return response.json();
      })
      .then(data => {
        setDetails({
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          phone: data.phone || '',
          street: data.street || '',
          zip: data.zip || '',
          city: data.city || '',
          country: data.country || '',
        });
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Error fetching user details", err);
        setIsLoading(false);
      });
  }, [navigate, API_URL]);

  const handleChange = (e) => {
    setDetails({
      ...details,
      [e.target.name]: e.target.value,
    });
  };

  const handleNumericInput = (e) => {
    const { name, value } = e.target;
    
    const numericValue = value.replace(/\D/g, '');
    
    setDetails({
      ...details,
      [name]: numericValue,
    });
  };

  const selectCountry = (val) => {
    setDetails({
      ...details,
      country: val
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const token = localStorage.getItem('access_token');
    const user_id = localStorage.getItem('user_id');

    if (!user_id || !token) {
      navigate('/login');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/users/${user_id}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(details),
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('user_id');
          navigate('/login');
          return;
        }
        
        const errorData = await response.json();
        setError(typeof errorData === 'object' ? JSON.stringify(errorData) : errorData);
        return;
      }

      const data = await response.json();
      console.log('Update response:', data);
      setSuccess('Details updated successfully!');
      navigate('/flightlog');
    } catch (err) {
      setError('An error occurred. Please try again later.');
    }
  };

  if (isLoading) {
    return <Loading message="Loading..." />;
  }

  return (
    <AuthLayout title="Additional Details">
      <Alert type="error" message={error} />
      <Alert type="success" message={success} />

      <form onSubmit={handleSubmit}>
        <FormInput
          label="First Name"
          type="text"
          name="first_name"
          id="first_name"
          value={details.first_name}
          onChange={handleChange}
          required
          labelClassName="text-white"
        />

        <FormInput
          label="Last Name"
          type="text"
          name="last_name"
          id="last_name"
          value={details.last_name}
          onChange={handleChange}
          required
          labelClassName="text-white"
        />

        <FormInput
          label="Phone"
          type="tel"
          name="phone"
          id="phone"
          value={details.phone}
          onChange={handleNumericInput}
          inputMode="numeric"
          pattern="[0-9]*"
          labelClassName="text-white"
        />

        <FormInput
          label="Street"
          type="text"
          name="street"
          id="street"
          value={details.street}
          onChange={handleChange}
          labelClassName="text-white"
        />

        <FormInput
          label="Zip"
          type="text"
          name="zip"
          id="zip"
          value={details.zip}
          onChange={handleNumericInput}
          inputMode="numeric"
          pattern="[0-9]*"
          labelClassName="text-white"
        />

        <FormInput
          label="City"
          type="text"
          name="city"
          id="city"
          value={details.city}
          onChange={handleChange}
          labelClassName="text-white"
        />

        <div className="mb-4">
          <p className="text-white mb-2">Country</p>
          <CountryDropdown
            id="country"
            name="country"
            value={details.country}
            onChange={selectCountry}
            defaultOptionLabel=" "
            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
          />
        </div>

        <Button type="submit">Save Details</Button>
      </form>
    </AuthLayout>
  );
};

export default AdditionalDetails;