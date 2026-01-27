import React from 'react';

export const SkeletonCard = () => (
    <div className="bg-white rounded-xl p-6 shadow-lg animate-pulse">
        <div className="flex items-start justify-between">
            <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-3"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
            </div>
            <div className="bg-gray-200 rounded-lg w-12 h-12"></div>
        </div>
    </div>
);

export const SkeletonTable = ({ rows = 5 }) => (
    <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="animate-pulse">
            {/* Header */}
            <div className="bg-gray-50 px-6 py-3 border-b">
                <div className="flex gap-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="h-4 bg-gray-200 rounded flex-1"></div>
                    ))}
                </div>
            </div>
            {/* Rows */}
            {Array.from({ length: rows }).map((_, i) => (
                <div key={i} className="px-6 py-4 border-b border-gray-100">
                    <div className="flex gap-4">
                        {[1, 2, 3, 4, 5].map((j) => (
                            <div key={j} className="h-4 bg-gray-200 rounded flex-1"></div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    </div>
);

export const SkeletonChart = () => (
    <div className="bg-white rounded-lg p-6 shadow animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="h-64 bg-gray-200 rounded"></div>
    </div>
);
