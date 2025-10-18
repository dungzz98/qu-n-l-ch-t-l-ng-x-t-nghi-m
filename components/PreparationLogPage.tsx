

import React, { useState, useMemo } from 'react';
import { Chemical, ChemicalMaster, ManualPreparationLog, User } from '../types';
import { utils, writeFile } from 'xlsx';
import { ExportIcon } from './icons/ExportIcon';
import ManualPreparationLogModal from './ManualPreparationLogModal';
import { PlusCircleIcon } from './icons/PlusCircleIcon';


const formatDateTime = (dateString: string) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatDate = (dateString?: string) => {
  if (!dateString) return '';
  const date = new Date(dateString.split('T')[0] + 'T00:00:00');
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

interface PreparationLogPageProps {
  chemicals: Chemical[];
  manualLogEntries: ManualPreparationLog[];
  chemicalMasters: ChemicalMaster[];
  currentUser: User | null;
  onAddManualEntry: (logData: Omit<ManualPreparationLog, 'id'>) => void;
}

const PreparationLogPage: React.FC<PreparationLogPageProps> = ({ chemicals, manualLogEntries, chemicalMasters, currentUser, onAddManualEntry }) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedChemicalName, setSelectedChemicalName] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Sổ pha chế giờ CHỈ hiển thị các mục nhập thủ công
  const allLogsForSelectedDate = useMemo<ManualPreparationLog[]>(() => {
    const targetDateStr = selectedDate;
    if (!targetDateStr) return [];

    const manualLogs: ManualPreparationLog[] = manualLogEntries
      .filter(log => log.date.startsWith(targetDateStr))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return manualLogs;
  }, [manualLogEntries, selectedDate]);
  
  const uniqueChemicalsForDay = useMemo<string[]>(() => {
    const names = new Set(allLogsForSelectedDate.map(log => log.chemicalName));
    return [...names].sort((a: string, b: string) => a.localeCompare(b, 'vi'));
  }, [allLogsForSelectedDate]);

  const dailyLog = useMemo<ManualPreparationLog[]>(() => {
    if (!selectedChemicalName) {
      return allLogsForSelectedDate;
    }
    return allLogsForSelectedDate.filter(log => log.chemicalName === selectedChemicalName);
  }, [allLogsForSelectedDate, selectedChemicalName]);

  // Danh sách gợi ý giờ được lấy từ các hóa chất đã XUẤT KHO trong ngày
  const suggestedChemicalsForDay = useMemo<{ name: string; supplier: string; }[]>(() => {
    const targetDateStr = selectedDate;
    if (!targetDateStr) return [];

    const usedChemicals = new Map<string, { name: string; supplier: string }>();

    chemicals.forEach(chemical => {
        const wasUsed = (chemical.usageLog || []).some(
            log => log.quantityChange < 0 && log.date.startsWith(targetDateStr)
        );
        if (wasUsed) {
            if (!usedChemicals.has(chemical.name)) {
                usedChemicals.set(chemical.name, { name: chemical.name, supplier: chemical.supplier });
            }
        }
    });

    return Array.from(usedChemicals.values()).sort((a, b) => a.name.localeCompare(b.name, 'vi'));
  }, [chemicals, selectedDate]);
  
  const handleExport = () => {
    const dataToExport = dailyLog.map((log, index) => ({
      'STT': index + 1,
      'Ngày pha': formatDateTime(log.date),
      'Tên hoá chất': log.chemicalName,
      'Hãng hoá chất': log.supplier,
      'Số Lô': log.lotNumber,
      'HSD trước pha': formatDate(log.expirationDate),
      'HSD sau pha': formatDate(log.postPreparationExpiration),
      'Người Pha': log.person,
      'Ghi chú': log.notes,
    }));

    const ws = utils.json_to_sheet(dataToExport);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, `SoPhaChe_${selectedDate}`);
    writeFile(wb, `So_Pha_Che_${selectedDate}.xlsx`);
  };
  
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setSelectedDate(e.target.value);
      setSelectedChemicalName(''); // Reset chemical filter when date changes
  }
  
  const handleFormSubmit = (data: Omit<ManualPreparationLog, 'id'>) => {
      onAddManualEntry(data);
      setIsModalOpen(false);
  }

  return (
    <>
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
          <div>
              <h2 className="text-xl font-semibold text-slate-800">Sổ Pha chế Hóa chất</h2>
              <p className="text-sm text-slate-500">Ghi nhận các hoạt động pha chế thủ công.</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
            >
              <PlusCircleIcon className="w-5 h-5 mr-2" />
              Nhập thủ công
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-4 bg-slate-50 rounded-md border">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Chọn ngày</label>
              <input
                type="date"
                value={selectedDate}
                onChange={handleDateChange}
                className="w-full p-2 border border-slate-300 rounded-md bg-white text-slate-900 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
             <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Lọc theo hóa chất</label>
              <select
                  value={selectedChemicalName}
                  onChange={e => setSelectedChemicalName(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-md bg-white text-slate-900 focus:ring-blue-500 focus:border-blue-500"
                  disabled={uniqueChemicalsForDay.length === 0}
              >
                  <option value="">Tất cả hóa chất</option>
                  {uniqueChemicalsForDay.map(name => (
                      <option key={name} value={name}>{name}</option>
                  ))}
              </select>
            </div>
            <div className="self-end">
              <button
                onClick={handleExport}
                disabled={dailyLog.length === 0}
                className="w-full inline-flex items-center justify-center rounded-md border border-transparent bg-teal-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-teal-700 disabled:bg-slate-400 disabled:cursor-not-allowed"
              >
                <ExportIcon className="w-5 h-5 mr-2" />
                Xuất Excel
              </button>
            </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                {['Ngày pha', 'Tên hoá chất', 'Hãng hoá chất', 'Số Lô', 'HSD trước pha', 'HSD sau pha', 'Người Pha', 'Ghi chú'].map(header => (
                  <th key={header} scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {dailyLog.length > 0 ? dailyLog.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{formatDateTime(log.date)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{log.chemicalName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{log.supplier}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{log.lotNumber}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{formatDate(log.expirationDate)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{formatDate(log.postPreparationExpiration)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{log.person}</td>
                  <td className="px-6 py-4 text-sm text-slate-800">{log.notes}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-slate-500">
                    { allLogsForSelectedDate.length > 0 && selectedChemicalName
                      ? "Hóa chất này không có hoạt động trong ngày đã chọn."
                      : "Không có hoạt động nào trong ngày đã chọn."
                    }
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <ManualPreparationLogModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
        currentUser={currentUser}
        suggestedChemicals={suggestedChemicalsForDay}
        chemicals={chemicals}
      />
    </>
  );
};

export default PreparationLogPage;
