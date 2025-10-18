import React, { useState, useMemo } from 'react';
import { ImprovementInitiative } from '../types';
import { PlusIcon } from './icons/PlusIcon';
import { EditIcon } from './icons/EditIcon';
import { TrashIcon } from './icons/TrashIcon';

interface ContinuousImprovementPageProps {
  initiatives: ImprovementInitiative[];
  onAddOrUpdate: (item?: ImprovementInitiative) => void;
  onDelete: (id: string) => void;
}

const formatDate = (dateString?: string) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString + 'T00:00:00');
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

const ContinuousImprovementPage: React.FC<ContinuousImprovementPageProps> = ({ initiatives, onAddOrUpdate, onDelete }) => {
  const [filterText, setFilterText] = useState('');
  
  const filteredItems = useMemo(() => {
    if (!filterText) return initiatives;
    const lowerCaseFilter = filterText.toLowerCase();
    return initiatives.filter(item =>
      item.title.toLowerCase().includes(lowerCaseFilter) ||
      item.proposedBy.toLowerCase().includes(lowerCaseFilter)
    );
  }, [initiatives, filterText]);
  
  const statusMap: Record<ImprovementInitiative['status'], { text: string; color: string }> = {
    proposed: { text: 'Đề xuất', color: 'bg-blue-100 text-blue-800' },
    in_progress: { text: 'Đang thực hiện', color: 'bg-yellow-100 text-yellow-800' },
    completed: { text: 'Hoàn thành', color: 'bg-green-100 text-green-800' },
    canceled: { text: 'Đã hủy', color: 'bg-slate-100 text-slate-800' },
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-800">Quản lý Cải tiến Liên tục</h2>
          <p className="text-sm text-slate-500 mt-1">Theo dõi các sáng kiến và hoạt động cải tiến chất lượng.</p>
        </div>
        <button onClick={() => onAddOrUpdate()} className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700">
          <PlusIcon className="w-5 h-5 mr-2" />
          Thêm Sáng kiến
        </button>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Tìm kiếm theo tên sáng kiến, người đề xuất..."
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          className="block w-full max-w-lg rounded-md border border-slate-300 bg-white py-2 px-4 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-blue-500"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Tên Sáng kiến / Hoạt động</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Ngày đề xuất</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Người đề xuất</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Trạng thái</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Hành động</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {filteredItems.length > 0 ? filteredItems.map(item => {
              const status = statusMap[item.status];
              return (
              <tr key={item.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 text-sm text-slate-900 max-w-md">
                    <p className="font-medium truncate" title={item.title}>{item.title}</p>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{formatDate(item.proposedDate)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{item.proposedBy}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                   <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${status.color}`}>
                        {status.text}
                    </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center gap-4">
                    <button onClick={() => onAddOrUpdate(item)} className="text-blue-600 hover:text-blue-900" title="Xem chi tiết / Cập nhật"><EditIcon /></button>
                    <button onClick={() => onDelete(item.id)} className="text-red-600 hover:text-red-900" title="Xóa"><TrashIcon /></button>
                  </div>
                </td>
              </tr>
            )}) : (
              <tr>
                <td colSpan={5} className="text-center py-10 text-slate-500">
                  {initiatives.length === 0 ? "Chưa có hoạt động cải tiến nào." : "Không tìm thấy kết quả phù hợp."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ContinuousImprovementPage;
