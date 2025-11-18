import React from 'react';

interface TableSkeletonProps {
    rows?: number;
    cols?: number;
}

const TableSkeleton: React.FC<TableSkeletonProps> = ({ rows = 5, cols = 5 }) => {
    return (
        <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            {Array.from({ length: cols }).map((_, i) => (
                                <th key={i} scope="col" className="px-6 py-4">
                                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {Array.from({ length: rows }).map((_, i) => (
                             <tr key={i} className="bg-white border-b animate-pulse">
                                {Array.from({ length: cols }).map((_, j) => (
                                    <td key={j} className="px-6 py-4">
                                        <div className={`h-4 rounded ${j === 0 ? 'w-full' : 'w-3/4'} bg-gray-200`}></div>
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TableSkeleton;