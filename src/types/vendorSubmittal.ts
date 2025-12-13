export type VendorSubmittal = {
  id: string;
  vendorName: string;
  candidateId: string;
  candidateName?: string;
  jobId: string;
  jobTitle?: string;
  rate?: number;
  status: 'submitted' | 'accepted' | 'rejected' | 'withdrawn';
  submittedAt?: string;
};

export type VendorSubmittalCreate = Omit<VendorSubmittal, 'id' | 'submittedAt'>;
export type VendorSubmittalUpdate = Partial<Omit<VendorSubmittal, 'id'>> & { id: string };
 
