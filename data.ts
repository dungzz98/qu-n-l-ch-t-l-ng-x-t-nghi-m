import * as types from './types';

export const initialUsers: types.User[] = [
  { id: 'user-1', username: 'admin', fullName: 'Quản trị viên', passwordHash: 'admin123', role: 'admin' },
  { id: 'user-2', username: 'user', fullName: 'Nhân viên Lab', passwordHash: 'user123', role: 'user' },
];

export const initialStorageLocations: types.StorageLocation[] = [
    { id: 'loc-1', name: 'Tủ hóa chất dễ cháy', description: 'Tủ chống cháy, có thông gió' },
    { id: 'loc-2', name: 'Tủ hóa chất chung (Nhiệt độ phòng)', description: 'Nhiệt độ phòng 18-25°C' },
    { id: 'loc-3', name: 'Tủ lạnh 2-8°C', description: 'Lưu trữ kit và hóa chất cần làm mát' },
    { id: 'loc-4', name: 'Tủ đông -20°C', description: 'Lưu trữ control, chuẩn và mẫu' },
];

export const initialInstruments: types.Instrument[] = [
    { id: 'inst-1', name: 'AU480', model: 'AU480', serialNumber: 'SN12345', location: 'Phòng Hóa sinh' },
    { id: 'inst-2', name: 'Sysmex XN-1000', model: 'XN-1000', serialNumber: 'SN67890', location: 'Phòng Huyết học' },
    { id: 'inst-3', name: 'Cobas e411', model: 'e411', serialNumber: 'SN54321', location: 'Phòng Miễn dịch' },
];

export const initialChemicalMasters: types.ChemicalMaster[] = [
    { id: 'master-1', name: 'Ethanol 96%', casNumber: '64-17-5', specification: 'Chai 5L', defaultSupplier: 'Merck', defaultUnit: 'ml', defaultLocation: 'Tủ hóa chất dễ cháy', minimumLevel: 1000 },
    { id: 'master-2', name: 'Sodium Chloride', casNumber: '7647-14-5', specification: 'Hộp 1kg', defaultSupplier: 'Sigma-Aldrich', defaultUnit: 'g', defaultLocation: 'Tủ hóa chất chung', minimumLevel: 200 },
    { id: 'master-3', name: 'Calibrator for AU480', casNumber: 'N/A', specification: 'Hộp 10x3ml', defaultSupplier: 'Beckman Coulter', defaultUnit: 'hộp', defaultLocation: 'Tủ lạnh 2-8°C', minimumLevel: 2 },
];

export const initialDocumentCategories: types.DocumentCategory[] = [
  { id: 'doccat-1', name: 'Quy trình Vận hành Chuẩn (SOP)' },
  { id: 'doccat-2', name: 'Hướng dẫn Công việc' },
  { id: 'doccat-3', name: 'Biểu mẫu' },
  { id: 'doccat-4', name: 'Hồ sơ Thiết bị' },
  { id: 'doccat-5', name: 'Tài liệu Đào tạo' },
];

export const initialChemicals: types.Chemical[] = [
  {
    id: 'chem-1', barcode: 'CHEM0001', name: 'Ethanol 96%', casNumber: '64-17-5', lotNumber: 'ET202301',
    supplier: 'Merck', quantity: 4500, unit: 'ml', initialQuantity: 5000, dateReceived: '2023-10-01',
    personReceived: 'Admin', deliveryPerson: 'Giao hàng ABC', sequenceNumber: '1', expirationDate: '2025-10-01',
    storageLocation: 'Tủ hóa chất dễ cháy', qualityAssessment: 'Nguyên niêm phong, cảm quan tốt',
    usageLog: [ { date: new Date('2023-10-15T10:00:00Z').toISOString(), reason: 'Pha cồn 70 độ', person: 'User', quantityChange: -500, newQuantity: 4500 } ]
  },
  {
    id: 'chem-2', barcode: 'CHEM0002', name: 'Sodium Chloride', casNumber: '7647-14-5', lotNumber: 'SC202305',
    supplier: 'Sigma-Aldrich', quantity: 800, unit: 'g', initialQuantity: 1000, dateReceived: '2023-09-15',
    personReceived: 'Admin', deliveryPerson: 'Giao hàng XYZ', sequenceNumber: '2', expirationDate: '2024-07-15', // Sắp hết hạn
    storageLocation: 'Tủ hóa chất chung (Nhiệt độ phòng)', qualityAssessment: 'Hộp còn nguyên vẹn',
    usageLog: [ { date: new Date('2023-10-20T14:30:00Z').toISOString(), reason: 'Pha dung dịch PBS', person: 'User', quantityChange: -200, newQuantity: 800 } ]
  },
  {
    id: 'chem-3', barcode: 'CHEM0003', name: 'Calibrator for AU480', casNumber: 'N/A', lotNumber: 'CALAU-1122',
    supplier: 'Beckman Coulter', quantity: 8, unit: 'hộp', initialQuantity: 10, dateReceived: '2024-01-20',
    personReceived: 'Admin', deliveryPerson: 'Giao hàng BC', sequenceNumber: '3', expirationDate: '2024-05-30', // Đã hết hạn
    storageLocation: 'Tủ lạnh 2-8°C', qualityAssessment: 'Đạt yêu cầu',
    usageLog: [ { date: new Date('2024-02-01T09:00:00Z').toISOString(), reason: 'Sử dụng cho máy AU480', person: 'User', quantityChange: -2, newQuantity: 8 } ]
  },
];

