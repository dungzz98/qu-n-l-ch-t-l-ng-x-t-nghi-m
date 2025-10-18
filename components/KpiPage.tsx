import React, { useState, useMemo, useEffect } from 'react';
import { PersonnelProfile, AttendanceRecord, LeaveRecord, Holiday, WorkSchedule, KpiScore } from '../types';
import { ExportIcon } from './icons/ExportIcon';
import { utils, writeFile } from 'xlsx';

interface KpiPageProps {
  personnel: PersonnelProfile[];
  attendanceRecords: AttendanceRecord[];
  leaveRecords: LeaveRecord[];
  holidays: Holiday[];
  workSchedule: WorkSchedule;
  kpiScores: KpiScore[];
  onAddOrUpdateKpiScore: (personnelId: string, date: string, bonusPoints: number, penaltyPoints: number, notes: string) => void;
}

const calculateDeviationMinutes = (checkIn: string, checkOut: string, workSchedule: WorkSchedule): number => {
    const start = new Date(`1970-01-01T${workSchedule.startTime}`);
    const end = new Date(`1970-01-01T${workSchedule.endTime}`);
    const checkInTime = new Date(`1970-01-01T${checkIn}`);
    const checkOutTime = new Date(`1970-01-01T${checkOut}`);
    
    const lateMinutes = checkInTime > start ? (checkInTime.getTime() - start.getTime()) / 60000 : 0;
    const earlyMinutes = checkOutTime < end ? (end.getTime() - checkOutTime.getTime()) / 60000 : 0;
    
    return Math.round(lateMinutes + earlyMinutes);
};

