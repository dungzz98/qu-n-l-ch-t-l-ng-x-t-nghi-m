import React, { useState, useMemo } from 'react';
import { LabEquipment } from '../types';
import { PlusIcon } from './icons/PlusIcon';
import { EditIcon } from './icons/EditIcon';
import { TrashIcon } from './icons/TrashIcon';
import { EyeIcon } from './icons/EyeIcon';

interface EquipmentPageProps {
  equipment: LabEquipment[];
  onAdd: () => void;
  onEdit: (equipment: LabEquipment) => void;
  onDelete: (id: string) => void;
  onViewDetails: (equipment: LabEquipment) => void;
}

const formatDate = (dateString?: string) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString + 'T00:00:00');
  return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const getMaintenanceStatus = (dateString?: string) => {
  if (!dateString) return { text: 'N/A', color: 'text-slate-600', className: '' };
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
  return { text: formatDate(dateString), color: 'text-slate-600', className: '' };
};

const EquipmentPage: React.FC<EquipmentPageProps> = ({ equipment, onAdd, onEdit, onDelete, onViewDetails }) => {
  const [filterText, setFilterText] = useState('');

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
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-800">Quản lý Thiết bị & Dụng cụ</h2>
          <p className="text-sm text-slate-500 mt-1">Theo dõi danh mục, trạng thái và lịch bảo trì, hiệu chuẩn.</p>
        </div>
        <button onClick={onAdd} className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700">
          <PlusIcon className="w-5 h-5 mr-2" />
          Thêm Thiết bị
        </button>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Tìm kiếm theo tên, mã tài sản, số serial, vị trí..."
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          className="block w-full max-w-lg rounded-md border border-slate-300 bg-white py-2 px-4 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-blue-500"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Tên thiết bị</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Mã tài sản / Serial</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Trạng thái</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Vị trí</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Bảo trì tiếp theo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Hiệu chuẩn tiếp theo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Hành động</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {filteredEquipment.length > 0 ? filteredEquipment.map(item => {
              const status = statusMap[item.status];
              const maintStatus = getMaintenanceStatus(item.nextMaintenance);
              const calibStatus = getMaintenanceStatus(item.nextCalibration);

              return (
              <tr key={item.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-slate-900">{item.name}</div>
                    <div className="text-xs text-slate-500">{item.model || ''}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-slate-500 font-mono">{item.assetId}</div>
                    <div className="text-xs text-slate-500 font-mono">S/N: {item.serialNumber}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                   <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${status.color}`}>
                        {status.text}
                    </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{item.location}</td>
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
                    <button onClick={() => onViewDetails(item)} className="text-gray-600 hover:text-gray-900" title="Xem chi tiết"><EyeIcon /></button>
                    <button onClick={() => onEdit(item)} className="text-blue-600 hover:text-blue-900" title="Chỉnh sửa"><EditIcon /></button>
                    <button onClick={() => onDelete(item.id)} className="text-red-600 hover:text-red-900" title="Xóa"><TrashIcon /></button>
                  </div>
                </td>
              </tr>
            )}) : (
              <tr>
                <td colSpan={7} className="text-center py-10 text-slate-500">
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

export default EquipmentPage;