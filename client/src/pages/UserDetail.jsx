import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { HiOutlinePencil, HiOutlineArrowLeft, HiOutlineTrash } from 'react-icons/hi';
import './UserDetail.css';

const UserDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data } = await api.get(`/users/${id}`);
        setUser(data.user);
      } catch (err) {
        toast.error(err.response?.data?.message || 'User not found');
        navigate('/users');
      }
      setLoading(false);
    };
    fetchUser();
  }, [id, navigate]);

  const handleDelete = async () => {
    if (!window.confirm(`Deactivate "${user.name}"?`)) return;

    try {
      await api.delete(`/users/${id}`);
      toast.success(`${user.name} deactivated`);
      navigate('/users');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    }
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="user-detail-page">
      <button className="back-link" onClick={() => navigate('/users')}>
        <HiOutlineArrowLeft /> Back to Users
      </button>

      <div className="detail-card">
        <div className="detail-header">
          <div className="detail-avatar">{user.name.charAt(0).toUpperCase()}</div>
          <div>
            <h1>{user.name}</h1>
            <span className={`badge badge-${user.role}`}>{user.role}</span>
            <span className={`badge badge-${user.status}`}>{user.status}</span>
          </div>
          <div className="detail-actions">
            <Link to={`/users/${id}/edit`} className="btn-primary">
              <HiOutlinePencil /> Edit
            </Link>
            {isAdmin && user.status === 'active' && (
              <button className="btn-danger" onClick={handleDelete}>
                <HiOutlineTrash /> Deactivate
              </button>
            )}
          </div>
        </div>

        <div className="detail-body">
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Email</span>
              <span className="info-value">{user.email}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Role</span>
              <span className="info-value capitalize">{user.role}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Status</span>
              <span className="info-value capitalize">{user.status}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Created</span>
              <span className="info-value">
                {new Date(user.createdAt).toLocaleString()}
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">Last Updated</span>
              <span className="info-value">
                {new Date(user.updatedAt).toLocaleString()}
              </span>
            </div>
            {user.createdBy && (
              <div className="info-item">
                <span className="info-label">Created By</span>
                <span className="info-value">
                  {user.createdBy.name} ({user.createdBy.email})
                </span>
              </div>
            )}
            {user.updatedBy && (
              <div className="info-item">
                <span className="info-label">Updated By</span>
                <span className="info-value">
                  {user.updatedBy.name} ({user.updatedBy.email})
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetail;
