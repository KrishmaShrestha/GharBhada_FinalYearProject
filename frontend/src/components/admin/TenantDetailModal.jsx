import React from 'react';
import { FiX, FiUser, FiPhone, FiMail, FiMapPin, FiBriefcase, FiFileText } from 'react-icons/fi';
import Modal from '../common/Modal';

const TenantDetailModal = ({ isOpen, onClose, tenant }) => {
    if (!tenant) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Tenant Profile Details"
            size="md"
        >
            <div className="space-y-6 pb-2">
                {/* Profile Header */}
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <div className="w-16 h-16 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-2xl font-black border-4 border-white shadow-sm">
                        {tenant.tenant_name?.charAt(0)}
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-gray-900">{tenant.tenant_name}</h3>
                        <p className="text-sm text-gray-500 flex items-center gap-1 uppercase tracking-wider font-bold">
                            <FiUser className="text-primary-500" /> Prospective Tenant
                        </p>
                    </div>
                </div>

                {/* Contact Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl border border-gray-100 hover:border-primary-200 transition-colors">
                        <p className="text-[10px] text-gray-400 font-black uppercase mb-1">Phone Number</p>
                        <p className="font-bold text-gray-900 flex items-center gap-2">
                            <FiPhone className="text-primary-500" /> {tenant.tenant_phone || 'N/A'}
                        </p>
                    </div>
                    <div className="p-4 rounded-xl border border-gray-100 hover:border-primary-200 transition-colors">
                        <p className="text-[10px] text-gray-400 font-black uppercase mb-1">Email Address</p>
                        <p className="font-bold text-gray-900 flex items-center gap-2">
                            <FiMail className="text-primary-500" /> {tenant.tenant_email || 'N/A'}
                        </p>
                    </div>
                </div>

                {/* Citizenship Information */}
                <div className="p-4 rounded-xl border border-gray-100 bg-primary-50/30">
                    <p className="text-[10px] text-gray-400 font-black uppercase mb-1">Citizenship / National ID</p>
                    <div className="flex items-center justify-between">
                        <p className="font-bold text-gray-900 flex items-center gap-2">
                            <FiFileText className="text-primary-500" /> {tenant.tenant_citizen_number || 'Not Provided'}
                        </p>
                        <span className="text-[10px] bg-green-100 text-green-600 px-2 py-1 rounded-full font-bold uppercase">Verified Identity</span>
                    </div>
                </div>

                {/* Address Information */}
                <div className="p-4 rounded-xl border border-gray-100">
                    <p className="text-[10px] text-gray-400 font-black uppercase mb-1">Permanent Address</p>
                    <p className="font-bold text-gray-900 flex items-center gap-2">
                        <FiMapPin className="text-primary-500" /> {tenant.tenant_address || 'Address information not shared'}
                    </p>
                </div>

                {/* Message Section */}
                {tenant.notes && (
                    <div className="p-4 rounded-xl border border-gray-100 bg-yellow-50/30">
                        <p className="text-[10px] text-gray-400 font-black uppercase mb-1">Tenant's Message</p>
                        <p className="text-sm text-gray-700 italic leading-relaxed">"{tenant.notes}"</p>
                    </div>
                )}

                <div className="pt-4 flex flex-col gap-3">
                    <button
                        onClick={onClose}
                        className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-all shadow-lg shadow-gray-200"
                    >
                        Close Details
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default TenantDetailModal;
