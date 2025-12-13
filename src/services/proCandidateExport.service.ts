import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { candidateService } from './candidate.service';
import { jobService } from './job.service';
import { submissionService } from './submission.service';
import type { Candidate } from '../types/candidate';
import type { Job } from '../types/job';
import type { Submission } from '../types/submission';

const primaryPalette = {
  emerald: [16, 185, 129] as [number, number, number],
  emeraldDeep: [4, 120, 87] as [number, number, number],
  emeraldSoft: [236, 253, 245] as [number, number, number],
  slatePrimary: [15, 23, 42] as [number, number, number],
  slateSecondary: [71, 85, 105] as [number, number, number],
  skyAccent: [14, 165, 233] as [number, number, number],
};

type PipelineStat = {
  label: string;
  value: string;
  helper?: string;
};

type FrequencyMap = Record<string, number>;

const safeString = (value?: string | null) => (value && value.trim().length ? value.trim() : '—');

const formatDate = (value?: string | null, options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' }) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('en-US', options).format(date);
};

const formatExperience = (value?: number | null) => {
  if (value === undefined || value === null || Number.isNaN(value)) return 'N/A';
  if (value === 0) return 'New Grad';
  if (value < 1) return `${(value * 12).toFixed(0)} mo`;
  return `${Number(value).toFixed(1).replace(/\.0$/, '')} yrs`;
};

const formatExperienceRange = (min?: number | null, max?: number | null) => {
  const hasMin = typeof min === 'number' && !Number.isNaN(min);
  const hasMax = typeof max === 'number' && !Number.isNaN(max);
  if (!hasMin && !hasMax) return '—';
  if (hasMin && hasMax) {
    return `${formatExperience(min)} – ${formatExperience(max)}`;
  }
  if (hasMin) return `From ${formatExperience(min)}`;
  return `Up to ${formatExperience(max)}`;
};

const formatCurrency = (amount?: number | null, currency = 'USD', maximumFractionDigits = 0) => {
  if (typeof amount !== 'number' || Number.isNaN(amount)) return '—';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits }).format(amount);
};

const formatRateRange = (min?: number | null, max?: number | null, currency?: string | null) => {
  const hasMin = typeof min === 'number' && !Number.isNaN(min);
  const hasMax = typeof max === 'number' && !Number.isNaN(max);
  const resolvedCurrency = currency ?? 'USD';
  if (!hasMin && !hasMax) return '—';
  if (hasMin && hasMax) {
    return `${formatCurrency(min, resolvedCurrency)} – ${formatCurrency(max, resolvedCurrency)}`;
  }
  if (hasMin) return `From ${formatCurrency(min, resolvedCurrency)}`;
  return `Up to ${formatCurrency(max, resolvedCurrency)}`;
};

const formatPercentage = (portion: number, total: number) => {
  if (!total) return '0%';
  return `${Math.round((portion / total) * 100)}%`;
};

const formatAvailability = (candidate: Candidate) => {
  const { availability, availableFrom } = candidate;
  if (availability) return availability;
  if (availableFrom) {
    const date = new Date(availableFrom);
    if (!Number.isNaN(date.getTime())) {
      return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
    }
  }
  return 'TBD';
};

const formatLocation = (candidate: Candidate) => {
  const rawLocation = (candidate as Candidate & { currentLocation?: unknown }).currentLocation;
  if (typeof rawLocation === 'string' && rawLocation.trim()) {
    return rawLocation.trim();
  }
  if (rawLocation && typeof rawLocation === 'object') {
    const { city, state, country } = rawLocation as { city?: string | null; state?: string | null; country?: string | null };
    const parts = [city, state, country].filter((part): part is string => typeof part === 'string' && part.trim().length > 0);
    if (parts.length) {
      return parts.join(', ');
    }
  }
  const tz = (candidate as Candidate & { timeZone?: string | null }).timeZone;
  if (tz && tz.trim()) {
    return tz.trim();
  }
  return '—';
};

