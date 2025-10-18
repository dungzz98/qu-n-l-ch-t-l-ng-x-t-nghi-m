import React, { useMemo } from 'react';
import { Chemical, OnInstrumentStock, MonitoredArea, MonitoredEquipment, AreaEnvironmentLog, EquipmentTemperatureLog, WaterSource, WaterConductivityLog } from '../types';
import { SubPage } from './WarehouseManagementPage';
import { WarningIcon } from './icons/WarningIcon';
import { InventoryIcon } from './icons/InventoryIcon';
import { BeakerIcon } from './icons/BeakerIcon';
import { ShieldCheckIcon } from './icons/ShieldCheckIcon';


interface DashboardPageProps {
  chemicals: Chemical[];
  onInstrumentStock: OnInstrumentStock[];
  monitoredAreas: MonitoredArea[];
  monitoredEquipment: MonitoredEquipment[];
  areaEnvLogs: AreaEnvironmentLog[];
  equipmentTempLogs: EquipmentTemperatureLog[];
  waterSources: WaterSource[];
  waterConductivityLogs: WaterConductivityLog[];
  onNavigate: (page: SubPage) => void;
}

const getStatus = (chemical: Pick<Chemical, 'expirationDate' | 'quantity'>) => {
    const expiration = new Date(chemical.expirationDate);
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);

    if (chemical.quantity <= 0) {
        return 'Hết hàng';
    }
    if (expiration < today) {
        return 'Hết hạn';
    }
    if (expiration < thirtyDaysFromNow) {
        return 'Sắp hết hạn';
    }
    return 'Còn hàng';
};

const formatDate = (dateString: string) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString + 'T00:00:00');
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

