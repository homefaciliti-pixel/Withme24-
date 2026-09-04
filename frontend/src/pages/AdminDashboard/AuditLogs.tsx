import React, { useEffect, useState } from 'react';
import { Sidebar } from '../../components/Layout/Sidebar';
import { History, Eye } from 'lucide-react';
import api from '../../services/api';

interface AuditLog {
  id: number;
  action: string;
  entity_type: string;
  entity_id: number | null;
  old_value: string | null;
  new_value: string | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  admin: {
    name: string;
    role: string;
  };
}

export const AdminAuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  useEffect(() => {
    api
      .get('/admin/audit-logs')
      .then((res) => {
        if (res.data.success) setLogs(res.data.data);
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex bg-slate-50 min-h-[calc(100vh-4rem)]">
      <Sidebar type="admin" />

      <main className="flex-grow p-6 space-y-6 max-w-5xl">
        <h2 className="text-xl font-bold text-slate-800">Administrative Audit Trails</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Logs Table List */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm md:col-span-2 space-y-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide">Operation Records</h3>
            
            {loading ? (
              <div className="text-xs text-slate-400 text-center py-6 animate-pulse">Syncing logs...</div>
            ) : logs.length > 0 ? (
              <div className="grid grid-cols-1 gap-2 max-h-[450px] overflow-y-auto pr-1">
                {logs.map((l) => (
                  <div
                    key={l.id}
                    className="flex justify-between items-center p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  >
                    <div>
                      <div className="font-bold text-slate-800">
                        {l.action} | {l.admin.name} ({l.admin.role})
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        Target: {l.entity_type} #{l.entity_id || 'N/A'} | {new Date(l.created_at).toLocaleString()}
                      </div>
                    </div>
                    
                    <button
                      onClick={() => setSelectedLog(l)}
                      className="bg-slate-200 hover:bg-slate-350 text-slate-700 font-bold p-2 rounded-lg text-xs flex items-center gap-1 transition-colors"
                    >
                      <Eye size={13} /> View
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-slate-450 text-center py-8 italic">No administrative logs registered.</div>
            )}
          </div>

          {/* Details Inspector */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4 h-fit max-w-sm w-full">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
              <History size={14} className="text-slate-400" /> Log Inspector
            </h3>

            {selectedLog ? (
              <div className="space-y-3 text-[11px] text-slate-650 leading-relaxed overflow-x-auto">
                <div>
                  <span className="font-bold block text-slate-800">Action:</span> {selectedLog.action}
                </div>
                <div>
                  <span className="font-bold block text-slate-800">Authorized by:</span> {selectedLog.admin.name}
                </div>
                <div>
                  <span className="font-bold block text-slate-800">Network IP:</span> {selectedLog.ip_address || 'N/A'}
                </div>
                <div>
                  <span className="font-bold block text-slate-800">Timestamp:</span> {new Date(selectedLog.created_at).toLocaleString()}
                </div>
                {selectedLog.old_value && (
                  <div>
                    <span className="font-bold block text-slate-800">Prior State:</span>
                    <pre className="bg-slate-50 p-2 rounded border text-[9px] mt-1 font-mono">{selectedLog.old_value}</pre>
                  </div>
                )}
                {selectedLog.new_value && (
                  <div>
                    <span className="font-bold block text-slate-800">New State:</span>
                    <pre className="bg-slate-50 p-2 rounded border text-[9px] mt-1 font-mono">{selectedLog.new_value}</pre>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-xs text-slate-400 italic text-center py-8">Select a log row to view transaction payload differences.</div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