export const initialOnInstrumentStock: types.OnInstrumentStock[] = [
    { id: 'ois-1', chemicalId: 'chem-3', chemicalName: 'Calibrator for AU480', lotNumber: 'CALAU-1122', instrumentId: 'inst-1', quantity: 1, unit: 'lọ', movedToInstrumentAt: new Date().toISOString(), openVialExpiration: '2024-08-10' }
];

export const initialTestParameters: types.TestParameter[] = [
    { id: 'tp-1', name: 'Glucose', method: 'Hexokinase', unit: 'mg/dL', referenceRange: '70 - 100', tea: 10 },
    { id: 'tp-2', name: 'ALT', method: 'IFCC', unit: 'U/L', referenceRange: 'Nam: < 40\nNữ: < 32', tea: 20 },
];

export const initialControlMaterials: types.ControlMaterial[] = [
    { id: 'cm-1', name: 'Multiqual', level: 'Level 1', lotNumber: 'MQ202501', expirationDate: '2025-01-31' },
    { id: 'cm-2', name: 'Multiqual', level: 'Level 2', lotNumber: 'MQ202501', expirationDate: '2025-01-31' },
];

export const initialControlLotTargets: types.ControlLotTarget[] = [
    { id: 'clt-1', testParameterId: 'tp-1', controlMaterialId: 'cm-1', mean: 90, sd: 2 },
    { id: 'clt-2', testParameterId: 'tp-1', controlMaterialId: 'cm-2', mean: 250, sd: 5 },
    { id: 'clt-3', testParameterId: 'tp-2', controlMaterialId: 'cm-1', mean: 30, sd: 1.5 },
];

const generateIQCResults = (target: types.ControlLotTarget): types.IQCResult[] => {
    const results: types.IQCResult[] = [];
    for (let i = 0; i < 30; i++) {
        const date = new Date();
        date.setDate(date.getDate() - (30 - i));
        const value = target.mean + (Math.random() - 0.5) * target.sd * 2.5; // Simulate some variation
        results.push({
            id: `iqc-${target.id}-${i}`,
            testParameterId: target.testParameterId,
            controlMaterialId: target.controlMaterialId,
            date: date.toISOString(),
            value: parseFloat(value.toFixed(2)),
            recordedBy: 'User',
        });
    }
    // Add some violations
    results[25].value = target.mean + 3.1 * target.sd; // 1-3s
    results[20].value = target.mean - 2.2 * target.sd; // 2-2s
    results[19].value = target.mean - 2.3 * target.sd; // 2-2s
    return results;
}

export const initialIQCResults: types.IQCResult[] = initialControlLotTargets.flatMap(generateIQCResults);

export const initialJobRoles: types.JobRole[] = [
    { id: 'role-1', title: 'Trưởng khoa', description: 'Quản lý chung mọi hoạt động của khoa' },
    { id: 'role-4', title: 'Phó Trưởng khoa', description: 'Hỗ trợ Trưởng khoa quản lý các hoạt động được phân công' },
    { id: 'role-2', title: 'Kỹ thuật viên trưởng', description: 'Quản lý kỹ thuật, chất lượng xét nghiệm trong phòng' },
    { id: 'role-3', title: 'Kỹ thuật viên', description: 'Thực hiện các xét nghiệm' },
];

export const initialOrganizationUnits: types.OrganizationUnit[] = [
    { id: 'unit-1', name: 'Khoa Xét nghiệm', parentId: null },
    { id: 'unit-2', name: 'Phòng Hóa sinh - Miễn dịch', parentId: 'unit-1' },
    { id: 'unit-3', name: 'Phòng Huyết học - Đông máu', parentId: 'unit-1' },
];

