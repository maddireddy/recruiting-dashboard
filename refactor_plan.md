# UI Layout & Validation Refactor Plan

**Generated:** 2025-12-29
**Status:** In Progress
**Engineer:** Autonomous Senior Frontend Engineer

## Mission
Fix all layout issues, ensure responsive design (mobile 375px, tablet 768px), and enforce strict field validation across the entire React application.

## Execution Rules
1. ✅ Fix horizontal scrolling on mobile/tablet
2. ✅ Convert hardcoded pixels to responsive units
3. ✅ Ensure text readability (contrast & size)
4. ✅ Add missing field validations
5. ✅ Standardize buttons and headers
6. ❌ DO NOT delete business logic

---

## PHASE 1: PAGE COMPONENTS (50 files)

### Core Pages
- [ ] `/src/pages/Login.tsx` - Authentication page
- [ ] `/src/pages/Dashboard.tsx` - Main dashboard

### Candidate Management (7 files)
- [ ] `/src/pages/Candidates.tsx` - Candidate list
- [ ] `/src/pages/CandidateDetails.tsx` - Candidate profile
- [ ] `/src/pages/CandidateSourcings.tsx` - Sourcing history
- [ ] `/src/pages/BookmarkletCaptures.tsx` - Bookmarklet imports
- [ ] `/src/pages/Rediscovery.tsx` - Silver medalist tracking
- [ ] `/src/pages/SilverMedalists.tsx` - Top runners-up
- [ ] `/src/pages/AdvancedSearch.tsx` - Advanced candidate search

### Job Management (4 files)
- [ ] `/src/pages/Jobs.tsx` - Job listings
- [ ] `/src/pages/JobDetails.tsx` - Job profile
- [ ] `/src/pages/JobDescriptionTemplates.tsx` - JD templates
- [ ] `/src/pages/BooleanSearchTemplates.tsx` - Search templates

### Interview & Scheduling (5 files)
- [ ] `/src/pages/Interviews.tsx` - Interview management
- [ ] `/src/pages/InterviewGuides.tsx` - Interview guides
- [ ] `/src/pages/InterviewRecordings.tsx` - Recorded interviews
- [ ] `/src/pages/InterviewIntelligence.tsx` - AI interview analysis
- [ ] `/src/pages/CalendarSync.tsx` - Calendar integration

### Offers & Onboarding (2 files)
- [ ] `/src/pages/Offers.tsx` - Offer management
- [ ] `/src/pages/OfferDetails.tsx` - Offer details

### Communication (4 files)
- [ ] `/src/pages/EmailTemplates.tsx` - Email template library
- [ ] `/src/pages/EmailLogs.tsx` - Email history
- [ ] `/src/pages/SMS.tsx` - SMS campaigns
- [ ] `/src/pages/SMSCommunications.tsx` - SMS history

### Talent Pools (3 files)
- [ ] `/src/pages/TalentPools.tsx` - Talent pool management
- [ ] `/src/pages/TalentPoolDetails.tsx` - Pool details
- [ ] `/src/pages/TalentPoolMatching.tsx` - AI matching

### Vendors & Submissions (3 files)
- [ ] `/src/pages/Vendors.tsx` - Vendor management
- [ ] `/src/pages/VendorSubmittals.tsx` - Vendor submissions
- [ ] `/src/pages/Submissions.tsx` - All submissions

### Client Management (1 file)
- [ ] `/src/pages/Clients.tsx` - Client management

### Referrals (1 file)
- [ ] `/src/pages/Referrals.tsx` - Employee referrals

### AI & Intelligence (3 files)
- [ ] `/src/pages/AiLab.tsx` - AI experimentation
- [ ] `/src/pages/SemanticSearch.tsx` - Semantic search
- [ ] `/src/pages/MarketIntelligence.tsx` - Market data

### Compliance & Reporting (5 files)
- [ ] `/src/pages/Compliance.tsx` - Compliance dashboard
- [ ] `/src/pages/EeoDatas.tsx` - EEO data collection
- [ ] `/src/pages/DiversityMetrics.tsx` - Diversity analytics
- [ ] `/src/pages/Reports.tsx` - Reporting dashboard
- [ ] `/src/pages/CustomReports.tsx` - Custom report builder

