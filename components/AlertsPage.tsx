import React, { useMemo } from 'react';
import { 
    Chemical, LabEquipment, IQCResult, ControlLotTarget, TestParameter, ControlMaterial, 
    MonitoredArea, MonitoredEquipment, WaterSource, AreaEnvironmentLog, 
    EquipmentTemperatureLog, WaterConductivityLog, IncidentReport, WestgardViolation 
} from '../types';
import { analyzeWestgard } from '../services/westgardService';
import { ChartBarSquareIcon } from './icons/ChartBarSquareIcon';
import { ToolIcon } from './icons/ToolIcon';
import { ShieldCheckIcon } from './icons/ShieldCheckIcon';
import { ArchiveBoxIcon } from './icons/ArchiveBoxIcon';

interface AlertsPageProps {
    chemicals: Chemical[];
    labEquipment: LabEquipment[];
    iqcResults: IQCResult[];
    controlLotTargets: ControlLotTarget[];
    testParameters: TestParameter[];
    controlMaterials: ControlMaterial[];
    monitoredAreas: MonitoredArea[];
    monitoredEquipment: MonitoredEquipment[];
    waterSources: WaterSource[];
    areaEnvLogs: AreaEnvironmentLog[];
    equipmentTempLogs: EquipmentTemperatureLog[];
    waterConductivityLogs: WaterConductivityLog[];
    incidentReports: IncidentReport[];
}

interface Alert {
    id: string;
    severity: 'critical' | 'warning';
    message: string;
    details?: string;
}

const AlertCategoryCard: React.FC<{ title: string, icon: React.ReactNode, alerts: Alert[] }> = ({ title, icon, alerts }) => {
    const criticalCount = alerts.filter(a => a.severity === 'critical').length;
    const warningCount = alerts.filter(a => a.severity === 'warning').length;

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg border-t-4 border-slate-200">
            <div className="flex items-center mb-4">
                <div className="p-3 bg-slate-100 text-slate-600 rounded-full mr-4">{icon}</div>
                <div>
                    <h3 className="text-lg font-bold text-slate-800">{title}</h3>
                    <div className="flex items-center gap-4 text-sm">
                        {criticalCount > 0 && <span className="font-semibold text-red-600">{criticalCount} Nghiêm trọng</span>}
                        {warningCount > 0 && <span className="font-semibold text-yellow-600">{warningCount} Cảnh báo</span>}
                    </div>
                </div>
            </div>
            {alerts.length > 0 ? (
                <ul className="space-y-3 max-h-64 overflow-y-auto pr-2">
                    {alerts.map(alert => (
                        <li key={alert.id} className={`p-3 rounded-md text-sm ${alert.severity === 'critical' ? 'bg-red-50 border-l-4 border-red-500 text-red-800' : 'bg-yellow-50 border-l-4 border-yellow-500 text-yellow-800'}`}>
                            <p className="font-semibold">{alert.message}</p>
                            {alert.details && <p className="text-xs mt-1">{alert.details}</p>}
                        </li>
                    ))}
                </ul>
            ) : (
                <div className="text-center py-8 text-slate-500">
                    <p>Không có cảnh báo nào.</p>
                </div>
            )}
        </div>
    );
};