const KpiPage: React.FC<KpiPageProps> = (props) => {
    const { personnel, attendanceRecords, leaveRecords, holidays, workSchedule, kpiScores, onAddOrUpdateKpiScore } = props;
    const [date, setDate] = useState({ month: new Date().getMonth() + 1, year: new Date().getFullYear() });
    const [personnelFilter, setPersonnelFilter] = useState('');

    const sortedPersonnel = useMemo(() => 
        [...personnel].sort((a,b) => a.fullName.localeCompare(b.fullName, 'vi'))
    , [personnel]);
    
    const filteredPersonnel = useMemo(() => {
        if (!personnelFilter) return sortedPersonnel;
        const lowerCaseFilter = personnelFilter.toLowerCase();
        return sortedPersonnel.filter(p =>
            p.fullName.toLowerCase().includes(lowerCaseFilter)
        );
    }, [sortedPersonnel, personnelFilter]);

    const holidayMap = useMemo(() => new Map(holidays.map(h => [h.date, h.name])), [holidays]);
    const kpiScoreMap = useMemo(() => new Map(kpiScores.map(s => [s.id, s])), [kpiScores]);

    const kpiData = useMemo(() => {
        const { month, year } = date;
        const daysInMonth = new Date(year, month, 0).getDate();
        
        let standardWorkDays = 0;
        for (let day = 1; day <= daysInMonth; day++) {
            const currentDate = new Date(year, month - 1, day);
            const dateStr = currentDate.toISOString().split('T')[0];
            const dayOfWeek = currentDate.getDay();
            if (dayOfWeek !== 0 && dayOfWeek !== 6 && !holidayMap.has(dateStr)) {
                standardWorkDays++;
            }
        }
        
        return filteredPersonnel.map(p => {
            let totalScore = 0;
            let actualWorkDays = 0;
            
            const attendanceInMonth = attendanceRecords.filter(a => 
                a.personnelId === p.id && 
                new Date(a.date).getFullYear() === year &&
                new Date(a.date).getMonth() + 1 === month
            );
            
            actualWorkDays = attendanceInMonth.length;
            
            attendanceInMonth.forEach(a => {
                const deviationMins = calculateDeviationMinutes(a.checkIn, a.checkOut, workSchedule);
                const deduction = (deviationMins / 480) * 100; // 8 hours = 480 minutes
                let attendanceScore = 100 - deduction;
                if (attendanceScore < 0) attendanceScore = 0;
                
                const kpi = kpiScoreMap.get(`${p.id}-${a.date}`);
                totalScore += attendanceScore + (kpi?.bonusPoints || 0) - (kpi?.penaltyPoints || 0);
            });

            const maxPossibleScore = standardWorkDays * 100;
            const completionRate = maxPossibleScore > 0 ? (totalScore / maxPossibleScore) * 100 : 0;

            return {
                personnelId: p.id,
                fullName: p.fullName,
                totalScore: totalScore,
                standardWorkDays: standardWorkDays,
                actualWorkDays: actualWorkDays,
                completionRate: completionRate
            };
        });
    }, [date, filteredPersonnel, attendanceRecords, leaveRecords, holidays, workSchedule, kpiScores, holidayMap, kpiScoreMap]);
    
    const handleScoreChange = (personnelId: string, date: string, type: 'bonus' | 'penalty', value: string) => {
        const scoreValue = parseInt(value) || 0;
        const id = `${personnelId}-${date}`;
        const existing = kpiScoreMap.get(id) || { bonusPoints: 0, penaltyPoints: 0, notes: '' };
        
        const bonusPoints = type === 'bonus' ? scoreValue : existing.bonusPoints;
        const penaltyPoints = type === 'penalty' ? scoreValue : existing.penaltyPoints;

        onAddOrUpdateKpiScore(personnelId, date, bonusPoints, penaltyPoints, existing.notes);
    };

    const handleExport = () => {
        const dataToExport = kpiData.map(d => ({
            'Nhân viên': d.fullName,
            'Số ngày công chuẩn': d.standardWorkDays,
            'Số ngày công thực tế': d.actualWorkDays,
            'Tổng điểm': d.totalScore.toFixed(2),
            'Tỷ lệ hoàn thành (%)': d.completionRate.toFixed(2)
        }));
        const ws = utils.json_to_sheet(dataToExport);
        const wb = utils.book_new();
        utils.book_append_sheet(wb, ws, `KPI_Thang_${date.month}_${date.year}`);
        writeFile(wb, `KPI_Thang_${date.month}_${date.year}.xlsx`);
    };

    return (
        <div>
             <div className="flex flex-wrap justify-between items-center mb-4 gap-4 p-4 bg-white border rounded-lg">
                <div className="flex flex-wrap items-center gap-4">
                    <select value={date.month} onChange={e => setDate(d => ({...d, month: parseInt(e.target.value)}))} className="p-2 border rounded-md bg-white text-black border-gray-300">
                        {Array.from({length: 12}, (_, i) => i + 1).map(m => <option key={m} value={m}>Tháng {m}</option>)}
                    </select>
                    <input type="number" value={date.year} onChange={e => setDate(d => ({...d, year: parseInt(e.target.value)}))} className="p-2 border rounded-md w-24 bg-white text-black border-gray-300"/>
                    <input
                        type="text"
                        placeholder="Lọc theo tên nhân viên..."
                        value={personnelFilter}
                        onChange={e => setPersonnelFilter(e.target.value)}
                        className="p-2 border rounded-md bg-white text-black border-gray-300"
                    />
                </div>
                 <button onClick={handleExport} className="inline-flex items-center gap-2 px-3 py-2 bg-teal-600 text-white rounded-md text-sm hover:bg-teal-700">
                    <ExportIcon /> Xuất Excel
                </button>
            </div>
            <div className="overflow-x-auto border rounded-lg bg-white">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-white">
                        <tr className="border-b-2 border-black">
                            <th className="p-2 text-left sticky left-0 bg-white z-10 text-xs font-bold text-black uppercase tracking-wider">Nhân viên</th>
                            <th className="p-2 text-left text-xs font-bold text-black uppercase tracking-wider">Tổng điểm</th>
                            <th className="p-2 text-left text-xs font-bold text-black uppercase tracking-wider">Ngày công (Thực tế/Chuẩn)</th>
                            <th className="p-2 text-left text-xs font-bold text-black uppercase tracking-wider">Tỷ lệ HTCV</th>
                            {Array.from({ length: new Date(date.year, date.month, 0).getDate() }, (_, i) => i + 1).map(day => (
                                <th key={day} className="p-2 text-center min-w-[90px] text-xs font-bold text-black uppercase tracking-wider">{day}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                        {kpiData.map(d => (
                            <tr key={d.personnelId} className="hover:bg-gray-50">
                                <td className="p-2 font-medium sticky left-0 bg-white hover:bg-gray-50 z-10 border-r text-black">{d.fullName}</td>
                                <td className="p-2 font-bold text-black">{d.totalScore.toFixed(2)}</td>
                                <td className="p-2 text-black">{d.actualWorkDays}/{d.standardWorkDays}</td>
                                <td className={`p-2 font-bold ${d.completionRate >= 80 ? 'text-green-600' : 'text-red-600'}`}>{d.completionRate.toFixed(2)}%</td>
                                {Array.from({ length: new Date(date.year, date.month, 0).getDate() }, (_, i) => i + 1).map(day => {
                                    const dayDate = new Date(date.year, date.month - 1, day);
                                    const dateStr = dayDate.toISOString().split('T')[0];
                                    const att = attendanceRecords.find(a => a.personnelId === d.personnelId && a.date === dateStr);
                                    const kpi = kpiScoreMap.get(`${d.personnelId}-${dateStr}`);
                                    const isWorkDay = att && !holidayMap.has(dateStr) && dayDate.getDay() !== 0 && dayDate.getDay() !== 6;

                                    return (
                                        <td key={day} className="p-1 border-l align-top">
                                            {isWorkDay && (
                                                <div className="space-y-1">
                                                     <input 
                                                        type="number" 
                                                        placeholder="Điểm +"
                                                        defaultValue={kpi?.bonusPoints || ''}
                                                        onBlur={(e) => handleScoreChange(d.personnelId, dateStr, 'bonus', e.target.value)}
                                                        className="w-full text-xs p-1 border rounded bg-white text-green-700 placeholder-green-400 focus:ring-green-500 focus:border-green-500"
                                                     />
                                                     <input 
                                                        type="number" 
                                                        placeholder="Điểm -"
                                                         defaultValue={kpi?.penaltyPoints || ''}
                                                        onBlur={(e) => handleScoreChange(d.personnelId, dateStr, 'penalty', e.target.value)}
                                                        className="w-full text-xs p-1 border rounded bg-white text-red-700 placeholder-red-400 focus:ring-red-500 focus:border-red-500"
                                                     />
                                                </div>
                                            )}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {kpiData.length === 0 && (
                    <div className="text-center py-10 text-slate-500">
                        Không tìm thấy nhân viên nào phù hợp với bộ lọc.
                    </div>
                )}
            </div>
        </div>
    );
};

export default KpiPage;
