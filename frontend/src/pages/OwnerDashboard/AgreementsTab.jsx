import React from 'react';
import { FiFileText, FiDollarSign, FiExternalLink, FiCalendar, FiMapPin, FiShield, FiAlertCircle } from 'react-icons/fi';
import Badge from '../../components/common/Badge';

const AgreementsTab = ({ agreements, formatDateSafe, onRecordPayment, onTerminate }) => {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                <div>
                    <h2 className="text-2xl font-black text-gray-900 tracking-tight">Rental Agreements</h2>
                    <p className="text-sm text-gray-500 font-medium">Digital legal contracts and binding documents</p>
                </div>
                <div className="hidden sm:flex items-center gap-2 bg-primary-50 px-4 py-2 rounded-xl border border-primary-100">
                    <FiShield className="text-primary-600" />
                    <span className="text-[10px] font-black text-primary-600 uppercase tracking-widest text-center">Digitally Verified & Encrypted</span>
                </div>
            </div>

            {agreements.length === 0 ? (
                <div className="bg-white rounded-3xl border border-gray-100 p-20 text-center shadow-sm">
                    <FiFileText className="w-20 h-20 mx-auto mb-6 text-gray-200" />
                    <h3 className="text-xl font-black text-gray-900 mb-2">No Active Records</h3>
                    <p className="text-sm font-medium text-gray-400">All your signed rental agreements will be organized here.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {agreements.map((agm) => (
                        <div key={agm.agreement_id} className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-2xl hover:border-primary-100 transition-all duration-300 flex flex-col justify-between group">
                            <div>
                                <div className="flex justify-between items-start mb-6">
                                    <div className="w-14 h-14 bg-gradient-to-br from-primary-50 to-primary-100 text-primary-600 rounded-2xl flex items-center justify-center text-2xl border border-primary-200 shadow-inner group-hover:scale-110 transition-transform">
                                        <FiFileText />
                                    </div>
                                    <Badge variant={
                                        agm.status === 'active' ? 'success' :
                                            agm.status === 'agreement_pending' ? 'warning' : 'danger'
                                    } size="lg">
                                        {agm.status === 'agreement_pending' ? 'WAITING FOR SIGNATURE' : agm.status.toUpperCase()}
                                    </Badge>
                                </div>
                                <h3 className="font-black text-gray-900 text-xl mb-1 uppercase tracking-tight">{agm.property_title}</h3>
                                <div className="flex items-center gap-1 text-sm text-gray-500 mb-6 font-medium">
                                    <FiMapPin className="text-gray-400" /> {agm.property_city || 'Baneshwor, Kathmandu'}
                                </div>

                                <div className="space-y-3 bg-gray-50 p-5 rounded-2xl border border-gray-100 mb-8">
                                    <div className="flex justify-between items-center text-[10px]">
                                        <span className="text-gray-400 uppercase font-black tracking-widest">Monthly Rent</span>
                                        <span className="font-black text-gray-900">Rs. {agm.monthly_rent?.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-[10px]">
                                        <span className="text-gray-400 uppercase font-black tracking-widest">Lease Duration</span>
                                        <span className="font-black text-gray-900">{agm.lease_duration_years} Years</span>
                                    </div>
                                    <div className="flex justify-between items-center text-[10px]">
                                        <span className="text-gray-400 uppercase font-black tracking-widest flex items-center gap-1">
                                            <FiCalendar /> Expires On
                                        </span>
                                        <span className="font-black text-primary-600">{formatDateSafe(agm.lease_end_date)}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-3">
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => onRecordPayment(agm)}
                                        disabled={agm.status !== 'active' && agm.status !== 'payment_pending'}
                                        className={`flex-1 ${agm.status === 'active' || agm.status === 'payment_pending' ? 'bg-primary-600 hover:bg-primary-700 shadow-lg shadow-primary-100' : 'bg-gray-200 cursor-not-allowed opacity-50'} text-white py-3 rounded-2xl font-black flex items-center justify-center gap-2 transition-all text-xs uppercase tracking-widest`}
                                    >
                                        <FiDollarSign strokeWidth={3} /> Record Payment
                                    </button>
                                    <button className="px-5 py-3 bg-white text-gray-900 border-2 border-gray-100 rounded-2xl hover:bg-gray-50 transition-all shadow-sm">
                                        <FiExternalLink strokeWidth={3} />
                                    </button>
                                </div>
                                {agm.status === 'active' && (
                                    <button
                                        onClick={() => onTerminate(agm.agreement_id)}
                                        className="w-full text-[10px] font-black text-red-400 hover:text-red-600 p-3 bg-red-50/30 hover:bg-red-50 rounded-xl transition-all uppercase tracking-widest flex items-center justify-center gap-2 border border-transparent hover:border-red-100"
                                    >
                                        <FiAlertCircle /> Suspend / Terminate Agreement
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AgreementsTab;
