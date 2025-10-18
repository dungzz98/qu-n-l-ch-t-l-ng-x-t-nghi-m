import React, { useState, useMemo } from 'react';
import { OrganizationUnit, JobRole, PersonnelProfile, LeaveRecord, AttendanceRecord, DutyAssignment, TaskAssignment, PersonnelAssignmentHistory, KpiScore, WorkSchedule, Holiday } from '../types';
import { PlusIcon } from './icons/PlusIcon';
import { EditIcon } from './icons/EditIcon';
import { TrashIcon } from './icons/TrashIcon';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import { UsersGroupIcon } from './icons/UsersGroupIcon';
import { CalendarDaysIcon } from './icons/CalendarDaysIcon';
import { ClipboardDocumentListIcon } from './icons/ClipboardDocumentListIcon';
import { UserArrowsIcon } from './icons/UserArrowsIcon';
import { TrophyIcon } from './icons/TrophyIcon';
import AttendanceCalendar from './AttendanceCalendar';
import AssignmentPage from './AssignmentPage';
import AssignmentHistoryPage from './AssignmentHistoryPage';
import KpiPage from './KpiPage';

interface OrganizationPageProps {
  organizationUnits: OrganizationUnit[];
  jobRoles: JobRole[];
  personnel: PersonnelProfile[];
  personnelAssignmentHistory: PersonnelAssignmentHistory[];
  leaveRecords: LeaveRecord[];
  attendanceRecords: AttendanceRecord[];
  dutyAssignments: DutyAssignment[];
  taskAssignments: TaskAssignment[];
  kpiScores: KpiScore[];
  workSchedule: WorkSchedule;
  holidays: Holiday[];
  onAddUnit: (parentId: string | null) => void;
  onEditUnit: (unit: OrganizationUnit) => void;
  onDeleteUnit: (id: string) => void;
  onAddRole: () => void;
  onEditRole: (role: JobRole) => void;
  onDeleteRole: (id: string) => void;
  onAddLeave: () => void;
  onAddOrUpdateAttendance: (personnelId: string, date: string, record?: AttendanceRecord) => void;
  onAddDutyAssignment: (assignment: Omit<DutyAssignment, 'id'>) => void;
  onDeleteDutyAssignment: (dutyId: string) => void;
  onAddTaskAssignment: (assignment: Omit<TaskAssignment, 'id'>) => void;
  onOpenMovePersonnel: () => void;
  onAddOrUpdateKpiScore: (personnelId: string, date: string, bonusPoints: number, penaltyPoints: number, notes: string) => void;
}

type ActiveTab = 'chart' | 'roles' | 'attendance' | 'assignment' | 'history' | 'kpi';

type UnitTreeNode = OrganizationUnit & { children: UnitTreeNode[] };

