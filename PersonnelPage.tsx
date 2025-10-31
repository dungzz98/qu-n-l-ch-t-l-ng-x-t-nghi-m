import React, { useState, useMemo } from 'react';
import { PersonnelProfile, JobRole, TraineeProfile, TrainingCourse, TrainingRecord, Competency, CompetencyAssessment } from '../types';
import { PlusIcon } from './icons/PlusIcon';
import { EditIcon } from './icons/EditIcon';
import { TrashIcon } from './icons/TrashIcon';
import { EyeIcon } from './icons/EyeIcon';
import { UsersGroupIcon } from './icons/UsersGroupIcon';
import { CertificateIcon } from './icons/CertificateIcon';
import { CheckBadgeIcon } from './icons/CheckBadgeIcon';

const formatDate = (dateString: string) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString + 'T00:00:00');
  return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

// Staff List Component
const StaffList: React.FC<{ personnel: PersonnelProfile[], jobRoles: JobRole[], filterText: string, onViewDetails: (p: PersonnelProfile) => void, onEdit: (p: PersonnelProfile) => void, onDelete: (id: string) => void, focusedItemId: string | null }> = ({ personnel, jobRoles, filterText, onViewDetails, onEdit, onDelete, focusedItemId }) => {
    const jobRoleMap = useMemo(() => new Map(jobRoles.map(role => [role.id, role])), [jobRoles]);
    const filteredPersonnel = useMemo(() => {
        if (!filterText) return personnel;
        const lowerCaseFilter = filterText.toLowerCase();
        return personnel.filter(p => {
            const position = jobRoleMap.get(p.jobRoleId)?.title || '';
            return p.fullName.toLowerCase().includes(lowerCaseFilter) || p.employeeId.toLowerCase().includes(lowerCaseFilter) || position.toLowerCase().includes(lowerCaseFilter);
        });
    }, [personnel, filterText, jobRoleMap]);

    return (
        <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-white"><tr className="border-b-2 border-black">{['Họ và Tên', 'Mã NV', 'Chức vụ', 'Trình độ', 'Ngày vào làm', 'Hành động'].map(h => <th key={h} className="px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">{h}</th>)}</tr></thead>
            <tbody className="bg-white divide-y divide-gray-200">
                {filteredPersonnel.length > 0 ? filteredPersonnel.map(person => {
                    const role = jobRoleMap.get(person.jobRoleId);
                    const isFocused = person.id === focusedItemId;
                    return (<tr key={person.id} className={`hover:bg-gray-50 ${isFocused ? 'animate-pulse-yellow' : ''}`}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-black">{person.fullName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-mono">{person.employeeId}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700" title={role?.description || ''}>{role?.title || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{person.degree}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{formatDate(person.hireDate)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium"><div className="flex items-center gap-4">
                            <button onClick={() => onViewDetails(person)} className="text-gray-700 hover:text-black" title="Xem chi tiết"><EyeIcon /></button>
                            <button onClick={() => onEdit(person)} className="text-gray-700 hover:text-black" title="Chỉnh sửa"><EditIcon /></button>
                            <button onClick={() => onDelete(person.id)} className="text-gray-700 hover:text-black" title="Xóa"><TrashIcon /></button>
                        </div></td></tr>);
                }) : (<tr><td colSpan={6} className="text-center py-10 text-gray-500">Không có hồ sơ nhân sự nào.</td></tr>)}
            </tbody>
        </table>
    );
};