const candidateStatusPalette = (status: string | null | undefined): { fill: [number, number, number]; text: [number, number, number] } => {
  const normalized = status?.toLowerCase() ?? '';
  if (normalized.includes('placed') || normalized.includes('offer')) {
    return { fill: [236, 253, 245], text: primaryPalette.emeraldDeep };
  }
  if (normalized.includes('interview')) {
    return { fill: [240, 249, 255], text: [30, 64, 175] };
  }
  if (normalized.includes('submitted')) {
    return { fill: [255, 247, 237], text: [180, 83, 9] };
  }
  if (normalized.includes('active') || normalized.includes('available')) {
    return { fill: [240, 253, 244], text: [22, 101, 52] };
  }
  if (normalized.includes('hold') || normalized.includes('inactive')) {
    return { fill: [254, 242, 242], text: [185, 28, 28] };
  }
  return { fill: [247, 250, 252], text: primaryPalette.slateSecondary };
};

const computePipelineStats = (candidates: Candidate[]): PipelineStat[] => {
  const total = candidates.length;
  const experienceValues = candidates
    .map((candidate) => candidate.totalExperience)
    .filter((value): value is number => typeof value === 'number' && !Number.isNaN(value));
  const averageExperience = experienceValues.length
    ? experienceValues.reduce((sum, value) => sum + value, 0) / experienceValues.length
    : null;

  const statusFrequency: FrequencyMap = {};
  const skillFrequency: FrequencyMap = {};

  candidates.forEach((candidate) => {
    if (candidate.status) {
      const key = candidate.status.toLowerCase();
      statusFrequency[key] = (statusFrequency[key] ?? 0) + 1;
    }

    [...(candidate.primarySkills ?? []), ...(candidate.secondarySkills ?? [])]
      .filter(Boolean)
      .forEach((skill) => {
        const normalized = skill!.toLowerCase();
        skillFrequency[normalized] = (skillFrequency[normalized] ?? 0) + 1;
      });
  });

  const topStatus = Object.entries(statusFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([status, count]) => ({ status, count }));

  const topSkills = Object.entries(skillFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([skill]) => skill);

  const formatLabel = (slug: string) => slug
    .split(' ')
    .map((token) => token.charAt(0).toUpperCase() + token.slice(1))
    .join(' ');

  const stats: PipelineStat[] = [
    {
      label: 'Total Candidates',
      value: total.toString(),
      helper: 'Across active talent pipeline',
    },
    {
      label: 'Average Tenure',
      value: averageExperience !== null ? formatExperience(averageExperience) : 'N/A',
      helper: experienceValues.length ? `${experienceValues.length} profiles with stated experience` : undefined,
    },
    {
      label: 'Top Skills',
      value: topSkills.length ? topSkills.map(formatLabel).join(' • ') : 'Diverse Skillset',
      helper: 'Derived from primary & secondary skills',
    },
  ];

  if (topStatus.length) {
    const overview = topStatus
      .map(({ status, count }) => `${formatLabel(status)} (${Math.round((count / Math.max(total, 1)) * 100)}%)`)
      .join('   ');
    stats.push({
      label: 'Pipeline Momentum',
      value: overview,
      helper: 'Snapshot of current candidate statuses',
    });
  }

  return stats;
};

const fetchAllCandidates = async () => {
  const pageSize = 200;
  let page = 0;
  const aggregated: Candidate[] = [];

  while (true) {
    const content = await candidateService.getAll(page, pageSize);
    aggregated.push(...(content as any));

    if (content.length < pageSize) {
      break;
    }

    page += 1;
    if (page >= 12) break; // guardrail for exceptionally large datasets
  }

  return aggregated;
};

const fetchAllJobs = async () => {
  const pageSize = 150;
  let page = 0;
  const aggregated: Job[] = [];

  while (true) {
    const content = await jobService.getAll(page, pageSize);
    aggregated.push(...content);

    if (content.length < pageSize) {
      break;
    }

    page += 1;
    if (page >= 12) break;
  }

  return aggregated;
};

const fetchAllSubmissions = async () => {
  const pageSize = 150;
  let page = 0;
  const aggregated: Submission[] = [];

  while (true) {
    const content = await submissionService.getAll(page, pageSize);
    aggregated.push(...content);

    if (content.length < pageSize) {
      break;
    }

    page += 1;
    if (page >= 12) break;
  }

  return aggregated;
};