const DashboardPage: React.FC<DashboardPageProps> = (props) => {
    const { chemicals, onInstrumentStock, monitoredAreas, monitoredEquipment, areaEnvLogs, equipmentTempLogs, waterSources, waterConductivityLogs, onNavigate } = props;
    
    const summary = useMemo(() => {
        const expiringSoon = chemicals.filter(c => getStatus(c) === 'Sắp hết hạn');
        const expired = chemicals.filter(c => getStatus(c) === 'Hết hạn');
        const outOfStock = chemicals.filter(c => getStatus(c) === 'Hết hàng');
        
        const totalStockItems = chemicals.length;
        const totalOnInstrumentItems = onInstrumentStock.length;

        // Environmental Alerts Logic
        const envAlerts: string[] = [];
        const latestAreaLogs = new Map<string, AreaEnvironmentLog>();
        areaEnvLogs.forEach(log => {
            const existing = latestAreaLogs.get(log.areaId);
            if (!existing || new Date(`${log.date}T${log.time}`) > new Date(`${existing.date}T${existing.time}`)) {
                latestAreaLogs.set(log.areaId, log);
            }
        });
        
        monitoredAreas.forEach(area => {
            const log = latestAreaLogs.get(area.id);
            if (log) {
                if (area.minTemp !== undefined && log.temperature < area.minTemp) envAlerts.push(`${area.name}: Nhiệt độ thấp (${log.temperature}°C)`);
                if (area.maxTemp !== undefined && log.temperature > area.maxTemp) envAlerts.push(`${area.name}: Nhiệt độ cao (${log.temperature}°C)`);
                if (area.minHumidity !== undefined && log.humidity < area.minHumidity) envAlerts.push(`${area.name}: Độ ẩm thấp (${log.humidity}%)`);
                if (area.maxHumidity !== undefined && log.humidity > area.maxHumidity) envAlerts.push(`${area.name}: Độ ẩm cao (${log.humidity}%)`);
            }
        });

        const latestEquipLogs = new Map<string, EquipmentTemperatureLog>();
        equipmentTempLogs.forEach(log => {
            const existing = latestEquipLogs.get(log.equipmentId);
            if (!existing || new Date(`${log.date}T${log.time}`) > new Date(`${existing.date}T${existing.time}`)) {
                latestEquipLogs.set(log.equipmentId, log);
            }
        });
        
        monitoredEquipment.forEach(equip => {
            const log = latestEquipLogs.get(equip.id);
            if (log) {
                if (equip.minTemp !== undefined && log.temperature < equip.minTemp) envAlerts.push(`${equip.name}: Nhiệt độ thấp (${log.temperature}°C)`);
                if (equip.maxTemp !== undefined && log.temperature > equip.maxTemp) envAlerts.push(`${equip.name}: Nhiệt độ cao (${log.temperature}°C)`);
            }
        });
        
        const latestWaterLogs = new Map<string, WaterConductivityLog>();
        waterConductivityLogs.forEach(log => {
            const existing = latestWaterLogs.get(log.sourceId);
             if (!existing || new Date(`${log.date}T${log.time}`) > new Date(`${existing.date}T${existing.time}`)) {
                latestWaterLogs.set(log.sourceId, log);
            }
        });

        waterSources.forEach(source => {
            const log = latestWaterLogs.get(source.id);
            if (log) {
                if (log.conductivity < source.minConductivity) envAlerts.push(`${source.name}: Độ dẫn điện thấp (${log.conductivity}µS/cm)`);
                if (log.conductivity > source.maxConductivity) envAlerts.push(`${source.name}: Độ dẫn điện cao (${log.conductivity}µS/cm)`);
            }
        });


        return { expiringSoon, expired, outOfStock, totalStockItems, totalOnInstrumentItems, envAlerts };
    }, [chemicals, onInstrumentStock, monitoredAreas, monitoredEquipment, areaEnvLogs, equipmentTempLogs, waterSources, waterConductivityLogs]);

    const AlertList: React.FC<{title: string, items: (Chemical | string)[], color: 'yellow' | 'red'}> = ({title, items, color}) => {
        if (items.length === 0) return null;
        
        const borderColor = color === 'yellow' ? 'border-yellow-500' : 'border-red-500';
        const textColor = color === 'yellow' ? 'text-yellow-700' : 'text-red-700';

        return (
            <div className={`border-l-4 ${borderColor} p-4 bg-white rounded-r-lg shadow`}>
                <h3 className={`text-lg font-bold ${textColor} mb-2`}>{title} ({items.length})</h3>
                <ul className="space-y-2 text-sm max-h-48 overflow-y-auto">
                    {items.map((item, index) => (
                        <li key={typeof item === 'string' ? index : item.id} className="text-slate-600">
                           {typeof item === 'string' ? item : <><span className="font-semibold">{item.name}</span> (Lô: {item.lotNumber}) - HSD: {formatDate(item.expirationDate)}</>}
                        </li>
                    ))}
                </ul>
            </div>
        );
    };

    return (
        <div>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow-lg flex items-center">
                    <div className="p-3 bg-blue-100 rounded-full mr-4">
                        <InventoryIcon className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500">Tổng số lô trong kho</p>
                        <p className="text-2xl font-bold text-slate-800">{summary.totalStockItems}</p>
                    </div>
                </div>
                 <div className="bg-white p-6 rounded-lg shadow-lg flex items-center">
                    <div className="p-3 bg-sky-100 rounded-full mr-4">
                        <BeakerIcon className="w-6 h-6 text-sky-600" />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500">Hóa chất trên máy</p>
                        <p className="text-2xl font-bold text-slate-800">{summary.totalOnInstrumentItems}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-lg flex items-center">
                    <div className="p-3 bg-yellow-100 rounded-full mr-4">
                        <WarningIcon className="w-6 h-6 text-yellow-600" />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500">Cảnh báo Tồn kho</p>
                        <p className="text-2xl font-bold text-slate-800">{summary.expiringSoon.length + summary.expired.length}</p>
                    </div>
                </div>
                 <div className="bg-white p-6 rounded-lg shadow-lg flex items-center">
                    <div className="p-3 bg-red-100 rounded-full mr-4">
                        <ShieldCheckIcon className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500">Cảnh báo Môi trường</p>
                        <p className="text-2xl font-bold text-slate-800">{summary.envAlerts.length}</p>
                    </div>
                </div>
            </div>

            {/* Alerts Section */}
             <div className="space-y-6">
                <AlertList title="Cảnh báo Môi trường" items={summary.envAlerts} color="red" />
                <AlertList title="Hóa chất sắp hết hạn" items={summary.expiringSoon} color="yellow" />
                <AlertList title="Hóa chất đã hết hạn" items={summary.expired} color="red" />
            </div>
        </div>
    );
};

export default DashboardPage;