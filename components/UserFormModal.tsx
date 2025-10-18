import React, { useState, useEffect } from 'react';
// FIX: The imported file './types' was not a module. With the new types.ts, this now works.
import { User } from '../types';

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (user: Omit<User, 'id' | 'passwordHash'> | (Omit<User, 'passwordHash'> & { passwordHash: string})) => void;
  initialData?: User | null;
  currentUser: User; // To prevent admin from demoting themselves
}

const UserFormModal: React.FC<UserFormModalProps> = ({ isOpen, onClose, onSubmit, initialData, currentUser }) => {
  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    password: '',
    role: 'user' as 'admin' | 'user',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData({
        username: initialData.username,
        fullName: initialData.fullName,
        password: '', // Password is not shown, only set
        role: initialData.role,
      });
    } else {
      setFormData({ username: '', fullName: '', password: '', role: 'user' });
    }
    setError('');
  }, [initialData, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!initialData && !formData.password) {
      setError('Mật khẩu là bắt buộc cho người dùng mới.');
      return;
    }

    if (initialData?.id === currentUser.id && formData.role !== 'admin') {
      setError('Bạn không thể thay đổi vai trò của chính mình.');
      return;
    }
    
    // In a real app, password would be hashed. We use it directly as passwordHash here.
    const passwordHash = formData.password ? formData.password : (initialData?.passwordHash || '');

    const userData = {
      username: formData.username,
      fullName: formData.fullName,
      role: formData.role,
      passwordHash: passwordHash
    };

    if (initialData?.id) {
      onSubmit({ ...initialData, ...userData });
    } else {
      onSubmit(userData);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center">
      <div className="bg-white rounded-lg shadow-xl p-6 m-4 w-full max-w-lg">
        <div className="flex justify-between items-center border-b pb-3">
          <h2 className="text-xl font-semibold text-slate-700">
            {initialData ? 'Chỉnh sửa Người dùng' : 'Thêm Người dùng mới'}
          </h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-800">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-600">Tên đăng nhập</label>
            <input type="text" name="username" value={formData.username} onChange={handleChange} required className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 bg-white text-slate-900 placeholder:text-slate-400" disabled={!!initialData} />
             {initialData && <p className="text-xs text-slate-500 mt-1">Tên đăng nhập không thể thay đổi.</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600">Họ và Tên</label>
            <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} required className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 bg-white text-slate-900 placeholder:text-slate-400" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600">Mật khẩu</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder={initialData ? 'Để trống nếu không đổi' : ''} required={!initialData} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 bg-white text-slate-900 placeholder:text-slate-400" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600">Vai trò</label>
            <select name="role" value={formData.role} onChange={handleChange} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 bg-white text-slate-900">
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="mt-6 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300">Hủy</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">{initialData ? 'Lưu thay đổi' : 'Tạo người dùng'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserFormModal;