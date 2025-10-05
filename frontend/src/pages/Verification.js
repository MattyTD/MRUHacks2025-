import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Verification = () => {
  const [message, setMessage] = useState('Verifying your email...');
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const status = params.get('verified');
    console.log('[Verification] Query param status:', status);
    if (status === 'success') {
      setMessage('Your email has been verified! You can now log in.');
      console.log('[Verification] Email verified successfully.');
    } else if (status === 'fail') {
      setMessage('Verification failed. The link may be invalid or expired.');
      console.log('[Verification] Email verification failed.');
    } else if (status === 'error') {
      setMessage('An error occurred during verification. Please try again.');
      console.log('[Verification] Error during email verification.');
    } else {
      setMessage('Unknown verification status.');
      console.log('[Verification] Unknown verification status.');
    }
  }, []);

  return (
    <div className="verification-container" style={{ textAlign: 'center', marginTop: '80px' }}>
      <h2>Email Verification</h2>
      <p>{message}</p>
      <button onClick={() => navigate('/login')}>Go to Login</button>
    </div>
  );
};

export default Verification;
