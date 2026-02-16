export interface Policy {
  id: number;
  policyName: string;
  version: string;
  description?: string;
  effectiveDate: string | Date;
  reviewDate?: string | Date;
  status: 'Draft' | 'Active' | 'Archived' | 'Under Review';
  fileUrl?: string;
  policyMappings?: PolicyMapping[];
}

export interface PolicyMapping {
  id: number;
  policyId: number;
  frameworkId: number;
  framework?: {
    id: number;
    frameworkName: string;
    version: string;
  };
}
export interface Policy {
  id: number;
  policyName: string;
  version: string;
  description?: string;
  effectiveDate: string | Date;
  reviewDate?: string | Date;
  status: 'Draft' | 'Active' | 'Archived' | 'Under Review';
  fileUrl?: string;
  policyMappings?: PolicyMapping[];
}

export interface PolicyMapping {
  id: number;
  policyId: number;
  frameworkId: number;
  framework?: {
    id: number;
    frameworkName: string;
    version: string;
  };
}
