import React, { useState, useMemo, useEffect, useRef } from 'react';
// FIX: The imported file './types' was not a module. With the new types.ts, this now works.
import { Chemical } from '../types';
import { EditIcon } from './icons/EditIcon';
import { TrashIcon } from './icons/TrashIcon';
import { SafetyIcon } from './icons/SafetyIcon';
import { AdjustIcon } from './icons/AdjustIcon';
import { HistoryIcon } from './icons/HistoryIcon';
import { SortIcon } from './icons/SortIcon';
import SortModal, { SortConfig } from './SortModal';
import { BarcodeIcon } from './icons/BarcodeIcon';
import { DocumentTextIcon } from './icons/DocumentTextIcon';
import { WarningIcon } from './icons/WarningIcon';


interface InventoryTableProps {
  chemicals: Chemical[];
  onEdit: (chemical: Chemical) => void;
  onDelete: (id: string) => void;
  onGetSafetyInfo: (chemical: Chemical) => void;
  onOpenAdjustModal: (chemical: Chemical) => void;
  onOpenUsageLog: (chemical: Chemical) => void;
  onOpenBarcodeModal: (chemical: Chemical) => void;
  onOpenSafetyDoc: (chemical: Chemical) => void;
  focusedItemId: string | null;
}

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
    // Appending 'T00:00:00' ensures the date is parsed in the local timezone.
    const expiration = new Date(chemical.expirationDate + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to the beginning of the day for accurate comparison.
    
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);
    thirtyDaysFromNow.setHours(0, 0, 0, 0);

    if (chemical.quantity <= 0) {
        return { 
            text: 'Hết hàng', 
            color: 'bg-slate-200 text-slate-800',
            rowClass: 'bg-slate-50 opacity-70',
            icon: null 
        };
    }
    if (expiration < today) {
        return { 
            text: 'Hết hạn', 
            color: 'bg-red-100 text-red-800',
            rowClass: 'bg-red-50',
            icon: 'expired' as const
        };
    }
    if (expiration <= thirtyDaysFromNow) {
        return { 
            text: 'Sắp hết hạn', 
            color: 'bg-yellow-100 text-yellow-800',
            rowClass: 'bg-yellow-50',
            icon: 'expiring' as const
        };
    }
    return { 
        text: 'Còn hàng', 
        color: 'bg-green-100 text-green-800',
        rowClass: '',
        icon: null
    };
};

const STATUS_OPTIONS = ['Còn hàng', 'Sắp hết hạn', 'Hết hạn', 'Hết hàng'];

type SortableKeys = keyof Pick<Chemical, 'name' | 'casNumber' | 'lotNumber' | 'quantity' | 'expirationDate' | 'barcode'>;