const jobStatusPalette = (status: Job['status']): { fill: [number, number, number]; text: [number, number, number] } => {
  switch (status) {
    case 'OPEN':
      return { fill: [236, 253, 245], text: primaryPalette.emeraldDeep };
    case 'IN_PROGRESS':
      return { fill: [239, 246, 255], text: [37, 99, 235] };
    case 'INTERVIEW':
      return { fill: [240, 249, 255], text: [30, 64, 175] };
    case 'OFFERED':
      return { fill: [255, 251, 235], text: [180, 83, 9] };
    case 'CLOSED':
    default:
      return { fill: [248, 250, 252], text: primaryPalette.slateSecondary };
  }
};

const submissionStatusPalette = (status: Submission['status']): { fill: [number, number, number]; text: [number, number, number] } => {
  switch (status) {
    case 'SUBMITTED':
      return { fill: [239, 246, 255], text: [37, 99, 235] };
    case 'SHORTLISTED':
      return { fill: [237, 233, 254], text: [79, 70, 229] };
    case 'INTERVIEW_SCHEDULED':
      return { fill: [240, 249, 255], text: [30, 64, 175] };
    case 'INTERVIEWED':
      return { fill: [236, 252, 255], text: [12, 74, 110] };
    case 'OFFERED':
      return { fill: [236, 253, 245], text: primaryPalette.emeraldDeep };
    case 'REJECTED':
      return { fill: [254, 242, 242], text: [225, 29, 72] };
    case 'WITHDRAWN':
    default:
      return { fill: [250, 250, 250], text: [113, 113, 122] };
  }
};

const computeJobStats = (jobs: Job[]): PipelineStat[] => {
  const total = jobs.length;
  const active = jobs.filter((job) => job.status !== 'CLOSED').length;
  const closed = total - active;
  const averageOpenings = total ? jobs.reduce((sum, job) => sum + job.openings, 0) / total : 0;

  const clientFrequency: FrequencyMap = {};
  const engagementFrequency: FrequencyMap = {};

  jobs.forEach((job) => {
    if (job.client) {
      const key = job.client.toLowerCase();
      clientFrequency[key] = (clientFrequency[key] ?? 0) + 1;
    }
    engagementFrequency[job.jobType] = (engagementFrequency[job.jobType] ?? 0) + 1;
  });

  const topClients = Object.entries(clientFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([client]) => client
      .split(' ')
      .map((token) => token.charAt(0).toUpperCase() + token.slice(1))
      .join(' '))
    .join(' • ');

  const engagementMix = Object.entries(engagementFrequency)
    .map(([type, count]) => {
      const label = type === 'FULL_TIME' ? 'Full-Time' : type === 'CONTRACT' ? 'Contract' : 'Contract-to-Hire';
      return `${label} ${formatPercentage(count, Math.max(total, 1))}`;
    })
    .join('   ');

  return [
    {
      label: 'Active Reqs',
      value: `${active} / ${total}`,
      helper: `${closed} closed in backlog`,
    },
    {
      label: 'Avg Openings',
      value: averageOpenings ? averageOpenings.toFixed(1) : '0',
      helper: 'Headcount required per requisition',
    },
    {
      label: 'Top Clients',
      value: topClients || 'Diversified footprint',
      helper: 'Based on requisition count',
    },
    {
      label: 'Engagement Mix',
      value: engagementMix || 'Balanced spectrum',
      helper: 'Full-time vs contract distribution',
    },
  ];
};

