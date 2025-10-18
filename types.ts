
export interface UsageLogEntry {
  date: string; // ISO string
  reason: string;
  person: string;
  recipient?: string;
  quantityChange: number;
  newQuantity: number;
}

export interface Chemical {
  id: string;
  barcode: string;
  name: string;
  casNumber: string;
  lotNumber: string;
  supplier: string;
  quantity: number;
  unit: string;
  dateReceived: string; // YYYY-MM-DD
  personReceived: string;
  deliveryPerson: string;
  sequenceNumber: string;
  expirationDate: string; // YYYY-MM-DD
  storageLocation: string;
  initialQuantity: number;
  qualityAssessment: string;
  safetyDocBase64?: string;
  safetyDocMimeType?: string;
  usageLog?: UsageLogEntry[];
}

export interface StorageLocation {
  id: string;
  name: string;
  description?: string;
}

export interface User {
  id: string;
  username: string;
  fullName: string;
  passwordHash: string; // In a real app, this would be a hash
  role: 'admin' | 'user';
}

export interface ChemicalMaster {
  id: string;
  name: string;
  casNumber: string;
  specification: string;
  defaultSupplier: string;
  defaultUnit: string;
  defaultLocation: string;
  minimumLevel: number;
}

export interface Instrument {
  id: string;
  name: string;
  model?: string;
  serialNumber?: string;
  location?: string;
}

export interface PlannedItem {
  name: string;
  casNumber: string;
  unit: string;
  quantity: number;
  supplier: string;
  notes: string;
}

export interface PlanningSlip {
  id: string;
  createdAt: string; // ISO string
  createdBy: string;
  items: PlannedItem[];
}

export interface DisposalRecord {
  id: string;
  date: string; // YYYY-MM-DD
  itemName: string;
  supplier: string;
  lotNumber: string;
  quantity: string; // "10 hộp"
  reason: string;
  isReplaced: 'yes' | 'no';
  disposalMethod: string;
  approver: string;
  executor: string;
}

export interface OnInstrumentStock {
  id: string;
  chemicalId: string;
  chemicalName: string;
  lotNumber: string;
  instrumentId: string;
  quantity: number;
  unit: string;
  openVialExpiration?: string; // YYYY-MM-DD
  movedToInstrumentAt: string; // ISO string
}

export interface ManualPreparationLog {
  id: string;
  date: string; // ISO string
  chemicalName: string;
  supplier: string;
  lotNumber: string;
  expirationDate: string; // YYYY-MM-DD
  postPreparationExpiration?: string; // YYYY-MM-DD
  person: string;
  notes: string;
}

export interface TestParameter {
  id: string;
  name: string;
  method?: string;
  unit: string;
  referenceRange?: string;
  tea: number; // Total allowable error in %
}

export interface ControlMaterial {
  id: string;
  name: string;
  level: string; // e.g., "Level 1", "Level 2"
  lotNumber: string;
  expirationDate: string; // YYYY-MM-DD
}

export interface ControlLotTarget {
  id: string;
  testParameterId: string;
  controlMaterialId: string;
  mean: number;
  sd: number;
}

export interface IQCResult {
  id: string;
  testParameterId: string;
  controlMaterialId: string;
  date: string; // ISO string
  value: number;
  recordedBy: string;
  notes?: string;
}

export interface WestgardViolation {
  resultId: string;
  rule: string;
  message: string;
}

export interface MonitoredArea {
  id: string;
  name: string;
  description?: string;
  minTemp?: number;
  maxTemp?: number;
  minHumidity?: number;
  maxHumidity?: number;
}

export interface MonitoredEquipment {
  id: string;
  name: string;
  type: string; // 'Tủ lạnh', 'Tủ ấm'
  minTemp?: number;
  maxTemp?: number;
}

export interface WaterSource {
  id: string;
  name: string;
  location?: string;
  minConductivity: number;
  maxConductivity: number;
}

export interface AccessLog {
  id: string;
  areaId: string;
  areaName: string;
  personOrUnit: string;
  entryTime: string; // ISO String
  exitTime?: string; // ISO String
  task: string;
  notes?: string;
}

export interface AreaEnvironmentLog {
  id: string;
  areaId: string;
  areaName: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  temperature: number;
  humidity: number;
  recordedBy: string;
  notes?: string;
}

export interface EquipmentTemperatureLog {
  id: string;
  equipmentId: string;
  equipmentName: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  temperature: number;
  recordedBy: string;
  notes?: string;
}

export interface WaterConductivityLog {
  id: string;
  sourceId: string;
  sourceName: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  conductivity: number;
  recordedBy: string;
  notes?: string;
}

export interface IncidentReport {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  location: string;
  incidentType: 'Phơi nhiễm' | 'Tai nạn' | 'Cả phơi nhiễm và tai nạn';
  description: string;
  involvedPersonnel: string;
  immediateAction: string;
  correctiveAction: string;
  reportedBy: string;
  reviewer?: string;
  status: 'Mở' | 'Đang xử lý' | 'Đã đóng';
}

export interface DocumentCategory {
  id: string;
  name: string;
}

