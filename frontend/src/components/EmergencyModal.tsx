import React, { useEffect, useState } from 'react';
import { X, ShieldAlert, Phone, AlertTriangle, EyeOff } from 'lucide-react';
import api from '../services/api';
import { useToast } from './Common/Toast';

interface EmergencyContact {
  id: number;
  name: string;
  contact_number: string;
  description: string;
}

interface EmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId?: number;
}

export const EmergencyModal: React.FC<EmergencyModalProps> = ({
  isOpen,
  onClose,
  bookingId,
}) => {
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [panicLoading, setPanicLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      api
        .get('/safety/emergency-contacts')
        .then((res) => {
          if (res.data.success) setContacts(res.data.data);
        })
        .catch((e) => console.error('Failed to load emergency contacts', e));
    }
  }, [isOpen]);

  const handlePanicTrigger = async () => {
    setPanicLoading(true);
    try {
      // Fetch browser location coordinates
      let latitude = '';
      let longitude = '';
      
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            latitude = position.coords.latitude.toString();
            longitude = position.coords.longitude.toString();
            await triggerSOS(latitude, longitude);
          },
          async () => {
            await triggerSOS(latitude, longitude); // Trigger SOS without coords if denied
          }
        );
      } else {
        await triggerSOS(latitude, longitude);
      }
    } catch (e) {
      toast('SOS panic dispatch failed, please dial emergency lines directly', 'error');
    } finally {
      setPanicLoading(false);
    }
  };

  const triggerSOS = async (lat: string, lng: string) => {
    const res = await api.post('/safety/emergency', {
      booking_id: bookingId || 1, // fallback to mock index
      latitude: lat,
      longitude: lng,
      notes: 'SOS triggered from frontend panic button',
    });
    
    if (res.data.success) {
      toast('SOS Panic registered. Emergency services and WithMe24 support have been alerted!', 'error');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full border border-red-100 overflow-hidden">
        {/* Header */}
        <div className="bg-rose-600 p-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert size={22} className="animate-pulse" />
            <h3 className="text-lg font-bold">Safety Center & SOS</h3>
          </div>
          <button onClick={onClose} className="hover:bg-rose-700 p-1 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <div className="text-center space-y-3">
            <p className="text-sm text-slate-600">
              If you are in immediate danger, feel unsafe, or need medical or security support, trigger the SOS button below or call regional emergency agencies.
            </p>
            
            {/* SOS button */}
            <button
              onClick={handlePanicTrigger}
              disabled={panicLoading}
              className="mx-auto w-36 h-36 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex flex-col items-center justify-center shadow-lg hover:shadow-xl border-4 border-rose-300 transition-all font-extrabold text-lg select-none active:scale-95"
            >
              {panicLoading ? (
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-white"></div>
              ) : (
                <>
                  <ShieldAlert size={40} className="mb-1" />
                  TRIGGER SOS
                </>
              )}
            </button>
            <p className="text-xs text-rose-500 font-semibold animate-pulse">
              *Actions will log coordinates and booking details to WithMe24 safety teams.
            </p>
          </div>

          <hr className="border-slate-100" />

          {/* Emergency contacts list */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
              <Phone size={16} /> Regional Emergency Helplines
            </h4>
            <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto pr-1">
              {contacts.length > 0 ? (
                contacts.map((c) => (
                  <div key={c.id} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-150">
                    <div>
                      <div className="text-xs font-bold text-slate-800">{c.name}</div>
                      <div className="text-[10px] text-slate-500">{c.description}</div>
                    </div>
                    <a
                      href={`tel:${c.contact_number}`}
                      className="flex items-center gap-1 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold px-3 py-1.5 rounded-md transition-colors"
                    >
                      <Phone size={12} /> {c.contact_number}
                    </a>
                  </div>
                ))
              ) : (
                <div className="text-xs text-slate-400 text-center py-2">Loading contact logs...</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