const computeSubmissionStats = (submissions: Submission[]): PipelineStat[] => {
  const total = submissions.length;
  const active = submissions.filter((submission) => !['REJECTED', 'WITHDRAWN'].includes(submission.status)).length;
  const offers = submissions.filter((submission) => submission.status === 'OFFERED').length;
  const interviews = submissions.filter((submission) => ['INTERVIEW_SCHEDULED', 'INTERVIEWED', 'OFFERED'].includes(submission.status)).length;

  const rateValues = submissions.filter((submission) => typeof submission.proposedRate === 'number' && !Number.isNaN(submission.proposedRate));
  const averageRate = rateValues.length
    ? rateValues.reduce((sum, submission) => sum + (submission.proposedRate ?? 0), 0) / rateValues.length
    : null;
  const primaryCurrency = rateValues[0]?.rateCurrency ?? 'USD';

  const clientFrequency: FrequencyMap = {};
  submissions.forEach((submission) => {
    if (submission.client) {
      const key = submission.client.toLowerCase();
      clientFrequency[key] = (clientFrequency[key] ?? 0) + 1;
    }
  });

  const topClients = Object.entries(clientFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([client]) => client
      .split(' ')
      .map((token) => token.charAt(0).toUpperCase() + token.slice(1))
      .join(' '))
    .join(' • ');

  return [
    {
      label: 'Total Submissions',
      value: total.toString(),
      helper: `${active} active in play`,
    },
    {
      label: 'Interview Conversion',
      value: formatPercentage(interviews, Math.max(total, 1)),
      helper: `${interviews} progressed to interviews`,
    },
    {
      label: 'Offer Rate',
      value: formatPercentage(offers, Math.max(total, 1)),
      helper: `${offers} offers extended`,
    },
    {
      label: 'Avg Proposed Rate',
      value: averageRate !== null ? formatCurrency(averageRate, primaryCurrency, 2) : '—',
      helper: rateValues.length ? `Across ${rateValues.length} submissions` : undefined,
    },
    {
      label: 'Top Clients',
      value: topClients || 'Momentum building',
      helper: 'Submission volume concentration',
    },
  ];
};

const buildJobTable = (doc: jsPDF, generatedOn: string, jobs: Job[], startY: number) => {
  const marginX = 44;
  const engagementLabels: Record<Job['jobType'], string> = {
    FULL_TIME: 'Full-time',
    CONTRACT: 'Contract',
    CONTRACT_TO_HIRE: 'Contract-to-Hire',
  };

  autoTable(doc, {
    startY,
    margin: { left: marginX, right: marginX, top: 0, bottom: 48 },
    head: [[
      'Opportunity',
      'Client',
      'Location',
      'Engagement',
      'Status',
      'Pipeline Health',
    ]],
    body: jobs.map((job) => {
      const opportunityLines = [job.title];
      const experienceRange = formatExperienceRange(job.minExperience, job.maxExperience);
      if (experienceRange !== '—') {
        opportunityLines.push(`Experience: ${experienceRange}`);
      }
      const compensation = formatRateRange(job.rateMin, job.rateMax, job.rateCurrency);
      if (compensation !== '—') {
        opportunityLines.push(`Rate: ${compensation}`);
      }

      const pipelineSummary = [
        `Openings ${job.openings}`,
        `Subm. ${job.submissionsCount}`,
        `Interviews ${job.interviewsCount}`,
      ].join('  •  ');

      return [
        opportunityLines.join('\n'),
        job.client || '—',
        job.location || '—',
        engagementLabels[job.jobType],
        job.status,
        pipelineSummary,
      ];
    }),
    styles: {
      fillColor: [255, 255, 255],
      textColor: primaryPalette.slateSecondary,
      fontSize: 9.5,
      cellPadding: { top: 7, bottom: 7, left: 8, right: 8 },
      valign: 'middle',
      halign: 'left',
      lineColor: [229, 231, 235],
      lineWidth: 0.4,
    },
    headStyles: {
      fillColor: primaryPalette.emerald,
      textColor: [255, 255, 255],
      fontSize: 10.5,
      fontStyle: 'bold',
      halign: 'left',
      valign: 'middle',
      cellPadding: { top: 10, bottom: 10, left: 10, right: 10 },
      lineWidth: 0,
    },
    columnStyles: {
      3: { halign: 'center' },
      4: { halign: 'center' },
      5: { halign: 'center' },
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index === 4) {
        const palette = jobStatusPalette(data.cell.raw as Job['status']);
        data.cell.styles.fillColor = palette.fill;
        data.cell.styles.textColor = palette.text;
        data.cell.styles.fontStyle = 'bold';
      }
      if (data.section === 'body' && data.column.index === 5) {
        data.cell.styles.textColor = primaryPalette.slatePrimary;
        data.cell.styles.fontStyle = 'bold';
      }
    },
    didDrawPage: createFooterHook(doc, generatedOn, 'Hiring Insights'),
  });
};

