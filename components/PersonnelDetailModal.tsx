import React from 'react';
import { PersonnelProfile, JobRole, OrganizationUnit, PersonnelDocument, TrainingRecord, TrainingCourse, CompetencyAssessment, Competency } from '../types';
import { DocumentTextIcon } from './icons/DocumentTextIcon';
import { PlusIcon } from './icons/PlusIcon';
import { TrashIcon } from './icons/TrashIcon';
import { CertificateIcon } from './icons/CertificateIcon';
import { CheckBadgeIcon } from './icons/CheckBadgeIcon';

interface PersonnelDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  personnel: PersonnelProfile | null;
  jobRole?: JobRole;
  organizationUnit?: OrganizationUnit;
  trainingRecords: TrainingRecord[];
  trainingCourses: TrainingCourse[];
  competencies: Competency[];
  competencyAssessments: CompetencyAssessment[];
  allPersonnel: PersonnelProfile[]; // For getting assessor names
  onAddDocument: () => void;
  onDeleteDocument: (docId: string) => void;
  onViewDocument: (doc: PersonnelDocument) => void;
  onAddTrainingRecord: () => void;
  onDeleteTrainingRecord: (recordId: string) => void;
  onAddCompetencyAssessment: () => void;
  onDeleteCompetencyAssessment: (assessmentId: string) => void;
}

