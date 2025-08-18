
import React from 'react';

const InvestorLogo = ({ name }: { name: string }) => (
    <div className="h-12 flex items-center justify-center text-gray-400 text-3xl font-bold opacity-70 hover:opacity-100 transition-opacity">
        {name}
    </div>
);

const Investors: React.FC = () => {
    const investors = ["Sequoia", "Accel", "a16z", "Lightspeed"];

    return (
        <div className="py-20">
            <div className="container mx-auto px-6 text-center">
                <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-10">
                    Our Investors
                </h2>
                <div className="flex flex-wrap justify-center items-center gap-x-16 gap-y-8">
                    {investors.map((name) => (
                        <InvestorLogo key={name} name={name} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Investors;