export const initialPersonnel: types.PersonnelProfile[] = [
    { id: 'p-1', fullName: 'Nguyễn Văn A', employeeId: 'NV001', jobRoleId: 'role-1', organizationUnitId: 'unit-1', degree: 'Tiến sĩ', hireDate: '2010-05-15', documents: [] },
    { id: 'p-5', fullName: 'Hoàng Văn E', employeeId: 'NV005', jobRoleId: 'role-4', organizationUnitId: 'unit-1', degree: 'Thạc sĩ', hireDate: '2012-01-01', documents: [] },
    { id: 'p-2', fullName: 'Trần Thị B', employeeId: 'NV002', jobRoleId: 'role-2', organizationUnitId: 'unit-2', degree: 'Thạc sĩ', hireDate: '2015-08-20', documents: [] },
    { id: 'p-6', fullName: 'Đặng Thị F', employeeId: 'NV006', jobRoleId: 'role-2', organizationUnitId: 'unit-3', degree: 'Thạc sĩ', hireDate: '2016-01-01', documents: [] },
    { id: 'p-3', fullName: 'Lê Văn C', employeeId: 'NV003', jobRoleId: 'role-3', organizationUnitId: 'unit-2', degree: 'Cử nhân', hireDate: '2020-01-10', documents: [] },
    { id: 'p-4', fullName: 'Phạm Thị D', employeeId: 'NV004', jobRoleId: 'role-3', organizationUnitId: 'unit-3', degree: 'Cử nhân', hireDate: '2021-03-25', documents: [] },
];

export const initialPersonnelAssignmentHistory: types.PersonnelAssignmentHistory[] = initialPersonnel.map((p, index) => ({
    id: `hist-${index + 1}`,
    personnelId: p.id,
    organizationUnitId: p.organizationUnitId,
    startDate: p.hireDate,
    endDate: null,
}));


export const initialTrainees: types.TraineeProfile[] = [
    { id: 't-1', fullName: 'Trần Văn An', studentId: 'SV001', schoolOrInstitution: 'Đại học Y Hà Nội', trainingCourse: 'Thực tập Xét nghiệm Hóa sinh', startDate: '2024-06-01', endDate: '2024-08-31', supervisorId: 'p-3', status: 'đang học' },
    { id: 't-2', fullName: 'Lý Thị Bình', studentId: 'SV002', schoolOrInstitution: 'Cao đẳng Kỹ thuật Y tế', trainingCourse: 'Thực tập Xét nghiệm Huyết học', startDate: '2024-03-01', endDate: '2024-05-31', supervisorId: 'p-4', status: 'đã hoàn thành' },
];

export const initialWorkItems: types.WorkItem[] = [
    { id: 'wi-1', description: 'Chạy QC đầu ngày', frequency: 'daily' },
    { id: 'wi-2', description: 'Vệ sinh bề mặt máy', frequency: 'daily' },
    { id: 'wi-3', description: 'Kiểm tra và bổ sung thuốc thử', frequency: 'daily' },
    { id: 'wi-4', description: 'Kiểm tra rotor', frequency: 'weekly' },
    { id: 'wi-5', description: 'Lau chùi buồng ly tâm', frequency: 'weekly' },
    { id: 'wi-6', description: 'Bảo trì hàng tuần (Weekly maintenance)', frequency: 'weekly' },
    { id: 'wi-7', description: 'Bảo trì hàng tháng', frequency: 'monthly' },
    { id: 'wi-8', description: 'Thay thế đèn', frequency: 'replacement' },
    { id: 'wi-9', description: 'Kiểm tra đột xuất khi có sự cố', frequency: 'as_needed' },
];

export const initialLabEquipment: types.LabEquipment[] = [
    { 
        id: 'equip-1', name: 'Tủ lạnh 2-8°C #1', assetId: 'TL001', serialNumber: 'SN-TL-987', status: 'operational', 
        location: 'Phòng Hóa sinh', lastMaintenance: '2024-01-15', maintenanceInterval: 180, nextMaintenance: '2024-07-13',
        lastCalibration: '2024-01-15', calibrationInterval: 365, nextCalibration: '2025-01-14',
        maintenanceHistory: [],
        calibrationHistory: [],
        documents: [],
        operatingProcedure: '1. Kiểm tra nhiệt độ hàng ngày.\n2. Sắp xếp hóa chất ngăn nắp.\n3. Vệ sinh định kỳ hàng tháng.',
        associatedWorkItemIds: ['wi-2', 'wi-7']
    },
    { 
        id: 'equip-2', name: 'Máy ly tâm', assetId: 'MLT005', serialNumber: 'SN-MLT-123', status: 'operational', 
        location: 'Phòng Huyết học', lastMaintenance: '2023-11-20', maintenanceInterval: 90, nextMaintenance: '2024-02-18', // Quá hạn
        maintenanceHistory: [],
        calibrationHistory: [],
        documents: [],
        associatedWorkItemIds: ['wi-4', 'wi-5', 'wi-9']
    },
];