const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString + 'T00:00:00').toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const PersonnelDetailModal: React.FC<PersonnelDetailModalProps> = (props) => {
  const { 
      isOpen, onClose, personnel, jobRole, organizationUnit, onAddDocument, onDeleteDocument, onViewDocument,
      trainingRecords, trainingCourses, competencies, competencyAssessments, allPersonnel,
      onAddTrainingRecord, onDeleteTrainingRecord, onAddCompetencyAssessment, onDeleteCompetencyAssessment
   } = props;

  if (!isOpen || !personnel) return null;
  
  // FIX: Explicitly type the Maps to ensure TypeScript correctly infers the value types.
  const courseMap = new Map<string, TrainingCourse>(trainingCourses.map(c => [c.id, c]));
  const competencyMap = new Map<string, Competency>(competencies.map(c => [c.id, c]));
  const personnelMap = new Map<string, string>(allPersonnel.map(p => [p.id, p.fullName]));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white rounded-lg shadow-xl p-6 m-4 w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-start border-b pb-3">
          <div>
            <h2 className="text-xl font-semibold text-slate-800">{personnel.fullName}</h2>
            <p className="text-sm text-slate-500">Mã NV: {personnel.employeeId}</p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-800 text-3xl leading-none">&times;</button>
        </div>

        <div className="mt-4 flex-grow overflow-y-auto pr-2 space-y-6">
          {/* Main Info */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div><strong className="block text-slate-500">Phòng ban</strong> {organizationUnit?.name || 'N/A'}</div>
            <div><strong className="block text-slate-500">Chức vụ</strong> {jobRole?.title || 'N/A'}</div>
            <div><strong className="block text-slate-500">Trình độ</strong> {personnel.degree}</div>
            <div><strong className="block text-slate-500">Ngày vào làm</strong> {formatDate(personnel.hireDate)}</div>
          </div>
          
          {/* Training History */}
          <section>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold text-slate-700 flex items-center gap-2"><CertificateIcon/> Lịch sử Đào tạo</h3>
              <button onClick={onAddTrainingRecord} className="text-sm inline-flex items-center gap-1 text-blue-600 hover:text-blue-800"><PlusIcon className="w-4 h-4"/>Ghi nhận</button>
            </div>
            <div className="border rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-slate-200 text-sm">
                    <thead className="bg-slate-50"><tr><th className="px-4 py-2 text-left">Khóa học</th><th className="px-4 py-2 text-left">Ngày hoàn thành</th><th className="px-4 py-2 text-left">Ngày hết hạn</th><th className="px-4 py-2 text-left">Hành động</th></tr></thead>
                    <tbody className="bg-white divide-y divide-slate-100">
                        {trainingRecords.length > 0 ? trainingRecords.map(r => <tr key={r.id}>
                            <td className="px-4 py-2 font-medium">{courseMap.get(r.courseId)?.title || 'N/A'}</td>
                            <td className="px-4 py-2">{formatDate(r.completionDate)}</td>
                            <td className="px-4 py-2">{formatDate(r.expiryDate)}</td>
                            <td className="px-4 py-2"><button onClick={() => onDeleteTrainingRecord(r.id)} className="text-red-500"><TrashIcon className="w-4 h-4"/></button></td>
                        </tr>) : (<tr><td colSpan={4} className="text-center p-4 text-slate-500">Chưa có ghi nhận đào tạo.</td></tr>)}
                    </tbody>
                </table>
            </div>
          </section>

          {/* Competency Records */}
           <section>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold text-slate-700 flex items-center gap-2"><CheckBadgeIcon/> Hồ sơ Năng lực</h3>
              <button onClick={onAddCompetencyAssessment} className="text-sm inline-flex items-center gap-1 text-blue-600 hover:text-blue-800"><PlusIcon className="w-4 h-4"/>Đánh giá</button>
            </div>
            <div className="border rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-slate-200 text-sm">
                    <thead className="bg-slate-50"><tr><th className="px-4 py-2 text-left">Năng lực</th><th className="px-4 py-2 text-left">Ngày ĐG</th><th className="px-4 py-2 text-left">Kết quả</th><th className="px-4 py-2 text-left">Người ĐG</th><th className="px-4 py-2 text-left">ĐG tiếp theo</th><th className="px-4 py-2 text-left">Hành động</th></tr></thead>
                    <tbody className="bg-white divide-y divide-slate-100">
                        {competencyAssessments.length > 0 ? competencyAssessments.map(a => <tr key={a.id}>
                            <td className="px-4 py-2 font-medium">{competencyMap.get(a.competencyId)?.name || 'N/A'}</td>
                            <td className="px-4 py-2">{formatDate(a.assessmentDate)}</td>
                            <td className="px-4 py-2"><span className={`font-semibold ${a.result === 'Đạt' ? 'text-green-600' : 'text-yellow-600'}`}>{a.result}</span></td>
                            <td className="px-4 py-2">{personnelMap.get(a.assessorId)}</td>
                            <td className="px-4 py-2">{formatDate(a.nextAssessmentDate)}</td>
                            <td className="px-4 py-2"><button onClick={() => onDeleteCompetencyAssessment(a.id)} className="text-red-500"><TrashIcon className="w-4 h-4"/></button></td>
                        </tr>) : (<tr><td colSpan={6} className="text-center p-4 text-slate-500">Chưa có đánh giá năng lực nào.</td></tr>)}
                    </tbody>
                </table>
            </div>
          </section>
          
          {/* Documents */}
           <section>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold text-slate-700 flex items-center gap-2"><DocumentTextIcon/> Hồ sơ & Tài liệu</h3>
              <button onClick={onAddDocument} className="text-sm inline-flex items-center gap-1 text-blue-600 hover:text-blue-800"><PlusIcon className="w-4 h-4"/>Thêm</button>
            </div>
            <div className="border rounded-lg overflow-hidden">
                 <table className="min-w-full divide-y divide-slate-200 text-sm">
                    <thead className="bg-slate-50"><tr><th className="px-4 py-2 text-left">Tiêu đề</th><th className="px-4 py-2 text-left">Phân loại</th><th className="px-4 py-2 text-left">Tên file</th><th className="px-4 py-2 text-left">Hành động</th></tr></thead>
                    <tbody className="bg-white divide-y divide-slate-100">
                        {(personnel.documents || []).length > 0 ? (personnel.documents || []).map(d => 
                        <tr key={d.id}>
                            <td className="px-4 py-2 font-medium">{d.title}</td>
                            <td className="px-4 py-2">{d.category}</td>
                            <td className="px-4 py-2">{d.fileName}</td>
                            <td className="px-4 py-2"><div className="flex gap-3">
                                <button onClick={() => onViewDocument(d)} className="text-blue-600 font-semibold hover:underline">Xem</button>
                                <button onClick={() => onDeleteDocument(d.id)} className="text-red-500 hover:text-red-700" title="Xóa"><TrashIcon className="w-4 h-4"/></button>
                            </div></td></tr>
                        ) : (<tr><td colSpan={4} className="text-center p-4 text-slate-500">Chưa có tài liệu nào.</td></tr>)}
                    </tbody>
                </table>
            </div>
          </section>
        </div>

        <div className="mt-6 flex justify-end">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300">
              Đóng
            </button>
        </div>
      </div>
    </div>
  );
};

export default PersonnelDetailModal;
