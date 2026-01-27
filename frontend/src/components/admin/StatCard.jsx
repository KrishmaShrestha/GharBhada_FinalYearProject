import React from 'react';
import { FiTrendingUp, FiTrendingDown } from 'react-icons/fi';

const StatCard = ({ title, value, icon: Icon, trend, trendValue, color = 'blue', subtitle }) => {
    const colorClasses = {
        blue: 'from-blue-500 to-blue-600',
        green: 'from-green-500 to-green-600',
        purple: 'from-purple-500 to-purple-600',
        orange: 'from-orange-500 to-orange-600',
        red: 'from-red-500 to-red-600',
        indigo: 'from-indigo-500 to-indigo-600',
        pink: 'from-pink-500 to-pink-600',
        teal: 'from-teal-500 to-teal-600',
    };

    return (
        <div className={`bg-gradient-to-br ${colorClasses[color]} rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}>
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-sm font-medium opacity-90 mb-2">{title}</p>
                    <h3 className="text-3xl font-bold mb-2">{value}</h3>
                    {subtitle && (
                        <p className="text-xs opacity-75">{subtitle}</p>
                    )}
                </div>
                {Icon && (
                    <div className="bg-white bg-opacity-20 rounded-lg p-3">
                        <Icon className="w-6 h-6" />
                    </div>
                )}
            </div>

            {trend && (
                <div className="mt-4 flex items-center text-sm">
                    {trend === 'up' ? (
                        <FiTrendingUp className="w-4 h-4 mr-1" />
                    ) : (
                        <FiTrendingDown className="w-4 h-4 mr-1" />
                    )}
                    <span className="font-medium">{trendValue}</span>
                    <span className="ml-1 opacity-75">vs last month</span>
                </div>
            )}
        </div>
    );
};

export default StatCard;
