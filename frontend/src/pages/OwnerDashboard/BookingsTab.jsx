import React from 'react';
import { FiUsers, FiCalendar, FiClock, FiCheck, FiX, FiFileText, FiMail, FiPhone, FiMapPin, FiCreditCard } from 'react-icons/fi';
import { format } from 'date-fns';
import Badge from '../../components/common/Badge';

const BookingsTab = ({ bookingRequests, onAccept, onReject, onApproveDuration, onCreateAgreement, onMoreInfo }) => {
    const getStatusConfig = (status) => {
        const configs = {
            'pending': { label: 'New Request', color: 'blue', icon: FiClock },
            'accepted': { label: 'Accepted', color: 'green', icon: FiCheck },
            'duration_pending': { label: 'Duration Review', color: 'amber', icon: FiCalendar },
            'duration_approved': { label: 'Ready for Agreement', color: 'purple', icon: FiFileText },
            'agreement_pending': { label: 'Awaiting Signature', color: 'orange', icon: FiFileText },
            'payment_pending': { label: 'Awaiting Payment', color: 'indigo', icon: FiCreditCard },
            'active': { label: 'Active Lease', color: 'emerald', icon: FiCheck },
            'rejected': { label: 'Rejected', color: 'red', icon: FiX }
        };
        return configs[status] || configs['pending'];
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return 'N/A';
        try {
            return format(new Date(dateStr), 'MMM dd, yyyy');
        } catch {
            return 'Invalid Date';
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900">Booking Requests</h2>
                    <p className="text-sm text-gray-500 mt-1">Manage tenant applications and lease agreements</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
                    <span className="text-sm font-medium text-gray-600">Total:</span>
                    <span className="text-lg font-bold text-gray-900">{bookingRequests.length}</span>
                </div>
            </div>

            {/* Requests List */}
            {bookingRequests.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center">
                    <div className="max-w-sm mx-auto">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FiUsers className="w-10 h-10 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Booking Requests</h3>
                        <p className="text-sm text-gray-500">New tenant applications will appear here when they express interest in your properties.</p>
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    {bookingRequests.map((request) => {
                        const statusConfig = getStatusConfig(request.status);
                        const StatusIcon = statusConfig.icon;

                        return (
                            <div
                                key={request.request_id || request.booking_id}
                                className="bg-white rounded-2xl border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all duration-200"
                            >
                                <div className="p-6">
                                    {/* Top Section: Status Badge & Reference */}
                                    <div className="flex items-start justify-between mb-6">
                                        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-${statusConfig.color}-50 border border-${statusConfig.color}-200`}>
                                            <StatusIcon className={`w-4 h-4 text-${statusConfig.color}-600`} />
                                            <span className={`text-sm font-semibold text-${statusConfig.color}-700`}>
                                                {statusConfig.label}
                                            </span>
                                        </div>
                                        <span className="text-xs font-mono text-gray-500 bg-gray-100 px-3 py-1.5 rounded-md">
                                            REF-{String(request.request_id || request.booking_id).padStart(5, '0')}
                                        </span>
                                    </div>

                                    {/* Main Content Grid */}
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                        {/* Left: Tenant Information */}
                                        <div className="lg:col-span-2 space-y-4">
                                            {/* Tenant Profile */}
                                            <div className="flex items-start gap-4">
                                                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xl font-bold shadow-md">
                                                    {request.tenant_name?.charAt(0) || 'T'}
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                                                        {request.tenant_name || 'Unknown Tenant'}
                                                    </h3>
                                                    <p className="text-sm text-gray-600 mb-3">
                                                        Interested in <span className="font-semibold text-blue-600">{request.property_title}</span>
                                                    </p>

                                                    {/* Contact Info */}
                                                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                                                        {request.tenant_email && (
                                                            <div className="flex items-center gap-1.5">
                                                                <FiMail className="w-4 h-4 text-gray-400" />
                                                                <span>{request.tenant_email}</span>
                                                            </div>
                                                        )}
                                                        {request.tenant_phone && (
                                                            <div className="flex items-center gap-1.5">
                                                                <FiPhone className="w-4 h-4 text-gray-400" />
                                                                <span>{request.tenant_phone}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Details Grid */}
                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                                <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <FiCalendar className="w-4 h-4 text-gray-400" />
                                                        <span className="text-xs font-medium text-gray-500">Lease Duration</span>
                                                    </div>
                                                    <p className="text-sm font-semibold text-gray-900">
                                                        {request.rental_years || 0}y {request.rental_months || 0}m
                                                    </p>
                                                </div>

                                                <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <FiClock className="w-4 h-4 text-gray-400" />
                                                        <span className="text-xs font-medium text-gray-500">Requested</span>
                                                    </div>
                                                    <p className="text-sm font-semibold text-gray-900">
                                                        {formatDate(request.created_at || request.booking_date)}
                                                    </p>
                                                </div>

                                                {request.tenant_address && (
                                                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-100 col-span-2 sm:col-span-1">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <FiMapPin className="w-4 h-4 text-gray-400" />
                                                            <span className="text-xs font-medium text-gray-500">Location</span>
                                                        </div>
                                                        <p className="text-sm font-semibold text-gray-900 truncate">
                                                            {request.tenant_address}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Notes */}
                                            {request.notes && (
                                                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                                                    <p className="text-xs font-medium text-blue-700 mb-1">Tenant Notes</p>
                                                    <p className="text-sm text-blue-900">{request.notes}</p>
                                                </div>
                                            )}

                                            {/* View Full Profile Button */}
                                            <button
                                                onClick={() => onMoreInfo(request)}
                                                className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200"
                                            >
                                                View Full Profile & Documents
                                            </button>
                                        </div>

                                        {/* Right: Actions */}
                                        <div className="lg:border-l lg:border-gray-200 lg:pl-6 space-y-3">
                                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">
                                                Actions
                                            </p>

                                            {/* Pending Status */}
                                            {request.status === 'pending' && (
                                                <div className="space-y-2">
                                                    <button
                                                        onClick={() => onAccept(request.request_id || request.booking_id)}
                                                        className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 shadow-sm"
                                                    >
                                                        <FiCheck className="w-5 h-5" />
                                                        Accept Request
                                                    </button>
                                                    <button
                                                        onClick={() => onReject(request.request_id || request.booking_id)}
                                                        className="w-full px-4 py-3 bg-white hover:bg-red-50 text-red-600 border border-red-200 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                                                    >
                                                        <FiX className="w-5 h-5" />
                                                        Reject
                                                    </button>
                                                </div>
                                            )}

                                            {/* Duration Pending */}
                                            {request.status === 'duration_pending' && (
                                                <div className="space-y-2">
                                                    <button
                                                        onClick={() => onApproveDuration(request.request_id || request.booking_id, true)}
                                                        className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 shadow-sm"
                                                    >
                                                        <FiCheck className="w-5 h-5" />
                                                        Approve Duration
                                                    </button>
                                                    <button
                                                        onClick={() => onApproveDuration(request.request_id || request.booking_id, false)}
                                                        className="w-full px-4 py-3 bg-white hover:bg-red-50 text-red-600 border border-red-200 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                                                    >
                                                        <FiX className="w-5 h-5" />
                                                        Decline
                                                    </button>
                                                </div>
                                            )}

                                            {/* Duration Approved */}
                                            {request.status === 'duration_approved' && (
                                                <button
                                                    onClick={() => onCreateAgreement(request)}
                                                    className="w-full px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 shadow-sm"
                                                >
                                                    <FiFileText className="w-5 h-5" />
                                                    Create Agreement
                                                </button>
                                            )}

                                            {/* Passive States */}
                                            {['agreement_pending', 'payment_pending', 'accepted'].includes(request.status) && (
                                                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-center">
                                                    <FiClock className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                                                    <p className="text-sm font-semibold text-amber-900 mb-1">
                                                        {request.status === 'agreement_pending' ? 'Awaiting Tenant Signature' :
                                                            request.status === 'payment_pending' ? 'Awaiting Payment' : 'Pending Tenant Action'}
                                                    </p>
                                                    <p className="text-xs text-amber-700">No action required</p>
                                                </div>
                                            )}

                                            {/* Active Status */}
                                            {request.status === 'active' && (
                                                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                                                    <FiCheck className="w-8 h-8 text-green-500 mx-auto mb-2" />
                                                    <p className="text-sm font-semibold text-green-900">Active Tenancy</p>
                                                    <p className="text-xs text-green-700">Lease is active</p>
                                                </div>
                                            )}

                                            {/* Rejected Status */}
                                            {request.status === 'rejected' && (
                                                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                                                    <FiX className="w-8 h-8 text-red-500 mx-auto mb-2" />
                                                    <p className="text-sm font-semibold text-red-900">Request Rejected</p>
                                                    {request.rejection_reason && (
                                                        <p className="text-xs text-red-700 mt-2">{request.rejection_reason}</p>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default BookingsTab;