const InventoryTable: React.FC<InventoryTableProps> = ({ chemicals, onEdit, onDelete, onGetSafetyInfo, onOpenAdjustModal, onOpenUsageLog, onOpenBarcodeModal, onOpenSafetyDoc, focusedItemId }) => {
  const [filter, setFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [sortConfigs, setSortConfigs] = useState<SortConfig[]>([]);
  const [isSortModalOpen, setIsSortModalOpen] = useState(false);
  const rowRefs = useRef<Record<string, HTMLTableRowElement | null>>({});

  useEffect(() => {
    if (focusedItemId && rowRefs.current[focusedItemId]) {
        rowRefs.current[focusedItemId]?.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
        });
    }
  }, [focusedItemId]);

  const storageLocations = useMemo(() => {
      const locations = new Set(chemicals.map(c => c.storageLocation).filter(Boolean));
      return Array.from(locations).sort();
  }, [chemicals]);

  const filteredChemicals = useMemo(() => {
    const lowerCaseFilter = filter.toLowerCase();
    return chemicals.filter(c => {
      const matchesText = 
        String(c.name || '').toLowerCase().includes(lowerCaseFilter) ||
        String(c.casNumber || '').toLowerCase().includes(lowerCaseFilter) ||
        String(c.lotNumber || '').toLowerCase().includes(lowerCaseFilter) ||
        String(c.barcode || '').toLowerCase().includes(lowerCaseFilter);
      
      const status = getStatus(c).text;
      const matchesStatus = !statusFilter || status === statusFilter;

      const matchesLocation = !locationFilter || c.storageLocation === locationFilter;

      return matchesText && matchesStatus && matchesLocation;
    });
  }, [chemicals, filter, statusFilter, locationFilter]);

  const sortedChemicals = useMemo(() => {
    let sortableItems = [...filteredChemicals];
    if (sortConfigs.length > 0) {
      sortableItems.sort((a, b) => {
        for (const config of sortConfigs) {
          const valA = a[config.key];
          const valB = b[config.key];
          
          let comparison = 0;
          if (typeof valA === 'string' && typeof valB === 'string') {
              comparison = valA.localeCompare(valB, 'vi');
          } else if (valA < valB) {
              comparison = -1;
          } else if (valA > valB) {
              comparison = 1;
          }

          if (comparison !== 0) {
              return config.direction === 'asc' ? comparison : -comparison;
          }
        }
        return 0;
      });
    }
    return sortableItems;
  }, [filteredChemicals, sortConfigs]);

  const getSortIndicator = (key: SortableKeys) => {
    const config = sortConfigs.find(c => c.key === key);
    if (!config) return null;
    const index = sortConfigs.findIndex(c => c.key === key);
    const directionArrow = config.direction === 'asc' ? '▲' : '▼';
    return (
        <span className="ml-1 text-xs font-bold text-blue-600">
            {directionArrow}
            <span className="ml-0.5 text-[10px] bg-blue-100 text-blue-700 rounded-full px-1.5 py-0.5">{index + 1}</span>
        </span>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <div className="relative md:col-span-1">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <svg className="h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Tìm kiếm..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="block w-full rounded-md border border-slate-300 bg-white py-2 pl-10 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:text-sm sm:leading-6"
          />
        </div>
        <select 
            value={statusFilter} 
            onChange={e => setStatusFilter(e.target.value)}
            className="p-2 border border-slate-300 rounded-md bg-white text-slate-900 focus:ring-blue-500 focus:border-blue-500"
        >
            <option value="">Tất cả trạng thái</option>
            {STATUS_OPTIONS.map(status => <option key={status} value={status}>{status}</option>)}
        </select>
        <select 
            value={locationFilter} 
            onChange={e => setLocationFilter(e.target.value)}
            className="p-2 border border-slate-300 rounded-md bg-white text-slate-900 focus:ring-blue-500 focus:border-blue-500"
        >
            <option value="">Tất cả vị trí</option>
            {storageLocations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
        </select>
         <button
            onClick={() => setIsSortModalOpen(true)}
            className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
        >
            <SortIcon className="w-5 h-5 mr-2" />
            Sắp xếp
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              {['Số CAS', 'Tên hóa chất', 'Số lô', 'Mã Barcode', 'Số lượng', 'HSD', 'Người cập nhật cuối', 'Trạng thái', 'Đánh giá chất lượng', 'Hành động'].map((header, index) => {
                 const sortableKeys: (SortableKeys | null)[] = ['casNumber', 'name', 'lotNumber', 'barcode', 'quantity', 'expirationDate', null, null, null, null];
                 const sortKey = sortableKeys[index];
                 return (
                 <th key={header} scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                   {header}{sortKey && getSortIndicator(sortKey)}
                 </th>
                 )
              })}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {sortedChemicals.length > 0 ? sortedChemicals.map(chemical => {
              const status = getStatus(chemical);
              const sortedLog = chemical.usageLog 
                  ? [...chemical.usageLog].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) 
                  : [];
              const latestLog = sortedLog[0];
              const lastUpdater = latestLog?.person 
                  || (latestLog?.reason?.includes('Nhập kho') ? chemical.personReceived : 'N/A');
              
              const isFocused = chemical.id === focusedItemId;

              return (
                <tr 
                    key={chemical.id} 
                    ref={el => rowRefs.current[chemical.id] = el}
                    className={`transition-colors duration-200 hover:bg-slate-100 ${status.rowClass} ${isFocused ? 'animate-pulse-yellow' : ''}`}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{chemical.casNumber}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-slate-900">{chemical.name}</div>
                      <div className="text-sm text-slate-500">{chemical.supplier}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{chemical.lotNumber}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 font-mono">{chemical.barcode}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{chemical.quantity} {chemical.unit}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    <div className="flex items-center gap-1">
                        {status.icon && (
                            // FIX: Wrap WarningIcon in a span with a title attribute to show tooltip, fixing prop type error.
                            <span title={status.icon === 'expired' ? 'Đã hết hạn' : 'Sắp hết hạn'}>
                                <WarningIcon 
                                    className={`w-5 h-5 ${status.icon === 'expired' ? 'text-red-500' : 'text-yellow-500'}`}
                                />
                            </span>
                        )}
                        <span>{formatDate(chemical.expirationDate)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{lastUpdater}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${status.color}`}>
                      {status.text}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 max-w-xs truncate" title={chemical.qualityAssessment}>
                    {chemical.qualityAssessment || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center gap-3">
                        <button onClick={() => onOpenBarcodeModal(chemical)} className="text-gray-600 hover:text-gray-900" title="In mã barcode"><BarcodeIcon /></button>
                        <button onClick={() => onOpenUsageLog(chemical)} className="text-gray-600 hover:text-gray-900" title="Lịch sử sử dụng"><HistoryIcon /></button>
                        <button onClick={() => onOpenAdjustModal(chemical)} className="text-sky-600 hover:text-sky-900" title="Điều chỉnh số lượng"><AdjustIcon /></button>
                        <button onClick={() => onGetSafetyInfo(chemical)} className="text-indigo-600 hover:text-indigo-900" title="Thông tin an toàn (AI)"><SafetyIcon /></button>
                        <button onClick={() => onOpenSafetyDoc(chemical)} disabled={!chemical.safetyDocBase64} className="text-teal-600 hover:text-teal-900 disabled:text-slate-300 disabled:cursor-not-allowed" title="Xem tài liệu"><DocumentTextIcon /></button>
                        <button onClick={() => onEdit(chemical)} className="text-blue-600 hover:text-blue-900" title="Chỉnh sửa"><EditIcon /></button>
                        <button onClick={() => onDelete(chemical.id)} className="text-red-600 hover:text-red-900" title="Xóa"><TrashIcon /></button>
                    </div>
                  </td>
                </tr>
              );
            }) : (
              <tr>
                <td colSpan={10} className="text-center py-10 text-slate-500">
                  Không tìm thấy hóa chất nào phù hợp.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <SortModal
        isOpen={isSortModalOpen}
        onClose={() => setIsSortModalOpen(false)}
        onApply={setSortConfigs}
        currentConfigs={sortConfigs}
      />
    </div>
  );
};

export default InventoryTable;