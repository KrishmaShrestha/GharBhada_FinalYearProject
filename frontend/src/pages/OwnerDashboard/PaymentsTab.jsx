import React from 'react';
import { FiDollarSign } from 'react-icons/fi';
import { format } from 'date-fns';
import Badge from '../../components/common/Badge';

const PaymentsTab = ({ payments, formatDateSafe }) => {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Payment Management</h2>
                    <p className="text-sm text-gray-500">Track monthly rent and utility payments</p>
                </div>
            </div>

            {payments.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400 shadow-sm">
                    <FiDollarSign className="w-16 h-16 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-gray-900 mb-1">No Payment History</h3>
                    <p className="text-sm">Payments will appear here once recorded.</p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Tenant</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Property</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Amount</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {payments.map((p, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-gray-900 text-sm">{p.tenant_name}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-gray-600">{p.property_title}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-xs text-gray-500">{p.paid_at ? format(new Date(p.paid_at), 'MMM d, yyyy') : 'N/A'}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-primary-600 text-sm">Rs. {p.total_amount?.toLocaleString()}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge variant="success">Paid</Badge>
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
