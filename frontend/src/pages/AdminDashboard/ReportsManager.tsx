import React, { useEffect, useState } from 'react';
import { Sidebar } from '../../components/Layout/Sidebar';
import { useToast } from '../../components/Common/Toast';
import { ShieldAlert, AlertTriangle, Hammer, Ban, HeartHandshake } from 'lucide-react';
import api from '../../services/api';

interface ModerationCase {
  id: number;
  user_id: number;
  status: string;
  severity: string;
  internal_notes: string;
  created_at: string;
  user: {
    name: string;
    account_status: string;
  };
  report: {
    reason: string;
    description: string;
    reporter: {
      name: string;
    };
  } | null;
}

export const AdminReportsManager: React.FC = () => {
  const { toast } = useToast();

  const [cases, setCases] = useState<ModerationCase[]>([]);
  const [loading, setLoading] = useState(true);

  // Resolution controls
  const [selectedCase, setSelectedCase] = useState<ModerationCase | null>(null);
  const [resolutionAction, setResolutionAction] = useState('WARN');
  const [resolutionReason, setResolutionReason] = useState('');
  const [suspensionDays, setSuspensionDays] = useState(7);
  const [resolving, setResolving] = useState(false);

  const loadCases = () => {
    setLoading(true);
    api
      .get('/admin/reports')
      .then((res) => {
        if (res.data.success) setCases(res.data.data);
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadCases();
  }, []);

  const handleResolve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCase || !resolutionReason) return;

    setResolving(true);
    try {
      const res = await api.post(`/admin/reports/${selectedCase.id}/resolve`, {
        action: resolutionAction,
        reason: resolutionReason,
        duration_days: resolutionAction === 'SUSPEND' ? suspensionDays : null,
      });

      if (res.data.success) {
        toast('Moderation case resolved successfully', 'success');
        setSelectedCase(null);
        setResolutionReason('');
        loadCases();
      }
    } catch (err: any) {
      toast(err.response?.data?.message || 'Failed to resolve report case', 'error');
    } finally {
      setResolving(false);
    }
  };

  return (
    <div className="flex bg-slate-50 min-h-[calc(100vh-4rem)]">
      <Sidebar type="admin" />

      <main className="flex-grow p-6 space-y-6 max-w-5xl">
        <h2 className="text-xl font-bold text-slate-800">Safety & Moderation cases</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Ticket list */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm md:col-span-2 space-y-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide">Active Complaints</h3>

            {loading ? (
              <div className="text-xs text-slate-400 text-center py-6 animate-pulse">Syncing tickets...</div>
            ) : cases.length > 0 ? (
              <div className="grid grid-cols-1 gap-3 max-h-[400px] overflow-y-auto pr-1">
                {cases.map((c) => (
                  <div
                    key={c.id}
                    className="flex justify-between items-center p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  >
                    <div>
                      <div className="font-bold text-slate-850">Case #{c.id} - Target: {c.user.name}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        Severity:{' '}
                        <span className={`font-bold ${c.severity === 'CRITICAL' ? 'text-red-600' : 'text-amber-600'}`}>
                          {c.severity}
                        </span>{' '}
                        | Status: {c.status}
                      </div>
                      <p className="text-[10px] text-slate-450 line-clamp-1 mt-1">{c.report?.description}</p>
                    </div>

                    <button
                      onClick={() => setSelectedCase(c)}
                      className="bg-brand-600 hover:bg-brand-700 text-white font-bold p-2 rounded-lg text-xs flex items-center gap-1 transition-colors shadow"
                    >
                      <Hammer size={14} /> Resolve
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-slate-400 text-center py-10 bg-slate-50 border border-dashed rounded-xl font-medium">
                No safety complaints or moderation tickets open.
              </div>
            )}
          </div>

          {/* Action resolver panel */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4 h-fit">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
              <ShieldAlert size={14} className="text-slate-400" /> Resolution Desk
            </h3>

            {selectedCase ? (
              <form onSubmit={handleResolve} className="space-y-4 text-xs">
                <div className="border-b border-slate-100 pb-3">
                  <div className="font-bold text-slate-800">Case ID: #{selectedCase.id}</div>
                  <div className="text-[10px] text-slate-450 mt-0.5">
                    Reported user: <strong>{selectedCase.user.name}</strong> (Status:{' '}
                    {selectedCase.user.account_status})
                  </div>
                </div>

                {selectedCase.report && (
                  <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg space-y-1">
                    <div className="font-bold text-slate-700">Complaint Reason: {selectedCase.report.reason}</div>
                    <p className="text-slate-600 leading-relaxed text-[11px]">"{selectedCase.report.description}"</p>
                    <div className="text-[9px] text-slate-400">Filed by: {selectedCase.report.reporter.name}</div>
                  </div>
                )}

                {/* Resolution Action */}
                {selectedCase.status === 'OPEN' && (
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-600">Sanction Action</label>
                      <select
                        value={resolutionAction}
                        onChange={(e) => setResolutionAction(e.target.value)}
                        className="w-full border border-slate-350 bg-white rounded-lg p-2 text-xs"
                      >
                        <option value="WARN">Issue Official Warning</option>
                        <option value="SUSPEND">Suspend Account</option>
                        <option value="BAN">Permaban Account</option>
                        <option value="RESTORE">Restore Active status</option>
                      </select>
                    </div>

                    {resolutionAction === 'SUSPEND' && (
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-600">Suspension Duration (Days)</label>
                        <input
                          type="number"
                          required
                          value={suspensionDays}
                          onChange={(e) => setSuspensionDays(Number(e.target.value))}
                          className="w-full border border-slate-350 bg-slate-50 rounded-lg p-2 text-xs"
                        />
                      </div>
                    )}

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-600">Audit Justification</label>
                      <textarea
                        required
                        value={resolutionReason}
                        onChange={(e) => setResolutionReason(e.target.value)}
                        placeholder="State grounds for sanction decision..."
                        className="w-full border border-slate-350 rounded-lg p-2 text-xs"
                        rows={3}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={resolving}
                      className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-2 rounded-lg text-xs"
                    >
                      {resolving ? 'Executing Sanctions...' : 'Apply Sanctions & Complete'}
                    </button>
                  </div>
                )}
              </form>
            ) : (
              <div className="text-xs text-slate-400 italic text-center py-8">Select a case ticket to trigger sanctions.</div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
