import React, { useEffect, useState } from 'react';
import { FiFileText, FiRefreshCw, FiTrash2 } from 'react-icons/fi';
import { nodeAPI } from '../../services/api';
import { formatRelativeTime } from '../../utils/formatters';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Pagination from '../../components/common/Pagination';
import { toast } from 'react-toastify';

const levelColor = { info: 'badge-green', warn: 'badge-yellow', error: 'badge-red', debug: 'badge-gray' };

export default function AdminLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [level, setLevel] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 50 };
      if (level) params.level = level;
      const res = await nodeAPI.get('/logs/', { params });
      setLogs(res.data.docs || []);
      setTotal(res.data.total || 0);
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [page, level]);

  const clearLogs = async () => {
    if (!window.confirm('Clear all logs?')) return;
    try {
      await nodeAPI.delete('/logs/clear');
      toast.success('Logs cleared.');
      load();
    } catch { toast.error('Failed.'); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-header flex items-center gap-2"><FiFileText size={20} /> System Logs</h1>
          <p className="page-sub">{total} log entries</p>
        </div>
        <div className="flex gap-2">
          <select className="input-field text-sm w-28" value={level} onChange={e => setLevel(e.target.value)}>
            <option value="">All</option>
            <option value="info">Info</option>
            <option value="warn">Warn</option>
            <option value="error">Error</option>
            <option value="debug">Debug</option>
          </select>
          <button onClick={load} className="p-2 rounded-xl bg-gray-100 hover:bg-primary-100 text-gray-500 hover:text-primary-700 transition-colors">
            <FiRefreshCw size={15} />
          </button>
          <button onClick={clearLogs} className="p-2 rounded-xl bg-gray-100 hover:bg-red-100 text-gray-500 hover:text-red-600 transition-colors">
            <FiTrash2 size={15} />
          </button>
        </div>
      </div>

      {loading ? <LoadingSpinner /> : logs.length === 0 ? (
        <div className="glass-card p-16 text-center">
          <FiFileText size={40} className="text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500">No logs found</p>
        </div>
      ) : (
        <>
          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    {['Level', 'Action', 'Message', 'User', 'Time'].map(h => (
                      <th key={h} className="text-left px-3 py-2.5 font-semibold text-gray-500 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {logs.map((log, i) => (
                    <tr key={log.id || log._id || i} className="hover:bg-gray-50">
                      <td className="px-3 py-2.5">
                        <span className={`badge capitalize ${levelColor[log.level] || 'badge-gray'}`}>{log.level}</span>
                      </td>
                      <td className="px-3 py-2.5 text-gray-500">{log.action || '—'}</td>
                      <td className="px-3 py-2.5 text-gray-700 max-w-xs truncate">{log.message}</td>
                      <td className="px-3 py-2.5 text-gray-400">{log.userEmail || '—'}</td>
                      <td className="px-3 py-2.5 text-gray-400 whitespace-nowrap">{formatRelativeTime(log.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <Pagination page={page} totalPages={Math.ceil(total / 50)} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