### Settings & Configuration (9 files)
- [ ] `/src/pages/Documents.tsx` - Document management
- [ ] `/src/pages/SavedSearches.tsx` - Saved search filters
- [ ] `/src/pages/SkillsAssessments.tsx` - Skills tests
- [ ] `/src/pages/Workflows.tsx` - Workflow automation
- [ ] `/src/pages/ApiKeys.tsx` - API key management
- [ ] `/src/pages/Billing.tsx` - Subscription & billing
- [ ] `/src/pages/WhiteLabel.tsx` - White-label settings
- [ ] `/src/pages/MobileAppConfigs.tsx` - PWA configuration

### Public Pages (2 files)
- [ ] `/src/pages/public/CareerPage.tsx` - Public career site
- [ ] `/src/pages/public/JobDetailPage.tsx` - Public job posting

---

## PHASE 2: MODAL COMPONENTS (15 files)

### Candidate Modals
- [ ] `/src/components/candidates/CandidateModal.tsx`
- [ ] `/src/components/candidates/CandidateDocuments.tsx`

### Job Modals
- [ ] `/src/components/jobs/JobModal.tsx`
- [ ] `/src/components/jobs/JDAssistantModal.tsx`

### Interview Modals
- [ ] `/src/components/interviews/InterviewModal.tsx`

### Offer Modals
- [ ] `/src/components/offers/OfferModal.tsx`

### Communication Modals
- [ ] `/src/components/email/EmailTemplateModal.tsx`
- [ ] `/src/components/email/EmailLogModal.tsx`

### Bulk Action Modals
- [ ] `/src/components/bulk/BulkEmailModal.tsx`
- [ ] `/src/components/bulk/BulkStatusModal.tsx`
- [ ] `/src/components/bulk/ExportFieldsModal.tsx`
- [ ] `/src/components/bulk/ProgressModal.tsx`

### Other Modals
- [ ] `/src/components/clients/ClientModal.tsx`
- [ ] `/src/components/submissions/SubmissionModal.tsx`
- [ ] `/src/components/talent/TalentPoolCreateModal.tsx`
- [ ] `/src/components/documents/DocumentUploadModal.tsx`

---

## PHASE 3: TABLE & LIST COMPONENTS (8 files)

- [ ] `/src/components/candidates/CandidateList.tsx`
- [ ] `/src/components/candidates/CandidateTable.tsx`
- [ ] `/src/components/bulk/MultiSelectTable.tsx`
- [ ] `/src/components/common/Table.tsx`
- [ ] `/src/components/documents/DocumentList.tsx`
- [ ] `/src/components/jobs/KanbanBoard.tsx`
- [ ] `/src/components/jobs/KanbanColumn.tsx`
- [ ] `/src/components/jobs/JobCard.tsx`

---

## PHASE 4: DASHBOARD COMPONENTS (10 files)

- [ ] `/src/components/dashboard/StatsCard.tsx`
- [ ] `/src/components/dashboard/ActivityFeedCard.tsx`
- [ ] `/src/components/dashboard/PipelineOverview.tsx`
- [ ] `/src/components/dashboard/QuickActionsCard.tsx`
- [ ] `/src/components/dashboard/TalentFocusCard.tsx`
- [ ] `/src/components/dashboard/ClientsBreakdownChart.tsx`
- [ ] `/src/components/dashboard/SubmissionFunnelChart.tsx`
- [ ] `/src/components/dashboard/TrendLineChart.tsx`
- [ ] `/src/components/dashboard/TopSkillsChart.tsx`
- [ ] `/src/components/dashboard/GettingStartedWidget.tsx`

---

## PHASE 5: COMMON & UI COMPONENTS (25 files)

### Layout Components
- [ ] `/src/components/common/Header.tsx`
- [ ] `/src/components/common/Sidebar.tsx`
- [ ] `/src/components/common/PageHeader.tsx`
- [ ] `/src/components/common/Breadcrumbs.tsx`

### Form Components
- [ ] `/src/components/common/FormField.tsx`
- [ ] `/src/components/ui/Input.tsx`
- [ ] `/src/components/ui/Field.tsx`
- [ ] `/src/components/ui/Label.tsx`
- [ ] `/src/components/ui/Button.tsx`

### Search & Filter Components
- [ ] `/src/components/common/GlobalSearch.tsx`
- [ ] `/src/components/common/GlobalSearchBar.tsx`
- [ ] `/src/components/jobs/JobFiltersSidebar.tsx`

