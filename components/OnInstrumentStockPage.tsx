

import React, { useMemo, useState } from 'react';
import { Instrument, OnInstrumentStock, Chemical } from '../types';
import { AdjustIcon } from './icons/AdjustIcon';
import { ArrowRightLeftIcon } from './icons/ArrowRightLeftIcon';
import { FireIcon } from './icons/FireIcon';

interface OnInstrumentStockPageProps {
  onInstrumentStock: OnInstrumentStock[];
  instruments: Instrument[];
  chemicals: Chemical[];
  onAdjust: (stock: OnInstrumentStock, action: 'use' | 'return' | 'discard') => void;
}

const formatDate = (dateString?: string) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString.split('T')[0] + 'T00:00:00');
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

const getExpirationStatus = (expDateString?: string) => {
    if (!expDateString) return null;
    const today = new Date();
    today.setHours(0,0,0,0);
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);
    
    const expDate = new Date(expDateString.split('T')[0] + 'T00:00:00');

    if (expDate < today) {
        return { text: 'Hết hạn', color: 'text-red-600', isExpired: true };
    }
    if (expDate < thirtyDaysFromNow) {
        return { text: 'Sắp hết hạn', color: 'text-yellow-600', isExpired: false };
    }
    return null;
}

const OnInstrumentStockPage: React.FC<OnInstrumentStockPageProps> = ({ onInstrumentStock, instruments, chemicals, onAdjust }) => {
  const [filterText, setFilterText] = useState('');
  const [instrumentFilter, setInstrumentFilter] = useState('');
  
  const enrichedStock = useMemo(() => {
      const chemicalMap = new Map<string, Chemical>(chemicals.map(c => [c.id, c]));
      const instrumentMap = new Map<string, Instrument>(instruments.map(i => [i.id, i]));

      return onInstrumentStock.map(stock => {
        const chemical = chemicalMap.get(stock.chemicalId);
        const instrument = instrumentMap.get(stock.instrumentId);
        return {
          ...stock,
          barcode: chemical?.barcode || 'N/A',
          instrumentName: instrument?.name || 'Không xác định',
        };
      }).sort((a,b) => a.instrumentName.localeCompare(b.instrumentName) || a.chemicalName.localeCompare(b.chemicalName));
  }, [onInstrumentStock, chemicals, instruments]);
  
  const filteredStock = useMemo(() => {
    const lowerCaseFilter = filterText.toLowerCase();
    return enrichedStock.filter(stock => {
        const matchesInstrument = !instrumentFilter || stock.instrumentId === instrumentFilter;
        
        const matchesText = !lowerCaseFilter ||
            stock.chemicalName.toLowerCase().includes(lowerCaseFilter) ||
            stock.lotNumber.toLowerCase().includes(lowerCaseFilter) ||
            stock.barcode.toLowerCase().includes(lowerCaseFilter);
        
        return matchesInstrument && matchesText;
    });
  }, [enrichedStock, filterText, instrumentFilter]);


  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold text-slate-800">Danh sách Hóa chất trên Máy</h2>
        <p className="text-sm text-slate-500 mt-1 mb-6">
          Xem danh sách toàn bộ hóa chất đang được lưu trữ và sử dụng trên các máy xét nghiệm khác nhau.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input
              type="text"
              placeholder="Tìm theo tên, lô, barcode..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              className="block w-full rounded-md border border-slate-300 bg-white py-2.5 px-4 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:text-sm sm:leading-6"
            />
             <select
                value={instrumentFilter}
                onChange={(e) => setInstrumentFilter(e.target.value)}
                className="block w-full rounded-md border border-slate-300 bg-white py-2.5 px-3 text-slate-900 focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:text-sm sm:leading-6"
                aria-label="Lọc theo máy xét nghiệm"
            >
                <option value="">Tất cả máy xét nghiệm</option>
                {instruments.map(inst => (
                    <option key={inst.id} value={inst.id}>{inst.name}</option>
                ))}
            </select>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Hóa chất</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Số lô / Barcode</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Máy xét nghiệm</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Số lượng còn lại</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">HSD sau mở nắp</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Hành động</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {filteredStock.length > 0 ? filteredStock.map(stock => {
                const status = getExpirationStatus(stock.openVialExpiration);
                const rowClass = status?.isExpired ? 'bg-red-50' : (status ? 'animate-pulse-yellow' : '');
                
                return (
                  <tr key={stock.id} className={`hover:bg-slate-50 ${rowClass}`}>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{stock.chemicalName}</td>
                    <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-500">Lô: {stock.lotNumber}</div>
                        <div className="text-sm text-slate-500 font-mono">{stock.barcode}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-sky-700">{stock.instrumentName}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-semibold text-slate-700">{stock.quantity} {stock.unit}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-500">
                       {formatDate(stock.openVialExpiration)}
                       {status && <span className={`ml-2 block text-xs font-bold ${status.color}`}>({status.text})</span>}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                       <div className="flex items-center gap-2">
                         <button onClick={() => onAdjust(stock, 'use')} className="flex items-center gap-1 text-amber-600 hover:text-amber-800 p-1 rounded hover:bg-amber-100" title="Sử dụng"><AdjustIcon className="w-4 h-4"/> <span>Sử dụng</span></button>
                         <button onClick={() => onAdjust(stock, 'return')} className="flex items-center gap-1 text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-100" title="Trả về kho"><ArrowRightLeftIcon className="w-4 h-4"/> <span>Trả kho</span></button>
                         <button onClick={() => onAdjust(stock, 'discard')} className="flex items-center gap-1 text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-100" title="Hủy bỏ"><FireIcon className="w-4 h-4"/> <span>Hủy</span></button>
                       </div>
                    </td>
                  </tr>
                )
              }) : (
                 <tr>
                    <td colSpan={6} className="text-center py-10 text-slate-500">
                        {onInstrumentStock.length === 0 ? "Chưa có hóa chất nào được chuyển lên máy." : "Không tìm thấy hóa chất phù hợp với bộ lọc."}
                    </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
  );
};

export default OnInstrumentStockPage;