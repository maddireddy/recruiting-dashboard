import React, { useEffect, useState } from 'react';
import { schedulingApi } from '../../api/schedulingApi';
import { useSchedulingStore } from '../../store/schedulingStore';

export const SchedulingDashboard: React.FC = () => {
  const { availabilityLinks, bookedSlots, setAvailabilityLinks, setBookedSlots } = useSchedulingStore();
  const [activeTab, setActiveTab] = useState<'links' | 'bookings'>('links');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [links, bookings] = await Promise.all([
        schedulingApi.getMyLinks(),
        schedulingApi.getMyBookings(),
      ]);

      setAvailabilityLinks(links);
      setBookedSlots(bookings);
    } catch (err) {
      console.error('Failed to fetch scheduling data:', err);
    }
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    alert('Link copied to clipboard!');
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Interview Scheduling</h1>
        <a href="/scheduling/create" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
          + Create New Link
        </a>
      </div>

      {/* Tabs */}
      <div className="border-b mb-6">
        <button
          onClick={() => setActiveTab('links')}
          className={`px-6 py-3 font-medium ${activeTab === 'links' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
        >
          My Scheduling Links ({availabilityLinks.length})
        </button>
        <button
          onClick={() => setActiveTab('bookings')}
          className={`px-6 py-3 font-medium ${activeTab === 'bookings' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
        >
          Upcoming Interviews ({bookedSlots.length})
        </button>
      </div>

      {/* Content */}
      {activeTab === 'links' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {availabilityLinks.map((link) => (
            <div key={link.id} className="bg-white rounded-lg shadow p-6">
              <h3 className="font-semibold text-lg mb-2">{link.title}</h3>
              <p className="text-sm text-gray-600 mb-4">
                {link.duration} minutes • {link.timezone}
              </p>

              <div className="bg-gray-50 rounded p-3 mb-4">
                <p className="text-xs text-gray-600 mb-1">Share this link:</p>
                <div className="flex items-center gap-2">
                  <code className="text-sm flex-1 truncate">{link.publicUrl}</code>
                  <button onClick={() => copyToClipboard(link.publicUrl)} className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                    Copy
                  </button>
                </div>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-gray-600">{link.totalBookings} bookings</span>
                <span className={`font-medium ${link.isActive ? 'text-green-600' : 'text-gray-400'}`}>{link.isActive ? 'Active' : 'Inactive'}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {bookedSlots.map((booking) => (
            <div key={booking.id} className="bg-white rounded-lg shadow p-6 flex items-center gap-6">
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{booking.candidateName}</h3>
                <p className="text-sm text-gray-600">{booking.candidateEmail}</p>
                <p className="text-sm text-gray-500 mt-2">{new Date(booking.startTime).toLocaleString()}</p>
              </div>

              <div className="text-right">
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${booking.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                  {booking.status}
                </span>
                <a href={booking.meetingLink} target="_blank" rel="noopener noreferrer" className="block mt-2 text-blue-600 hover:underline text-sm">
                  Join Meeting →
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SchedulingDashboard;
