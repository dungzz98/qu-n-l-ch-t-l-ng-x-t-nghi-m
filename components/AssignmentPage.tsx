import React, { useState, useMemo } from 'react';
import { OrganizationUnit, PersonnelProfile, DutyAssignment, TaskAssignment } from '../types';
import { PlusIcon } from './icons/PlusIcon';

interface AssignmentPageProps {
    organizationUnits: OrganizationUnit[];
    personnel: PersonnelProfile[];
    dutyAssignments: DutyAssignment[];
    taskAssignments: TaskAssignment[];
    onAddDutyAssignment: (assignment: Omit<DutyAssignment, 'id'>) => void;
    onDeleteDutyAssignment: (dutyId: string) => void;
    onAddTaskAssignment: (assignment: Omit<TaskAssignment, 'id'>) => void;
}

const getStartOfWeek = (date: Date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    return new Date(d.setDate(diff));
};

const AssignmentPage: React.FC<AssignmentPageProps> = (props) => {
    const { personnel, dutyAssignments, onAddDutyAssignment, onDeleteDutyAssignment } = props;
    const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
    const [currentDate, setCurrentDate] = useState(new Date());
    
    const sortedPersonnel = useMemo(() => 
        [...personnel].sort((a, b) => a.fullName.localeCompare(b.fullName, 'vi'))
    , [personnel]);

    const calendarDays = useMemo(() => {
        if (viewMode === 'week') {
            const weekStart = getStartOfWeek(currentDate);
            return Array.from({ length: 7 }).map((_, i) => {
                const date = new Date(weekStart);
                date.setDate(weekStart.getDate() + i);
                return date;
            });
        } else {
            const year = currentDate.getFullYear();
            const month = currentDate.getMonth();
            const date = new Date(year, month, 1);
            const days = [];
            while (date.getMonth() === month) {
                days.push(new Date(date));
                date.setDate(date.getDate() + 1);
            }
            return days;
        }
    }, [currentDate, viewMode]);

    const calendarTitle = useMemo(() => {
        if (viewMode === 'week') {
            const weekStart = calendarDays[0];
            const weekEnd = calendarDays[calendarDays.length - 1];
            return `Tuần từ ${weekStart.toLocaleDateString('vi-VN')} - ${weekEnd.toLocaleDateString('vi-VN')}`;
        } else {
            return `Tháng ${currentDate.getMonth() + 1}, ${currentDate.getFullYear()}`;
        }
    }, [calendarDays, viewMode, currentDate]);

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

    const handleAddDuty = (personnelId: string, date: string) => {
        onAddDutyAssignment({ personnelId, date, notes: '' });
    };

    return (
        <div>
            <div className="flex flex-wrap justify-between items-center mb-4 gap-4">
                <div className="flex items-center gap-2">
                    <button onClick={handlePrev} className="p-2 border rounded-md hover:bg-slate-100">{'<'}</button>
                    <button onClick={handleToday} className="p-2 border rounded-md hover:bg-slate-100">Hôm nay</button>
                    <button onClick={handleNext} className="p-2 border rounded-md hover:bg-slate-100">{'>'}</button>
                     <input
                        type="date"
                        value={currentDate.toISOString().split('T')[0]}
                        onChange={handleDateChange}
                        className="p-1.5 border rounded-md hover:bg-slate-100 text-slate-700 text-sm"
                    />
                    <span className="font-semibold text-lg ml-2">{calendarTitle}</span>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => setViewMode('week')} className={`px-3 py-1.5 text-sm rounded-md ${viewMode === 'week' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'}`}>Xem theo Tuần</button>
                    <button onClick={() => setViewMode('month')} className={`px-3 py-1.5 text-sm rounded-md ${viewMode === 'month' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'}`}>Xem theo Tháng</button>
                </div>
            </div>
            <div className="overflow-x-auto border rounded-lg">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="sticky left-0 bg-slate-50 z-10 p-2 text-left text-xs font-medium text-slate-500 uppercase w-48">Nhân viên</th>
                            {calendarDays.map(day => (
                                <th key={day.toISOString()} className="p-2 text-center text-xs font-medium text-slate-500 uppercase w-28">
                                    {viewMode === 'week' ? day.toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit' }) : day.getDate()}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-100">
                        {sortedPersonnel.map(person => (
                            <tr key={person.id}>
                                <td className="sticky left-0 bg-white z-10 p-2 font-medium text-sm text-slate-800 w-48 border-r">{person.fullName}</td>
                                {calendarDays.map(day => {
                                    const dateStr = day.toISOString().split('T')[0];
                                    const duty = dutyAssignments.find(d => d.personnelId === person.id && d.date === dateStr);
                                    return (
                                        <td key={day.toISOString()} className="p-1 border-l text-center align-top h-20">
                                            {duty ? (
                                                <button 
                                                    onClick={() => onDeleteDutyAssignment(duty.id)}
                                                    className="w-full h-full bg-purple-50 border border-purple-200 text-purple-700 text-xs font-bold p-1 rounded flex items-center justify-center hover:bg-red-50 hover:border-red-200 hover:text-red-700 transition-colors"
                                                    title="Nhấp để hủy ca trực"
                                                >
                                                    TRỰC
                                                </button>
                                            ) : (
                                                <button onClick={() => handleAddDuty(person.id, dateStr)} className="w-full h-full flex items-center justify-center text-slate-300 hover:bg-slate-50 hover:text-blue-500 rounded">
                                                    <PlusIcon className="w-5 h-5"/>
                                                </button>
                                            )}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {sortedPersonnel.length === 0 && (
                    <div className="text-center py-10 text-slate-500">
                        Chưa có nhân sự nào được thêm vào hệ thống.
                    </div>
                )}
            </div>
        </div>
    );
};

export default AssignmentPage;