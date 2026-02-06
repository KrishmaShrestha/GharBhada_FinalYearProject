import React from 'react';
import { FiHome, FiCalendar, FiUsers, FiDollarSign, FiTrendingUp, FiBell, FiPlus, FiArrowRight } from 'react-icons/fi';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import StatCard from '../../components/admin/StatCard';
import Badge from '../../components/common/Badge';

const OverviewTab = ({ stats, notifications, properties, earningsData, onAddProperty, setActiveTab }) => {
    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Properties Overall"
                    value={stats?.total_properties || 0}
                    icon={FiHome}
                    color="blue"
                    subtitle="Total assets registered"
                />
                <StatCard
                    title="Active Tenancies"
                    value={stats?.active_rentals || 0}
                    icon={FiCalendar}
                    color="green"
                    subtitle="Generating revenue"
                />
                <StatCard
                    title="Open Requests"
                    value={stats?.pending_requests || 0}
                    icon={FiUsers}
                    color="orange"
                    subtitle="Awaiting response"
                />
                <StatCard
                    title="Gross Earnings"
                    value={`Rs. ${(stats?.monthly_earnings || 0).toLocaleString()}`}
                    icon={FiDollarSign}
                    color="purple"
                    subtitle="Current month accrual"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Earnings Chart */}
                <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-gray-100 p-8 hover:shadow-xl transition-all duration-500">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-xl font-black text-gray-900 tracking-tight uppercase">Performance Analytics</h3>
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Earnings Revenue Stream</p>
                        </div>
                        <select className="text-[10px] font-black uppercase tracking-widest border-2 border-gray-50 bg-gray-50 rounded-xl px-4 py-2 text-gray-600 focus:ring-primary-500 transition-all">
                            <option>Last 6 Months</option>
                            <option>Last Year</option>
                        </select>
                    </div>
                    <div className="h-[320px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={earningsData}>
                                <defs>
                                    <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F9FAFB" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#9CA3AF', fontSize: 10, fontWeight: 700 }}
                                    dy={15}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#9CA3AF', fontSize: 10, fontWeight: 700 }}
                                    tickFormatter={(value) => `Rs.${value / 1000}k`}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '12px' }}
                                    itemStyle={{ fontWeight: 800, fontSize: '12px' }}
                                    labelStyle={{ fontWeight: 900, marginBottom: '4px', color: '#111827' }}
                                    formatter={(value) => [`Rs. ${value.toLocaleString()}`, 'NET REVENUE']}
                                />
                                <Area type="monotone" dataKey="amount" stroke="#3B82F6" strokeWidth={4} fillOpacity={1} fill="url(#colorEarnings)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Recent Activity / Notifications */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 flex flex-col hover:shadow-xl transition-all duration-500">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-xl font-black text-gray-900 tracking-tight uppercase">Live Activity</h3>
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Recent updates</p>
                        </div>
                        <button
                            onClick={() => setActiveTab('overview')} // Simplified, maybe navigate to a log
                            className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-primary-50 hover:text-primary-600 transition-all border border-transparent hover:border-primary-100"
                        >
                            <FiBell />
                        </button>
                    </div>
                    <div className="space-y-6 flex-1">
                        {notifications.length === 0 ? (
                            <div className="text-center py-12 bg-gray-50/50 rounded-2xl border-2 border-dashed border-gray-100">
                                <FiBell className="w-12 h-12 text-gray-200 mx-auto mb-3 opacity-50" />
                                <p className="text-xs font-black text-gray-400 uppercase tracking-tighter">System fully synchronized</p>
                            </div>
                        ) : (
                            notifications.slice(0, 5).map((notif, idx) => (
                                <div key={idx} className="flex gap-4 group cursor-default">
                                    <div className={`w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center border transition-all ${notif.type === 'booking' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                        notif.type === 'payment' ? 'bg-green-50 text-green-600 border-green-100' :
                                            'bg-purple-50 text-purple-600 border-purple-100'
                                        }`}>
                                        {notif.type === 'booking' ? <FiUsers /> :
                                            notif.type === 'payment' ? <FiDollarSign /> :
                                                <FiBell />}
                                    </div>
                                    <div className="flex-1 min-w-0 border-b border-gray-50 pb-4 last:border-0">
                                        <p className="text-xs font-black text-gray-900 uppercase tracking-tight mb-1">{notif.title}</p>
                                        <p className="text-[11px] text-gray-500 line-clamp-1 leading-relaxed font-medium">{notif.message}</p>
                                        <p className="text-[9px] text-gray-400 font-black mt-2 uppercase tracking-widest">
                                            {notif.created_at ? format(new Date(notif.created_at), 'MMM d, h:mm a') : 'Just Now'}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <button
                        onClick={() => setActiveTab('bookings')}
                        className="mt-6 w-full py-3 bg-gray-50 text-gray-600 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-gray-100 hover:text-gray-900 transition-all border border-gray-100 flex items-center justify-center gap-2"
                    >
                        Review Booking Requests <FiArrowRight strokeWidth={3} />
                    </button>
                </div>
            </div>

            {/* Quick Management Section */}
            <div className="pt-4">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-6 flex items-center gap-4">
                    <span className="shrink-0 text-primary-500 font-black">Management Hub</span>
                    <span className="flex-1 h-[1px] bg-gray-100" />
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <button
                        onClick={onAddProperty}
                        className="p-6 bg-white rounded-3xl border-2 border-gray-50 shadow-sm flex items-center gap-5 hover:border-primary-500 hover:shadow-xl transition-all duration-300 group text-left"
                    >
                        <div className="w-14 h-14 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center text-2xl group-hover:bg-primary-600 group-hover:text-white transition-all shadow-inner border border-primary-100 group-hover:border-primary-600">
                            <FiPlus strokeWidth={3} />
                        </div>
                        <div>
                            <p className="text-sm font-black text-gray-900 uppercase tracking-tight">Expand Portfolio</p>
                            <p className="text-xs text-gray-400 font-bold">Register new listing</p>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OverviewTab;
