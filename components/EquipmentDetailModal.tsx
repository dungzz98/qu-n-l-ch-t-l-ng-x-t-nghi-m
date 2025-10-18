import React from 'react';
import { LabEquipment, MaintenanceRecord, CalibrationRecord, EquipmentDocument } from '../types';
import { WrenchScrewdriverIcon } from './icons/WrenchScrewdriverIcon';
import { ClipboardDocumentListIcon } from './icons/ClipboardDocumentListIcon';
import { DocumentTextIcon } from './icons/DocumentTextIcon';
import { PlusIcon } from './icons/PlusIcon';
import { TrashIcon } from './icons/TrashIcon';

interface EquipmentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  equipment: LabEquipment | null;
  onAddMaintenance: () => void;
  onAddCalibration: () => void;
  onAddDocument: () => void;
  onDeleteMaintenance: (recordId: string) => void;
  onDeleteCalibration: (recordId: string) => void;
  onDeleteDocument: (docId: string) => void;
  onViewDocument: (doc: EquipmentDocument) => void;
}

const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString + 'T00:00:00').toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const EquipmentDetailModal: React.FC<EquipmentDetailModalProps> = (props) => {
  const { isOpen, onClose, equipment, onAddMaintenance, onAddCalibration, onAddDocument, onDeleteMaintenance, onDeleteCalibration, onDeleteDocument, onViewDocument } = props;

  if (!isOpen || !equipment) return null;
  
  const statusMap: Record<LabEquipment['status'], { text: string; color: string }> = {
    operational: { text: 'Hoạt động', color: 'bg-green-100 text-green-800' },
    maintenance: { text: 'Bảo trì', color: 'bg-yellow-100 text-yellow-800' },
    out_of_service: { text: 'Ngưng sử dụng', color: 'bg-red-100 text-red-800' },
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white rounded-lg shadow-xl p-6 m-4 w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-start border-b pb-3">
          <div>
            <h2 className="text-xl font-semibold text-slate-800">{equipment.name}</h2>
            <p className="text-sm text-slate-500">Mã TS: {equipment.assetId} | S/N: {equipment.serialNumber}</p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-800 text-3xl leading-none">&times;</button>
        </div>

        <div className="mt-4 flex-grow overflow-y-auto pr-2 space-y-6">
          {/* Main Info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div><strong className="block text-slate-500">Trạng thái</strong> <span className={`px-2 py-0.5 inline-flex text-xs font-semibold rounded-full ${statusMap[equipment.status].color}`}>{statusMap[equipment.status].text}</span></div>
            <div><strong className="block text-slate-500">Vị trí</strong> {equipment.location}</div>
            <div><strong className="block text-slate-500">Hãng SX</strong> {equipment.manufacturer || 'N/A'}</div>
            <div><strong className="block text-slate-500">Model</strong> {equipment.model || 'N/A'}</div>
            <div><strong className="block text-slate-500">Ngày mua</strong> {formatDate(equipment.purchaseDate)}</div>
            <div><strong className="block text-slate-500">Hạn BH</strong> {formatDate(equipment.warrantyDate)}</div>
          </div>
          
          {/* Maintenance History */}
          <section>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold text-slate-700 flex items-center gap-2"><WrenchScrewdriverIcon/> Lịch sử Bảo trì</h3>
              <button onClick={onAddMaintenance} className="text-sm inline-flex items-center gap-1 text-blue-600 hover:text-blue-800"><PlusIcon className="w-4 h-4"/>Thêm</button>
            </div>
            <div className="border rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-slate-200 text-sm">
                    <thead className="bg-slate-50"><tr><th className="px-4 py-2 text-left">Ngày</th><th className="px-4 py-2 text-left">Người thực hiện</th><th className="px-4 py-2 text-left">Mô tả</th><th className="px-4 py-2 text-left">Hành động</th></tr></thead>
                    <tbody className="bg-white divide-y divide-slate-100">
                        {(equipment.maintenanceHistory || []).map(r => <tr key={r.id}>
                            <td className="px-4 py-2 whitespace-nowrap">{formatDate(r.date)}</td>
                            <td className="px-4 py-2">{r.performedBy}</td>
                            <td className="px-4 py-2">{r.description}</td>
                            <td className="px-4 py-2"><button onClick={() => onDeleteMaintenance(r.id)} className="text-red-500"><TrashIcon className="w-4 h-4"/></button></td>
                        </tr>)}
                    </tbody>
                </table>
            </div>
          </section>

          {/* Calibration History */}
           <section>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold text-slate-700 flex items-center gap-2"><ClipboardDocumentListIcon/> Lịch sử Hiệu chuẩn</h3>
              <button onClick={onAddCalibration} className="text-sm inline-flex items-center gap-1 text-blue-600 hover:text-blue-800"><PlusIcon className="w-4 h-4"/>Thêm</button>
            </div>
            <div className="border rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-slate-200 text-sm">
                    <thead className="bg-slate-50"><tr><th className="px-4 py-2 text-left">Ngày</th><th className="px-4 py-2 text-left">Người thực hiện</th><th className="px-4 py-2 text-left">Mô tả</th><th className="px-4 py-2 text-left">Hành động</th></tr></thead>
                    <tbody className="bg-white divide-y divide-slate-100">
                        {(equipment.calibrationHistory || []).map(r => <tr key={r.id}>
                            <td className="px-4 py-2 whitespace-nowrap">{formatDate(r.date)}</td>
                            <td className="px-4 py-2">{r.performedBy}</td>
                            <td className="px-4 py-2">{r.description}</td>
                            <td className="px-4 py-2"><button onClick={() => onDeleteCalibration(r.id)} className="text-red-500"><TrashIcon className="w-4 h-4"/></button></td>
                        </tr>)}
                    </tbody>
                </table>
            </div>
          </section>

          {/* Documents */}
           <section>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold text-slate-700 flex items-center gap-2"><DocumentTextIcon/> Tài liệu đính kèm</h3>
              <button onClick={onAddDocument} className="text-sm inline-flex items-center gap-1 text-blue-600 hover:text-blue-800"><PlusIcon className="w-4 h-4"/>Thêm</button>
            </div>
            <div className="border rounded-lg overflow-hidden">
                 <table className="min-w-full divide-y divide-slate-200 text-sm">
                    <thead className="bg-slate-50"><tr><th className="px-4 py-2 text-left">Tên tài liệu</th><th className="px-4 py-2 text-left">Tên file</th><th className="px-4 py-2 text-left">Hành động</th></tr></thead>
                    <tbody className="bg-white divide-y divide-slate-100">
                        {(equipment.documents || []).map(d => <tr key={d.id}>
                            <td className="px-4 py-2 font-medium">{d.title}</td>
                            <td className="px-4 py-2">{d.fileName}</td>
                            <td className="px-4 py-2"><div className="flex gap-2"><button onClick={() => onViewDocument(d)} className="text-blue-600">Xem</button><button onClick={() => onDeleteDocument(d.id)} className="text-red-500">Xóa</button></div></td>
                        </tr>)}
                    </tbody>
                </table>
            </div>
          </section>
        </div>

        <div className="mt-6 flex justify-end">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300">
              Đóng
            </button>
        </div>
      </div>
    </div>
  );
};

export default EquipmentDetailModal;