export interface JobDescriptionTemplate {
  id: string;
  name: string;
  content: string;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
}
