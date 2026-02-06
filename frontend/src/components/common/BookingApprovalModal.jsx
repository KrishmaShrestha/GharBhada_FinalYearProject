import { useState } from 'react';
import { FiCheck, FiX, FiUser, FiPhone, FiMapPin, FiCalendar, FiFileText, FiZap, FiDroplet, FiTrash2 } from 'react-icons/fi';
import Modal from './Modal';
import Badge from './Badge';

const BookingApprovalModal = ({ isOpen, onClose, booking, onApprove, onReject }) => {
    const [formData, setFormData] = useState({
        electricity_rate: 12,
        water_bill: 500,
        garbage_bill: 200,
        rules_and_regulations: 'Follow house rules, maintain cleanliness, no illegal activities, no loud noise after 10 PM.'
    });
    const [rejectionReason, setRejectionReason] = useState('');
    const [showRejectForm, setShowRejectForm] = useState(false);
    const [loading, setLoading] = useState(false);

    if (!booking) return null;

    const handleApprove = async () => {
        setLoading(true);
        try {
            await onApprove(booking.booking_id || booking.request_id, formData);
            onClose();
        } catch (error) {
            console.error('Approval error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleReject = async () => {
        if (!rejectionReason.trim()) {
            alert('Please provide a reason for rejection');
            return;
        }
        setLoading(true);
        try {
            await onReject(booking.booking_id || booking.request_id, rejectionReason);
            onClose();
        } catch (error) {
            console.error('Rejection error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Review Booking Request"
            size="lg"
        >
            <div className="space-y-6">
                {/* Tenant Information */}
                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center text-white text-xl font-black">
                            {booking.tenant_name?.charAt(0) || booking.tenant_fullname?.charAt(0) || 'T'}
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">Tenant Information</h3>
                            <p className="text-xs text-gray-500">Review applicant details</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-3">
                            <FiUser className="text-gray-400" />
                            <div>
                                <p className="text-xs text-gray-500">Full Name</p>
                                <p className="font-bold text-gray-900">{booking.tenant_fullname || booking.tenant_name || 'N/A'}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <FiPhone className="text-gray-400" />
                            <div>
                                <p className="text-xs text-gray-500">Phone</p>
                                <p className="font-bold text-gray-900">{booking.tenant_phone || 'N/A'}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <FiMapPin className="text-gray-400" />
                            <div>
                                <p className="text-xs text-gray-500">Address</p>
                                <p className="font-bold text-gray-900">{booking.tenant_address || 'Not provided'}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <FiFileText className="text-gray-400" />
                            <div>
                                <p className="text-xs text-gray-500">Citizen Number</p>
                                <p className="font-bold text-gray-900">{booking.tenant_citizen_number || 'Not provided'}</p>
                            </div>
                        </div>
                    </div>

                    {booking.notes && (
                        <div className="mt-4 p-3 bg-white rounded-xl border border-gray-100">
                            <p className="text-xs text-gray-500 mb-1">Tenant's Message</p>
                            <p className="text-sm text-gray-700">{booking.notes}</p>
                        </div>
                    )}
                </div>

                {/* Property Details */}
                <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
                    <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <FiCalendar className="text-primary-600" /> Booking Details
                    </h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <p className="text-gray-500">Property</p>
                            <p className="font-bold text-gray-900">{booking.property_title}</p>
                        </div>
                        <div>
                            <p className="text-gray-500">Monthly Rent</p>
                            <p className="font-bold text-primary-600">Rs. {booking.monthly_rent?.toLocaleString()}</p>
                        </div>
                        {booking.start_date && (
                            <div>
                                <p className="text-gray-500">Requested Move-in</p>
                                <p className="font-bold text-gray-900">{new Date(booking.start_date).toLocaleDateString()}</p>
                            </div>
                        )}
                    </div>
                </div>

                {!showRejectForm ? (
                    <>
                        {/* Agreement Terms Customization */}
                        <div className="bg-white p-6 rounded-2xl border border-gray-100">
                            <h3 className="text-sm font-bold text-gray-900 mb-4">Customize Agreement Terms</h3>

                            <div className="space-y-4">
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-2 flex items-center gap-2">
                                            <FiZap className="text-yellow-500" /> Electricity Rate (Rs./unit)
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.electricity_rate}
                                            onChange={(e) => setFormData({ ...formData, electricity_rate: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-2 flex items-center gap-2">
                                            <FiDroplet className="text-blue-500" /> Water Bill (Rs./month)
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.water_bill}
                                            onChange={(e) => setFormData({ ...formData, water_bill: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-2 flex items-center gap-2">
                                            <FiTrash2 className="text-green-500" /> Garbage (Rs./month)
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.garbage_bill}
                                            onChange={(e) => setFormData({ ...formData, garbage_bill: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs text-gray-500 mb-2">House Rules & Regulations</label>
                                    <textarea
                                        value={formData.rules_and_regulations}
                                        onChange={(e) => setFormData({ ...formData, rules_and_regulations: e.target.value })}
                                        rows={3}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                                        placeholder="Enter house rules..."
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-4">
                            <button
                                onClick={() => setShowRejectForm(true)}
                                disabled={loading}
                                className="flex-1 px-6 py-3 rounded-2xl border-2 border-red-200 text-red-600 font-bold hover:bg-red-50 transition-all disabled:opacity-50"
                            >
                                Reject Request
                            </button>
                            <button
                                onClick={handleApprove}
                                disabled={loading}
                                className="flex-[2] bg-primary-600 text-white px-6 py-3 rounded-2xl font-black shadow-lg shadow-primary-200 hover:bg-primary-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {loading ? 'Processing...' : 'Approve & Send Agreement'} <FiCheck />
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        {/* Rejection Form */}
                        <div className="bg-red-50 p-6 rounded-2xl border border-red-100">
                            <h3 className="text-sm font-bold text-red-900 mb-3">Reason for Rejection</h3>
                            <textarea
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                rows={3}
                                className="w-full px-3 py-2 border border-red-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                                placeholder="Please provide a reason for the tenant..."
                            />
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={() => setShowRejectForm(false)}
                                disabled={loading}
                                className="flex-1 px-6 py-3 rounded-2xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleReject}
                                disabled={loading}
                                className="flex-1 bg-red-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-red-700 transition-all disabled:opacity-50"
                            >
                                {loading ? 'Processing...' : 'Confirm Rejection'}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </Modal>
    );
};

export default BookingApprovalModal;