// Trainee List Component
const TraineeList: React.FC<{ trainees: TraineeProfile[], personnel: PersonnelProfile[], filterText: string, onEdit: (t: TraineeProfile) => void, onDelete: (id: string) => void }> = ({ trainees, personnel, filterText, onEdit, onDelete }) => {
    const supervisorMap = useMemo(() => new Map(personnel.map(p => [p.id, p.fullName])), [personnel]);
    const statusMap = { 'đang học': { text: 'Đang học', color: 'bg-blue-100 text-blue-800' }, 'đã hoàn thành': { text: 'Đã hoàn thành', color: 'bg-green-100 text-green-800' }, 'đã nghỉ': { text: 'Đã nghỉ', color: 'bg-slate-100 text-slate-800' }};
    const filteredTrainees = useMemo(() => {
        if (!filterText) return trainees;
        const lower = filterText.toLowerCase();
        return trainees.filter(t => t.fullName.toLowerCase().includes(lower) || t.studentId.toLowerCase().includes(lower) || t.schoolOrInstitution.toLowerCase().includes(lower) || t.trainingCourse.toLowerCase().includes(lower));
    }, [trainees, filterText]);

    return (
         <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-white"><tr className="border-b-2 border-black">{['Họ và Tên', 'Trường/Đơn vị', 'Khóa học', 'Thời gian', 'Người hướng dẫn', 'Trạng thái', 'Hành động'].map(h =><th key={h} className="px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">{h}</th>)}</tr></thead>
            <tbody className="bg-white divide-y divide-gray-200">
                {filteredTrainees.length > 0 ? filteredTrainees.map(trainee => {
                    const status = statusMap[trainee.status];
                    const isInactive = trainee.status === 'đã hoàn thành' || trainee.status === 'đã nghỉ';
                    return (<tr key={trainee.id} className={`hover:bg-gray-50 ${isInactive ? 'opacity-60' : ''}`}>
                        <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm font-medium text-black">{trainee.fullName}</div><div className="text-xs text-gray-500 font-mono">{trainee.studentId}</div></td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{trainee.schoolOrInstitution}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{trainee.trainingCourse}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{formatDate(trainee.startDate)} - {formatDate(trainee.endDate)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{supervisorMap.get(trainee.supervisorId) || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap"><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${status.color}`}>{status.text}</span></td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium"><div className="flex items-center gap-4">
                            <button onClick={() => onEdit(trainee)} className="text-gray-700 hover:text-black" title="Chỉnh sửa"><EditIcon /></button>
                            <button onClick={() => onDelete(trainee.id)} className="text-gray-700 hover:text-black" title="Xóa"><TrashIcon /></button>
                        </div></td></tr>)
                }) : (<tr><td colSpan={7} className="text-center py-10 text-gray-500">Chưa có hồ sơ học viên nào.</td></tr>)}
            </tbody>
        </table>
    )
};

// Training Management Component
const TrainingManagementTab: React.FC<{ courses: TrainingCourse[], records: TrainingRecord[], personnel: PersonnelProfile[], onAdd: () => void, onEdit: (c: TrainingCourse) => void, onDelete: (id: string) => void }> = ({ courses, records, personnel, onAdd, onEdit, onDelete }) => {
    const personnelMap = useMemo(() => new Map(personnel.map(p => [p.id, p.fullName])), [personnel]);
    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-black">Danh mục Khóa đào tạo</h3>
                <button onClick={onAdd} className="inline-flex items-center gap-2 px-3 py-1.5 bg-black text-white rounded-md text-sm hover:bg-gray-800"><PlusIcon />Thêm Khóa học</button>
            </div>
            <div className="space-y-4">
                {courses.map(course => (
                    <div key={course.id} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-start">
                            <div>
                                <h4 className="font-bold text-black">{course.title}</h4>
                                <p className="text-sm text-gray-500">Đơn vị: {course.provider}</p>
                                {course.description && <p className="text-sm text-gray-600 mt-1">{course.description}</p>}
                            </div>
                            <div className="flex gap-2"><button onClick={() => onEdit(course)} className="text-gray-700 hover:text-black"><EditIcon /></button><button onClick={() => onDelete(course.id)} className="text-gray-700 hover:text-black"><TrashIcon /></button></div>
                        </div>
                        <div className="mt-2 border-t pt-2">
                            <p className="text-xs font-semibold text-gray-500">Nhân viên đã hoàn thành:</p>
                            <ul className="text-sm text-gray-800 list-disc list-inside">
                                {records.filter(r => r.courseId === course.id).map(r => <li key={r.id}>{personnelMap.get(r.personnelId)} - Ngày: {formatDate(r.completionDate)}</li>)}
                            </ul>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Competency Management Component
const CompetencyManagementTab: React.FC<{ competencies: Competency[], onAdd: () => void, onEdit: (c: Competency) => void, onDelete: (id: string) => void }> = ({ competencies, onAdd, onEdit, onDelete }) => {
    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-black">Danh mục Năng lực</h3>
                <button onClick={onAdd} className="inline-flex items-center gap-2 px-3 py-1.5 bg-black text-white rounded-md text-sm hover:bg-gray-800"><PlusIcon />Thêm Năng lực</button>
            </div>
            <div className="overflow-x-auto border rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-white"><tr className="border-b-2 border-black">
                        <th className="px-4 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Tên năng lực</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Mô tả</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Hành động</th>
                    </tr></thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {competencies.map(c => <tr key={c.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 font-medium text-black">{c.name}</td>
                            <td className="px-4 py-3 text-sm text-gray-700">{c.description}</td>
                            <td className="px-4 py-3"><div className="flex gap-2"><button onClick={() => onEdit(c)} className="text-gray-700 hover:text-black"><EditIcon /></button><button onClick={() => onDelete(c.id)} className="text-gray-700 hover:text-black"><TrashIcon /></button></div></td>
                        </tr>)}
                         {competencies.length === 0 && (
                            <tr><td colSpan={3} className="text-center p-8 text-gray-500">Chưa có năng lực nào trong danh mục.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};


interface PersonnelPageProps {
  personnel: PersonnelProfile[];
  jobRoles: JobRole[];
  trainees: TraineeProfile[];
  trainingCourses: TrainingCourse[];
  trainingRecords: TrainingRecord[];
  competencies: Competency[];
  competencyAssessments: CompetencyAssessment[];
  focusedItemId: string | null;
  onAdd: () => void;
  onEdit: (person: PersonnelProfile) => void;
  onDelete: (id: string) => void;
  onViewDetails: (person: PersonnelProfile) => void;
  onAddTrainee: () => void;
  onEditTrainee: (trainee: TraineeProfile) => void;
  onDeleteTrainee: (id: string) => void;
  onAddTrainingCourse: () => void;
  onEditTrainingCourse: (course: TrainingCourse) => void;
  onDeleteTrainingCourse: (id: string) => void;
  onAddCompetency: () => void;
  onEditCompetency: (competency: Competency) => void;
  onDeleteCompetency: (id: string) => void;
}

const PersonnelPage: React.FC<PersonnelPageProps> = (props) => {
  const { onAdd, onAddTrainee, onAddTrainingCourse, onAddCompetency } = props;
  const [activeTab, setActiveTab] = useState<'staff' | 'trainees' | 'training' | 'competency'>('staff');
  const [filterText, setFilterText] = useState('');

  const handleAddClick = () => {
    if (activeTab === 'staff') onAdd();
    else if (activeTab === 'trainees') onAddTrainee();
    else if (activeTab === 'training') onAddTrainingCourse();
    else if (activeTab === 'competency') onAddCompetency();
  };
  
  const addButtonText: Record<typeof activeTab, string> = {
      staff: 'Thêm Nhân viên',
      trainees: 'Thêm Học viên',
      training: 'Thêm Khóa học',
      competency: 'Thêm Năng lực'
  }

  const TabButton: React.FC<{ tabId: typeof activeTab, label: string, icon: React.ReactNode }> = ({ tabId, label, icon }) => (
    <button
        onClick={() => { setActiveTab(tabId); setFilterText(''); }}
        className={`px-4 py-2 text-sm font-medium rounded-md flex items-center gap-2 ${activeTab === tabId ? 'bg-black text-white' : 'bg-white text-black border border-gray-300 hover:bg-gray-100'}`}
    >
        {icon}{label}
    </button>
  );

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg text-black">
      <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
        <div>
          <h2 className="text-xl font-semibold text-black">Nhân sự & Đào tạo</h2>
          <p className="text-sm text-gray-600 mt-1">Quản lý hồ sơ, đào tạo và đánh giá năng lực nhân sự.</p>
        </div>
        <button onClick={handleAddClick} className="inline-flex items-center justify-center rounded-md border border-transparent bg-black px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-gray-800">
          <PlusIcon className="w-5 h-5 mr-2" />
          {addButtonText[activeTab]}
        </button>
      </div>

       <div className="flex flex-wrap justify-between items-center mb-4 gap-4 border-b border-gray-200 pb-4">
            <div className="flex gap-2">
                <TabButton tabId="staff" label="Nhân viên" icon={<UsersGroupIcon />} />
                <TabButton tabId="trainees" label="Học viên" icon={<UsersGroupIcon />} />
                <TabButton tabId="training" label="Quản lý Đào tạo" icon={<CertificateIcon />} />
                <TabButton tabId="competency" label="Quản lý Năng lực" icon={<CheckBadgeIcon />} />
            </div>
            {(activeTab === 'staff' || activeTab === 'trainees') && (
                <input
                type="text"
                placeholder="Tìm kiếm..."
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                className="block w-full max-w-md rounded-md border border-gray-300 bg-white py-2 px-4 text-black placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-black"
                />
            )}
        </div>

      <div className="overflow-x-auto">
        {activeTab === 'staff' && <StaffList 
            personnel={props.personnel}
            jobRoles={props.jobRoles}
            filterText={filterText}
            onViewDetails={props.onViewDetails}
            onEdit={props.onEdit}
            onDelete={props.onDelete}
            focusedItemId={props.focusedItemId}
        />}
        {activeTab === 'trainees' && <TraineeList 
            trainees={props.trainees} 
            personnel={props.personnel} 
            filterText={filterText} 
            onEdit={props.onEditTrainee} 
            onDelete={props.onDeleteTrainee}
        />}
        {activeTab === 'training' && <TrainingManagementTab courses={props.trainingCourses} records={props.trainingRecords} personnel={props.personnel} onAdd={props.onAddTrainingCourse} onEdit={props.onEditTrainingCourse} onDelete={props.onDeleteTrainingCourse} />}
        {activeTab === 'competency' && <CompetencyManagementTab competencies={props.competencies} onAdd={props.onAddCompetency} onEdit={props.onEditCompetency} onDelete={props.onDeleteCompetency} />}
      </div>
    </div>
  );
};

export default PersonnelPage;