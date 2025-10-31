import React, { useState, useMemo, useEffect } from 'react';
import { NonConformity, User, PreventiveActionReport } from '../types';
import { PlusIcon } from './icons/PlusIcon';
import { EditIcon } from './icons/EditIcon';
import { TrashIcon } from './icons/TrashIcon';
import { ListBulletIcon } from './icons/ListBulletIcon';
import { ClipboardDocumentCheckIcon } from './icons/ClipboardDocumentCheckIcon';
import { ShieldCheckIcon } from './icons/ShieldCheckIcon';
import { DocumentArrowDownIcon } from './icons/DocumentArrowDownIcon';
import { ExportIcon } from './icons/ExportIcon';
import { PreventiveActionsPage } from './PreventiveActionsPage';

interface NonConformityPageProps {
  nonConformities: NonConformity[];
  onAddOrUpdateNC: (item: NonConformity | null) => void;
  onDeleteNC: (id: string) => void;
  currentUser: User | null;
  focusedItemId: string | null;
  onExportToDoc: (items: NonConformity[]) => void;
  onExportToExcel: (items: NonConformity[]) => void;
  onExportCorrectiveActionToDoc: (item: NonConformity) => void;
  onExportCorrectiveActionLogToDoc: (items: NonConformity[]) => void;
  onExportCorrectiveActionLogToExcel: (items: NonConformity[]) => void;
  preventiveActionReports: PreventiveActionReport[];
  onAddOrUpdatePreventiveAction: (item: PreventiveActionReport | null) => void;
  onDeletePreventiveAction: (id: string) => void;
  onExportPreventiveActionToDoc: (item: PreventiveActionReport) => void;
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

export const NonConformityPage: React.FC<NonConformityPageProps> = (props) => {
  const { 
      nonConformities, onAddOrUpdateNC, onDeleteNC, onExportToDoc, onExportToExcel, 
      onExportCorrectiveActionToDoc, onExportCorrectiveActionLogToDoc, onExportCorrectiveActionLogToExcel,
      preventiveActionReports, focusedItemId
  } = props;
  const [activeTab, setActiveTab] = useState<'list' | 'corrective_actions' | 'preventive_actions'>('list');
  const [filterText, setFilterText] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [localFocusedNcId, setLocalFocusedNcId] = useState<string | null>(focusedItemId);
  const [focusedPaId, setFocusedPaId] = useState<string | null>(null);

  useEffect(() => {
    setLocalFocusedNcId(focusedItemId);
  }, [focusedItemId]);

  useEffect(() => {
    if (localFocusedNcId || focusedPaId) {
        const timer = setTimeout(() => {
            setLocalFocusedNcId(null);
            setFocusedPaId(null);
        }, 2500); // Animation duration
        return () => clearTimeout(timer);
    }
  }, [localFocusedNcId, focusedPaId]);

  const handleNavigate = (tab: 'list' | 'corrective_actions' | 'preventive_actions', id: string) => {
    setActiveTab(tab);
    if (tab === 'preventive_actions') {
      setFocusedPaId(id);
      setLocalFocusedNcId(null);
    } else {
      setLocalFocusedNcId(id);
      setFocusedPaId(null);
    }
  };

  const paReportMap = useMemo(() => new Map(preventiveActionReports.map(report => [report.id, report])), [preventiveActionReports]);

  const filteredItems = useMemo(() => {
    return nonConformities.filter(nc => {
      if (startDate && nc.date < startDate) {
          return false;
      }
      if (endDate && nc.date > endDate) {
          return false;
      }

      if (filterText) {
        const lowerCaseFilter = filterText.toLowerCase();
        const matchesText =
          nc.description.toLowerCase().includes(lowerCaseFilter) ||
          nc.reportedBy.toLowerCase().includes(lowerCaseFilter) ||
          nc.ncId.toLowerCase().includes(lowerCaseFilter) ||
          (nc.hdkpId || '').toLowerCase().includes(lowerCaseFilter);
        if (!matchesText) {
          return false;
        }
      }
      
      return true;
    });
  }, [nonConformities, filterText, startDate, endDate]);

  const correctiveActionItems = useMemo(() => {
    return nonConformities.filter(nc => 
      nc.correctiveAction && nc.correctiveAction.trim() !== ''
    ).sort((a,b) => b.date.localeCompare(a.date));
  }, [nonConformities]);

  const filteredCorrectiveActionItems = useMemo(() => {
    return correctiveActionItems.filter(nc => {
        if (startDate && nc.date < startDate) return false;
        if (endDate && nc.date > endDate) return false;
        return true;
    });
  }, [correctiveActionItems, startDate, endDate]);
  
  const statusMap: Record<NonConformity['status'], { text: string; color: string }> = {
    open: { text: 'Mở', color: 'bg-red-100 text-red-800' },
    in_progress: { text: 'Đang xử lý', color: 'bg-yellow-100 text-yellow-800' },
    closed: { text: 'Đã đóng', color: 'bg-green-100 text-green-800' },
  };
  
  const categoryMap: Record<NonConformity['category'], string> = {
    'pre-analytical': 'Trước phân tích',
    'analytical': 'Trong phân tích',
    'post-analytical': 'Sau phân tích',
    'system': 'Hệ thống',
    'safety': 'An toàn',
    'supplier': 'Nhà cung cấp',
    'other': 'Khác'
  };
  
  const severityMap: Record<NonConformity['severity'], { text: string; color: string }> = {
    minor: { text: 'Nhẹ', color: 'text-slate-600' },
    severe: { text: 'Nặng', color: 'text-red-600 font-bold' }
  };

  const TabButton: React.FC<{ tabId: 'list' | 'corrective_actions' | 'preventive_actions', label: string, icon: React.ReactNode }> = ({ tabId, label, icon }) => (
    <button
        onClick={() => setActiveTab(tabId)}
        className={`px-4 py-2 text-sm font-medium rounded-md flex items-center gap-2 ${activeTab === tabId ? 'bg-black text-white' : 'bg-white text-black border border-gray-300 hover:bg-gray-100'}`}
    >
        {icon}{label}
    </button>
  );

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-800">Quản lý Sự không phù hợp (SKPH)</h2>
          <p className="text-sm text-slate-500 mt-1">Theo dõi và xử lý các sự không phù hợp trong phòng xét nghiệm.</p>
        </div>
        <div className="flex items-center gap-2">
            {activeTab === 'list' && (
              <>
                <button onClick={() => onExportToDoc(filteredItems)} className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50">
                    <DocumentArrowDownIcon className="w-5 h-5 mr-2" />
                    Xuất Sổ (.doc)
                </button>
                <button onClick={() => onExportToExcel(filteredItems)} className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50">
                    <ExportIcon className="w-5 h-5 mr-2" />
                    Xuất Excel
                </button>
              </>
            )}
            <button onClick={() => onAddOrUpdateNC(null)} className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700">
                <PlusIcon className="w-5 h-5 mr-2" />
                Ghi nhận SKPH
            </button>
        </div>
      </div>
      
       <div className="flex flex-wrap justify-between items-center mb-4 gap-4 border-b border-gray-200 pb-4">
            <div className="flex gap-2">
                <TabButton tabId="list" label="Danh sách SKPH" icon={<ListBulletIcon />} />
                <TabButton tabId="corrective_actions" label="Hành động Khắc phục" icon={<ClipboardDocumentCheckIcon />} />
                <TabButton tabId="preventive_actions" label="Hành động Phòng ngừa" icon={<ShieldCheckIcon />} />
            </div>
            {(activeTab === 'list' || activeTab === 'corrective_actions') && (
                <div className="flex flex-wrap items-end gap-4">
                    {activeTab === 'list' && (
                        <div className="flex-grow">
                            <label className="block text-sm font-medium text-slate-600 mb-1">Tìm kiếm</label>
                            <input
                                type="text"
                                placeholder="Theo mã, mô tả, người báo cáo..."
                                value={filterText}
                                onChange={(e) => setFilterText(e.target.value)}
                                className="block w-full min-w-[250px] rounded-md border border-slate-300 bg-white py-2 px-3 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-blue-500"
                            />
                        </div>
                    )}
                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">Từ ngày</label>
                        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="block w-full rounded-md border border-slate-300 bg-white py-2 px-3 text-slate-900 focus:ring-2 focus:ring-inset focus:ring-blue-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">Đến ngày</label>
                        <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="block w-full rounded-md border border-slate-300 bg-white py-2 px-3 text-slate-900 focus:ring-2 focus:ring-inset focus:ring-blue-500" />
                    </div>
                </div>
            )}
        </div>


      {activeTab === 'list' && (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
                <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Mã số Liên quan</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Ngày</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Mô tả</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Phân loại</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Mức độ</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Trạng thái</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Người báo cáo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Hành động</th>
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
                {filteredItems.length > 0 ? filteredItems.map(item => {
                const status = statusMap[item.status];
                const severity = severityMap[item.severity];
                const paReport = item.preventiveActionId ? paReportMap.get(item.preventiveActionId) : null;
                const isFocused = item.id === localFocusedNcId;
                return (
                <tr key={item.id} className={`transition-colors duration-300 ${isFocused ? 'animate-pulse-yellow' : 'hover:bg-slate-50'}`}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">
                      <p className="text-slate-700">{item.ncId}</p>
                      {item.hdkpId && (
                        <button onClick={() => handleNavigate('corrective_actions', item.id)} className="text-blue-600 hover:underline">
                          {item.hdkpId}
                        </button>
                      )}
                      {paReport && (
                        <button onClick={() => handleNavigate('preventive_actions', paReport.id)} className="text-green-600 hover:underline block">
                          {paReport.reportId}
                        </button>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{formatDate(item.date)}</td>
                    <td className="px-6 py-4 text-sm text-slate-900 max-w-sm" title={item.description}>
                        <p className="truncate font-medium">{item.description}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{categoryMap[item.category]}</td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${severity.color}`}>{severity.text}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${status.color}`}>
                            {status.text}
                        </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{item.reportedBy}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-4">
                        <button onClick={() => onAddOrUpdateNC(item)} className="text-blue-600 hover:text-blue-900" title="Xem chi tiết / Cập nhật"><EditIcon /></button>
                        <button onClick={() => onDeleteNC(item.id)} className="text-red-600 hover:text-red-900" title="Xóa"><TrashIcon /></button>
                    </div>
                    </td>
                </tr>
                )}) : (
                <tr>
                    <td colSpan={8} className="text-center py-10 text-slate-500">
                    {nonConformities.length === 0 ? "Chưa có sự không phù hợp nào được ghi nhận." : "Không tìm thấy kết quả phù hợp."}
                    </td>
                </tr>
                )}
            </tbody>
            </table>
        </div>
      )}
      
      {activeTab === 'corrective_actions' && (
        <div>
           <div className="flex justify-between items-center mb-4">
                <p className="text-sm text-slate-500">
                    Danh sách các hành động khắc phục cho các SKPH.
                </p>
                <div className="flex items-center gap-2">
                    <button onClick={() => onExportCorrectiveActionLogToDoc(filteredCorrectiveActionItems)} disabled={filteredCorrectiveActionItems.length === 0} className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed">
                        <DocumentArrowDownIcon className="w-5 h-5 mr-2" /> Xuất Sổ (.doc)
                    </button>
                    <button onClick={() => onExportCorrectiveActionLogToExcel(filteredCorrectiveActionItems)} disabled={filteredCorrectiveActionItems.length === 0} className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed">
                        <ExportIcon className="w-5 h-5 mr-2" /> Xuất Excel
                    </button>
                </div>
            </div>
          <div className="space-y-4">
            {filteredCorrectiveActionItems.length > 0 ? filteredCorrectiveActionItems.map(item => {
              const status = statusMap[item.status];
              const paReport = item.preventiveActionId ? paReportMap.get(item.preventiveActionId) : null;
              const isFocused = item.id === localFocusedNcId;
              return (
                <div key={item.id} className={`p-4 border rounded-lg transition-all duration-300 ${isFocused ? 'animate-pulse-yellow' : 'hover:shadow-md bg-white'}`}>
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-grow">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${status.color}`}>{status.text}</span>
                        <button onClick={() => handleNavigate('list', item.id)} className="text-sm font-semibold text-slate-700 hover:underline">{item.ncId}</button>
                        {item.hdkpId && <span className="text-sm font-semibold text-blue-700">{item.hdkpId}</span>}
                        {paReport && (
                            <button onClick={() => handleNavigate('preventive_actions', paReport.id)} className="text-sm font-semibold text-green-600 hover:underline">
                              ({paReport.reportId})
                            </button>
                        )}
                        <span className="text-sm text-slate-500">Ngày: {formatDate(item.date)}</span>
                      </div>
                      <p className="mt-1 font-semibold text-slate-800">SKPH: {item.description}</p>
                      <p className="mt-2 text-sm text-slate-600">
                        <strong className="text-slate-800">Hành động khắc phục:</strong> {item.correctiveAction}
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-end gap-2">
                        <button onClick={() => onExportCorrectiveActionToDoc(item)} className="flex-shrink-0 inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 text-slate-700 text-sm font-semibold rounded-md hover:bg-slate-200 border border-slate-300">
                            <DocumentArrowDownIcon className="w-4 h-4" /> Báo cáo
                        </button>
                        <button onClick={() => onAddOrUpdateNC(item)} className="flex-shrink-0 inline-flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-700 text-sm font-semibold rounded-md hover:bg-blue-200">
                            <EditIcon className="w-4 h-4" /> Cập nhật
                        </button>
                    </div>
                  </div>
                </div>
              );
            }) : (
              <div className="text-center py-16 text-slate-500 bg-slate-50 rounded-lg">
                <ClipboardDocumentCheckIcon className="w-12 h-12 mx-auto text-slate-300 mb-2" />
                <h3 className="font-semibold">Không có HĐKP</h3>
                <p>Không có hành động khắc phục nào trong khoảng thời gian đã chọn.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'preventive_actions' && (
        <PreventiveActionsPage
          reports={props.preventiveActionReports}
          onAddOrUpdate={props.onAddOrUpdatePreventiveAction}
          onDelete={props.onDeletePreventiveAction}
          onExportToDoc={props.onExportPreventiveActionToDoc}
          nonConformities={nonConformities}
          focusedItemId={focusedPaId}
          onNavigate={handleNavigate}
        />
      )}
    </div>
  );
};
