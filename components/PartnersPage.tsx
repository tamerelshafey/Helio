import React from 'react';

const PartnerCard: React.FC<{ name: string; description: string }> = ({ name, description }) => (
    <div className="bg-gray-800 p-8 rounded-lg border border-gray-700">
        <h3 className="text-2xl font-bold text-amber-500 mb-3">{name}</h3>
        <p className="text-gray-400">{description}</p>
    </div>
);

const PartnersPage: React.FC = () => {
    const partners = [
        { name: "الشركة المتحدة للتطوير", description: "شريكنا الاستراتيجي في تطوير المشاريع السكنية الفاخرة، معروفون بالجودة والالتزام بالمواعيد." },
        { name: "المتحدة جروب للمقاولات", description: "ذراعنا التنفيذي في مجال المقاولات والتشطيبات، يمتلكون خبرة واسعة في تنفيذ المشاريع الكبرى." },
        { name: "مجموعة البناء الحديث", description: "متخصصون في توفير مواد البناء عالية الجودة التي نعتمد عليها في جميع مشاريعنا لضمان المتانة والأمان." },
        { name: "الرواد للهندسة والاستشارات", description: "يقدمون لنا الدعم الهندسي والاستشارات الفنية لضمان أن جميع تصاميمنا تتبع أعلى المعايير العالمية." },
        { name: "ديزاين هاب", description: "خبراء التصميم الداخلي الذين نتعاون معهم لابتكار مساحات عصرية ووظيفية تلبي أذواق عملائنا." },
        { name: "مستقبل العقارات للتسويق", description: "يتولون تسويق مشاريعنا العقارية بخطط مبتكرة تضمن الوصول إلى الشريحة المستهدفة بفعالية." }
    ];

    return (
        <div className="py-20 bg-gray-900">
            <div className="container mx-auto px-6">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-bold text-white">شركاء النجاح</h1>
                    <p className="text-lg text-gray-400 mt-4 max-w-2xl mx-auto">مسيرتنا نحو التميز مبنية على الثقة والتعاون مع نخبة من أفضل الشركات في مختلف المجالات.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {partners.map((partner) => (
                        <PartnerCard key={partner.name} {...partner} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PartnersPage;