export interface LabDocument {
  id: string;
  title: string;
  category: string;
  version: string;
  effectiveDate: string; // YYYY-MM-DD
  fileName: string;
  fileType: string; // MIME type
  fileData: string; // base64
}

export interface JobRole {
  id: string;
  title: string;
  description?: string;
}

export interface OrganizationUnit {
  id: string;
  name: string;
  parentId: string | null;
  description?: string;
}

export interface PersonnelDocument {
  id: string;
  title: string;
  category: 'Sơ yếu lý lịch' | 'Bằng cấp' | 'Chứng chỉ' | 'Hồ sơ tiêm chủng' | 'Khác';
  fileName: string;
  fileType: string; // MIME type
  fileData: string; // base64
  uploadedAt: string; // ISO string
}

export interface PersonnelProfile {
  id: string;
  fullName: string;
  employeeId: string;
  jobRoleId: string;
  organizationUnitId: string;
  degree: string;
  hireDate: string; // YYYY-MM-DD
  documents?: PersonnelDocument[];
}

export interface TraineeProfile {
  id: string;
  fullName: string;
  studentId: string;
  schoolOrInstitution: string;
  trainingCourse: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  supervisorId: string; // Links to PersonnelProfile id
  status: 'đang học' | 'đã hoàn thành' | 'đã nghỉ';
  notes?: string;
}

export interface EquipmentDocument {
  id: string;
  title: string;
  fileName: string;
  fileType: string; // MIME type
  fileData: string; // base64
  uploadedAt: string; // ISO string
}

export interface MaintenanceRecord {
  id: string;
  date: string; // YYYY-MM-DD
  performedBy: string;
  description: string;
  documentId?: string; // Optional link to an EquipmentDocument
}

export interface CalibrationRecord {
  id: string;
  date: string; // YYYY-MM-DD
  performedBy: string;
  description: string;
  documentId?: string; // Optional link to an EquipmentDocument
}

export interface WorkItem {
  id: string;
  description: string;
  frequency?: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'as_needed' | 'replacement';
}

export interface LabEquipment {
  id: string;
  name: string;
  assetId: string;
  model?: string;
  serialNumber: string;
  manufacturer?: string;
  status: 'operational' | 'maintenance' | 'out_of_service';
  location: string;
  purchaseDate?: string; // YYYY-MM-DD
  warrantyDate?: string; // YYYY-MM-DD
  lastMaintenance?: string; // YYYY-MM-DD
  maintenanceInterval?: number; // in days
  nextMaintenance?: string; // YYYY-MM-DD
  lastCalibration?: string; // YYYY-MM-DD
  calibrationInterval?: number; // in days
  // FIX: Removed duplicate properties 'nextMaintenance', 'lastCalibration', and 'calibrationInterval'.
  nextCalibration?: string; // YYYY-MM-DD
  maintenanceHistory?: MaintenanceRecord[];
  calibrationHistory?: CalibrationRecord[];
  documents?: EquipmentDocument[];
  operatingProcedure?: string;
  associatedWorkItemIds?: string[];
}

export interface EquipmentUsageLog {
  id: string;
  equipmentId: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  userId: string;
  maintenancePerformed?: string;
  qualityCheck: 'yes' | 'no' | 'n/a';
  qualityCheckDetails?: string;
  incidents?: string;
  correctiveAction?: string;
  usageStatus: 'Hoạt động tốt' | 'Có vấn đề nhỏ' | 'Gặp sự cố';
  notes?: string;
  nonConformityId?: string;
}

export interface MaintenanceChecklistLog {
  id: string; // Composite key like `${equipmentId}-${workItemId}-${date}`
  equipmentId: string;
  workItemId: string;
  date: string; // YYYY-MM-DD
  completedByUserId: string;
}

export interface NonConformity {
  id: string;
  ncId: string; // User-facing ID, e.g., SKPH-2407001
  hdkpId?: string; // Corrective Action ID, e.g., HDKP-2407001
  date: string; // YYYY-MM-DD
  
  // Section 1: Detection
  detectionSources?: ('nc_report' | 'internal_audit' | 'management_review' | 'external_audit' | 'other')[];
  detectionSourceOther?: string;

  // Section 2: Description
  description: string;
  
  // General classification
  category: 'pre-analytical' | 'analytical' | 'post-analytical' | 'system' | 'safety' | 'supplier' | 'other';
  severity: 'minor' | 'severe';
  status: 'open' | 'in_progress' | 'closed';
  
  // Section 3: Analysis
  rootCauseAnalysis?: string;
  
  // Section 4 & 5: Actions
  correctiveAction?: string;
  preventiveAction?: string;
  
  // Signatures & Approvals
  reportedBy: string; // Người báo cáo
  actionPerformer?: string; // Người thực hiện khắc phục
  completionDate?: string; // Ngày hoàn thành
  
  implementationApproved?: 'approved' | 'rejected'; // Phê duyệt thực hiện
  actionApprover?: string; // Người phê duyệt (thực hiện)
  implementationApprovalDate?: string; // Ngày phê duyệt (thực hiện)

