import React, { useMemo } from 'react';
import { PersonnelAssignmentHistory, PersonnelProfile, OrganizationUnit } from '../types';
import { UserArrowsIcon } from './icons/UserArrowsIcon';

interface AssignmentHistoryPageProps {
    history: PersonnelAssignmentHistory[];
    personnel: PersonnelProfile[];
    organizationUnits: OrganizationUnit[];
    onOpenMovePersonnel: () => void;
}

const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Hiện tại';
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const AssignmentHistoryPage: React.FC<AssignmentHistoryPageProps> = ({ history, personnel, organizationUnits, onOpenMovePersonnel }) => {
    const personnelMap = useMemo(() => new Map(personnel.map(p => [p.id, p.fullName])), [personnel]);
    const unitMap = useMemo(() => new Map(organizationUnits.map(u => [u.id, u.name])), [organizationUnits]);

    const sortedHistory = useMemo(() => 
        [...history].sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
    , [history]);

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-slate-700">Lịch sử Luân chuyển &amp; Phân công</h3>
                <button 
                    onClick={onOpenMovePersonnel}
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
                >
                    <UserArrowsIcon /> Luân chuyển Nhân sự
                </button>
            </div>
            <div className="overflow-x-auto border rounded-lg">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Nhân viên</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Phòng ban/Đơn vị</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Từ ngày</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Đến ngày</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Ghi chú</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-100">
                        {sortedHistory.length > 0 ? sortedHistory.map(item => (
                            <tr key={item.id}>
                                <td className="px-4 py-3 font-medium text-slate-800">{personnelMap.get(item.personnelId) || 'N/A'}</td>
                                <td className="px-4 py-3 text-slate-600">{unitMap.get(item.organizationUnitId) || 'N/A'}</td>
                                <td className="px-4 py-3 text-slate-600">{formatDate(item.startDate)}</td>
                                <td className="px-4 py-3 text-slate-600">{formatDate(item.endDate)}</td>
                                <td className="px-4 py-3 text-sm text-slate-500">{item.notes}</td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={5} className="text-center p-8 text-slate-500">Chưa có lịch sử luân chuyển nào.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AssignmentHistoryPage;
