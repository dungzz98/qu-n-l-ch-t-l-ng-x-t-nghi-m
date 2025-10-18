import React, { useState, useEffect } from 'react';
import { CustomerFeedback, User } from '../types';

interface FeedbackFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<CustomerFeedback, 'id'> | CustomerFeedback) => void;
  initialData?: CustomerFeedback | null;
  currentUser: User | null;
}

const FeedbackFormModal: React.FC<FeedbackFormModalProps> = ({ isOpen, onClose, onSubmit, initialData, currentUser }) => {
    const getInitialState = () => ({
        date: new Date().toISOString().split('T')[0],
        customerInfo: '',
        type: 'feedback' as CustomerFeedback['type'],
        subject: '',
        details: '',
        status: 'new' as CustomerFeedback['status'],
        personInCharge: currentUser?.fullName || '',
        resolutionDetails: '',
        resolvedDate: '',
    });

    const [formData, setFormData] = useState(getInitialState());

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setFormData({
                    ...initialData,
                    resolutionDetails: initialData.resolutionDetails || '',
                    resolvedDate: initialData.resolvedDate || '',
                });
            } else {
                setFormData(getInitialState());
            }
        }
    }, [initialData, isOpen, currentUser]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const dataToSubmit: any = { ...formData };
        if (dataToSubmit.status === 'resolved' && !dataToSubmit.resolvedDate) {
            dataToSubmit.resolvedDate = new Date().toISOString().split('T')[0];
        } else if (dataToSubmit.status !== 'resolved') {
            dataToSubmit.resolvedDate = undefined;
        }

        if (initialData?.id) {
            onSubmit({ ...initialData, ...dataToSubmit });
        } else {
            onSubmit(dataToSubmit);
        }
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
            <div className="bg-white rounded-lg shadow-xl p-6 m-4 w-full max-w-3xl max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center border-b pb-3">
                    <h2 className="text-xl font-semibold text-slate-700">
                        {initialData ? 'Cập nhật Phản hồi/Khiếu nại' : 'Ghi nhận Phản hồi/Khiếu nại'}
                    </h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-800">&times;</button>
                </div>
                <form onSubmit={handleSubmit} className="mt-4 flex-grow overflow-y-auto pr-2 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-600">Ngày ghi nhận (*)</label>
                            <input type="date" name="date" value={formData.date} onChange={handleChange} required className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 bg-white"/>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-slate-600">Thông tin khách hàng (*)</label>
                            <input type="text" name="customerInfo" value={formData.customerInfo} onChange={handleChange} placeholder="Tên, SĐT, Khoa phòng..." required className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 bg-white"/>
                        </div>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-600">Chủ đề (*)</label>
                        <input type="text" name="subject" value={formData.subject} onChange={handleChange} required className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 bg-white"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-600">Nội dung chi tiết (*)</label>
                        <textarea name="details" value={formData.details} onChange={handleChange} required rows={5} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 bg-white"></textarea>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-600">Phân loại (*)</label>
                            <select name="type" value={formData.type} onChange={handleChange} required className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 bg-white">
                                <option value="feedback">Phản hồi</option>
                                <option value="complaint">Khiếu nại</option>
                            </select>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-slate-600">Người phụ trách (*)</label>
                            <input type="text" name="personInCharge" value={formData.personInCharge} onChange={handleChange} required className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 bg-white"/>
                        </div>
                    </div>

                    <div className="border-t pt-4 space-y-4">
                        <h3 className="text-md font-semibold text-slate-700">Thông tin Xử lý & Giải quyết</h3>
                         <div>
                            <label className="block text-sm font-medium text-slate-600">Trạng thái (*)</label>
                            <select name="status" value={formData.status} onChange={handleChange} required className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 bg-white">
                                <option value="new">Mới</option>
                                <option value="in_progress">Đang xử lý</option>
                                <option value="resolved">Đã giải quyết</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-600">Nội dung giải quyết</label>
                            <textarea name="resolutionDetails" value={formData.resolutionDetails} onChange={handleChange} rows={4} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 bg-white"></textarea>
                        </div>
                         {formData.status === 'resolved' && (
                            <div>
                                <label className="block text-sm font-medium text-slate-600">Ngày giải quyết</label>
                                <input type="date" name="resolvedDate" value={formData.resolvedDate} onChange={handleChange} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 bg-white"/>
                            </div>
                        )}
                    </div>
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

export default FeedbackFormModal;