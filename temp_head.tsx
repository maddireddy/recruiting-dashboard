import { useEffect, useMemo, useState } from 'react';
import { Plus, Search, Download, SlidersHorizontal, RotateCcw, Users, Rocket, CalendarClock, Briefcase, Sparkles, Filter, TrendingUp } from 'lucide-react';
import { reportService } from '../services/report.service';
import toast from 'react-hot-toast';
import type { Candidate } from '../types';
import CandidateTable from '../components/candidates/CandidateTable';
import { BulkActionBar } from '../components/bulk/BulkActionBar';
import CandidateModal from '../components/candidates/CandidateModal';
import { candidateService } from '../services/candidate.service';
import { useSearchParams } from 'react-router-dom';
import { useList, useCreate, useUpdate, useDelete } from '../services/hooks';

type CandidateColumnKey = 'name' | 'contact' | 'skills' | 'experience' | 'availability' | 'status' | 'actions';
type ResizableCandidateColumnKey = Exclude<CandidateColumnKey, 'actions'>;
type CandidateColumnWidths = Partial<Record<ResizableCandidateColumnKey, number>>;

type CandidateSavedView = {
  name: string;
  filters: Record<string, string>;
  visibleColumns: CandidateColumnKey[];
  columnWidths: CandidateColumnWidths;
};


const ALL_CANDIDATE_COLUMNS: CandidateColumnKey[] = ['name', 'contact', 'skills', 'experience', 'availability', 'status', 'actions'];
const RESIZABLE_CANDIDATE_COLUMNS: ResizableCandidateColumnKey[] = ['name', 'contact', 'skills', 'experience', 'availability', 'status'];
const isCandidateColumn = (value: string): value is CandidateColumnKey =>
  ALL_CANDIDATE_COLUMNS.includes(value as CandidateColumnKey);
const QUICK_STATUS_FILTERS = ['AVAILABLE', 'INTERVIEWING', 'PLACED', 'ON_HOLD'] as const;

const getCandidateTimestamp = (candidate: Candidate) => {
  const meta = candidate as { updatedAt?: string | null; createdAt?: string | null };
  return meta.updatedAt ?? meta.createdAt ?? null;
};

const normalizeColumnWidths = (value: unknown): CandidateColumnWidths => {
  const widths: CandidateColumnWidths = {};
  if (value && typeof value === 'object') {
    RESIZABLE_CANDIDATE_COLUMNS.forEach((column) => {
      const maybeNumber = (value as Record<string, unknown>)[column];
      if (typeof maybeNumber === 'number') {
        widths[column] = maybeNumber;
      }
    });
  }
  return widths;
};

export default function Candidates() {
  const [searchParams, setSearchParams] = useSearchParams();
