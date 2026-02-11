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
  auditPrograms?: any[];
  findings?: any[];
}

export interface AuditProgram {
  id: number;
  procedureName: string;
  controlReference: string | null;
  expectedOutcome: string | null;
  actualResult: string | null;
  reviewerComment: string | null;
  expanded?: boolean;
}