const OrganizationPage: React.FC<OrganizationPageProps> = (props) => {
    const { 
        organizationUnits, jobRoles, personnel, onAddUnit, onEditUnit, onDeleteUnit, onAddRole, onEditRole, onDeleteRole, 
        leaveRecords, attendanceRecords, onAddLeave, onAddOrUpdateAttendance, 
        dutyAssignments, taskAssignments, onAddDutyAssignment, onDeleteDutyAssignment, onAddTaskAssignment,
        personnelAssignmentHistory, onOpenMovePersonnel, kpiScores, onAddOrUpdateKpiScore,
        workSchedule, holidays
    } = props;
    const [activeTab, setActiveTab] = useState<ActiveTab>('attendance');
    const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(organizationUnits.map(u => u.id)));
    const [selectedUnit, setSelectedUnit] = useState<OrganizationUnit | null>(organizationUnits.find(u => u.parentId === null) || organizationUnits[0] || null);

    const jobRoleMap = useMemo(() => new Map(jobRoles.map(role => [role.id, role])), [jobRoles]);

    const unitPersonnel = useMemo(() => {
        if (!selectedUnit) return [];
        return personnel.filter(p => p.organizationUnitId === selectedUnit.id);
    }, [selectedUnit, personnel]);

    const unitTree = useMemo(() => {
        const tree: UnitTreeNode[] = [];
        const map = new Map<string, UnitTreeNode>(
            organizationUnits.map(u => [u.id, { ...u, children: [] }])
        );
        
        for (const unit of map.values()) {
            if (unit.parentId && map.has(unit.parentId)) {
                map.get(unit.parentId)?.children.push(unit);
            } else {
                tree.push(unit);
            }
        }
        return tree;
    }, [organizationUnits]);

    const toggleNode = (id: string) => {
        setExpandedNodes(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) newSet.delete(id);
            else newSet.add(id);
            return newSet;
        });
    };
    
    const renderTree = (nodes: UnitTreeNode[], level = 0) => (
        <ul style={{ paddingLeft: level > 0 ? '20px' : '0' }} className="space-y-1">
            {nodes.map(node => (
                <li key={node.id}>
                    <div 
                        className={`flex items-center group p-2 rounded-md cursor-pointer transition-colors ${selectedUnit?.id === node.id ? 'bg-blue-100' : 'hover:bg-slate-50'}`}
                        onClick={() => setSelectedUnit(node)}
                    >
                        {node.children.length > 0 && (
                            <button onClick={(e) => { e.stopPropagation(); toggleNode(node.id); }} className="p-1 text-slate-500">
                                <ChevronDownIcon className={`w-4 h-4 transition-transform ${expandedNodes.has(node.id) ? 'rotate-0' : '-rotate-90'}`} />
                            </button>
                        )}
                        <span className={`ml-2 flex-grow ${level === 0 ? 'font-bold' : 'font-medium'}`}>{node.name}</span>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={(e) => { e.stopPropagation(); onAddUnit(node.id); }} className="text-green-600" title="Thêm đơn vị con"><PlusIcon className="w-4 h-4"/></button>
                            <button onClick={(e) => { e.stopPropagation(); onEditUnit(node); }} className="text-blue-600" title="Sửa"><EditIcon className="w-4 h-4"/></button>
                            <button onClick={(e) => { e.stopPropagation(); onDeleteUnit(node.id); }} className="text-red-600" title="Xóa"><TrashIcon className="w-4 h-4"/></button>
                        </div>
                    </div>
                    {expandedNodes.has(node.id) && node.children.length > 0 && renderTree(node.children, level + 1)}
                </li>
            ))}
        </ul>
    );
    
    const TabButton: React.FC<{ tabId: ActiveTab, label: string, icon?: React.ReactNode }> = ({ tabId, label, icon }) => (
        <button
            onClick={() => setActiveTab(tabId)}
            className={`-mb-px px-4 py-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors ${
                activeTab === tabId 
                ? 'border-black text-black' 
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-black'
            }`}
        >
            {icon}
            {label}
        </button>
    );

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg text-black">
            <h2 className="text-xl font-semibold text-slate-800 mb-4">Tổ chức</h2>
            <div className="flex flex-wrap border-b border-gray-200 mb-6">
                <TabButton tabId="chart" label="Sơ đồ Tổ chức" icon={<UsersGroupIcon />} />
                <TabButton tabId="attendance" label="Chấm công" icon={<CalendarDaysIcon />} />
                <TabButton tabId="assignment" label="Phân công" icon={<ClipboardDocumentListIcon />} />
                <TabButton tabId="kpi" label="KPI" icon={<TrophyIcon />} />
                <TabButton tabId="history" label="Lịch sử Phân công" icon={<UserArrowsIcon />} />
                <TabButton tabId="roles" label="Vị trí Việc làm" />
            </div>

            {activeTab === 'chart' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="text-lg font-semibold text-slate-700">Cấu trúc Khoa/Phòng</h3>
                            <button onClick={() => onAddUnit(null)} className="text-sm inline-flex items-center gap-1 text-blue-600 hover:text-blue-800"><PlusIcon className="w-4 h-4"/>Thêm Đơn vị gốc</button>
                        </div>
                        <div className="border rounded-lg p-4 max-h-[70vh] overflow-y-auto">
                            {renderTree(unitTree)}
                        </div>
                    </div>
                    <div>
                        {selectedUnit ? (
                            <>
                                <h3 className="text-lg font-semibold text-slate-700 mb-1">Nhân sự tại <span className="text-blue-600">{selectedUnit.name}</span></h3>
                                <p className="text-sm text-slate-500 mb-2">{selectedUnit.description}</p>
                                <div className="overflow-x-auto border rounded-lg max-h-[65vh] overflow-y-auto">
                                <table className="min-w-full divide-y divide-slate-200">
                                    <thead className="bg-slate-50 sticky top-0"><tr><th className="px-4 py-2 text-left text-xs font-medium text-black uppercase">Họ và tên</th><th className="px-4 py-2 text-left text-xs font-medium text-black uppercase">Chức vụ</th></tr></thead>
                                    <tbody className="bg-white divide-y divide-slate-200">
                                        {unitPersonnel.length > 0 ? unitPersonnel.map(p => { const r = jobRoleMap.get(p.jobRoleId); return (
                                            <tr key={p.id}><td className="px-4 py-3 font-medium text-black">{p.fullName}</td><td className="px-4 py-3 text-sm text-black" title={r?.description}>{r?.title}</td></tr>
                                        )}) : (<tr><td colSpan={2} className="text-center py-8 text-black">Chưa có nhân sự.</td></tr>)}
                                    </tbody>
                                </table>
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-center text-slate-500"><UsersGroupIcon className="w-16 h-16 text-slate-300 mb-4"/><h3 className="text-lg font-semibold">Chọn một đơn vị</h3><p>Nhấp vào khoa/phòng để xem nhân sự.</p></div>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'attendance' && (
                <AttendanceCalendar 
                    personnel={personnel}
                    leaveRecords={leaveRecords}
                    attendanceRecords={attendanceRecords}
                    dutyAssignments={dutyAssignments}
                    workSchedule={workSchedule} 
                    holidays={holidays} 
                    onAddLeave={onAddLeave}
                    onAddOrUpdateAttendance={onAddOrUpdateAttendance}
                />
            )}
            
            {activeTab === 'assignment' && (
                <AssignmentPage
                    organizationUnits={organizationUnits}
                    personnel={personnel}
                    dutyAssignments={dutyAssignments}
                    taskAssignments={taskAssignments}
                    onAddDutyAssignment={onAddDutyAssignment}
                    onDeleteDutyAssignment={onDeleteDutyAssignment}
                    onAddTaskAssignment={onAddTaskAssignment}
                />
            )}
            
            {activeTab === 'kpi' && (
                <KpiPage
                    personnel={personnel}
                    attendanceRecords={attendanceRecords}
                    leaveRecords={leaveRecords}
                    holidays={holidays}
                    workSchedule={workSchedule}
                    kpiScores={kpiScores}
                    onAddOrUpdateKpiScore={onAddOrUpdateKpiScore}
                />
            )}

            {activeTab === 'history' && (
                <AssignmentHistoryPage
                    history={personnelAssignmentHistory}
                    personnel={personnel}
                    organizationUnits={organizationUnits}
                    onOpenMovePersonnel={onOpenMovePersonnel}
                />
            )}

            {activeTab === 'roles' && (
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-slate-700">Quản lý Chức danh</h3>
                        <button onClick={onAddRole} className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"><PlusIcon/>Thêm Chức danh</button>
                    </div>
                    <div className="overflow-x-auto border rounded-lg">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50"><tr><th className="px-4 py-2 text-left text-xs font-medium text-black uppercase">Chức danh</th><th className="px-4 py-2 text-left text-xs font-medium text-black uppercase">Mô tả</th><th className="px-4 py-2 text-left text-xs font-medium text-black uppercase">Hành động</th></tr></thead>
                            <tbody className="bg-white divide-y divide-slate-200">{jobRoles.map(role => <tr key={role.id}>
                                <td className="px-4 py-3 font-medium text-black">{role.title}</td>
                                <td className="px-4 py-3 text-sm text-black">{role.description}</td>
                                <td className="px-4 py-3"><div className="flex items-center gap-3">
                                    <button onClick={() => onEditRole(role)} className="text-blue-600"><EditIcon/></button>
                                    <button onClick={() => onDeleteRole(role.id)} className="text-red-600"><TrashIcon/></button>
                                </div></td>
                            </tr>)}</tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrganizationPage;