// @ts-nocheck
import { useState } from 'react';
import { X, Mail, Phone, Car, Calendar, User, MessageSquare, Check, Save } from 'lucide-react';
import type { Lead } from '../../data/leadsData';
import { getStatusColor, getStatusLabel, formatDate, formatTime, staffMembers } from '../../data/leadsData';

interface LeadDetailProps {
  lead: Lead | null;
  onClose: () => void;
  onUpdate: (updatedLead: Lead) => void;
}

function getField(lead: Lead, field: string): unknown {
  return (lead as unknown as Record<string, unknown>)[field];
}

export default function LeadDetail({ lead, onClose, onUpdate }: LeadDetailProps) {
  const [notes, setNotes] = useState('');

  if (!lead) return null;

  const leadStatus = String(getField(lead, 'status') || '');
  const leadAssigned = String(getField(lead, 'assignedTo') || 'Unassigned');
  const leadNotes = String(getField(lead, 'notes') || '');

  const handleSaveNotes = () => {
    if (notes.trim()) {
      const updated = {
        ...lead,
        notes: leadNotes ? `${leadNotes}\n\n${new Date().toLocaleDateString('en-GB')}: ${notes}` : notes,
      } as Lead;
      onUpdate(updated);
      setNotes('');
    }
  };

  const handleStatusChange = (newStatus: string) => {
    const updated = { ...lead, status: newStatus } as Lead;
    onUpdate(updated);
  };

  const handleAssignChange = (newAssign: string) => {
    const updated = { ...lead, assignedTo: newAssign } as Lead;
    onUpdate(updated);
  };

  const statusOptions: string[] = (() => {
    switch (lead.type) {
      case 'contact':
        return ['new', 'contacted', 'qualified', 'closed'];
      case 'sell-my-car':
        return ['new', 'valued', 'appointment', 'sold'];
      case 'test-drive':
        return ['pending', 'confirmed', 'completed', 'cancelled', 'no-show'];
      case 'finance':
        return ['pending', 'approved', 'declined', 'referred'];
      default:
        return [];
    }
  })();

  const formatNumber = (val: unknown) => {
    const n = Number(val);
    return isNaN(n) ? '0' : n.toLocaleString();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className="relative w-full max-w-[520px] h-full overflow-y-auto"
        style={{
          background: 'rgba(0, 8, 20, 0.98)',
          borderLeft: '1px solid rgba(92, 103, 125, 0.25)',
          boxShadow: '-8px 0 48px rgba(0, 0, 0, 0.4)',
        }}
      >
        {/* Header */}
        <div
          className="sticky top-0 z-10 flex items-center justify-between px-6 py-4"
          style={{
            background: 'rgba(0, 8, 20, 0.95)',
            backdropFilter: 'blur(16px)',
            borderBottom: '1px solid rgba(92, 103, 125, 0.2)',
          }}
        >
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#5C677D] font-mono">{lead.id}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full border ${getStatusColor(leadStatus)}`}>
                {getStatusLabel(leadStatus)}
              </span>
            </div>
            <h2 className="text-lg font-bold text-white mt-1 font-[Space_Grotesk]">{lead.name}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5 text-[#C8D3D9]" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-6">
          {/* Contact Details */}
          <div className="glass rounded-xl p-4">
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <User className="w-4 h-4 text-[#0077B6]" />
              Contact Details
            </h3>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-[#5C677D]" />
                <a href={`mailto:${lead.email}`} className="text-sm text-[#C8D3D9] hover:text-[#00B4D8] transition-colors">
                  {lead.email}
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-[#5C677D]" />
                <a href={`tel:${lead.phone}`} className="text-sm text-[#C8D3D9] hover:text-[#00B4D8] transition-colors">
                  {lead.phone}
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-[#5C677D]" />
                <span className="text-sm text-[#C8D3D9]">
                  Submitted: {formatDate(lead.date)} at {formatTime(lead.date)}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Car className="w-4 h-4 text-[#5C677D]" />
                <span className="text-sm text-[#C8D3D9]">Source: {lead.source}</span>
              </div>
            </div>
          </div>

          {/* Type-Specific Details */}
          {lead.type === 'contact' && (
            <div className="glass rounded-xl p-4">
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#0077B6]" />
                Enquiry Details
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-[#5C677D] mb-1">Subject</p>
                  <p className="text-sm text-white">{String(getField(lead, 'subject') || '')}</p>
                </div>
                <div>
                  <p className="text-xs text-[#5C677D] mb-1">Message</p>
                  <p className="text-sm text-[#C8D3D9] leading-relaxed">{String(getField(lead, 'message') || '')}</p>
                </div>
                {(() => {
                  const v = String(getField(lead, 'vehicleInterested') || '');
                  return v && v !== 'N/A' ? (
                    <div>
                      <p className="text-xs text-[#5C677D] mb-1">Vehicle Interested</p>
                      <p className="text-sm text-[#00B4D8]">{v}</p>
                    </div>
                  ) : null;
                })()}
              </div>
            </div>
          )}

          {lead.type === 'sell-my-car' && (
            <div className="glass rounded-xl p-4">
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <Car className="w-4 h-4 text-[#0077B6]" />
                Vehicle Details
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-[#5C677D] mb-1">Registration</p>
                  <p className="text-sm text-white font-mono">{String(getField(lead, 'registration') || '')}</p>
                </div>
                <div>
                  <p className="text-xs text-[#5C677D] mb-1">Mileage</p>
                  <p className="text-sm text-white">{formatNumber(getField(lead, 'mileage'))} miles</p>
                </div>
                <div>
                  <p className="text-xs text-[#5C677D] mb-1">Condition</p>
                  <p className="text-sm text-white capitalize">{String(getField(lead, 'condition') || '')}</p>
                </div>
                <div>
                  <p className="text-xs text-[#5C677D] mb-1">Estimated Value</p>
                  <p className="text-sm text-[#00C896] font-semibold">
                    £{formatNumber(getField(lead, 'estimatedValue'))}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-[#5C677D] mb-1">Features</p>
                  <p className="text-sm text-[#C8D3D9]">{String(getField(lead, 'features') || '')}</p>
                </div>
              </div>
            </div>
          )}

          {lead.type === 'test-drive' && (
            <div className="glass rounded-xl p-4">
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#0077B6]" />
                Booking Details
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-[#5C677D] mb-1">Vehicle</p>
                  <p className="text-sm text-white">{String(getField(lead, 'vehicle') || '')}</p>
                </div>
                <div>
                  <p className="text-xs text-[#5C677D] mb-1">Preferred Date</p>
                  <p className="text-sm text-white">{formatDate(String(getField(lead, 'preferredDate') || ''))}</p>
                </div>
                <div>
                  <p className="text-xs text-[#5C677D] mb-1">Preferred Time</p>
                  <p className="text-sm text-white">{String(getField(lead, 'preferredTime') || '')}</p>
                </div>
              </div>
            </div>
          )}

          {lead.type === 'finance' && (
            <div className="glass rounded-xl p-4">
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#0077B6]" />
                Finance Details
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-[#5C677D] mb-1">Vehicle</p>
                  <p className="text-sm text-white">{String(getField(lead, 'vehicle') || '')}</p>
                </div>
                <div>
                  <p className="text-xs text-[#5C677D] mb-1">Amount</p>
                  <p className="text-sm text-[#00C896] font-semibold">
                    £{formatNumber(getField(lead, 'amount'))}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[#5C677D] mb-1">Term</p>
                  <p className="text-sm text-white">{formatNumber(getField(lead, 'term'))} months</p>
                </div>
                <div>
                  <p className="text-xs text-[#5C677D] mb-1">Employment</p>
                  <p className="text-sm text-white">{String(getField(lead, 'employmentStatus') || '')}</p>
                </div>
                <div>
                  <p className="text-xs text-[#5C677D] mb-1">Annual Income</p>
                  <p className="text-sm text-white">£{formatNumber(getField(lead, 'income'))}</p>
                </div>
                <div>
                  <p className="text-xs text-[#5C677D] mb-1">Credit Rating</p>
                  <p className="text-sm text-white capitalize">{String(getField(lead, 'creditRating') || '')}</p>
                </div>
              </div>
            </div>
          )}

          {/* Status Timeline */}
          <div className="glass rounded-xl p-4">
            <h3 className="text-sm font-semibold text-white mb-3">Status Timeline</h3>
            <div className="flex items-center gap-2">
              {statusOptions.map((s, i) => {
                const isActive = s === leadStatus;
                const isPast = statusOptions.indexOf(s) < statusOptions.indexOf(leadStatus);
                return (
                  <div key={s} className="flex items-center gap-2 flex-1">
                    <div className="flex flex-col items-center flex-1">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border ${
                          isActive
                            ? 'bg-[#0077B6]/30 border-[#0077B6] text-white'
                            : isPast
                            ? 'bg-[#00C896]/20 border-[#00C896] text-[#00C896]'
                            : 'bg-[#33415C]/30 border-[#33415C] text-[#5C677D]'
                        }`}
                      >
                        {isPast ? <Check className="w-4 h-4" /> : i + 1}
                      </div>
                      <span
                        className={`text-[10px] mt-1.5 capitalize text-center ${
                          isActive ? 'text-white font-medium' : isPast ? 'text-[#00C896]' : 'text-[#5C677D]'
                        }`}
                      >
                        {getStatusLabel(s)}
                      </span>
                    </div>
                    {i < statusOptions.length - 1 && (
                      <div
                        className={`h-0.5 flex-1 mb-4 ${
                          isPast ? 'bg-[#00C896]/40' : 'bg-[#33415C]/30'
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="glass rounded-xl p-4 space-y-4">
            <h3 className="text-sm font-semibold text-white">Actions</h3>

            {/* Status Change */}
            <div>
              <label className="text-xs text-[#5C677D] block mb-1.5">Change Status</label>
              <select
                value={leadStatus}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="w-full h-10 px-3 rounded-lg text-sm text-white glass-input appearance-none cursor-pointer"
              >
                {statusOptions.map((s) => (
                  <option key={s} value={s} className="bg-[#001233] text-white">
                    {getStatusLabel(s)}
                  </option>
                ))}
              </select>
            </div>

            {/* Assign To */}
            <div>
              <label className="text-xs text-[#5C677D] block mb-1.5">Assign To</label>
              <select
                value={leadAssigned}
                onChange={(e) => handleAssignChange(e.target.value)}
                className="w-full h-10 px-3 rounded-lg text-sm text-white glass-input appearance-none cursor-pointer"
              >
                {staffMembers.map((s) => (
                  <option key={s} value={s} className="bg-[#001233] text-white">
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* Quick Buttons */}
            <div className="flex gap-2 pt-2">
              <button className="flex-1 flex items-center justify-center gap-2 h-9 rounded-lg bg-[#0077B6]/20 text-[#00B4D8] text-xs font-medium hover:bg-[#0077B6]/30 transition-colors border border-[#0077B6]/30">
                <Mail className="w-3.5 h-3.5" />
                Reply
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 h-9 rounded-lg bg-[#00C896]/20 text-[#00C896] text-xs font-medium hover:bg-[#00C896]/30 transition-colors border border-[#00C896]/30">
                <Phone className="w-3.5 h-3.5" />
                Call
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 h-9 rounded-lg bg-purple-500/20 text-purple-400 text-xs font-medium hover:bg-purple-500/30 transition-colors border border-purple-500/30">
                <Calendar className="w-3.5 h-3.5" />
                Schedule
              </button>
            </div>
          </div>

          {/* Notes */}
          <div className="glass rounded-xl p-4 space-y-3">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#0077B6]" />
              Internal Notes
            </h3>
            {leadNotes && (
              <div className="bg-[#001233]/50 rounded-lg p-3 max-h-[200px] overflow-y-auto">
                <p className="text-sm text-[#C8D3D9] whitespace-pre-line">{leadNotes}</p>
              </div>
            )}
            <div className="flex gap-2">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add a note..."
                rows={3}
                className="flex-1 px-3 py-2 rounded-lg text-sm text-white placeholder:text-[#5C677D] glass-input resize-none"
              />
            </div>
            <button
              onClick={handleSaveNotes}
              disabled={!notes.trim()}
              className="flex items-center justify-center gap-2 w-full h-9 rounded-lg bg-[#0077B6] text-white text-xs font-medium hover:bg-[#0077B6]/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Save className="w-3.5 h-3.5" />
              Save Note
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