const buildSubmissionTable = (doc: jsPDF, generatedOn: string, submissions: Submission[], startY: number) => {
  const marginX = 44;

  autoTable(doc, {
    startY,
    margin: { left: marginX, right: marginX, top: 0, bottom: 48 },
    head: [[
      'Candidate',
      'Opportunity',
      'Status',
      'Submitted',
      'Proposed Rate',
      'Last Touch',
    ]],
    body: submissions.map((submission) => {
      const opportunityLines = [submission.jobTitle || '—'];
      if (submission.client) {
        opportunityLines.push(submission.client);
      }
      const lastTouch = submission.interviewDate ?? submission.updatedAt ?? submission.submittedDate;
      return [
        submission.candidateName || '—',
        opportunityLines.join('\n'),
        submission.status,
        formatDate(submission.submittedDate),
        formatCurrency(submission.proposedRate, submission.rateCurrency ?? 'USD', 2),
        formatDate(lastTouch, { month: 'short', day: 'numeric' }),
      ];
    }),
    styles: {
      fillColor: [255, 255, 255],
      textColor: primaryPalette.slateSecondary,
      fontSize: 9.5,
      cellPadding: { top: 7, bottom: 7, left: 8, right: 8 },
      valign: 'middle',
      halign: 'left',
      lineColor: [229, 231, 235],
      lineWidth: 0.4,
    },
    headStyles: {
      fillColor: primaryPalette.emerald,
      textColor: [255, 255, 255],
      fontSize: 10.5,
      fontStyle: 'bold',
      halign: 'left',
      valign: 'middle',
      cellPadding: { top: 10, bottom: 10, left: 10, right: 10 },
      lineWidth: 0,
    },
    columnStyles: {
      2: { halign: 'center' },
      4: { halign: 'right' },
      5: { halign: 'center' },
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index === 2) {
        const palette = submissionStatusPalette(data.cell.raw as Submission['status']);
        data.cell.styles.fillColor = palette.fill;
        data.cell.styles.textColor = palette.text;
        data.cell.styles.fontStyle = 'bold';
      }
      if (data.section === 'body' && data.column.index === 4) {
        data.cell.styles.textColor = primaryPalette.slatePrimary;
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.halign = 'right';
      }
    },
    didDrawPage: createFooterHook(doc, generatedOn, 'Pipeline Health'),
  });
};

const drawHeroHeader = (
  doc: jsPDF,
  {
    generatedOn,
    title,
    summary,
    kicker,
  }: {
    generatedOn: string;
    title: string;
    summary: string;
    kicker?: string;
  },
) => {
  const pageWidth = doc.internal.pageSize.getWidth();
  const headerHeight = 140;

  doc.setFillColor(...primaryPalette.emerald);
  doc.rect(0, 0, pageWidth, headerHeight, 'F');

  doc.setFillColor(...primaryPalette.skyAccent);
  doc.rect(pageWidth * 0.45, 0, pageWidth * 0.55, headerHeight, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(28);
  doc.text(title, 44, 58);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  doc.text(`Generated ${generatedOn}`, 44, 86);
  if (kicker) {
    doc.text(kicker, 44, 104);
  }
  doc.text(summary, 44, kicker ? 122 : 104);
};

const drawStatsSection = (doc: jsPDF, stats: PipelineStat[], startY: number) => {
  const marginX = 44;
  const gap = 18;
  const availableWidth = doc.internal.pageSize.getWidth() - marginX * 2;
  const cardWidth = (availableWidth - gap * (Math.min(stats.length, 3) - 1)) / Math.min(stats.length, 3);
  const cardHeight = 96;

  stats.slice(0, 3).forEach((stat, index) => {
    const x = marginX + index * (cardWidth + gap);
    doc.setFillColor(...primaryPalette.emeraldSoft);
    doc.roundedRect(x, startY, cardWidth, cardHeight, 12, 12, 'F');
    doc.setDrawColor(200, 230, 214);
    doc.roundedRect(x, startY, cardWidth, cardHeight, 12, 12, 'S');

    doc.setTextColor(...primaryPalette.slateSecondary);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'medium');
    doc.text(stat.label.toUpperCase(), x + 16, startY + 24);

    doc.setTextColor(...primaryPalette.slatePrimary);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.text(stat.value, x + 16, startY + 54);

    if (stat.helper) {
      doc.setTextColor(...primaryPalette.slateSecondary);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      const lines = doc.splitTextToSize(stat.helper, cardWidth - 32);
      doc.text(lines, x + 16, startY + 74);
    }
  });

  if (stats.length > 3) {
    const stat = stats[3];
    const y = startY + cardHeight + 34;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(...primaryPalette.slatePrimary);
    doc.text(stat.label, marginX, y);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...primaryPalette.slateSecondary);
    doc.setFontSize(10);
    const lines = doc.splitTextToSize(stat.value, availableWidth);
    doc.text(lines, marginX, y + 18);
    if (stat.helper) {
      doc.setFontSize(9);
      doc.text(stat.helper, marginX, y + 36);
    }
  }
};

