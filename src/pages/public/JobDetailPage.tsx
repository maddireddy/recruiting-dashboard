import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Briefcase, ArrowLeft } from 'lucide-react';

interface JobDetail {
  id: string;
  title: string;
  location: string;
  type: string;
  description: string;
}

export const JobDetailPage = () => {
  const { tenantSlug, jobId } = useParams();
  const [job, setJob] = useState<JobDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Use relative /api for compatibility with dev proxy
    fetch(`/api/public/careers/${tenantSlug}/jobs/${jobId}`)
      .then((res) => res.json())
      .then((data) => setJob(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [tenantSlug, jobId]);

  if (loading) return <div className="p-10 text-center">Loading job...</div>;
  if (!job) return <div className="p-10 text-center">Job not found.</div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <Link to={`/careers/${tenantSlug}`} className="inline-flex items-center gap-2 text-blue-600 hover:underline">
        <ArrowLeft className="h-4 w-4" /> Back to Jobs
      </Link>

      <div className="mt-4 rounded-xl border bg-white p-6">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">{job.title}</h1>
        <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
          <span className="flex items-center gap-1">
            <MapPin className="w-4 h-4" /> {job.location}
          </span>
          <span className="flex items-center gap-1">
            <Briefcase className="w-4 h-4" /> {job.type}
          </span>
        </div>
        <div className="prose max-w-none">
          <p className="text-gray-700 whitespace-pre-line">{job.description}</p>
        </div>
      </div>
    </div>
  );
};

export default JobDetailPage;
