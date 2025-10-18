import React, { useState, useEffect, useCallback } from 'react';
import LoginPage from './components/LoginPage';
import WarehouseManagementPage from './components/WarehouseManagementPage';
import QualityManagementPage from './components/QualityManagementPage';
import EnvironmentSafetyPage from './components/EnvironmentSafetyPage';
import PersonnelPage from './components/PersonnelPage';
import EquipmentPage from './components/EquipmentPage';
import DocumentsPage from './components/DocumentsPage';
import CustomerServicePage from './components/CustomerServicePage';
import ContinuousImprovementPage from './components/ContinuousImprovementPage';
import OrganizationPage from './components/OrganizationPage';
import SettingsPage from './components/SettingsPage';
import InformationManagementPage from './components/InformationManagementPage';
import AuditPage from './components/AuditPage';
import DataManagementPage from './components/DataManagementPage';
import AlertsPage from './components/AlertsPage';
import PersonnelFormModal from './components/PersonnelFormModal';
import TraineeFormModal from './components/TraineeFormModal';
import EquipmentFormModal from './components/EquipmentFormModal';
import EquipmentDetailModal from './components/EquipmentDetailModal';
import MaintenanceLogFormModal from './components/MaintenanceLogFormModal';
import CalibrationLogFormModal from './components/CalibrationLogFormModal';
import EquipmentDocumentFormModal, { EquipmentDocumentFormData } from './components/EquipmentDocumentFormModal';
import EquipmentUsageLogFormModal from './components/EquipmentUsageLogFormModal';
import DocumentViewerModal from './components/DocumentViewerModal';
import JobRoleFormModal from './components/JobRoleFormModal';
import OrganizationUnitFormModal from './components/OrganizationUnitFormModal';
import PersonnelDetailModal from './components/PersonnelDetailModal';
import PersonnelDocumentFormModal, { PersonnelDocumentFormData } from './components/PersonnelDocumentFormModal';
import LeaveFormModal from './components/LeaveFormModal';
import AttendanceFormModal from './components/AttendanceFormModal';
import DutyAssignmentFormModal from './components/DutyAssignmentFormModal';
import TaskAssignmentFormModal from './components/TaskAssignmentFormModal';
import MovePersonnelModal from './components/MovePersonnelModal';
import ConfirmationModal from './components/ConfirmationModal';
import ChemicalFormModal from './components/ChemicalFormModal';
import AdjustQuantityModal from './components/AdjustQuantityModal';
import UsageLogModal from './components/UsageLogModal';
import SafetyInfoModal from './components/SafetyInfoModal';
import BarcodeModal from './components/BarcodeModal';
import SafetyDocumentModal from './components/SafetyDocumentModal';
import MoveToInstrumentModal from './components/MoveToInstrumentModal';
import OnInstrumentAdjustModal, { OnInstrumentAdjustData } from './components/OnInstrumentAdjustModal';
import PlanningSlipModal from './components/PlanningSlipModal';
import DisposalFormModal from './components/DisposalFormModal';
import DisposalPrintView from './components/DisposalPrintView';
import TrainingCourseFormModal from './components/TrainingCourseFormModal';
import TrainingRecordFormModal from './components/TrainingRecordFormModal';
import CompetencyFormModal from './components/CompetencyFormModal';
import CompetencyAssessmentFormModal from './components/CompetencyAssessmentFormModal';
import NonConformityPage from './components/NonConformityPage';
import Chatbot, { ChatMessage } from './components/Chatbot';
import DocumentFormModal from './components/DocumentFormModal';
import NonConformityFormModal from './components/NonConformityFormModal';
// FIX: Import PreventiveActionFormModal to use it for managing preventive actions.
import PreventiveActionFormModal from './components/PreventiveActionFormModal';


// Import modals for Settings
import TestParameterFormModal from './components/TestParameterFormModal';
import ChemicalMasterFormModal from './components/ChemicalMasterFormModal';
import ChemicalMasterImportModal from './components/ChemicalMasterImportModal';
import InstrumentFormModal from './components/InstrumentFormModal';
import RoomLocationFormModal from './components/RoomLocationFormModal';
import StorageFormModal from './components/StorageFormModal';
import ControlMaterialFormModal from './components/ControlMaterialFormModal';
import EQAMaterialFormModal from './components/EQAMaterialFormModal';
import DocumentCategoryFormModal from './components/DocumentCategoryFormModal';
import UserFormModal from './components/UserFormModal';


import * as types from './types';
import * as data from './data';
import { getSafetyInfo, getChatbotResponse } from './services/geminiService';
import { utils, writeFile, read } from 'xlsx';

import { ArchiveBoxIcon } from './components/icons/ArchiveBoxIcon';
import { ChartBarSquareIcon } from './components/icons/ChartBarSquareIcon';
import { ShieldCheckIcon } from './components/icons/ShieldCheckIcon';
import { AcademicCapIcon } from './components/icons/AcademicCapIcon';
import { ToolIcon } from './components/icons/ToolIcon';
import { BookOpenIcon } from './components/icons/BookOpenIcon';
import { HeadphonesIcon } from './components/icons/HeadphonesIcon';
import { RecycleIcon } from './components/icons/RecycleIcon';
import { BuildingOfficeIcon } from './components/icons/BuildingOfficeIcon';
import { SettingsIcon } from './components/icons/SettingsIcon';
import { LogoutIcon } from './components/icons/LogoutIcon';
import { InformationIcon } from './components/icons/InformationIcon';
import { StarIcon } from './components/icons/StarIcon';
import { ExclamationTriangleIcon } from './components/icons/ExclamationTriangleIcon';
import { DatabaseIcon } from './components/icons/DatabaseIcon';
import { SparklesIcon } from './components/icons/SparklesIcon';
import { BellIcon } from './components/icons/BellIcon';
import { UserIcon } from './components/icons/UserIcon';


type Page = 
    | 'warehouse' | 'quality' | 'safety' | 'personnel' | 'equipment' | 'documents' 
    | 'customer' | 'improvement' | 'organization' | 'settings' | 'info' | 'audit' 
    | 'nonconformity' | 'dataManagement' | 'alerts';

type ActiveItemType = 'area' | 'equipment' | 'waterSource';

type ModalType = 
    | 'testParameter' | 'chemicalMaster' | 'instrument' | 'roomLocation' 
    | 'storage' | 'controlMaterial' | 'eqaMaterial' | 'documentCategory' | null;

const generateInitialNcIds = (ncs: Omit<types.NonConformity, 'ncId'>[]): types.NonConformity[] => {
    const sortedNcs = [...ncs].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const monthCounters: { [key: string]: number } = {};

    return sortedNcs.map(nc => {
        const date = new Date(nc.date + 'T00:00:00');
        const year = date.getFullYear();
        const month = date.getMonth();
        const monthKey = `${year}-${month}`;
        
        monthCounters[monthKey] = (monthCounters[monthKey] || 0) + 1;

        const yearStr = year.toString().slice(-2);
        const monthStr = (month + 1).toString().padStart(2, '0');
        const seqStr = monthCounters[monthKey].toString().padStart(3, '0');
        const numericId = `${yearStr}${monthStr}${seqStr}`;
        
        const newNc: types.NonConformity = {
            id: nc.id,
            date: nc.date,
            description: nc.description,
            category: nc.category,
            severity: nc.severity,
            status: nc.status,
            reportedBy: nc.reportedBy,
            rootCauseAnalysis: nc.rootCauseAnalysis,
            correctiveAction: nc.correctiveAction,
            preventiveAction: nc.preventiveAction,
            hdkpId: nc.hdkpId,
            detectionSources: nc.detectionSources,
            detectionSourceOther: nc.detectionSourceOther,
            actionPerformer: nc.actionPerformer,
            completionDate: nc.completionDate,
            implementationApproved: nc.implementationApproved,
            actionApprover: nc.actionApprover,
            implementationApprovalDate: nc.implementationApprovalDate,
            resultApproved: nc.resultApproved,
            actionEffectiveness: nc.actionEffectiveness,
            finalApprover: nc.finalApprover,
            closedBy: nc.closedBy,
            closedDate: nc.closedDate,
            ncId: `SKPH-${numericId}`,
        };

        if (newNc.correctiveAction && !newNc.hdkpId) {
            newNc.hdkpId = `HDKP-${numericId}`;
        }

        return newNc;
    });
};

const initialNonConformitiesWithIds = generateInitialNcIds(data.initialNonConformities);

const NavItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}> = ({ icon, label, isActive, onClick }) => (
  <li>
    <a
      href="#"
      onClick={onClick}
      className={`flex items-center p-3 text-sm rounded-lg mx-2 my-1 transition-colors ${
        isActive
          ? 'bg-blue-100 text-blue-700 font-bold'
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
      }`}
    >
      {icon}
      <span className="ml-3">{label}</span>
    </a>
  </li>
);

