import React, { useEffect, useState } from 'react';
import { FiUsers, FiTrash2 } from 'react-icons/fi';
import { authService } from '../../services/api';
import { formatDate } from '../../utils/formatters';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { toast } from 'react-toastify';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await authService.adminGetUsers();
      setUsers(res.data.users || []);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to load users.');
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (userId, name) => {
    if (!window.confirm(`Delete user "${name}"? This cannot be undone.`)) return;
    try {
      await authService.adminDeleteUser(userId);
      toast.success('User deleted.');
      setUsers(prev => prev.filter(u => u.id !== userId));
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete user.');
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <div>
      <div className="mb-6">
        <h1 className="page-header flex items-center gap-2"><FiUsers size={20} /> Users</h1>
        <p className="page-sub">{users.length} registered users</p>
      </div>
      {loading ? <LoadingSpinner /> : (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  {['Name', 'Email', 'Role', 'Verified', 'Joined', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900">{u.first_name} {u.last_name}</td>
                    <td className="px-4 py-3 text-gray-500">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className={`badge capitalize ${u.role === 'admin' ? 'badge-purple' : u.role === 'seller' ? 'badge-green' : 'badge-gray'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge ${u.is_verified ? 'badge-green' : 'badge-yellow'}`}>
                        {u.is_verified ? 'Verified' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400">{formatDate(u.created_at)}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => deleteUser(u.id, `${u.first_name} ${u.last_name}`)}
                        className="p-1.5 rounded-lg hover:bg-red-100 text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <FiTrash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
