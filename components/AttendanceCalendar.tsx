import React, { useState, useMemo } from 'react';
import { PersonnelProfile, LeaveRecord, AttendanceRecord, WorkSchedule, Holiday, DutyAssignment } from '../types';
import { PlusIcon } from './icons/PlusIcon';
import { ExportIcon } from './icons/ExportIcon';
import { utils, writeFile } from 'xlsx';


interface AttendanceCalendarProps {
  personnel: PersonnelProfile[];
  leaveRecords: LeaveRecord[];
  attendanceRecords: AttendanceRecord[];
  dutyAssignments: DutyAssignment[];
  workSchedule: WorkSchedule;
  holidays: Holiday[];
  onAddLeave: () => void;
  onAddOrUpdateAttendance: (personnelId: string, date: string, record?: AttendanceRecord) => void;
}

const getStartOfWeek = (date: Date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    return new Date(d.setDate(diff));
};

const calculateLateMinutes = (checkInTime: string, startTime: string): number => {
    if (!checkInTime || !startTime) return 0;
    try {
        const checkIn = new Date(`1970-01-01T${checkInTime}:00`);
        const start = new Date(`1970-01-01T${startTime}:00`);
        if (checkIn > start) {
            return Math.round((checkIn.getTime() - start.getTime()) / (1000 * 60));
        }
    } catch (e) {
        console.error("Error parsing time:", e);
    }
    return 0;
};

const calculateEarlyLeaveMinutes = (checkOutTime: string, endTime: string): number => {
    if (!checkOutTime || !endTime) return 0;
    try {
        const checkOut = new Date(`1970-01-01T${checkOutTime}:00`);
        const end = new Date(`1970-01-01T${endTime}:00`);
        if (checkOut < end) {
            return Math.round((end.getTime() - checkOut.getTime()) / (1000 * 60));
        }
    } catch (e) {
        console.error("Lỗi phân tích thời gian:", e);
    }
    return 0;
};


