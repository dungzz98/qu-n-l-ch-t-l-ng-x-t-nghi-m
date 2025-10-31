import React, { useState, useMemo, useRef, useEffect } from 'react';
import { LabEquipment } from '../types';
import { EditIcon } from './icons/EditIcon';
import { TrashIcon } from './icons/TrashIcon';
import { EyeIcon } from './icons/EyeIcon';
import { DocumentArrowDownIcon } from './icons/DocumentArrowDownIcon';
import { HistoryIcon } from './icons/HistoryIcon';

interface EquipmentListPageProps {
  equipment: LabEquipment[];
  onEdit: (equipment: LabEquipment) => void;
  onDelete: (id: string) => void;
  onViewDetails: (equipment: LabEquipment) => void;
  onExportToDoc: (equipment: LabEquipment) => void;
  onViewUsageLog: (equipmentId: string) => void;
  focusedItemId: string | null;
}

const formatDate = (dateString?: string) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString + 'T00:00:00');
  return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const getMaintenanceStatus = (dateString?: string) => {
  if (!dateString) return { text: 'N/A', color: 'text-gray-600', className: '' };
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const nextDate = new Date(dateString + 'T00:00:00');
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(today.getDate() + 30);

  if (nextDate < today) {
    return { text: 'Quá hạn', color: 'bg-red-100 text-red-800', className: '' };
  }
  if (nextDate <= thirtyDaysFromNow) {
    return { text: `Sắp tới hạn (${formatDate(dateString)})`, color: 'text-yellow-800', className: 'animate-pulse-yellow' };
  }
  return { text: formatDate(dateString), color: 'text-gray-600', className: '' };
};

const EquipmentListPage: React.FC<EquipmentListPageProps> = ({ equipment, onEdit, onDelete, onViewDetails, onExportToDoc, onViewUsageLog, focusedItemId }) => {
  const [filterText, setFilterText] = useState('');
  const rowRefs = useRef<Record<string, HTMLTableRowElement | null>>({});

  useEffect(() => {
    if (focusedItemId && rowRefs.current[focusedItemId]) {
        rowRefs.current[focusedItemId]?.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
        });
    }
  }, [focusedItemId]);

  const filteredEquipment = useMemo(() => {
    if (!filterText) return equipment;
    const lowerCaseFilter = filterText.toLowerCase();
    return equipment.filter(e =>
      e.name.toLowerCase().includes(lowerCaseFilter) ||
      e.assetId.toLowerCase().includes(lowerCaseFilter) ||
      e.serialNumber.toLowerCase().includes(lowerCaseFilter) ||
      e.location.toLowerCase().includes(lowerCaseFilter)
    );
  }, [equipment, filterText]);
  
  const statusMap: Record<LabEquipment['status'], { text: string; color: string }> = {
    operational: { text: 'Hoạt động', color: 'bg-green-100 text-green-800' },
    maintenance: { text: 'Bảo trì', color: 'bg-yellow-100 text-yellow-800' },
    out_of_service: { text: 'Ngưng sử dụng', color: 'bg-red-100 text-red-800' },
  };

  return (
    <div>
        <div className="mb-4">
            <input
            type="text"
            placeholder="Tìm kiếm theo tên, mã tài sản, số serial, vị trí..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            className="block w-full max-w-lg rounded-md border border-gray-300 bg-white py-2 px-4 text-black placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-black"
            />
        </div>

        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-white">
                <tr className="border-b-2 border-black">
                <th className="px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Tên thiết bị</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Mã tài sản / Serial</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Trạng thái</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Vị trí</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Bảo trì tiếp theo</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Hiệu chuẩn tiếp theo</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Hành động</th>
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
                {filteredEquipment.length > 0 ? filteredEquipment.map(item => {
                const status = statusMap[item.status];
                const maintStatus = getMaintenanceStatus(item.nextMaintenance);
                const calibStatus = getMaintenanceStatus(item.nextCalibration);
                const isFocused = item.id === focusedItemId;

                return (
                <tr key={item.id} ref={el => rowRefs.current[item.id] = el} className={`hover:bg-gray-50 ${isFocused ? 'animate-pulse-yellow' : ''}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-black">{item.name}</div>
                        <div className="text-xs text-gray-500">{item.model || ''}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 font-mono">{item.assetId}</div>
                        <div className="text-xs text-gray-500 font-mono">S/N: {item.serialNumber}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${status.color}`}>
                            {status.text}
                        </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{item.location}</td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${maintStatus.className}`}>
                        <span className={`px-2 py-1 inline-flex text-xs leading-4 font-semibold rounded-md ${maintStatus.color}`}>
                            {maintStatus.text}
                        </span>
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${calibStatus.className}`}>
                         <span className={`px-2 py-1 inline-flex text-xs leading-4 font-semibold rounded-md ${calibStatus.color}`}>
                            {calibStatus.text}
                        </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-4">
                        <button onClick={() => onViewUsageLog(item.id)} className="text-gray-600 hover:text-black" title="Lịch sử sử dụng"><HistoryIcon /></button>
                        <button onClick={() => onViewDetails(item)} className="text-gray-600 hover:text-black" title="Xem chi tiết"><EyeIcon /></button>
                        <button onClick={() => onEdit(item)} className="text-gray-600 hover:text-black" title="Chỉnh sửa"><EditIcon /></button>
                        <button onClick={() => onDelete(item.id)} className="text-gray-600 hover:text-black" title="Xóa"><TrashIcon /></button>
                        <button onClick={() => onExportToDoc(item)} className="text-gray-600 hover:text-black" title="Xuất Lý lịch Thiết bị"><DocumentArrowDownIcon /></button>
                    </div>
                    </td>
                </tr>
                )}) : (
                <tr>
                    <td colSpan={7} className="text-center py-10 text-gray-500">
                    {equipment.length === 0 ? "Chưa có thiết bị nào được thêm vào." : "Không tìm thấy thiết bị phù hợp."}
                    </td>
                </tr>
                )}
            </tbody>
            </table>
        </div>
    </div>
  );
};

export default EquipmentListPage;