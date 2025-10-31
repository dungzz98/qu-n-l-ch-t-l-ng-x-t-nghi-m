import React, { useState } from 'react';
import { LabEquipment, EquipmentUsageLog, PersonnelProfile, User, WorkItem, MaintenanceChecklistLog, AccessLog } from '../types';
import { PlusIcon } from './icons/PlusIcon';
import EquipmentListPage from './EquipmentListPage';
import EquipmentUsageLogPage from './EquipmentUsageLogPage';
import EquipmentTasksPage from './EquipmentTasksPage';
import WorkItemCatalogPage from './WorkItemCatalogPage';
import { ListBulletIcon } from './icons/ListBulletIcon';
import { ClockIcon } from './icons/ClockIcon';
import { ClipboardDocumentCheckIcon } from './icons/ClipboardDocumentCheckIcon';
import { ListCheckIcon } from './icons/ListCheckIcon';
import { CalendarDaysIcon } from './icons/CalendarDaysIcon';
import EquipmentSchedulePage from './EquipmentSchedulePage';

interface EquipmentPageProps {
  equipment: LabEquipment[];
  personnel: PersonnelProfile[];
  equipmentUsageLogs: EquipmentUsageLog[];
  workItems: WorkItem[];
  currentUser: User | null;
  focusedItemId: string | null;
  onAdd: () => void;
  onEdit: (equipment: LabEquipment) => void;
  onDelete: (id: string) => void;
  onViewDetails: (equipment: LabEquipment) => void;
  onOpenAddUsageLog: () => void;
  onUpdateAssociatedWorkItems: (equipmentId: string, workItemIds: string[]) => void;
  onAddOrUpdateWorkItem: (item: Omit<WorkItem, 'id'> | WorkItem) => void;
  onDeleteWorkItem: (id: string) => void;
  onExportToDoc: (equipment: LabEquipment) => void;
  onExportUsageLogToDoc: (equipmentId: string, logs: EquipmentUsageLog[]) => void;
  maintenanceChecklistLogs: MaintenanceChecklistLog[];
  onToggleMaintenanceCheck: (equipmentId: string, workItemId: string, date: string) => void;
  onExportMaintenanceSheetToDoc: (equipmentId: string, month: number, year: number) => void;
  accessLogs: AccessLog[];
  onCreateNonConformity: (log: EquipmentUsageLog) => void;
  onUpdateUsageLog: (log: EquipmentUsageLog) => void;
}

type ActiveTab = 'list' | 'log' | 'schedule' | 'tasks' | 'workItemCatalog';


const EquipmentPage: React.FC<EquipmentPageProps> = (props) => {
  const { 
      equipment, onAdd, onEdit, onDelete, onViewDetails, onOpenAddUsageLog, 
      onUpdateAssociatedWorkItems, equipmentUsageLogs, personnel, currentUser,
      workItems, onAddOrUpdateWorkItem, onDeleteWorkItem, onExportToDoc,
      onExportUsageLogToDoc, maintenanceChecklistLogs, onToggleMaintenanceCheck, onExportMaintenanceSheetToDoc,
      accessLogs, onCreateNonConformity, onUpdateUsageLog, focusedItemId
  } = props;
  const [activeTab, setActiveTab] = useState<ActiveTab>('list');
  const [usageLogEquipmentFilter, setUsageLogEquipmentFilter] = useState('');

  const handleViewUsageLog = (equipmentId: string) => {
    setUsageLogEquipmentFilter(equipmentId);
    setActiveTab('log');
  };

  const TabButton: React.FC<{ tabId: ActiveTab, label: string, icon: React.ReactNode }> = ({ tabId, label, icon }) => (
    <button
        onClick={() => setActiveTab(tabId)}
        className={`px-4 py-2 text-sm font-medium rounded-md flex items-center gap-2 ${activeTab === tabId ? 'bg-black text-white' : 'bg-white text-black border border-gray-300 hover:bg-gray-100'}`}
    >
        {icon}{label}
    </button>
  );

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg text-black">
      <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
        <div>
          <h2 className="text-xl font-semibold text-black">Quản lý Thiết bị & Dụng cụ</h2>
          <p className="text-sm text-gray-600 mt-1">Theo dõi danh mục, trạng thái, lịch sử sử dụng và quy trình công việc.</p>
        </div>
        {activeTab === 'list' && (
            <button onClick={onAdd} className="inline-flex items-center justify-center rounded-md border border-transparent bg-black px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-gray-800">
              <PlusIcon className="w-5 h-5 mr-2" />
              Thêm Thiết bị
            </button>
        )}
      </div>

       <div className="flex flex-wrap gap-2 mb-4 border-b border-gray-200 pb-4">
            <TabButton tabId="list" label="Danh mục Thiết bị" icon={<ListBulletIcon />} />
            <TabButton tabId="log" label="Nhật ký Sử dụng" icon={<ClockIcon />} />
            <TabButton tabId="schedule" label="Lịch Bảo dưỡng" icon={<CalendarDaysIcon />} />
            <TabButton tabId="tasks" label="Quy trình Công việc" icon={<ClipboardDocumentCheckIcon />} />
            <TabButton tabId="workItemCatalog" label="Danh mục Công việc" icon={<ListCheckIcon />} />
        </div>
      
      <div>
        {activeTab === 'list' && (
          <EquipmentListPage
            equipment={equipment}
            onEdit={onEdit}
            onDelete={onDelete}
            onViewDetails={onViewDetails}
            onExportToDoc={onExportToDoc}
            onViewUsageLog={handleViewUsageLog}
            focusedItemId={focusedItemId}
          />
        )}
        {activeTab === 'log' && (
          <EquipmentUsageLogPage
            logs={equipmentUsageLogs}
            equipment={equipment}
            personnel={personnel}
            onAdd={onOpenAddUsageLog}
            currentUser={currentUser}
            onExportUsageLogToDoc={onExportUsageLogToDoc}
            accessLogs={accessLogs}
            equipmentFilter={usageLogEquipmentFilter}
            onEquipmentFilterChange={setUsageLogEquipmentFilter}
            onCreateNonConformity={onCreateNonConformity}
            onUpdateUsageLog={onUpdateUsageLog}
          />
        )}
        {activeTab === 'schedule' && (
          <EquipmentSchedulePage
            equipment={equipment}
            workItems={workItems}
            personnel={personnel}
            maintenanceLogs={maintenanceChecklistLogs}
            onToggleCheck={onToggleMaintenanceCheck}
            onExportToDoc={onExportMaintenanceSheetToDoc}
          />
        )}
        {activeTab === 'tasks' && (
          <EquipmentTasksPage
            equipment={equipment}
            workItems={workItems}
            onUpdate={onUpdateAssociatedWorkItems}
          />
        )}
        {activeTab === 'workItemCatalog' && (
            <WorkItemCatalogPage 
                workItems={workItems}
                onAddOrUpdate={onAddOrUpdateWorkItem}
                onDelete={onDeleteWorkItem}
            />
        )}
      </div>
    </div>
  );
};

export default EquipmentPage;