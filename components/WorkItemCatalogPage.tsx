import React, { useState } from 'react';
import { WorkItem } from '../types';
import { PlusIcon } from './icons/PlusIcon';
import { EditIcon } from './icons/EditIcon';
import { TrashIcon } from './icons/TrashIcon';
import WorkItemFormModal from './WorkItemFormModal';

interface WorkItemCatalogPageProps {
  workItems: WorkItem[];
  onAddOrUpdate: (item: Omit<WorkItem, 'id'> | WorkItem) => void;
  onDelete: (id: string) => void;
}

const frequencyMap: Record<NonNullable<WorkItem['frequency']>, string> = {
    daily: 'Hàng ngày',
    weekly: 'Hàng tuần',
    monthly: 'Hàng tháng',
    quarterly: 'Hàng quý',
    as_needed: 'Khi cần',
    replacement: 'Thay thế'
};

const WorkItemCatalogPage: React.FC<WorkItemCatalogPageProps> = ({ workItems, onAddOrUpdate, onDelete }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<WorkItem | null>(null);

  const handleOpenModal = (item?: WorkItem) => {
    setEditingItem(item || null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingItem(null);
    setIsModalOpen(false);
  };
  
  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-gray-600">Quản lý danh sách các công việc chuẩn để gán cho thiết bị.</p>
        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center gap-2 px-3 py-1.5 bg-black text-white rounded-md text-sm hover:bg-gray-800"
        >
          <PlusIcon /> Thêm Công việc
        </button>
      </div>
      <div className="overflow-x-auto border rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-white">
            <tr className="border-b-2 border-black">
              <th className="px-4 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Mô tả Công việc</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Tần suất</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-black uppercase tracking-wider w-32">Hành động</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {workItems.length > 0 ? workItems.map(item => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-black">{item.description}</td>
                <td className="px-4 py-3 text-sm text-black">{frequencyMap[item.frequency || 'daily']}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-4">
                    <button onClick={() => handleOpenModal(item)} className="text-gray-700 hover:text-black" title="Sửa"><EditIcon /></button>
                    <button onClick={() => onDelete(item.id)} className="text-gray-700 hover:text-black" title="Xóa"><TrashIcon /></button>
                  </div>
                </td>
              </tr>
            )) : (
                <tr>
                    <td colSpan={3} className="text-center p-8 text-gray-500">
                        Chưa có công việc nào trong danh mục.
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
      <WorkItemFormModal 
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={onAddOrUpdate}
        initialData={editingItem}
      />
    </>
  );
};

export default WorkItemCatalogPage;