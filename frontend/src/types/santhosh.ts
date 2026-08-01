export type RoleType = 'procurement' | 'inventory' | 'production' | 'logistics' | 'master';

export type AgentStatus = 'Active' | 'Warning' | 'Failed' | 'Recovering' | 'Syncing';

export type NavTab = 
  | 'dashboard' 
  | 'tasks'
  | 'upload' 
  | 'insights' 
  | 'analytics' 
  | 'recommendations' 
  | 'reports' 
  | 'health' 
  | 'settings';

export interface RoleConfig {
  id: RoleType;
  roleName: string;
  agentName: string;
  description: string;
  dashboardName: string;
  responsibilities: string[];
  status: AgentStatus;
  confidenceScore: number;
  lastSync: string;
  badgeColor: string;
}

export interface AgentHealthItem {
  id: RoleType;
  agentName: string;
  status: AgentStatus;
  responseTimeMs: number;
  lastExecution: string;
  failureCount: number;
  recoveryStatus: string;
  cpuLoadPercent: number;
  memoryUsageMb: number;
  autoHealEnabled: boolean;
  logs: string[];
}

export interface DataColumnMapping {
  originalColumn: string;
  aiUnderstanding: string;
  standardField: string;
  confidence: number;
}

export interface ProcessingStage {
  id: number;
  label: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  timestamp?: string;
}

export interface ProcurementRecord {
  vendorId: string;
  supplierName: string;
  category: string;
  orderDate: string;
  quantity: number;
  unitPrice: number;
  leadTimeDays: number;
  deliveryDate: string;
  riskScore: number; // 0 - 100
  onTimeRate: number; // %
  status: 'Active' | 'Delayed' | 'Critical' | 'Fulfilled';
}

export interface InventoryRecord {
  sku: string;
  itemName: string;
  category: string;
  warehouseLocation: string;
  stockLevel: number;
  reorderPoint: number;
  maxCapacity: number;
  unitCost: number;
  holdingCost: number;
  status: 'Optimal' | 'Low Stock' | 'Overstock' | 'Critical';
}

export interface ProductionRecord {
  jobId: string;
  lineName: string;
  productName: string;
  targetOutput: number;
  actualOutput: number;
  downtimeMins: number;
  oeePercent: number;
  machineUtilization: number;
  status: 'Running' | 'Bottleneck' | 'Maintenance' | 'Stalled';
}

export interface LogisticsRecord {
  shipmentId: string;
  carrier: string;
  origin: string;
  destination: string;
  dispatchDate: string;
  expectedEta: string;
  currentStatus: 'In Transit' | 'Delivered' | 'Delayed' | 'Customs Hold';
  delayHours: number;
  etaAccuracy: number;
}

export interface QualityRecord {
  inspectionId: string;
  batchNumber: string;
  productName: string;
  totalInspected: number;
  defectiveUnits: number;
  defectRate: number;
  passStatus: 'Passed' | 'Action Required' | 'Critical Failure';
  inspectorAgent: string;
  criticalDefects: string;
}

export interface AssignedTask {
  id: string;
  title: string;
  assignedDepartment: RoleType;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  deadline: string;
  description: string;
  status: 'Pending' | 'In Progress' | 'Completed';
  createdBy: string;
  createdAt: string;
}

export interface DepartmentRequest {
  id: string;
  requestType: 'Material' | 'Stock' | 'Budget' | 'Maintenance' | 'Approval' | 'Escalation';
  title: string;
  fromDepartment: RoleType;
  details: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Completed';
  timestamp: string;
}

export interface DepartmentReportItem {
  id: string;
  departmentId: RoleType;
  departmentName: string;
  reportTitle: string;
  generatedAt: string;
  recordCount: number;
  summary: string;
  kpis: { label: string; value: string }[];
  recommendations: string[];
  dataPreview: any[];
}

export interface CascadingRisk {
  id: string;
  triggerEvent: string;
  triggerSource: string; // e.g. "Procurement Agent"
  intermediateImpact: string; // e.g. "Production Agent"
  finalConsequence: string; // e.g. "Logistics Agent"
  severity: 'Critical' | 'High' | 'Medium';
  estimatedFinancialImpact: string;
  aiMitigation: string;
}

export interface ExecutiveReport {
  currentSituation: string;
  criticalIssues: string[];
  rootCause: string;
  businessImpact: string;
  recommendedActions: string[];
}

export interface UploadedDataset {
  fileName: string;
  fileSize: string;
  uploadTime: string;
  domain: RoleType;
  columns: string[];
  mappings: DataColumnMapping[];
  records: any[];
}

export interface AgentSubmission {
  id: string;
  agentId: RoleType;
  agentName: string;
  timestamp: string;
  fileName: string;
  recordCount: number;
  previewRecords: any[];
  columns: string[];
  summaryMetrics: {
    totalVolume: string;
    riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
    keyHighlight: string;
  };
  status: 'Received' | 'Analyzed' | 'Merged';
}
