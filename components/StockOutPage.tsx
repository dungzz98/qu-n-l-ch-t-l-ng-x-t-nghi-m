

import React, { useState, useMemo } from 'react';
// FIX: The imported file './types' was not a module. With the new types.ts, this now works.
import { Chemical } from '../types';
import { ArrowRightLeftIcon } from './icons/ArrowRightLeftIcon';

interface StockOutPageProps {
  chemicals: Chemical[];
  onRecordUsage: (chemical: Chemical) => void;
  onOpenMoveToInstrumentModal: (chemical: Chemical) => void;
}

// Helper functions copied from InventoryTable.tsx for consistency
const formatDate = (dateString: string) => {
  if (!dateString) return 'N/A';
  // Appending 'T00:00:00' ensures the date string is parsed in the user's local timezone,
  // preventing it from shifting to the previous day in timezones west of UTC.
  const date = new Date(dateString + 'T00:00:00');
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

const getStatus = (chemical: Chemical) => {
    const expiration = new Date(chemical.expirationDate);
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);

    if (chemical.quantity === 0) {
        return { text: 'Hết hàng', color: 'bg-slate-200 text-slate-800' };
    }
    if (expiration < today) {
        return { text: 'Hết hạn', color: 'bg-red-100 text-red-800' };
    }
    if (expiration < thirtyDaysFromNow) {
        return { text: 'Sắp hết hạn', color: 'bg-yellow-100 text-yellow-800' };
    }
    return { text: 'Còn hàng', color: 'bg-green-100 text-green-800' };
};


const StockOutPage: React.FC<StockOutPageProps> = ({ chemicals, onRecordUsage, onOpenMoveToInstrumentModal }) => {
  const [filter, setFilter] = useState('');

  const availableChemicals = useMemo(() => {
    const lowerCaseFilter = filter.toLowerCase();
    return chemicals
      .filter(c => c.quantity > 0) // Only show chemicals that are in stock
      .filter(c => 
        String(c.name || '').toLowerCase().includes(lowerCaseFilter) ||
        String(c.casNumber || '').toLowerCase().includes(lowerCaseFilter) ||
        String(c.lotNumber || '').toLowerCase().includes(lowerCaseFilter) ||
        String(c.barcode || '').toLowerCase().includes(lowerCaseFilter)
      );
  }, [chemicals, filter]);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4 text-slate-800">Xuất kho / Ghi nhận sử dụng</h2>
      <div className="mb-6 relative w-full max-w-lg">
         <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <svg className="h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
            </svg>
          </div>
        <input
          type="text"
          placeholder="Tìm kiếm hóa chất..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="block w-full rounded-md border border-slate-300 bg-white py-2.5 pl-10 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:text-sm sm:leading-6"
        />
      </div>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                {['Số CAS', 'Tên hóa chất', 'Số lô', 'Mã Barcode', 'Số lượng còn lại', 'HSD', 'Hành động'].map(header => (
                  <th key={header} scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {availableChemicals.length > 0 ? availableChemicals.map(chemical => {
                const status = getStatus(chemical);
                
                return (
                  <tr key={chemical.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{chemical.casNumber}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-slate-900">{chemical.name}</div>
                      <div className="text-sm text-slate-500">{chemical.supplier}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{chemical.lotNumber}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 font-mono">{chemical.barcode}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-700">{chemical.quantity} {chemical.unit}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{formatDate(chemical.expirationDate)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-left text-sm font-medium">
                        <div className="flex items-center gap-2">
                           <button
                              onClick={() => onRecordUsage(chemical)}
                              className="inline-flex items-center justify-center rounded-md border border-transparent bg-amber-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-amber-700"
                            >
                              Sử dụng
                            </button>
                             <button
                                onClick={() => onOpenMoveToInstrumentModal(chemical)}
                                className="inline-flex items-center justify-center rounded-md border border-sky-600 bg-sky-50 px-3 py-2 text-sm font-medium text-sky-700 shadow-sm hover:bg-sky-100"
                                title="Chuyển hóa chất này lên máy xét nghiệm"
                            >
                                <ArrowRightLeftIcon className="w-4 h-4 mr-2" />
                                Chuyển lên máy
                            </button>
                        </div>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-500">
                    Không tìm thấy hóa chất nào còn hàng phù hợp.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StockOutPage;