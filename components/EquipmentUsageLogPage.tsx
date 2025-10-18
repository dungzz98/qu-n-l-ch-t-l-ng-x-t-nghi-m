import React, { useState, useMemo } from 'react';
import { EquipmentUsageLog, LabEquipment, PersonnelProfile, User, AccessLog } from '../types';
import { PlusIcon } from './icons/PlusIcon';
import { ExportIcon } from './icons/ExportIcon';
import { utils, writeFile } from 'xlsx';
import { DocumentArrowDownIcon } from './icons/DocumentArrowDownIcon';
import { ForwardIcon } from './icons/ForwardIcon';

interface EquipmentUsageLogPageProps {
  logs: EquipmentUsageLog[];
  equipment: LabEquipment[];
  personnel: PersonnelProfile[];
  onAdd: () => void;
  currentUser: User | null;
  onExportUsageLogToDoc: (equipmentId: string, logs: EquipmentUsageLog[]) => void;
  accessLogs: AccessLog[];
  equipmentFilter: string;
  onEquipmentFilterChange: (value: string) => void;
  onCreateNonConformity: (log: EquipmentUsageLog) => void;
  onUpdateUsageLog: (log: EquipmentUsageLog) => void;
}

const formatDate = (dateString: string) => {
  if (!dateString) return 'N/A';
  return new Date(dateString + 'T00:00:00').toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const EquipmentUsageLogPage: React.FC<EquipmentUsageLogPageProps> = ({ 
    logs, equipment, personnel, onAdd, currentUser, onExportUsageLogToDoc, accessLogs, equipmentFilter, onEquipmentFilterChange,
    onCreateNonConformity 
}) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const equipmentMap = useMemo(() => new Map(equipment.map(e => [e.id, e.name])), [equipment]);
  
  const userMap = useMemo(() => {
    const map = new Map<string, string>();
    personnel.forEach(p => map.set(p.id, p.fullName));
    // Add external users from access logs, assuming their ID is their name
    accessLogs.forEach(log => {
        if (!map.has(log.personOrUnit)) {
            map.set(log.personOrUnit, log.personOrUnit);
        }
    });
    return map;
  }, [personnel, accessLogs]);


  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const matchesDate = (!startDate || log.date >= startDate) && (!endDate || log.date <= endDate);
      const matchesEquipment = !equipmentFilter || log.equipmentId === equipmentFilter;
      return matchesDate && matchesEquipment;
    });
  }, [logs, startDate, endDate, equipmentFilter]);

  const handleCreateNonConformity = (log: EquipmentUsageLog) => {
    if (window.confirm(`Bạn có chắc muốn chuyển sự cố "${log.incidents}" thành một phiếu Sự không phù hợp mới?`)) {
        onCreateNonConformity(log);
    }
  };
  
  const handleExportExcel = () => {
    const dataToExport = filteredLogs.map(log => ({
      'Ngày': formatDate(log.date),
      'Thiết bị': equipmentMap.get(log.equipmentId) || 'N/A',
      'Người sử dụng': userMap.get(log.userId) || log.userId,
      'Giờ bắt đầu': log.startTime,
      'Giờ kết thúc': log.endTime,
      'Nội dung bảo trì, bảo dưỡng': log.maintenancePerformed,
      'Kiểm tra chất lượng': log.qualityCheck === 'yes' ? 'Có' : log.qualityCheck === 'no' ? 'Không' : 'K/TH',
      'Chi tiết KTCL': log.qualityCheckDetails,
      'Sự cố thiết bị / nội kiểm': log.incidents,
      'Hành động khắc phục': log.correctiveAction,
      'Trạng thái khi sử dụng': log.usageStatus,
      'Ghi chú': log.notes,
    }));
    const ws = utils.json_to_sheet(dataToExport);
    const wb = utils.book_new();
    
    let datePart = 'All_Time';
    if (startDate && endDate) {
        datePart = `${startDate}_to_${endDate}`;
    } else if (startDate) {
        datePart = `from_${startDate}`;
    } else if (endDate) {
        datePart = `to_${endDate}`;
    }
    
    const sheetName = `NhatKy_${datePart}`;
    const fileName = `Nhat_ky_su_dung_${datePart}.xlsx`;

    utils.book_append_sheet(wb, ws, sheetName);
    writeFile(wb, fileName);
  };
  
  const handleExportDoc = () => {
      if (equipmentFilter) {
          onExportUsageLogToDoc(equipmentFilter, filteredLogs);
      }
  };

  const statusMap: Record<EquipmentUsageLog['usageStatus'], { text: string; color: string }> = {
    'Hoạt động tốt': { text: 'Tốt', color: 'bg-green-100 text-green-800' },
    'Có vấn đề nhỏ': { text: 'Vấn đề nhỏ', color: 'bg-yellow-100 text-yellow-800' },
    'Gặp sự cố': { text: 'Sự cố', color: 'bg-red-100 text-red-800' },
  };


  return (
    <div>
      <div className="flex flex-wrap justify-between items-center mb-4 gap-4">
        <div className="flex gap-4 flex-wrap items-end">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Từ ngày</label>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="p-2 border border-gray-300 rounded-md bg-white text-black"/>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Đến ngày</label>
             <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="p-2 border border-gray-300 rounded-md bg-white text-black"/>
          </div>
           <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Thiết bị</label>
            <select value={equipmentFilter} onChange={e => onEquipmentFilterChange(e.target.value)} className="p-2 border border-gray-300 rounded-md bg-white min-w-[200px] text-black">
              <option value="">Tất cả thiết bị</option>
              {equipment.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
          </div>
           <button 
            onClick={() => { setStartDate(''); setEndDate(''); onEquipmentFilterChange(''); }}
            className="px-3 py-2 text-sm text-gray-600 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
            title="Xóa bộ lọc"
          >
            Xóa lọc
          </button>
        </div>
        <div className="flex gap-2">
            <button onClick={onAdd} className="inline-flex items-center justify-center gap-2 rounded-md bg-black px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-gray-800">
                <PlusIcon /> Ghi nhận sử dụng
            </button>
             <button onClick={handleExportExcel} disabled={filteredLogs.length === 0} className="inline-flex items-center justify-center gap-2 rounded-md bg-teal-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-teal-700 disabled:bg-gray-400">
                <ExportIcon /> Xuất Excel
            </button>
             <button 
                onClick={handleExportDoc} 
                disabled={!equipmentFilter} 
                className="inline-flex items-center justify-center gap-2 rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                title={!equipmentFilter ? 'Vui lòng lọc theo một thiết bị để xuất báo cáo' : 'Xuất file Word (.doc)'}
            >
                <DocumentArrowDownIcon /> Xuất Word
            </button>
        </div>
      </div>

      <div className="overflow-x-auto border rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-white">
            <tr className="border-b-2 border-black">
              <th className="px-4 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Thiết bị</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Thời gian</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Bảo trì/Bảo dưỡng</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Kiểm tra chất lượng</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Sự cố</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Hành động khắc phục</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Trạng thái</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Ghi chú</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Hành động</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredLogs.length > 0 ? filteredLogs.map(log => {
              const statusInfo = statusMap[log.usageStatus];
              return (
              <tr key={log.id}>
                <td className="px-4 py-3 whitespace-nowrap">
                    <p className="text-sm font-medium text-black">{equipmentMap.get(log.equipmentId) || 'N/A'}</p>
                    <p className="text-xs text-gray-500">{userMap.get(log.userId) || log.userId}</p>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-black">{formatDate(log.date)}<br/>{log.startTime} - {log.endTime}</td>
                <td className="px-4 py-3 text-sm whitespace-pre-wrap text-black max-w-xs" title={log.maintenancePerformed}>{log.maintenancePerformed}</td>
                <td className="px-4 py-3 text-sm text-black max-w-xs">
                    <div>
                        {log.qualityCheck === 'yes' && <span className="px-2 py-0.5 mr-2 text-xs font-semibold rounded-full bg-green-100 text-green-800">Có</span>}
                        {log.qualityCheck === 'no' && <span className="px-2 py-0.5 mr-2 text-xs font-semibold rounded-full bg-red-100 text-red-800">Không</span>}
                        {log.qualityCheck === 'n/a' && <span className="px-2 py-0.5 mr-2 text-xs font-semibold rounded-full bg-slate-100 text-slate-800">K/TH</span>}
                    </div>
                    {log.qualityCheckDetails && <p className="whitespace-pre-wrap mt-1 text-xs" title={log.qualityCheckDetails}>{log.qualityCheckDetails}</p>}
                </td>
                <td className="px-4 py-3 text-sm whitespace-pre-wrap text-black max-w-xs" title={log.incidents}>{log.incidents}</td>
                <td className="px-4 py-3 text-sm whitespace-pre-wrap text-black max-w-xs" title={log.correctiveAction}>{log.correctiveAction}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                   <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusInfo.color}`}>
                        {statusInfo.text}
                    </span>
                </td>
                <td className="px-4 py-3 text-sm whitespace-pre-wrap text-black max-w-xs" title={log.notes}>{log.notes}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                    <button
                        onClick={() => handleCreateNonConformity(log)}
                        disabled={!log.incidents || !!log.nonConformityId}
                        className="p-1 rounded-full text-gray-600 hover:text-black disabled:text-gray-300 disabled:cursor-not-allowed"
                        title={
                            log.nonConformityId 
                                ? `Đã chuyển thành SKPH` 
                                : (!log.incidents ? 'Không có sự cố để chuyển' : 'Chuyển thành Sự không phù hợp')
                        }
                    >
                        <ForwardIcon className="w-5 h-5" />
                    </button>
                </td>
              </tr>
            )}) : (
              <tr><td colSpan={9} className="text-center p-8 text-gray-500">Không có nhật ký nào phù hợp với bộ lọc.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EquipmentUsageLogPage;