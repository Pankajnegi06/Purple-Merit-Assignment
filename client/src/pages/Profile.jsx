import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';
import './Profile.css';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password && password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (password && password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const payload = {};
      if (name !== user.name) payload.name = name;
      if (password) payload.password = password;

      if (Object.keys(payload).length === 0) {
        toast('No changes to save');
        setLoading(false);
        return;
      }

      const { data } = await api.put('/users/profile/me', payload);
      updateUser(data.user);
      setPassword('');
      setConfirmPassword('');
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
    setLoading(false);
  };

  return (
    <div className="profile-page">
      <div className="page-header">
        <h1>My Profile</h1>
        <p>Manage your account settings</p>
      </div>

      <div className="profile-card">
        <div className="profile-top">
          <div className="profile-avatar">{user?.name?.charAt(0).toUpperCase()}</div>
          <div>
            <h2>{user?.name}</h2>
            <span className="profile-email">{user?.email}</span>
            <span className={`badge badge-${user?.role}`}>{user?.role}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="profile-form">
          <div className="form-group">
            <label htmlFor="profileName">Name</label>
            <input
              id="profileName"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="profileEmail">Email</label>
            <input
              id="profileEmail"
              type="email"
              value={user?.email || ''}
              disabled
              className="disabled"
            />
            <span className="field-hint">Email cannot be changed</span>
          </div>

          <div className="form-divider" />

          <h3>Change Password</h3>

          <div className="form-group">
            <label htmlFor="newPassword">New Password</label>
            <input
              id="newPassword"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Leave blank to keep current"
              minLength={password ? 6 : undefined}
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat new password"
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