const App = () => {
    // ======== STATE MANAGEMENT ========
    const [currentUser, setCurrentUser] = useState<types.User | null>(null);
    const [activePage, setActivePage] = useState<Page>('nonconformity');

    // All application data states
    const [users, setUsers] = useState<types.User[]>(data.initialUsers);
    const [chemicals, setChemicals] = useState<types.Chemical[]>(data.initialChemicals);
    const [chemicalMasters, setChemicalMasters] = useState<types.ChemicalMaster[]>(data.initialChemicalMasters);
    const [storageLocations, setStorageLocations] = useState<types.StorageLocation[]>(data.initialStorageLocations);
    const [instruments, setInstruments] = useState<types.Instrument[]>(data.initialInstruments);
    const [onInstrumentStock, setOnInstrumentStock] = useState<types.OnInstrumentStock[]>(data.initialOnInstrumentStock);
    const [testParameters, setTestParameters] = useState<types.TestParameter[]>(data.initialTestParameters);
    const [controlMaterials, setControlMaterials] = useState<types.ControlMaterial[]>(data.initialControlMaterials);
    const [controlLotTargets, setControlLotTargets] = useState<types.ControlLotTarget[]>(data.initialControlLotTargets);
    const [iqcResults, setIqcResults] = useState<types.IQCResult[]>(data.initialIQCResults);
    const [personnel, setPersonnel] = useState<types.PersonnelProfile[]>(data.initialPersonnel);
    const [trainees, setTrainees] = useState<types.TraineeProfile[]>(data.initialTrainees);
    const [jobRoles, setJobRoles] = useState<types.JobRole[]>(data.initialJobRoles);
    const [organizationUnits, setOrganizationUnits] = useState<types.OrganizationUnit[]>(data.initialOrganizationUnits);
    const [labEquipment, setLabEquipment] = useState<types.LabEquipment[]>(data.initialLabEquipment);
    const [workItems, setWorkItems] = useState<types.WorkItem[]>(data.initialWorkItems);
    const [nonConformities, setNonConformities] = useState<types.NonConformity[]>(initialNonConformitiesWithIds.sort((a,b) => b.date.localeCompare(a.date)));
    const [leaveRecords, setLeaveRecords] = useState<types.LeaveRecord[]>(data.initialLeaveRecords);
    const [attendanceRecords, setAttendanceRecords] = useState<types.AttendanceRecord[]>(data.initialAttendanceRecords);
    const [workSchedule, setWorkSchedule] = useState<types.WorkSchedule>(data.initialWorkSchedule);
    const [holidays, setHolidays] = useState<types.Holiday[]>(data.initialHolidays);
    const [dutyAssignments, setDutyAssignments] = useState<types.DutyAssignment[]>(data.initialDutyAssignments);
    const [taskAssignments, setTaskAssignments] = useState<types.TaskAssignment[]>(data.initialTaskAssignments);
    const [personnelAssignmentHistory, setPersonnelAssignmentHistory] = useState<types.PersonnelAssignmentHistory[]>(data.initialPersonnelAssignmentHistory);
    const [kpiScores, setKpiScores] = useState<types.KpiScore[]>(data.initialKpiScores);
    const [monitoredAreas, setMonitoredAreas] = useState<types.MonitoredArea[]>(data.initialMonitoredAreas);
    const [monitoredEquipment, setMonitoredEquipment] = useState<types.MonitoredEquipment[]>(data.initialMonitoredEquipment);
    const [waterSources, setWaterSources] = useState<types.WaterSource[]>(data.initialWaterSources);
    const [accessLogs, setAccessLogs] = useState<types.AccessLog[]>(data.initialAccessLogs);
    const [areaEnvLogs, setAreaEnvLogs] = useState<types.AreaEnvironmentLog[]>(data.initialAreaEnvironmentLogs);
    const [equipEnvLogs, setEquipEnvLogs] = useState<types.EquipmentTemperatureLog[]>(data.initialEquipmentTempLogs);
    const [waterConductivityLogs, setWaterConductivityLogs] = useState<types.WaterConductivityLog[]>(data.initialWaterConductivityLogs);
    const [incidentReports, setIncidentReports] = useState<types.IncidentReport[]>(data.initialIncidentReports);
    const [trainingCourses, setTrainingCourses] = useState<types.TrainingCourse[]>(data.initialTrainingCourses);
    const [trainingRecords, setTrainingRecords] = useState<types.TrainingRecord[]>(data.initialTrainingRecords);
    const [competencies, setCompetencies] = useState<types.Competency[]>(data.initialCompetencies);
    const [competencyAssessments, setCompetencyAssessments] = useState<types.CompetencyAssessment[]>(data.initialCompetencyAssessments);
    const [equipmentUsageLogs, setEquipmentUsageLogs] = useState<types.EquipmentUsageLog[]>(data.initialEquipmentUsageLogs);
    const [roomLocations, setRoomLocations] = useState<types.RoomLocation[]>(data.initialRoomLocations);
    const [eqaMaterials, setEqaMaterials] = useState<types.EQAMaterial[]>(data.initialEQAMaterials);
    const [documentCategories, setDocumentCategories] = useState<types.DocumentCategory[]>(data.initialDocumentCategories);
    const [maintenanceChecklistLogs, setMaintenanceChecklistLogs] = useState<types.MaintenanceChecklistLog[]>(data.initialMaintenanceChecklistLogs);
    // FIX: Add state for preventive action reports to be managed in the app.
    const [preventiveActionReports, setPreventiveActionReports] = useState<types.PreventiveActionReport[]>(data.initialPreventiveActionReports);

    
    // States initialized with empty arrays as they are transactional
    const [manualPreparationLogs, setManualPreparationLogs] = useState<types.ManualPreparationLog[]>(data.initialManualPreparationLogs);
    const [planningSlips, setPlanningSlips] = useState<types.PlanningSlip[]>(data.initialPlanningSlips);
    const [disposalRecords, setDisposalRecords] = useState<types.DisposalRecord[]>(data.initialDisposalRecords);
    const [auditLogs, setAuditLogs] = useState<types.AuditLog[]>(data.initialAuditLogs);
    const [documents, setDocuments] = useState<types.LabDocument[]>(data.initialDocuments);
    const [improvementInitiatives, setImprovementInitiatives] = useState<types.ImprovementInitiative[]>(data.initialImprovementInitiatives);
    const [customerFeedback, setCustomerFeedback] = useState<types.CustomerFeedback[]>(data.initialCustomerFeedback);
    const [auditRecords, setAuditRecords] = useState<types.AuditRecord[]>(data.initialAuditRecords);

    // Modal States
    const [isPersonnelFormModalOpen, setPersonnelFormModalOpen] = useState(false);
    const [editingPersonnel, setEditingPersonnel] = useState<types.PersonnelProfile | null>(null);
    const [isTraineeFormModalOpen, setTraineeFormModalOpen] = useState(false);
    const [editingTrainee, setEditingTrainee] = useState<types.TraineeProfile | null>(null);
    const [isEquipmentFormModalOpen, setEquipmentFormModalOpen] = useState(false);
    const [editingEquipment, setEditingEquipment] = useState<types.LabEquipment | null>(null);
    const [isEquipmentDetailModalOpen, setEquipmentDetailModalOpen] = useState(false);
    const [isMaintenanceLogModalOpen, setMaintenanceLogModalOpen] = useState(false);
    const [isCalibrationLogModalOpen, setCalibrationLogModalOpen] = useState(false);
    const [isEquipmentDocModalOpen, setEquipmentDocModalOpen] = useState(false);
    const [isEquipmentUsageLogModalOpen, setEquipmentUsageLogModalOpen] = useState(false);
    const [documentToView, setDocumentToView] = useState<types.LabDocument | types.EquipmentDocument | types.PersonnelDocument | null>(null);
    const [isJobRoleModalOpen, setJobRoleModalOpen] = useState(false);
    const [editingJobRole, setEditingJobRole] = useState<types.JobRole | null>(null);
    const [isOrgUnitModalOpen, setOrgUnitModalOpen] = useState(false);
    const [editingOrgUnit, setEditingOrgUnit] = useState<types.OrganizationUnit | null>(null);
    const [orgUnitParentId, setOrgUnitParentId] = useState<string | null>(null);
    const [isPersonnelDetailModalOpen, setPersonnelDetailModalOpen] = useState(false);
    const [isPersonnelDocModalOpen, setPersonnelDocModalOpen] = useState(false);
    const [isLeaveModalOpen, setLeaveModalOpen] = useState(false);
    const [editingLeave, setEditingLeave] = useState<types.LeaveRecord | null>(null);
    const [isAttendanceModalOpen, setAttendanceModalOpen] = useState(false);
    const [attendanceContext, setAttendanceContext] = useState<{personnelId: string, date: string, record?: types.AttendanceRecord} | null>(null);
    const [isDutyModalOpen, setDutyModalOpen] = useState(false);
    const [isTaskModalOpen, setTaskModalOpen] = useState(false);
    const [assignmentContext, setAssignmentContext] = useState<{ personnelId: string, date: string} | null>(null);
    const [isMovePersonnelModalOpen, setMovePersonnelModalOpen] = useState(false);
    const [isDocumentFormModalOpen, setDocumentFormModalOpen] = useState(false);
    const [editingDocument, setEditingDocument] = useState<types.LabDocument | null>(null);
    const [isNonConformityModalOpen, setNonConformityModalOpen] = useState(false);
    const [editingNonConformity, setEditingNonConformity] = useState<types.NonConformity | null>(null);
    // FIX: Add modal state for Preventive Actions to enable adding/editing reports.
    const [isPreventiveActionModalOpen, setPreventiveActionModalOpen] = useState(false);
    const [editingPreventiveAction, setEditingPreventiveAction] = useState<types.PreventiveActionReport | null>(null);


    // Modal States for Warehouse
    const [isChemicalFormModalOpen, setChemicalFormModalOpen] = useState(false);
    const [isAdjustModalOpen, setAdjustModalOpen] = useState(false);
    const [isUsageLogModalOpen, setUsageLogModalOpen] = useState(false);
    const [isSafetyInfoModalOpen, setSafetyInfoModalOpen] = useState(false);
    const [isBarcodeModalOpen, setBarcodeModalOpen] = useState(false);
    const [isSafetyDocModalOpen, setSafetyDocModalOpen] = useState(false);
    const [isMoveToInstrumentModalOpen, setMoveToInstrumentModalOpen] = useState(false);
    const [isOnInstrumentAdjustModalOpen, setOnInstrumentAdjustModalOpen] = useState(false);
    const [isPlanningSlipModalOpen, setPlanningSlipModalOpen] = useState(false);
    const [isDisposalFormModalOpen, setDisposalFormModalOpen] = useState(false);
    const [isDisposalPrintOpen, setIsDisposalPrintOpen] = useState(false);
    
    // Modal states for Training/Competency
    const [isTrainingCourseModalOpen, setTrainingCourseModalOpen] = useState(false);
    const [editingTrainingCourse, setEditingTrainingCourse] = useState<types.TrainingCourse | null>(null);
    const [isTrainingRecordModalOpen, setTrainingRecordModalOpen] = useState(false);
    const [isCompetencyModalOpen, setCompetencyModalOpen] = useState(false);
    const [editingCompetency, setEditingCompetency] = useState<types.Competency | null>(null);
    const [isCompetencyAssessmentModalOpen, setCompetencyAssessmentModalOpen] = useState(false);

    // Modal states for Settings
    const [isSettingsModalOpen, setSettingsModalOpen] = useState(false);
    const [settingsModalType, setSettingsModalType] = useState<ModalType>(null);
    const [editingSettingsItem, setEditingSettingsItem] = useState<any>(null);
    const [isChemicalMasterImportModalOpen, setChemicalMasterImportModalOpen] = useState(false);
    const [isUserFormModalOpen, setUserFormModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<types.User | null>(null);


    // Generic Confirmation Modal State
    const [confirmation, setConfirmation] = useState<{ title: string; message: string | React.ReactNode; onConfirm: () => void; } | null>(null);


    // Data for Modals
    const [editingChemical, setEditingChemical] = useState<types.Chemical | Partial<types.Chemical> | null>(null);
    const [chemicalToAdjust, setChemicalToAdjust] = useState<types.Chemical | null>(null);
    const [chemicalForLog, setChemicalForLog] = useState<types.Chemical | null>(null);
    const [chemicalForSafety, setChemicalForSafety] = useState<types.Chemical | null>(null);
    const [chemicalForBarcode, setChemicalForBarcode] = useState<types.Chemical | null>(null);
    const [chemicalForDoc, setChemicalForDoc] = useState<types.Chemical | null>(null);
    const [chemicalToMove, setChemicalToMove] = useState<types.Chemical | null>(null);
    const [slipToView, setSlipToView] = useState<types.PlanningSlip | null>(null);
    const [stockToAdjust, setStockToAdjust] = useState<{ stock: types.OnInstrumentStock; action: 'use' | 'return' | 'discard' } | null>(null);
    const [editingDisposal, setEditingDisposal] = useState<types.DisposalRecord | null>(null);
    const [disposalToPrint, setDisposalToPrint] = useState<types.DisposalRecord | null>(null);

    // Async state for AI
    const [safetyInfo, setSafetyInfo] = useState('');
    const [isSafetyInfoLoading, setSafetyInfoLoading] = useState(false);
    
    // Chatbot States
    const [isChatbotOpen, setIsChatbotOpen] = useState(false);
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
    const [isChatbotLoading, setIsChatbotLoading] = useState(false);


    const addAuditLog = useCallback((action: string, details: string) => {
        if (!currentUser) return;
        const newLog: types.AuditLog = {
            id: `log-${Date.now()}`,
            timestamp: new Date().toISOString(),
            user: currentUser.fullName,
            action,
            details,
        };
        setAuditLogs(prev => [newLog, ...prev]);
    }, [currentUser]);
    
    // ======== GENERIC CONFIRMATION HANDLERS ========
    const requestConfirmation = (title: string, message: string | React.ReactNode, onConfirm: () => void) => {
        setConfirmation({ title, message, onConfirm });
    };

    const closeConfirmation = () => {
        setConfirmation(null);
    };

    const handleConfirm = () => {
        if (confirmation) {
            confirmation.onConfirm();
            setConfirmation(null);
        }
    };



    // ======== HANDLERS ========
    const handleLogin = (username: string, password_hash: string): types.User | null => {
        const user = users.find(u => u.username === username && u.passwordHash === password_hash);
        if (user) {
            setCurrentUser(user);
            addAuditLog('Đăng nhập', `Người dùng ${user.fullName} đã đăng nhập.`);
            return user;
        }
        return null;
    };

    const handleLogout = () => {
        if (currentUser) {
            addAuditLog('Đăng xuất', `Người dùng ${currentUser.fullName} đã đăng xuất.`);
        }
        setCurrentUser(null);
    };
    
    // ======== CHATBOT HANDLER ========
    const handleSendQuery = async (query: string) => {
        const userMessage: ChatMessage = { role: 'user', parts: [{ text: query }] };
        const newHistory = [...chatHistory, userMessage];
        setChatHistory(newHistory);
        setIsChatbotLoading(true);

        const allAppContext = {
            currentUser, users, chemicals, chemicalMasters, storageLocations, instruments, onInstrumentStock,
            testParameters, controlMaterials, controlLotTargets, iqcResults, personnel,
            trainees, jobRoles, organizationUnits, labEquipment, nonConformities, leaveRecords,
            attendanceRecords, workSchedule, holidays, dutyAssignments, taskAssignments,
            personnelAssignmentHistory, kpiScores, manualPreparationLogs, planningSlips,
            disposalRecords, auditLogs, documents, improvementInitiatives, customerFeedback,
            auditRecords, monitoredAreas, monitoredEquipment, waterSources, accessLogs,
            areaEnvLogs, equipEnvLogs, waterConductivityLogs, incidentReports, trainingCourses,
            trainingRecords, competencies, competencyAssessments, equipmentUsageLogs,
            roomLocations, eqaMaterials,
        };

        try {
            const responseText = await getChatbotResponse(query, allAppContext, newHistory);
            const modelMessage: ChatMessage = { role: 'model', parts: [{ text: responseText }] };
            setChatHistory(prev => [...prev, modelMessage]);
        } catch (error) {
            const errorMessage: ChatMessage = { role: 'model', parts: [{ text: "Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại." }] };
            setChatHistory(prev => [...prev, errorMessage]);
        } finally {
            setIsChatbotLoading(false);
        }
    };


    // ======== WAREHOUSE HANDLERS ========
    const handleAddOrUpdateChemical = (chemicalData: Omit<types.Chemical, 'id' | 'barcode'> | types.Chemical) => {
        if ('id' in chemicalData) {
            // Update
            setChemicals(prev => prev.map(c => c.id === chemicalData.id ? chemicalData : c));
            addAuditLog('Cập nhật hóa chất', `Cập nhật thông tin cho ${chemicalData.name}`);
        } else {
            // Add new
            const newChemical: types.Chemical = {
                ...(chemicalData as any),
                id: `chem-${Date.now()}`,
                barcode: `CHEM${String(chemicalData.sequenceNumber).padStart(4, '0')}`,
                usageLog: [{
                    date: new Date().toISOString(),
                    reason: 'Nhập kho lần đầu',
                    person: chemicalData.personReceived,
                    quantityChange: chemicalData.quantity,
                    newQuantity: chemicalData.quantity,
                }]
            };
            setChemicals(prev => [...prev, newChemical]);
            addAuditLog('Nhập kho', `Nhập mới hóa chất ${newChemical.name}, lô ${newChemical.lotNumber}`);
        }
    };

    const handleDeleteChemical = (id: string) => {
        const chemical = chemicals.find(c => c.id === id);
        if (!chemical) return;
        
        requestConfirmation(
            'Xác nhận Xóa Hóa chất',
            `Bạn có chắc chắn muốn xóa hóa chất "${chemical.name}"? Hành động này không thể hoàn tác.`,
            () => {
                setChemicals(prev => prev.filter(c => c.id !== id));
                addAuditLog('Xóa hóa chất', `Đã xóa ${chemical.name}, lô ${chemical.lotNumber}`);
            }
        );
    };

    const handleGetSafetyInfo = async (chemical: types.Chemical) => {
        setChemicalForSafety(chemical);
        setSafetyInfoModalOpen(true);
        setSafetyInfoLoading(true);
        setSafetyInfo('');
        try {
            const info = await getSafetyInfo(chemical.name, chemical.casNumber);
            setSafetyInfo(info);
        } catch (e) {
            setSafetyInfo('Không thể tải thông tin an toàn. Vui lòng thử lại.');
        } finally {
            setSafetyInfoLoading(false);
        }
    };

    const handleAdjustQuantity = (chemicalId: string, change: number, reason: string, person: string, changeType: 'use' | 'add' | 'destroy', recipient?: string) => {
        setChemicals(prev => prev.map(c => {
            if (c.id === chemicalId) {
                const newQuantity = c.quantity + change;
                const newLog: types.UsageLogEntry = {
                    date: new Date().toISOString(),
                    reason,
                    person,
                    recipient,
                    quantityChange: change,
                    newQuantity: newQuantity
                };
                return {
                    ...c,
                    quantity: newQuantity,
                    usageLog: [ ...(c.usageLog || []), newLog ]
                };
            }
            return c;
        }));
        const chemical = chemicals.find(c=>c.id === chemicalId);
        if(chemical) addAuditLog('Điều chỉnh kho', `Điều chỉnh ${change} ${chemical.unit} cho ${chemical.name} (Lô ${chemical.lotNumber}). Lý do: ${reason}`);
        setAdjustModalOpen(false);
    };

    const handleMoveToInstrument = (instrumentId: string, quantity: number, openVialExpiration?: string) => {
        if (!chemicalToMove) return;
        
        const instrument = instruments.find(i => i.id === instrumentId);
        if (!instrument) return;

        const newOnInstrumentStock: types.OnInstrumentStock = {
            id: `ois-${Date.now()}`,
            chemicalId: chemicalToMove.id,
            chemicalName: chemicalToMove.name,
            lotNumber: chemicalToMove.lotNumber,
            instrumentId: instrumentId,
            quantity: quantity,
            unit: chemicalToMove.unit,
            movedToInstrumentAt: new Date().toISOString(),
            openVialExpiration: openVialExpiration,
        };
        setOnInstrumentStock(prev => [...prev, newOnInstrumentStock]);

        const reason = `Chuyển ${quantity} ${chemicalToMove.unit} lên máy ${instrument.name}`;
        handleAdjustQuantity(chemicalToMove.id, -quantity, reason, currentUser!.fullName, 'use', `Cho máy: ${instrument.name}`);

        setMoveToInstrumentModalOpen(false);
    };

    const handleConfirmInstrumentAdjust = (data: OnInstrumentAdjustData) => {
        if (!stockToAdjust) return;
        const { stock, action } = stockToAdjust;

        const changeAmount = data.quantity;
        const reason = data.reason;
        const person = currentUser!.fullName;

        const newOnInstrumentQty = stock.quantity - changeAmount;
        if (newOnInstrumentQty > 0) {
            setOnInstrumentStock(prev => prev.map(s => s.id === stock.id ? { ...s, quantity: newOnInstrumentQty } : s));
        } else {
            setOnInstrumentStock(prev => prev.filter(s => s.id !== stock.id));
        }

        const originalChemical = chemicals.find(c => c.id === stock.chemicalId);
        if (originalChemical) {
            const logReason = action === 'use' ? `Sử dụng trên máy: ${reason}` : (action === 'return' ? `Trả về kho từ máy: ${reason}` : `Hủy trên máy: ${reason}`);
            const quantityChange = action === 'return' ? changeAmount : 0;
            const newQuantity = originalChemical.quantity + quantityChange;
            const newLog: types.UsageLogEntry = {
                date: new Date().toISOString(),
                reason: logReason,
                person: person,
                quantityChange: quantityChange,
                newQuantity: newQuantity
            };
            
            setChemicals(prev => prev.map(c => c.id === stock.chemicalId ? {...c, quantity: newQuantity, usageLog: [...(c.usageLog || []), newLog]} : c));
            addAuditLog('Điều chỉnh trên máy', `${logReason} (${changeAmount} ${stock.unit})`);
        }

        setOnInstrumentAdjustModalOpen(false);
    };

    const handleSavePlanningSlip = (items: types.PlannedItem[]): types.PlanningSlip => {
        const newSlip: types.PlanningSlip = {
            id: `SLIP-${Date.now()}`,
            createdAt: new Date().toISOString(),
            createdBy: currentUser!.fullName,
            items,
        };
        setPlanningSlips(prev => [newSlip, ...prev].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        addAuditLog('Tạo phiếu dự trù', `Tạo phiếu ${newSlip.id} với ${items.length} mặt hàng.`);
        return newSlip;
    };

    const handleUpdatePhysicalCount = (chemicalId: string, actualQuantity: number, person: string) => {
        const chemical = chemicals.find(c => c.id === chemicalId);
        if (!chemical) return;
        
        const change = actualQuantity - chemical.quantity;
        if(change !== 0) {
            handleAdjustQuantity(chemicalId, change, `Kiểm kê (thực tế: ${actualQuantity}, hệ thống: ${chemical.quantity})`, person, change > 0 ? 'add' : 'use');
        }
    };

    const handleAddOrUpdateDisposalRecord = (recordData: Omit<types.DisposalRecord, 'id'> | types.DisposalRecord) => {
        if ('id' in recordData) {
            setDisposalRecords(prev => prev.map(r => r.id === recordData.id ? recordData : r));
            addAuditLog('Cập nhật biên bản hủy', `Cập nhật BB hủy cho ${recordData.itemName}`);
        } else {
            const newRecord: types.DisposalRecord = { id: `disp-${Date.now()}`, ...recordData };
            setDisposalRecords(prev => [newRecord, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
            addAuditLog('Tạo biên bản hủy', `Tạo BB hủy cho ${newRecord.itemName}`);
        }
    };

    const handleDeleteDisposalRecord = (id: string) => {
        const record = disposalRecords.find(r => r.id === id);
        if (!record) return;

        requestConfirmation(
            'Xác nhận Xóa Biên bản Hủy',
            `Bạn có chắc chắn muốn xóa biên bản hủy cho "${record.itemName}"?`,
            () => {
                setDisposalRecords(prev => prev.filter(r => r.id !== id));
                addAuditLog('Xóa biên bản hủy', `Đã xóa BB hủy cho ${record.itemName}`);
            }
        );
    };

    const handleExportDisposalToExcel = (record: types.DisposalRecord) => {
        const dataToExport = [{'Ngày': record.date, 'Tên vật tư': record.itemName, 'Nhà cung cấp': record.supplier, 'Số lô': record.lotNumber, 'Số lượng': record.quantity, 'Lý do': record.reason, 'Có thay thế': record.isReplaced, 'Phương pháp hủy': record.disposalMethod, 'Người phê duyệt': record.approver, 'Người thực hiện': record.executor }];
        const ws = utils.json_to_sheet(dataToExport);
        const wb = utils.book_new();
        utils.book_append_sheet(wb, ws, `BienBanHuy_${record.id}`);
        writeFile(wb, `Bien_ban_huy_${record.itemName.replace(/\s+/g, '_')}.xlsx`);
    };

    const handleExportDisposalToDoc = (record: types.DisposalRecord) => {
        const formatDateForDoc = (dateStr: string) => {
            if (!dateStr) return { day: '...', month: '...', year: '...' };
            const date = new Date(dateStr + 'T00:00:00');
            return {
                day: String(date.getDate()).padStart(2, '0'),
                month: String(date.getMonth() + 1).padStart(2, '0'),
                year: date.getFullYear()
            };
        };
        const recordDate = formatDateForDoc(record.date);

        const reasonLower = record.reason.toLowerCase();
        const isExpired = reasonLower.includes('hết hạn') || reasonLower.includes('quá hạn');
        const isSubstandard = reasonLower.includes('kém chất lượng') || reasonLower.includes('không đạt');
        const isOtherReason = !isExpired && !isSubstandard;

        const checkbox = { checked: '&#9746;', unchecked: '&#9744;' };

        const htmlContent = `
            <html xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
            <head>
                <meta charset="UTF-8">
                <title>Bien Ban Huy Vat Tu</title>
                <style>
                    body { font-family: 'Times New Roman', serif; font-size: 12pt; }
                    .container { width: 600px; margin: auto; }
                    .header, .title { text-align: center; }
                    .header p { margin: 2px; font-weight: bold;}
                    .title { font-size: 16pt; font-weight: bold; margin-top: 20px; margin-bottom: 20px; }
                    .field-table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
                    .field-table td { padding: 5px 0; vertical-align: bottom; }
                    .label { font-weight: normal; white-space: nowrap; padding-right: 5px; }
                    .value { width: 100%; border-bottom: 1px dotted black; }
                    .checkbox-label { font-weight: normal; }
                    .checkbox { font-family: 'Segoe UI Symbol', sans-serif; font-size: 14pt; margin-right: 5px; }
                    .signature-section { margin-top: 80px; display: flex; justify-content: space-around; }
                    .signature-block { text-align: center; }
                    .signature-block .role { font-weight: bold; }
                    .signature-block .date-line { margin-top: 60px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <p>BỆNH VIỆN ĐẠI HỌC Y DƯỢC</p>
                        <p>KHOA XÉT NGHIỆM</p>
                    </div>
                    <h1 class="title">BIÊN BẢN HỦY THUỐC/VẬT TƯ</h1>

                    <table class="field-table">
                        <tr><td class="label">Ngày:</td><td class="value">${record.date ? new Date(record.date + 'T00:00:00').toLocaleDateString('vi-VN') : ''}</td></tr>
                        <tr><td class="label">Tên thuốc/vật tư:</td><td class="value">${record.itemName || ''}</td></tr>
                        <tr><td class="label">Mã sản phẩm:</td><td class="value"></td></tr>
                        <tr><td class="label">Nhà cung cấp:</td><td class="value">${record.supplier || ''}</td></tr>
                        <tr><td class="label">Số lô/lot:</td><td class="value">${record.lotNumber || ''}</td></tr>
                        <tr><td class="label">Hạn sử dụng:</td><td class="value"></td></tr>
                        <tr><td class="label">Số lượng:</td><td class="value">${record.quantity || ''}</td></tr>
                    </table>
                    
                    <div style="margin-top: 15px;">
                        <span class="checkbox-label">Lý do hủy:</span>
                        <span class="checkbox">${isExpired ? checkbox.checked : checkbox.unchecked}</span> Quá hạn
                        <span style="margin-left: 20px;"><span class="checkbox">${isSubstandard ? checkbox.checked : checkbox.unchecked}</span> Không đạt chất lượng</span>
                        <span style="margin-left: 20px;"><span class="checkbox">${isOtherReason ? checkbox.checked : checkbox.unchecked}</span> Nguyên nhân khác</span>
                        <div style="border-bottom: 1px dotted black; margin-top: 5px; min-height: 18px;">${isOtherReason ? record.reason : ''}</div>
                        <div style="border-bottom: 1px dotted black; margin-top: 5px; min-height: 18px;"></div>
                    </div>
                    
                    <div style="margin-top: 15px;">
                        <span class="checkbox-label">Nhà cung cấp có thay thế mặt hàng đó?</span>
                        <span style="margin-left: 20px;"><span class="checkbox">${record.isReplaced === 'yes' ? checkbox.checked : checkbox.unchecked}</span> Có</span>
                        <span style="margin-left: 20px;"><span class="checkbox">${record.isReplaced === 'no' ? checkbox.checked : checkbox.unchecked}</span> Không</span>
                    </div>
                    
                    <div style="margin-top: 15px;">
                        <span class="checkbox-label">Phương pháp hủy:</span>
                        <div style="border-bottom: 1px dotted black; margin-top: 5px; min-height: 18px;">${record.disposalMethod || ''}</div>
                        <div style="border-bottom: 1px dotted black; margin-top: 5px; min-height: 18px;"></div>
                        <div style="border-bottom: 1px dotted black; margin-top: 5px; min-height: 18px;"></div>
                    </div>
                    
                    <div class="signature-section">
                        <div class="signature-block">
                            <p><i>Ngày ${recordDate.day} tháng ${recordDate.month} năm ${recordDate.year}</i></p>
                            <p class="role">NGƯỜI DUYỆT</p>
                            <p class="date-line">${record.approver}</p>
                        </div>
                        <div class="signature-block">
                            <p><i>Ngày ${recordDate.day} tháng ${recordDate.month} năm ${recordDate.year}</i></p>
                            <p class="role">NGƯỜI LẬP</p>
                            <p class="date-line">${record.executor}</p>
                        </div>
                    </div>
                </div>
            </body>
            </html>
        `;

        const blob = new Blob([htmlContent], { type: 'application/msword' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Bien_ban_huy_${record.itemName.replace(/\s+/g, '_')}_${record.id}.doc`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleAddManualEntry = (logData: Omit<types.ManualPreparationLog, 'id'>) => {
        const newEntry: types.ManualPreparationLog = { id: `prep-${Date.now()}`, ...logData };
        setManualPreparationLogs(prev => [newEntry, ...prev]);
        addAuditLog('Pha chế thủ công', `Ghi nhận pha chế cho ${logData.chemicalName}`);
    };
    
    const handleDownloadStockInTemplate = () => {
        const headers = [
            "Tên hóa chất (*)", "Số CAS (*)", "Số lô (*)", "Số thứ tự (*)",
            "Số lượng (*)", "Đơn vị (*)", "Hạn sử dụng (YYYY-MM-DD) (*)", "Ngày nhận (YYYY-MM-DD) (*)",
            "Người nhận (*)", "Nhà cung cấp", "Người giao hàng", "Vị trí lưu trữ", "Đánh giá chất lượng"
        ];
        const ws = utils.aoa_to_sheet([headers]);
        const wb = utils.book_new();
        utils.book_append_sheet(wb, ws, "MauNhapKho");
        writeFile(wb, "Mau_Nhap_Kho_Hoa_Chat.xlsx");
    };

    const handleImportStockIn = (file: File, mode: 'replace' | 'append') => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = e.target?.result;
                const workbook = read(data, { type: 'binary', cellDates: true });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const json: any[] = utils.sheet_to_json(worksheet);

                const headerMapping: { [key: string]: keyof Partial<types.Chemical> } = {
                    "Tên hóa chất (*)": "name", "Số CAS (*)": "casNumber", "Số lô (*)": "lotNumber",
                    "Số thứ tự (*)": "sequenceNumber", "Số lượng (*)": "quantity", "Đơn vị (*)": "unit",
                    "Hạn sử dụng (YYYY-MM-DD) (*)": "expirationDate", "Ngày nhận (YYYY-MM-DD) (*)": "dateReceived",
                    "Người nhận (*)": "personReceived", "Nhà cung cấp": "supplier", "Người giao hàng": "deliveryPerson",
                    "Vị trí lưu trữ": "storageLocation", "Đánh giá chất lượng": "qualityAssessment"
                };

                const newChemicals: types.Chemical[] = json.map((row, index) => {
                    const chemicalData: Partial<types.Chemical> = {};
                    for (const header in headerMapping) {
                        if (row[header] !== undefined) {
                            const key = headerMapping[header];
                            (chemicalData as any)[key] = row[header];
                        }
                    }

                    if (!chemicalData.name || !chemicalData.casNumber || !chemicalData.lotNumber || !chemicalData.sequenceNumber || !chemicalData.quantity || !chemicalData.unit || !chemicalData.expirationDate || !chemicalData.dateReceived || !chemicalData.personReceived) {
                        throw new Error(`Dòng ${index + 2} trong file Excel thiếu thông tin bắt buộc.`);
                    }
                    
                    const safeFormatDate = (d: any) => {
                        if (d instanceof Date) {
                            const year = d.getUTCFullYear();
                            const month = String(d.getUTCMonth() + 1).padStart(2, '0');
                            const day = String(d.getUTCDate()).padStart(2, '0');
                            return `${year}-${month}-${day}`;
                        }
                        return String(d);
                    };
                    
                    chemicalData.expirationDate = safeFormatDate(chemicalData.expirationDate);
                    chemicalData.dateReceived = safeFormatDate(chemicalData.dateReceived);

                    const quantity = Number(chemicalData.quantity);
                    if (isNaN(quantity)) {
                         throw new Error(`Số lượng ở dòng ${index + 2} không hợp lệ.`);
                    }

                    const newChemical: types.Chemical = {
                        ...(chemicalData as any),
                        id: `chem-${Date.now()}-${index}`,
                        barcode: `CHEM${String(chemicalData.sequenceNumber).padStart(4, '0')}`,
                        initialQuantity: quantity,
                        quantity: quantity,
                        usageLog: [{
                            date: new Date().toISOString(),
                            reason: 'Nhập kho (import từ file)',
                            person: chemicalData.personReceived,
                            quantityChange: quantity,
                            newQuantity: quantity,
                        }]
                    };
                    return newChemical;
                });

                if (mode === 'replace') {
                    setChemicals(newChemicals);
                    addAuditLog('Import kho', `Nhập và thay thế toàn bộ kho với ${newChemicals.length} hóa chất từ file.`);
                } else {
                    setChemicals(prev => [...prev, ...newChemicals]);
                    addAuditLog('Import kho', `Nhập thêm ${newChemicals.length} hóa chất vào kho từ file.`);
                }
                alert(`Import thành công ${newChemicals.length} hóa chất.`);
            } catch (error) {
                console.error("Lỗi khi import file:", error);
                alert(`Đã xảy ra lỗi khi import file: ${error instanceof Error ? error.message : String(error)}`);
            }
        };
        reader.readAsBinaryString(file);
    };


    // Personnel Handlers
    const handleOpenPersonnelFormModal = (person: types.PersonnelProfile | null) => {
        setEditingPersonnel(person);
        setPersonnelFormModalOpen(true);
    };

    const handleAddOrUpdatePersonnel = (personData: Omit<types.PersonnelProfile, 'id'> | types.PersonnelProfile) => {
        if ('id' in personData) {
            const updatedPerson = { ...personData, documents: personData.documents || [] };
            setPersonnel(personnel.map(p => p.id === updatedPerson.id ? updatedPerson : p));
            addAuditLog('Cập nhật nhân sự', `Cập nhật thông tin cho ${personData.fullName}`);
        } else {
            const newPerson: types.PersonnelProfile = { id: `p-${Date.now()}`, ...personData, documents: [] };
            setPersonnel([...personnel, newPerson]);
            addAuditLog('Thêm nhân sự', `Thêm nhân sự mới: ${newPerson.fullName}`);
        }
    };
    
    const handleDeletePersonnel = (personnelId: string) => {
        const personToDelete = personnel.find(p => p.id === personnelId);
        if (!personToDelete) return;
        
        requestConfirmation(
            'Xác nhận Xóa Nhân sự',
            `Bạn có chắc chắn muốn xóa nhân sự "${personToDelete.fullName}"?`,
            () => {
                setPersonnel(personnel.filter(p => p.id !== personnelId));
                addAuditLog('Xóa nhân sự', `Đã xóa nhân sự: ${personToDelete.fullName}`);
            }
        );
    };
    
    const handleOpenPersonnelDetailModal = (person: types.PersonnelProfile) => {
        setEditingPersonnel(person);
        setPersonnelDetailModalOpen(true);
    };

    const handleAddPersonnelDocument = (data: PersonnelDocumentFormData) => {
        if (!editingPersonnel) return;
        const newDoc: types.PersonnelDocument = { id: `pdoc-${Date.now()}`, uploadedAt: new Date().toISOString(), ...data };
        const updatedPerson = { ...editingPersonnel };
        updatedPerson.documents = [...(updatedPerson.documents || []), newDoc];
        
        setPersonnel(personnel.map(p => p.id === updatedPerson.id ? updatedPerson : p));
        setEditingPersonnel(updatedPerson); // Update state for the open modal
        addAuditLog('Thêm tài liệu nhân sự', `Thêm tài liệu "${newDoc.title}" cho ${updatedPerson.fullName}`);
    };

    const handleDeletePersonnelDocument = (docId: string) => {
        if (!editingPersonnel) return;
        const docToDelete = editingPersonnel.documents?.find(d => d.id === docId);
        if (!docToDelete) return;

        requestConfirmation(
            'Xác nhận Xóa Tài liệu',
            `Bạn có chắc muốn xóa tài liệu "${docToDelete.title}"?`,
            () => {
                const updatedPerson = { ...editingPersonnel };
                updatedPerson.documents = (updatedPerson.documents || []).filter(d => d.id !== docId);

                setPersonnel(personnel.map(p => p.id === updatedPerson.id ? updatedPerson : p));
                setEditingPersonnel(updatedPerson);
                addAuditLog('Xóa tài liệu nhân sự', `Xóa tài liệu "${docToDelete.title}" của ${updatedPerson.fullName}`);
            }
        );
    };

    // Trainee Handlers
    const handleOpenTraineeFormModal = (trainee: types.TraineeProfile | null) => {
        setEditingTrainee(trainee);
        setTraineeFormModalOpen(true);
    };

    const handleAddOrUpdateTrainee = (traineeData: Omit<types.TraineeProfile, 'id'> | types.TraineeProfile) => {
        if ('id' in traineeData) {
            setTrainees(trainees.map(t => t.id === traineeData.id ? traineeData : t));
            addAuditLog('Cập nhật học viên', `Cập nhật thông tin cho học viên ${traineeData.fullName}`);
        } else {
            const newTrainee: types.TraineeProfile = { id: `t-${Date.now()}`, ...traineeData };
            setTrainees([...trainees, newTrainee]);
            addAuditLog('Thêm học viên', `Thêm học viên mới: ${newTrainee.fullName}`);
        }
    };
    
    const handleDeleteTrainee = (traineeId: string) => {
        const traineeToDelete = trainees.find(t => t.id === traineeId);
        if (!traineeToDelete) return;

        requestConfirmation(
            'Xác nhận Xóa Học viên',
            `Bạn có chắc chắn muốn xóa học viên "${traineeToDelete.fullName}"?`,
            () => {
                setTrainees(trainees.filter(t => t.id !== traineeId));
                addAuditLog('Xóa học viên', `Đã xóa học viên: ${traineeToDelete.fullName}`);
            }
        );
    };


    // Equipment Handlers
    const handleOpenEquipmentFormModal = (item: types.LabEquipment | null) => {
        setEditingEquipment(item);
        setEquipmentFormModalOpen(true);
    };

    const handleAddOrUpdateEquipment = (itemData: Omit<types.LabEquipment, 'id'> | types.LabEquipment) => {
        if ('id' in itemData) {
            const updatedItem = { ...itemData, maintenanceHistory: itemData.maintenanceHistory || [], calibrationHistory: itemData.calibrationHistory || [], documents: itemData.documents || [] };
            setLabEquipment(labEquipment.map(e => e.id === updatedItem.id ? updatedItem : e));
            addAuditLog('Cập nhật thiết bị', `Cập nhật thông tin cho ${itemData.name}`);
        } else {
            const newItem: types.LabEquipment = { id: `equip-${Date.now()}`, ...itemData, maintenanceHistory: [], calibrationHistory: [], documents: [] };
            setLabEquipment([...labEquipment, newItem]);
            addAuditLog('Thêm thiết bị', `Thêm thiết bị mới: ${newItem.name}`);
        }
    };

    const handleDeleteEquipment = (id: string) => {
        const itemToDelete = labEquipment.find(e => e.id === id);
        if (!itemToDelete) return;

        requestConfirmation(
            'Xác nhận Xóa Thiết bị',
            `Bạn có chắc muốn xóa thiết bị "${itemToDelete.name}"?`,
            () => {
                setLabEquipment(labEquipment.filter(e => e.id !== id));
                addAuditLog('Xóa thiết bị', `Đã xóa thiết bị: ${itemToDelete.name}`);
            }
        );
    };
    
    const handleOpenEquipmentDetailModal = (item: types.LabEquipment) => {
        setEditingEquipment(item);
        setEquipmentDetailModalOpen(true);
    };

    const handleAddMaintenanceRecord = (data: Omit<types.MaintenanceRecord, 'id'>) => {
        if (!editingEquipment) return;
        const newRecord: types.MaintenanceRecord = { id: `maint-${Date.now()}`, ...data };
        const updatedEquipment = { ...editingEquipment };
        updatedEquipment.maintenanceHistory = [...(updatedEquipment.maintenanceHistory || []), newRecord].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        updatedEquipment.lastMaintenance = newRecord.date;
        if (updatedEquipment.maintenanceInterval) {
            const nextDate = new Date(newRecord.date + 'T00:00:00');
            nextDate.setDate(nextDate.getDate() + updatedEquipment.maintenanceInterval);
            updatedEquipment.nextMaintenance = nextDate.toISOString().split('T')[0];
        }
        setLabEquipment(labEquipment.map(e => e.id === updatedEquipment.id ? updatedEquipment : e));
        setEditingEquipment(updatedEquipment); // Update state for the open modal
        addAuditLog('Bảo trì thiết bị', `Ghi nhận bảo trì cho ${updatedEquipment.name} ngày ${newRecord.date}`);
    };

    const handleAddCalibrationRecord = (data: Omit<types.CalibrationRecord, 'id'>) => {
        if (!editingEquipment) return;
        const newRecord: types.CalibrationRecord = { id: `calib-${Date.now()}`, ...data };
        const updatedEquipment = { ...editingEquipment };
        updatedEquipment.calibrationHistory = [...(updatedEquipment.calibrationHistory || []), newRecord].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        updatedEquipment.lastCalibration = newRecord.date;
         if (updatedEquipment.calibrationInterval) {
            const nextDate = new Date(newRecord.date + 'T00:00:00');
            nextDate.setDate(nextDate.getDate() + updatedEquipment.calibrationInterval);
            updatedEquipment.nextCalibration = nextDate.toISOString().split('T')[0];
        }
        setLabEquipment(labEquipment.map(e => e.id === updatedEquipment.id ? updatedEquipment : e));
        setEditingEquipment(updatedEquipment);
        addAuditLog('Hiệu chuẩn thiết bị', `Ghi nhận hiệu chuẩn cho ${updatedEquipment.name} ngày ${newRecord.date}`);
    };

    const handleAddEquipmentDocument = (data: EquipmentDocumentFormData) => {
        if (!editingEquipment) return;
        const newDoc: types.EquipmentDocument = { id: `doc-${Date.now()}`, uploadedAt: new Date().toISOString(), ...data };
        const updatedEquipment = { ...editingEquipment };
        updatedEquipment.documents = [...(updatedEquipment.documents || []), newDoc];
        setLabEquipment(labEquipment.map(e => e.id === updatedEquipment.id ? updatedEquipment : e));
        setEditingEquipment(updatedEquipment);
        addAuditLog('Thêm tài liệu thiết bị', `Thêm tài liệu "${newDoc.title}" cho ${updatedEquipment.name}`);
    };
    
    const handleAddEquipmentUsageLog = (data: Omit<types.EquipmentUsageLog, 'id'>) => {
        const newLog: types.EquipmentUsageLog = { id: `eusg-${Date.now()}`, ...data };
        setEquipmentUsageLogs(prev => [newLog, ...prev].sort((a,b) => {
            const dateA = new Date(`${a.date}T${a.startTime}`);
            const dateB = new Date(`${b.date}T${b.startTime}`);
            return dateB.getTime() - dateA.getTime();
        }));
        const equipment = labEquipment.find(e => e.id === data.equipmentId);
        addAuditLog('Sử dụng thiết bị', `Ghi nhận nhật ký sử dụng cho máy ${equipment?.name || ''}`);
        setEquipmentUsageLogModalOpen(false);
    };

    const handleUpdateAssociatedWorkItems = (equipmentId: string, workItemIds: string[]) => {
        setLabEquipment(prev => prev.map(eq => 
            eq.id === equipmentId ? { ...eq, associatedWorkItemIds: workItemIds } : eq
        ));
        const equipment = labEquipment.find(e => e.id === equipmentId);
        addAuditLog('Cập nhật Quy trình', `Cập nhật quy trình công việc cho ${equipment?.name || ''}`);
    };

    const handleAddOrUpdateWorkItem = (itemData: Omit<types.WorkItem, 'id'> | types.WorkItem) => {
        if ('id' in itemData) {
            setWorkItems(prev => prev.map(item => item.id === itemData.id ? itemData : item));
            addAuditLog('Cập nhật Danh mục công việc', `Sửa: "${itemData.description}"`);
        } else {
            const newItem = { id: `wi-${Date.now()}`, ...itemData };
            setWorkItems(prev => [...prev, newItem]);
            addAuditLog('Cập nhật Danh mục công việc', `Thêm: "${newItem.description}"`);
        }
    };
    
    const handleDeleteWorkItem = (id: string) => {
        const itemToDelete = workItems.find(i => i.id === id);
        if (!itemToDelete) return;

        requestConfirmation(
            'Xác nhận Xóa Công việc',
            <span>Bạn có chắc muốn xóa công việc <span className="font-bold">"{itemToDelete.description}"</span> khỏi danh mục?</span>,
            () => {
                setWorkItems(prev => prev.filter(i => i.id !== id));
                // Also remove this from any equipment that has it associated
                setLabEquipment(prev => prev.map(eq => ({
                    ...eq,
                    associatedWorkItemIds: (eq.associatedWorkItemIds || []).filter(itemId => itemId !== id)
                })));
                addAuditLog('Xóa Công việc', `Đã xóa "${itemToDelete.description}" khỏi danh mục.`);
            }
        );
    };

    const handleExportEquipmentProfileToDoc = (equipment: types.LabEquipment) => {
        const formatDate = (dateString?: string) => {
            if (!dateString) return '';
            const date = new Date(dateString + 'T00:00:00');
            return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
        };
        
        let statusText = '';
        switch(equipment.status) {
            case 'operational': statusText = 'Đang hoạt động'; break;
            case 'maintenance': statusText = 'Đang bảo trì'; break;
            case 'out_of_service': statusText = 'Ngưng sử dụng'; break;
            default: statusText = 'Không rõ';
        }

        let managementRows = '';
        for (let i = 0; i < 15; i++) {
            managementRows += '<tr><td style="height: 25px; border: 1px solid black;">&nbsp;</td><td style="border: 1px solid black;">&nbsp;</td><td style="border: 1px solid black;">&nbsp;</td></tr>';
        }

        let maintenanceRows = '';
        const maintenanceHistory = (equipment.maintenanceHistory || []).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        maintenanceHistory.forEach(record => {
            maintenanceRows += `<tr>
                <td style="height: 25px; border: 1px solid black; padding: 4px;">${formatDate(record.date)}</td>
                <td style="border: 1px solid black; padding: 4px;">${record.performedBy}</td>
                <td style="border: 1px solid black; padding: 4px;">${record.description}</td>
                <td style="border: 1px solid black; padding: 4px;"></td>
            </tr>`;
        });

        const emptyMaintenanceRowsNeeded = Math.max(0, 25 - maintenanceHistory.length);
        for (let i = 0; i < emptyMaintenanceRowsNeeded; i++) {
            maintenanceRows += '<tr><td style="height: 25px; border: 1px solid black;">&nbsp;</td><td style="border: 1px solid black;">&nbsp;</td><td style="border: 1px solid black;">&nbsp;</td><td style="border: 1px solid black;">&nbsp;</td></tr>';
        }

        const today = new Date();
        const issueDate = `01.${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${String(today.getFullYear()).slice(-2)}`;

        const htmlContent = `
            <html xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
            <head><meta charset="UTF-8"><title>Ly Lich Thiet Bi</title>
            <style>
                @page { size: A4; margin: 20mm; }
                body { font-family: 'Times New Roman', serif; font-size: 11pt; }
                .container { width: 100%; }
                .header, .title { text-align: center; font-weight: bold; }
                .section-title { font-weight: bold; margin-top: 15px; margin-bottom: 5px; }
                .info-table { width: 100%; border-collapse: collapse; }
                .info-table td { padding: 3px 0; }
                .main-table { width: 100%; border-collapse: collapse; margin-top: 5px; }
                .main-table th, .main-table td { border: 1px solid black; padding: 5px; text-align: left; }
                .main-table th { text-align: center; font-weight: bold; }
                .footer { width: 100%; display: flex; justify-content: space-between; font-size: 10pt; margin-top: 20px; }
            </style>
            </head>
            <body>
            <div class="container">
                <div class="header">
                    <p style="margin: 0;">BỆNH VIỆN ĐẠI HỌC Y DƯỢC</p>
                    <p style="margin: 0;">KHOA XÉT NGHIỆM</p>
                </div>
                <h1 class="title" style="font-size: 14pt; margin-top: 20px; margin-bottom: 20px;">LÝ LỊCH THIẾT BỊ</h1>
                
                <p class="section-title">1. Thông tin chung</p>
                <table class="info-table">
                    <tr>
                        <td width="50%">Tên thiết bị: ${equipment.name || ''}</td>
                        <td width="50%">Ký hiệu: ${equipment.model || ''}</td>
                    </tr>
                    <tr>
                        <td>Số Serial: ${equipment.serialNumber}</td>
                        <td>Nước: </td>
                    </tr>
                    <tr>
                        <td>Nhà sản xuất: ${equipment.manufacturer || ''}</td>
                        <td>Vị trí: ${equipment.location}</td>
                    </tr>
                     <tr>
                        <td>Mã số thiết bị: ${equipment.assetId}</td>
                        <td>Tình trạng: ${statusText}</td>
                    </tr>
                    <tr>
                        <td>Thời gian nhận máy: ${formatDate(equipment.purchaseDate)}</td>
                        <td></td>
                    </tr>
                    <tr>
                        <td>Thời gian sử dụng: ${formatDate(equipment.purchaseDate)}</td>
                        <td></td>
                    </tr>
                </table>

                <p class="section-title">2. Nhà cung cấp</p>
                <table class="info-table">
                    <tr><td width="50%">Tên nhà cung cấp: </td> <td width="50%"></td></tr>
                    <tr><td>Địa chỉ: </td> <td></td></tr>
                    <tr><td>Điện thoại: </td> <td>Số Fax: </td></tr>
                </table>
                
                <p class="section-title">3. Quản lý</p>
                <table class="main-table">
                    <thead><tr><th width="40%">Họ và tên</th><th width="30%">Từ ngày</th><th width="30%">Ghi chú</th></tr></thead>
                    <tbody>${managementRows}</tbody>
                </table>
                <div class="footer">
                    <span>XN-BM 5.5.1/03</span>
                    <span>Lần ban hành: ${issueDate}</span>
                    <span>Trang: 1/3</span>
                </div>

                <br style="page-break-before: always;"/>

                <div class="header">
                    <p style="margin: 0;">BỆNH VIỆN ĐẠI HỌC Y DƯỢC</p>
                    <p style="margin: 0;">KHOA XÉT NGHIỆM</p>
                </div>
                <p class="section-title" style="margin-top: 20px;">4. Sửa chữa / bảo dưỡng</p>
                <table class="main-table">
                     <thead><tr><th width="20%">Thời gian</th><th width="25%">Người thực hiện</th><th width="40%">Nội dung thực hiện</th><th width="15%">Ghi chú</th></tr></thead>
                    <tbody>${maintenanceRows}</tbody>
                </table>
                 <div class="footer">
                    <span>XN-BM 5.5.1/03</span>
                    <span>Lần ban hành: ${issueDate}</span>
                    <span>Trang: 2/3</span>
                </div>
                 <br style="page-break-before: always;"/>

                  <div class="header">
                    <p style="margin: 0;">BỆNH VIỆN ĐẠI HỌC Y DƯỢC</p>
                    <p style="margin: 0;">KHOA XÉT NGHIỆM</p>
                </div>
                  <div class="footer" style="position: absolute; bottom: 20mm; left: 20mm; right: 20mm; width: calc(100% - 40mm);">
                    <span>XN-BM 5.5.1/03</span>
                    <span>Lần ban hành: ${issueDate}</span>
                    <span>Trang: 3/3</span>
                </div>
            </div>
            </body></html>
        `;

        const blob = new Blob(['\ufeff', htmlContent], { type: 'application/msword' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Ly_Lich_Thiet_Bi_${equipment.assetId}.doc`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        addAuditLog('Xuất hồ sơ thiết bị', `Đã xuất lý lịch cho thiết bị ${equipment.name} (${equipment.assetId})`);
    };
    
    const handleExportUsageLogToDoc = (equipmentId: string, logs: types.EquipmentUsageLog[]) => {
        const equipment = labEquipment.find(e => e.id === equipmentId);
        if (!equipment) {
            alert("Không tìm thấy thiết bị để xuất báo cáo.");
            return;
        }

        const userMap = new Map(personnel.map(p => [p.id, p.fullName]));
        const formatDateForDoc = (dateString: string) => {
            if (!dateString) return '';
            const date = new Date(dateString + 'T00:00:00');
            return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
        };
        const year = logs.length > 0 ? new Date(logs[0].date).getFullYear() : new Date().getFullYear();

        let logRows = logs.map(log => `
            <tr>
                <td style="border: 1px solid black; padding: 4px; text-align: center;">${formatDateForDoc(log.date)}</td>
                <td style="border: 1px solid black; padding: 4px;">${log.maintenancePerformed || ''}</td>
                <td style="border: 1px solid black; padding: 4px; text-align: center; font-family: 'Segoe UI Symbol', sans-serif;">${log.qualityCheck === 'yes' ? '☑' : ''}</td>
                <td style="border: 1px solid black; padding: 4px; text-align: center; font-family: 'Segoe UI Symbol', sans-serif;">${log.qualityCheck === 'no' ? '☑' : ''}</td>
                <td style="border: 1px solid black; padding: 4px;">${log.incidents || ''}</td>
                <td style="border: 1px solid black; padding: 4px;">${log.correctiveAction || ''}</td>
                <td style="border: 1px solid black; padding: 4px;">${log.usageStatus}</td>
                <td style="border: 1px solid black; padding: 4px; white-space: nowrap;">${log.startTime} - ${log.endTime}</td>
                <td style="border: 1px solid black; padding: 4px;">${userMap.get(log.userId) || log.userId}</td>
                <td style="border: 1px solid black; padding: 4px;">${log.notes || ''}</td>
            </tr>
        `).join('');

        const emptyRowsNeeded = Math.max(0, 15 - logs.length);
        for (let i = 0; i < emptyRowsNeeded; i++) {
            logRows += `<tr>${Array(10).fill('<td style="height: 25px; border: 1px solid black;">&nbsp;</td>').join('')}</tr>`;
        }

        const today = new Date();
        const issueDate = `01.${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${String(today.getFullYear()).slice(-2)}`;

        const htmlContent = `
            <html xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
            <head><meta charset="UTF-8"><title>Nhat Ky Su Dung Thiet Bi</title>
            <style>
                @page { size: A4 landscape; margin: 20mm; }
                body { font-family: 'Times New Roman', serif; font-size: 10pt; }
                .container { width: 100%; }
                .header, .title { text-align: center; font-weight: bold; }
                .info-table { width: 100%; border-collapse: collapse; margin-bottom: 10px; font-size: 11pt; }
                .main-table { width: 100%; border-collapse: collapse; margin-top: 5px; }
                .main-table th, .main-table td { border: 1px solid black; padding: 5px; text-align: left; vertical-align: middle; }
                .main-table th { text-align: center; font-weight: bold; }
                .footer { width: 100%; display: flex; justify-content: space-between; font-size: 9pt; margin-top: 10px; }
            </style>
            </head>
            <body>
            <div class="container">
                <div class="header"><p style="margin: 0;">BỆNH VIỆN ĐẠI HỌC Y DƯỢC</p><p style="margin: 0;">KHOA XÉT NGHIỆM</p></div>
                <h1 class="title" style="font-size: 14pt; margin: 15px 0;">NHẬT KÝ SỬ DỤNG THIẾT BỊ</h1>
                
                <table class="info-table">
                    <tr><td width="50%">Tên thiết bị: ${equipment.name || ''}</td><td width="50%">Người phụ trách: </td></tr>
                    <tr><td>Ký hiệu / Hãng: ${equipment.model || equipment.manufacturer || ''}</td><td>Vị trí: ${equipment.location}</td></tr>
                    <tr><td>Mã thiết bị: ${equipment.assetId}</td><td>Năm: ${year}</td></tr>
                </table>

                <table class="main-table">
                    <thead>
                        <tr>
                            <th rowspan="2" style="width: 6%;">Thời gian</th>
                            <th rowspan="2" style="width: 14%;">Nội dung bảo trì, bảo dưỡng.</th>
                            <th colspan="2" style="width: 8%;">Kiểm tra chất lượng (QC)</th>
                            <th rowspan="2" style="width: 12%;">Sự cố thiết bị/nội kiểm</th>
                            <th rowspan="2" style="width: 12%;">Hành động khắc phục</th>
                            <th rowspan="2" style="width: 9%;">Trạng thái khi sử dụng</th>
                            <th rowspan="2" style="width: 8%;">Thời gian sử dụng</th>
                            <th rowspan="2" style="width: 10%;">Người sử dụng</th>
                            <th rowspan="2" style="width: 11%;">Ghi chú</th>
                        </tr>
                        <tr><th style="width: 4%;">Có</th><th style="width: 4%;">Không</th></tr>
                    </thead>
                    <tbody>${logRows}</tbody>
                </table>
                 <div class="footer">
                    <span>XN-BM 5.5.1/05</span>
                    <span>Lần ban hành: ${issueDate}</span>
                    <span>Trang 1/5</span>
                </div>
            </div>
            </body></html>
        `;

        const blob = new Blob(['\ufeff', htmlContent], { type: 'application/msword' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Nhat_Ky_Su_Dung_${equipment.assetId}_${year}.doc`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        addAuditLog('Xuất nhật ký sử dụng', `Đã xuất nhật ký cho thiết bị ${equipment.name} (${equipment.assetId})`);
    };
    
    const handleToggleMaintenanceCheck = (equipmentId: string, workItemId: string, date: string) => {
        if (!currentUser) return;
        const logId = `${equipmentId}-${workItemId}-${date}`;
        
        setMaintenanceChecklistLogs(prev => {
            const existingLog = prev.find(log => log.id === logId);
            if (existingLog) {
                // If it exists, remove it (uncheck)
                return prev.filter(log => log.id !== logId);
            } else {
                // If it doesn't exist, add it (check)
                const newLog: types.MaintenanceChecklistLog = {
                    id: logId,
                    equipmentId,
                    workItemId,
                    date,
                    completedByUserId: personnel.find(p => p.fullName === currentUser.fullName)?.id || '',
                };
                return [...prev, newLog];
            }
        });
        addAuditLog('Checklist bảo trì', `Cập nhật checklist cho thiết bị ID ${equipmentId} ngày ${date}`);
    };

    const handleCreateNonConformityFromLog = (log: types.EquipmentUsageLog) => {
        if (!currentUser) return;
        const newNCData: Omit<types.NonConformity, 'id' | 'ncId'> = {
            date: new Date().toISOString().split('T')[0],
            description: `Từ Nhật ký sử dụng thiết bị ngày ${log.date}: ${log.incidents}`,
            category: 'analytical', // Default category, can be changed by user
            severity: 'minor',
            status: 'open',
            reportedBy: currentUser.fullName,
        };
        
        // This will call the main handler which also generates the ncId
        handleAddOrUpdateNonConformity(newNCData);
        
        // After adding, we need to find the newly created NC to link it.
        // This is a bit tricky without direct access to the new item.
        // A better approach would be for handleAdd... to return the new item.
        // For now, we'll assume the latest 'open' one is the one we just made.
        setTimeout(() => {
             setNonConformities(currentNcs => {
                const newNc = currentNcs.find(nc => nc.description === newNCData.description && nc.status === 'open');
                if (newNc) {
                    const updatedLog = { ...log, nonConformityId: newNc.id };
                    handleUpdateEquipmentUsageLog(updatedLog);
                    addAuditLog('Tạo SKPH từ Nhật ký TB', `Tạo SKPH ${newNc.id} từ sự cố thiết bị.`);
                }
                return currentNcs;
             });
        }, 100);
        
        setActivePage('nonconformity');
    };

    const handleUpdateEquipmentUsageLog = (log: types.EquipmentUsageLog) => {
        setEquipmentUsageLogs(prev => prev.map(l => l.id === log.id ? log : l));
    };


    // Job Role Handlers
    const handleOpenJobRoleModal = (role: types.JobRole | null) => {
        setEditingJobRole(role);
        setJobRoleModalOpen(true);
    };

    const handleAddOrUpdateJobRole = (roleData: Omit<types.JobRole, 'id'> | types.JobRole) => {
        if ('id' in roleData) {
            setJobRoles(jobRoles.map(r => r.id === roleData.id ? roleData : r));
            addAuditLog('Cập nhật chức danh', `Cập nhật chức danh: ${roleData.title}`);
        } else {
            const newRole: types.JobRole = { id: `role-${Date.now()}`, ...roleData };
            setJobRoles([...jobRoles, newRole]);
            addAuditLog('Thêm chức danh', `Thêm chức danh mới: ${newRole.title}`);
        }
    };

    const handleDeleteJobRole = (roleId: string) => {
        const roleToDelete = jobRoles.find(r => r.id === roleId);
        if (!roleToDelete) return;
        
        const isInUse = personnel.some(p => p.jobRoleId === roleId);
        if (isInUse) {
            alert(`Không thể xóa chức danh "${roleToDelete?.title}" vì đang có nhân sự giữ chức danh này.`);
            return;
        }

        requestConfirmation(
            'Xác nhận Xóa Chức danh',
            `Bạn có chắc muốn xóa chức danh "${roleToDelete.title}"?`,
            () => {
                setJobRoles(jobRoles.filter(r => r.id !== roleId));
                addAuditLog('Xóa chức danh', `Đã xóa chức danh: ${roleToDelete.title}`);
            }
        );
    };

    // Organization Unit Handlers
    const handleOpenOrgUnitModal = (unit: types.OrganizationUnit | null, parentId: string | null = null) => {
        setEditingOrgUnit(unit);
        setOrgUnitParentId(parentId);
        setOrgUnitModalOpen(true);
    };

    const handleAddOrUpdateOrganizationUnit = (unitData: Omit<types.OrganizationUnit, 'id'> | types.OrganizationUnit) => {
        if ('id' in unitData) {
            setOrganizationUnits(organizationUnits.map(u => u.id === unitData.id ? unitData : u));
            addAuditLog('Cập nhật đơn vị', `Cập nhật đơn vị: ${unitData.name}`);
        } else {
            const newUnit: types.OrganizationUnit = { id: `unit-${Date.now()}`, ...unitData };
            setOrganizationUnits([...organizationUnits, newUnit]);
            addAuditLog('Thêm đơn vị', `Thêm đơn vị mới: ${newUnit.name}`);
        }
    };

    const handleDeleteOrganizationUnit = (unitId: string) => {
        const unitToDelete = organizationUnits.find(u => u.id === unitId);
        if (!unitToDelete) return;

        const hasChildren = organizationUnits.some(u => u.parentId === unitId);
        if (hasChildren) {
            alert(`Không thể xóa đơn vị "${unitToDelete.name}" vì vẫn còn các đơn vị con.`);
            return;
        }

        const hasPersonnel = personnel.some(p => p.organizationUnitId === unitId);
        if (hasPersonnel) {
            alert(`Không thể xóa đơn vị "${unitToDelete.name}" vì vẫn còn nhân sự trong đơn vị.`);
            return;
        }
        
        requestConfirmation(
            'Xác nhận Xóa Đơn vị',
            `Bạn có chắc muốn xóa đơn vị "${unitToDelete.name}"?`,
            () => {
                setOrganizationUnits(organizationUnits.filter(u => u.id !== unitId));
                addAuditLog('Xóa đơn vị', `Đã xóa đơn vị: ${unitToDelete.name}`);
            }
        );
    };
    
    // Attendance and Leave Handlers
    const handleOpenLeaveModal = (leave?: types.LeaveRecord) => {
        setEditingLeave(leave || null);
        setLeaveModalOpen(true);
    };

    const handleSaveLeave = (data: Omit<types.LeaveRecord, 'id'> | types.LeaveRecord) => {
        if ('id' in data) {
            setLeaveRecords(prev => prev.map(l => l.id === data.id ? data : l));
        } else {
            const newLeave: types.LeaveRecord = { id: `leave-${Date.now()}`, ...data };
            setLeaveRecords(prev => [...prev, newLeave]);
        }
        addAuditLog('Quản lý nghỉ phép', `Cập nhật nghỉ phép cho nhân sự ID ${data.personnelId}`);
    };

    const handleOpenAttendanceModal = (personnelId: string, date: string, record?: types.AttendanceRecord) => {
        setAttendanceContext({ personnelId, date, record });
        setAttendanceModalOpen(true);
    };

    const handleSaveAttendance = (data: Omit<types.AttendanceRecord, 'id'> | types.AttendanceRecord) => {
        if ('id' in data) {
            setAttendanceRecords(prev => prev.map(a => a.id === data.id ? data : a));
        } else {
            const newAttendance: types.AttendanceRecord = { id: `att-${Date.now()}`, ...data };
            setAttendanceRecords(prev => [...prev, newAttendance]);
        }
         addAuditLog('Chấm công', `Cập nhật chấm công cho nhân sự ID ${data.personnelId}`);
    };
    
    // Work Schedule & Holiday Handlers
    const handleUpdateWorkSchedule = (schedule: types.WorkSchedule) => {
        setWorkSchedule(schedule);
        addAuditLog('Cài đặt', `Cập nhật giờ làm việc thành ${schedule.startTime} - ${schedule.endTime}`);
    };
    
    const handleAddHoliday = (holiday: Omit<types.Holiday, 'id'>) => {
        const newHoliday: types.Holiday = { id: `h-${Date.now()}`, ...holiday };
        setHolidays(prev => [...prev, newHoliday].sort((a,b) => a.date.localeCompare(b.date)));
        addAuditLog('Cài đặt', `Thêm ngày nghỉ lễ: ${holiday.name} (${holiday.date})`);
    };

    const handleDeleteHoliday = (id: string) => {
        const holiday = holidays.find(h => h.id === id);
        if (!holiday) return;

        requestConfirmation(
            'Xác nhận Xóa Ngày nghỉ',
            `Bạn có chắc muốn xóa ngày nghỉ "${holiday.name}"?`,
            () => {
                setHolidays(prev => prev.filter(h => h.id !== id));
                addAuditLog('Cài đặt', `Xóa ngày nghỉ lễ: ${holiday.name}`);
            }
        );
    };

    // Assignment Handlers
    const handleAddDutyAssignment = (assignment: Omit<types.DutyAssignment, 'id'>) => {
        const newAssignment: types.DutyAssignment = { id: `duty-${Date.now()}`, ...assignment };
        setDutyAssignments(prev => [...prev, newAssignment]);
        addAuditLog('Phân công', `Phân công ca trực cho nhân sự ID ${assignment.personnelId} vào ngày ${assignment.date}`);
    };

    const handleDeleteDutyAssignment = (dutyId: string) => {
        const duty = dutyAssignments.find(d => d.id === dutyId);
        if (!duty) return;

        const person = personnel.find(p => p.id === duty.personnelId);
        
        requestConfirmation(
            'Xác nhận Hủy Phân công',
            <span>Bạn có chắc muốn hủy ca trực của <span className="font-bold">{person?.fullName || 'N/A'}</span> vào ngày <span className="font-bold">{duty ? new Date(duty.date + 'T00:00:00').toLocaleDateString('vi-VN') : ''}</span>?</span>,
            () => {
                setDutyAssignments(prev => prev.filter(d => d.id !== dutyId));
                addAuditLog('Hủy phân công trực', `Đã hủy ca trực của ${person?.fullName || 'N/A'} vào ngày ${duty.date}`);
            }
        );
    };

    const handleAddTaskAssignment = (assignment: Omit<types.TaskAssignment, 'id'>) => {
        const newAssignment: types.TaskAssignment = { id: `task-${Date.now()}`, ...assignment, status: 'pending' };
        setTaskAssignments(prev => [...prev, newAssignment]);
        addAuditLog('Phân công', `Giao nhiệm vụ cho nhân sự ID ${assignment.personnelId} vào ngày ${assignment.date}`);
    };

    const handleMovePersonnel = (personnelId: string, newUnitId: string, effectiveDate: string, notes: string) => {
        const personToMove = personnel.find(p => p.id === personnelId);
        if (!personToMove) return;

        // Find and end the current assignment
        const currentHistory = personnelAssignmentHistory.find(h => h.personnelId === personnelId && h.endDate === null);
        
        let newHistoryList = [...personnelAssignmentHistory];

        if (currentHistory) {
            const endDate = new Date(effectiveDate + 'T00:00:00');
            endDate.setDate(endDate.getDate() - 1);
            
            newHistoryList = newHistoryList.map(h => 
                h.id === currentHistory.id 
                ? { ...h, endDate: endDate.toISOString().split('T')[0] } 
                : h
            );
        }

        // Create new assignment
        const newHistoryEntry: types.PersonnelAssignmentHistory = {
            id: `hist-${Date.now()}`,
            personnelId,
            organizationUnitId: newUnitId,
            startDate: effectiveDate,
            endDate: null,
            notes,
        };
        newHistoryList.push(newHistoryEntry);
        setPersonnelAssignmentHistory(newHistoryList);

        // Update the person's current unit
        setPersonnel(prev => prev.map(p => p.id === personnelId ? { ...p, organizationUnitId: newUnitId } : p));
        
        addAuditLog('Luân chuyển nhân sự', `Luân chuyển ${personToMove.fullName} đến đơn vị mới từ ngày ${effectiveDate}.`);
    };
    
    // KPI Handlers
    const handleAddOrUpdateKpiScore = (personnelId: string, date: string, bonusPoints: number, penaltyPoints: number, notes: string) => {
        const id = `${personnelId}-${date}`;
        const existing = kpiScores.find(s => s.id === id);
        if (existing) {
            setKpiScores(prev => prev.map(s => s.id === id ? { ...s, bonusPoints, penaltyPoints, notes } : s));
        } else {
            const newScore: types.KpiScore = { id, personnelId, date, bonusPoints, penaltyPoints, notes };
            setKpiScores(prev => [...prev, newScore]);
        }
        addAuditLog('Cập nhật KPI', `Cập nhật điểm KPI cho nhân sự ID ${personnelId} vào ngày ${date}`);
    };
    
    // Training & Competency Handlers
    const handleAddOrUpdateTrainingCourse = (data: Omit<types.TrainingCourse, 'id'> | types.TrainingCourse) => {
        if ('id' in data) {
            setTrainingCourses(prev => prev.map(c => c.id === data.id ? data : c));
            addAuditLog('Cập nhật Khóa học', `Cập nhật khóa học: ${data.title}`);
        } else {
            const newCourse = { id: `course-${Date.now()}`, ...data };
            setTrainingCourses(prev => [...prev, newCourse]);
            addAuditLog('Thêm Khóa học', `Thêm khóa học mới: ${newCourse.title}`);
        }
    };
    const handleDeleteTrainingCourse = (id: string) => {
        const course = trainingCourses.find(c => c.id === id);
        if (!course) return;

        requestConfirmation(
            'Xác nhận Xóa Khóa học',
            <span>Xóa khóa học <span className="font-bold">"{course.title}"</span>? <br/> Thao tác này cũng sẽ xóa các ghi nhận đào tạo liên quan.</span>,
            () => {
                setTrainingCourses(prev => prev.filter(c => c.id !== id));
                setTrainingRecords(prev => prev.filter(r => r.courseId !== id));
                addAuditLog('Xóa Khóa học', `Đã xóa khóa học: ${course.title}`);
            }
        );
    };
    const handleAddTrainingRecord = (data: Omit<types.TrainingRecord, 'id'>) => {
        const newRecord = { id: `tr-${Date.now()}`, ...data };
        setTrainingRecords(prev => [...prev, newRecord]);
        const person = personnel.find(p => p.id === data.personnelId);
        const course = trainingCourses.find(c => c.id === data.courseId);
        addAuditLog('Ghi nhận Đào tạo', `Ghi nhận ${person?.fullName} hoàn thành khóa học ${course?.title}`);
    };
    const handleDeleteTrainingRecord = (id: string) => {
        const record = trainingRecords.find(r => r.id === id);
        if (!record) return;

        const person = personnel.find(p => p.id === record.personnelId);
        const course = trainingCourses.find(c => c.id === record.courseId);

        requestConfirmation(
            'Xác nhận Xóa Ghi nhận',
            <span>Bạn có chắc muốn xóa ghi nhận khóa học <span className="font-bold">"{course?.title}"</span> của nhân viên <span className="font-bold">{person?.fullName}</span>?</span>,
            () => {
                setTrainingRecords(prev => prev.filter(r => r.id !== id));
                addAuditLog('Xóa Ghi nhận Đào tạo', `Đã xóa một ghi nhận đào tạo của nhân sự ID ${record.personnelId}`);
            }
        );
    };

    const handleAddOrUpdateCompetency = (data: Omit<types.Competency, 'id'> | types.Competency) => {
        if ('id' in data) {
            setCompetencies(prev => prev.map(c => c.id === data.id ? data : c));
            addAuditLog('Cập nhật Năng lực', `Cập nhật năng lực: ${data.name}`);
        } else {
            const newCompetency = { id: `comp-${Date.now()}`, ...data };
            setCompetencies(prev => [...prev, newCompetency]);
            addAuditLog('Thêm Năng lực', `Thêm năng lực mới: ${newCompetency.name}`);
        }
    };
    const handleDeleteCompetency = (id: string) => {
        const competency = competencies.find(c => c.id === id);
        if (!competency) return;

        requestConfirmation(
            'Xác nhận Xóa Năng lực',
            <span>Xóa năng lực <span className="font-bold">"{competency.name}"</span>? <br/> Thao tác này cũng sẽ xóa các đánh giá liên quan.</span>,
            () => {
                setCompetencies(prev => prev.filter(c => c.id !== id));
                setCompetencyAssessments(prev => prev.filter(a => a.competencyId !== id));
                addAuditLog('Xóa Năng lực', `Đã xóa năng lực: ${competency.name}`);
            }
        );
    };
    const handleAddCompetencyAssessment = (data: Omit<types.CompetencyAssessment, 'id'>) => {
        const newAssessment = { id: `ca-${Date.now()}`, ...data };
        setCompetencyAssessments(prev => [...prev, newAssessment]);
        const person = personnel.find(p => p.id === data.personnelId);
        const competency = competencies.find(c => c.id === data.competencyId);
        addAuditLog('Đánh giá Năng lực', `Đánh giá năng lực ${competency?.name} cho ${person?.fullName}`);
    };
    const handleDeleteCompetencyAssessment = (id: string) => {
        const assessment = competencyAssessments.find(a => a.id === id);
        if (!assessment) return;
        
        const person = personnel.find(p => p.id === assessment.personnelId);
        const competency = competencies.find(c => c.id === assessment.competencyId);

        requestConfirmation(
            'Xác nhận Xóa Đánh giá',
            <span>Bạn có chắc muốn xóa đánh giá năng lực <span className="font-bold">"{competency?.name}"</span> của nhân viên <span className="font-bold">{person?.fullName}</span>?</span>,
            () => {
                setCompetencyAssessments(prev => prev.filter(a => a.id !== id));
                addAuditLog('Xóa Đánh giá Năng lực', `Đã xóa một đánh giá năng lực của nhân sự ID ${assessment.personnelId}`);
            }
        );
    };


    // ======== ENVIRONMENT & SAFETY HANDLERS ========
    const handleAddMonitoredItem = (type: ActiveItemType, itemData: any) => {
        const newItem = { id: `${type}-${Date.now()}`, ...itemData };
        if (type === 'area') setMonitoredAreas(prev => [...prev, newItem]);
        else if (type === 'equipment') setMonitoredEquipment(prev => [...prev, newItem]);
        else if (type === 'waterSource') setWaterSources(prev => [...prev, newItem]);
        addAuditLog('Thêm mục giám sát', `Thêm mới ${type}: ${itemData.name}`);
    };

    const handleUpdateMonitoredItem = (type: ActiveItemType, itemData: any) => {
         if (type === 'area') setMonitoredAreas(prev => prev.map(i => i.id === itemData.id ? itemData : i));
        else if (type === 'equipment') setMonitoredEquipment(prev => prev.map(i => i.id === itemData.id ? itemData : i));
        else if (type === 'waterSource') setWaterSources(prev => prev.map(i => i.id === itemData.id ? itemData : i));
        addAuditLog('Cập nhật mục giám sát', `Cập nhật ${type}: ${itemData.name}`);
    };

    const handleDeleteMonitoredItem = (type: ActiveItemType, id: string) => {
        let itemToDelete: any;
        let itemTypeName = '';
        if (type === 'area') {
            itemToDelete = monitoredAreas.find(i => i.id === id);
            itemTypeName = 'khu vực';
        } else if (type === 'equipment') {
            itemToDelete = monitoredEquipment.find(i => i.id === id);
            itemTypeName = 'thiết bị';
        } else if (type === 'waterSource') {
            itemToDelete = waterSources.find(i => i.id === id);
            itemTypeName = 'nguồn nước';
        }

        if (!itemToDelete) return;
        
        requestConfirmation(
            `Xác nhận Xóa`,
            `Bạn có chắc muốn xóa ${itemTypeName} "${itemToDelete.name}"?`,
            () => {
                if (type === 'area') setMonitoredAreas(prev => prev.filter(i => i.id !== id));
                else if (type === 'equipment') setMonitoredEquipment(prev => prev.filter(i => i.id !== id));
                else if (type === 'waterSource') setWaterSources(prev => prev.filter(i => i.id !== id));
                addAuditLog('Xóa mục giám sát', `Xóa ${type} ID: ${id}`);
            }
        );
    };
    
    const handleAddAccessLog = (logData: Omit<types.AccessLog, 'id'>) => {
        const newLog: types.AccessLog = { id: `access-${Date.now()}`, ...logData };
        setAccessLogs(prev => [newLog, ...prev]);
        addAuditLog('Ghi nhận ra vào', `Ghi nhận vào khu vực ${logData.areaName}`);
    };
    
    const handleUpdateAccessLog = (logData: types.AccessLog) => {
        setAccessLogs(prev => prev.map(log => log.id === logData.id ? logData : log));
        addAuditLog('Ghi nhận ra vào', `Ghi nhận rời khỏi khu vực ${logData.areaName}`);
    };
    
    const handleAddAreaEnvLog = (logData: Omit<types.AreaEnvironmentLog, 'id'>) => {
        const newLog = { id: `aelog-${Date.now()}`, ...logData };
        setAreaEnvLogs(prev => [newLog, ...prev]);
        addAuditLog('Giám sát môi trường', `Ghi nhận nhiệt độ/độ ẩm khu vực ${logData.areaName}`);
    };

    const handleAddEquipEnvLog = (logData: Omit<types.EquipmentTemperatureLog, 'id'>) => {
        const newLog = { id: `eelog-${Date.now()}`, ...logData };
        setEquipEnvLogs(prev => [newLog, ...prev]);
        addAuditLog('Giám sát thiết bị', `Ghi nhận nhiệt độ thiết bị ${logData.equipmentName}`);
    };
    
    const handleAddWaterConductivityLog = (logData: Omit<types.WaterConductivityLog, 'id'>) => {
        const newLog = { id: `wclog-${Date.now()}`, ...logData };
        setWaterConductivityLogs(prev => [newLog, ...prev]);
        addAuditLog('Giám sát nước', `Ghi nhận độ dẫn điện cho ${logData.sourceName}`);
    };

    const handleAddOrUpdateIncidentReport = (reportData: Omit<types.IncidentReport, 'id'> | types.IncidentReport) => {
        if ('id' in reportData) {
            setIncidentReports(prev => prev.map(r => r.id === reportData.id ? reportData : r));
            addAuditLog('Cập nhật sự cố', `Cập nhật báo cáo sự cố ngày ${reportData.date}`);
        } else {
            const newReport = { id: `incident-${Date.now()}`, ...reportData };
            setIncidentReports(prev => [newReport, ...prev].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
            addAuditLog('Báo cáo sự cố', `Tạo báo cáo sự cố mới ngày ${reportData.date}`);
        }
    };

    const handleDeleteIncidentReport = (id: string) => {
        const report = incidentReports.find(r => r.id === id);
        if (!report) return;

        requestConfirmation(
            'Xác nhận Xóa Báo cáo',
            `Bạn có chắc muốn xóa báo cáo sự cố "${report.description.substring(0, 30)}..." xảy ra vào ngày ${report.date}?`,
            () => {
                setIncidentReports(prev => prev.filter(r => r.id !== id));
                addAuditLog('Xóa sự cố', `Xóa báo cáo sự cố ngày ${report.date}`);
            }
        );
    };
    
    const handleExportIncidentToDoc = (report: types.IncidentReport) => {
        const htmlContent = `
            <html xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
            <head><meta charset="UTF-8"><title>Bao Cao Su Co</title><style>body { font-family: 'Times New Roman', serif; } .header { text-align: center; } h1 { text-align: center; } table { width: 100%; border-collapse: collapse; } td { border: 1px solid black; padding: 5px; vertical-align: top; }</style></head>
            <body>
                <div class="header">
                    <p><strong>BỆNH VIỆN ĐẠI HỌC Y DƯỢC</strong></p>
                    <p><strong>KHOA XÉT NGHIỆM</strong></p>
                </div>
                <h1>PHIẾU BÁO CÁO SỰ CỐ</h1>
                <table>
                    <tr><td width="30%"><strong>Ngày giờ xảy ra:</strong></td><td>${new Date(report.date + 'T' + report.time).toLocaleString('vi-VN')}</td></tr>
                    <tr><td><strong>Vị trí / Khu vực:</strong></td><td>${report.location}</td></tr>
                    <tr><td><strong>Đặc điểm sự cố:</strong></td><td>${report.incidentType}</td></tr>
                    <tr><td><strong>Người liên quan:</strong></td><td>${report.involvedPersonnel}</td></tr>
                    <tr><td colspan="2"><strong>Mô tả chi tiết sự cố:</strong></td></tr>
                    <tr><td colspan="2" style="min-height: 100px;">${report.description}</td></tr>
                    <tr><td colspan="2"><strong>Hành động xử lý tức thời:</strong></td></tr>
                    <tr><td colspan="2" style="min-height: 80px;">${report.immediateAction}</td></tr>
                    <tr><td colspan="2"><strong>Hành động khắc phục / phòng ngừa:</strong></td></tr>
                    <tr><td colspan="2" style="min-height: 80px;">${report.correctiveAction}</td></tr>
                    <tr><td><strong>Người báo cáo:</strong></td><td>${report.reportedBy}</td></tr>
                    <tr><td><strong>Người xem xét:</strong></td><td>${report.reviewer || ''}</td></tr>
                    <tr><td><strong>Tình trạng:</strong></td><td>${report.status}</td></tr>
                </table>
                 <div style="margin-top: 50px; display: flex; justify-content: space-around; text-align: center;">
                    <div><p><strong>Người báo cáo</strong></p><div style="margin-top: 60px;">${report.reportedBy}</div></div>
                    <div><p><strong>Người xem xét</strong></p><div style="margin-top: 60px;">${report.reviewer || ''}</div></div>
                </div>
            </body>
            </html>
        `;
        const blob = new Blob([htmlContent], { type: 'application/msword' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Bao_cao_su_co_${report.date}.doc`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    // ======== DOCUMENT HANDLERS ========
    const handleAddOrUpdateDocument = (docData: Omit<types.LabDocument, 'id'> | types.LabDocument) => {
        if ('id' in docData) {
            setDocuments(prev => prev.map(d => d.id === docData.id ? docData : d));
            addAuditLog('Cập nhật tài liệu', `Cập nhật tài liệu: ${docData.title}`);
        } else {
            const newDoc: types.LabDocument = { id: `doc-${Date.now()}`, ...docData };
            setDocuments(prev => [...prev, newDoc]);
            addAuditLog('Thêm tài liệu', `Thêm tài liệu mới: ${newDoc.title}`);
        }
    };

    const handleDeleteDocument = (id: string) => {
        const doc = documents.find(d => d.id === id);
        if (!doc) return;
        
        requestConfirmation(
            'Xác nhận Xóa Tài liệu',
            `Bạn có chắc chắn muốn xóa tài liệu "${doc.title}"?`,
            () => {
                setDocuments(prev => prev.filter(d => d.id !== id));
                addAuditLog('Xóa tài liệu', `Đã xóa tài liệu: ${doc.title}`);
            }
        );
    };


    // ======== SETTINGS HANDLERS ========
    const handleOpenSettingsModal = (type: ModalType, item: any = null) => {
        setSettingsModalType(type);
        setEditingSettingsItem(item);
        setSettingsModalOpen(true);
    };
    
    const handleOpenUserFormModal = (user: types.User | null) => {
        setEditingUser(user);
        setUserFormModalOpen(true);
    };

    const handleAddOrUpdateUser = (userData: Omit<types.User, 'id'> | types.User) => {
        if ('id' in userData) {
            // Update
            setUsers(prev => prev.map(u => u.id === userData.id ? { ...u, ...userData } : u));
            addAuditLog('Cập nhật người dùng', `Cập nhật thông tin cho ${userData.fullName}`);
        } else {
            // Add new
            const newUser: types.User = {
                ...(userData as Omit<types.User, 'id'>),
                id: `user-${Date.now()}`,
                passwordHash: (userData as any).passwordHash || Math.random().toString(36).slice(-8)
            };
            setUsers(prev => [...prev, newUser]);
            addAuditLog('Thêm người dùng', `Thêm người dùng mới: ${newUser.fullName}`);
        }
    };
    
    const handleDeleteUser = (userId: string) => {
        const user = users.find(u => u.id === userId);
        if (!user) return;
        if (user.id === currentUser?.id) {
            alert("Bạn không thể xóa chính mình.");
            return;
        }

        requestConfirmation(
            'Xác nhận Xóa Người dùng',
            `Bạn có chắc chắn muốn xóa người dùng "${user.fullName}"?`,
            () => {
                setUsers(prev => prev.filter(u => u.id !== userId));
                addAuditLog('Xóa người dùng', `Đã xóa người dùng: ${user.fullName}`);
            }
        );
    };


    const handleSettingsSubmit = (data: any) => {
        const type = settingsModalType;
        if (!type) return;

        const isEditing = 'id' in data;
        
        const action = isEditing ? 'Cập nhật' : 'Thêm';
        let logMessage = '';

        if (type === 'testParameter') {
            setTestParameters(prev => isEditing ? prev.map(i => i.id === data.id ? data : i) : [...prev, { ...data, id: `tp-${Date.now()}` }]);
            logMessage = `danh mục xét nghiệm: ${data.name}`;
        } else if (type === 'chemicalMaster') {
            setChemicalMasters(prev => isEditing ? prev.map(i => i.id === data.id ? data : i) : [...prev, { ...data, id: `cm-${Date.now()}` }]);
            logMessage = `danh mục hóa chất: ${data.name}`;
        } else if (type === 'instrument') {
            setInstruments(prev => isEditing ? prev.map(i => i.id === data.id ? data : i) : [...prev, { ...data, id: `inst-${Date.now()}` }]);
            logMessage = `danh mục máy xét nghiệm: ${data.name}`;
        } else if (type === 'roomLocation') {
            setRoomLocations(prev => isEditing ? prev.map(i => i.id === data.id ? data : i) : [...prev, { ...data, id: `rl-${Date.now()}` }]);
            logMessage = `danh mục vị trí: ${data.name}`;
        } else if (type === 'storage') {
            setStorageLocations(prev => isEditing ? prev.map(i => i.id === data.id ? data : i) : [...prev, { ...data, id: `sl-${Date.now()}` }]);
            logMessage = `danh mục kho/tủ: ${data.name}`;
        } else if (type === 'controlMaterial') {
            setControlMaterials(prev => isEditing ? prev.map(i => i.id === data.id ? data : i) : [...prev, { ...data, id: `ctrlm-${Date.now()}` }]);
            logMessage = `vật liệu nội kiểm: ${data.name}`;
        } else if (type === 'eqaMaterial') {
            setEqaMaterials(prev => isEditing ? prev.map(i => i.id === data.id ? data : i) : [...prev, { ...data, id: `eqam-${Date.now()}` }]);
            logMessage = `vật liệu ngoại kiểm: ${data.name}`;
        } else if (type === 'documentCategory') {
            setDocumentCategories(prev => isEditing ? prev.map(i => i.id === data.id ? data : i) : [...prev, { ...data, id: `doccat-${Date.now()}` }]);
            logMessage = `danh mục tài liệu: ${data.name}`;
        }

        addAuditLog(`${action} Cài đặt`, logMessage);
    };

    const handleDeleteSettingsItem = (type: ModalType, id: string) => {
        let itemToDelete: any, listName: string;
        
        const confirmAndDelete = (setter: React.Dispatch<React.SetStateAction<any[]>>) => {
            requestConfirmation('Xác nhận Xóa', `Bạn có chắc muốn xóa mục "${itemToDelete.name}"?`, () => {
                setter((prev: any[]) => prev.filter(item => item.id !== id));
                addAuditLog('Xóa Cài đặt', `Xóa ${listName}: ${itemToDelete.name}`);
            });
        };

        if (type === 'testParameter') { itemToDelete = testParameters.find(i => i.id === id); listName = "xét nghiệm"; if (itemToDelete) confirmAndDelete(setTestParameters); }
        else if (type === 'chemicalMaster') { itemToDelete = chemicalMasters.find(i => i.id === id); listName = "hóa chất"; if (itemToDelete) confirmAndDelete(setChemicalMasters); }
        else if (type === 'instrument') { itemToDelete = instruments.find(i => i.id === id); listName = "máy xét nghiệm"; if (itemToDelete) confirmAndDelete(setInstruments); }
        else if (type === 'roomLocation') { itemToDelete = roomLocations.find(i => i.id === id); listName = "vị trí"; if (itemToDelete) confirmAndDelete(setRoomLocations); }
        else if (type === 'storage') { itemToDelete = storageLocations.find(i => i.id === id); listName = "kho/tủ"; if (itemToDelete) confirmAndDelete(setStorageLocations); }
        else if (type === 'controlMaterial') { itemToDelete = controlMaterials.find(i => i.id === id); listName = "vật liệu nội kiểm"; if (itemToDelete) confirmAndDelete(setControlMaterials); }
        else if (type === 'eqaMaterial') { itemToDelete = eqaMaterials.find(i => i.id === id); listName = "vật liệu ngoại kiểm"; if (itemToDelete) confirmAndDelete(setEqaMaterials); }
        else if (type === 'documentCategory') { itemToDelete = documentCategories.find(i => i.id === id); listName = "danh mục tài liệu"; if (itemToDelete) confirmAndDelete(setDocumentCategories); }
    };

    const handleDownloadChemicalMasterTemplate = () => {
        const headers = ["Tên hóa chất (*)", "Số CAS (*)", "Quy cách", "Nhà cung cấp mặc định", "Đơn vị mặc định (*)", "Vị trí mặc định", "Mức tồn kho tối thiểu"];
        const ws = utils.aoa_to_sheet([headers]);
        const wb = utils.book_new();
        utils.book_append_sheet(wb, ws, "MauDanhMuc");
        writeFile(wb, "Mau_Danh_Muc_Hoa_Chat.xlsx");
    };

    const handleImportChemicalMasters = (file: File, mode: 'replace' | 'append') => {
        // ... Logic to parse and update chemicalMasters state ...
        addAuditLog('Import Danh mục Hóa chất', `Import file với chế độ ${mode}`);
        setChemicalMasterImportModalOpen(false);
    };


    // ======== DATA MANAGEMENT HANDLERS ========
    const handleBackup = () => {
        const allData = {
            users, chemicals, chemicalMasters, storageLocations, instruments, onInstrumentStock,
            testParameters, controlMaterials, controlLotTargets, iqcResults, personnel,
            trainees, jobRoles, organizationUnits, labEquipment, nonConformities,
            leaveRecords, attendanceRecords, workSchedule, holidays, dutyAssignments,
            taskAssignments, personnelAssignmentHistory, kpiScores, manualPreparationLogs,
            planningSlips, disposalRecords, auditLogs, documents, improvementInitiatives,
            customerFeedback, auditRecords, monitoredAreas, monitoredEquipment, waterSources,
            accessLogs, areaEnvLogs, equipEnvLogs, waterConductivityLogs, incidentReports,
            trainingCourses, trainingRecords, competencies, competencyAssessments, equipmentUsageLogs,
            roomLocations, eqaMaterials, documentCategories,
        };
        const blob = new Blob([JSON.stringify(allData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        link.download = `qlab_backup_${timestamp}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        addAuditLog('Sao lưu dữ liệu', 'Toàn bộ dữ liệu hệ thống đã được sao lưu.');
    };

    const handleRestore = (file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target?.result;
                if (typeof text !== 'string') throw new Error('Không thể đọc file.');
                const restoredData = JSON.parse(text);
                
                const safeSet = (setter: React.Dispatch<React.SetStateAction<any>>, dataKey: string, initial: any) => {
                    setter(restoredData[dataKey] || initial);
                };
                
                safeSet(setUsers, 'users', data.initialUsers);
                safeSet(setChemicals, 'chemicals', data.initialChemicals);
                safeSet(setChemicalMasters, 'chemicalMasters', data.initialChemicalMasters);
                safeSet(setStorageLocations, 'storageLocations', data.initialStorageLocations);
                safeSet(setInstruments, 'instruments', data.initialInstruments);
                safeSet(setOnInstrumentStock, 'onInstrumentStock', data.initialOnInstrumentStock);
                safeSet(setTestParameters, 'testParameters', data.initialTestParameters);
                safeSet(setControlMaterials, 'controlMaterials', data.initialControlMaterials);
                safeSet(setControlLotTargets, 'controlLotTargets', data.initialControlLotTargets);
                safeSet(setIqcResults, 'iqcResults', data.initialIQCResults);
                safeSet(setPersonnel, 'personnel', data.initialPersonnel);
                safeSet(setTrainees, 'trainees', data.initialTrainees);
                safeSet(setJobRoles, 'jobRoles', data.initialJobRoles);
                safeSet(setOrganizationUnits, 'organizationUnits', data.initialOrganizationUnits);
                safeSet(setLabEquipment, 'labEquipment', data.initialLabEquipment);
                safeSet(setNonConformities, 'nonConformities', data.initialNonConformities);
                safeSet(setLeaveRecords, 'leaveRecords', data.initialLeaveRecords);
                safeSet(setAttendanceRecords, 'attendanceRecords', data.initialAttendanceRecords);
                setWorkSchedule(restoredData.workSchedule || data.initialWorkSchedule);
                safeSet(setHolidays, 'holidays', data.initialHolidays);
                safeSet(setDutyAssignments, 'dutyAssignments', data.initialDutyAssignments);
                safeSet(setTaskAssignments, 'taskAssignments', data.initialTaskAssignments);
                safeSet(setPersonnelAssignmentHistory, 'personnelAssignmentHistory', data.initialPersonnelAssignmentHistory);
                safeSet(setKpiScores, 'kpiScores', data.initialKpiScores);
                safeSet(setManualPreparationLogs, 'manualPreparationLogs', data.initialManualPreparationLogs);
                safeSet(setPlanningSlips, 'planningSlips', data.initialPlanningSlips);
                safeSet(setDisposalRecords, 'disposalRecords', data.initialDisposalRecords);
                safeSet(setAuditLogs, 'auditLogs', data.initialAuditLogs);
                safeSet(setDocuments, 'documents', data.initialDocuments);
                safeSet(setImprovementInitiatives, 'improvementInitiatives', data.initialImprovementInitiatives);
                safeSet(setCustomerFeedback, 'customerFeedback', data.initialCustomerFeedback);
                safeSet(setAuditRecords, 'auditRecords', data.initialAuditRecords);
                safeSet(setMonitoredAreas, 'monitoredAreas', data.initialMonitoredAreas);
                safeSet(setMonitoredEquipment, 'monitoredEquipment', data.initialMonitoredEquipment);
                safeSet(setWaterSources, 'waterSources', data.initialWaterSources);
                safeSet(setAccessLogs, 'accessLogs', data.initialAccessLogs);
                safeSet(setAreaEnvLogs, 'areaEnvLogs', data.initialAreaEnvironmentLogs);
                safeSet(setEquipEnvLogs, 'equipEnvLogs', data.initialEquipmentTempLogs);
                safeSet(setWaterConductivityLogs, 'waterConductivityLogs', data.initialWaterConductivityLogs);
                safeSet(setIncidentReports, 'incidentReports', data.initialIncidentReports);
                safeSet(setTrainingCourses, 'trainingCourses', data.initialTrainingCourses);
                safeSet(setTrainingRecords, 'trainingRecords', data.initialTrainingRecords);
                safeSet(setCompetencies, 'competencies', data.initialCompetencies);
                safeSet(setCompetencyAssessments, 'competencyAssessments', data.initialCompetencyAssessments);
                safeSet(setEquipmentUsageLogs, 'equipmentUsageLogs', data.initialEquipmentUsageLogs);
                safeSet(setRoomLocations, 'roomLocations', data.initialRoomLocations);
                safeSet(setEqaMaterials, 'eqaMaterials', data.initialEQAMaterials);
                safeSet(setDocumentCategories, 'documentCategories', data.initialDocumentCategories);
                
                alert('Phục hồi dữ liệu thành công!');
                addAuditLog('Phục hồi dữ liệu', 'Toàn bộ dữ liệu hệ thống đã được phục hồi từ file sao lưu.');

            } catch (error) {
                console.error("Lỗi khi phục hồi dữ liệu:", error);
                alert(`Đã xảy ra lỗi khi phục hồi dữ liệu: ${error instanceof Error ? error.message : String(error)}`);
            }
        };
        reader.readAsText(file);
    };

    // ======== NON-CONFORMITY HANDLERS ========
    const handleAddOrUpdateNonConformity = (data: Omit<types.NonConformity, 'id' | 'ncId'> | types.NonConformity) => {
        if ('id' in data) {
            // Update
            let updatedData = { ...data };
            // Generate HDKP ID if corrective action is present and ID is missing
            if (updatedData.correctiveAction && !updatedData.hdkpId) {
                const numericId = updatedData.ncId.replace('SKPH-', '');
                updatedData.hdkpId = `HDKP-${numericId}`;
            }

            setNonConformities(prev => prev.map(nc => nc.id === updatedData.id ? updatedData : nc));
            addAuditLog('Cập nhật SKPH', `Cập nhật SKPH: ${data.description.substring(0, 30)}...`);
        } else {
            // Add
            const generateNcId = (dateStr: string, existingNcs: types.NonConformity[]): string => {
                const date = new Date(dateStr + 'T00:00:00');
                const year = date.getFullYear().toString().slice(-2);
                const month = (date.getMonth() + 1).toString().padStart(2, '0');
                const prefix = `${year}${month}`;
                const ncsInMonth = existingNcs.filter(nc => nc.ncId && nc.ncId.startsWith(`SKPH-${prefix}`));
                const maxSeq = ncsInMonth.reduce((max, nc) => {
                    const seq = parseInt(nc.ncId!.substring(9), 10); // "SKPH-yymm".length = 9
                    return seq > max ? seq : max;
                }, 0);
                const newSeq = (maxSeq + 1).toString().padStart(3, '0');
                return `SKPH-${prefix}${newSeq}`;
            };
            
            const newNCData: Omit<types.NonConformity, 'id' | 'ncId'> = { ...data };
            const ncId = generateNcId(newNCData.date, nonConformities);

            let newNonConformity: types.NonConformity = { 
                id: `nc-${Date.now()}`,
                ...(newNCData as any), // Cast to avoid typescript issues
                ncId: ncId
            };
            
            // Generate HDKP ID if corrective action is present
            if (newNonConformity.correctiveAction && !newNonConformity.hdkpId) {
                const numericId = newNonConformity.ncId.replace('SKPH-', '');
                newNonConformity.hdkpId = `HDKP-${numericId}`;
            }

            setNonConformities(prev => [newNonConformity, ...prev].sort((a,b) => b.date.localeCompare(a.date)));
            addAuditLog('Tạo SKPH', `Tạo SKPH mới: ${newNonConformity.description.substring(0, 30)}...`);
        }
    };

    const handleDeleteNonConformity = (id: string) => {
        const item = nonConformities.find(nc => nc.id === id);
        if (!item) return;

        requestConfirmation(
            'Xác nhận Xóa SKPH',
            `Bạn có chắc muốn xóa sự không phù hợp: "${item.description}"?`,
            () => {
                setNonConformities(prev => prev.filter(nc => nc.id !== id));
                addAuditLog('Xóa SKPH', `Đã xóa SKPH: ${item.description.substring(0, 30)}...`);
            }
        );
    };

    const formatDate = (dateString?: string) => {
      if (!dateString) return '';
      const date = new Date(dateString + 'T00:00:00');
      return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    };

    const handleExportNonConformityToDoc = (items: types.NonConformity[]) => {
        const ROWS_PER_PAGE = 5;
        const totalPages = Math.max(1, Math.ceil(items.length / ROWS_PER_PAGE));
        
        const categoryMap: Record<types.NonConformity['category'], string> = {
          'pre-analytical': 'Trước phân tích', 'analytical': 'Trong phân tích', 'post-analytical': 'Sau phân tích',
          'system': 'Hệ thống', 'safety': 'An toàn', 'supplier': 'Nhà cung cấp', 'other': 'Khác'
        };
        const severityMap: Record<types.NonConformity['severity'], string> = { minor: 'Nhẹ', severe: 'Nặng' };

        let pagesHtml = '';

        for (let i = 0; i < totalPages; i++) {
            const pageItems = items.slice(i * ROWS_PER_PAGE, (i + 1) * ROWS_PER_PAGE);
            const emptyRowsCount = ROWS_PER_PAGE - pageItems.length;

            let tableRowsHtml = pageItems.map(item => `
                <tr>
                    <td style="border: 1px solid black; padding: 4px; height: 60px; text-align: center; vertical-align: top;">${item.ncId}</td>
                    <td style="border: 1px solid black; padding: 4px; vertical-align: top;">${categoryMap[item.category] || item.category}</td>
                    <td style="border: 1px solid black; padding: 4px; text-align: center; vertical-align: top;">${formatDate(item.date)}</td>
                    <td style="border: 1px solid black; padding: 4px; vertical-align: top;">${item.description}</td>
                    <td style="border: 1px solid black; padding: 4px; vertical-align: top;">${item.reportedBy}</td>
                    <td style="border: 1px solid black; padding: 4px; text-align: center; vertical-align: top;">${severityMap[item.severity] || item.severity}</td>
                    <td style="border: 1px solid black; padding: 4px; text-align: center; vertical-align: top;">${item.hdkpId || ''}</td>
                </tr>
            `).join('');

            for (let j = 0; j < emptyRowsCount; j++) {
                tableRowsHtml += `<tr>${Array(7).fill('<td style="border: 1px solid black; height: 60px;">&nbsp;</td>').join('')}</tr>`;
            }
            
            const pageNumber = i + 1;
            pagesHtml += `
                <div style="page-break-after: always; height: 170mm; position: relative;">
                    <div style="text-align: center; font-weight: bold;">
                        <p style="margin: 0;">BỆNH VIỆN</p>
                        <p style="margin: 0;">KHOA</p>
                    </div>
                    <h1 style="text-align: center; font-size: 16pt; font-weight: bold; margin-top: 20px; margin-bottom: 20px;">SỔ THEO DÕI SỰ KHÔNG PHÙ HỢP</h1>
                    <table style="width: 100%; border-collapse: collapse; font-size: 10pt;">
                        <thead>
                            <tr>
                                <th style="border: 1px solid black; padding: 5px; width: 8%;">Mã số SKPH</th>
                                <th style="border: 1px solid black; padding: 5px; width: 10%;">Phòng</th>
                                <th style="border: 1px solid black; padding: 5px; width: 10%;">Ngày, giờ (phát hiện)</th>
                                <th style="border: 1px solid black; padding: 5px; width: 32%;">Mô tả sự không phù hợp</th>
                                <th style="border: 1px solid black; padding: 5px; width: 15%;">Nhân viên liên quan</th>
                                <th style="border: 1px solid black; padding: 5px; width: 10%;">Mức độ</th>
                                <th style="border: 1px solid black; padding: 5px; width: 15%;">Số HĐKP</th>
                            </tr>
                        </thead>
                        <tbody>${tableRowsHtml}</tbody>
                    </table>
                    <div style="width: 100%; display: flex; justify-content: space-between; font-size: 10pt; margin-top: 20px; position: absolute; bottom: 0;">
                        <span>XN-BM 5.10.1/01</span>
                        <span>Lần ban hành: 01.dd/mm/20yy</span>
                        <span>Trang: ${pageNumber}/${totalPages}</span>
                    </div>
                </div>`;
        }

        const htmlContent = `
            <html xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
            <head><meta charset="UTF-8"><title>So Theo Doi SKPH</title>
            <style>
                @page { size: A4 landscape; margin: 20mm; }
                body { font-family: 'Times New Roman', serif; font-size: 11pt; }
                div[style*="page-break-after: always"]:last-of-type { page-break-after: auto; }
            </style>
            </head><body>${pagesHtml}</body></html>`;
        
        const blob = new Blob(['\ufeff', htmlContent], { type: 'application/msword' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `So_Theo_Doi_SKPH.doc`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        addAuditLog('Xuất file', 'Xuất sổ theo dõi SKPH ra file .doc');
    };

    const handleExportNonConformityToExcel = (items: types.NonConformity[]) => {
        const categoryMap: Record<types.NonConformity['category'], string> = {
          'pre-analytical': 'Trước phân tích', 'analytical': 'Trong phân tích', 'post-analytical': 'Sau phân tích',
          'system': 'Hệ thống', 'safety': 'An toàn', 'supplier': 'Nhà cung cấp', 'other': 'Khác'
        };
        const severityMap: Record<types.NonConformity['severity'], string> = { minor: 'Nhẹ', severe: 'Nặng' };
        const statusMap: Record<types.NonConformity['status'], string> = { open: 'Mở', 'in_progress': 'Đang xử lý', 'closed': 'Đã đóng' };

        const dataToExport = items.map(item => ({
            'Mã số SKPH': item.id,
            'Ngày phát hiện': item.date,
            'Mô tả': item.description,
            'Phân loại': categoryMap[item.category] || item.category,
            'Mức độ': severityMap[item.severity] || item.severity,
            'Trạng thái': statusMap[item.status] || item.status,
            'Người báo cáo': item.reportedBy,
            'Phân tích nguyên nhân': item.rootCauseAnalysis || '',
            'Hành động khắc phục': item.correctiveAction || '',
            'Hành động phòng ngừa': item.preventiveAction || '',
            'Người đóng': item.closedBy || '',
            'Ngày đóng': item.closedDate || '',
            'Đánh giá hiệu quả': item.actionEffectiveness || ''
        }));

        const ws = utils.json_to_sheet(dataToExport);
        const wb = utils.book_new();
        utils.book_append_sheet(wb, ws, "DanhSachSKPH");
        writeFile(wb, `Danh_sach_SKPH_${new Date().toISOString().split('T')[0]}.xlsx`);
        addAuditLog('Xuất file', 'Xuất danh sách SKPH ra file .xlsx');
    };

    const handleExportCorrectiveActionToDoc = (item: types.NonConformity) => {
        const formatDate = (dateStr?: string) => {
            if (!dateStr) return '.........../.........../...........';
            const date = new Date(dateStr + 'T00:00:00');
            return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
        };
        const checked = '&#9746;'; // ☑
        const unchecked = '&#9744;'; // ☐
        const sources = item.detectionSources || [];

        const htmlContent = `
            <html xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
            <head><meta charset="UTF-8"><title>Phieu Bao Cao Hanh Dong Khac Phuc</title>
            <style>
                body { font-family: 'Times New Roman', serif; font-size: 11pt; }
                .container { width: 100%; max-width: 700px; margin: auto; }
                p, h1, h2, h3 { margin: 0; padding: 0; }
                .header { text-align: center; line-height: 1.2; }
                .title { text-align: center; font-size: 14pt; font-weight: bold; margin: 15px 0; }
                .section { margin-top: 10px; }
                .section-title { font-weight: bold; }
                .dotted-line { border-bottom: 1px dotted black; min-height: 18px; padding-top: 2px; }
                .checkbox { font-family: 'Segoe UI Symbol', sans-serif; font-size: 12pt; }
                .signature-section { margin-top: 20px; border: 1px solid black; padding: 5px; }
                .signature-flex { display: flex; justify-content: space-between; }
                .signature-col { width: 48%; }
            </style>
            </head>
            <body>
            <div class="container">
                <div class="header">
                    <p>BỆNH VIỆN ĐẠI HỌC Y DƯỢC</p>
                    <p style="font-weight: bold;">KHOA XÉT NGHIỆM</p>
                </div>
                <h1 class="title">PHIẾU BÁO CÁO HÀNH ĐỘNG KHẮC PHỤC</h1>
                <p style="text-align: right;">Số: ${item.hdkpId || 'HĐKP-............'}</p>

                <div class="section">
                    <p class="section-title">1. Sự không phù hợp (được phát hiện)</p>
                    <table style="width: 100%;">
                        <tr>
                            <td style="width: 50%;">
                                <p><span class="checkbox">${sources.includes('nc_report') ? checked : unchecked}</span> Sự không phù hợp số: SKPH-${item.ncId?.replace('SKPH-','') || '.........'}</p>
                                <p><span class="checkbox">${sources.includes('internal_audit') ? checked : unchecked}</span> Đánh giá nội bộ</p>
                                <p><span class="checkbox">${sources.includes('management_review') ? checked : unchecked}</span> Xem xét của lãnh đạo</p>
                            </td>
                            <td style="width: 50%;">
                                <p><span class="checkbox">${sources.includes('external_audit') ? checked : unchecked}</span> Đánh giá từ bên ngoài</p>
                                <p><span class="checkbox">${sources.includes('other') ? checked : unchecked}</span> Khác: <span style="border-bottom: 1px dotted black;">${sources.includes('other') ? (item.detectionSourceOther || '...') : '...'}</span></p>
                            </td>
                        </tr>
                    </table>
                </div>

                <div class="section">
                    <p class="section-title">2. Mô tả tóm tắt vấn đề</p>
                    <p class="dotted-line">${item.description || '&nbsp;'}</p>
                    <p class="dotted-line">&nbsp;</p>
                </div>

                <div class="section">
                    <p class="section-title">3. Phân tích nguyên nhân</p>
                    <p class="dotted-line">${item.rootCauseAnalysis || '&nbsp;'}</p>
                    <p class="dotted-line">&nbsp;</p>
                </div>
                
                <div class="section">
                    <p class="section-title">4. Biện pháp khắc phục</p>
                    <p class="dotted-line">${item.correctiveAction || '&nbsp;'}</p>
                    <p class="dotted-line">&nbsp;</p>
                </div>

                <div class="section">
                    <p class="section-title">5. Hoạt động đảm bảo vấn đề không lặp lại (nếu có)</p>
                    <p class="dotted-line">${item.preventiveAction || '&nbsp;'}</p>
                </div>

                <div class="signature-section">
                    <div class="signature-flex">
                        <div class="signature-col">
                            <p>Người báo cáo: .......................................</p>
                            <p style="text-align: center; padding-top: 5px;">${item.reportedBy || ''}</p>
                            <p>Ngày: ${formatDate(item.date)}</p>
                            <br/>
                            <p>Người thực hiện khắc phục: ...................</p>
                            <p style="text-align: center; padding-top: 5px;">${item.actionPerformer || ''}</p>
                            <p>Ngày hoàn thành: ${formatDate(item.completionDate)}</p>
                        </div>
                        <div class="signature-col" style="border-left: 1px solid black; padding-left: 10px;">
                            <p style="font-weight: bold; text-align: center;">Phê duyệt thực hiện</p>
                            <p><span class="checkbox">${item.implementationApproved === 'approved' ? checked : unchecked}</span> Đồng ý &nbsp; &nbsp; <span class="checkbox">${item.implementationApproved === 'rejected' ? checked : unchecked}</span> Không đồng ý</p>
                            <br/>
                            <p>Người phê duyệt: .................................</p>
                             <p style="text-align: center; padding-top: 5px;">${item.actionApprover || ''}</p>
                            <p>Ngày: ${formatDate(item.implementationApprovalDate)}</p>
                        </div>
                    </div>
                </div>

                <div class="section" style="margin-top: 20px;">
                    <p class="section-title">Kết quả khắc phục</p>
                    <p><span class="checkbox">${item.resultApproved === 'approved' ? checked : unchecked}</span> Đồng ý &nbsp; &nbsp; <span class="checkbox">${item.resultApproved === 'rejected' ? checked : unchecked}</span> Không đồng ý</p>
                    <p>Ghi chú: <span class="dotted-line">${item.actionEffectiveness || ''}</span></p>
                    <p class="dotted-line">&nbsp;</p>
                </div>

                <div class="section" style="margin-top: 20px;">
                    <p>Phê duyệt kết quả thực hiện: ................................................................</p>
                    <p style="text-align: center; padding-top: 5px;">${item.finalApprover || ''}</p>
                    <p style="float: right;">Ngày: ${formatDate(item.closedDate)}</p>
                </div>
                
                <table style="width: 100%; margin-top: 80px; font-size: 9pt;">
                    <tr>
                        <td>XN-BM 5.10.2.02</td>
                        <td style="text-align: center;">Lần ban hành: 01.dd/mm/20yy</td>
                        <td style="text-align: right;">Trang: 1/1</td>
                    </tr>
                </table>

            </div>
            </body></html>
        `;

        const blob = new Blob(['\ufeff', htmlContent], { type: 'application/msword' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Phieu_Bao_Cao_HDKP_${item.ncId}.doc`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        addAuditLog('Xuất file', `Xuất phiếu báo cáo HĐKP cho SKPH ${item.ncId}`);
    };

    const handleExportCorrectiveActionLogToDoc = (items: types.NonConformity[]) => {
        const ROWS_PER_PAGE = 5;
        const totalPages = Math.max(1, Math.ceil(items.length / ROWS_PER_PAGE));
        
        const categoryMap: Record<types.NonConformity['category'], string> = {
          'pre-analytical': 'Trước phân tích', 'analytical': 'Trong phân tích', 'post-analytical': 'Sau phân tích',
          'system': 'Hệ thống', 'safety': 'An toàn', 'supplier': 'Nhà cung cấp', 'other': 'Khác'
        };

        let pagesHtml = '';

        for (let i = 0; i < totalPages; i++) {
            const pageItems = items.slice(i * ROWS_PER_PAGE, (i + 1) * ROWS_PER_PAGE);
            const emptyRowsCount = ROWS_PER_PAGE - pageItems.length;

            let tableRowsHtml = pageItems.map(item => `
                <tr>
                    <td style="border: 1px solid black; padding: 4px; height: 60px; text-align: center; vertical-align: top;">${item.hdkpId || ''}</td>
                    <td style="border: 1px solid black; padding: 4px; vertical-align: top;">${categoryMap[item.category] || item.category}</td>
                    <td style="border: 1px solid black; padding: 4px; vertical-align: top;">${item.correctiveAction || ''}</td>
                    <td style="border: 1px solid black; padding: 4px; text-align: center; vertical-align: top;">${formatDate(item.implementationApprovalDate)}</td>
                    <td style="border: 1px solid black; padding: 4px; text-align: center; vertical-align: top;">${formatDate(item.completionDate)}</td>
                    <td style="border: 1px solid black; padding: 4px; vertical-align: top;">${item.actionPerformer || ''}</td>
                    <td style="border: 1px solid black; padding: 4px; vertical-align: top;">${item.actionEffectiveness || ''}</td>
                </tr>
            `).join('');

            for (let j = 0; j < emptyRowsCount; j++) {
                tableRowsHtml += `<tr>${Array(7).fill('<td style="border: 1px solid black; height: 60px;">&nbsp;</td>').join('')}</tr>`;
            }
            
            const pageNumber = i + 1;
            pagesHtml += `
                <div style="page-break-after: always; height: 170mm; position: relative;">
                    <div style="text-align: center; font-weight: bold;">
                        <p style="margin: 0;">BỆNH VIỆN ĐẠI HỌC Y DƯỢC</p>
                        <p style="margin: 0;">KHOA XÉT NGHIỆM</p>
                    </div>
                    <h1 style="text-align: center; font-size: 16pt; font-weight: bold; margin: 20px 0;">SỔ THEO DÕI HÀNH ĐỘNG KHẮC PHỤC</h1>
                    <table style="width: 100%; border-collapse: collapse; font-size: 10pt;">
                        <thead>
                            <tr>
                                <th style="border: 1px solid black; padding: 5px; width: 10%;">Mã HĐKP-</th>
                                <th style="border: 1px solid black; padding: 5px; width: 10%;">Phòng</th>
                                <th style="border: 1px solid black; padding: 5px; width: 30%;">Nội dung khắc phục</th>
                                <th style="border: 1px solid black; padding: 5px; width: 10%;">Ngày thực hiện</th>
                                <th style="border: 1px solid black; padding: 5px; width: 10%;">Ngày hoàn thành</th>
                                <th style="border: 1px solid black; padding: 5px; width: 15%;">Người thực hiện</th>
                                <th style="border: 1px solid black; padding: 5px; width: 15%;">Kết luận</th>
                            </tr>
                        </thead>
                        <tbody>${tableRowsHtml}</tbody>
                    </table>
                    <div style="width: 100%; display: flex; justify-content: space-between; font-size: 10pt; margin-top: 20px; position: absolute; bottom: 0;">
                        <span>XN-BM 5.10.2/01</span>
                        <span>Lần ban hành: 01.dd/mm/20yy</span>
                        <span>Trang: ${pageNumber}/${totalPages}</span>
                    </div>
                </div>`;
        }

        const htmlContent = `
            <html xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
            <head><meta charset="UTF-8"><title>So Theo Doi Hanh Dong Khac Phuc</title>
            <style>
                @page { size: A4 landscape; margin: 20mm; }
                body { font-family: 'Times New Roman', serif; font-size: 11pt; }
                div[style*="page-break-after: always"]:last-of-type { page-break-after: auto; }
            </style>
            </head><body>${pagesHtml}</body></html>`;
        
        const blob = new Blob(['\ufeff', htmlContent], { type: 'application/msword' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `So_Theo_Doi_HDKP.doc`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        addAuditLog('Xuất file', 'Xuất sổ theo dõi HĐKP ra file .doc');
    };

    const handleExportCorrectiveActionLogToExcel = (items: types.NonConformity[]) => {
        const categoryMap: Record<types.NonConformity['category'], string> = {
          'pre-analytical': 'Trước phân tích', 'analytical': 'Trong phân tích', 'post-analytical': 'Sau phân tích',
          'system': 'Hệ thống', 'safety': 'An toàn', 'supplier': 'Nhà cung cấp', 'other': 'Khác'
        };
        const dataToExport = items.map(item => ({
            'Mã HĐKP': item.hdkpId || '',
            'Phòng': categoryMap[item.category] || item.category,
            'Nội dung khắc phục': item.correctiveAction || '',
            'Ngày thực hiện': item.implementationApprovalDate ? formatDate(item.implementationApprovalDate) : '',
            'Ngày hoàn thành': item.completionDate ? formatDate(item.completionDate) : '',
            'Người thực hiện': item.actionPerformer || '',
            'Kết luận': item.actionEffectiveness || ''
        }));

        const ws = utils.json_to_sheet(dataToExport);
        const wb = utils.book_new();
        utils.book_append_sheet(wb, ws, "SoTheoDoiHDKP");
        writeFile(wb, `So_Theo_Doi_HDKP_${new Date().toISOString().split('T')[0]}.xlsx`);
        addAuditLog('Xuất file', 'Xuất sổ theo dõi HĐKP ra file .xlsx');
    };

    const handleExportMaintenanceSheetToDoc = (equipmentId: string, month: number, year: number) => {
        const equipment = labEquipment.find(e => e.id === equipmentId);
        if (!equipment) return;

        const daysInMonth = new Date(year, month, 0).getDate();
        const workItemsForEquipment = (equipment.associatedWorkItemIds || [])
            .map(id => workItems.find(item => item.id === id))
            .filter((item): item is types.WorkItem => !!item);

        const frequencyOrder: NonNullable<types.WorkItem['frequency']>[] = ['daily', 'weekly', 'monthly', 'quarterly', 'as_needed', 'replacement'];
        const frequencyLabels: Record<NonNullable<types.WorkItem['frequency']>, string> = {
            daily: 'Hàng ngày', weekly: 'Hàng tuần', monthly: 'Hàng tháng', quarterly: 'Hàng quý', as_needed: 'Khi cần', replacement: 'Thay thế'
        };

        const groupedWorkItems = frequencyOrder.map(freq => ({
            frequency: freq,
            label: frequencyLabels[freq],
            items: workItemsForEquipment.filter(item => item.frequency === freq)
        })).filter(group => group.items.length > 0);

        let tableBody = '';
        groupedWorkItems.forEach(group => {
            tableBody += `<tr><td colspan="${daysInMonth + 1}" style="background-color: #f2f2f2; font-weight: bold; padding: 5px; border: 1px solid black;">${group.label}</td></tr>`;
            group.items.forEach(item => {
                let dayCells = '';
                for (let day = 1; day <= daysInMonth; day++) {
                    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    const isChecked = maintenanceChecklistLogs.some(log => log.equipmentId === equipmentId && log.workItemId === item.id && log.date === dateStr);
                    dayCells += `<td style="border: 1px solid black; text-align: center; font-family: 'Segoe UI Symbol', sans-serif;">${isChecked ? '☑' : ''}</td>`;
                }
                tableBody += `<tr><td style="padding: 5px; border: 1px solid black;">${item.description}</td>${dayCells}</tr>`;
            });
        });
        
        let signatureRow = '<tr><td style="padding: 5px; border: 1px solid black; font-weight: bold;">NHÂN VIÊN/KỸ SƯ</td>';
        for (let day = 1; day <= daysInMonth; day++) {
            signatureRow += `<td style="height: 40px; border: 1px solid black;"></td>`;
        }
        signatureRow += '</tr>';

        const htmlContent = `
            <html xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
            <head><meta charset="UTF-8"><title>Phieu Bao Tri Thiet Bi</title>
            <style>
                @page { size: A4 landscape; margin: 15mm; }
                body { font-family: 'Times New Roman', serif; font-size: 9pt; }
                table { width: 100%; border-collapse: collapse; }
                th, td { border: 1px solid black; padding: 2px; text-align: left; vertical-align: middle; }
                th { text-align: center; font-weight: bold; }
            </style>
            </head>
            <body>
                <div style="text-align: center; font-weight: bold;">
                    <p style="margin:0;">BỆNH VIỆN ĐẠI HỌC Y DƯỢC</p>
                    <p style="margin:0;">KHOA XÉT NGHIỆM</p>
                </div>
                <h1 style="text-align: center; font-size: 14pt; margin: 15px 0;">PHIẾU BẢO TRÌ BẢO DƯỠNG THIẾT BỊ</h1>
                <p><strong>Tên thiết bị:</strong> ${equipment.name} &nbsp;&nbsp;&nbsp;&nbsp; <strong>Mã tài sản:</strong> ${equipment.assetId}</p>
                <p><strong>Tháng:</strong> ${month}/${year}</p>
                
                <table>
                    <thead>
                        <tr>
                            <th style="width: 20%;">Nội dung</th>
                            ${Array.from({ length: daysInMonth }, (_, i) => `<th style="width: 2.5%;">${i + 1}</th>`).join('')}
                        </tr>
                    </thead>
                    <tbody>
                        ${tableBody}
                        ${signatureRow}
                    </tbody>
                </table>
            </body></html>`;
        
        const blob = new Blob(['\ufeff', htmlContent], { type: 'application/msword' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Phieu_Bao_Tri_${equipment.assetId}_${month}-${year}.doc`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        addAuditLog('Xuất file', `Xuất phiếu bảo trì tháng ${month}/${year} cho ${equipment.name}`);
    };

    // FIX: Add handlers for Preventive Actions.
    // ======== PREVENTIVE ACTION HANDLERS ========
    const handleOpenPreventiveActionModal = (item: types.PreventiveActionReport | null) => {
        setEditingPreventiveAction(item);
        setPreventiveActionModalOpen(true);
    };

    const handleAddOrUpdatePreventiveAction = (data: Omit<types.PreventiveActionReport, 'id' | 'reportId'> | types.PreventiveActionReport) => {
        if ('id' in data) {
            // Update
            setPreventiveActionReports(prev => prev.map(r => r.id === data.id ? data : r));
            addAuditLog('Cập nhật HĐ Phòng ngừa', `Cập nhật báo cáo HDPN: ${data.reportId}`);
        } else {
            // Add new
            const generateReportId = (dateStr: string): string => {
                const date = new Date(dateStr + 'T00:00:00');
                const year = date.getFullYear().toString().slice(-2);
                const month = (date.getMonth() + 1).toString().padStart(2, '0');
                const prefix = `HDPN-${year}${month}`;
                const reportsInMonth = preventiveActionReports.filter(r => r.reportId.startsWith(prefix));
                const newSeq = (reportsInMonth.length + 1).toString().padStart(3, '0');
                return `${prefix}${newSeq}`;
            };
            const newReport: types.PreventiveActionReport = {
                id: `pact-${Date.now()}`,
                reportId: generateReportId(data.dateCreated),
                ...data
            };
            setPreventiveActionReports(prev => [newReport, ...prev].sort((a, b) => b.dateCreated.localeCompare(a.dateCreated)));
            addAuditLog('Tạo HĐ Phòng ngừa', `Tạo báo cáo HDPN mới: ${newReport.reportId}`);
        }
    };

    const handleDeletePreventiveAction = (id: string) => {
        const report = preventiveActionReports.find(r => r.id === id);
        if (!report) return;
        requestConfirmation(
            'Xác nhận Xóa Báo cáo',
            `Bạn có chắc muốn xóa báo cáo phòng ngừa "${report.reportId}"?`,
            () => {
                setPreventiveActionReports(prev => prev.filter(r => r.id !== id));
                addAuditLog('Xóa HĐ Phòng ngừa', `Đã xóa báo cáo HDPN: ${report.reportId}`);
            }
        );
    };

    const handleExportPreventiveActionToDoc = (report: types.PreventiveActionReport) => {
        const htmlContent = `
            <html>
            <head><meta charset="UTF-8"><title>Phieu Hanh Dong Phong Ngua</title>
            <style>body { font-family: 'Times New Roman', serif; } h1, h3 { text-align: center; } table { width: 100%; border-collapse: collapse; } td { border: 1px solid black; padding: 5px; vertical-align: top; }</style>
            </head>
            <body>
                <h1>PHIẾU HÀNH ĐỘNG PHÒNG NGỪA</h1>
                <p><strong>Số:</strong> ${report.reportId}</p>
                <p><strong>Ngày tạo:</strong> ${report.dateCreated}</p>
                <hr/>
                <h3>1. Mô tả vấn đề / Nguy cơ tiềm ẩn</h3>
                <p style="min-height: 80px;">${report.problemDescription}</p>
                <h3>2. Yếu tố nguy cơ</h3>
                <p style="min-height: 80px;">${report.riskFactors}</p>
                <h3>3. Biện pháp phòng ngừa đề xuất</h3>
                <p style="min-height: 100px;">${report.preventiveMeasures}</p>
                <hr/>
                <p><strong>Người thực hiện:</strong> ${report.executor}</p>
                <p><strong>Ngày thực hiện:</strong> ${report.executionDate}</p>
                <hr/>
                <h3>4. Đánh giá hiệu quả</h3>
                <p style="min-height: 100px;">${report.effectiveness || 'Chưa đánh giá'}</p>
                <p><strong>Người đánh giá:</strong> ${report.evaluator || 'N/A'}</p>
                <p><strong>Ngày đánh giá:</strong> ${report.evaluationDate || 'N/A'}</p>
            </body>
            </html>
        `;
        const blob = new Blob([htmlContent], { type: 'application/msword' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `HDPN_${report.reportId}.doc`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        addAuditLog('Xuất file', `Xuất phiếu HĐPN ${report.reportId}`);
    };



    // ======== RENDER LOGIC ========
    if (!currentUser) {
        return <LoginPage onLogin={handleLogin} />;
    }

    const navItems = [
        { id: 'alerts', label: 'Cảnh báo', icon: <BellIcon className="w-5 h-5" /> },
        { id: 'warehouse', label: 'Kho & Vật tư', icon: <ArchiveBoxIcon className="w-5 h-5" /> },
        { id: 'quality', label: 'Quản lý Chất lượng', icon: <ChartBarSquareIcon className="w-5 h-5" /> },
        { id: 'nonconformity', label: 'Sự không phù hợp', icon: <ExclamationTriangleIcon className="w-5 h-5" /> },
        { id: 'equipment', label: 'Thiết bị', icon: <ToolIcon className="w-5 h-5" /> },
        { id: 'personnel', label: 'Nhân sự & Đào tạo', icon: <AcademicCapIcon className="w-5 h-5" /> },
        { id: 'organization', label: 'Tổ chức & Phân công', icon: <BuildingOfficeIcon className="w-5 h-5" /> },
        { id: 'safety', label: 'An toàn & Môi trường', icon: <ShieldCheckIcon className="w-5 h-5" /> },
        { id: 'documents', label: 'Tài liệu & Hồ sơ', icon: <BookOpenIcon className="w-5 h-5" /> },
        { id: 'customer', label: 'Dịch vụ Khách hàng', icon: <HeadphonesIcon className="w-5 h-5" /> },
        { id: 'improvement', label: 'Cải tiến liên tục', icon: <RecycleIcon className="w-5 h-5" /> },
        { id: 'audit', label: 'Đánh giá', icon: <StarIcon className="w-5 h-5" /> },
        { id: 'info', label: 'Quản lý thông tin', icon: <InformationIcon className="w-5 h-5" /> },
        { id: 'dataManagement', label: 'Quản lý Dữ liệu', icon: <DatabaseIcon className="w-5 h-5" /> },
        { id: 'settings', label: 'Cài đặt', icon: <SettingsIcon className="w-5 h-5" /> },
    ];


    const renderPage = () => {
        switch(activePage) {
            case 'warehouse':
                return <WarehouseManagementPage 
                    chemicals={chemicals}
                    chemicalMasters={chemicalMasters}
                    storageLocations={storageLocations}
                    instruments={instruments}
                    planningSlips={planningSlips}
                    disposalRecords={disposalRecords}
                    onInstrumentStock={onInstrumentStock}
                    manualLogEntries={manualPreparationLogs}
                    currentUser={currentUser}
                    onEditChemical={(chemical) => { setEditingChemical(chemical); setChemicalFormModalOpen(true); }}
                    onDeleteChemical={handleDeleteChemical}
                    onGetSafetyInfo={handleGetSafetyInfo}
                    onOpenAdjustModal={(chemical) => { setChemicalToAdjust(chemical); setAdjustModalOpen(true); }}
                    onOpenUsageLog={(chemical) => { setChemicalForLog(chemical); setUsageLogModalOpen(true); }}
                    onOpenBarcodeModal={(chemical) => { setChemicalForBarcode(chemical); setBarcodeModalOpen(true); }}
                    onOpenSafetyDoc={(chemical) => { setChemicalForDoc(chemical); setSafetyDocModalOpen(true); }}
                    onAddLot={(master) => { 
                        const partialChemical: Partial<types.Chemical> = {
                            name: master.name, casNumber: master.casNumber, supplier: master.defaultSupplier,
                            unit: master.defaultUnit, storageLocation: master.defaultLocation,
                        };
                        setEditingChemical(partialChemical as types.Chemical); 
                        setChemicalFormModalOpen(true);
                    }}
                    onRecordUsage={(chemical) => { setChemicalToAdjust(chemical); setAdjustModalOpen(true); }}
                    onOpenMoveToInstrumentModal={(chemical) => { setChemicalToMove(chemical); setMoveToInstrumentModalOpen(true); }}
                    onInstrumentAdjust={(stock, action) => { setStockToAdjust({stock, action}); setOnInstrumentAdjustModalOpen(true); }}
                    onSavePlanningSlip={handleSavePlanningSlip}
                    onViewPlanningSlip={(slip) => { setSlipToView(slip); setPlanningSlipModalOpen(true); }}
                    onUpdatePhysicalCount={handleUpdatePhysicalCount}
                    onAddDisposalRecord={handleAddOrUpdateDisposalRecord}
                    onUpdateDisposalRecord={handleAddOrUpdateDisposalRecord}
                    onDeleteDisposalRecord={handleDeleteDisposalRecord}
                    onPrintDisposalRecord={(record) => { setDisposalToPrint(record); setIsDisposalPrintOpen(true); }}
                    onExportDisposalToExcel={handleExportDisposalToExcel}
                    onExportDisposalToDoc={handleExportDisposalToDoc}
                    onAddManualEntry={handleAddManualEntry}
                    onDownloadStockInTemplate={handleDownloadStockInTemplate}
                    onImportStockIn={handleImportStockIn}
                    monitoredAreas={monitoredAreas}
                    monitoredEquipment={monitoredEquipment}
                    areaEnvLogs={areaEnvLogs}
                    equipmentTempLogs={equipEnvLogs}
                    waterSources={waterSources}
                    waterConductivityLogs={waterConductivityLogs}
                />;
            case 'alerts': 
                return <AlertsPage 
                    chemicals={chemicals}
                    labEquipment={labEquipment}
                    iqcResults={iqcResults}
                    controlLotTargets={controlLotTargets}
                    testParameters={testParameters}
                    controlMaterials={controlMaterials}
                    monitoredAreas={monitoredAreas}
                    monitoredEquipment={monitoredEquipment}
                    waterSources={waterSources}
                    areaEnvLogs={areaEnvLogs}
                    equipmentTempLogs={equipEnvLogs}
                    waterConductivityLogs={waterConductivityLogs}
                    incidentReports={incidentReports}
                />;
            case 'quality':
            case 'nonconformity':
                return <QualityManagementPage
                    manualLogEntries={manualPreparationLogs}
                    chemicals={chemicals}
                    chemicalMasters={chemicalMasters}
                    currentUser={currentUser}
                    onAddManualEntry={() => alert('Chức năng đang được phát triển')}
                    testParameters={testParameters}
                    controlMaterials={controlMaterials}
                    controlLotTargets={controlLotTargets}
                    iqcResults={iqcResults}
                    onAddIQCResult={() => alert('Chức năng đang được phát triển')}
                    nonConformities={nonConformities}
                    onAddOrUpdateNC={(item) => { setEditingNonConformity(item); setNonConformityModalOpen(true); }}
                    onDeleteNC={handleDeleteNonConformity}
                    onExportToDoc={handleExportNonConformityToDoc}
                    onExportToExcel={handleExportNonConformityToExcel}
                    onExportCorrectiveActionToDoc={handleExportCorrectiveActionToDoc}
                    onExportCorrectiveActionLogToDoc={handleExportCorrectiveActionLogToDoc}
                    onExportCorrectiveActionLogToExcel={handleExportCorrectiveActionLogToExcel}
                    preventiveActionReports={preventiveActionReports}
                    onAddOrUpdatePreventiveAction={handleOpenPreventiveActionModal}
                    onDeletePreventiveAction={handleDeletePreventiveAction}
                    onExportPreventiveActionToDoc={handleExportPreventiveActionToDoc}
                />;
            case 'safety': return <EnvironmentSafetyPage 
                    accessLogs={accessLogs} 
                    areaEnvLogs={areaEnvLogs} 
                    equipEnvLogs={equipEnvLogs} 
                    waterConductivityLogs={waterConductivityLogs} 
                    incidentReports={incidentReports}
                    monitoredAreas={monitoredAreas} 
                    monitoredEquipment={monitoredEquipment} 
                    waterSources={waterSources} 
                    currentUser={currentUser}
                    onAddAccessLog={handleAddAccessLog}
                    onUpdateAccessLog={handleUpdateAccessLog}
                    onAddAreaEnvLog={handleAddAreaEnvLog}
                    onAddEquipEnvLog={handleAddEquipEnvLog}
                    onAddWaterConductivityLog={handleAddWaterConductivityLog}
                    onAddOrUpdateIncidentReport={handleAddOrUpdateIncidentReport}
                    onDeleteIncidentReport={handleDeleteIncidentReport}
                    onExportIncidentToDoc={handleExportIncidentToDoc}
                    onAddItem={handleAddMonitoredItem}
                    onUpdateItem={handleUpdateMonitoredItem}
                    onDeleteItem={handleDeleteMonitoredItem}
                />
            case 'personnel': return <PersonnelPage 
                    personnel={personnel}
                    jobRoles={jobRoles}
                    trainees={trainees}
                    trainingCourses={trainingCourses}
                    trainingRecords={trainingRecords}
                    competencies={competencies}
                    competencyAssessments={competencyAssessments}
                    onAdd={() => handleOpenPersonnelFormModal(null)}
                    onEdit={handleOpenPersonnelFormModal}
                    onDelete={handleDeletePersonnel}
                    onViewDetails={handleOpenPersonnelDetailModal}
                    onAddTrainee={() => handleOpenTraineeFormModal(null)}
                    onEditTrainee={handleOpenTraineeFormModal}
                    onDeleteTrainee={handleDeleteTrainee}
                    onAddTrainingCourse={() => { setEditingTrainingCourse(null); setTrainingCourseModalOpen(true); }}
                    onEditTrainingCourse={(c) => { setEditingTrainingCourse(c); setTrainingCourseModalOpen(true); }}
                    onDeleteTrainingCourse={handleDeleteTrainingCourse}
                    onAddCompetency={() => { setEditingCompetency(null); setCompetencyModalOpen(true); }}
                    onEditCompetency={(c) => { setEditingCompetency(c); setCompetencyModalOpen(true); }}
                    onDeleteCompetency={handleDeleteCompetency}
                />;
            case 'equipment': return <EquipmentPage
                    equipment={labEquipment}
                    personnel={personnel}
                    equipmentUsageLogs={equipmentUsageLogs}
                    workItems={workItems}
                    currentUser={currentUser}
                    onAdd={() => handleOpenEquipmentFormModal(null)}
                    onEdit={handleOpenEquipmentFormModal}
                    onDelete={handleDeleteEquipment}
                    onViewDetails={handleOpenEquipmentDetailModal}
                    onOpenAddUsageLog={() => setEquipmentUsageLogModalOpen(true)}
                    onUpdateAssociatedWorkItems={handleUpdateAssociatedWorkItems}
                    onAddOrUpdateWorkItem={handleAddOrUpdateWorkItem}
                    onDeleteWorkItem={handleDeleteWorkItem}
                    onExportToDoc={handleExportEquipmentProfileToDoc}
                    onExportUsageLogToDoc={handleExportUsageLogToDoc}
                    maintenanceChecklistLogs={maintenanceChecklistLogs}
                    onToggleMaintenanceCheck={handleToggleMaintenanceCheck}
                    onExportMaintenanceSheetToDoc={handleExportMaintenanceSheetToDoc}
                    accessLogs={accessLogs}
                    onCreateNonConformity={handleCreateNonConformityFromLog}
                    onUpdateUsageLog={handleUpdateEquipmentUsageLog}
                />;
            case 'documents': return <DocumentsPage 
                    documents={documents}
                    onAdd={() => { setEditingDocument(null); setDocumentFormModalOpen(true); }}
                    onEdit={(doc) => { setEditingDocument(doc); setDocumentFormModalOpen(true); }}
                    onDelete={handleDeleteDocument}
                    onViewDocument={setDocumentToView}
                />;
            case 'customer': return <CustomerServicePage feedbackItems={[]} onAddOrUpdate={() => {}} onDelete={() => {}} />;
            case 'improvement': return <ContinuousImprovementPage initiatives={[]} onAddOrUpdate={() => {}} onDelete={() => {}} />;
            case 'organization': return <OrganizationPage 
                organizationUnits={organizationUnits}
                jobRoles={jobRoles}
                personnel={personnel}
                personnelAssignmentHistory={personnelAssignmentHistory}
                leaveRecords={leaveRecords}
                attendanceRecords={attendanceRecords}
                dutyAssignments={dutyAssignments}
                taskAssignments={taskAssignments}
                kpiScores={kpiScores}
                workSchedule={workSchedule}
                holidays={holidays}
                onAddUnit={(parentId) => handleOpenOrgUnitModal(null, parentId)}
                onEditUnit={handleOpenOrgUnitModal}
                onDeleteUnit={handleDeleteOrganizationUnit}
                onAddRole={() => handleOpenJobRoleModal(null)}
                onEditRole={handleOpenJobRoleModal}
                onDeleteRole={handleDeleteJobRole}
                onAddLeave={() => handleOpenLeaveModal()}
                onAddOrUpdateAttendance={handleOpenAttendanceModal}
                onAddDutyAssignment={handleAddDutyAssignment}
                onDeleteDutyAssignment={handleDeleteDutyAssignment}
                onAddTaskAssignment={handleAddTaskAssignment}
                onOpenMovePersonnel={() => setMovePersonnelModalOpen(true)}
                onAddOrUpdateKpiScore={handleAddOrUpdateKpiScore}
                />;
            case 'settings': return <SettingsPage 
                    testParameters={testParameters}
                    chemicalMasters={chemicalMasters}
                    instruments={instruments}
                    roomLocations={roomLocations}
                    storageLocations={storageLocations}
                    controlMaterials={controlMaterials}
                    eqaMaterials={eqaMaterials}
                    documentCategories={documentCategories}
                    onOpenModal={handleOpenSettingsModal}
                    onDeleteItem={handleDeleteSettingsItem}
                    onOpenImportModal={() => setChemicalMasterImportModalOpen(true)}
                    users={users}
                    currentUser={currentUser!}
                    onOpenUserFormModal={handleOpenUserFormModal}
                    onDeleteUser={handleDeleteUser}
                    workSchedule={workSchedule}
                    holidays={holidays}
                    onUpdateWorkSchedule={handleUpdateWorkSchedule}
                    onAddHoliday={handleAddHoliday}
                    onDeleteHoliday={handleDeleteHoliday}
                />;
            case 'info': return <InformationManagementPage />;
            case 'audit': return <AuditPage />;
            case 'dataManagement': return <DataManagementPage onBackup={handleBackup} onRestore={handleRestore} />;
            default: return <div>Page not found</div>;
        }
    }

    return (
        <div className="flex h-screen bg-slate-100 text-slate-800">
            {/* Sidebar Navigation */}
            <aside className="w-64 bg-white shadow-md flex flex-col">
                <div className="p-4 border-b border-slate-200">
                    <h1 className="text-xl font-bold text-center text-blue-700">QLAB-MS</h1>
                </div>
                <nav className="flex-1 overflow-y-auto py-2">
                    <ul className="space-y-1">
                        {navItems.map(item => (
                            <NavItem
                            key={item.id}
                            icon={item.icon}
                            label={item.label}
                            isActive={activePage === item.id}
                            onClick={() => setActivePage(item.id as Page)}
                            />
                        ))}
                    </ul>
                </nav>
                <div className="p-4 border-t border-slate-200">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center">
                                <UserIcon className="w-6 h-6 text-slate-600" />
                            </div>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-semibold text-slate-800">{currentUser.fullName}</p>
                            <p className="text-xs text-slate-500 capitalize">{currentUser.role}</p>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="ml-auto p-2 text-slate-500 hover:text-slate-800 rounded-full hover:bg-slate-100"
                            title="Đăng xuất"
                        >
                            <LogoutIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-6 overflow-y-auto">
                {renderPage()}
            </main>
            
            {/* Chatbot Toggle */}
            <button
                onClick={() => setIsChatbotOpen(!isChatbotOpen)}
                className="fixed bottom-5 right-5 w-14 h-14 bg-indigo-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-indigo-700 transition-transform hover:scale-110"
                title="Trợ lý AI Lab"
            >
                <SparklesIcon className="w-7 h-7" />
            </button>
            
            {/* Modals */}
            {/* FIX: Cast to types.Chemical as Chemical is not directly imported. */}
            <ChemicalFormModal isOpen={isChemicalFormModalOpen} onClose={() => setChemicalFormModalOpen(false)} onSubmit={handleAddOrUpdateChemical} initialData={editingChemical as types.Chemical} storageLocations={storageLocations}/>
            <AdjustQuantityModal isOpen={isAdjustModalOpen} onClose={() => setAdjustModalOpen(false)} onSubmit={handleAdjustQuantity} chemical={chemicalToAdjust} currentUser={currentUser} storageLocations={storageLocations} instruments={instruments} />
            <UsageLogModal isOpen={isUsageLogModalOpen} onClose={() => setUsageLogModalOpen(false)} chemical={chemicalForLog} />
            <SafetyInfoModal isOpen={isSafetyInfoModalOpen} onClose={() => setSafetyInfoModalOpen(false)} chemical={chemicalForSafety} safetyInfo={safetyInfo} isLoading={isSafetyInfoLoading} />
            <BarcodeModal isOpen={isBarcodeModalOpen} onClose={() => setBarcodeModalOpen(false)} chemical={chemicalForBarcode} />
            <SafetyDocumentModal isOpen={isSafetyDocModalOpen} onClose={() => setSafetyDocModalOpen(false)} chemical={chemicalForDoc} />
            <MoveToInstrumentModal isOpen={isMoveToInstrumentModalOpen} onClose={() => setMoveToInstrumentModalOpen(false)} onSubmit={handleMoveToInstrument} chemical={chemicalToMove} instruments={instruments} />
            <OnInstrumentAdjustModal isOpen={isOnInstrumentAdjustModalOpen} onClose={() => setOnInstrumentAdjustModalOpen(false)} onSubmit={handleConfirmInstrumentAdjust} stockItem={stockToAdjust?.stock || null} action={stockToAdjust?.action || 'use'} currentUser={currentUser} />
            <PlanningSlipModal slip={slipToView} onClose={() => setSlipToView(null)} />
            {/* FIX: Corrected state setter name from setIsDisposalFormModalOpen to setDisposalFormModalOpen. */}
            <DisposalFormModal isOpen={isDisposalFormModalOpen} onClose={() => setDisposalFormModalOpen(false)} onSubmit={handleAddOrUpdateDisposalRecord} initialData={editingDisposal} currentUserFullName={currentUser!.fullName} />
            {disposalToPrint && <DisposalPrintView record={disposalToPrint} />}

            <PersonnelFormModal isOpen={isPersonnelFormModalOpen} onClose={() => setPersonnelFormModalOpen(false)} onSubmit={handleAddOrUpdatePersonnel} initialData={editingPersonnel} jobRoles={jobRoles} organizationUnits={organizationUnits} />
            <TraineeFormModal isOpen={isTraineeFormModalOpen} onClose={() => setTraineeFormModalOpen(false)} onSubmit={handleAddOrUpdateTrainee} initialData={editingTrainee} personnel={personnel} />
            <EquipmentFormModal isOpen={isEquipmentFormModalOpen} onClose={() => setEquipmentFormModalOpen(false)} onSubmit={handleAddOrUpdateEquipment} initialData={editingEquipment} roomLocations={roomLocations} />
            <EquipmentDetailModal isOpen={isEquipmentDetailModalOpen} onClose={() => setEquipmentDetailModalOpen(false)} equipment={editingEquipment} onAddMaintenance={()=>setMaintenanceLogModalOpen(true)} onAddCalibration={()=>setCalibrationLogModalOpen(true)} onAddDocument={()=>setEquipmentDocModalOpen(true)} onDeleteMaintenance={()=>{}} onDeleteCalibration={()=>{}} onDeleteDocument={()=>{}} onViewDocument={setDocumentToView} />
            <MaintenanceLogFormModal isOpen={isMaintenanceLogModalOpen} onClose={() => setMaintenanceLogModalOpen(false)} onSubmit={handleAddMaintenanceRecord} currentUser={currentUser} />
            <CalibrationLogFormModal isOpen={isCalibrationLogModalOpen} onClose={() => setCalibrationLogModalOpen(false)} onSubmit={handleAddCalibrationRecord} currentUser={currentUser} />
            <EquipmentDocumentFormModal isOpen={isEquipmentDocModalOpen} onClose={() => setEquipmentDocModalOpen(false)} onSubmit={handleAddEquipmentDocument} />
            <EquipmentUsageLogFormModal isOpen={isEquipmentUsageLogModalOpen} onClose={() => setEquipmentUsageLogModalOpen(false)} onSubmit={handleAddEquipmentUsageLog} equipmentList={labEquipment} userList={personnel} currentUser={currentUser} accessLogs={accessLogs} />
            <DocumentViewerModal isOpen={!!documentToView} onClose={() => setDocumentToView(null)} document={documentToView} />
            <JobRoleFormModal isOpen={isJobRoleModalOpen} onClose={() => setJobRoleModalOpen(false)} onSubmit={handleAddOrUpdateJobRole} initialData={editingJobRole} />
            <OrganizationUnitFormModal isOpen={isOrgUnitModalOpen} onClose={() => setOrgUnitModalOpen(false)} onSubmit={handleAddOrUpdateOrganizationUnit} initialData={editingOrgUnit} parentId={orgUnitParentId} units={organizationUnits} />
            <PersonnelDetailModal isOpen={isPersonnelDetailModalOpen} onClose={() => setPersonnelDetailModalOpen(false)} personnel={editingPersonnel} jobRole={jobRoles.find(r => r.id === editingPersonnel?.jobRoleId)} organizationUnit={organizationUnits.find(u => u.id === editingPersonnel?.organizationUnitId)} onAddDocument={() => setPersonnelDocModalOpen(true)} onDeleteDocument={handleDeletePersonnelDocument} onViewDocument={setDocumentToView} trainingRecords={trainingRecords.filter(r => r.personnelId === editingPersonnel?.id)} trainingCourses={trainingCourses} competencies={competencies} competencyAssessments={competencyAssessments.filter(a => a.personnelId === editingPersonnel?.id)} allPersonnel={personnel} onAddTrainingRecord={() => setTrainingRecordModalOpen(true)} onDeleteTrainingRecord={handleDeleteTrainingRecord} onAddCompetencyAssessment={() => setCompetencyAssessmentModalOpen(true)} onDeleteCompetencyAssessment={handleDeleteCompetencyAssessment}/>
            <PersonnelDocumentFormModal isOpen={isPersonnelDocModalOpen} onClose={() => setPersonnelDocModalOpen(false)} onSubmit={handleAddPersonnelDocument} />
            <LeaveFormModal isOpen={isLeaveModalOpen} onClose={() => setLeaveModalOpen(false)} onSubmit={handleSaveLeave} initialData={editingLeave} personnel={personnel} />
            <AttendanceFormModal isOpen={isAttendanceModalOpen} onClose={() => setAttendanceModalOpen(false)} onSubmit={handleSaveAttendance} context={attendanceContext} personnel={personnel.find(p => p.id === attendanceContext?.personnelId)} />
            <DutyAssignmentFormModal isOpen={isDutyModalOpen} onClose={() => setDutyModalOpen(false)} onSubmit={handleAddDutyAssignment} context={assignmentContext} />
            <TaskAssignmentFormModal isOpen={isTaskModalOpen} onClose={() => setTaskModalOpen(false)} onSubmit={handleAddTaskAssignment} context={assignmentContext} />
            <MovePersonnelModal isOpen={isMovePersonnelModalOpen} onClose={() => setMovePersonnelModalOpen(false)} onSubmit={handleMovePersonnel} personnel={personnel} organizationUnits={organizationUnits} />
            <DocumentFormModal isOpen={isDocumentFormModalOpen} onClose={() => setDocumentFormModalOpen(false)} onSubmit={handleAddOrUpdateDocument} initialData={editingDocument} documentCategories={documentCategories} />
            <NonConformityFormModal isOpen={isNonConformityModalOpen} onClose={() => setNonConformityModalOpen(false)} onSubmit={handleAddOrUpdateNonConformity} initialData={editingNonConformity} currentUser={currentUser} />
            <PreventiveActionFormModal isOpen={isPreventiveActionModalOpen} onClose={() => setPreventiveActionModalOpen(false)} onSubmit={handleAddOrUpdatePreventiveAction} initialData={editingPreventiveAction} currentUser={currentUser} />

            {isSettingsModalOpen && settingsModalType === 'testParameter' && <TestParameterFormModal isOpen={isSettingsModalOpen} onClose={() => setSettingsModalOpen(false)} onSubmit={handleSettingsSubmit} initialData={editingSettingsItem} />}
            {isSettingsModalOpen && settingsModalType === 'chemicalMaster' && <ChemicalMasterFormModal isOpen={isSettingsModalOpen} onClose={() => setSettingsModalOpen(false)} onSubmit={handleSettingsSubmit} initialData={editingSettingsItem} />}
            {isSettingsModalOpen && settingsModalType === 'instrument' && <InstrumentFormModal isOpen={isSettingsModalOpen} onClose={() => setSettingsModalOpen(false)} onSubmit={handleSettingsSubmit} initialData={editingSettingsItem} />}
            {isSettingsModalOpen && settingsModalType === 'roomLocation' && <RoomLocationFormModal isOpen={isSettingsModalOpen} onClose={() => setSettingsModalOpen(false)} onSubmit={handleSettingsSubmit} initialData={editingSettingsItem} />}
            {isSettingsModalOpen && settingsModalType === 'storage' && <StorageFormModal isOpen={isSettingsModalOpen} onClose={() => setSettingsModalOpen(false)} onSubmit={handleSettingsSubmit} initialData={editingSettingsItem} />}
            {isSettingsModalOpen && settingsModalType === 'controlMaterial' && <ControlMaterialFormModal isOpen={isSettingsModalOpen} onClose={() => setSettingsModalOpen(false)} onSubmit={handleSettingsSubmit} initialData={editingSettingsItem} chemicalMasters={chemicalMasters} />}
            {isSettingsModalOpen && settingsModalType === 'eqaMaterial' && <EQAMaterialFormModal isOpen={isSettingsModalOpen} onClose={() => setSettingsModalOpen(false)} onSubmit={handleSettingsSubmit} initialData={editingSettingsItem} />}
            {isSettingsModalOpen && settingsModalType === 'documentCategory' && <DocumentCategoryFormModal isOpen={isSettingsModalOpen} onClose={() => setSettingsModalOpen(false)} onSubmit={handleSettingsSubmit} initialData={editingSettingsItem} />}
            <ChemicalMasterImportModal isOpen={isChemicalMasterImportModalOpen} onClose={() => setChemicalMasterImportModalOpen(false)} onImport={handleImportChemicalMasters} onDownloadTemplate={handleDownloadChemicalMasterTemplate}/>
            <UserFormModal isOpen={isUserFormModalOpen} onClose={() => setUserFormModalOpen(false)} onSubmit={handleAddOrUpdateUser} initialData={editingUser} currentUser={currentUser!} />
            <TrainingCourseFormModal isOpen={isTrainingCourseModalOpen} onClose={() => setTrainingCourseModalOpen(false)} onSubmit={handleAddOrUpdateTrainingCourse} initialData={editingTrainingCourse} />
            <TrainingRecordFormModal isOpen={isTrainingRecordModalOpen} onClose={() => setTrainingRecordModalOpen(false)} onSubmit={handleAddTrainingRecord} personnel={editingPersonnel!} courses={trainingCourses} />
            <CompetencyFormModal isOpen={isCompetencyModalOpen} onClose={() => setCompetencyModalOpen(false)} onSubmit={handleAddOrUpdateCompetency} initialData={editingCompetency} />
            <CompetencyAssessmentFormModal isOpen={isCompetencyAssessmentModalOpen} onClose={() => setCompetencyAssessmentModalOpen(false)} onSubmit={handleAddCompetencyAssessment} personnel={editingPersonnel!} competencies={competencies} assessors={personnel} />


            <ConfirmationModal isOpen={!!confirmation} onClose={closeConfirmation} onConfirm={handleConfirm} title={confirmation?.title || ''} message={confirmation?.message || ''} />
            <Chatbot isOpen={isChatbotOpen} onClose={() => setIsChatbotOpen(false)} onSendQuery={handleSendQuery} history={chatHistory} isLoading={isChatbotLoading} />
        </div>
    );
}

export default App;