// FIX: Changed type to Omit<types.NonConformity, 'ncId'>[] as the ncId is generated dynamically in App.tsx
export const initialNonConformities: Omit<types.NonConformity, 'ncId'>[] = [
    { id: 'nc-1', date: '2024-05-10', description: 'Kết quả QC Glucose control 2 vượt ngưỡng +3SD trên máy AU480.', category: 'analytical', severity: 'severe', status: 'in_progress', reportedBy: 'Trần Thị B', rootCauseAnalysis: 'Có thể do thuốc thử lô mới hoặc do máy cần hiệu chuẩn lại.', correctiveAction: 'Chạy lại QC, kiểm tra thuốc thử và máy. Tạm ngưng trả kết quả Glucose.', preventiveAction: 'Xem xét lại quy trình thay lô thuốc thử QC.' },
    { id: 'nc-2', date: '2024-04-22', description: 'Mẫu máu của bệnh nhân X (khoa Cấp cứu) bị vỡ hồng cầu khi nhận.', category: 'pre-analytical', severity: 'minor', status: 'closed', reportedBy: 'Lê Văn C', rootCauseAnalysis: 'Kỹ thuật lấy mẫu của điều dưỡng chưa đúng.', correctiveAction: 'Yêu cầu lấy lại mẫu.', preventiveAction: 'Tập huấn lại cho điều dưỡng về kỹ thuật lấy mẫu.', closedBy: 'Trần Thị B', closedDate: '2024-04-23', actionEffectiveness: 'Tỷ lệ mẫu vỡ hồng cầu từ khoa Cấp cứu giảm trong tuần theo dõi.', preventiveActionId: 'pa-1' },
];

export const initialPreventiveActionReports: types.PreventiveActionReport[] = [
    { id: 'pa-1', reportId: 'HDPN-2407001', nonConformityId: 'nc-2', dateCreated: '2024-04-25', problemDescription: 'Tỷ lệ mẫu vỡ hồng cầu cao từ khoa Cấp cứu.', riskFactors: 'Nhân viên mới, thiếu kinh nghiệm lấy mẫu.', preventiveMeasures: 'Tổ chức buổi tập huấn kỹ thuật lấy mẫu cho điều dưỡng khoa Cấp cứu.', executor: 'Trần Thị B', executionDate: '2024-04-30', effectiveness: 'Tỷ lệ mẫu vỡ đã giảm đáng kể.', evaluator: 'Nguyễn Văn A', evaluationDate: '2024-05-10' }
];

const today = new Date();
const todayStr = today.toISOString().split('T')[0];
const yesterday = new Date();
yesterday.setDate(today.getDate() - 1);
const yesterdayStr = yesterday.toISOString().split('T')[0];


export const initialLeaveRecords: types.LeaveRecord[] = [
    { id: 'leave-1', personnelId: 'p-3', leaveType: 'Phép năm', startDate: todayStr, endDate: todayStr, reason: 'Việc gia đình', status: 'approved' }
];

export const initialAttendanceRecords: types.AttendanceRecord[] = [
    { id: 'att-1', personnelId: 'p-4', date: todayStr, checkIn: '08:15', checkOut: '17:05' }, // Late
    { id: 'att-2', personnelId: 'p-2', date: todayStr, checkIn: '07:55', checkOut: '16:45' }, // Early leave
    { id: 'att-3', personnelId: 'p-6', date: yesterdayStr, checkIn: '07:58', checkOut: '17:02' }, 
];

export const initialWorkSchedule: types.WorkSchedule = {
  startTime: '07:30',
  endTime: '16:30',
};

export const initialHolidays: types.Holiday[] = [
  { id: 'h-1', date: '2024-01-01', name: 'Tết Dương lịch' },
  { id: 'h-2', date: '2024-04-30', name: 'Giải phóng miền Nam' },
  { id: 'h-3', date: '2024-05-01', name: 'Quốc tế Lao động' },
  { id: 'h-4', date: '2024-09-02', name: 'Quốc khánh' },
];

