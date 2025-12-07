import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { candidateService } from './candidate.service';
import type { Candidate } from '../types/candidate';

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

const formatExperience = (value?: number | null) => {
  if (value === undefined || value === null || Number.isNaN(value)) return 'N/A';
  if (value === 0) return 'New Grad';
  if (value < 1) return `${(value * 12).toFixed(0)} mo`;
  return `${Number(value).toFixed(1).replace(/\.0$/, '')} yrs`;
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

const statusPalette = (status: string | null | undefined): { fill: [number, number, number]; text: [number, number, number] } => {
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
  let totalPages = 1;
  const aggregated: Candidate[] = [];

  while (page < totalPages) {
    const response = await candidateService.getAll(page, pageSize);
    const { content = [], totalPages: remoteTotalPages, totalElements } = response.data;
    aggregated.push(...(content as unknown as Candidate[]));

    if (remoteTotalPages !== undefined && remoteTotalPages !== null) {
      totalPages = remoteTotalPages;
    } else if (content.length < pageSize) {
      totalPages = page + 1;
    } else if (totalElements !== undefined && totalElements !== null) {
      totalPages = Math.ceil(totalElements / pageSize);
    } else {
      totalPages += 1;
    }

    page += 1;
    if (page >= 12) break; // guardrail for exceptionally large datasets
  }

  return aggregated;
};

const drawHeroHeader = (doc: jsPDF, generatedOn: string, totalCandidates: number) => {
  const pageWidth = doc.internal.pageSize.getWidth();
  const headerHeight = 120;

  doc.setFillColor(...primaryPalette.emerald);
  doc.rect(0, 0, pageWidth, headerHeight, 'F');

  doc.setFillColor(...primaryPalette.skyAccent);
  doc.rect(pageWidth * 0.45, 0, pageWidth * 0.55, headerHeight, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(28);
  doc.text('Candidate Experience Portfolio', 44, 58);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  doc.text(`Generated ${generatedOn}`, 44, 82);
  doc.text(`${totalCandidates} candidates curated for your talent pipeline`, 44, 100);
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

const buildCandidateTable = (doc: jsPDF, candidates: Candidate[], startY: number) => {
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
        const palette = statusPalette(String(data.cell.raw));
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
    didDrawPage: (data) => {
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...primaryPalette.slateSecondary);
      doc.setFontSize(9);
      doc.text(
        `Confidential · ${new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date())}`,
        data.settings.margin.left,
        pageHeight - 24,
      );
      doc.text(
        `Page ${doc.getNumberOfPages()}`,
        pageWidth - data.settings.margin.right,
        pageHeight - 24,
        { align: 'right' },
      );
    },
  });
};

const buildEmptyState = (doc: jsPDF, generatedOn: string) => {
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryPalette.slatePrimary);
  doc.setFontSize(20);
  doc.text('No candidates found in your workspace yet.', 44, 180);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...primaryPalette.slateSecondary);
  doc.setFontSize(12);
  const lines = doc.splitTextToSize(
    'Once candidates are added to the pipeline, you can download a curated, presentation-ready portfolio outlining their strengths, availability, and current momentum.',
    doc.internal.pageSize.getWidth() - 88,
  );
  doc.text(lines, 44, 210);

  doc.text(`Generated ${generatedOn}`, 44, 260);
};

export const proCandidateExportService = {
  async exportPortfolio() {
    const candidates = await fetchAllCandidates();
    const generatedOn = new Intl.DateTimeFormat('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date());

    const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });

    drawHeroHeader(doc, generatedOn, candidates.length);

    if (candidates.length === 0) {
      buildEmptyState(doc, generatedOn);
    } else {
      const stats = computePipelineStats(candidates);
      drawStatsSection(doc, stats, 150);
      buildCandidateTable(doc, candidates, stats.length > 3 ? 310 : 290);
    }

    const filename = `Candidate-Portfolio-${new Date().toISOString().slice(0, 10)}.pdf`;
    doc.save(filename);
  },
};
