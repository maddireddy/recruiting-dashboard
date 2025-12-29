import React, { useState } from 'react';
import { schedulingApi, type CreateAvailabilityLinkRequest } from '../../api/schedulingApi';
import { useSchedulingStore } from '../../store/schedulingStore';
import Field from '../../components/ui/Field';
import { z } from 'zod';

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
  const [errors, setErrors] = useState<{ title?: string; duration?: string; bufferTime?: string; timezone?: string; maxBookingsPerDay?: string; dateRange?: string; availability?: string }>(
    {}
  );

  const schema = z.object({
    title: z.string().min(1, 'Link title is required'),
    duration: z.enum(['15','30','45','60','90']).transform((v) => Number(v)),
    bufferTime: z.enum(['0','15','30','45']).transform((v) => Number(v)),
    timezone: z.enum(TIMEZONES as unknown as readonly [string, ...string[]]),
    maxBookingsPerDay: z.number().min(1, 'Min 1').max(20, 'Max 20'),
    dateRange: z.object({
      startDate: z.string().min(1, 'Start date required'),
      endDate: z.string().min(1, 'End date required'),
    }).refine((dr) => new Date(dr.endDate) >= new Date(dr.startDate), {
      message: 'End date must be after start date',
      path: ['endDate'],
    }),
    availability: z.record(
      z.array(
        z.object({
          start: z.string(),
          end: z.string(),
        }).refine((slot) => slot.end > slot.start, { message: 'End must be after start' })
      )
    ),
  }).refine((values) => Object.values(values.availability).some((slots) => slots.length > 0), {
    message: 'Provide at least one time slot',
    path: ['availability'],
  });

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
    setErrors({});

    try {
      const parsed = schema.safeParse({
        title,
        duration: String(duration) as any,
        bufferTime: String(bufferTime) as any,
        timezone,
        availability,
        dateRange,
        maxBookingsPerDay,
      });
      if (!parsed.success) {
        const next: typeof errors = {};
        for (const issue of parsed.error.issues) {
          const key = issue.path[0] as keyof typeof errors;
          next[key] = issue.message;
        }
        setErrors(next);
        setLoading(false);
        return;
      }
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
    <div className="content-container mx-auto max-w-4xl">
      <h2 className="text-2xl font-semibold mb-6 text-[rgb(var(--app-text-primary))]">Create Scheduling Link</h2>

      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Link Title" htmlFor="link-title" error={errors.title}>
            <input id="link-title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="input" placeholder="Technical Interview - Senior Developer" aria-invalid={!!errors.title} aria-describedby={errors.title ? 'link-title-error' : undefined} />
          </Field>

          <Field label="Timezone" htmlFor="timezone" error={errors.timezone}>
            <select id="timezone" value={timezone} onChange={(e) => setTimezone(e.target.value as (typeof TIMEZONES)[number])} className="input" aria-invalid={!!errors.timezone} aria-describedby={errors.timezone ? 'timezone-error' : undefined}>
              {TIMEZONES.map((tz) => (
                <option key={tz} value={tz}>{tz}</option>
              ))}
            </select>
          </Field>
        </div>

        {/* Duration Settings */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Field label="Duration (minutes)" htmlFor="duration" error={errors.duration}>
            <select id="duration" value={duration} onChange={(e) => setDuration(Number(e.target.value))} className="input" aria-invalid={!!errors.duration} aria-describedby={errors.duration ? 'duration-error' : undefined}>
              <option value={15}>15 min</option>
              <option value={30}>30 min</option>
              <option value={45}>45 min</option>
              <option value={60}>60 min</option>
              <option value={90}>90 min</option>
            </select>
          </Field>

          <Field label="Buffer Time (minutes)" htmlFor="buffer" error={errors.bufferTime}>
            <select id="buffer" value={bufferTime} onChange={(e) => setBufferTime(Number(e.target.value))} className="input" aria-invalid={!!errors.bufferTime} aria-describedby={errors.bufferTime ? 'buffer-error' : undefined}>
              <option value={0}>0 min</option>
              <option value={15}>15 min</option>
              <option value={30}>30 min</option>
              <option value={45}>45 min</option>
            </select>
          </Field>

          <Field label="Max/Day" htmlFor="maxBookings" error={errors.maxBookingsPerDay}>
            <input id="maxBookings" type="number" value={maxBookingsPerDay} onChange={(e) => setMaxBookingsPerDay(Number(e.target.value))} min={1} max={20} className="input" aria-invalid={!!errors.maxBookingsPerDay} aria-describedby={errors.maxBookingsPerDay ? 'maxBookings-error' : undefined} />
          </Field>
        </div>

        {/* Date Range */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Start Date" htmlFor="startDate" error={errors.dateRange}>
            <input id="startDate" type="date" value={dateRange.startDate} onChange={(e) => setDateRange((prev) => ({ ...prev, startDate: e.target.value }))} className="input" />
          </Field>
          <Field label="End Date" htmlFor="endDate" error={errors.dateRange}>
            <input id="endDate" type="date" value={dateRange.endDate} onChange={(e) => setDateRange((prev) => ({ ...prev, endDate: e.target.value }))} className="input" />
          </Field>
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
                        className="input"
                      />
                      <span>to</span>
                      <input
                        type="time"
                        value={slot.end}
                        onChange={(e) => updateTimeSlot(day, index, 'end', e.target.value)}
                        className="input"
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
                    <p className="text-muted text-sm">Unavailable</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Custom Message */}
        <Field label="Custom Message (Optional)" htmlFor="customMessage">
          <textarea id="customMessage" value={customMessage} onChange={(e) => setCustomMessage(e.target.value)} rows={3} className="input" placeholder="Looking forward to speaking with you!" />
        </Field>

        {/* Submit */}
        <button type="submit" className="btn-primary w-full">Create Scheduling Link</button>
      </form>
    </div>
  );
};

export default AvailabilityLinkCreator;