const AttendanceCalendar: React.FC<AttendanceCalendarProps> = (props) => {
    const { personnel, leaveRecords, attendanceRecords, dutyAssignments, workSchedule, holidays, onAddLeave, onAddOrUpdateAttendance } = props;
    const [currentDate, setCurrentDate] = useState(new Date());
    const [personnelFilter, setPersonnelFilter] = useState('');
    const [viewMode, setViewMode] = useState<'week' | 'month'>('month');

    const calendarDays = useMemo(() => {
        const d = new Date(currentDate);
        d.setHours(0, 0, 0, 0);
        if (viewMode === 'week') {
            const weekStart = getStartOfWeek(d);
            return Array.from({ length: 7 }).map((_, i) => {
                const date = new Date(weekStart);
                date.setDate(weekStart.getDate() + i);
                return date;
            });
        } else { // month view
            const year = d.getFullYear();
            const month = d.getMonth();
            const date = new Date(year, month, 1);
            const days = [];
            while (date.getMonth() === month) {
                days.push(new Date(date));
                date.setDate(date.getDate() + 1);
            }
            return days;
        }
    }, [currentDate, viewMode]);

    const filteredPersonnel = useMemo(() => {
        const sortedPersonnel = [...personnel].sort((a, b) => a.fullName.localeCompare(b.fullName, 'vi'));
        if (!personnelFilter) return sortedPersonnel;
        const lowerCaseFilter = personnelFilter.toLowerCase();
        return sortedPersonnel.filter(p => 
            p.fullName.toLowerCase().includes(lowerCaseFilter)
        );
    }, [personnel, personnelFilter]);

    const holidayMap = useMemo(() => new Map(holidays.map(h => [h.date, h.name])), [holidays]);

    const periodStats = useMemo(() => {
        if (calendarDays.length === 0) return new Map();

        const periodStartStr = calendarDays[0].toISOString().split('T')[0];
        const periodEndStr = calendarDays[calendarDays.length - 1].toISOString().split('T')[0];
        
        const stats = new Map<string, { workDays: number; deviationMinutes: number }>();
        
        personnel.forEach(person => {
            const recordsInPeriod = attendanceRecords.filter(a => 
                a.personnelId === person.id && 
                a.date >= periodStartStr && 
                a.date <= periodEndStr
            );
            
            const workDays = recordsInPeriod.length;
            const lateMinutes = recordsInPeriod.reduce((sum, rec) => sum + calculateLateMinutes(rec.checkIn, workSchedule.startTime), 0);
            const earlyLeaveMinutes = recordsInPeriod.reduce((sum, rec) => sum + calculateEarlyLeaveMinutes(rec.checkOut, workSchedule.endTime), 0);
            const deviationMinutes = lateMinutes + earlyLeaveMinutes;
            
            stats.set(person.id, { workDays, deviationMinutes });
        });

        return stats;
    }, [personnel, calendarDays, attendanceRecords, workSchedule]);

    const handlePrev = () => {
        const newDate = new Date(currentDate);
        if (viewMode === 'week') {
            newDate.setDate(newDate.getDate() - 7);
        } else {
            newDate.setMonth(newDate.getMonth() - 1, 1);
        }
        setCurrentDate(newDate);
    };

    const handleNext = () => {
        const newDate = new Date(currentDate);
        if (viewMode === 'week') {
            newDate.setDate(newDate.getDate() + 7);
        } else {
            newDate.setMonth(newDate.getMonth() + 1, 1);
        }
        setCurrentDate(newDate);
    };

    const handleToday = () => setCurrentDate(new Date());

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedDate = e.target.value;
        if (selectedDate) {
            setCurrentDate(new Date(selectedDate + 'T00:00:00'));
        }
    };
    
    const handleExport = () => {
        if (calendarDays.length === 0 || filteredPersonnel.length === 0) return;

        const periodStart = calendarDays[0];
        const periodEnd = calendarDays[calendarDays.length - 1];
        const wb = utils.book_new();

        // Sheet 1: Summary Statistics
        const summaryData = filteredPersonnel.map(p => {
            const stats = periodStats.get(p.id);
            return {
                'Nhân viên': p.fullName,
                'Số ngày đi làm': stats?.workDays || 0,
                'Đi trễ/Về sớm (phút)': stats?.deviationMinutes || 0,
            };
        });
        const summaryWs = utils.json_to_sheet(summaryData);
        utils.book_append_sheet(wb, summaryWs, "ThongKeTongHop");

        // Sheet 2: Detailed Attendance (Matrix Format)
        const getCellContentAsString = (person: PersonnelProfile, date: Date): string => {
            const dateStr = date.toISOString().split('T')[0];
            const dateWithoutTime = new Date(dateStr + 'T00:00:00');

            const duty = dutyAssignments.find(d => d.personnelId === person.id && d.date === dateStr);
            if (duty) return 'TRỰC';

            const leave = leaveRecords.find(l => {
                const start = new Date(l.startDate + 'T00:00:00');
                const end = new Date(l.endDate + 'T00:00:00');
                return l.personnelId === person.id && dateWithoutTime >= start && dateWithoutTime <= end;
            });
            if (leave) return leave.leaveType;

            const holidayName = holidayMap.get(dateStr);
            if (holidayName) return `Nghỉ Lễ`;
            if (date.getDay() === 0 || date.getDay() === 6) return 'Cuối tuần';

            const attendance = attendanceRecords.find(a => a.personnelId === person.id && a.date === dateStr);
            if (attendance) {
                const lateMins = calculateLateMinutes(attendance.checkIn, workSchedule.startTime);
                const earlyMins = calculateEarlyLeaveMinutes(attendance.checkOut, workSchedule.endTime);
                let statusParts: string[] = [];
                if (lateMins > 0) statusParts.push(`Trễ ${lateMins}p`);
                if (earlyMins > 0) statusParts.push(`Sớm ${earlyMins}p`);
                const status = statusParts.length > 0 ? ` (${statusParts.join(', ')})` : '';
                return `Vào: ${attendance.checkIn}\nRa: ${attendance.checkOut}${status}`;
            }
            return ''; // Normal workday, no record
        };

        const detailedDataMatrix: any[][] = [];
        const header = ['Nhân viên'];
        calendarDays.forEach(day => {
            header.push(day.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }));
        });
        detailedDataMatrix.push(header);

        filteredPersonnel.forEach(p => {
            const row = [p.fullName];
            calendarDays.forEach(day => {
                row.push(getCellContentAsString(p, day));
            });
            detailedDataMatrix.push(row);
        });

        const detailedWs = utils.aoa_to_sheet(detailedDataMatrix);
        detailedWs['!cols'] = [{ wch: 25 }, ...calendarDays.map(() => ({ wch: 20 }))];
        for (const cellAddress in detailedWs) {
            if (cellAddress[0] === '!') continue;
            const cell = detailedWs[cellAddress];
            if (cell.v && typeof cell.v === 'string' && cell.v.includes('\n')) {
                cell.s = { alignment: { wrapText: true, vertical: "center" } };
            }
        }
        utils.book_append_sheet(wb, detailedWs, "ChamCongChiTiet");

        // Sheet 3: Leave Sheet
        const leaveData = leaveRecords
            .filter(l => {
                const startDate = new Date(l.startDate + 'T00:00:00');
                const endDate = new Date(l.endDate + 'T00:00:00');
                return filteredPersonnel.some(p => p.id === l.personnelId) && startDate <= periodEnd && endDate >= periodStart;
            })
            .map(l => ({
                'Nhân viên': personnel.find(p => p.id === l.personnelId)?.fullName || 'N/A',
                'Loại nghỉ phép': l.leaveType,
                'Từ ngày': l.startDate,
                'Đến ngày': l.endDate,
                'Lý do': l.reason
            }));
        const leaveWs = utils.json_to_sheet(leaveData);
        utils.book_append_sheet(wb, leaveWs, "BangNghiPhep");
        
        const fileName = `Bao_cao_Cham_cong_${viewMode === 'month' ? `Thang_${currentDate.getMonth()+1}_${currentDate.getFullYear()}` : `Tuan_${periodStart.toISOString().split('T')[0]}`}.xlsx`;
        writeFile(wb, fileName);
    };

    const renderCellContent = (person: PersonnelProfile, date: Date) => {
        const dateStr = date.toISOString().split('T')[0];
        const dateWithoutTime = new Date(dateStr + 'T00:00:00');

        const duty = dutyAssignments.find(d => d.personnelId === person.id && d.date === dateStr);
        if (duty) {
             return <div className="bg-purple-50 text-purple-700 border border-purple-200 text-xs font-bold p-1 rounded h-full flex items-center justify-center">TRỰC</div>;
        }

        const leave = leaveRecords.find(l => {
            const start = new Date(l.startDate + 'T00:00:00');
            const end = new Date(l.endDate + 'T00:00:00');
            return l.personnelId === person.id && dateWithoutTime >= start && dateWithoutTime <= end;
        });

        if (leave) {
            return <div className="bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold p-1 rounded h-full flex items-center justify-center">{leave.leaveType}</div>;
        }
        
        if (holidayMap.has(dateStr) || date.getDay() === 0 || date.getDay() === 6) {
            return <div className="h-full bg-slate-50"></div>;
        }

        const attendance = attendanceRecords.find(a => a.personnelId === person.id && a.date === dateStr);
        if (attendance) {
            const isLate = calculateLateMinutes(attendance.checkIn, workSchedule.startTime) > 0;
            const isEarly = calculateEarlyLeaveMinutes(attendance.checkOut, workSchedule.endTime) > 0;
            return (
                <div className="text-xs text-center h-full flex flex-col justify-center p-1 text-black">
                    <p>Vào: {attendance.checkIn} {isLate && <span className="text-red-500 font-bold">(Trễ)</span>}</p>
                    <p>Ra: {attendance.checkOut} {isEarly && <span className="text-yellow-600 font-bold">(Sớm)</span>}</p>
                </div>
            );
        }

        return <div className="h-full"></div>; // Empty cell
    };


    return (
        <div>
            <div className="flex flex-wrap justify-between items-center mb-4 gap-4 p-4 bg-white border rounded-lg">
                <div className="flex items-center gap-2 flex-wrap">
                    {/* Navigation */}
                    <div className="flex items-center border rounded-md">
                        <button onClick={handlePrev} className="p-2 border-r hover:bg-gray-100 rounded-l-md text-black">{'<'}</button>
                        <button onClick={handleToday} className="px-3 py-2 border-r hover:bg-gray-100 text-sm font-semibold text-black">Hôm nay</button>
                        <button onClick={handleNext} className="p-2 hover:bg-gray-100 rounded-r-md text-black">{'>'}</button>
                    </div>
                    {/* Date Picker */}
                    <input type="date" value={currentDate.toISOString().split('T')[0]} onChange={handleDateChange} className="p-2 border rounded-md text-sm text-black bg-white" />
                    {/* Title */}
                    <span className="font-bold text-lg text-black ml-2">
                        {viewMode === 'week' 
                            ? `Tuần ${calendarDays[0].toLocaleDateString('vi-VN', {day:'2-digit', month:'2-digit'})} - ${calendarDays[6].toLocaleDateString('vi-VN', {day:'2-digit', month:'2-digit'})}`
                            : `Tháng ${currentDate.getMonth() + 1}, ${currentDate.getFullYear()}`}
                    </span>
                </div>

                <div className="flex items-center gap-4 flex-wrap">
                    {/* View Mode */}
                    <div className="flex items-center bg-gray-100 rounded-md p-1">
                        <button onClick={() => setViewMode('week')} className={`px-3 py-1 text-sm rounded-md ${viewMode === 'week' ? 'bg-white shadow-sm text-black font-semibold' : 'bg-transparent text-gray-600'}`}>Tuần</button>
                        <button onClick={() => setViewMode('month')} className={`px-3 py-1 text-sm rounded-md ${viewMode === 'month' ? 'bg-white shadow-sm text-black font-semibold' : 'bg-transparent text-gray-600'}`}>Tháng</button>
                    </div>

                    {/* Filter */}
                    <input
                        type="text"
                        placeholder="Lọc theo tên nhân viên..."
                        value={personnelFilter}
                        onChange={e => setPersonnelFilter(e.target.value)}
                        className="p-2 border rounded-md min-w-[200px] text-black bg-white"
                    />

                    {/* Actions */}
                    <button onClick={handleExport} className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 text-black rounded-md text-sm hover:bg-gray-100">
                        <ExportIcon /> Xuất Excel
                    </button>
                    <button onClick={onAddLeave} className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"><PlusIcon/>Đăng ký nghỉ</button>
                </div>
            </div>
            <div className="overflow-x-auto border rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-white">
                        <tr className="border-b-2 border-black">
                            <th className="px-4 py-3 text-left text-xs font-bold text-black uppercase tracking-wider sticky left-0 bg-white z-10 w-48">Nhân viên</th>
                            <th className="px-4 py-3 text-left text-xs font-bold text-black uppercase tracking-wider w-48">{viewMode === 'week' ? 'Thống kê Tuần' : 'Thống kê Tháng'}</th>
                            {calendarDays.map(day => {
                                const dateStr = day.toISOString().split('T')[0];
                                const isWeekend = day.getDay() === 0 || day.getDay() === 6;
                                return (
                                <th key={day.toISOString()} className={`p-2 text-center text-xs font-bold min-w-[120px] ${isWeekend || holidayMap.has(dateStr) ? 'bg-gray-50 text-gray-500' : 'text-black'}`}>
                                    <span>{viewMode === 'week' ? day.toLocaleDateString('vi-VN', { weekday: 'short' }) : ''}</span>
                                    <span className="block">{day.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}</span>
                                    {holidayMap.has(dateStr) && <span className="block text-[10px] font-bold text-red-500">{holidayMap.get(dateStr)}</span>}
                                </th>
                            )})}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                        {filteredPersonnel.map(person => {
                            const stats = periodStats.get(person.id);
                            return (
                            <tr key={person.id}>
                                <td className="px-4 py-3 font-medium text-sm text-black sticky left-0 bg-white z-10 w-48 border-r">{person.fullName}</td>
                                <td className="px-4 py-3 text-xs text-black border-r">
                                    {stats && (
                                        <div>
                                            <p><strong>Đi làm:</strong> {stats.workDays} ngày</p>
                                            <p><strong>Đi trễ/Về sớm:</strong> {stats.deviationMinutes > 0 ? <span className="font-bold text-red-600">{stats.deviationMinutes} phút</span> : '0 phút'}</p>
                                        </div>
                                    )}
                                </td>
                                {calendarDays.map(day => {
                                    const attendance = attendanceRecords.find(a => a.personnelId === person.id && a.date === day.toISOString().split('T')[0]);
                                    const dateStr = day.toISOString().split('T')[0];
                                    const isHolidayCell = holidayMap.has(dateStr) || day.getDay() === 0 || day.getDay() === 6;
                                    return (
                                        <td key={day.toISOString()} onClick={() => !isHolidayCell && onAddOrUpdateAttendance(person.id, dateStr, attendance)} className={`h-16 border-l ${!isHolidayCell ? 'cursor-pointer hover:bg-gray-50' : ''}`}>
                                            {renderCellContent(person, day)}
                                        </td>
                                    )
                                })}
                            </tr>
                        )})}
                    </tbody>
                </table>
                 {filteredPersonnel.length === 0 && (
                    <div className="text-center py-10 text-black">
                       Không tìm thấy nhân viên nào.
                    </div>
                )}
            </div>
        </div>
    );
};

export default AttendanceCalendar;
