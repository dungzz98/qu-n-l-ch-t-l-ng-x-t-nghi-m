import React from 'react';
import { SubPage } from './EnvironmentSafetyPage';
import { LoginIcon } from './icons/LoginIcon';
import { BuildingStorefrontIcon } from './icons/BuildingStorefrontIcon';
import { ThermometerIcon } from './icons/ThermometerIcon';
import { WaterIcon } from './icons/WaterIcon';
import { DocumentAlertIcon } from './icons/DocumentAlertIcon';
import { SettingsIcon } from './icons/SettingsIcon';

interface SafetyDashboardPageProps {
  onNavigate: (page: SubPage) => void;
}

const ActionCard: React.FC<{ icon: React.ReactNode; title: string; description: string; onClick: () => void; }> = ({ icon, title, description, onClick }) => (
    <div onClick={onClick} className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col border border-slate-200">
        <div className="flex items-center mb-3">
            <div className="p-3 bg-slate-100 rounded-full mr-4">{icon}</div>
            <h3 className="text-lg font-bold text-slate-800">{title}</h3>
        </div>
        <p className="text-sm text-slate-600 flex-grow">{description}</p>
        <div className="text-right text-blue-600 font-semibold mt-4">
            Đi đến &rarr;
        </div>
    </div>
);

const SafetyDashboardPage: React.FC<SafetyDashboardPageProps> = ({ onNavigate }) => {
    return (
        <div>
            <h2 className="text-xl font-bold text-slate-800 mb-4">Chức năng</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <ActionCard 
                    icon={<LoginIcon className="w-6 h-6 text-green-600" />}
                    title="Sổ Ra/Vào"
                    description="Ghi nhận và quản lý lịch sử ra vào các khu vực được kiểm soát trong phòng xét nghiệm."
                    onClick={() => onNavigate('access')}
                />
                <ActionCard 
                    icon={<BuildingStorefrontIcon className="w-6 h-6 text-sky-600" />}
                    title="Giám sát Khu vực"
                    description="Theo dõi nhiệt độ và độ ẩm của các khu vực quan trọng như phòng xét nghiệm, kho lưu trữ."
                    onClick={() => onNavigate('areaEnv')}
                />
                <ActionCard 
                    icon={<ThermometerIcon className="w-6 h-6 text-amber-600" />}
                    title="Nhiệt độ Thiết bị"
                    description="Ghi nhận và theo dõi nhiệt độ của các thiết bị như tủ lạnh, tủ ấm, tủ đông."
                    onClick={() => onNavigate('equipEnv')}
                />
                <ActionCard 
                    icon={<WaterIcon className="w-6 h-6 text-blue-600" />}
                    title="Độ dẫn điện Nước"
                    description="Kiểm tra và ghi nhận chất lượng nước DI, nước cất sử dụng trong xét nghiệm."
                    onClick={() => onNavigate('waterConductivity')}
                />
                <ActionCard 
                    icon={<DocumentAlertIcon className="w-6 h-6 text-red-600" />}
                    title="Báo cáo Sự cố"
                    description="Lập và quản lý các phiếu báo cáo sự cố phơi nhiễm hoặc tai nạn lao động."
                    onClick={() => onNavigate('incidents')}
                />
                 <ActionCard 
                    icon={<SettingsIcon className="w-6 h-6 text-slate-600" />}
                    title="Cài đặt"
                    description="Quản lý danh mục các khu vực, thiết bị, và nguồn nước cần giám sát."
                    onClick={() => onNavigate('manageItems')}
                />
            </div>
        </div>
    );
};

export default SafetyDashboardPage;