const AlertsPage: React.FC<AlertsPageProps> = (props) => {
    const { 
        chemicals, labEquipment, iqcResults, controlLotTargets, testParameters, controlMaterials,
        monitoredAreas, monitoredEquipment, waterSources, areaEnvLogs, equipmentTempLogs, 
        waterConductivityLogs, incidentReports 
    } = props;

    const qcAlerts = useMemo<Alert[]>(() => {
        const alerts: Alert[] = [];
        // FIX: Explicitly type Maps to ensure correct type inference for `test` and `control`.
        const testMap = new Map<string, TestParameter>(testParameters.map(t => [t.id, t]));
        const controlMap = new Map<string, ControlMaterial>(controlMaterials.map(c => [c.id, c]));

        controlLotTargets.forEach(target => {
            const resultsForTarget = iqcResults.filter(r => r.testParameterId === target.testParameterId && r.controlMaterialId === target.controlMaterialId);
            if (resultsForTarget.length === 0) return;
            
            const violations = analyzeWestgard(resultsForTarget, target.mean, target.sd);
            violations.forEach(v => {
                const test = testMap.get(target.testParameterId);
                const control = controlMap.get(target.controlMaterialId);
                const isCritical = v.rule !== '1-2s'; // 1-2s is a warning
                
                alerts.push({
                    id: `qc-${v.resultId}-${v.rule}`,
                    severity: isCritical ? 'critical' : 'warning',
                    message: `Vi phạm ${v.rule.toUpperCase()}: ${test?.name || 'N/A'} - ${control?.level || 'N/A'}`,
                    details: v.message,
                });
            });
        });

        // Get only latest violation per test/control combo to avoid clutter
        const uniqueAlerts = Array.from(new Map(alerts.reverse().map(a => [`${a.message}`, a])).values()).reverse();
        return uniqueAlerts;
    }, [iqcResults, controlLotTargets, testParameters, controlMaterials]);

    const equipmentAlerts = useMemo<Alert[]>(() => {
        const alerts: Alert[] = [];
        const today = new Date();
        today.setHours(0,0,0,0);

        labEquipment.forEach(eq => {
            if (eq.nextMaintenance) {
                const nextMaintDate = new Date(eq.nextMaintenance + 'T00:00:00');
                if (nextMaintDate < today) {
                    alerts.push({
                        id: `equip-maint-${eq.id}`,
                        severity: 'critical',
                        message: `Bảo trì quá hạn: ${eq.name}`,
                        details: `Hạn cuối: ${nextMaintDate.toLocaleDateString('vi-VN')}`
                    });
                }
            }
            if (eq.nextCalibration) {
                const nextCalibDate = new Date(eq.nextCalibration + 'T00:00:00');
                if (nextCalibDate < today) {
                    alerts.push({
                        id: `equip-calib-${eq.id}`,
                        severity: 'critical',
                        message: `Hiệu chuẩn quá hạn: ${eq.name}`,
                        details: `Hạn cuối: ${nextCalibDate.toLocaleDateString('vi-VN')}`
                    });
                }
            }
        });
        return alerts;
    }, [labEquipment]);

    const environmentAlerts = useMemo<Alert[]>(() => {
        let alerts: Alert[] = [];

        // --- Area logs ---
        const latestAreaLogs = new Map<string, AreaEnvironmentLog>();
        areaEnvLogs.forEach(log => {
            const existing = latestAreaLogs.get(log.areaId);
            if (!existing || new Date(`${log.date}T${log.time}`) > new Date(`${existing.date}T${existing.time}`)) {
                latestAreaLogs.set(log.areaId, log);
            }
        });
        
        monitoredAreas.forEach(area => {
            const log = latestAreaLogs.get(area.id);
            if(log) {
                if (area.minTemp !== undefined && log.temperature < area.minTemp) alerts.push({ id: `env-area-temp-low-${log.id}`, severity: 'critical', message: `${area.name}: Nhiệt độ thấp (${log.temperature}°C)`, details: `Ngưỡng: ${area.minTemp}°C` });
                if (area.maxTemp !== undefined && log.temperature > area.maxTemp) alerts.push({ id: `env-area-temp-high-${log.id}`, severity: 'critical', message: `${area.name}: Nhiệt độ cao (${log.temperature}°C)`, details: `Ngưỡng: ${area.maxTemp}°C` });
                if (area.minHumidity !== undefined && log.humidity < area.minHumidity) alerts.push({ id: `env-area-hum-low-${log.id}`, severity: 'warning', message: `${area.name}: Độ ẩm thấp (${log.humidity}%)`, details: `Ngưỡng: ${area.minHumidity}%` });
                if (area.maxHumidity !== undefined && log.humidity > area.maxHumidity) alerts.push({ id: `env-area-hum-high-${log.id}`, severity: 'warning', message: `${area.name}: Độ ẩm cao (${log.humidity}%)`, details: `Ngưỡng: ${area.maxHumidity}%` });
            }
        });

        // --- Equipment logs ---
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
                if (equip.minTemp !== undefined && log.temperature < equip.minTemp) alerts.push({ id: `env-equip-temp-low-${log.id}`, severity: 'critical', message: `${equip.name}: Nhiệt độ thấp (${log.temperature}°C)`, details: `Ngưỡng: ${equip.minTemp}°C` });
                if (equip.maxTemp !== undefined && log.temperature > equip.maxTemp) alerts.push({ id: `env-equip-temp-high-${log.id}`, severity: 'critical', message: `${equip.name}: Nhiệt độ cao (${log.temperature}°C)`, details: `Ngưỡng: ${equip.maxTemp}°C` });
            }
        });
        
        // --- Water logs ---
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
                if (log.conductivity < source.minConductivity) alerts.push({ id: `env-water-cond-low-${log.id}`, severity: 'warning', message: `${source.name}: Độ dẫn điện thấp (${log.conductivity}µS/cm)`, details: `Ngưỡng: >${source.minConductivity}µS/cm` });
                if (log.conductivity > source.maxConductivity) alerts.push({ id: `env-water-cond-high-${log.id}`, severity: 'warning', message: `${source.name}: Độ dẫn điện cao (${log.conductivity}µS/cm)`, details: `Ngưỡng: <${source.maxConductivity}µS/cm` });
            }
        });

        // --- Incidents ---
        const openIncidents = incidentReports.filter(r => r.status !== 'Đã đóng');
        openIncidents.forEach(r => {
            alerts.push({
                id: `incident-${r.id}`,
                severity: 'critical',
                message: `Sự cố đang mở: ${r.description.substring(0, 50)}...`,
                details: `Vị trí: ${r.location} - Ngày: ${new Date(r.date + 'T00:00:00').toLocaleDateString('vi-VN')}`
            });
        });

        return alerts;
    }, [monitoredAreas, areaEnvLogs, monitoredEquipment, equipmentTempLogs, waterSources, waterConductivityLogs, incidentReports]);

    const inventoryAlerts = useMemo<Alert[]>(() => {
        const alerts: Alert[] = [];
        const today = new Date(); today.setHours(0,0,0,0);
        const thirtyDaysFromNow = new Date(); thirtyDaysFromNow.setDate(today.getDate() + 30);
        
        chemicals.forEach(c => {
            const expDate = new Date(c.expirationDate + 'T00:00:00');
            if (expDate < today) {
                alerts.push({
                    id: `inv-exp-${c.id}`, severity: 'critical', message: `Hết hạn: ${c.name} (Lô ${c.lotNumber})`,
                    details: `HSD: ${expDate.toLocaleDateString('vi-VN')}`
                });
            } else if (expDate <= thirtyDaysFromNow) {
                alerts.push({
                    id: `inv-expiring-${c.id}`, severity: 'warning', message: `Sắp hết hạn: ${c.name} (Lô ${c.lotNumber})`,
                    details: `HSD: ${expDate.toLocaleDateString('vi-VN')}`
                });
            }
        });
        return alerts;
    }, [chemicals]);

    return (
        <div>
            <h1 className="text-2xl font-bold text-slate-800 mb-6">Trung tâm Cảnh báo</h1>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <AlertCategoryCard title="Chất lượng Xét nghiệm" icon={<ChartBarSquareIcon className="w-6 h-6"/>} alerts={qcAlerts} />
                <AlertCategoryCard title="Thiết bị" icon={<ToolIcon className="w-6 h-6"/>} alerts={equipmentAlerts} />
                <AlertCategoryCard title="Môi trường & An toàn" icon={<ShieldCheckIcon className="w-6 h-6"/>} alerts={environmentAlerts} />
                <AlertCategoryCard title="Tồn kho" icon={<ArchiveBoxIcon className="w-6 h-6"/>} alerts={inventoryAlerts} />
            </div>
        </div>
    );
};

export default AlertsPage;
