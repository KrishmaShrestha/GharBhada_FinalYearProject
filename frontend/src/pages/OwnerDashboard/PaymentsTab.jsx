import React from 'react';
import { FiDollarSign } from 'react-icons/fi';
import { format } from 'date-fns';
import Badge from '../../components/common/Badge';

const PaymentsTab = ({ payments, formatDateSafe }) => {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
            <div className="flex items-center justify-between glass p-6 rounded-3xl border border-white/20 shadow-xl">
                <div>
                    <h2 className="text-2xl font-black text-gray-900 tracking-tight">Financial Records</h2>
                    <p className="text-sm text-gray-500 font-medium">Detailed tracking of rent and utility collections</p>
                </div>
                <div className="p-4 bg-primary-600/10 text-primary-600 rounded-2xl border border-primary-100 flex items-center gap-2 animate-pulse">
                    <FiDollarSign strokeWidth={3} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Revenue Tracking Active</span>
                </div>
            </div>

            {payments.length === 0 ? (
                <div className="glass rounded-[2rem] border border-white/20 p-20 text-center shadow-lg">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-200">
                        <FiDollarSign size={40} />
                    </div>
                    <h3 className="text-xl font-black text-gray-900 mb-2">No Transactions Found</h3>
                    <p className="text-sm text-gray-400 font-medium">Your financial history will materialize here as payments are recorded.</p>
                </div>
            ) : (
                <div className="glass rounded-[2rem] border border-white/20 shadow-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-900 text-white border-b border-gray-800">
                                <tr>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest">Tenant Detail</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest">Property Assignment</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest">Processing Date</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest">Transaction Value</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest">Fulfillment</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100/50 bg-white/40">
                                {payments.map((p, idx) => (
                                    <tr key={idx} className="hover:bg-primary-50/30 transition-all duration-300 group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gradient-to-tr from-gray-100 to-white rounded-xl flex items-center justify-center font-black text-gray-400 border border-gray-100 group-hover:from-primary-600 group-hover:to-primary-400 group-hover:text-white transition-all">
                                                    {p.tenant_name?.charAt(0)}
                                                </div>
                                                <p className="font-black text-gray-900 text-sm group-hover:text-primary-700 transition-colors uppercase tracking-tight">{p.tenant_name}</p>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <p className="text-sm text-gray-600 font-bold group-hover:text-gray-900 transition-colors">{p.property_title}</p>
                                        </td>
                                        <td className="px-8 py-6">
                                            <p className="text-xs text-gray-500 font-black tracking-tighter uppercase">{p.paid_at ? format(new Date(p.paid_at), 'MMM d, yyyy') : formatDateSafe(p.created_at)}</p>
                                        </td>
                                        <td className="px-8 py-6">
                                            <p className="text-base font-black text-gray-900 group-hover:text-primary-600 transition-colors">Rs. {p.amount?.toLocaleString() || p.total_amount?.toLocaleString()}</p>
                                        </td>
                                        <td className="px-8 py-6">
                                            <Badge variant="success" className="shadow-sm border-none bg-green-500 text-white py-1.5 px-4 rounded-xl font-black text-[10px] tracking-widest">COMPLETED</Badge>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PaymentsTab;
