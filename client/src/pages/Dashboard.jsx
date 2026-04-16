import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/axios';
import {
  HiOutlineUsers,
  HiOutlineUserAdd,
  HiOutlineShieldCheck,
  HiOutlineBan,
} from 'react-icons/hi';
import './Dashboard.css';

const Dashboard = () => {
  const { user, isAdmin, isManager } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!isAdmin && !isManager) {
        setLoading(false);
        return;
      }

      try {
        const { data } = await api.get('/users', { params: { limit: 1000 } });
        const users = data.users;

        setStats({
          total: data.pagination.total,
          admins: users.filter((u) => u.role === 'admin').length,
          managers: users.filter((u) => u.role === 'manager').length,
          regular: users.filter((u) => u.role === 'user').length,
          active: users.filter((u) => u.status === 'active').length,
          inactive: users.filter((u) => u.status === 'inactive').length,
        });
      } catch {
        // if the request fails just show the basic dashboard
      }
      setLoading(false);
    };

    fetchStats();
  }, [isAdmin, isManager]);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Welcome back, {user?.name}</p>
      </div>

      {(isAdmin || isManager) && stats ? (
        <>
          <div className="stat-grid">
            <div className="stat-card">
              <div className="stat-icon total">
                <HiOutlineUsers />
              </div>
              <div className="stat-body">
                <span className="stat-value">{stats.total}</span>
                <span className="stat-label">Total Users</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon admin">
                <HiOutlineShieldCheck />
              </div>
              <div className="stat-body">
                <span className="stat-value">{stats.admins}</span>
                <span className="stat-label">Admins</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon active">
                <HiOutlineUsers />
              </div>
              <div className="stat-body">
                <span className="stat-value">{stats.active}</span>
                <span className="stat-label">Active</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon inactive">
                <HiOutlineBan />
              </div>
              <div className="stat-body">
                <span className="stat-value">{stats.inactive}</span>
                <span className="stat-label">Inactive</span>
              </div>
            </div>
          </div>

          {isAdmin && (
            <div className="quick-actions">
              <h2>Quick Actions</h2>
              <div className="action-grid">
                <Link to="/users/new" className="action-card">
                  <HiOutlineUserAdd className="action-icon" />
                  <span>Create User</span>
                </Link>
                <Link to="/users" className="action-card">
                  <HiOutlineUsers className="action-icon" />
                  <span>Manage Users</span>
                </Link>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="user-welcome-card">
          <h2>Your Account</h2>
          <div className="welcome-details">
            <div className="detail-row">
              <span className="detail-label">Name</span>
              <span className="detail-value">{user?.name}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Email</span>
              <span className="detail-value">{user?.email}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Role</span>
              <span className="detail-value role-badge">{user?.role}</span>
            </div>
          </div>
          <Link to="/profile" className="btn-primary">
            Edit Profile
          </Link>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
