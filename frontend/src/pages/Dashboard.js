import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const Dashboard = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get('/api/users');
        setUsers(res.data);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return (
    <div className="container">
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1>Dashboard</h1>
        <p>Welcome to your dashboard, {user?.name}!</p>
      </div>

      <div className="card">
        <h3>Your Profile</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div>
            <strong>Name:</strong> {user?.name}
          </div>
          <div>
            <strong>Email:</strong> {user?.email}
          </div>
          <div>
            <strong>Role:</strong> {user?.role}
          </div>
          <div>
            <strong>Status:</strong> {user?.isActive ? 'Active' : 'Inactive'}
          </div>
        </div>
      </div>

      <div className="card">
        <h3>All Users</h3>
        {loading ? (
          <p>Loading users...</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
            {users.map((userData) => (
              <div key={userData._id} style={{ 
                border: '1px solid #ddd', 
                borderRadius: '5px', 
                padding: '1rem',
                backgroundColor: '#f9f9f9'
              }}>
                <h4>{userData.name}</h4>
                <p><strong>Email:</strong> {userData.email}</p>
                <p><strong>Role:</strong> {userData.role}</p>
                <p><strong>Status:</strong> {userData.isActive ? 'Active' : 'Inactive'}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
