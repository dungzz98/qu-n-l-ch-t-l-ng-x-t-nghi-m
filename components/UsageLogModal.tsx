
import React from 'react';
// FIX: The imported file './types' was not a module. With the new types.ts, this now works.
import { Chemical } from '../types';

interface UsageLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  chemical: Chemical | null;
}

const formatDate = (dateString: string) => {
  if (!dateString) return 'N/A';
  // Handles both 'YYYY-MM-DD' and full ISO strings by taking the date part.
  // Appending 'T00:00:00' ensures the date string is parsed in the user's local timezone,
  // preventing it from shifting to the previous day in timezones west of UTC.
  const date = new Date(dateString.split('T')[0] + 'T00:00:00');
  return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
  });
};


const UsageLogModal: React.FC<UsageLogModalProps> = ({ isOpen, onClose, chemical }) => {
  if (!isOpen || !chemical) return null;
  
  const sortedLog = chemical.usageLog ? [...chemical.usageLog].sort((a, b) => {
    const dateB = new Date(b.date.split('T')[0] + 'T00:00:00').getTime();
    const dateA = new Date(a.date.split('T')[0] + 'T00:00:00').getTime();
    return dateB - dateA;
  }) : [];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white rounded-lg shadow-xl p-6 m-4 w-full max-w-3xl max-h-[80vh] flex flex-col">
        <div className="flex justify-between items-center border-b pb-3">
          <h2 className="text-xl font-semibold text-slate-700">
            Lịch sử sử dụng: <span className="font-bold text-blue-700">{chemical.name}</span>
          </h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-800 text-3xl leading-none">&times;</button>
        </div>
        <div className="mt-4 flex-grow overflow-y-auto">
            {sortedLog && sortedLog.length > 0 ? (
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50 sticky top-0">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Ngày</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Lý do</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Người thực hiện</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Người nhận Hóa chất</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Thay đổi</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Số lượng còn lại</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                        {sortedLog.map((log, index) => (
                            <tr key={index} className="hover:bg-slate-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{formatDate(log.date)}</td>
                                <td className="px-6 py-4 text-sm text-slate-800">{log.reason}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{log.person || 'N/A'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{log.recipient || ''}</td>
                                <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${log.quantityChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {log.quantityChange >= 0 ? '+' : ''}{log.quantityChange} {chemical.unit}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{log.newQuantity} {chemical.unit}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p className="text-center text-slate-500 py-8">Chưa có lịch sử sử dụng cho hóa chất này.</p>
            )}
        </div>
        <div className="mt-6 flex justify-end">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Đóng</button>
        </div>
      </div>
    </div>
  );
};

export default UsageLogModal;