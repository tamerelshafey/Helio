import React from 'react';
import { BuildingIcon, DecorationIcon, FinishingIcon } from './icons/Icons';

const ServiceCard: React.FC<{ icon: React.ReactNode; title: string; description: string }> = ({ icon, title, description }) => (
    <div className="bg-gray-800 p-8 rounded-lg border border-gray-700 text-center flex flex-col items-center">
        <div className="flex-shrink-0 bg-amber-500/10 text-amber-500 p-4 rounded-full mb-6">
            {icon}
        </div>
        <h3 className="text-2xl font-bold text-white mb-3">{title}</h3>
        <p className="text-gray-400 leading-relaxed">{description}</p>
    </div>
);

const ServicesPage: React.FC = () => {
    const services = [
        {
            icon: <BuildingIcon className="w-8 h-8" />,
            title: "الخدمات العقارية المتكاملة",
            description: "نوفر خدمات بيع وشراء وتأجير العقارات السكنية والتجارية. نساعدك في عرض عقارك على منصتنا للوصول إلى أكبر عدد من العملاء المحتملين."
        },
        {
            icon: <FinishingIcon className="w-8 h-8" />,
            title: "التشطيب والتصميم الداخلي",
            description: "نقدم حلولاً متكاملة للتشطيبات والتصميم الداخلي، بدءًا من وضع التصاميم والمقايسات الدقيقة، وصولاً إلى التنفيذ والإشراف بأعلى معايير الجودة."
        },
        {
            icon: <DecorationIcon className="w-8 h-8" />,
            title: "الديكورات والتحف الفنية",
            description: "نصمم وننفذ ديكورات جدارية فريدة ومنحوتات فنية رائعة. نوفر تشكيلة واسعة من اللوحات والتحف التي تضيف لمسة جمالية استثنائية لمنزلك أو مكتبك."
        }
    ];
    return (
        <div className="py-20 bg-gray-900">
            <div className="container mx-auto px-6">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-bold text-white">خدماتنا</h1>
                    <p className="text-lg text-gray-400 mt-4 max-w-2xl mx-auto">حلول شاملة تلبي كافة احتياجاتكم العقارية، من التصميم والديكور إلى التشطيبات والتسويق.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {services.map((service) => (
                        <ServiceCard key={service.title} {...service} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ServicesPage;