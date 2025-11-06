export interface Document {
  id?: string;
  tenantId?: string;
  fileName: string;
  originalFileName: string;
  fileType: string;
  fileSize: number;
  filePath?: string;
  fileUrl?: string;
  uploadedBy: string;
  relatedEntityType: 'CANDIDATE' | 'JOB' | 'CLIENT' | 'SUBMISSION' | 'INTERVIEW' | 'GENERAL';
  relatedEntityId: string;
  documentType: 'RESUME' | 'OFFER_LETTER' | 'CONTRACT' | 'JOB_DESCRIPTION' | 'INVOICE' | 'OTHER';
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
}