const createFooterHook = (doc: jsPDF, generatedOn: string, label = 'Confidential') => {
  return (data: { settings: { margin: { left: number; right: number } } }) => {
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...primaryPalette.slateSecondary);
    doc.setFontSize(9);
    doc.text(
      `${label} · ${generatedOn}`,
      data.settings.margin.left,
      pageHeight - 24,
    );
    doc.text(
      `Page ${doc.getNumberOfPages()}`,
      pageWidth - data.settings.margin.right,
      pageHeight - 24,
      { align: 'right' },
    );
  };
};

const buildCandidateTable = (doc: jsPDF, generatedOn: string, candidates: Candidate[], startY: number) => {
  const marginX = 44;
  const rows = candidates.map((candidate) => {
    const fullName = candidate.fullName || `${safeString(candidate.firstName)} ${safeString(candidate.lastName)}`.trim();
  const role = safeString(candidate.currentJobTitle ?? candidate.recruiterAssigned);
  const location = formatLocation(candidate);
    const status = safeString(candidate.status);
    const skills = [...(candidate.primarySkills ?? []), ...(candidate.secondarySkills ?? [])]
      .filter(Boolean)
      .slice(0, 4)
      .map((skill) => skill!.trim())
      .join(' • ');

    return {
      name: fullName,
      role,
      location,
      status,
      skills: skills || 'Skill set evolving',
      experience: formatExperience(candidate.totalExperience ?? candidate.relevantExperience),
      availability: formatAvailability(candidate),
    };
  });

  autoTable(doc, {
    startY,
    margin: { left: marginX, right: marginX, top: 0, bottom: 48 },
    head: [[
      'Candidate',
      'Current Focus',
      'Location / Timezone',
      'Status',
      'Core Strengths',
      'Experience',
      'Availability',
    ]],
    body: rows.map((row) => [row.name, row.role, row.location, row.status, row.skills, row.experience, row.availability]),
    styles: {
      fillColor: [255, 255, 255],
      textColor: primaryPalette.slateSecondary,
      fontSize: 9.5,
      cellPadding: { top: 7, bottom: 7, left: 8, right: 8 },
      valign: 'middle',
      halign: 'left',
      lineColor: [229, 231, 235],
      lineWidth: 0.4,
    },
    headStyles: {
      fillColor: primaryPalette.emerald,
      textColor: [255, 255, 255],
      fontSize: 10.5,
      fontStyle: 'bold',
      halign: 'left',
      valign: 'middle',
      cellPadding: { top: 10, bottom: 10, left: 10, right: 10 },
      lineWidth: 0,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index === 3) {
  const palette = candidateStatusPalette(String(data.cell.raw));
        data.cell.styles.fillColor = palette.fill;
        data.cell.styles.textColor = palette.text;
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.halign = 'center';
      }
      if (data.section === 'body' && data.column.index === 4) {
        data.cell.styles.textColor = primaryPalette.slatePrimary;
        data.cell.styles.fontStyle = 'bold';
      }
    },
    didDrawPage: createFooterHook(doc, generatedOn, 'Confidential'),
  });
};

