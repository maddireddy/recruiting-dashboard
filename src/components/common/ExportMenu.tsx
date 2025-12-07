import { Fragment, type ComponentType } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { Download, FileSpreadsheet, Users, Briefcase, Send, FileText } from 'lucide-react';
import { reportService } from '../../services/report.service';
import { proCandidateExportService } from '../../services/proCandidateExport.service';
import toast from 'react-hot-toast';

type ExportOption = {
  id: string;
  label: string;
  description: string;
  icon: ComponentType<{ size?: number }>;
  action: () => Promise<void> | void;
};

const exportOptions: ExportOption[] = [
  {
    id: 'candidates-portfolio',
    label: 'Candidates Portfolio (PDF)',
    description: 'Presentation-ready talent brief matching your app aesthetic',
    icon: Users,
    action: () => proCandidateExportService.exportPortfolio(),
  },
  {
    id: 'candidates',
    label: 'Candidates CSV (Raw)',
    description: 'Spreadsheet export for analytics & data warehousing',
    icon: FileText,
    action: () => reportService.exportCandidatesCSV(),
  },
  {
    id: 'jobs',
    label: 'Jobs CSV',
    description: 'All open and closed job requisitions',
    icon: Briefcase,
    action: () => reportService.exportJobsCSV(),
  },
  {
    id: 'submissions',
    label: 'Submissions CSV',
    description: 'Pipeline view of candidate submissions',
    icon: Send,
    action: () => reportService.exportSubmissionsCSV(),
  },
  {
    id: 'reports',
    label: 'Custom Reports',
    description: 'Navigate to reports workspace for advanced exports',
    icon: FileSpreadsheet,
    action: () => {
      toast('Navigate to Reports to run bespoke exports', {
        icon: '🧮',
      });
      window.open('/reports', '_self');
    },
  },
] as const;

export default function ExportMenu() {
  const handleAction = async (action: () => Promise<void> | void) => {
    const dismiss = toast.loading('Preparing export...');
    try {
      await action();
      toast.dismiss(dismiss);
      toast.success('Export ready. Check your downloads.', { id: `${Date.now()}-export-success` });
    } catch (error) {
      toast.dismiss(dismiss);
      const message = error instanceof Error ? error.message : 'Export failed';
      toast.error(message);
    }
  };

  return (
    <Menu as="div" className="relative inline-block text-left">
      <Menu.Button className="btn-muted">
        <Download size={16} />
        Export
      </Menu.Button>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-150"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-100"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="glass-effect absolute right-0 z-20 mt-2 w-72 origin-top-right border-none p-2 shadow-xl focus:outline-none">
          {exportOptions.map((option) => {
            const Icon = option.icon;
            return (
              <Menu.Item key={option.id}>
                {({ active }) => (
                  <button
                    type="button"
                    onClick={() => void handleAction(option.action)}
                    className={`flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left transition ${
                      active ? 'bg-[rgb(var(--app-surface-muted))] text-[rgb(var(--app-text-primary))]' : 'text-[rgb(var(--app-text-secondary))]'
                    }`}
                  >
                    <span className="mt-1 flex h-9 w-9 items-center justify-center rounded-lg border border-[rgba(var(--app-border-subtle))] bg-[rgb(var(--app-surface))] text-[rgb(var(--app-text-secondary))]">
                      <Icon size={18} />
                    </span>
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-[rgb(var(--app-text-primary))]">{option.label}</span>
                      <span className="mt-1 text-xs text-[rgb(var(--app-text-secondary))]">{option.description}</span>
                    </div>
                  </button>
                )}
              </Menu.Item>
            );
          })}
        </Menu.Items>
      </Transition>
    </Menu>
  );
}
