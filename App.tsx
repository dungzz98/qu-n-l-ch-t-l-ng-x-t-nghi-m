import React, { useState, useEffect, useCallback, useRef } from 'react';
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
import { NonConformityPage } from './components/NonConformityPage';
import Chatbot, { ChatMessage } from './components/Chatbot';
import DocumentFormModal from './components/DocumentFormModal';
import NonConformityFormModal from './components/NonConformityFormModal';
import PreventiveActionFormModal from './components/PreventiveActionFormModal';
import WorkItemFormModal from './components/WorkItemFormModal';
import GlobalSearch from './components/GlobalSearch';


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
import IQCResultFormModal from './components/IQCResultFormModal';
import ControlLotTargetFormModal from './components/ControlLotTargetFormModal';


import * as types from './types';
import * as data from './data';
import { getSafetyInfo, getChatbotResponse, generateDisposalReport } from './services/geminiService';
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
import { ClipboardDocumentCheckIcon } from './components/icons/ClipboardDocumentCheckIcon';
import { GlobeAltIcon } from './components/icons/GlobeAltIcon';
import { ChevronDoubleLeftIcon } from './components/icons/ChevronDoubleLeftIcon';


type Page = 
    | 'warehouse' | 'quality' | 'safety' | 'personnel' | 'equipment' | 'documents' 
    | 'customer' | 'improvement' | 'organization' | 'settings' | 'info' | 'audit' 
    | 'nonconformity' | 'dataManagement' | 'alerts';

type ActiveItemType = 'area' | 'equipment' | 'waterSource';

type ModalType = 
    | 'testParameter' | 'chemicalMaster' | 'instrument' | 'roomLocation' 
    | 'storage' | 'controlMaterial' | 'eqaMaterial' | 'documentCategory' | 'iqcResult' | 'controlLotTarget' | 'workItem' | null;

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

const PrimaryNavItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
  isCollapsed: boolean;
}> = ({ icon, label, isActive, isCollapsed, onClick }) => (
  <li>
    <a
      href="#"
      onClick={(e) => { e.preventDefault(); onClick(); }}
      title={isCollapsed ? label : undefined}
      className={`flex p-4 text-base rounded-lg mx-2 my-1 transition-colors ${
        isCollapsed ? 'justify-center' : 'items-center'
      } ${
        isActive
          ? 'bg-blue-600 text-white font-bold shadow-md'
          : 'text-slate-200 hover:bg-slate-700 hover:text-white'
      }`}
    >
      {icon}
      {!isCollapsed && <span className="ml-4 whitespace-nowrap">{label}</span>}
    </a>
  </li>
);


const NavItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}> = ({ icon, label, isActive, onClick }) => (
  <li>
    <a
      href="#"
      onClick={(e) => { e.preventDefault(); onClick(); }}
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

const QmsIsoPage = () => (
    <div className="bg-white p-8 rounded-lg shadow-lg text-center h-full flex flex-col justify-center items-center">
        <GlobeAltIcon className="w-16 h-16 text-blue-500 mb-4" />
        <h2 className="text-2xl font-bold text-slate-800 mb-4">Quản lý theo ISO 15189:2022</h2>
        <p className="text-slate-600 max-w-xl">Module này đang trong quá trình phát triển và sẽ sớm được ra mắt.</p>
        <p className="text-slate-600 mt-2 max-w-xl">Các tính năng dự kiến sẽ bao gồm quản lý rủi ro, đánh giá nhà cung cấp, và các yêu cầu khác theo tiêu chuẩn ISO 15189:2022.</p>
    </div>
);


const App = () => {
    // ======== STATE MANAGEMENT ========
    const [currentUser, setCurrentUser] = useState<types.User | null>(null);
    const [activeModule, setActiveModule] = useState<'qms2429' | 'qmsISO'>('qms2429');
    const [activePage, setActivePage] = useState<Page>('alerts');
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);


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
    const [labDocuments, setLabDocuments] = useState<types.LabDocument[]>(data.initialDocuments);
    const [documentCategories, setDocumentCategories] = useState<types.DocumentCategory[]>(data.initialDocumentCategories);
    const [improvementInitiatives, setImprovementInitiatives] = useState<types.ImprovementInitiative[]>(data.initialImprovementInitiatives);
    const [customerFeedback, setCustomerFeedback] = useState<types.CustomerFeedback[]>(data.initialCustomerFeedback);
    const [auditRecords, setAuditRecords] = useState<types.AuditRecord[]>(data.initialAuditRecords);
    const [planningSlips, setPlanningSlips] = useState<types.PlanningSlip[]>(data.initialPlanningSlips);
    const [disposalRecords, setDisposalRecords] = useState<types.DisposalRecord[]>(data.initialDisposalRecords);
    const [manualPreparationLogs, setManualPreparationLogs] = useState<types.ManualPreparationLog[]>(data.initialManualPreparationLogs);
    const [maintenanceChecklistLogs, setMaintenanceChecklistLogs] = useState<types.MaintenanceChecklistLog[]>(data.initialMaintenanceChecklistLogs);
    const [equipmentUsageLogs, setEquipmentUsageLogs] = useState<types.EquipmentUsageLog[]>(data.initialEquipmentUsageLogs);
    const [roomLocations, setRoomLocations] = useState<types.RoomLocation[]>(data.initialRoomLocations);
    const [eqaMaterials, setEQAMaterials] = useState<types.EQAMaterial[]>(data.initialEQAMaterials);
    const [preventiveActionReports, setPreventiveActionReports] = useState<types.PreventiveActionReport[]>(data.initialPreventiveActionReports);

    // Modal states
    const [isChemicalFormOpen, setIsChemicalFormOpen] = useState(false);
    const [editingChemical, setEditingChemical] = useState<types.Chemical | null>(null);
    const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
    const [chemicalToAdjust, setChemicalToAdjust] = useState<types.Chemical | null>(null);
    const [isUsageLogOpen, setIsUsageLogOpen] = useState(false);
    const [chemicalForLog, setChemicalForLog] = useState<types.Chemical | null>(null);
    const [isSafetyInfoOpen, setIsSafetyInfoOpen] = useState(false);
    const [safetyInfo, setSafetyInfo] = useState('');
    const [isSafetyInfoLoading, setIsSafetyInfoLoading] = useState(false);
    const [chemicalForSafety, setChemicalForSafety] = useState<types.Chemical | null>(null);
    const [isBarcodeModalOpen, setIsBarcodeModalOpen] = useState(false);
    const [chemicalForBarcode, setChemicalForBarcode] = useState<types.Chemical | null>(null);
    const [isSafetyDocOpen, setIsSafetyDocOpen] = useState(false);
    const [chemicalForSafetyDoc, setChemicalForSafetyDoc] = useState<types.Chemical | null>(null);
    const [isMoveToInstrumentModalOpen, setIsMoveToInstrumentModalOpen] = useState(false);
    const [chemicalToMove, setChemicalToMove] = useState<types.Chemical | null>(null);
    const [isOnInstrumentAdjustModalOpen, setIsOnInstrumentAdjustModalOpen] = useState(false);
    const [stockToAdjust, setStockToAdjust] = useState<{item: types.OnInstrumentStock, action: 'use' | 'return' | 'discard'} | null>(null);
    const [isPlanningSlipModalOpen, setIsPlanningSlipModalOpen] = useState(false);
    const [slipToView, setSlipToView] = useState<types.PlanningSlip | null>(null);
    const [isDisposalFormOpen, setIsDisposalFormOpen] = useState(false);
    const [editingDisposalRecord, setEditingDisposalRecord] = useState<types.DisposalRecord | null>(null);
    const [disposalToPrint, setDisposalToPrint] = useState<types.DisposalRecord | null>(null);
    const [isChatbotOpen, setIsChatbotOpen] = useState(false);
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
    const [isChatbotLoading, setIsChatbotLoading] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [confirmAction, setConfirmAction] = useState<{ onConfirm: () => void, title: string, message: string } | null>(null);

    // Settings Modals
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    const [activeSettingsModal, setActiveSettingsModal] = useState<ModalType>(null);
    const [settingsInitialData, setSettingsInitialData] = useState<any>(null);
    const [isChemicalMasterImportOpen, setIsChemicalMasterImportOpen] = useState(false);

    const [isPersonnelFormOpen, setIsPersonnelFormOpen] = useState(false);
    const [editingPersonnel, setEditingPersonnel] = useState<types.PersonnelProfile | null>(null);
    const [isTraineeFormOpen, setIsTraineeFormOpen] = useState(false);
    const [editingTrainee, setEditingTrainee] = useState<types.TraineeProfile | null>(null);
    const [isEquipmentFormOpen, setIsEquipmentFormOpen] = useState(false);
    const [editingEquipment, setEditingEquipment] = useState<types.LabEquipment | null>(null);
    const [equipmentForDetail, setEquipmentForDetail] = useState<types.LabEquipment | null>(null);
    const [isMaintenanceFormOpen, setIsMaintenanceFormOpen] = useState(false);
    const [isCalibrationFormOpen, setIsCalibrationFormOpen] = useState(false);
    const [isEquipmentDocFormOpen, setIsEquipmentDocFormOpen] = useState(false);
    const [isEquipmentUsageLogFormOpen, setIsEquipmentUsageLogFormOpen] = useState(false);
    const [documentToView, setDocumentToView] = useState<types.LabDocument | types.EquipmentDocument | types.PersonnelDocument | null>(null);
    const [isJobRoleFormOpen, setIsJobRoleFormOpen] = useState(false);
    const [editingJobRole, setEditingJobRole] = useState<types.JobRole | null>(null);
    const [isOrgUnitFormOpen, setIsOrgUnitFormOpen] = useState(false);
    const [editingOrgUnit, setEditingOrgUnit] = useState<types.OrganizationUnit | null>(null);
    const [orgUnitParentId, setOrgUnitParentId] = useState<string | null>(null);
    const [personnelForDetail, setPersonnelForDetail] = useState<types.PersonnelProfile | null>(null);
    const [isPersonnelDocFormOpen, setIsPersonnelDocFormOpen] = useState(false);
    const [isLeaveFormOpen, setIsLeaveFormOpen] = useState(false);
    const [isAttendanceFormOpen, setIsAttendanceFormOpen] = useState(false);
    const [attendanceContext, setAttendanceContext] = useState<{ personnelId: string, date: string, record?: types.AttendanceRecord } | null>(null);
    const [isDutyFormOpen, setIsDutyFormOpen] = useState(false);
    const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
    const [isMovePersonnelOpen, setIsMovePersonnelOpen] = useState(false);
    const [isTrainingCourseFormOpen, setIsTrainingCourseFormOpen] = useState(false);
    const [editingTrainingCourse, setEditingTrainingCourse] = useState<types.TrainingCourse | null>(null);
    const [isTrainingRecordFormOpen, setIsTrainingRecordFormOpen] = useState(false);
    const [isCompetencyFormOpen, setIsCompetencyFormOpen] = useState(false);
    const [editingCompetency, setEditingCompetency] = useState<types.Competency | null>(null);
    const [isCompetencyAssessmentFormOpen, setIsCompetencyAssessmentFormOpen] = useState(false);
    const [isDocumentFormOpen, setIsDocumentFormOpen] = useState(false);
    const [editingDocument, setEditingDocument] = useState<types.LabDocument | null>(null);
    const [isNonConformityFormOpen, setIsNonConformityFormOpen] = useState(false);
    const [editingNC, setEditingNC] = useState<types.NonConformity | null>(null);
    const [isPreventiveActionFormOpen, setIsPreventiveActionFormOpen] = useState(false);
    const [editingPA, setEditingPA] = useState<types.PreventiveActionReport | null>(null);
    const [isUserFormOpen, setIsUserFormOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<types.User | null>(null);

    // Global Search State
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<types.SearchResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [focusedItemId, setFocusedItemId] = useState<string | null>(null);
    
    useEffect(() => {
        if (focusedItemId) {
            const timer = setTimeout(() => {
                setFocusedItemId(null);
            }, 2500); // Highlight duration
            return () => clearTimeout(timer);
        }
    }, [focusedItemId]);


    // ======== HANDLERS ========
    const handleLogin = (username: string, password: string): types.User | null => {
        const user = users.find(u => u.username === username && u.passwordHash === password);
        if (user) {
            setCurrentUser(user);
            return user;
        }
        return null;
    };
    const handleLogout = () => {
        setCurrentUser(null);
        setActivePage('alerts');
        setActiveModule('qms2429');
    };

    const handleDelete = (setter: React.Dispatch<React.SetStateAction<any[]>>, id: string, title: string, message: string) => {
        setConfirmAction({
            onConfirm: () => {
                setter(prev => prev.filter(item => item.id !== id));
                setConfirmAction(null);
            },
            title, message
        });
        setIsConfirmModalOpen(true);
    };

    const handleSave = (setter: React.Dispatch<React.SetStateAction<any[]>>, data: any, idPrefix: string) => {
        if (data.id) {
            setter(prev => prev.map(item => item.id === data.id ? data : item));
        } else {
            setter(prev => [{ ...data, id: `${idPrefix}-${Date.now()}` }, ...prev]);
        }
    };

    // WAREHOUSE HANDLERS
    const handleSaveChemical = (formData: Omit<types.Chemical, 'id' | 'barcode'> | types.Chemical) => {
        if ('id' in formData && formData.id) {
            setChemicals(prev => prev.map(c => c.id === formData.id ? { ...c, ...formData } : c));
        } else {
            const newChemical: types.Chemical = {
                ...formData,
                id: `chem-${Date.now()}`,
                barcode: `CHEM${String(Date.now()).slice(-4)}${formData.sequenceNumber}`,
                usageLog: [{
                    date: new Date().toISOString(),
                    reason: `Nhập kho (Người nhận: ${formData.personReceived})`,
                    person: currentUser?.fullName || 'N/A',
                    quantityChange: formData.quantity,
                    newQuantity: formData.quantity
                }],
            };
            setChemicals(prev => [newChemical, ...prev]);
        }
    };

    const handleAdjustQuantity = (chemicalId: string, change: number, reason: string, person: string, changeType: 'use' | 'add' | 'destroy', recipient?: string) => {
        setChemicals(prev => prev.map(c => {
            if (c.id === chemicalId) {
                const newQuantity = c.quantity + change;
                const newLog: types.UsageLogEntry = {
                    date: new Date().toISOString(),
                    reason, person, recipient,
                    quantityChange: change,
                    newQuantity,
                };
                return { ...c, quantity: newQuantity, usageLog: [newLog, ...(c.usageLog || [])] };
            }
            return c;
        }));
        setIsAdjustModalOpen(false);
    };

    const handleMoveToInstrument = (chemicalId: string, instrumentId: string, quantity: number, openVialExpiration?: string) => {
        const chemical = chemicals.find(c => c.id === chemicalId);
        if (!chemical) return;
    
        const newStock: types.OnInstrumentStock = {
            id: `ois-${Date.now()}`,
            chemicalId,
            chemicalName: chemical.name,
            lotNumber: chemical.lotNumber,
            instrumentId,
            quantity,
            unit: chemical.unit,
            openVialExpiration,
            movedToInstrumentAt: new Date().toISOString(),
        };
        setOnInstrumentStock(prev => [newStock, ...prev]);
        handleAdjustQuantity(chemicalId, -quantity, `Chuyển lên máy ${instruments.find(i => i.id === instrumentId)?.name}`, currentUser?.fullName || 'N/A', 'use');
        setIsMoveToInstrumentModalOpen(false);
    };

    const handleOnInstrumentAdjust = (item: types.OnInstrumentStock, data: OnInstrumentAdjustData) => {
        const { action, quantity, reason } = data;
        const instrumentName = instruments.find(i => i.id === item.instrumentId)?.name || 'N/A';
    
        if (action === 'return') {
            setChemicals(prev => prev.map(c => {
                if (c.id === item.chemicalId) {
                    const newQuantity = c.quantity + quantity;
                    const newLog: types.UsageLogEntry = {
                        date: new Date().toISOString(),
                        reason: `Trả về từ máy ${instrumentName}: ${reason}`,
                        person: currentUser?.fullName || 'N/A',
                        quantityChange: quantity,
                        newQuantity
                    };
                    return { ...c, quantity: newQuantity, usageLog: [newLog, ...(c.usageLog || [])] };
                }
                return c;
            }));
        }
    
        setOnInstrumentStock(prev => prev.map(s => {
            if (s.id === item.id) {
                return { ...s, quantity: s.quantity - quantity };
            }
            return s;
        }).filter(s => s.quantity > 0));
        setIsOnInstrumentAdjustModalOpen(false);
    };

    const handleUpdatePhysicalCount = (chemicalId: string, actualQuantity: number, person: string) => {
        setChemicals(prev => prev.map(c => {
            if (c.id === chemicalId) {
                const change = actualQuantity - c.quantity;
                if (change === 0) return c;
                const newLog: types.UsageLogEntry = {
                    date: new Date().toISOString(),
                    reason: `Kiểm kê (Tồn kho hệ thống: ${c.quantity})`,
                    person,
                    quantityChange: change,
                    newQuantity: actualQuantity,
                };
                return { ...c, quantity: actualQuantity, usageLog: [newLog, ...(c.usageLog || [])] };
            }
            return c;
        }));
    };
    
    // PERSONNEL & ORG HANDLERS
    const handleSavePersonnelDoc = (personnelId: string, docData: PersonnelDocumentFormData) => {
        setPersonnel(prev => prev.map(p => {
            if (p.id === personnelId) {
                const newDoc: types.PersonnelDocument = {
                    ...docData,
                    id: `pdoc-${Date.now()}`,
                    uploadedAt: new Date().toISOString()
                };
                return { ...p, documents: [newDoc, ...(p.documents || [])] };
            }
            return p;
        }));
    };

    const handleDeletePersonnelDoc = (personnelId: string, docId: string) => {
        setPersonnel(prev => prev.map(p => {
            if (p.id === personnelId) {
                return { ...p, documents: (p.documents || []).filter(d => d.id !== docId) };
            }
            return p;
        }));
    };
    
    // EQUIPMENT HANDLERS
    const handleSaveEquipment = (data: Omit<types.LabEquipment, 'id'> | types.LabEquipment) => handleSave(setLabEquipment, data, 'equip');
    const handleAddMaintenanceRecord = (equipmentId: string, record: Omit<types.MaintenanceRecord, 'id'>) => {
        setLabEquipment(prev => prev.map(eq => {
            if (eq.id === equipmentId) {
                const newRecord = { ...record, id: `maint-${Date.now()}`};
                return { ...eq, maintenanceHistory: [newRecord, ...(eq.maintenanceHistory || [])] };
            }
            return eq;
        }));
    };
    
    // NC & PA Handlers
    const handleSaveNonConformity = (data: Omit<types.NonConformity, 'id'> | types.NonConformity) => {
        if ('id' in data && data.id) { // Update
            setNonConformities(prev => prev.map(item => item.id === data.id ? data : item).sort((a,b) => b.date.localeCompare(a.date)));
        } else { // Add
            const monthCounters: { [key: string]: number } = {};
            nonConformities.forEach(nc => {
                const d = new Date(nc.date);
                const key = `${d.getFullYear()}-${d.getMonth()}`;
                monthCounters[key] = (monthCounters[key] || 0) + 1;
            });
            const date = new Date(data.date + 'T00:00:00');
            const key = `${date.getFullYear()}-${date.getMonth()}`;
            const seq = (monthCounters[key] || 0) + 1;
            const numericId = `${date.getFullYear().toString().slice(-2)}${(date.getMonth() + 1).toString().padStart(2, '0')}${seq.toString().padStart(3, '0')}`;
            
            const newNc: types.NonConformity = {
                ...(data as Omit<types.NonConformity, 'id'>),
                id: `nc-${Date.now()}`,
                ncId: `SKPH-${numericId}`,
                hdkpId: data.correctiveAction ? `HDKP-${numericId}` : undefined,
            };
            setNonConformities(prev => [newNc, ...prev].sort((a,b) => b.date.localeCompare(a.date)));
        }
    };
    const handleSavePreventiveAction = (data: Omit<types.PreventiveActionReport, 'id'> | types.PreventiveActionReport) => {
        if ('id' in data && data.id) { // Update
            setPreventiveActionReports(prev => prev.map(item => item.id === data.id ? data : item));
        } else { // Add
             const year = new Date(data.dateCreated).getFullYear().toString().slice(-2);
             const count = preventiveActionReports.filter(r => r.dateCreated.startsWith(String(year))).length + 1;
             const newPa: types.PreventiveActionReport = {
                ...(data as Omit<types.PreventiveActionReport, 'id'>),
                id: `pa-${Date.now()}`,
                reportId: `HDPN-${year}${count.toString().padStart(4, '0')}`,
             };
             setPreventiveActionReports(prev => [newPa, ...prev]);
        }
    };

    // Data Management Handlers
    const handleBackup = () => {
        const backupData = {
            users, chemicals, chemicalMasters, storageLocations, instruments, onInstrumentStock,
            testParameters, controlMaterials, controlLotTargets, iqcResults, personnel, trainees, jobRoles,
            organizationUnits, labEquipment, workItems, nonConformities, leaveRecords, attendanceRecords,
            workSchedule, holidays, dutyAssignments, taskAssignments, personnelAssignmentHistory, kpiScores,
            monitoredAreas, monitoredEquipment, waterSources, accessLogs, areaEnvLogs, equipEnvLogs,
            waterConductivityLogs, incidentReports, trainingCourses, trainingRecords, competencies,
            competencyAssessments, labDocuments, documentCategories, improvementInitiatives, customerFeedback,
            auditRecords, planningSlips, disposalRecords, manualPreparationLogs, maintenanceChecklistLogs,
            equipmentUsageLogs, roomLocations, eqaMaterials, preventiveActionReports
        };
        const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(backupData, null, 2))}`;
        const link = document.createElement("a");
        link.href = jsonString;
        link.download = `qms_backup_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
    };

    const handleRestore = (file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target?.result;
                if (typeof text !== 'string') throw new Error("File could not be read.");
                const data = JSON.parse(text);
                
                // Here you would have more robust validation, but for now we'll just set states
                setUsers(data.users || []); setChemicals(data.chemicals || []); setChemicalMasters(data.chemicalMasters || []);
                setStorageLocations(data.storageLocations || []); setInstruments(data.instruments || []);
                setOnInstrumentStock(data.onInstrumentStock || []); setTestParameters(data.testParameters || []);
                setControlMaterials(data.controlMaterials || []); setControlLotTargets(data.controlLotTargets || []);
                setIqcResults(data.iqcResults || []); setPersonnel(data.personnel || []); setTrainees(data.trainees || []);
                setJobRoles(data.jobRoles || []); setOrganizationUnits(data.organizationUnits || []);
                setLabEquipment(data.labEquipment || []); setWorkItems(data.workItems || []);
                setNonConformities(data.nonConformities || []); setLeaveRecords(data.leaveRecords || []);
                setAttendanceRecords(data.attendanceRecords || []); setWorkSchedule(data.workSchedule || {startTime: '07:30', endTime: '16:30'});
                setHolidays(data.holidays || []); setDutyAssignments(data.dutyAssignments || []);
                setTaskAssignments(data.taskAssignments || []); setPersonnelAssignmentHistory(data.personnelAssignmentHistory || []);
                setKpiScores(data.kpiScores || []); setMonitoredAreas(data.monitoredAreas || []);
                setMonitoredEquipment(data.monitoredEquipment || []); setWaterSources(data.waterSources || []);
                setAccessLogs(data.accessLogs || []); setAreaEnvLogs(data.areaEnvLogs || []);
                setEquipEnvLogs(data.equipEnvLogs || []); setWaterConductivityLogs(data.waterConductivityLogs || []);
                setIncidentReports(data.incidentReports || []); setTrainingCourses(data.trainingCourses || []);
                setTrainingRecords(data.trainingRecords || []); setCompetencies(data.competencies || []);
                setCompetencyAssessments(data.competencyAssessments || []); setLabDocuments(data.labDocuments || []);
                setDocumentCategories(data.documentCategories || []); setImprovementInitiatives(data.improvementInitiatives || []);
                setCustomerFeedback(data.customerFeedback || []); setAuditRecords(data.auditRecords || []);
                setPlanningSlips(data.planningSlips || []); setDisposalRecords(data.disposalRecords || []);
                setManualPreparationLogs(data.manualPreparationLogs || []); setMaintenanceChecklistLogs(data.maintenanceChecklistLogs || []);
                setEquipmentUsageLogs(data.equipmentUsageLogs || []); setRoomLocations(data.roomLocations || []);
                setEQAMaterials(data.eqaMaterials || []); setPreventiveActionReports(data.preventiveActionReports || []);

                alert("Phục hồi dữ liệu thành công!");
            } catch (err) {
                console.error("Lỗi khi phục hồi dữ liệu:", err);
                alert("Tệp sao lưu không hợp lệ hoặc đã bị hỏng.");
            }
        };
        reader.readAsText(file);
    };

    const handleDownloadTemplate = () => {
        const headers = ["name", "casNumber", "specification", "defaultSupplier", "defaultUnit", "defaultLocation", "minimumLevel"];
        const ws = utils.json_to_sheet([{}], { header: headers });
        const wb = utils.book_new();
        utils.book_append_sheet(wb, ws, "ChemicalMasterTemplate");
        writeFile(wb, "danh_muc_hoa_chat_mau.xlsx");
    };

    const handleImportChemicalMasters = (file: File, mode: 'replace' | 'append') => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = e.target?.result;
                const workbook = read(data, { type: 'binary' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const json: any[] = utils.sheet_to_json(worksheet);

                const newMasters: types.ChemicalMaster[] = json.map((row: any, index: number) => {
                    if (!row.name || !row.casNumber) {
                        throw new Error(`Dòng ${index + 2} thiếu Tên hoặc Số CAS.`);
                    }
                    return {
                        id: `cmaster-import-${Date.now()}-${index}`,
                        name: String(row.name),
                        casNumber: String(row.casNumber),
                        specification: String(row.specification || ''),
                        defaultSupplier: String(row.defaultSupplier || ''),
                        defaultUnit: String(row.defaultUnit || 'ml'),
                        defaultLocation: String(row.defaultLocation || ''),
                        minimumLevel: Number(row.minimumLevel || 0),
                    };
                });
                
                if (mode === 'replace') {
                    setChemicalMasters(newMasters);
                    alert(`Đã nhập và thay thế thành công ${newMasters.length} hóa chất.`);
                } else { // append
                    const existingCasNumbers = new Set(chemicalMasters.map(p => p.casNumber));
                    const trulyNew = newMasters.filter(nm => !existingCasNumbers.has(nm.casNumber));
                    setChemicalMasters(prev => [...prev, ...trulyNew]);
                    alert(`Đã thêm thành công ${trulyNew.length} hóa chất mới. ${newMasters.length - trulyNew.length} hóa chất đã tồn tại đã được bỏ qua.`);
                }

            } catch (error) {
                console.error("Lỗi khi nhập file:", error);
                alert(`Lỗi khi xử lý file Excel: ${error instanceof Error ? error.message : String(error)}`);
            }
        };
        reader.readAsBinaryString(file);
    };

    // Global Search Handlers
    const handleSearch = (query: string) => {
        setSearchQuery(query);
        if (!query.trim()) {
            setSearchResults([]);
            return;
        }

        const lowerQuery = query.toLowerCase();
        let results: types.SearchResult[] = [];

        // Search Chemicals
        results = results.concat(
            chemicals.filter(c => c.name.toLowerCase().includes(lowerQuery) || c.casNumber.toLowerCase().includes(lowerQuery) || c.lotNumber.toLowerCase().includes(lowerQuery) || c.barcode.toLowerCase().includes(lowerQuery))
            .map(c => ({ id: c.id, type: 'chemical', title: c.name, details: `Lô: ${c.lotNumber} | CAS: ${c.casNumber}`, category: 'Kho' }))
        );

        // Search Equipment
        results = results.concat(
            labEquipment.filter(e => e.name.toLowerCase().includes(lowerQuery) || e.assetId.toLowerCase().includes(lowerQuery) || e.serialNumber.toLowerCase().includes(lowerQuery))
            .map(e => ({ id: e.id, type: 'equipment', title: e.name, details: `Mã TS: ${e.assetId} | Vị trí: ${e.location}`, category: 'Thiết bị' }))
        );
        
        // Search Personnel
        results = results.concat(
            personnel.filter(p => p.fullName.toLowerCase().includes(lowerQuery) || p.employeeId.toLowerCase().includes(lowerQuery))
            .map(p => ({ id: p.id, type: 'personnel', title: p.fullName, details: `Mã NV: ${p.employeeId}`, category: 'Nhân sự' }))
        );
        
        // Search Documents
        results = results.concat(
            labDocuments.filter(d => d.title.toLowerCase().includes(lowerQuery))
            .map(d => ({ id: d.id, type: 'document', title: d.title, details: `Danh mục: ${d.category} | Phiên bản: ${d.version}`, category: 'Tài liệu' }))
        );
        
        // Search Non-Conformities
        results = results.concat(
            nonConformities.filter(nc => nc.description.toLowerCase().includes(lowerQuery) || nc.ncId.toLowerCase().includes(lowerQuery))
            .map(nc => ({ id: nc.id, type: 'nonconformity', title: nc.ncId, details: nc.description, category: 'Sự không phù hợp' }))
        );

        setSearchResults(results);
    };

    const handleSearchResultClick = (result: types.SearchResult) => {
        setFocusedItemId(result.id);
        setSearchQuery('');
        setSearchResults([]);

        switch (result.type) {
            case 'chemical':
                setActiveModule('qms2429');
                setActivePage('warehouse');
                break;
            case 'equipment':
                setActiveModule('qms2429');
                setActivePage('equipment');
                break;
            case 'personnel':
                 setActiveModule('qms2429');
                 setActivePage('personnel');
                break;
            case 'document':
                 setActiveModule('qms2429');
                 setActivePage('documents');
                break;
            case 'nonconformity':
                 setActiveModule('qms2429');
                 setActivePage('nonconformity');
                break;
        }
    };


    // ======== RENDER LOGIC ========
    if (!currentUser) {
        return <LoginPage onLogin={handleLogin} />;
    }

    const navigationItems = [
        { id: 'alerts', label: 'Cảnh báo', icon: <BellIcon /> },
        { id: 'warehouse', label: 'Quản lý Kho', icon: <ArchiveBoxIcon /> },
        { id: 'quality', label: 'Quản lý Chất lượng', icon: <ChartBarSquareIcon /> },
        { id: 'nonconformity', label: 'Sự không phù hợp', icon: <ExclamationTriangleIcon /> },
        { id: 'equipment', label: 'Thiết bị', icon: <ToolIcon /> },
        { id: 'personnel', label: 'Nhân sự', icon: <AcademicCapIcon /> },
        { id: 'documents', label: 'Tài liệu', icon: <BookOpenIcon /> },
        { id: 'safety', label: 'An toàn & Môi trường', icon: <ShieldCheckIcon /> },
        { id: 'customer', label: 'Dịch vụ Khách hàng', icon: <HeadphonesIcon /> },
        { id: 'improvement', label: 'Cải tiến', icon: <RecycleIcon /> },
        { id: 'organization', label: 'Tổ chức', icon: <BuildingOfficeIcon /> },
        { id: 'audit', label: 'Đánh giá', icon: <StarIcon /> },
        { id: 'info', label: 'Quản lý Thông tin', icon: <InformationIcon /> },
        { id: 'dataManagement', label: 'Quản lý Dữ liệu', icon: <DatabaseIcon /> },
        { id: 'settings', label: 'Cài đặt', icon: <SettingsIcon /> },
    ];

    const renderPage = () => {
        switch(activePage) {
            case 'alerts': return <AlertsPage chemicals={chemicals} labEquipment={labEquipment} iqcResults={iqcResults} controlLotTargets={controlLotTargets} testParameters={testParameters} controlMaterials={controlMaterials} monitoredAreas={monitoredAreas} monitoredEquipment={monitoredEquipment} waterSources={waterSources} areaEnvLogs={areaEnvLogs} equipmentTempLogs={equipEnvLogs} waterConductivityLogs={waterConductivityLogs} incidentReports={incidentReports} />;
            case 'warehouse': return <WarehouseManagementPage 
                chemicals={chemicals} chemicalMasters={chemicalMasters} storageLocations={storageLocations} instruments={instruments} 
                planningSlips={planningSlips} disposalRecords={disposalRecords} onInstrumentStock={onInstrumentStock} manualLogEntries={manualPreparationLogs} 
                currentUser={currentUser} 
                focusedItemId={focusedItemId}
                onEditChemical={(c) => { setEditingChemical(c); setIsChemicalFormOpen(true); }}
                onDeleteChemical={(id) => handleDelete(setChemicals, id, 'Xóa Hóa chất', 'Bạn có chắc muốn xóa hóa chất này?')}
                onGetSafetyInfo={async (c) => { setIsSafetyInfoOpen(true); setChemicalForSafety(c); setIsSafetyInfoLoading(true); const info = await getSafetyInfo(c.name, c.casNumber); setSafetyInfo(info); setIsSafetyInfoLoading(false); }}
                onOpenAdjustModal={(c) => { setChemicalToAdjust(c); setIsAdjustModalOpen(true); }}
                onOpenUsageLog={(c) => { setChemicalForLog(c); setIsUsageLogOpen(true); }}
                onOpenBarcodeModal={(c) => { setChemicalForBarcode(c); setIsBarcodeModalOpen(true); }}
                onOpenSafetyDoc={(c) => { setChemicalForSafetyDoc(c); setIsSafetyDocOpen(true); }}
                onAddLot={(master) => { setEditingChemical({ ...master, id: '', barcode: '', lotNumber: '', quantity: 0, unit: master.defaultUnit, dateReceived: new Date().toISOString().split('T')[0], personReceived: currentUser.fullName, deliveryPerson: '', sequenceNumber: '', expirationDate: '', storageLocation: master.defaultLocation, initialQuantity: 0, qualityAssessment: '' }); setIsChemicalFormOpen(true); }}
                onRecordUsage={(c) => { setChemicalToAdjust(c); setIsAdjustModalOpen(true); }}
                onOpenMoveToInstrumentModal={(c) => { setChemicalToMove(c); setIsMoveToInstrumentModalOpen(true); }}
                onInstrumentAdjust={(item, action) => { setStockToAdjust({item, action}); setIsOnInstrumentAdjustModalOpen(true); }}
                onSavePlanningSlip={(items) => { const newSlip = { id: `PDT-${Date.now()}`, createdAt: new Date().toISOString(), createdBy: currentUser.fullName, items }; setPlanningSlips(prev => [newSlip, ...prev]); return newSlip; }}
                onViewPlanningSlip={(s) => { setSlipToView(s); setIsPlanningSlipModalOpen(true); }}
                onUpdatePhysicalCount={handleUpdatePhysicalCount}
                onAddDisposalRecord={(r) => handleSave(setDisposalRecords, r, 'disp')}
                onUpdateDisposalRecord={(r) => handleSave(setDisposalRecords, r, 'disp')}
                onDeleteDisposalRecord={(id) => handleDelete(setDisposalRecords, id, 'Xóa Biên bản', 'Bạn có chắc muốn xóa biên bản hủy này?')}
                onPrintDisposalRecord={(r) => setDisposalToPrint(r)}
                onExportDisposalToDoc={() => alert("Chức năng đang phát triển")}
                onExportDisposalToExcel={() => alert("Chức năng đang phát triển")}
                onImportStockIn={() => alert("Chức năng đang phát triển")}
                onDownloadStockInTemplate={() => alert("Chức năng đang phát triển")}
                monitoredAreas={monitoredAreas} monitoredEquipment={monitoredEquipment} areaEnvLogs={areaEnvLogs} 
                equipmentTempLogs={equipEnvLogs} waterSources={waterSources} waterConductivityLogs={waterConductivityLogs}
             />;
            case 'quality': return <QualityManagementPage 
                chemicals={chemicals} manualLogEntries={manualPreparationLogs} chemicalMasters={chemicalMasters} 
                currentUser={currentUser} onAddManualEntry={(log) => handleSave(setManualPreparationLogs, log, 'man-prep')} 
                testParameters={testParameters} controlMaterials={controlMaterials} controlLotTargets={controlLotTargets} 
                iqcResults={iqcResults} onAddIQCResult={() => { setSettingsInitialData(null); setActiveSettingsModal('iqcResult'); setIsSettingsModalOpen(true); }} 
            />;
             case 'nonconformity': return <NonConformityPage 
                nonConformities={nonConformities} preventiveActionReports={preventiveActionReports} currentUser={currentUser}
                focusedItemId={focusedItemId}
                onAddOrUpdateNC={(item) => { setEditingNC(item); setIsNonConformityFormOpen(true); }}
                onDeleteNC={(id) => handleDelete(setNonConformities, id, 'Xóa SKPH', 'Bạn có chắc muốn xóa phiếu SKPH này?')}
                onAddOrUpdatePreventiveAction={(item) => { setEditingPA(item); setIsPreventiveActionFormOpen(true); }}
                onDeletePreventiveAction={(id) => handleDelete(setPreventiveActionReports, id, 'Xóa HĐPN', 'Bạn có chắc muốn xóa phiếu HĐPN này?')}
                onExportToDoc={() => alert("Chức năng đang phát triển")} onExportToExcel={() => alert("Chức năng đang phát triển")}
                onExportCorrectiveActionToDoc={() => alert("Chức năng đang phát triển")} onExportCorrectiveActionLogToDoc={() => alert("Chức năng đang phát triển")}
                onExportCorrectiveActionLogToExcel={() => alert("Chức năng đang phát triển")} onExportPreventiveActionToDoc={() => alert("Chức năng đang phát triển")}
            />;
            case 'equipment': return <EquipmentPage 
                equipment={labEquipment} personnel={personnel} equipmentUsageLogs={equipmentUsageLogs} workItems={workItems} 
                currentUser={currentUser} maintenanceChecklistLogs={maintenanceChecklistLogs} accessLogs={accessLogs}
                focusedItemId={focusedItemId}
                onAdd={() => { setEditingEquipment(null); setIsEquipmentFormOpen(true); }}
                onEdit={(eq) => { setEditingEquipment(eq); setIsEquipmentFormOpen(true); }}
                onDelete={(id) => handleDelete(setLabEquipment, id, 'Xóa Thiết bị', 'Bạn có chắc muốn xóa thiết bị này?')}
                onViewDetails={(eq) => setEquipmentForDetail(eq)}
                onOpenAddUsageLog={() => setIsEquipmentUsageLogFormOpen(true)}
                onUpdateUsageLog={(log) => handleSave(setEquipmentUsageLogs, log, 'log')}
                onUpdateAssociatedWorkItems={(eqId, itemIds) => setLabEquipment(prev => prev.map(eq => eq.id === eqId ? {...eq, associatedWorkItemIds: itemIds} : eq))}
                onAddOrUpdateWorkItem={(item) => { handleSave(setWorkItems, item, 'wi'); setIsSettingsModalOpen(false); }}
                onDeleteWorkItem={(id) => { handleDelete(setWorkItems, id, 'Xóa Công việc', 'Bạn có chắc muốn xóa công việc này?'); setIsSettingsModalOpen(false); }}
                onCreateNonConformity={(log) => {
                    const eqName = labEquipment.find(e => e.id === log.equipmentId)?.name || '';
                    const newNC = {
                        date: new Date().toISOString().split('T')[0],
                        description: `Sự cố trên thiết bị ${eqName}: ${log.incidents}`,
                        correctiveAction: log.correctiveAction,
                        reportedBy: users.find(u=>u.id === log.userId)?.fullName || log.userId
                    };
                    setEditingNC(newNC as any); // open modal with pre-filled data
                    setIsNonConformityFormOpen(true);
                }}
                onExportToDoc={() => alert("Chức năng đang phát triển")} onExportUsageLogToDoc={() => alert("Chức năng đang phát triển")} onExportMaintenanceSheetToDoc={() => alert("Chức năng đang phát triển")}
            />;
            case 'personnel': return <PersonnelPage 
                personnel={personnel} jobRoles={jobRoles} trainees={trainees} trainingCourses={trainingCourses}
                trainingRecords={trainingRecords} competencies={competencies} competencyAssessments={competencyAssessments.filter(ca => ca.personnelId === personnelForDetail?.id)}
                focusedItemId={focusedItemId}
                onAdd={() => { setEditingPersonnel(null); setIsPersonnelFormOpen(true); }}
                onEdit={(p) => { setEditingPersonnel(p); setIsPersonnelFormOpen(true); }}
                onDelete={(id) => handleDelete(setPersonnel, id, 'Xóa Nhân sự', 'Bạn có chắc muốn xóa hồ sơ nhân sự này?')}
                onViewDetails={(p) => setPersonnelForDetail(p)}
                onAddTrainee={() => { setEditingTrainee(null); setIsTraineeFormOpen(true); }}
                onEditTrainee={(t) => { setEditingTrainee(t); setIsTraineeFormOpen(true); }}
                onDeleteTrainee={(id) => handleDelete(setTrainees, id, 'Xóa Học viên', 'Bạn có chắc muốn xóa hồ sơ học viên này?')}
                onAddTrainingCourse={() => { setEditingTrainingCourse(null); setIsTrainingCourseFormOpen(true); }}
                onEditTrainingCourse={(c) => { setEditingTrainingCourse(c); setIsTrainingCourseFormOpen(true); }}
                onDeleteTrainingCourse={(id) => handleDelete(setTrainingCourses, id, 'Xóa Khóa học', 'Bạn có chắc muốn xóa khóa học này?')}
                onAddCompetency={() => { setEditingCompetency(null); setIsCompetencyFormOpen(true); }}
                onEditCompetency={(c) => { setEditingCompetency(c); setIsCompetencyFormOpen(true); }}
                onDeleteCompetency={(id) => handleDelete(setCompetencies, id, 'Xóa Năng lực', 'Bạn có chắc muốn xóa năng lực này?')}
            />;
            case 'documents': return <DocumentsPage 
                documents={labDocuments}
                focusedItemId={focusedItemId}
                onAdd={() => { setEditingDocument(null); setIsDocumentFormOpen(true); }}
                onEdit={(doc) => { setEditingDocument(doc); setIsDocumentFormOpen(true); }}
                onDelete={(id) => handleDelete(setLabDocuments, id, 'Xóa Tài liệu', 'Bạn có chắc muốn xóa tài liệu này?')}
                onViewDocument={(doc) => setDocumentToView(doc)}
            />;
            case 'safety': return <EnvironmentSafetyPage 
                {...{monitoredAreas, monitoredEquipment, waterSources, accessLogs, areaEnvLogs, equipEnvLogs, waterConductivityLogs, incidentReports, currentUser}}
                onAddAccessLog={(log) => handleSave(setAccessLogs, log, 'access')}
                onUpdateAccessLog={(log) => handleSave(setAccessLogs, log, 'access')}
                onAddAreaEnvLog={(log) => handleSave(setAreaEnvLogs, log, 'areaenv')}
                onAddEquipEnvLog={(log) => handleSave(setEquipEnvLogs, log, 'equipenv')}
                onAddWaterConductivityLog={(log) => handleSave(setWaterConductivityLogs, log, 'water')}
                onAddOrUpdateIncidentReport={(r) => handleSave(setIncidentReports, r, 'incident')}
                onDeleteIncidentReport={(id) => handleDelete(setIncidentReports, id, 'Xóa Báo cáo', 'Bạn có chắc muốn xóa báo cáo sự cố này?')}
                onExportIncidentToDoc={() => alert("Chức năng đang phát triển")}
                onAddItem={(type, item) => { if(type === 'area') handleSave(setMonitoredAreas, item, 'area'); else if(type==='equipment') handleSave(setMonitoredEquipment, item, 'equip'); else handleSave(setWaterSources, item, 'water'); }}
                onUpdateItem={(type, item) => { if(type === 'area') handleSave(setMonitoredAreas, item, 'area'); else if(type==='equipment') handleSave(setMonitoredEquipment, item, 'equip'); else handleSave(setWaterSources, item, 'water'); }}
                onDeleteItem={(type, id) => { if(type === 'area') handleDelete(setMonitoredAreas, id, 'Xóa Khu vực', 'Xóa?'); else if(type==='equipment') handleDelete(setMonitoredEquipment, id, 'Xóa Thiết bị', 'Xóa?'); else handleDelete(setWaterSources, id, 'Xóa Nguồn nước', 'Xóa?'); }}
            />;
            case 'customer': return <CustomerServicePage 
                feedbackItems={customerFeedback}
                onAddOrUpdate={(item) => handleSave(setCustomerFeedback, item || {date: new Date().toISOString().split('T')[0], personInCharge: currentUser.fullName, status: 'new' }, 'fb')}
                onDelete={(id) => handleDelete(setCustomerFeedback, id, 'Xóa Phản hồi', 'Bạn có chắc muốn xóa mục này?')}
            />;
             case 'improvement': return <ContinuousImprovementPage 
                initiatives={improvementInitiatives}
                onAddOrUpdate={(item) => handleSave(setImprovementInitiatives, item || {proposedDate: new Date().toISOString().split('T')[0], proposedBy: currentUser.fullName, status: 'proposed'}, 'imp')}
                onDelete={(id) => handleDelete(setImprovementInitiatives, id, 'Xóa Sáng kiến', 'Bạn có chắc muốn xóa mục này?')}
            />;
            case 'organization': return <OrganizationPage 
                {...{organizationUnits, jobRoles, personnel, personnelAssignmentHistory, leaveRecords, attendanceRecords, dutyAssignments, taskAssignments, kpiScores, workSchedule, holidays}}
                onAddUnit={(parentId) => { setOrgUnitParentId(parentId); setEditingOrgUnit(null); setIsOrgUnitFormOpen(true); }}
                onEditUnit={(unit) => { setEditingOrgUnit(unit); setIsOrgUnitFormOpen(true); }}
                onDeleteUnit={(id) => handleDelete(setOrganizationUnits, id, 'Xóa Đơn vị', 'Xóa?')}
                onAddRole={() => { setEditingJobRole(null); setIsJobRoleFormOpen(true); }}
                onEditRole={(role) => { setEditingJobRole(role); setIsJobRoleFormOpen(true); }}
                onDeleteRole={(id) => handleDelete(setJobRoles, id, 'Xóa Chức danh', 'Xóa?')}
                onAddLeave={() => setIsLeaveFormOpen(true)}
                onAddOrUpdateAttendance={(pId, date, record) => setAttendanceContext({personnelId: pId, date, record})}
                onAddDutyAssignment={(a) => handleSave(setDutyAssignments, a, 'duty')}
                onDeleteDutyAssignment={(id) => setDutyAssignments(prev => prev.filter(d => d.id !== id))}
                onAddTaskAssignment={(a) => handleSave(setTaskAssignments, a, 'task')}
                onOpenMovePersonnel={() => setIsMovePersonnelOpen(true)}
                onAddOrUpdateKpiScore={(pId, date, bonus, penalty, notes) => handleSave(setKpiScores, { id: `${pId}-${date}`, personnelId: pId, date, bonusPoints: bonus, penaltyPoints: penalty, notes }, 'kpi')}
            />;
            case 'settings': return <SettingsPage 
                {...{testParameters, chemicalMasters, instruments, roomLocations, storageLocations, controlMaterials, eqaMaterials, documentCategories, users, currentUser, workSchedule, holidays}}
                onOpenModal={(type, item) => { setSettingsInitialData(item); setActiveSettingsModal(type); setIsSettingsModalOpen(true); }}
                onDeleteItem={(type, id) => {
                    if(type==='testParameter') handleDelete(setTestParameters, id, 'Xóa Xét nghiệm', 'Xóa?');
                    if(type==='chemicalMaster') handleDelete(setChemicalMasters, id, 'Xóa Hóa chất', 'Xóa?');
                    if(type==='instrument') handleDelete(setInstruments, id, 'Xóa Máy XN', 'Xóa?');
                    if(type==='roomLocation') handleDelete(setRoomLocations, id, 'Xóa Vị trí', 'Xóa?');
                    if(type==='storage') handleDelete(setStorageLocations, id, 'Xóa Kho/Tủ', 'Xóa?');
                    if(type==='controlMaterial') handleDelete(setControlMaterials, id, 'Xóa Vật liệu IQC', 'Xóa?');
                    if(type==='eqaMaterial') handleDelete(setEQAMaterials, id, 'Xóa Vật liệu EQA', 'Xóa?');
                    if(type==='documentCategory') handleDelete(setDocumentCategories, id, 'Xóa Danh mục', 'Xóa?');
                }}
                onImportChemicalMasters={handleImportChemicalMasters}
                onDownloadChemicalTemplate={handleDownloadTemplate}
                onOpenUserFormModal={(user) => { setEditingUser(user); setIsUserFormOpen(true); }}
                onDeleteUser={(id) => handleDelete(setUsers, id, 'Xóa Người dùng', 'Xóa?')}
                onUpdateWorkSchedule={setWorkSchedule}
                onAddHoliday={(h) => handleSave(setHolidays, h, 'holi')}
                onDeleteHoliday={(id) => setHolidays(prev => prev.filter(h => h.id !== id))}
            />;
            case 'dataManagement': return <DataManagementPage onBackup={handleBackup} onRestore={handleRestore} />;
            case 'audit': return <AuditPage />;
            case 'info': return <InformationManagementPage />;
            default: return <div className="text-center p-8">Trang không tồn tại hoặc đang được phát triển.</div>
        }
    };
    
    return (
        <>
            <div className="flex h-screen bg-slate-100 text-slate-800">
                {/* Primary Sidebar (Tier 1) */}
                <nav className={`bg-slate-800 flex flex-col shrink-0 transition-all duration-300 ${isSidebarCollapsed ? 'w-20' : 'w-64'}`}>
                    <div className="flex items-center justify-center h-20 border-b border-slate-700">
                        <SparklesIcon className="w-8 h-8 text-white" />
                        {!isSidebarCollapsed && <h1 className="text-xl font-bold text-white ml-2">QMS</h1>}
                    </div>
                    <ul className="flex-grow py-2">
                        <PrimaryNavItem
                            icon={<ClipboardDocumentCheckIcon className="w-6 h-6" />}
                            label="QMS 2429"
                            isActive={activeModule === 'qms2429'}
                            isCollapsed={isSidebarCollapsed}
                            onClick={() => {
                                setActiveModule('qms2429');
                                if (!navigationItems.some(item => item.id === activePage)) {
                                    setActivePage('alerts');
                                }
                            }}
                        />
                        <PrimaryNavItem
                            icon={<GlobeAltIcon className="w-6 h-6" />}
                            label="QMS ISO 15189"
                            isActive={activeModule === 'qmsISO'}
                            isCollapsed={isSidebarCollapsed}
                            onClick={() => setActiveModule('qmsISO')}
                        />
                    </ul>
                    <div className="mt-auto">
                        <button
                            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                            className="flex items-center justify-center w-full p-4 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                            title={isSidebarCollapsed ? 'Mở rộng' : 'Thu gọn'}
                        >
                            <ChevronDoubleLeftIcon className={`w-6 h-6 transition-transform duration-300 ${isSidebarCollapsed ? 'rotate-180' : ''}`} />
                        </button>
                    </div>
                    <div className="p-4 border-t border-slate-700">
                        <div className={`flex items-center p-2 rounded-lg transition-all duration-300 ${isSidebarCollapsed ? 'justify-center bg-slate-800' : 'bg-slate-700'}`}>
                            <UserIcon className="w-8 h-8 text-slate-300 bg-slate-600 rounded-full p-1" />
                            {!isSidebarCollapsed && (
                                <div className="ml-3">
                                    <p className="text-sm font-semibold text-white whitespace-nowrap">{currentUser.fullName}</p>
                                    <p className="text-xs text-slate-400">{currentUser.role}</p>
                                </div>
                            )}
                        </div>
                         <button onClick={handleLogout} className={`w-full mt-3 flex items-center p-2 text-sm text-slate-300 rounded-lg hover:bg-red-800 hover:text-white transition-colors ${isSidebarCollapsed ? 'justify-center' : 'justify-center'}`}>
                            <LogoutIcon className={`w-5 h-5 ${!isSidebarCollapsed ? 'mr-2' : ''}`} />
                            {!isSidebarCollapsed && 'Đăng xuất'}
                        </button>
                    </div>
                </nav>

                {/* Secondary Sidebar (Tier 2) - Conditional */}
                {activeModule === 'qms2429' && !isSidebarCollapsed && (
                    <nav className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0">
                        <div className="flex items-center h-20 px-6">
                            <h2 className="text-lg font-bold text-slate-700">Chức năng 2429</h2>
                        </div>
                        <ul className="flex-grow overflow-y-auto">
                            {navigationItems.map(item => (
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
                )}

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Header */}
                    <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-end px-6 shrink-0">
                        <GlobalSearch 
                            query={searchQuery}
                            onQueryChange={handleSearch}
                            results={searchResults}
                            onResultClick={handleSearchResultClick}
                            isLoading={isSearching}
                        />
                    </header>
                    
                    {/* Main Content */}
                    <main className="flex-1 p-6 overflow-y-auto">
                        {activeModule === 'qms2429' && renderPage()}
                        {activeModule === 'qmsISO' && <QmsIsoPage />}
                    </main>
                </div>

            </div>
            
            {/* RENDER ALL MODALS HERE */}
            <ChemicalFormModal isOpen={isChemicalFormOpen} onClose={() => setIsChemicalFormOpen(false)} onSubmit={handleSaveChemical} initialData={editingChemical} storageLocations={storageLocations} />
            <AdjustQuantityModal isOpen={isAdjustModalOpen} onClose={() => setIsAdjustModalOpen(false)} onSubmit={handleAdjustQuantity} chemical={chemicalToAdjust} currentUser={currentUser} storageLocations={storageLocations} instruments={instruments} />
            <UsageLogModal isOpen={isUsageLogOpen} onClose={() => setIsUsageLogOpen(false)} chemical={chemicalForLog} />
            <SafetyInfoModal isOpen={isSafetyInfoOpen} onClose={() => setIsSafetyInfoOpen(false)} chemical={chemicalForSafety} safetyInfo={safetyInfo} isLoading={isSafetyInfoLoading} />
            <BarcodeModal isOpen={isBarcodeModalOpen} onClose={() => setIsBarcodeModalOpen(false)} chemical={chemicalForBarcode} />
            <SafetyDocumentModal isOpen={isSafetyDocOpen} onClose={() => setIsSafetyDocOpen(false)} chemical={chemicalForSafetyDoc} />
            <MoveToInstrumentModal isOpen={isMoveToInstrumentModalOpen} onClose={() => setIsMoveToInstrumentModalOpen(false)} onSubmit={(instId, qty, exp) => handleMoveToInstrument(chemicalToMove!.id, instId, qty, exp)} chemical={chemicalToMove} instruments={instruments} />
            <OnInstrumentAdjustModal isOpen={isOnInstrumentAdjustModalOpen} onClose={() => setIsOnInstrumentAdjustModalOpen(false)} onSubmit={(data) => handleOnInstrumentAdjust(stockToAdjust!.item, data)} stockItem={stockToAdjust?.item || null} action={stockToAdjust?.action || 'use'} currentUser={currentUser} />
            <PlanningSlipModal slip={slipToView} onClose={() => setSlipToView(null)} />
            <DisposalFormModal isOpen={isDisposalFormOpen} onClose={() => setIsDisposalFormOpen(false)} onSubmit={(r) => handleSave(setDisposalRecords, r, 'disp')} initialData={editingDisposalRecord} currentUserFullName={currentUser.fullName}/>
            {disposalToPrint && <DisposalPrintView record={disposalToPrint} />}
            <ConfirmationModal isOpen={isConfirmModalOpen} onClose={() => setIsConfirmModalOpen(false)} onConfirm={confirmAction?.onConfirm || (() => {})} title={confirmAction?.title || ''} message={confirmAction?.message || ''} />
            
            {/* Personnel & Org Modals */}
             <PersonnelFormModal isOpen={isPersonnelFormOpen} onClose={() => setIsPersonnelFormOpen(false)} onSubmit={(p) => handleSave(setPersonnel, p, 'p')} initialData={editingPersonnel} jobRoles={jobRoles} organizationUnits={organizationUnits} />
            <PersonnelDetailModal 
                isOpen={!!personnelForDetail} onClose={() => setPersonnelForDetail(null)} personnel={personnelForDetail} 
                jobRole={jobRoles.find(r => r.id === personnelForDetail?.jobRoleId)} 
                organizationUnit={organizationUnits.find(u => u.id === personnelForDetail?.organizationUnitId)}
                onAddDocument={() => setIsPersonnelDocFormOpen(true)}
                onViewDocument={(doc) => setDocumentToView(doc)}
                onDeleteDocument={(docId) => handleDeletePersonnelDoc(personnelForDetail!.id, docId)}
                trainingRecords={trainingRecords.filter(r => r.personnelId === personnelForDetail?.id)}
                trainingCourses={trainingCourses} competencies={competencies}
                competencyAssessments={competencyAssessments.filter(ca => ca.personnelId === personnelForDetail?.id)}
                allPersonnel={personnel}
                onAddTrainingRecord={() => setIsTrainingRecordFormOpen(true)}
                onDeleteTrainingRecord={(id) => handleDelete(setTrainingRecords, id, "Xóa Ghi nhận", "Xóa?")}
                onAddCompetencyAssessment={() => setIsCompetencyAssessmentFormOpen(true)}
                onDeleteCompetencyAssessment={(id) => handleDelete(setCompetencyAssessments, id, "Xóa Đánh giá", "Xóa?")}
            />
            <PersonnelDocumentFormModal isOpen={isPersonnelDocFormOpen} onClose={() => setIsPersonnelDocFormOpen(false)} onSubmit={(data) => handleSavePersonnelDoc(personnelForDetail!.id, data)} />
            
            {/* Equipment Modals */}
            <EquipmentFormModal isOpen={isEquipmentFormOpen} onClose={() => setIsEquipmentFormOpen(false)} onSubmit={handleSaveEquipment} initialData={editingEquipment} roomLocations={roomLocations}/>
            <EquipmentDetailModal 
                isOpen={!!equipmentForDetail} onClose={() => setEquipmentForDetail(null)} equipment={equipmentForDetail}
                onAddMaintenance={() => setIsMaintenanceFormOpen(true)} onDeleteMaintenance={(id) => {}}
                onAddCalibration={() => setIsCalibrationFormOpen(true)} onDeleteCalibration={(id) => {}}
                onAddDocument={() => setIsEquipmentDocFormOpen(true)} onDeleteDocument={(id) => {}}
                onViewDocument={(doc) => setDocumentToView(doc)}
            />
            
            {/* Document Modals */}
            <DocumentViewerModal isOpen={!!documentToView} onClose={() => setDocumentToView(null)} document={documentToView} />
            <DocumentFormModal isOpen={isDocumentFormOpen} onClose={() => setIsDocumentFormOpen(false)} onSubmit={(d) => handleSave(setLabDocuments, d, 'doc')} initialData={editingDocument} documentCategories={documentCategories} />

            {/* NC & PA Modals */}
            <NonConformityFormModal isOpen={isNonConformityFormOpen} onClose={() => setIsNonConformityFormOpen(false)} onSubmit={handleSaveNonConformity} initialData={editingNC} currentUser={currentUser} />
            <PreventiveActionFormModal isOpen={isPreventiveActionFormOpen} onClose={() => setIsPreventiveActionFormOpen(false)} onSubmit={handleSavePreventiveAction} initialData={editingPA} currentUser={currentUser} />
            
            {/* User Modal */}
            <UserFormModal isOpen={isUserFormOpen} onClose={() => setIsUserFormOpen(false)} onSubmit={(u) => handleSave(setUsers, u, 'user')} initialData={editingUser} currentUser={currentUser} />

             {/* --- SETTINGS MODALS --- */}
            <ChemicalMasterImportModal
                isOpen={isChemicalMasterImportOpen}
                onClose={() => setIsChemicalMasterImportOpen(false)}
                onImport={handleImportChemicalMasters}
                onDownloadTemplate={handleDownloadTemplate}
            />
            <TestParameterFormModal 
                isOpen={isSettingsModalOpen && activeSettingsModal === 'testParameter'}
                onClose={() => setIsSettingsModalOpen(false)}
                onSubmit={(data) => { handleSave(setTestParameters, data, 'tp'); setIsSettingsModalOpen(false); }}
                initialData={settingsInitialData}
            />
            <ChemicalMasterFormModal 
                isOpen={isSettingsModalOpen && activeSettingsModal === 'chemicalMaster'}
                onClose={() => setIsSettingsModalOpen(false)}
                onSubmit={(data) => { handleSave(setChemicalMasters, data, 'cmaster'); setIsSettingsModalOpen(false); }}
                initialData={settingsInitialData}
            />
            <InstrumentFormModal 
                isOpen={isSettingsModalOpen && activeSettingsModal === 'instrument'}
                onClose={() => setIsSettingsModalOpen(false)}
                onSubmit={(data) => { handleSave(setInstruments, data, 'inst'); setIsSettingsModalOpen(false); }}
                initialData={settingsInitialData}
            />
            <RoomLocationFormModal 
                isOpen={isSettingsModalOpen && activeSettingsModal === 'roomLocation'}
                onClose={() => setIsSettingsModalOpen(false)}
                onSubmit={(data) => { handleSave(setRoomLocations, data, 'rl'); setIsSettingsModalOpen(false); }}
                initialData={settingsInitialData}
            />
            <StorageFormModal 
                isOpen={isSettingsModalOpen && activeSettingsModal === 'storage'}
                onClose={() => setIsSettingsModalOpen(false)}
                onSubmit={(data) => { handleSave(setStorageLocations, data, 'sl'); setIsSettingsModalOpen(false); }}
                initialData={settingsInitialData}
            />
            <ControlMaterialFormModal 
                isOpen={isSettingsModalOpen && activeSettingsModal === 'controlMaterial'}
                onClose={() => setIsSettingsModalOpen(false)}
                onSubmit={(data) => { handleSave(setControlMaterials, data, 'cm'); setIsSettingsModalOpen(false); }}
                initialData={settingsInitialData}
                chemicalMasters={chemicalMasters}
            />
            <EQAMaterialFormModal 
                isOpen={isSettingsModalOpen && activeSettingsModal === 'eqaMaterial'}
                onClose={() => setIsSettingsModalOpen(false)}
                onSubmit={(data) => { handleSave(setEQAMaterials, data, 'eqa'); setIsSettingsModalOpen(false); }}
                initialData={settingsInitialData}
            />
            <DocumentCategoryFormModal
                isOpen={isSettingsModalOpen && activeSettingsModal === 'documentCategory'}
                onClose={() => setIsSettingsModalOpen(false)}
                onSubmit={(data) => { handleSave(setDocumentCategories, data, 'doccat'); setIsSettingsModalOpen(false); }}
                initialData={settingsInitialData}
            />
            <IQCResultFormModal
                isOpen={isSettingsModalOpen && activeSettingsModal === 'iqcResult'}
                onClose={() => setIsSettingsModalOpen(false)}
                onSubmit={(data) => { handleSave(setIqcResults, data, 'iqc'); setIsSettingsModalOpen(false); }}
                currentUser={currentUser}
                testParameters={testParameters}
                controlMaterials={controlMaterials}
            />

        </>
    );
};

export default App;