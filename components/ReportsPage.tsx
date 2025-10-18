import React, { useState, useMemo } from 'react';
// FIX: The imported file './types' was not a module. With the new types.ts, this now works.
import { Chemical, UsageLogEntry, StorageLocation, Instrument } from '../types';
import { utils, writeFile } from 'xlsx';

interface ReportEntry extends UsageLogEntry {
  chemicalName: string;
  casNumber: string;
  lotNumber: string;
  barcode: string;
  unit: string;
}

interface InventoryReportRow {
  id: string; // The grouped key
  casNumber: string; // Representative CAS
  chemicalName: string; // Representative name
  totalQuantityByUnit: { [unit: string]: number };
  lotCount: number;
}

interface DetailedInventoryReportRow extends Chemical {
  openingStock: number;
  receivedInPeriod: number;
  usedInPeriod: number;
  physicalCountAdjustment: number;
  closingStock: number;
  status: { text: string; color: string; };
}


interface ReportsPageProps {
  chemicals: Chemical[];
  storageLocations: StorageLocation[];
  instruments: Instrument[];
}

const formatDateForDisplay = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString.split('T')[0] + 'T00:00:00');
  return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const getStatus = (chemical: Pick<Chemical, 'expirationDate' | 'quantity'>) => {
    const expiration = new Date(chemical.expirationDate);
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);

    if (chemical.quantity <= 0) {
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

const ReportsPage: React.FC<ReportsPageProps> = ({ chemicals, storageLocations, instruments }) => {
  const [activeTab, setActiveTab] = useState<'stockIn' | 'stockOut' | 'inventory' | 'detailedInventory'>('stockIn');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filterText, setFilterText] = useState('');
  const [groupBy, setGroupBy] = useState<'chemicalName' | 'casNumber'>('chemicalName');
  const [locationFilter, setLocationFilter] = useState('');

  const allRecipientLocations = useMemo(() => {
    const storageNames = storageLocations.map(loc => loc.name);
    const instrumentNames = instruments.map(inst => inst.name);
    // Also include unique free-text recipients, excluding structured ones
    const freeTextRecipients = new Set<string>();
    chemicals.flatMap(c => c.usageLog || []).forEach(log => {
        if (log.recipient && !log.recipient.startsWith('Đến kho:') && !log.recipient.startsWith('Cho máy:')) {
            freeTextRecipients.add(log.recipient);
        }
    });
    return Array.from(new Set([...storageNames, ...instrumentNames, ...freeTextRecipients])).sort((a,b) => a.localeCompare(b, 'vi'));
  }, [storageLocations, instruments, chemicals]);

  const allStorageLocations = useMemo(() => {
    const locations = new Set(chemicals.map(c => c.storageLocation).filter(Boolean));
    return Array.from(locations).sort();
  }, [chemicals]);


  const allLogs = useMemo<ReportEntry[]>(() => {
    return chemicals.flatMap(chemical => 
      (chemical.usageLog || []).map(log => ({
        ...log,
        chemicalName: chemical.name,
        casNumber: chemical.casNumber,
        lotNumber: chemical.lotNumber,
        barcode: chemical.barcode,
        unit: chemical.unit,
      }))
    ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [chemicals]);

  const filteredLogs = useMemo(() => {
    const lowerCaseFilter = filterText.toLowerCase();
    
    return allLogs.filter(log => {
      if (activeTab === 'stockIn' && log.quantityChange < 0) return false;
      if (activeTab === 'stockOut' && log.quantityChange >= 0) return false;

      const logDateStr = log.date.split('T')[0];
      if (startDate && logDateStr < startDate) return false;
      if (endDate && logDateStr > endDate) return false;

      if (lowerCaseFilter && !(
        log.chemicalName.toLowerCase().includes(lowerCaseFilter) ||
        String(log.casNumber).toLowerCase().includes(lowerCaseFilter) ||
        String(log.lotNumber).toLowerCase().includes(lowerCaseFilter) ||
        String(log.barcode).toLowerCase().includes(lowerCaseFilter) ||
        (log.person || '').toLowerCase().includes(lowerCaseFilter))
      ) {
        return false;
      }
      
      if ((activeTab === 'stockOut' || activeTab === 'stockIn') && locationFilter) {
          if (!log.recipient || !log.recipient.includes(locationFilter)) {
              return false;
          }
      }

      return true;
    });
  }, [allLogs, activeTab, startDate, endDate, filterText, locationFilter]);
  
  const inventoryReportData = useMemo<InventoryReportRow[]>(() => {
    const grouped: { [key: string]: InventoryReportRow } = {};

    chemicals.forEach(chem => {
        const key = groupBy === 'chemicalName' ? chem.name : chem.casNumber;
        if (!key) return; // Skip if key is empty

        if (!grouped[key]) {
            grouped[key] = {
                id: key,
                casNumber: chem.casNumber,
                chemicalName: chem.name,
                totalQuantityByUnit: {},
                lotCount: 0
            };
        }
        
        const currentQty = grouped[key].totalQuantityByUnit[chem.unit] || 0;
        grouped[key].totalQuantityByUnit[chem.unit] = currentQty + chem.quantity;
        grouped[key].lotCount += 1;
    });

    return Object.values(grouped).sort((a, b) => a.id.localeCompare(b.id));
  }, [chemicals, groupBy]);

  const filteredInventoryReport = useMemo(() => {
      if (!filterText) return inventoryReportData;
      const lowerCaseFilter = filterText.toLowerCase();
      return inventoryReportData.filter(row => 
          row.chemicalName.toLowerCase().includes(lowerCaseFilter) ||
          row.casNumber.toLowerCase().includes(lowerCaseFilter)
      );
  }, [inventoryReportData, filterText]);

  const detailedInventoryReportData = useMemo<DetailedInventoryReportRow[]>(() => {
    const periodStart = startDate ? new Date(startDate.split('T')[0] + 'T00:00:00') : new Date('1970-01-01');
    const periodEnd = endDate ? new Date(endDate.split('T')[0] + 'T00:00:00') : new Date();
    periodEnd.setHours(23, 59, 59, 999);

    return chemicals.map(chemical => {
      let receivedInPeriod = 0;
      let usedInPeriod = 0;
      let physicalCountAdjustment = 0;

      (chemical.usageLog || []).forEach(log => {
        const logDate = new Date(log.date);
        if (logDate >= periodStart && logDate <= periodEnd) {
          if (log.reason.includes('Kiểm kê')) {
            physicalCountAdjustment += log.quantityChange;
          } else if (log.quantityChange > 0) {
            receivedInPeriod += log.quantityChange;
          } else {
            usedInPeriod += Math.abs(log.quantityChange);
          }
        }
      });
      
      const closingStock = chemical.quantity;
      // Tồn cuối = Tồn đầu + Nhập - Xuất + Kiểm kê
      // Tồn đầu = Tồn cuối - Nhập + Xuất - Kiểm kê
      const openingStock = closingStock - receivedInPeriod + usedInPeriod - physicalCountAdjustment;

      return {
        ...chemical,
        openingStock,
        receivedInPeriod,
        usedInPeriod,
        physicalCountAdjustment,
        closingStock,
        status: getStatus(chemical)
      };
    });
  }, [chemicals, startDate, endDate]);

  const filteredDetailedInventoryReport = useMemo(() => {
    const lowerCaseFilter = filterText.toLowerCase();
    return detailedInventoryReportData.filter(item => {
        const matchesLocation = !locationFilter || item.storageLocation === locationFilter;
        const matchesText = !lowerCaseFilter || 
            item.name.toLowerCase().includes(lowerCaseFilter) ||
            item.casNumber.toLowerCase().includes(lowerCaseFilter);
        
        return matchesLocation && matchesText;
    });
  }, [detailedInventoryReportData, filterText, locationFilter]);


  const handleExport = () => {
    if (activeTab === 'detailedInventory') {
        const dataToExport = filteredDetailedInventoryReport.map(item => ({
            'Số CAS': item.casNumber,
            'Tên hóa chất': item.name,
            'Số lô': item.lotNumber,
            'Đơn vị': item.unit,
            'Tồn đầu kì': item.openingStock,
            'Nhập trong kì': item.receivedInPeriod,
            'Xuất trong kì': item.usedInPeriod,
            'Kiểm kê': item.physicalCountAdjustment,
            'Tồn cuối kì': item.closingStock,
            'Trạng thái': item.status.text,
            'Vị trí': item.storageLocation
        }));
        const ws = utils.json_to_sheet(dataToExport);
        const wb = utils.book_new();
        utils.book_append_sheet(wb, ws, "BaoCaoNXT");
        writeFile(wb, "Bao_cao_Nhap_Xuat_Ton.xlsx");

    } else if (activeTab === 'inventory') {
        const dataToExport = filteredInventoryReport.map(row => {
             const quantities = Object.entries(row.totalQuantityByUnit)
                .map(([unit, qty]) => `${qty} ${unit}`)
                .join(', ');
            return {
                'Số CAS': row.casNumber,
                'Tên hóa chất': row.chemicalName,
                'Tổng số lượng': quantities,
                'Tổng số lô': row.lotCount,
            }
        });
        const ws = utils.json_to_sheet(dataToExport);
        const wb = utils.book_new();
        utils.book_append_sheet(wb, ws, "BaoCaoTonKho");
        writeFile(wb, "Bao_cao_Ton_kho.xlsx");

    } else {
        const dataToExport = filteredLogs.map(log => ({
            'Ngày': formatDateForDisplay(log.date),
            'Số CAS': log.casNumber,
            'Tên hóa chất': log.chemicalName,
            'Số lô': log.lotNumber,
            'Mã Barcode': log.barcode,
            'Số lượng': `${log.quantityChange > 0 ? '+' : ''}${log.quantityChange} ${log.unit}`,
            'Lý do': log.reason,
            'Nơi nhận': log.recipient || '',
            'Người thực hiện': log.person || 'N/A',
        }));

        const ws = utils.json_to_sheet(dataToExport);
        const wb = utils.book_new();
        utils.book_append_sheet(wb, ws, activeTab === 'stockIn' ? "BaoCaoNhapKho" : "BaoCaoXuatKho");
        const fileName = activeTab === 'stockIn' ? "Bao_cao_Nhap_kho.xlsx" : "Bao_cao_Xuat_kho.xlsx";
        writeFile(wb, fileName);
    }
  };
  
  const TabButton: React.FC<{ tabName: 'stockIn' | 'stockOut' | 'inventory' | 'detailedInventory'; children: React.ReactNode }> = ({ tabName, children }) => {
    const isActive = activeTab === tabName;
    return (
      <button
        onClick={() => { setActiveTab(tabName); setLocationFilter(''); setFilterText(''); }}
        className={`px-4 py-2 text-sm font-medium rounded-md ${
          isActive ? 'bg-blue-600 text-white shadow' : 'text-slate-600 bg-slate-100 hover:bg-slate-200'
        }`}
      >
        {children}
      </button>
    );
  };
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-xl font-semibold mb-4 text-slate-800">Báo cáo Kho</h2>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-4 border-b border-slate-200 pb-4">
        <TabButton tabName="stockIn">Báo cáo Nhập kho</TabButton>
        <TabButton tabName="stockOut">Báo cáo Xuất kho</TabButton>
        <TabButton tabName="inventory">Báo cáo Tồn kho Tổng hợp</TabButton>
        <TabButton tabName="detailedInventory">Báo cáo Nhập-Xuất-Tồn</TabButton>
      </div>

      {/* Filters */}
      {(activeTab === 'stockIn' || activeTab === 'stockOut') && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 p-4 bg-slate-50 rounded-md border">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Từ ngày</label>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full p-2 border border-slate-300 rounded-md bg-white text-slate-900"/>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Đến ngày</label>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full p-2 border border-slate-300 rounded-md bg-white text-slate-900"/>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Lọc theo nơi nhận</label>
            <select
                value={locationFilter}
                onChange={e => setLocationFilter(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-md bg-white text-slate-900 focus:ring-blue-500 focus:border-blue-500"
            >
                <option value="">Tất cả nơi nhận</option>
                {allRecipientLocations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
            </select>
          </div>
          <div>
             <label className="block text-sm font-medium text-slate-600 mb-1">Tìm kiếm</label>
             <input
                type="text"
                placeholder="Tìm theo tên, CAS, lô, barcode..."
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-md bg-white text-slate-900 placeholder:text-slate-400 focus:ring-blue-500 focus:border-blue-500"
              />
          </div>
        </div>
      )}

      {activeTab === 'inventory' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-4 bg-slate-50 rounded-md border">
            <div>
                 <label className="block text-sm font-medium text-slate-600 mb-1">Gom nhóm theo</label>
                 <select
                    value={groupBy}
                    onChange={e => setGroupBy(e.target.value as 'chemicalName' | 'casNumber')}
                    className="w-full p-2 border border-slate-300 rounded-md bg-white text-slate-900 focus:ring-blue-500 focus:border-blue-500"
                 >
                     <option value="chemicalName">Tên hóa chất</option>
                     <option value="casNumber">Số CAS</option>
                 </select>
            </div>
             <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Tìm kiếm</label>
                <input
                    type="text"
                    placeholder="Tìm theo tên hóa chất hoặc số CAS..."
                    value={filterText}
                    onChange={(e) => setFilterText(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-md bg-white text-slate-900 placeholder:text-slate-400 focus:ring-blue-500 focus:border-blue-500"
                />
            </div>
        </div>
      )}

      {activeTab === 'detailedInventory' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 p-4 bg-slate-50 rounded-md border">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Từ ngày</label>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full p-2 border border-slate-300 rounded-md bg-white text-slate-900"/>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Đến ngày</label>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full p-2 border border-slate-300 rounded-md bg-white text-slate-900"/>
          </div>
           <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Tìm kiếm theo Tên / CAS</label>
              <input
                  type="text"
                  placeholder="Nhập tên hóa chất hoặc số CAS..."
                  value={filterText}
                  onChange={(e) => setFilterText(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-md bg-white text-slate-900 placeholder:text-slate-400 focus:ring-blue-500 focus:border-blue-500"
              />
          </div>
          <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Vị trí lưu trữ</label>
              <select
                  value={locationFilter}
                  onChange={e => setLocationFilter(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-md bg-white text-slate-900 focus:ring-blue-500 focus:border-blue-500"
              >
                  <option value="">Tất cả vị trí</option>
                  {allStorageLocations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
              </select>
          </div>
        </div>
      )}
      
      {/* Action Bar */}
      <div className="flex justify-end mb-4">
        <button
          onClick={handleExport}
          className="inline-flex items-center justify-center rounded-md border border-transparent bg-teal-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-teal-700"
        >
          Xuất Excel
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {activeTab === 'inventory' ? (
             <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Số CAS</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Tên hóa chất</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Tổng số lượng</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Tổng số lô</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {filteredInventoryReport.length > 0 ? filteredInventoryReport.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{row.casNumber}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{row.chemicalName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                        {Object.entries(row.totalQuantityByUnit).map(([unit, qty]) => (
                            <div key={unit}>{`${qty.toLocaleString()} ${unit}`}</div>
                        ))}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{row.lotCount}</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={4} className="text-center py-10 text-slate-500">
                      Không có dữ liệu tồn kho.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
        ) : activeTab === 'detailedInventory' ? (
             <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  {['Số CAS', 'Tên hóa chất', 'Đơn vị', 'Tồn đầu kì', 'Nhập trong kì', 'Xuất trong kì', 'Kiểm kê', 'Tồn cuối kì', 'Trạng thái'].map(header => (
                    <th key={header} scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {filteredDetailedInventoryReport.length > 0 ? filteredDetailedInventoryReport.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{item.casNumber}</td>
                    <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm font-medium text-slate-900">{item.name}</div></td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{item.unit}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{item.openingStock}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-semibold">{item.receivedInPeriod}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-semibold">{item.usedInPeriod}</td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${item.physicalCountAdjustment >= 0 ? 'text-sky-600' : 'text-orange-600'}`}>
                      {item.physicalCountAdjustment !== 0 ? `${item.physicalCountAdjustment > 0 ? '+' : ''}${item.physicalCountAdjustment}` : '0'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-700 font-bold">{item.closingStock}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${item.status.color}`}>
                          {item.status.text}
                        </span>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={9} className="text-center py-10 text-slate-500">
                      Không tìm thấy bản ghi nào phù hợp.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
        ) : (
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  {['Ngày', 'Số CAS', 'Tên hóa chất', 'Số lô', 'Mã Barcode', 'Số lượng', 'Lý do', 'Nơi nhận', 'Người thực hiện'].map(header => (
                    <th key={header} scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {filteredLogs.length > 0 ? filteredLogs.map((log, index) => (
                  <tr key={index} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{formatDateForDisplay(log.date)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{log.casNumber}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-slate-900">{log.chemicalName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{log.lotNumber}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 font-mono">{log.barcode}</td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${log.quantityChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {log.quantityChange >= 0 ? '+' : ''}{log.quantityChange} ${log.unit}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-800">{log.reason}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{log.recipient || ''}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{log.person || 'N/A'}</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={9} className="text-center py-10 text-slate-500">
                      Không tìm thấy bản ghi nào phù hợp.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
        )}
      </div>
    </div>
  );
};

export default ReportsPage;