### State & Feedback Components
- [ ] `/src/components/common/EmptyState.tsx`
- [ ] `/src/components/common/ConfirmDialog.tsx`
- [ ] `/src/components/ui/Dialog.tsx`
- [ ] `/src/components/ui/Loader.tsx`
- [ ] `/src/components/ui/Spinner.tsx`
- [ ] `/src/components/ui/Skeleton.tsx`
- [ ] `/src/components/common/Skeleton.tsx`

### Utility Components
- [ ] `/src/components/common/StatsCard.tsx`
- [ ] `/src/components/common/Timeline.tsx`
- [ ] `/src/components/common/ThemeToggle.tsx`
- [ ] `/src/components/common/ExportMenu.tsx`
- [ ] `/src/components/ui/card.tsx`
- [ ] `/src/components/ui/bento-grid.tsx`
- [ ] `/src/components/ui/PageHeader.tsx`

---

## PHASE 6: SPECIALIZED COMPONENTS (15 files)

### AI Components
- [ ] `/src/components/ai/ResumeParser.tsx`
- [ ] `/src/components/ai/JobDescriptionGenerator.tsx`

### Document Components
- [ ] `/src/components/documents/DocumentPreview.tsx`
- [ ] `/src/components/documents/FileUpload.tsx`
- [ ] `/src/components/shared/FileUploader.tsx`

### Scheduling Components
- [ ] `/src/components/scheduling/SchedulingDashboard.tsx`
- [ ] `/src/components/scheduling/AvailabilityLinkCreator.tsx`
- [ ] `/src/components/scheduling/SlotSelector.tsx`

### Bulk Operations
- [ ] `/src/components/bulk/BulkActionBar.tsx`

### Settings Components
- [ ] `/src/components/settings/TestEmailButton.tsx`

---

## VALIDATION REQUIREMENTS

### Required Field Validations
1. **Email fields**: Valid email format, required where applicable
2. **Phone fields**: Valid phone format (10 digits), required where applicable
3. **Password fields**: Min 8 chars, special character, number, uppercase
4. **Text inputs**: Max length validation, trim whitespace
5. **Dropdown/Select**: Required option selected
6. **Date fields**: Valid date format, logical date ranges
7. **File uploads**: File type restrictions, size limits

### Error Display Requirements
- Error messages must appear below the field
- Red border on invalid fields
- Clear, specific error messages
- Real-time validation feedback

---

## RESPONSIVE LAYOUT REQUIREMENTS

### Mobile (375px)
- No horizontal scrolling
- Touch-friendly buttons (min 44px height)
- Single column layouts
- Collapsible sidebars
- Responsive tables (scroll or card view)

### Tablet (768px)
- Optimized two-column layouts
- Appropriate padding and spacing
- Readable font sizes (min 14px)

### Desktop (1024px+)
- Full multi-column layouts
- Optimized for wide screens

---

## STANDARDIZATION CHECKLIST

### Buttons
- Primary: `bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md`
- Secondary: `bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md`
- Danger: `bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md`
- Consistent height: `h-10` or `py-2`
- Consistent border-radius: `rounded-md`

### Headers
- H1: `text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100`
- H2: `text-xl md:text-2xl font-semibold text-gray-800 dark:text-gray-200`
- H3: `text-lg md:text-xl font-medium text-gray-700 dark:text-gray-300`

### Spacing
- Container padding: `p-4 md:p-6 lg:p-8`
- Section spacing: `space-y-4 md:space-y-6`
- Card padding: `p-4 md:p-6`

---

## KNOWN ISSUES TO FIX

1. Horizontal scrolling on mobile devices
2. Overlapping elements in modals
3. Hardcoded pixel widths instead of responsive units
4. Missing required field validations
5. Inconsistent button styling
6. Poor contrast in dark mode
7. Non-responsive tables
8. Small touch targets on mobile
9. Missing error message displays
10. Inconsistent header sizing

---

## PROGRESS TRACKING

**Total Files:** 123
**Completed:** 0
**In Progress:** 0
**Pending:** 123

---

## COMPLETION CRITERIA

- ✅ All pages responsive on 375px, 768px, 1024px+
- ✅ No horizontal scrolling on any device
- ✅ All inputs have proper validation
- ✅ All forms display error messages
- ✅ Consistent button styling
- ✅ Consistent header styling
- ✅ WCAG AA contrast compliance
- ✅ All business logic preserved
- ✅ Build passes with no errors

---

**Next Steps:**
1. Start with PHASE 1 (Pages)
2. Fix issues systematically
3. Test on each breakpoint
4. Commit changes incrementally
5. Final build verification
