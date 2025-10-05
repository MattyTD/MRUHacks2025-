import React from 'react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5001';

const GoogleAuthButton = ({ text = 'Sign in with Google' }) => {
  const handleGoogleLogin = () => {
    window.location.href = `${BACKEND_URL}/api/auth/google`;
  };

  return (
    <button
      type="button"
      onClick={handleGoogleLogin}
      style={{
        background: '#764ba2',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        padding: '10px 20px',
        fontSize: '16px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        margin: '10px 0',
        width: '100%'
      }}
    >
      <svg width="20" height="20" viewBox="0 0 48 48" style={{ marginRight: 8 }}>
        <g>
          <path fill="#4285F4" d="M24 9.5c3.54 0 6.73 1.22 9.24 3.22l6.93-6.93C35.64 2.34 30.13 0 24 0 14.61 0 6.13 5.64 1.67 14.02l8.06 6.27C12.36 13.36 17.73 9.5 24 9.5z"/>
          <path fill="#34A853" d="M46.09 24.59c0-1.56-.14-3.06-.39-4.5H24v9.02h12.44c-.54 2.9-2.18 5.36-4.64 7.02l7.18 5.59C43.87 37.13 46.09 31.27 46.09 24.59z"/>
          <path fill="#FBBC05" d="M9.73 28.29c-1.13-3.36-1.13-6.94 0-10.3l-8.06-6.27C-1.13 17.87-1.13 30.13 9.73 39.71l8.06-6.27z"/>
          <path fill="#EA4335" d="M24 46c6.13 0 11.64-2.34 15.93-6.41l-7.18-5.59c-2.01 1.35-4.59 2.15-7.75 2.15-6.27 0-11.64-3.86-14.27-9.24l-8.06 6.27C6.13 42.36 14.61 48 24 48z"/>
        </g>
      </svg>
      {text}
    </button>
  );
};

export default GoogleAuthButton;
