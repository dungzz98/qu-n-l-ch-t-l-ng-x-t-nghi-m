import React, { useState } from 'react';
import { DisposalRecord, User } from '../types';
import { PlusIcon } from './icons/PlusIcon';
import { EditIcon } from './icons/EditIcon';
import { TrashIcon } from './icons/TrashIcon';
import DisposalFormModal from './DisposalFormModal';
import { PrintIcon } from './icons/PrintIcon';
import { ExportIcon } from './icons/ExportIcon';
import { DocumentArrowDownIcon } from './icons/DocumentArrowDownIcon';

interface DisposalPageProps {
  records: DisposalRecord[];
  onAdd: (record: Omit<DisposalRecord, 'id'>) => void;
  onUpdate: (record: DisposalRecord) => void;
  onDelete: (id: string) => void;
  onPrint: (record: DisposalRecord) => void;
  onExportToExcel: (record: DisposalRecord) => void;
  onExportToDoc: (record: DisposalRecord) => void;
  currentUser: User | null;
}

const formatDate = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString.split('T')[0] + 'T00:00:00');
  return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const DisposalPage: React.FC<DisposalPageProps> = ({ records, onAdd, onUpdate, onDelete, onPrint, onExportToExcel, onExportToDoc, currentUser }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<DisposalRecord | null>(null);

  const handleOpenModal = (record?: DisposalRecord) => {
    setEditingRecord(record || null);
    setIsModalOpen(true);
  };
  
  const handleCloseModal = () => {
      setEditingRecord(null);
      setIsModalOpen(false);
  };
  
  const handleSubmit = (recordData: Omit<DisposalRecord, 'id'> | DisposalRecord) => {
      if ('id' in recordData) {
          onUpdate(recordData);
      } else {
          onAdd(recordData);
      }
  };

  return (
    <>
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
          <h2 className="text-xl font-semibold text-slate-800">Quản lý Biên bản Hủy Vật tư</h2>
          <button
            onClick={() => handleOpenModal()}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
          >
            <PlusIcon className="w-5 h-5 mr-2" /> Nhập Biên bản Hủy
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Ngày</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Tên Vật tư</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Số lượng</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Lý do</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Người thực hiện</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Hành động</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {records.length > 0 ? records.map(record => (
                <tr key={record.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{formatDate(record.date)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{record.itemName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{record.quantity}</td>
                  <td className="px-6 py-4 text-sm text-slate-600 max-w-xs truncate" title={record.reason}>{record.reason}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{record.executor}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-4">
                      <button onClick={() => onExportToDoc(record)} className="text-blue-600 hover:text-blue-900" title="Xuất file Word (.doc)"><DocumentArrowDownIcon /></button>
                      <button onClick={() => onExportToExcel(record)} className="text-teal-600 hover:text-teal-900" title="Xuất Excel"><ExportIcon /></button>
                      <button onClick={() => onPrint(record)} className="text-gray-600 hover:text-gray-900" title="In Biên bản"><PrintIcon /></button>
                      <button onClick={() => handleOpenModal(record)} className="text-blue-600 hover:text-blue-900" title="Chỉnh sửa"><EditIcon /></button>
                      <button onClick={() => onDelete(record.id)} className="text-red-600 hover:text-red-900" title="Xóa"><TrashIcon /></button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-500">
                    Chưa có biên bản hủy nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <DisposalFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        initialData={editingRecord}
        currentUserFullName={currentUser?.fullName || ''}
      />
    </>
  );
};

export default DisposalPage;