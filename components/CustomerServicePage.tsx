import React, { useState, useMemo } from 'react';
import { CustomerFeedback } from '../types';
import { PlusIcon } from './icons/PlusIcon';
import { EditIcon } from './icons/EditIcon';
import { TrashIcon } from './icons/TrashIcon';

interface CustomerServicePageProps {
  feedbackItems: CustomerFeedback[];
  onAddOrUpdate: (item?: CustomerFeedback) => void;
  onDelete: (id: string) => void;
}

const formatDate = (dateString: string) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString + 'T00:00:00');
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

const CustomerServicePage: React.FC<CustomerServicePageProps> = ({ feedbackItems, onAddOrUpdate, onDelete }) => {
  const [activeTab, setActiveTab] = useState('feedback');
  const [filterText, setFilterText] = useState('');

  const filteredItems = useMemo(() => {
    if (!filterText) return feedbackItems;
    const lowerCaseFilter = filterText.toLowerCase();
    return feedbackItems.filter(item =>
      item.subject.toLowerCase().includes(lowerCaseFilter) ||
      item.customerInfo.toLowerCase().includes(lowerCaseFilter) ||
      item.personInCharge.toLowerCase().includes(lowerCaseFilter)
    );
  }, [feedbackItems, filterText]);

  const statusMap: Record<CustomerFeedback['status'], { text: string; color: string }> = {
    new: { text: 'Mới', color: 'bg-blue-100 text-blue-800' },
    in_progress: { text: 'Đang xử lý', color: 'bg-yellow-100 text-yellow-800' },
    resolved: { text: 'Đã giải quyết', color: 'bg-green-100 text-green-800' },
  };

  const TabButton: React.FC<{ tab: string; label: string }> = ({ tab, label }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`px-4 py-2 text-sm font-medium rounded-md ${activeTab === tab ? 'bg-blue-600 text-white shadow' : 'text-slate-600 bg-slate-100 hover:bg-slate-200'}`}
    >
      {label}
    </button>
  );

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-800">Dịch vụ Khách hàng</h2>
          <p className="text-sm text-slate-500 mt-1">Quản lý phản hồi, khiếu nại và khảo sát mức độ hài lòng.</p>
        </div>
        <button onClick={() => onAddOrUpdate()} className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700">
          <PlusIcon className="w-5 h-5 mr-2" />
          Ghi nhận Phản hồi
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-4 border-b border-slate-200 pb-4">
        <TabButton tab="feedback" label="Phản hồi & Khiếu nại" />
        <TabButton tab="surveys" label="Khảo sát Hài lòng" />
      </div>

      {activeTab === 'feedback' && (
        <>
          <div className="mb-4">
            <input
              type="text"
              placeholder="Tìm kiếm theo chủ đề, khách hàng, người phụ trách..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              className="block w-full max-w-lg rounded-md border border-slate-300 bg-white py-2 px-4 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-blue-500"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Ngày</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Chủ đề</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Loại</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Trạng thái</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Người phụ trách</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Hành động</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {filteredItems.length > 0 ? filteredItems.map(item => {
                  const status = statusMap[item.status];
                  const typeText = item.type === 'complaint' ? 'Khiếu nại' : 'Phản hồi';
                  const typeColor = item.type === 'complaint' ? 'text-red-600' : 'text-green-600';
                  return (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{formatDate(item.date)}</td>
                    <td className="px-6 py-4 text-sm text-slate-900 max-w-md">
                        <p className="font-medium truncate" title={item.subject}>{item.subject}</p>
                        <p className="text-xs text-slate-500 truncate">KH: {item.customerInfo}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">
                        <span className={typeColor}>{typeText}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                       <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${status.color}`}>
                            {status.text}
                        </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{item.personInCharge}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-4">
                        <button onClick={() => onAddOrUpdate(item)} className="text-blue-600 hover:text-blue-900" title="Xem chi tiết / Cập nhật"><EditIcon /></button>
                        <button onClick={() => onDelete(item.id)} className="text-red-600 hover:text-red-900" title="Xóa"><TrashIcon /></button>
                      </div>
                    </td>
                  </tr>
                )}) : (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-slate-500">
                      {feedbackItems.length === 0 ? "Chưa có phản hồi/khiếu nại nào." : "Không tìm thấy kết quả phù hợp."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {activeTab === 'surveys' && (
        <div className="text-center py-10 text-slate-500">
          <p>Chức năng Khảo sát Mức độ Hài lòng đang được phát triển.</p>
        </div>
      )}
    </div>
  );
};

export default CustomerServicePage;