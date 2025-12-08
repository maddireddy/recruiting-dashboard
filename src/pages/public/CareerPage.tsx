import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Briefcase, Clock, ChevronRight } from 'lucide-react';

// Types
interface Job {
  id: string;
  title: string;
  location: string;
  type: string;
  description: string;
}

export const CareerPage = () => {
  const { tenantSlug } = useParams();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Use relative /api for compatibility with Vite dev proxy and production baseURL
    fetch(`/api/public/careers/${tenantSlug}/jobs`)
      .then((res) => res.json())
      .then((data) => setJobs(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [tenantSlug]);

  if (loading) return <div className="p-10 text-center">Loading careers...</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4 capitalize">
          Join the {tenantSlug} Team
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          We are looking for talented individuals to help us build the future.
          Check out our open positions below.
        </p>
      </div>

      <div className="space-y-4">
        {jobs.length === 0 ? (
          <div className="text-center p-8 bg-white rounded-lg border">
            No open positions at the moment.
          </div>
        ) : (
          jobs.map((job) => (
            <Link
              key={job.id}
              to={`/careers/${tenantSlug}/jobs/${job.id}`}
              className="block group bg-white p-6 rounded-xl border hover:border-blue-500 hover:shadow-md transition-all"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 mb-2">
                    {job.title}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" /> {job.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Briefcase className="w-4 h-4" /> {job.type}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" /> Posted recently
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-blue-500" />
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
};

export default CareerPage;
