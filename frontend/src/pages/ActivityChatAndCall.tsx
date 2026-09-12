import React, { useEffect, useState } from 'react';
import { v1Api } from '../services/api';
import { useToast } from '../components/Common/Toast';
import { MessageSquare, PhoneCall, Video, Send, RefreshCw } from 'lucide-react';

export const ActivityChatAndCall: React.FC = () => {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [calls, setCalls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const { toast } = useToast();

  const loadChatAndCalls = async () => {
    setLoading(true);
    try {
      const [chatRes, callRes] = await Promise.all([
        v1Api.getChat(),
        v1Api.getCallLogs()
      ]);
      if (chatRes.data.success) setMessages(chatRes.data.messages || []);
      if (callRes.data.success) setCalls(callRes.data.recent_calls || []);
    } catch (e: any) {
      toast('Failed to load chat data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChatAndCalls();
  }, []);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setMessages((prev) => [
      ...prev,
      {
        id: `msg_${Date.now()}`,
        sender_id: 'usr_me',
        sender_name: 'You',
        text: newMessage.trim(),
        timestamp: new Date().toISOString()
      }
    ]);
    setNewMessage('');
    toast('Message sent', 'info');
  };

  const handleInitiateCall = async (type: 'VIDEO' | 'AUDIO') => {
    try {
      const res = await v1Api.initiateCall('usr_202', type);
      if (res.data.success) {
        toast(`${type} call initiated! Channel Token generated.`, 'success');
      }
    } catch (e: any) {
      toast('Failed to launch call', 'error');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-purple-100 p-6 rounded-3xl shadow-sm">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 flex items-center gap-2">
            <MessageSquare size={28} className="text-purple-600" /> Companion Activity Chat & Calling
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Real-time messaging, audio/video call scheduling & Agora WebRTC launcher.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => handleInitiateCall('AUDIO')}
            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-black px-4 py-2.5 rounded-2xl text-xs flex items-center gap-1.5 border border-emerald-200 shadow-xs active:scale-95 transition-all"
          >
            <PhoneCall size={16} /> Voice Call
          </button>
          <button
            onClick={() => handleInitiateCall('VIDEO')}
            className="bg-purple-700 hover:bg-purple-800 text-white font-black px-4 py-2.5 rounded-2xl text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
          >
            <Video size={16} /> Video Call
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat Messages */}
        <div className="lg:col-span-2 bg-white border border-purple-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between h-[450px]">
          <div className="border-b border-slate-100 pb-3 mb-3 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center font-black text-purple-700 text-sm">
                P
              </div>
              <div>
                <h3 className="font-black text-slate-900 text-sm">Priya Sharma</h3>
                <span className="text-[10px] text-emerald-600 font-extrabold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Online
                </span>
              </div>
            </div>
          </div>

          {/* Messages list */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-2">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.sender_name === 'You' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-xs sm:max-w-sm rounded-2xl p-3.5 text-xs font-medium leading-relaxed shadow-xs ${
                    m.sender_name === 'You'
                      ? 'bg-purple-700 text-white rounded-br-none'
                      : 'bg-slate-100 text-slate-800 rounded-bl-none'
                  }`}
                >
                  {m.text}
                </div>
                <span className="text-[9px] text-slate-400 font-bold mt-1 px-1">
                  {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>

          {/* Message input */}
          <form onSubmit={handleSendMessage} className="mt-4 flex gap-2 pt-3 border-t border-slate-100">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-600 text-slate-900"
            />
            <button
              type="submit"
              className="bg-purple-700 hover:bg-purple-800 text-white font-black px-4 py-2.5 rounded-2xl text-xs flex items-center gap-1 shadow-md active:scale-95 transition-all"
            >
              <Send size={16} />
            </button>
          </form>
        </div>

        {/* Call Logs Side Panel */}
        <div className="bg-white border border-purple-100 rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
            <PhoneCall size={16} className="text-purple-600" /> Recent Activity Calls
          </h3>

          <div className="space-y-3">
            {calls.map((c) => (
              <div key={c.call_id} className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl flex justify-between items-center text-xs">
                <div>
                  <div className="font-black text-slate-900">{c.partner_name}</div>
                  <div className="text-[10px] text-purple-700 font-bold">{c.call_type} CALL • {c.duration}</div>
                </div>
                <span className="text-[10px] text-slate-400 font-semibold">
                  {new Date(c.timestamp).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
