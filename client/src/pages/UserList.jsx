import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import {
  HiOutlineSearch,
  HiOutlineUserAdd,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineEye,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
} from 'react-icons/hi';
import './UserList.css';

const UserList = () => {
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchUsers = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (search) params.search = search;
      if (roleFilter) params.role = roleFilter;
      if (statusFilter) params.status = statusFilter;

      const { data } = await api.get('/users', { params });
      setUsers(data.users);
      setPagination(data.pagination);
    } catch {
      toast.error('Failed to fetch users');
    }
    setLoading(false);
  }, [search, roleFilter, statusFilter]);

  useEffect(() => {
    fetchUsers(1);
  }, [fetchUsers]);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Deactivate "${name}"? They won't be able to log in.`)) return;

    try {
      await api.delete(`/users/${id}`);
      toast.success(`${name} deactivated`);
      fetchUsers(pagination.page);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to deactivate user');
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchUsers(1);
  };

  return (
    <div className="user-list-page">
      <div className="page-header">
        <div>
          <h1>Users</h1>
          <p>{pagination.total} users found</p>
        </div>
        {isAdmin && (
          <Link to="/users/new" className="btn-primary">
            <HiOutlineUserAdd /> Add User
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="filters-bar">
        <form className="search-form" onSubmit={handleSearchSubmit}>
          <HiOutlineSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </form>

        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="manager">Manager</option>
          <option value="user">User</option>
        </select>

        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="loading-screen"><div className="spinner" /></div>
      ) : users.length === 0 ? (
        <div className="empty-state">No users found matching your criteria.</div>
      ) : (
        <div className="table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id}>
                  <td className="name-cell">
                    <div className="table-avatar">{u.name.charAt(0).toUpperCase()}</div>
                    {u.name}
                  </td>
                  <td>{u.email}</td>
                  <td>
                    <span className={`badge badge-${u.role}`}>{u.role}</span>
                  </td>
                  <td>
                    <span className={`badge badge-${u.status}`}>{u.status}</span>
                  </td>
                  <td className="date-cell">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td className="actions-cell">
                    <Link to={`/users/${u._id}`} className="icon-btn" title="View">
                      <HiOutlineEye />
                    </Link>
                    <Link to={`/users/${u._id}/edit`} className="icon-btn" title="Edit">
                      <HiOutlinePencil />
                    </Link>
                    {isAdmin && u.status === 'active' && (
                      <button
                        className="icon-btn danger"
                        title="Deactivate"
                        onClick={() => handleDelete(u._id, u.name)}
                      >
                        <HiOutlineTrash />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="pagination">
          <button
            disabled={pagination.page <= 1}
            onClick={() => fetchUsers(pagination.page - 1)}
          >
            <HiOutlineChevronLeft />
          </button>
          <span>
            Page {pagination.page} of {pagination.pages}
          </span>
          <button
            disabled={pagination.page >= pagination.pages}
            onClick={() => fetchUsers(pagination.page + 1)}
          >
            <HiOutlineChevronRight />
          </button>
        </div>
      )}
    </div>
  );
};

export default UserList;
