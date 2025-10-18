import React, { useState, useMemo } from 'react';
import { LabEquipment, WorkItem, MaintenanceChecklistLog, PersonnelProfile } from '../types';
import { DocumentArrowDownIcon } from './icons/DocumentArrowDownIcon';

interface EquipmentSchedulePageProps {
  equipment: LabEquipment[];
  workItems: WorkItem[];
  personnel: PersonnelProfile[];
  maintenanceLogs: MaintenanceChecklistLog[];
  onToggleCheck: (equipmentId: string, workItemId: string, date: string) => void;
  onExportToDoc: (equipmentId: string, month: number, year: number) => void;
}

const FREQUENCY_ORDER: NonNullable<WorkItem['frequency']>[] = ['daily', 'weekly', 'monthly', 'quarterly', 'as_needed', 'replacement'];
const FREQUENCY_LABELS: Record<NonNullable<WorkItem['frequency']>, string> = {
    daily: 'Hàng ngày',
    weekly: 'Hàng tuần',
    monthly: 'Hàng tháng',
    quarterly: 'Hàng quý',
    as_needed: 'Bảo dưỡng khi cần',
    replacement: 'Thay thế',
};

const EquipmentSchedulePage: React.FC<EquipmentSchedulePageProps> = ({ equipment, workItems, personnel, maintenanceLogs, onToggleCheck, onExportToDoc }) => {
    const today = new Date();
    const [selectedEquipmentId, setSelectedEquipmentId] = useState<string>(equipment[0]?.id || '');
    const [month, setMonth] = useState<number>(today.getMonth() + 1);
    const [year, setYear] = useState<number>(today.getFullYear());

    const selectedEquipment = useMemo(() => equipment.find(e => e.id === selectedEquipmentId), [equipment, selectedEquipmentId]);

    const daysInMonth = useMemo(() => new Date(year, month, 0).getDate(), [year, month]);

    const associatedWorkItems = useMemo(() => {
        if (!selectedEquipment) return [];
        const associatedIds = new Set(selectedEquipment.associatedWorkItemIds || []);
        return workItems.filter(item => associatedIds.has(item.id));
    }, [selectedEquipment, workItems]);
    
    const groupedWorkItems = useMemo(() => {
        const grouped: { [key in NonNullable<WorkItem['frequency']>]?: WorkItem[] } = {};
        for (const item of associatedWorkItems) {
            if (item.frequency) {
                if (!grouped[item.frequency]) {
                    grouped[item.frequency] = [];
                }
                grouped[item.frequency]!.push(item);
            }
        }
        return FREQUENCY_ORDER.map(freq => ({
            frequency: freq,
            label: FREQUENCY_LABELS[freq],
            items: grouped[freq] || []
        })).filter(group => group.items.length > 0);
    }, [associatedWorkItems]);

    const handleExport = () => {
        if (selectedEquipmentId) {
            onExportToDoc(selectedEquipmentId, month, year);
        }
    };

    const renderTableBody = () => {
        return groupedWorkItems.map(group => (
            <React.Fragment key={group.frequency}>
                <tr>
                    <td className="px-2 py-2 font-bold bg-slate-200 text-slate-800 text-sm" colSpan={daysInMonth + 1}>
                        {group.label}
                    </td>
                </tr>
                {group.items.map(item => (
                    <tr key={item.id} className="hover:bg-slate-50">
                        <td className="px-2 py-1.5 text-sm font-medium border-r">{item.description}</td>
                        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
                            const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                            const log = maintenanceLogs.find(l => l.equipmentId === selectedEquipmentId && l.workItemId === item.id && l.date === dateStr);
                            const personnelName = log ? personnel.find(p => p.id === log.completedByUserId)?.fullName : undefined;
                            
                            return (
                                <td key={day} className="border-r text-center align-middle p-0">
                                    <div className="w-full h-full flex items-center justify-center" title={personnelName}>
                                        <input
                                            type="checkbox"
                                            checked={!!log}
                                            onChange={() => onToggleCheck(selectedEquipmentId, item.id, dateStr)}
                                            className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                        />
                                    </div>
                                </td>
                            );
                        })}
                    </tr>
                ))}
            </React.Fragment>
        ));
    };

    return (
        <div>
            <div className="flex flex-wrap justify-between items-center mb-4 gap-4 p-4 bg-slate-50 rounded-lg border">
                <div className="flex gap-4 flex-wrap items-end">
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Thiết bị</label>
                        <select value={selectedEquipmentId} onChange={e => setSelectedEquipmentId(e.target.value)} className="p-2 border border-gray-300 rounded-md bg-white text-black min-w-[250px]">
                            {equipment.map(e => <option key={e.id} value={e.id}>{e.name} ({e.assetId})</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Tháng</label>
                        <select value={month} onChange={e => setMonth(Number(e.target.value))} className="p-2 border border-gray-300 rounded-md bg-white text-black">
                            {Array.from({ length: 12 }, (_, i) => i + 1).map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Năm</label>
                        <input type="number" value={year} onChange={e => setYear(Number(e.target.value))} className="p-2 border border-gray-300 rounded-md bg-white text-black w-28" />
                    </div>
                </div>
                 <button 
                    onClick={handleExport}
                    disabled={!selectedEquipmentId} 
                    className="inline-flex items-center justify-center gap-2 rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:bg-gray-400"
                >
                    <DocumentArrowDownIcon /> Xuất Phiếu
                </button>
            </div>

            {selectedEquipment ? (
                <div className="overflow-x-auto border rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200 border-collapse">
                        <thead className="bg-white sticky top-0 z-10">
                            <tr>
                                <th className="px-2 py-2 text-left text-xs font-bold text-black uppercase tracking-wider border-r w-64">Nội dung</th>
                                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => (
                                    <th key={day} className="p-1 text-center text-xs font-bold text-black border-r w-12">{day}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                           {renderTableBody()}
                           <tr>
                                <td className="px-2 py-2 font-bold bg-slate-200 text-slate-800 text-sm" colSpan={1}>NHÂN VIÊN/KỸ SƯ</td>
                                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => (
                                    <td key={day} className="border-r h-12"></td>
                                ))}
                           </tr>
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="text-center py-10 text-gray-500">
                    <p>Vui lòng chọn một thiết bị để hiển thị checklist bảo trì.</p>
                </div>
            )}
        </div>
    );
};

export default EquipmentSchedulePage;