import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { schedulingApi, type AvailableSlot } from '../../api/schedulingApi';

const TIMEZONES = [
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Europe/London',
  'Asia/Kolkata',
] as const;

export const SlotSelector: React.FC = () => {
  const { linkId } = useParams<{ linkId: string }>();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null);
  const [loading, setLoading] = useState(false);
  const [booked, setBooked] = useState(false);

  // Candidate info
  const [candidateName, setCandidateName] = useState('');
  const [candidateEmail, setCandidateEmail] = useState('');
  const [candidatePhone, setCandidatePhone] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (linkId) {
      fetchAvailableSlots();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [linkId, selectedDate, timezone]);

  const fetchAvailableSlots = async () => {
    setLoading(true);
    try {
      const slots = await schedulingApi.getAvailableSlots(linkId!, selectedDate, timezone);
      setAvailableSlots(slots);
    } catch (err) {
      console.error('Failed to fetch slots:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async () => {
    if (!selectedSlot) return;

    try {
      await schedulingApi.bookSlot({
        linkId: linkId!,
        candidateId: 'temp_' + Date.now(), // or from authenticated user
        candidateName,
        candidateEmail,
        candidatePhone,
        startTime: selectedSlot.startTime,
        timezone,
        notes,
      });
      setBooked(true);
      alert('Interview scheduled successfully! Check your email for confirmation.');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to book slot');
    }
  };

  const downloadICS = () => {
    if (!selectedSlot) return;
    const start = new Date(selectedSlot.startTime);
    const end = new Date(start.getTime() + 30 * 60 * 1000);
    const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Recruiting Dashboard//EN',
      'BEGIN:VEVENT',
      `DTSTART:${fmt(start)}`,
      `DTEND:${fmt(end)}`,
      `SUMMARY:Interview - ${candidateName || 'Candidate'}`,
      `DESCRIPTION:${notes || ''}`,
      `UID:${linkId}-${selectedSlot.startTime}`,
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\n');
    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'interview.ics';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Schedule Your Interview</h1>

      {/* Step 1: Select Date & Time */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">1. Choose Date & Time</h2>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-2">Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Your Timezone</label>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
            >
              {TIMEZONES.map((tz) => (
                <option key={tz} value={tz}>{tz}</option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <p className="text-center py-8">Loading available slots...</p>
        ) : availableSlots.length === 0 ? (
          <p className="text-center py-8 text-gray-500">No slots available for this date. Please try another day.</p>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {availableSlots.map((slot, index) => (
              <button
                key={index}
                onClick={() => setSelectedSlot(slot)}
                className={`px-4 py-3 border rounded-lg text-center transition ${
                  selectedSlot?.startTime === slot.startTime
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'hover:border-blue-600 hover:bg-blue-50'
                }`}
              >
                {slot.displayTime}
              </button>
            ))}
          </div>
        )}
        <div className="mt-4 flex justify-between">
          <button
            className="px-3 py-2 rounded border"
            onClick={() => {
              // find next available date with slots by stepping days forward up to 14 days
              const start = new Date(selectedDate);
              for (let i = 1; i <= 14; i++) {
                const d = new Date(start);
                d.setDate(start.getDate() + i);
                const next = d.toISOString().split('T')[0];
                setSelectedDate(next);
                break;
              }
            }}
          >
            Next Available Day
          </button>
        </div>
      </div>

      {/* Step 2: Enter Details */}
      {selectedSlot && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">2. Your Information</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Full Name *</label>
              <input
                type="text"
                value={candidateName}
                onChange={(e) => setCandidateName(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Email *</label>
              <input
                type="email"
                value={candidateEmail}
                onChange={(e) => setCandidateEmail(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Phone</label>
              <input
                type="tel"
                value={candidatePhone}
                onChange={(e) => setCandidatePhone(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Additional Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border rounded-lg"
                placeholder="Anything you'd like us to know..."
              />
            </div>

            <button
              onClick={handleBooking}
              disabled={!candidateName || !candidateEmail}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Confirm Booking
            </button>
            {booked && (
              <button
                type="button"
                onClick={downloadICS}
                className="w-full mt-2 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition"
              >
                Add to Calendar (ICS)
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SlotSelector;
