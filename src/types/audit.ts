export interface Audit {
  id: number;
  auditName: string;
  auditType?: string;
  status: string;
  startDate?: string | Date;
  endDate?: string | Date;
  assignedTo?: string;
  assignedAuditors?: { id: number; name: string }[];
  assignedManagerId?: number;
  auditUniverseId?: number;
  entityName?: string;
  auditUniverse?: {
    id: number;
    entityName: string;
    ownerId?: number;
  };
  auditPrograms?: AuditProgram[];
  findings?: any[];
  chiefAuditorComments?: string | null;

  // Strategic Audit Plan / enhanced fields
  riskScore?: number;
  riskLevel?: string;
  priority?: string;
  quarter?: string;
  year?: number;
  resourceHours?: number;
  budgetAllocation?: number;
  justification?: string;
  executiveApproval?: boolean;
  executiveApprovedAt?: string | Date;
  executiveApprovedById?: number;
  reports?: any[];
  risks?: any[];
  timesheets?: any[];
}

export interface AuditProgram {
  id: number;
  auditId?: number;
  procedureName: string;
  controlReference: string | null;
  expectedOutcome: string | null;
  actualResult: string | null;
  reviewerComment: string | null;
  expanded?: boolean;

  // Enhanced Operational fields
  samplingApproach?: string;
  sampleSize?: number;
  confidenceLevel?: number;
  materialityThreshold?: number;
  testMethod?: string;
  evidenceRequired?: string;
  documentationReq?: string;
  stepByStepProcedure?: string;

  audit?: Audit;
  controlMappings?: any[];
  evidence?: any[];
  findings?: any[];
  workpaper?: any;
}
