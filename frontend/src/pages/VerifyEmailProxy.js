import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const VerifyEmailProxy = () => {
  const navigate = useNavigate();
  const { token } = useParams();

  useEffect(() => {
    const verify = async () => {
      try {
        // Make request to backend verification endpoint
        const backendUrl = `http://localhost:5001/api/auth/verify-email/${token}`;
        // Use axios to follow redirect and get status
        const res = await axios.get(backendUrl, { maxRedirects: 0, validateStatus: null });
        // If backend redirects, extract location header
        if (res.status === 302 && res.headers.location) {
          window.location.replace(res.headers.location);
        } else {
          // Fallback: redirect to verification page with error
          navigate('/verification?verified=error');
        }
      } catch (error) {
        navigate('/verification?verified=error');
      }
    };
    verify();
  }, [token, navigate]);

  return (
    <div style={{ textAlign: 'center', marginTop: '80px' }}>
      <h2>Verifying your email...</h2>
      <p>Please wait while we verify your email.</p>
    </div>
  );
};

export default VerifyEmailProxy;
