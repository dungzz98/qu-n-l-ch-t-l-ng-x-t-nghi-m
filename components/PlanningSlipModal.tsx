
import React from 'react';
// FIX: The imported file './types' was not a module. With the new types.ts, this now works.
import { PlanningSlip } from '../types';
import { utils, writeFile } from 'xlsx';
import { PrintIcon } from './icons/PrintIcon';
import { ExportIcon } from './icons/ExportIcon';

interface PlanningSlipModalProps {
  slip: PlanningSlip | null;
  onClose: () => void;
}

const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const PlanningSlipModal: React.FC<PlanningSlipModalProps> = ({ slip, onClose }) => {
  if (!slip) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    const dataToExport = slip.items.map((item, index) => ({
      'STT': index + 1,
      'Tên hóa chất': item.name,
      'Số CAS': item.casNumber,
      'Số lượng cần đặt': item.quantity,
      'Đơn vị': item.unit,
      'Nhà cung cấp (gợi ý)': item.supplier,
      'Ghi chú': item.notes || '',
    }));
    const ws = utils.json_to_sheet(dataToExport);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, `PhieuDuTru_${slip.id}`);
    writeFile(wb, `Phieu_Du_tru_${slip.id}.xlsx`);
  };

  return (
    <>
      {/* Hidden printable area */}
      <div id="printable-slip-area" className="hidden">
        <div className="p-4 font-sans text-black">
          <header className="text-center mb-6">
            <h1 className="text-2xl font-bold uppercase">PHIẾU DỰ TRÙ HÓA CHẤT - VẬT TƯ</h1>
            <p className="text-lg">Số phiếu: <span className="font-semibold">{slip.id}</span></p>
          </header>
          <div className="mb-6 text-sm">
            <p><strong>Ngày lập phiếu:</strong> {formatDate(slip.createdAt)}</p>
            <p><strong>Người lập phiếu:</strong> {slip.createdBy}</p>
          </div>
          <table className="w-full border-collapse border border-black text-sm">
            <thead>
              <tr className="bg-slate-200">
                <th className="border border-black p-2 w-12">STT</th>
                <th className="border border-black p-2">Tên hóa chất</th>
                <th className="border border-black p-2">Số CAS</th>
                <th className="border border-black p-2">Số lượng</th>
                <th className="border border-black p-2">Đơn vị</th>
                <th className="border border-black p-2">Nhà cung cấp</th>
                <th className="border border-black p-2">Ghi chú</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black">
              {slip.items.map((item, index) => (
                <tr key={index}>
                  <td className="border border-black p-2 text-center">{index + 1}</td>
                  <td className="border border-black p-2">{item.name}</td>
                  <td className="border border-black p-2">{item.casNumber}</td>
                  <td className="border border-black p-2 text-center">{item.quantity}</td>
                  <td className="border border-black p-2 text-center">{item.unit}</td>
                  <td className="border border-black p-2">{item.supplier}</td>
                  <td className="border border-black p-2">{item.notes || ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
           <footer className="mt-8">
            <div className="flex justify-around text-center">
                <div>
                    <p className="font-bold">Người lập phiếu</p>
                    <div className="mt-20 font-bold">{slip.createdBy}</div>
                </div>
                 <div>
                    <p className="font-bold">Trưởng khoa Dược</p>
                     <div className="mt-20 font-bold"></div>
                </div>
                <div>
                    <p className="font-bold">Trưởng khoa</p>
                    <div className="mt-20 font-bold"></div>
                </div>
            </div>
        </footer>
        </div>
      </div>

      {/* Visible Modal */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
        <div className="bg-white rounded-lg shadow-xl p-6 m-4 w-full max-w-4xl max-h-[90vh] flex flex-col">
          <div className="flex justify-between items-center border-b pb-3">
            <div>
              <h2 className="text-xl font-semibold text-slate-700">Chi tiết Phiếu dự trù</h2>
              <p className="text-sm text-slate-500">Số phiếu: {slip.id}</p>
            </div>
            <button onClick={onClose} className="text-slate-500 hover:text-slate-800 text-3xl leading-none">&times;</button>
          </div>

          <div className="mt-4 flex-grow overflow-y-auto">
            <div className="text-sm mb-4">
              <p><strong>Ngày lập phiếu:</strong> {formatDate(slip.createdAt)}</p>
              <p><strong>Người lập phiếu:</strong> {slip.createdBy}</p>
            </div>
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">STT</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Tên hóa chất</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Số CAS</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Số lượng</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Đơn vị</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Nhà cung cấp</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Ghi chú</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100">
                {slip.items.map((item, index) => (
                  <tr key={index}>
                    <td className="px-4 py-2 text-sm">{index + 1}</td>
                    <td className="px-4 py-2 text-sm font-medium">{item.name}</td>
                    <td className="px-4 py-2 text-sm">{item.casNumber}</td>
                    <td className="px-4 py-2 text-sm">{item.quantity}</td>
                    <td className="px-4 py-2 text-sm">{item.unit}</td>
                    <td className="px-4 py-2 text-sm">{item.supplier}</td>
                    <td className="px-4 py-2 text-sm">{item.notes || ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 flex justify-between items-center border-t pt-4">
            <div className="flex gap-2">
              <button onClick={handlePrint} className="inline-flex items-center gap-2 px-4 py-2 bg-slate-600 text-white rounded-md hover:bg-slate-700">
                <PrintIcon/> In phiếu
              </button>
              <button onClick={handleExport} className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700">
                <ExportIcon/> Xuất Excel
              </button>
            </div>
            <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300">
              Đóng
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default PlanningSlipModal;
