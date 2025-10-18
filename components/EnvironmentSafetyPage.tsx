import React, { useState, useMemo } from 'react';
import { AccessLog, AreaEnvironmentLog, EquipmentTemperatureLog, MonitoredArea, MonitoredEquipment, User, WaterConductivityLog, WaterSource, IncidentReport } from '../types';
import { EditIcon } from './icons/EditIcon';
import { TrashIcon } from './icons/TrashIcon';
import { LogoutIcon } from './icons/LogoutIcon';
import AccessLogFormModal from './AccessLogFormModal';
import EnvironmentLogFormModal from './EnvironmentLogFormModal';
import MonitoredItemFormModal from './MonitoredItemFormModal';
import IncidentReportFormModal from './IncidentReportFormModal';
import SafetyDashboardPage from './SafetyDashboardPage'; // Import the new dashboard
import { LoginIcon } from './icons/LoginIcon';
import { ThermometerIcon } from './icons/ThermometerIcon';
import { BuildingStorefrontIcon } from './icons/BuildingStorefrontIcon';
import { BeakerIcon } from './icons/BeakerIcon';
import { utils, writeFile } from 'xlsx';
import { ExportIcon } from './icons/ExportIcon';
import { WaterIcon } from './icons/WaterIcon';
import { DocumentAlertIcon } from './icons/DocumentAlertIcon';
import { DocumentArrowDownIcon } from './icons/DocumentArrowDownIcon';

export type SubPage = 'dashboard' | 'access' | 'areaEnv' | 'equipEnv' | 'waterConductivity' | 'incidents' | 'manageItems';
type ActiveItemType = 'area' | 'equipment' | 'waterSource';

const formatDateTime = (dateString?: string, includeTime = true) => {
  if (!dateString) return includeTime ? 'Chưa ghi nhận' : '';
  const date = new Date(dateString);
  if (includeTime) {
      return date.toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }
  return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
};


interface EnvironmentSafetyPageProps {
  accessLogs: AccessLog[];
  areaEnvLogs: AreaEnvironmentLog[];
  equipEnvLogs: EquipmentTemperatureLog[];
  waterConductivityLogs: WaterConductivityLog[];
  incidentReports: IncidentReport[];
  monitoredAreas: MonitoredArea[];
  monitoredEquipment: MonitoredEquipment[];
  waterSources: WaterSource[];
  currentUser: User | null;
  onAddAccessLog: (log: Omit<AccessLog, 'id'>) => void;
  onUpdateAccessLog: (log: AccessLog) => void;
  onAddAreaEnvLog: (log: Omit<AreaEnvironmentLog, 'id'>) => void;
  onAddEquipEnvLog: (log: Omit<EquipmentTemperatureLog, 'id'>) => void;
  onAddWaterConductivityLog: (log: Omit<WaterConductivityLog, 'id'>) => void;
  onAddOrUpdateIncidentReport: (report: Omit<IncidentReport, 'id'> | IncidentReport) => void;
  onDeleteIncidentReport: (id: string) => void;
  onExportIncidentToDoc: (report: IncidentReport) => void;
  onAddItem: (type: ActiveItemType, item: any) => void;
  onUpdateItem: (type: ActiveItemType, item: any) => void;
  onDeleteItem: (type: ActiveItemType, id: string) => void;
}

