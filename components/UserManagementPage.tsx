import React, { useState } from 'react';
// FIX: The imported file './types' was not a module. With the new types.ts, this now works.
import { User } from '../types';
import { PlusIcon } from './icons/PlusIcon';
import { EditIcon } from './icons/EditIcon';
import { TrashIcon } from './icons/TrashIcon';
import UserFormModal from './UserFormModal';

interface UserManagementPageProps {
  users: User[];
  currentUser: User;
  onAddUser: (user: Omit<User, 'id'>) => void;
  onUpdateUser: (user: User) => void;
  onDeleteUser: (userId: string) => void;
}

const UserManagementPage: React.FC<UserManagementPageProps> = ({ users, currentUser, onAddUser, onUpdateUser, onDeleteUser }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const handleAddClick = () => {
    setEditingUser(null);
    setIsFormOpen(true);
  };

  const handleEditClick = (user: User) => {
    setEditingUser(user);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (userId: string) => {
    if (userId === currentUser.id) {
      alert("Bạn không thể xóa chính mình.");
      return;
    }
    if (window.confirm("Bạn có chắc chắn muốn xóa người dùng này?")) {
      onDeleteUser(userId);
    }
  };

  const handleFormSubmit = (userData: Omit<User, 'id'> | User) => {
    if ('id' in userData) {
      onUpdateUser(userData);
    } else {
      onAddUser(userData as Omit<User, 'id'>);
    }
    setIsFormOpen(false);
  };

  return (
    <>
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-slate-800">Quản lý Người dùng</h2>
          <button
            onClick={handleAddClick}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Thêm người dùng
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Tên đăng nhập</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Họ và Tên</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Vai trò</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Hành động</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {users.map(user => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{user.username}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{user.fullName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === 'admin' ? 'bg-indigo-100 text-indigo-800' : 'bg-green-100 text-green-800'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-4">
                      <button onClick={() => handleEditClick(user)} className="text-blue-600 hover:text-blue-900" title="Chỉnh sửa"><EditIcon /></button>
                      <button onClick={() => handleDeleteClick(user.id)} className="text-red-600 hover:text-red-900" title="Xóa"><TrashIcon /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <UserFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={editingUser}
        currentUser={currentUser}
      />
    </>
  );
};

export default UserManagementPage;