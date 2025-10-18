// FIX: Fixed incorrect React import statement.
import React from 'react';
import { PreventiveActionReport } from '../types';
import { PlusIcon } from './icons/PlusIcon';
import { EditIcon } from './icons/EditIcon';
import { TrashIcon } from './icons/TrashIcon';
import { DocumentArrowDownIcon } from './icons/DocumentArrowDownIcon';

interface PreventiveActionsPageProps {
  reports: PreventiveActionReport[];
  onAddOrUpdate: (item: PreventiveActionReport | null) => void;
  onDelete: (id: string) => void;
  onExportToDoc: (item: PreventiveActionReport) => void;
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

const PreventiveActionsPage: React.FC<PreventiveActionsPageProps> = ({ reports, onAddOrUpdate, onDelete, onExportToDoc }) => {
  
  return (
    <div>
      <div className="flex flex-wrap justify-between items-center mb-4 gap-4">
        <p className="text-sm text-slate-500">
          Quản lý các hành động phòng ngừa để loại bỏ nguyên nhân của các sự không phù hợp tiềm tàng.
        </p>
        <button onClick={() => onAddOrUpdate(null)} className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700">
            <PlusIcon className="w-5 h-5 mr-2" />
            Ghi nhận HĐ Phòng ngừa
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Số HĐPN</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Vấn đề</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Người thực hiện</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Ngày TH</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Trạng thái</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Hành động</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {reports.length > 0 ? reports.map(item => {
              const isEvaluated = !!item.effectiveness;
              const status = isEvaluated
                ? { text: 'Đã đánh giá', color: 'bg-green-100 text-green-800' }
                : { text: 'Đang theo dõi', color: 'bg-yellow-100 text-yellow-800' };

              return (
              <tr key={item.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-700">{item.reportId}</td>
                  <td className="px-6 py-4 text-sm text-slate-900 max-w-sm" title={item.problemDescription}>
                      <p className="truncate font-medium">{item.problemDescription}</p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{item.executor}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{formatDate(item.executionDate)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${status.color}`}>
                          {status.text}
                      </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center gap-4">
                      <button onClick={() => onExportToDoc(item)} className="text-gray-600 hover:text-gray-900" title="Xuất phiếu (.doc)"><DocumentArrowDownIcon/></button>
                      <button onClick={() => onAddOrUpdate(item)} className="text-blue-600 hover:text-blue-900" title="Xem chi tiết / Cập nhật"><EditIcon /></button>
                      <button onClick={() => onDelete(item.id)} className="text-red-600 hover:text-red-900" title="Xóa"><TrashIcon /></button>
                  </div>
                  </td>
              </tr>
              )}) : (
              <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-500">
                  Chưa có hành động phòng ngừa nào được ghi nhận.
                  </td>
              </tr>
              )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PreventiveActionsPage;