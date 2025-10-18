import React, { useState, useEffect } from 'react';
import { NonConformity, User } from '../types';

interface NonConformityFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<NonConformity, 'id'> | NonConformity) => void;
  initialData?: NonConformity | null;
  currentUser: User | null;
}

const NonConformityFormModal: React.FC<NonConformityFormModalProps> = ({ isOpen, onClose, onSubmit, initialData, currentUser }) => {
    const [useCurrentTime, setUseCurrentTime] = useState(true);
    
    const getInitialState = () => ({
        date: new Date().toISOString().split('T')[0],
        description: '',
        category: 'analytical' as NonConformity['category'],
        severity: 'minor' as NonConformity['severity'],
        status: 'open' as NonConformity['status'],
        rootCauseAnalysis: '',
        correctiveAction: '',
        preventiveAction: '',
        reportedBy: currentUser?.fullName || '',
        actionPerformer: '',
        actionApprover: '',
        closedBy: '',
        closedDate: '',
        actionEffectiveness: '',
        finalApprover: '',
        detectionSources: ['nc_report'] as NonConformity['detectionSources'],
        detectionSourceOther: '',
        completionDate: '',
        implementationApproved: undefined,
        implementationApprovalDate: '',
        resultApproved: undefined,
    });

    const [formData, setFormData] = useState(getInitialState());

    useEffect(() => {
        if (isOpen) {
            const isEditing = !!initialData;
            setUseCurrentTime(!isEditing); // Default to true for new, false for editing
            if (initialData) {
                setFormData({
                    ...getInitialState(), // Start with defaults
                    ...initialData, // Overlay existing data
                });
            } else {
                setFormData(getInitialState());
            }
        }
    }, [initialData, isOpen, currentUser]);
    
    useEffect(() => {
        if (isOpen && useCurrentTime && !initialData) {
            const now = new Date();
            setFormData(prev => ({
                ...prev,
                date: now.toISOString().split('T')[0],
            }));
        }
    }, [isOpen, useCurrentTime, initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value, checked } = e.target;
        const source = value as NonNullable<NonConformity['detectionSources']>[0];
        setFormData(prev => {
            const currentSources = prev.detectionSources || [];
            if (checked) {
                return { ...prev, detectionSources: [...currentSources, source] };
            } else {
                return { ...prev, detectionSources: currentSources.filter(s => s !== source) };
            }
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const dataToSubmit: any = { ...formData };
        if (dataToSubmit.status === 'closed' && !dataToSubmit.closedBy) {
            dataToSubmit.closedBy = currentUser?.fullName;
            if (!dataToSubmit.closedDate) {
                 dataToSubmit.closedDate = new Date().toISOString().split('T')[0];
            }
        } else if (dataToSubmit.status !== 'closed') {
            dataToSubmit.closedBy = '';
            dataToSubmit.closedDate = '';
        }


        if (initialData?.id) {
            onSubmit({ ...initialData, ...dataToSubmit });
        } else {
            onSubmit(dataToSubmit);
        }
        onClose();
    };

    if (!isOpen) return null;

    const detectionSources: { id: NonNullable<NonConformity['detectionSources']>[0], label: string }[] = [
        { id: 'nc_report', label: 'Sự không phù hợp (SKPH)' },
        { id: 'internal_audit', label: 'Đánh giá nội bộ' },
        { id: 'management_review', label: 'Xem xét của lãnh đạo' },
        { id: 'external_audit', label: 'Đánh giá từ bên ngoài' },
        { id: 'other', label: 'Khác' },
    ];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
            <div className="bg-white rounded-lg shadow-xl p-6 m-4 w-full max-w-3xl max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center border-b pb-3">
                    <h2 className="text-xl font-semibold text-slate-700">
                        {initialData ? 'Cập nhật Sự không phù hợp' : 'Ghi nhận Sự không phù hợp'}
                    </h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-800">&times;</button>
                </div>
                <form onSubmit={handleSubmit} className="mt-4 flex-grow overflow-y-auto pr-2 space-y-4">
                    {/* Section 1: Detection Source */}
                    <fieldset className="border p-4 rounded-md">
                        <legend className="text-md font-semibold text-slate-700 px-2">1. Nguồn phát hiện</legend>
                        <div className="grid grid-cols-2 gap-x-6 gap-y-2 pt-2">
                            {detectionSources.map(source => (
                                <label key={source.id} className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        value={source.id}
                                        checked={formData.detectionSources?.includes(source.id)}
                                        onChange={handleCheckboxChange}
                                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-sm text-slate-700">{source.label}</span>
                                </label>
                            ))}
                        </div>
                        {formData.detectionSources?.includes('other') && (
                            <div className="mt-2">
                                <input type="text" name="detectionSourceOther" value={formData.detectionSourceOther} onChange={handleChange} placeholder="Vui lòng ghi rõ nguồn khác" className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 bg-white text-slate-900"/>
                            </div>
                        )}
                    </fieldset>
                    
                    {/* Section 2: Description */}
                    <fieldset className="border p-4 rounded-md">
                        <legend className="text-md font-semibold text-slate-700 px-2">2. Mô tả & Phân loại</legend>
                        <div className="space-y-4 pt-2">
                             <div className="flex items-center mb-2">
                                <input id="useCurrentTimeNC" type="checkbox" checked={useCurrentTime} onChange={(e) => setUseCurrentTime(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-blue-600"/>
                                <label htmlFor="useCurrentTimeNC" className="ml-2 block text-sm text-slate-700">Sử dụng ngày hiện tại</label>
                             </div>
                             <div>
                                <label className="block text-sm font-medium text-slate-600">Ngày phát hiện (*)</label>
                                <input type="date" name="date" value={formData.date} onChange={handleChange} required disabled={useCurrentTime} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 bg-white disabled:bg-slate-100 disabled:text-slate-500"/>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-600">Mô tả chi tiết SKPH (*)</label>
                                <textarea name="description" value={formData.description} onChange={handleChange} required rows={3} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 bg-white text-slate-900"></textarea>
                            </div>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-600">Phân loại (*)</label>
                                    <select name="category" value={formData.category} onChange={handleChange} required className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 bg-white text-slate-900">
                                        <option value="pre-analytical">Trước phân tích</option><option value="analytical">Trong phân tích</option><option value="post-analytical">Sau phân tích</option><option value="safety">An toàn</option><option value="supplier">Nhà cung cấp</option><option value="system">Hệ thống</option><option value="other">Khác</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-600">Mức độ (*)</label>
                                    <select name="severity" value={formData.severity} onChange={handleChange} required className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 bg-white text-slate-900">
                                        <option value="minor">Nhẹ (Không ảnh hưởng KQ)</option><option value="severe">Nặng (Ảnh hưởng KQ)</option>
                                    </select>
                                </div>
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-slate-600">Người báo cáo</label>
                                <input type="text" name="reportedBy" value={formData.reportedBy} onChange={handleChange} required className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 bg-white text-slate-900"/>
                            </div>
                        </div>
                    </fieldset>

                    {/* Section 3,4,5: Analysis & Actions */}
                     <fieldset className="border p-4 rounded-md">
                        <legend className="text-md font-semibold text-slate-700 px-2">3. Phân tích & Hành động</legend>
                        <div className="space-y-4 pt-2">
                             <div>
                                <label className="block text-sm font-medium text-slate-600">Phân tích nguyên nhân gốc rễ</label>
                                <textarea name="rootCauseAnalysis" value={formData.rootCauseAnalysis} onChange={handleChange} rows={3} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 bg-white text-slate-900"></textarea>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-600">Biện pháp khắc phục</label>
                                <textarea name="correctiveAction" value={formData.correctiveAction} onChange={handleChange} rows={3} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 bg-white text-slate-900"></textarea>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-600">Hành động đảm bảo vấn đề không lặp lại (phòng ngừa)</label>
                                <textarea name="preventiveAction" value={formData.preventiveAction} onChange={handleChange} rows={3} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 bg-white text-slate-900"></textarea>
                            </div>
                        </div>
                    </fieldset>
                    
                    {/* Section: Approvals */}
                    <fieldset className="border p-4 rounded-md">
                        <legend className="text-md font-semibold text-slate-700 px-2">4. Phê duyệt & Theo dõi</legend>
                        <div className="space-y-4 pt-2">
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-600">Người thực hiện khắc phục</label>
                                    <input type="text" name="actionPerformer" value={formData.actionPerformer} onChange={handleChange} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 bg-white text-slate-900"/>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-600">Ngày hoàn thành</label>
                                    <input type="date" name="completionDate" value={formData.completionDate} onChange={handleChange} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 bg-white text-slate-900"/>
                                </div>
                             </div>
                             <div className="border-t pt-4 mt-4">
                                <label className="block text-sm font-medium text-slate-600">Phê duyệt thực hiện</label>
                                <div className="flex gap-4 mt-2">
                                    <label className="flex items-center"><input type="radio" name="implementationApproved" value="approved" checked={formData.implementationApproved === 'approved'} onChange={handleChange} className="h-4 w-4" /> <span className="ml-2">Đồng ý</span></label>
                                    <label className="flex items-center"><input type="radio" name="implementationApproved" value="rejected" checked={formData.implementationApproved === 'rejected'} onChange={handleChange} className="h-4 w-4" /> <span className="ml-2">Không đồng ý</span></label>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-600">Người phê duyệt</label>
                                        <input type="text" name="actionApprover" value={formData.actionApprover} onChange={handleChange} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 bg-white text-slate-900"/>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-600">Ngày phê duyệt</label>
                                        <input type="date" name="implementationApprovalDate" value={formData.implementationApprovalDate} onChange={handleChange} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 bg-white text-slate-900"/>
                                    </div>
                                </div>
                             </div>
                             <div className="border-t pt-4 mt-4">
                                <label className="block text-sm font-medium text-slate-600">Kết quả khắc phục & Đóng phiếu</label>
                                 <div className="flex gap-4 mt-2">
                                    <label className="flex items-center"><input type="radio" name="resultApproved" value="approved" checked={formData.resultApproved === 'approved'} onChange={handleChange} className="h-4 w-4" /> <span className="ml-2">Đồng ý</span></label>
                                    <label className="flex items-center"><input type="radio" name="resultApproved" value="rejected" checked={formData.resultApproved === 'rejected'} onChange={handleChange} className="h-4 w-4" /> <span className="ml-2">Không đồng ý</span></label>
                                </div>
                                <div className="mt-2">
                                    <label className="block text-sm font-medium text-slate-600">Ghi chú (Đánh giá hiệu quả)</label>
                                    <textarea name="actionEffectiveness" value={formData.actionEffectiveness} onChange={handleChange} rows={2} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 bg-white text-slate-900"></textarea>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                                     <div>
                                        <label className="block text-sm font-medium text-slate-600">Người phê duyệt kết quả</label>
                                        <input type="text" name="finalApprover" value={formData.finalApprover} onChange={handleChange} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 bg-white text-slate-900"/>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-600">Ngày đóng phiếu</label>
                                        <input type="date" name="closedDate" value={formData.closedDate} onChange={handleChange} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 bg-white text-slate-900"/>
                                    </div>
                                </div>
                             </div>
                              <div>
                                <label className="block text-sm font-medium text-slate-600">Trạng thái chung (*)</label>
                                <select name="status" value={formData.status} onChange={handleChange} required className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 bg-white text-slate-900">
                                    <option value="open">Mở</option><option value="in_progress">Đang xử lý</option><option value="closed">Đã đóng</option>
                                </select>
                            </div>
                        </div>
                    </fieldset>


                    <div className="mt-6 flex justify-end gap-3 border-t pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300">Hủy</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                            {initialData ? 'Lưu thay đổi' : 'Lưu'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default NonConformityFormModal;