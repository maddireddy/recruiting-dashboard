import React, { useState } from 'react';
import { schedulingApi, type CreateAvailabilityLinkRequest } from '../../api/schedulingApi';
import { useSchedulingStore } from '../../store/schedulingStore';

const DAYS_OF_WEEK = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;
const TIMEZONES = [
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Europe/London',
  'Asia/Kolkata',
] as const;

export const AvailabilityLinkCreator: React.FC = () => {
  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState(60);
  const [bufferTime, setBufferTime] = useState(15);
  const [timezone, setTimezone] = useState<(typeof TIMEZONES)[number]>('America/New_York');
  const [maxBookingsPerDay, setMaxBookingsPerDay] = useState(5);
  const [customMessage, setCustomMessage] = useState('');
  const [dateRange, setDateRange] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });

  const [availability, setAvailability] = useState<Record<string, Array<{ start: string; end: string }>>>(
    {
      monday: [{ start: '09:00', end: '17:00' }],
      tuesday: [{ start: '09:00', end: '17:00' }],
      wednesday: [{ start: '09:00', end: '17:00' }],
      thursday: [{ start: '09:00', end: '17:00' }],
      friday: [{ start: '09:00', end: '17:00' }],
      saturday: [],
      sunday: [],
    }
  );

  const { setLoading, setError } = useSchedulingStore();

  const addTimeSlot = (day: string) => {
    setAvailability((prev) => ({
      ...prev,
      [day]: [...prev[day], { start: '09:00', end: '17:00' }],
    }));
  };

  const removeTimeSlot = (day: string, index: number) => {
    setAvailability((prev) => ({
      ...prev,
      [day]: prev[day].filter((_, i) => i !== index),
    }));
  };

  const updateTimeSlot = (day: string, index: number, field: 'start' | 'end', value: string) => {
    setAvailability((prev) => ({
      ...prev,
      [day]: prev[day].map((slot, i) => (i === index ? { ...slot, [field]: value } : slot)),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const request: CreateAvailabilityLinkRequest = {
        title,
        duration,
        bufferTime,
        timezone,
        availability,
        dateRange,
        maxBookingsPerDay,
        customMessage,
      };

      const response = await schedulingApi.createAvailabilityLink(request);

      alert(`Scheduling link created! Share this URL:\n${response.publicUrl}`);
      // Reset form or redirect
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create scheduling link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6">Create Scheduling Link</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Link Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Technical Interview - Senior Developer"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Timezone</label>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value as (typeof TIMEZONES)[number])}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {TIMEZONES.map((tz) => (
                <option key={tz} value={tz}>{tz}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Duration Settings */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Duration (minutes)</label>
            <select
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-full px-4 py-2 border rounded-lg"
            >
              <option value={15}>15 min</option>
              <option value={30}>30 min</option>
              <option value={45}>45 min</option>
              <option value={60}>60 min</option>
              <option value={90}>90 min</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Buffer Time (minutes)</label>
            <select
              value={bufferTime}
              onChange={(e) => setBufferTime(Number(e.target.value))}
              className="w-full px-4 py-2 border rounded-lg"
            >
              <option value={0}>0 min</option>
              <option value={15}>15 min</option>
              <option value={30}>30 min</option>
              <option value={45}>45 min</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Max/Day</label>
            <input
              type="number"
              value={maxBookingsPerDay}
              onChange={(e) => setMaxBookingsPerDay(Number(e.target.value))}
              min={1}
              max={20}
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>
        </div>

        {/* Date Range */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Start Date</label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange((prev) => ({ ...prev, startDate: e.target.value }))}
              className="w-full px-4 py-2 border rounded-lg"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">End Date</label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange((prev) => ({ ...prev, endDate: e.target.value }))}
              className="w-full px-4 py-2 border rounded-lg"
              required
            />
          </div>
        </div>

        {/* Weekly Availability */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Weekly Availability</h3>
          <div className="space-y-4">
            {DAYS_OF_WEEK.map((day) => (
              <div key={day} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-medium capitalize">{day}</span>
                  <button
                    type="button"
                    onClick={() => addTimeSlot(day)}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    + Add Time Slot
                  </button>
                </div>

                <div className="space-y-2">
                  {availability[day]?.map((slot, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <input
                        type="time"
                        value={slot.start}
                        onChange={(e) => updateTimeSlot(day, index, 'start', e.target.value)}
                        className="px-3 py-2 border rounded"
                      />
                      <span>to</span>
                      <input
                        type="time"
                        value={slot.end}
                        onChange={(e) => updateTimeSlot(day, index, 'end', e.target.value)}
                        className="px-3 py-2 border rounded"
                      />
                      <button
                        type="button"
                        onClick={() => removeTimeSlot(day, index)}
                        className="text-red-600 hover:text-red-800 ml-auto"
                      >
                        Remove
                      </button>
                    </div>
                  ))}

                  {(!availability[day] || availability[day].length === 0) && (
                    <p className="text-gray-500 text-sm">Unavailable</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Custom Message */}
        <div>
          <label className="block text-sm font-medium mb-2">Custom Message (Optional)</label>
          <textarea
            value={customMessage}
            onChange={(e) => setCustomMessage(e.target.value)}
            rows={3}
            className="w-full px-4 py-2 border rounded-lg"
            placeholder="Looking forward to speaking with you!"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          Create Scheduling Link
        </button>
      </form>
    </div>
  );
};

export default AvailabilityLinkCreator;