const buildEmptyState = (
  doc: jsPDF,
  generatedOn: string,
  {
    headline,
    body,
  }: {
    headline: string;
    body: string;
  },
) => {
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryPalette.slatePrimary);
  doc.setFontSize(20);
  doc.text(headline, 44, 180);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...primaryPalette.slateSecondary);
  doc.setFontSize(12);
  const lines = doc.splitTextToSize(body, doc.internal.pageSize.getWidth() - 88);
  doc.text(lines, 44, 210);

  doc.text(`Generated ${generatedOn}`, 44, 260);
};

const exportCandidatesPortfolio = async () => {
  const candidates = await fetchAllCandidates();
  const generatedOn = new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date());

  const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });

  drawHeroHeader(doc, {
    generatedOn,
    title: 'Candidate Experience Portfolio',
    summary: `${candidates.length} candidates curated for your talent pipeline`,
    kicker: 'Your curated talent snapshot ready for executive review',
  });

  if (candidates.length === 0) {
    buildEmptyState(doc, generatedOn, {
      headline: 'No candidates found in your workspace yet.',
      body: 'Once candidates are added to the pipeline, you can download a curated, presentation-ready portfolio outlining their strengths, availability, and current momentum.',
    });
  } else {
    const stats = computePipelineStats(candidates);
    drawStatsSection(doc, stats, 160);
    buildCandidateTable(doc, generatedOn, candidates, stats.length > 3 ? 320 : 300);
  }

  const filename = `Candidate-Portfolio-${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
};

const exportJobsPortfolio = async () => {
  const jobs = await fetchAllJobs();
  const generatedOn = new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date());

  const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
  const active = jobs.filter((job) => job.status !== 'CLOSED').length;
  const closed = jobs.length - active;

  drawHeroHeader(doc, {
    generatedOn,
    title: 'Strategic Requirement Portfolio',
    summary: `${jobs.length} total requisitions • ${active} active • ${closed} closed`,
    kicker: 'Visibility into hiring velocity and demand mix',
  });

  if (jobs.length === 0) {
    buildEmptyState(doc, generatedOn, {
      headline: 'No requisitions available yet.',
      body: 'Once requisitions are created, you can download a polished PDF summarizing priority roles, engagement mix, and pipeline health for stakeholders.',
    });
  } else {
    const stats = computeJobStats(jobs);
    drawStatsSection(doc, stats, 160);
    buildJobTable(doc, generatedOn, jobs, stats.length > 3 ? 320 : 300);
  }

  const filename = `Job-Portfolio-${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
};

const exportSubmissionsPortfolio = async () => {
  const submissions = await fetchAllSubmissions();
  const generatedOn = new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date());

  const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
  const active = submissions.filter((submission) => !['REJECTED', 'WITHDRAWN'].includes(submission.status)).length;

  drawHeroHeader(doc, {
    generatedOn,
    title: 'Pipeline Submission Portfolio',
    summary: `${submissions.length} submissions logged • ${active} active in play`,
    kicker: 'Monitor conversion from submission to offer across clients',
  });

  if (submissions.length === 0) {
    buildEmptyState(doc, generatedOn, {
      headline: 'No submissions recorded yet.',
      body: 'Export a portfolio once candidates are submitted to requisitions to keep hiring managers aligned on momentum and conversion.',
    });
  } else {
    const stats = computeSubmissionStats(submissions);
    drawStatsSection(doc, stats, 160);
    buildSubmissionTable(doc, generatedOn, submissions, stats.length > 3 ? 330 : 300);
  }

  const filename = `Submission-Portfolio-${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
};

export const portfolioExportService = {
  exportCandidatesPortfolio,
  exportJobsPortfolio,
  exportSubmissionsPortfolio,
};

export const proCandidateExportService = {
  exportPortfolio: exportCandidatesPortfolio,
};
