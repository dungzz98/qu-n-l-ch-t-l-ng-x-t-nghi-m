import React, { useState, useMemo } from 'react';
// FIX: The imported file './types' was not a module. With the new types.ts, this now works.
import { Chemical, User, StorageLocation, Instrument } from '../types';

interface PhysicalCountPageProps {
  chemicals: Chemical[];
  onUpdate: (chemicalId: string, actualQuantity: number, person: string) => void;
  currentUser: User | null;
  storageLocations: StorageLocation[];
  instruments: Instrument[];
}

interface CountState {
  [key: string]: string;
}

const PhysicalCountPage: React.FC<PhysicalCountPageProps> = ({ chemicals, onUpdate, currentUser, storageLocations, instruments }) => {
  const [counts, setCounts] = useState<CountState>({});
  const [filterText, setFilterText] = useState('');
  const [locationFilter, setLocationFilter] = useState('');

  const allLocations = useMemo(() => {
    const storageNames = storageLocations.map(loc => loc.name);
    const instrumentNames = instruments.map(inst => inst.name);
    return Array.from(new Set([...storageNames, ...instrumentNames])).sort((a,b) => a.localeCompare(b, 'vi'));
  }, [storageLocations, instruments]);

  const handleInputChange = (id: string, value: string) => {
    setCounts(prev => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleConfirm = (chemical: Chemical) => {
    const actual = counts[chemical.id];
    if (actual && actual.trim() !== '' && currentUser) {
      const actualQuantity = parseFloat(actual);
      if (!isNaN(actualQuantity) && actualQuantity >= 0) {
        onUpdate(chemical.id, actualQuantity, currentUser.fullName);
        setCounts(prev => {
            const newCounts = {...prev};
            delete newCounts[chemical.id];
            return newCounts;
        });
      } else {
        alert('Số lượng thực tế không hợp lệ.');
      }
    } else {
      alert('Vui lòng nhập số lượng thực tế.');
    }
  };

  const filteredChemicals = useMemo(() => {
    const lowerCaseFilter = filterText.toLowerCase();
    return chemicals.filter(c => {
      const matchesText = !lowerCaseFilter || 
        c.name.toLowerCase().includes(lowerCaseFilter) ||
        c.casNumber.toLowerCase().includes(lowerCaseFilter) ||
        c.lotNumber.toLowerCase().includes(lowerCaseFilter) ||
        c.barcode.toLowerCase().includes(lowerCaseFilter);
        
      const matchesLocation = !locationFilter || c.storageLocation === locationFilter;

      return matchesText && matchesLocation;
    });
  }, [chemicals, filterText, locationFilter]);

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-xl font-semibold mb-1 text-slate-800">Kiểm kê Kho</h2>
      <p className="text-sm text-slate-500 mb-4">
        Nhập số lượng thực tế trong kho để đối chiếu và cập nhật hệ thống. Người kiểm kê: <span className="font-semibold">{currentUser?.fullName}</span>
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="relative">
          <input
              type="text"
              placeholder="Tìm kiếm hóa chất..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              className="block w-full rounded-md border border-slate-300 bg-white py-2.5 pl-4 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:text-sm sm:leading-6"
          />
        </div>
         <div>
            <select
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="block w-full rounded-md border border-slate-300 bg-white py-2.5 px-3 text-slate-900 focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:text-sm sm:leading-6"
                aria-label="Lọc theo vị trí"
            >
                <option value="">Tất cả vị trí</option>
                {allLocations.map(loc => (
                    <option key={loc} value={loc}>{loc}</option>
                ))}
            </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Hóa chất</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Số lô</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Mã Barcode</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Tồn kho Hệ thống</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Tồn kho Thực tế</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Chênh lệch</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Hành động</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {filteredChemicals.map(chemical => {
              const actual = counts[chemical.id] || '';
              const actualQty = parseFloat(actual);
              const difference = (actual.trim() !== '' && !isNaN(actualQty)) ? actualQty - chemical.quantity : null;
              
              let differenceColor = 'text-slate-500';
              if (difference !== null) {
                if (difference > 0) differenceColor = 'text-green-600';
                if (difference < 0) differenceColor = 'text-red-600';
              }

              return (
                <tr key={chemical.id} className="hover:bg-slate-50">
                  <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-slate-900">{chemical.name}</div>
                      <div className="text-sm text-slate-500">CAS: {chemical.casNumber}</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-500">{chemical.lotNumber}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-500 font-mono">{chemical.barcode}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-semibold text-slate-700">{chemical.quantity} {chemical.unit}</td>
                  <td className="px-4 py-4">
                    <input
                      type="number"
                      value={actual}
                      onChange={(e) => handleInputChange(chemical.id, e.target.value)}
                      className="w-32 p-2 border border-slate-300 rounded-md shadow-sm bg-white text-slate-900 placeholder:text-slate-400 focus:ring-blue-500 focus:border-blue-500"
                      placeholder={`Số lượng (${chemical.unit})`}
                      min="0"
                      step="any"
                    />
                  </td>
                  <td className={`px-4 py-4 whitespace-nowrap text-sm font-bold ${differenceColor}`}>
                    {difference !== null ? `${difference > 0 ? '+' : ''}${difference.toLocaleString()}` : ''}
                  </td>
                  <td className="px-4 py-4">
                    <button
                      onClick={() => handleConfirm(chemical)}
                      disabled={!actual.trim()}
                      className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed"
                    >
                      Xác nhận
                    </button>
                  </td>
                </tr>
              );
            })}
             {filteredChemicals.length === 0 && (
                <tr>
                    <td colSpan={7} className="text-center py-10 text-slate-500">
                    Không tìm thấy hóa chất phù hợp.
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PhysicalCountPage;