const EnvironmentSafetyPage: React.FC<EnvironmentSafetyPageProps> = (props) => {
    const { 
        accessLogs, areaEnvLogs, equipEnvLogs, waterConductivityLogs, incidentReports, monitoredAreas, monitoredEquipment, waterSources, currentUser,
        onAddAccessLog, onUpdateAccessLog, onAddAreaEnvLog, onAddEquipEnvLog, onAddWaterConductivityLog, onAddOrUpdateIncidentReport, onDeleteIncidentReport, onExportIncidentToDoc,
        onAddItem, onUpdateItem, onDeleteItem
    } = props;

    const [activeSubPage, setActiveSubPage] = useState<SubPage>('dashboard');
    const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
    const [areaFilter, setAreaFilter] = useState<string>('');
    const [equipmentFilter, setEquipmentFilter] = useState<string>('');
    const [waterSourceFilter, setWaterSourceFilter] = useState<string>('');
    
    // Modal states remain the same
    const [isAccessLogModalOpen, setAccessLogModalOpen] = useState(false);
    const [isEnvLogModalOpen, setEnvLogModalOpen] = useState(false);
    const [isItemModalOpen, setItemModalOpen] = useState(false);
    const [isIncidentModalOpen, setIncidentModalOpen] = useState(false);

    const [logToCheckout, setLogToCheckout] = useState<AccessLog | null>(null);
    const [envLogType, setEnvLogType] = useState<'area' | 'equipment' | 'water'>('area');
    const [itemToEdit, setItemToEdit] = useState<MonitoredArea | MonitoredEquipment | WaterSource | null>(null);
    const [itemType, setItemType] = useState<ActiveItemType>('area');
    const [editingIncident, setEditingIncident] = useState<IncidentReport | null>(null);
  
    const areaMap = useMemo(() => new Map(monitoredAreas.map(a => [a.id, a])), [monitoredAreas]);
    const equipmentMap = useMemo(() => new Map(monitoredEquipment.map(e => [e.id, e])), [monitoredEquipment]);
    const waterSourceMap = useMemo(() => new Map(waterSources.map(w => [w.id, w])), [waterSources]);


    const subPages: { id: SubPage; label: string }[] = [
        { id: 'dashboard', label: 'Bảng điều khiển' },
        { id: 'access', label: 'Sổ Ra/Vào' },
        { id: 'areaEnv', label: 'Giám sát Khu vực' },
        { id: 'equipEnv', label: 'Nhiệt độ Thiết bị' },
        { id: 'waterConductivity', label: 'Độ dẫn điện Nước' },
        { id: 'incidents', label: 'Báo cáo Sự cố' },
        { id: 'manageItems', label: 'Cài đặt' },
    ];
    
    const currentPageLabel = subPages.find(p => p.id === activeSubPage)?.label || 'Bảng điều khiển';

    // Filtered data memos remain the same
    const filteredAccessLogs = useMemo(() => accessLogs.filter(log => log.entryTime.startsWith(filterDate)).sort((a,b) => new Date(b.entryTime).getTime() - new Date(a.entryTime).getTime()), [accessLogs, filterDate]);
    const filteredAreaEnvLogs = useMemo(() => areaEnvLogs.filter(log => log.date === filterDate && (!areaFilter || log.areaId === areaFilter)).sort((a,b) => b.time.localeCompare(a.time)), [areaEnvLogs, filterDate, areaFilter]);
    const filteredEquipEnvLogs = useMemo(() => equipEnvLogs.filter(log => log.date === filterDate && (!equipmentFilter || log.equipmentId === equipmentFilter)).sort((a,b) => b.time.localeCompare(a.time)), [equipEnvLogs, filterDate, equipmentFilter]);
    const filteredWaterConductivityLogs = useMemo(() => waterConductivityLogs.filter(log => log.date === filterDate && (!waterSourceFilter || log.sourceId === waterSourceFilter)).sort((a,b) => b.time.localeCompare(a.time)), [waterConductivityLogs, filterDate, waterSourceFilter]);
    const filteredIncidentReports = useMemo(() => incidentReports.filter(report => report.date === filterDate).sort((a,b) => b.time.localeCompare(a.time)), [incidentReports, filterDate]);

    // Modal handler functions remain the same
    const handleOpenAccessLogModal = (log?: AccessLog) => { setLogToCheckout(log || null); setAccessLogModalOpen(true); };
    const handleOpenEnvLogModal = (type: 'area' | 'equipment' | 'water') => { setEnvLogType(type); setEnvLogModalOpen(true); };
    const handleOpenItemModal = (type: ActiveItemType, item?: MonitoredArea | MonitoredEquipment | WaterSource) => { setItemType(type); setItemToEdit(item || null); setItemModalOpen(true); };
    const handleOpenIncidentModal = (report?: IncidentReport) => { setEditingIncident(report || null); setIncidentModalOpen(true); };
  
    const handleExport = () => {
        let dataToExport, fileName, wsName;
        const activeExportPage = activeSubPage; // Use current subpage for export logic
        
        if (activeExportPage === 'access') {
            dataToExport = filteredAccessLogs.map(log => ({ 'Khu vực': log.areaName, 'Ngày': formatDateTime(log.entryTime, false), 'Giờ vào': new Date(log.entryTime).toLocaleTimeString('vi-VN'), 'Giờ ra': log.exitTime ? new Date(log.exitTime).toLocaleTimeString('vi-VN') : '', 'Họ tên / Đơn vị': log.personOrUnit, 'Công việc': log.task, 'Ghi chú': log.notes || '' }));
            fileName = `So_Ra_Vao_${filterDate}.xlsx`; wsName = 'SoRaVao';
        } else if (activeExportPage === 'areaEnv') {
            dataToExport = filteredAreaEnvLogs.map(log => ({ 'Khu vực': log.areaName, 'Thời gian': log.time, 'Nhiệt độ (°C)': log.temperature, 'Độ ẩm (%)': log.humidity, 'Người ghi nhận': log.recordedBy, 'Ghi chú': log.notes || '' }));
            fileName = `Giam_sat_Khu_vuc_${filterDate}.xlsx`; wsName = 'GiamSatKhuVuc';
        } else if (activeExportPage === 'equipEnv') {
            dataToExport = filteredEquipEnvLogs.map(log => ({ 'Thiết bị': log.equipmentName, 'Thời gian': log.time, 'Nhiệt độ (°C)': log.temperature, 'Người ghi nhận': log.recordedBy, 'Ghi chú': log.notes || '' }));
            fileName = `Theo_doi_Thiet_bi_${filterDate}.xlsx`; wsName = 'TheoDoiThietBi';
        } else if (activeExportPage === 'waterConductivity') {
            dataToExport = filteredWaterConductivityLogs.map(log => ({ 'Nguồn nước': log.sourceName, 'Thời gian': log.time, 'Độ dẫn điện (µS/cm)': log.conductivity, 'Người ghi nhận': log.recordedBy, 'Ghi chú': log.notes || '' }));
            fileName = `Theo_doi_Do_Dan_Dien_${filterDate}.xlsx`; wsName = 'DoDanDien';
        } else if (activeExportPage === 'incidents') {
            dataToExport = filteredIncidentReports.map(r => ({ 'Ngày': r.date, 'Giờ': r.time, 'Vị trí': r.location, 'Đặc điểm': r.incidentType, 'Mô tả sự cố': r.description, 'Người liên quan': r.involvedPersonnel, 'Hành động tức thời': r.immediateAction, 'Hành động khắc phục': r.correctiveAction, 'Người báo cáo': r.reportedBy, 'Người xem xét': r.reviewer || '', 'Tình trạng': r.status }));
            fileName = `Bao_cao_Su_co_${filterDate}.xlsx`; wsName = 'BaoCaoSuCo';
        } else {
            return;
        }
        
        const ws = utils.json_to_sheet(dataToExport);
        const wb = utils.book_new();
        utils.book_append_sheet(wb, ws, wsName);
        writeFile(wb, fileName);
    };

    const renderContent = () => {
        switch(activeSubPage) {
            case 'dashboard':
                return <SafetyDashboardPage onNavigate={setActiveSubPage} />;

            case 'access': return (
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-white border-b-2 border-black"><tr><th className="px-4 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Khu vực</th><th className="px-4 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Họ tên / Đơn vị</th><th className="px-4 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Công việc</th><th className="px-4 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Thời gian vào</th><th className="px-4 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Thời gian ra</th><th className="px-4 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Ghi chú</th><th className="px-4 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Hành động</th></tr></thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                        {filteredAccessLogs.length > 0 ? filteredAccessLogs.map(log => (<tr key={log.id}><td className="px-4 py-4 text-sm font-medium text-black">{log.areaName}</td><td className="px-4 py-4 text-sm text-black">{log.personOrUnit}</td><td className="px-4 py-4 text-sm text-black">{log.task}</td><td className="px-4 py-4 text-sm text-black">{formatDateTime(log.entryTime)}</td><td className="px-4 py-4 text-sm text-black">{formatDateTime(log.exitTime)}</td><td className="px-4 py-4 text-sm text-black">{log.notes}</td><td className="px-4 py-4 text-sm">{!log.exitTime && <button onClick={() => handleOpenAccessLogModal(log)} className="text-blue-600 hover:text-blue-800 flex items-center gap-1"><LogoutIcon className="w-4 h-4"/> Rời khỏi</button>}</td></tr>
                        )) : (<tr><td colSpan={7} className="text-center py-10 text-black">Không có dữ liệu ra/vào trong ngày đã chọn.</td></tr>)}
                    </tbody>
                </table>
            );
            case 'areaEnv': return (
                 <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-white border-b-2 border-black"><tr><th className="px-4 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Khu vực</th><th className="px-4 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Thời gian</th><th className="px-4 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Nhiệt độ (°C)</th><th className="px-4 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Độ ẩm (%)</th><th className="px-4 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Người ghi nhận</th><th className="px-4 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Ghi chú</th></tr></thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                        {filteredAreaEnvLogs.length > 0 ? filteredAreaEnvLogs.map(log => { const area = areaMap.get(log.areaId); const tempOk = !area || (area.minTemp === undefined || log.temperature >= area.minTemp) && (area.maxTemp === undefined || log.temperature <= area.maxTemp); const humOk = !area || (area.minHumidity === undefined || log.humidity >= area.minHumidity) && (area.maxHumidity === undefined || log.humidity <= area.maxHumidity); return (<tr key={log.id} className={!tempOk || !humOk ? 'bg-red-50' : ''}><td className="px-4 py-4 text-sm font-medium text-black">{log.areaName}</td><td className="px-4 py-4 text-sm text-black">{log.time}</td><td className={`px-4 py-4 text-sm font-semibold ${!tempOk ? 'text-red-600' : 'text-black'}`}>{log.temperature}</td><td className={`px-4 py-4 text-sm font-semibold ${!humOk ? 'text-red-600' : 'text-black'}`}>{log.humidity}</td><td className="px-4 py-4 text-sm text-black">{log.recordedBy}</td><td className="px-4 py-4 text-sm text-black">{log.notes}</td></tr>)}) : (<tr><td colSpan={6} className="text-center py-10 text-black">Không có dữ liệu môi trường cho ngày hoặc khu vực đã chọn.</td></tr>)}
                    </tbody>
                </table>
            );
            case 'equipEnv': return (
                 <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-white border-b-2 border-black"><tr><th className="px-4 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Thiết bị</th><th className="px-4 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Thời gian</th><th className="px-4 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Nhiệt độ (°C)</th><th className="px-4 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Người ghi nhận</th><th className="px-4 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Ghi chú</th></tr></thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                        {filteredEquipEnvLogs.length > 0 ? filteredEquipEnvLogs.map(log => { const equip = equipmentMap.get(log.equipmentId); const tempOk = !equip || (equip.minTemp === undefined || log.temperature >= equip.minTemp) && (equip.maxTemp === undefined || log.temperature <= equip.maxTemp); return (<tr key={log.id} className={!tempOk ? 'bg-red-50' : ''}><td className="px-4 py-4 text-sm font-medium text-black">{log.equipmentName}</td><td className="px-4 py-4 text-sm text-black">{log.time}</td><td className={`px-4 py-4 text-sm font-semibold ${!tempOk ? 'text-red-600' : 'text-black'}`}>{log.temperature}</td><td className="px-4 py-4 text-sm text-black">{log.recordedBy}</td><td className="px-4 py-4 text-sm text-black">{log.notes}</td></tr>)}) : (<tr><td colSpan={5} className="text-center py-10 text-black">Không có dữ liệu nhiệt độ thiết bị trong ngày đã chọn.</td></tr>)}
                    </tbody>
                </table>
            );
            case 'waterConductivity': return (
                 <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-white border-b-2 border-black"><tr><th className="px-4 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Nguồn nước</th><th className="px-4 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Thời gian</th><th className="px-4 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Độ dẫn điện (µS/cm)</th><th className="px-4 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Người ghi nhận</th><th className="px-4 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Ghi chú</th></tr></thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                        {filteredWaterConductivityLogs.length > 0 ? filteredWaterConductivityLogs.map(log => { const source = waterSourceMap.get(log.sourceId); const condOk = !source || (log.conductivity >= source.minConductivity && log.conductivity <= source.maxConductivity); return (<tr key={log.id} className={!condOk ? 'bg-red-50' : ''}><td className="px-4 py-4 text-sm font-medium text-black">{log.sourceName}</td><td className="px-4 py-4 text-sm text-black">{log.time}</td><td className={`px-4 py-4 text-sm font-semibold ${!condOk ? 'text-red-600' : 'text-black'}`}>{log.conductivity}</td><td className="px-4 py-4 text-sm text-black">{log.recordedBy}</td><td className="px-4 py-4 text-sm text-black">{log.notes}</td></tr>)}) : (<tr><td colSpan={5} className="text-center py-10 text-black">Không có dữ liệu độ dẫn điện trong ngày đã chọn.</td></tr>)}
                    </tbody>
                </table>
            );
            case 'incidents': return (
                 <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-white border-b-2 border-black"><tr><th className="px-4 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Thời gian</th><th className="px-4 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Mô tả sự cố</th><th className="px-4 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Đặc điểm</th><th className="px-4 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Người báo cáo</th><th className="px-4 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Tình trạng</th><th className="px-4 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Hành động</th></tr></thead>
                     <tbody className="bg-white divide-y divide-slate-200">
                        {filteredIncidentReports.length > 0 ? filteredIncidentReports.map(report => { const statusColor = { 'Mở': 'bg-red-100 text-red-800', 'Đang xử lý': 'bg-yellow-100 text-yellow-800', 'Đã đóng': 'bg-green-100 text-green-800' }[report.status]; return (<tr key={report.id}><td className="px-4 py-4 text-sm text-black align-top">{report.time}</td><td className="px-4 py-4 text-sm text-black align-top"><p className="font-semibold">{report.description}</p><p className="text-xs text-slate-600 mt-1">Vị trí: {report.location}</p></td><td className="px-4 py-4 text-sm text-black align-top">{report.incidentType}</td><td className="px-4 py-4 text-sm text-black align-top">{report.reportedBy}</td><td className="px-4 py-4 text-sm align-top"><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColor}`}>{report.status}</span></td><td className="px-4 py-4 text-sm align-top"><div className="flex gap-2"><button onClick={() => onExportIncidentToDoc(report)} className="text-green-600 p-1 hover:bg-green-100 rounded-full" title="Xuất ra file Word (.doc)"><DocumentArrowDownIcon/></button><button onClick={() => handleOpenIncidentModal(report)} className="text-blue-600 p-1 hover:bg-blue-100 rounded-full" title="Sửa / Xem chi tiết"><EditIcon /></button><button onClick={() => onDeleteIncidentReport(report.id)} className="text-red-600 p-1 hover:bg-red-100 rounded-full" title="Xóa"><TrashIcon /></button></div></td></tr>)}) : (<tr><td colSpan={6} className="text-center py-10 text-black">Không có sự cố nào được báo cáo trong ngày đã chọn.</td></tr>)}
                    </tbody>
                </table>
            );
            case 'manageItems': return (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div>
                        <h3 className="text-lg font-semibold text-slate-700 mb-4">Danh sách Khu vực</h3>
                        <div className="overflow-y-auto border rounded-lg">
                             <table className="min-w-full divide-y divide-slate-200"><thead className="bg-white border-b-2 border-black"><tr><th className="px-4 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Tên</th><th className="px-4 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Ngưỡng</th><th className="px-4 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Hành động</th></tr></thead><tbody className="bg-white divide-y divide-slate-200">{monitoredAreas.map(area => (<tr key={area.id}><td className="px-4 py-4 text-sm font-medium text-black">{area.name}</td><td className="px-4 py-4 text-xs text-black">{area.minTemp !== undefined && <div>NĐ: {area.minTemp}-{area.maxTemp}°C</div>}{area.minHumidity !== undefined && <div>ĐA: {area.minHumidity}-{area.maxHumidity}%</div>}</td><td className="px-4 py-4 text-sm"><div className="flex gap-2"><button onClick={() => handleOpenItemModal('area', area)} className="text-blue-600 p-1 hover:bg-blue-100 rounded-full"><EditIcon /></button><button onClick={() => onDeleteItem('area', area.id)} className="text-red-600 p-1 hover:bg-red-100 rounded-full"><TrashIcon /></button></div></td></tr>))}</tbody></table>
                        </div>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-slate-700 mb-4">Danh sách Thiết bị</h3>
                        <div className="overflow-y-auto border rounded-lg">
                             <table className="min-w-full divide-y divide-slate-200"><thead className="bg-white border-b-2 border-black"><tr><th className="px-4 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Tên</th><th className="px-4 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Ngưỡng</th><th className="px-4 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Hành động</th></tr></thead><tbody className="bg-white divide-y divide-slate-200">{monitoredEquipment.map(equip => (<tr key={equip.id}><td className="px-4 py-4 text-black"><div className="text-sm font-medium">{equip.name}</div><div className="text-xs">{equip.type}</div></td><td className="px-4 py-4 text-xs text-black">{equip.minTemp !== undefined && <div>NĐ: {equip.minTemp}-{equip.maxTemp}°C</div>}</td><td className="px-4 py-4 text-sm"><div className="flex gap-2"><button onClick={() => handleOpenItemModal('equipment', equip)} className="text-blue-600 p-1 hover:bg-blue-100 rounded-full"><EditIcon /></button><button onClick={() => onDeleteItem('equipment', equip.id)} className="text-red-600 p-1 hover:bg-red-100 rounded-full"><TrashIcon /></button></div></td></tr>))}</tbody></table>
                        </div>
                    </div>
                     <div>
                        <h3 className="text-lg font-semibold text-slate-700 mb-4">Danh sách Nguồn nước</h3>
                        <div className="overflow-y-auto border rounded-lg">
                             <table className="min-w-full divide-y divide-slate-200"><thead className="bg-white border-b-2 border-black"><tr><th className="px-4 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Tên</th><th className="px-4 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Ngưỡng</th><th className="px-4 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Hành động</th></tr></thead><tbody className="bg-white divide-y divide-slate-200">{waterSources.map(source => (<tr key={source.id}><td className="px-4 py-4 text-black"><div className="text-sm font-medium">{source.name}</div><div className="text-xs">{source.location}</div></td><td className="px-4 py-4 text-xs text-black">ĐDĐ: {source.minConductivity}-{source.maxConductivity}µS/cm</td><td className="px-4 py-4 text-sm"><div className="flex gap-2"><button onClick={() => handleOpenItemModal('waterSource', source)} className="text-blue-600 p-1 hover:bg-blue-100 rounded-full"><EditIcon /></button><button onClick={() => onDeleteItem('waterSource', source.id)} className="text-red-600 p-1 hover:bg-red-100 rounded-full"><TrashIcon /></button></div></td></tr>))}</tbody></table>
                        </div>
                    </div>
                </div>
            );

            default: return null;
        }
    }

  return (
    <>
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-800">
                An toàn & Môi trường
                <span className="text-lg font-semibold text-slate-500 ml-2">/ {currentPageLabel}</span>
            </h1>
            {activeSubPage !== 'dashboard' && (
                <button
                    onClick={() => setActiveSubPage('dashboard')}
                    className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800"
                >
                    &larr; Quay lại Bảng điều khiển
                </button>
            )}
        </div>

        {activeSubPage !== 'dashboard' && (
             <div className="flex flex-wrap justify-between items-end mb-6 gap-4">
                <div className="flex flex-wrap items-end gap-4">
                    {activeSubPage !== 'manageItems' && (
                        <div><label className="block text-sm font-medium text-slate-600 mb-1">Xem dữ liệu ngày</label><input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)} className="p-2 border border-slate-300 rounded-md bg-white text-slate-900"/></div>
                    )}
                    {activeSubPage === 'areaEnv' && (<div><label className="block text-sm font-medium text-slate-600 mb-1">Lọc theo khu vực</label><select value={areaFilter} onChange={e => setAreaFilter(e.target.value)} className="p-2 border border-slate-300 rounded-md bg-white text-slate-900 min-w-[200px]"><option value="">Tất cả khu vực</option>{monitoredAreas.map(area => (<option key={area.id} value={area.id}>{area.name}</option>))}</select></div>)}
                    {activeSubPage === 'equipEnv' && (<div><label className="block text-sm font-medium text-slate-600 mb-1">Lọc theo thiết bị</label><select value={equipmentFilter} onChange={e => setEquipmentFilter(e.target.value)} className="p-2 border border-slate-300 rounded-md bg-white text-slate-900 min-w-[200px]"><option value="">Tất cả thiết bị</option>{monitoredEquipment.map(eq => (<option key={eq.id} value={eq.id}>{eq.name}</option>))}</select></div>)}
                    {activeSubPage === 'waterConductivity' && (<div><label className="block text-sm font-medium text-slate-600 mb-1">Lọc theo nguồn nước</label><select value={waterSourceFilter} onChange={e => setWaterSourceFilter(e.target.value)} className="p-2 border border-slate-300 rounded-md bg-white text-slate-900 min-w-[200px]"><option value="">Tất cả nguồn nước</option>{waterSources.map(ws => (<option key={ws.id} value={ws.id}>{ws.name}</option>))}</select></div>)}
                </div>
                <div className="flex items-center gap-2">
                    {activeSubPage !== 'manageItems' && (<button onClick={handleExport} disabled={(activeSubPage === 'access' && filteredAccessLogs.length === 0) || (activeSubPage === 'areaEnv' && filteredAreaEnvLogs.length === 0) || (activeSubPage === 'equipEnv' && filteredEquipEnvLogs.length === 0) || (activeSubPage === 'waterConductivity' && filteredWaterConductivityLogs.length === 0) || (activeSubPage === 'incidents' && filteredIncidentReports.length === 0)} className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 disabled:bg-slate-400"><ExportIcon className="w-5 h-5"/> Xuất Excel</button>)}
                    {activeSubPage === 'access' && <button onClick={() => handleOpenAccessLogModal()} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"><LoginIcon className="w-5 h-5"/> Ghi nhận Ra/Vào</button>}
                    {activeSubPage === 'areaEnv' && <button onClick={() => handleOpenEnvLogModal('area')} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"><ThermometerIcon className="w-5 h-5"/> Ghi nhận</button>}
                    {activeSubPage === 'equipEnv' && <button onClick={() => handleOpenEnvLogModal('equipment')} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"><ThermometerIcon className="w-5 h-5"/> Ghi nhận</button>}
                    {activeSubPage === 'waterConductivity' && <button onClick={() => handleOpenEnvLogModal('water')} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"><WaterIcon className="w-5 h-5"/> Ghi nhận</button>}
                    {activeSubPage === 'incidents' && <button onClick={() => handleOpenIncidentModal()} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"><DocumentAlertIcon className="w-5 h-5"/> Tạo Phiếu mới</button>}
                    {activeSubPage === 'manageItems' && (<div className="flex gap-2"><button onClick={() => handleOpenItemModal('area')} className="inline-flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700"><BuildingStorefrontIcon className="w-5 h-5"/> Thêm Khu vực</button><button onClick={() => handleOpenItemModal('equipment')} className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"><BeakerIcon className="w-5 h-5"/> Thêm Thiết bị</button><button onClick={() => handleOpenItemModal('waterSource')} className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700"><WaterIcon className="w-5 h-5"/> Thêm Nguồn nước</button></div>)}
                </div>
            </div>
        )}

        <div className="overflow-x-auto">
            {renderContent()}
        </div>

      </div>
       <AccessLogFormModal isOpen={isAccessLogModalOpen} onClose={() => setAccessLogModalOpen(false)} onSubmit={(data) => 'id' in data ? onUpdateAccessLog(data) : onAddAccessLog(data)} logToUpdate={logToCheckout} currentUser={currentUser} monitoredAreas={monitoredAreas}/>
        <EnvironmentLogFormModal isOpen={isEnvLogModalOpen} onClose={() => setEnvLogModalOpen(false)} onSubmit={(data) => { if (envLogType === 'area') onAddAreaEnvLog(data as any); else if (envLogType === 'equipment') onAddEquipEnvLog(data as any); else if (envLogType === 'water') onAddWaterConductivityLog(data as any); }} logType={envLogType} items={envLogType === 'area' ? monitoredAreas : (envLogType === 'equipment' ? monitoredEquipment : waterSources)} currentUser={currentUser}/>
         <MonitoredItemFormModal isOpen={isItemModalOpen} onClose={() => setItemModalOpen(false)} onSubmit={(data) => 'id' in data ? onUpdateItem(itemType, data as any) : onAddItem(itemType, data)} itemType={itemType} initialData={itemToEdit}/>
        <IncidentReportFormModal isOpen={isIncidentModalOpen} onClose={() => setIncidentModalOpen(false)} onSubmit={onAddOrUpdateIncidentReport} initialData={editingIncident} currentUser={currentUser}/>
    </>
  );
};

export default EnvironmentSafetyPage;