  resultApproved?: 'approved' | 'rejected'; // Kết quả khắc phục
  actionEffectiveness?: string; // Ghi chú kết quả
  
  finalApprover?: string; // Phê duyệt kết quả thực hiện
  closedBy?: string; // Should be the same as finalApprover, can be simplified
  closedDate?: string; // Ngày đóng
}

export interface PreventiveActionReport {
  id: string;
  reportId: string; // e.g., HDPN-2407001
  dateCreated: string; // YYYY-MM-DD
  problemDescription: string;
  riskFactors: string;
  preventiveMeasures: string;
  executor: string;
  executionDate: string; // YYYY-MM-DD
  effectiveness?: string;
  evaluator?: string;
  evaluationDate?: string; // YYYY-MM-DD
}

export interface ImprovementInitiative {
  id: string;
  title: string;
  proposedDate: string; // YYYY-MM-DD
  proposedBy: string;
  problemDescription: string;
  proposedAction: string;
  status: 'proposed' | 'in_progress' | 'completed' | 'canceled';
  dueDate?: string; // YYYY-MM-DD
  completionDate?: string; // YYYY-MM-DD
  effectivenessEvaluation?: string;
}

export interface CustomerFeedback {
  id: string;
  date: string; // YYYY-MM-DD
  customerInfo: string;
  type: 'feedback' | 'complaint';
  subject: string;
  details: string;
  status: 'new' | 'in_progress' | 'resolved';
  personInCharge: string;
  resolutionDetails?: string;
  resolvedDate?: string; // YYYY-MM-DD
}

export interface AuditLog {
  id: string;
  timestamp: string; // ISO string
  user: string;
  action: string;
  details: string;
}

export interface SystemSettings {
  [key: string]: any;
}

export interface BackupSettings {
    frequency: 'never' | 'daily' | 'weekly' | 'monthly';
    lastBackup: string | null; // ISO string
}

export interface AuditFinding {
    id: string;
    description: string;
    classification: 'SKPH' | 'Cơ hội cải tiến';
    correctiveAction: string;
    personInCharge: string;
    dueDate: string; // YYYY-MM-DD
    status: 'open' | 'completed';
}

export interface AuditRecord {
    id: string;
    title: string;
    scope: string;
    startDate: string; // YYYY-MM-DD
    endDate: string; // YYYY-MM-DD
    auditors: string;
    status: 'planned' | 'in_progress' | 'completed';
    findings: AuditFinding[];
}

export interface LeaveRecord {
  id: string;
  personnelId: string;
  leaveType: 'Phép năm' | 'Nghỉ ốm' | 'Công tác' | 'Nghỉ không lương' | 'Nghỉ bù' | 'Đi học' | 'Khác';
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  reason: string;
  status: 'approved' | 'pending';
}

export interface AttendanceRecord {
  id: string;
  personnelId: string;
  date: string; // YYYY-MM-DD
  checkIn: string; // HH:MM
  checkOut: string; // HH:MM
  notes?: string;
}

export interface WorkSchedule {
  startTime: string; // HH:MM
  endTime: string; // HH:MM
}

export interface Holiday {
  id: string;
  date: string; // YYYY-MM-DD
  name: string;
}

export interface DutyAssignment {
  id: string;
  personnelId: string;
  date: string; // YYYY-MM-DD, the start date of the shift
  notes?: string;
}

export interface TaskAssignment {
  id: string;
  personnelId: string;
  date: string; // YYYY-MM-DD
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
}

export interface PersonnelAssignmentHistory {
  id: string;
  personnelId: string;
  organizationUnitId: string;
  startDate: string; // YYYY-MM-DD
  endDate: string | null; // YYYY-MM-DD
  notes?: string;
}

export interface KpiScore {
  id: string; // Composite key like `${personnelId}-${date}`
  personnelId: string;
  date: string; // YYYY-MM-DD
  bonusPoints: number;
  penaltyPoints: number;
  notes: string;
}

export interface TrainingCourse {
  id: string;
  title: string;
  provider: string; // e.g., 'Internal', 'Roche', 'Siemens'
  description?: string;
}

export interface TrainingRecord {
  id: string;
  personnelId: string;
  courseId: string;
  completionDate: string; // YYYY-MM-DD
  expiryDate?: string; // YYYY-MM-DD
  certificateId?: string; // Optional link to a PersonnelDocument
}

export interface Competency {
    id: string;
    name: string; // e.g., 'Vận hành máy AU480', 'Kỹ thuật pipet'
    description?: string;
}

export interface CompetencyAssessment {
    id: string;
    personnelId: string;
    competencyId: string;
    assessmentDate: string; // YYYY-MM-DD
    assessorId: string; // Personnel ID of the assessor
    result: 'Đạt' | 'Cần cải thiện';
    nextAssessmentDate?: string; // YYYY-MM-DD
    notes?: string;
}

export interface RoomLocation {
    id: string;
    name: string;
    description?: string;
}

export interface EQAMaterial {
    id: string;
    name: string;
    provider: string;
    lotNumber: string;
    expirationDate: string; // YYYY-MM-DD
}