export const initialTrainingCourses: types.TrainingCourse[] = [
    { id: 'course-1', title: 'An toàn Phòng xét nghiệm', provider: 'Nội bộ' },
    { id: 'course-2', title: 'Vận hành máy Sysmex XN-1000', provider: 'Sysmex' },
    { id: 'course-3', title: 'Quản lý chất lượng theo ISO 15189', provider: 'Viện Pasteur' },
];

export const initialTrainingRecords: types.TrainingRecord[] = [
    { id: 'tr-1', personnelId: 'p-3', courseId: 'course-1', completionDate: '2022-01-15' },
    { id: 'tr-2', personnelId: 'p-4', courseId: 'course-1', completionDate: '2022-01-15' },
    { id: 'tr-3', personnelId: 'p-4', courseId: 'course-2', completionDate: '2023-05-20', expiryDate: '2025-05-19' },
];

export const initialCompetencies: types.Competency[] = [
    { id: 'comp-1', name: 'Kỹ thuật Pipet', description: 'Sử dụng pipet các loại thể tích chính xác' },
    { id: 'comp-2', name: 'Vận hành máy AU480', description: 'Bao gồm bảo trì hàng ngày, chạy QC, chạy mẫu' },
    { id: 'comp-3', name: 'Định danh vi khuẩn', description: 'Sử dụng các phương pháp sinh hóa và tự động' },
];

export const initialCompetencyAssessments: types.CompetencyAssessment[] = [
    { id: 'ca-1', personnelId: 'p-3', competencyId: 'comp-1', assessmentDate: '2024-02-10', assessorId: 'p-2', result: 'Đạt', nextAssessmentDate: '2025-02-09' },
    { id: 'ca-2', personnelId: 'p-3', competencyId: 'comp-2', assessmentDate: '2024-03-15', assessorId: 'p-2', result: 'Cần cải thiện', notes: 'Cần xem lại quy trình xử lý lỗi' },
];

export const initialRoomLocations: types.RoomLocation[] = [
    { id: 'rl-1', name: 'Phòng Hóa sinh', description: 'Nơi đặt máy AU480 và Cobas e411'},
    { id: 'rl-2', name: 'Phòng Huyết học', description: 'Nơi đặt máy Sysmex XN-1000'},
];

export const initialEQAMaterials: types.EQAMaterial[] = [
    { id: 'eqa-1', name: 'EQA Hóa sinh chu kỳ 2401', provider: 'Biorad', lotNumber: 'EQAHS-2401', expirationDate: '2024-12-31'},
    { id: 'eqa-2', name: 'EQA Huyết học chu kỳ 2401', provider: 'Biorad', lotNumber: 'EQAHH-2401', expirationDate: '2024-12-31'},
];


export const initialEquipmentUsageLogs: types.EquipmentUsageLog[] = [];
export const initialDutyAssignments: types.DutyAssignment[] = [];
export const initialTaskAssignments: types.TaskAssignment[] = [];
export const initialKpiScores: types.KpiScore[] = [];
export const initialAuditLogs: types.AuditLog[] = [];
export const initialSystemSettings: types.SystemSettings = {};
export const initialBackupSettings: types.BackupSettings = { frequency: 'never', lastBackup: null };
export const initialManualPreparationLogs: types.ManualPreparationLog[] = [];
export const initialPlanningSlips: types.PlanningSlip[] = [];
export const initialDisposalRecords: types.DisposalRecord[] = [];
export const initialMonitoredAreas: types.MonitoredArea[] = [];
export const initialMonitoredEquipment: types.MonitoredEquipment[] = [];
export const initialWaterSources: types.WaterSource[] = [];
export const initialAccessLogs: types.AccessLog[] = [];
export const initialAreaEnvironmentLogs: types.AreaEnvironmentLog[] = [];
export const initialEquipmentTempLogs: types.EquipmentTemperatureLog[] = [];
export const initialWaterConductivityLogs: types.WaterConductivityLog[] = [];
export const initialIncidentReports: types.IncidentReport[] = [];
export const initialDocuments: types.LabDocument[] = [];
export const initialImprovementInitiatives: types.ImprovementInitiative[] = [];
export const initialCustomerFeedback: types.CustomerFeedback[] = [];
export const initialAuditRecords: types.AuditRecord[] = [];
export const initialMaintenanceChecklistLogs: types.MaintenanceChecklistLog[] = [];