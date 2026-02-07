import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import * as ownerService from '../services/ownerService';
import * as maintenanceService from '../services/maintenanceService';
import toast, { Toaster } from 'react-hot-toast';
import {
    FiHome, FiUsers, FiDollarSign, FiCalendar, FiTrendingUp,
    FiFileText, FiBell, FiSettings, FiTool, FiPlus, FiLogOut, FiInfo
} from 'react-icons/fi';
import { format, differenceInYears } from 'date-fns';

import Badge from '../components/common/Badge';
import { SkeletonCard, SkeletonChart } from '../components/common/Skeleton';
import AddPropertyModal from '../components/admin/AddPropertyModal';
import RecordPaymentModal from '../components/admin/RecordPaymentModal';
import CreateAgreementModal from '../components/admin/CreateAgreementModal';
import TenantDetailModal from '../components/admin/TenantDetailModal';
import BookingApprovalModal from '../components/common/BookingApprovalModal';
import EditProfileModal from '../components/common/EditProfileModal';

// Tabs
import OverviewTab from './OwnerDashboard/OverviewTab';
import PropertiesTab from './OwnerDashboard/PropertiesTab';
import BookingsTab from './OwnerDashboard/BookingsTab';
import PaymentsTab from './OwnerDashboard/PaymentsTab';
import AgreementsTab from './OwnerDashboard/AgreementsTab';
import MaintenanceTab from './OwnerDashboard/MaintenanceTab';

const IMG_BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5001';

const OwnerDashboard = () => {
    const { user, logout, updateProfile } = useAuth();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState('overview');
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [properties, setProperties] = useState([]);
    const [bookingRequests, setBookingRequests] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [agreements, setAgreements] = useState([]);
    const [payments, setPayments] = useState([]);
    const [maintenanceRequests, setMaintenanceRequests] = useState([]);

    // Modals
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [isAgreementModalOpen, setIsAgreementModalOpen] = useState(false);
    const [isTenantModalOpen, setIsTenantModalOpen] = useState(false);
    const [isBookingApprovalModalOpen, setIsBookingApprovalModalOpen] = useState(false);
    const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);

    // Selections
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [selectedAgreement, setSelectedAgreement] = useState(null);
    const [editingProperty, setEditingProperty] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const formatDateSafe = (dateStr, formatStr = 'MMM d, yyyy') => {
        if (!dateStr) return 'N/A';
        try {
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) return 'Invalid Date';
            return format(date, formatStr);
        } catch (error) {
            return 'Date Error';
        }
    };

    const isTrusted = user?.created_at ? differenceInYears(new Date(), new Date(user.created_at)) >= 1 : false;

    useEffect(() => {
        if (user) fetchData();
    }, [user]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const results = await Promise.allSettled([
                ownerService.getDashboardStats(),
                ownerService.getOwnerProperties(),
                ownerService.getBookingRequests('all'),
                ownerService.getNotifications(true),
                ownerService.getAgreements('all'),
                ownerService.getPaymentHistory(),
                maintenanceService.getMaintenanceRequests()
            ]);

            const statsRes = results[0].status === 'fulfilled' ? results[0].value : null;
            const propsRes = results[1].status === 'fulfilled' ? results[1].value : null;
            const requestsRes = results[2].status === 'fulfilled' ? results[2].value : null;
            const notifsRes = results[3].status === 'fulfilled' ? results[3].value : null;
            const agreementsRes = results[4].status === 'fulfilled' ? results[4].value : null;
            const paymentsRes = results[5].status === 'fulfilled' ? results[5].value : null;
            const maintenanceRes = results[6].status === 'fulfilled' ? results[6].value : null;

            if (statsRes) setStats(statsRes.stats);
            if (propsRes) setProperties(propsRes.properties || []);
            if (requestsRes) setBookingRequests(requestsRes.requests || []);
            if (notifsRes) setNotifications(notifsRes.notifications || []);
            if (agreementsRes) setAgreements(agreementsRes.agreements || []);
            if (paymentsRes) setPayments(paymentsRes.payments || []);
            if (maintenanceRes) setMaintenanceRequests(maintenanceRes.requests || []);

            if (!statsRes) {
                setStats({
                    total_properties: propsRes?.properties?.length || 0,
                    active_rentals: agreementsRes?.agreements?.length || 0,
                    pending_requests: requestsRes?.requests?.filter(r => r.status === 'pending')?.length || 0,
                    monthly_earnings: paymentsRes?.payments?.reduce((sum, p) => sum + (p.total_amount || 0), 0) || 0
                });
            }
        } catch (err) {
            console.error('Error fetching owner data:', err);
            toast.error('Failed to refresh dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const handleAddProperty = async (formData, images) => {
        try {
            if (editingProperty) {
                await ownerService.updateProperty(editingProperty.property_id, formData);
                toast.success('Property updated successfully!');
            } else {
                await ownerService.addProperty(formData, images);
                toast.success('Property listed successfully! Pending admin approval.');
            }
            setIsAddModalOpen(false);
            setEditingProperty(null);
            fetchData();
        } catch (err) {
            toast.error(err.message || 'Failed to save property');
        }
    };

    const handleDeleteProperty = async (propertyId) => {
        if (!window.confirm('Are you sure you want to delete this property?')) return;
        try {
            await ownerService.deleteProperty(propertyId);
            toast.success('Property deleted successfully!');
            fetchData();
        } catch (err) {
            toast.error(err.message || 'Failed to delete property');
        }
    };

    const handleAcceptBooking = async (requestId, agreementTerms) => {
        try {
            await ownerService.acceptBookingRequest(requestId, agreementTerms);
            toast.success('Booking approved! Agreement sent to tenant 🎉');
            setIsBookingApprovalModalOpen(false);
            fetchData();
        } catch (err) {
            toast.error(err.message || 'Failed to accept booking');
        }
    };

    const handleRejectBooking = async (requestId) => {
        const reason = window.prompt('Enter rejection reason:');
        if (!reason) return;
        try {
            await ownerService.rejectBookingRequest(requestId, reason);
            toast.success('Booking request rejected');
            fetchData();
        } catch (err) {
            toast.error(err.message || 'Failed to reject booking');
        }
    };

    const handleApproveDuration = async (requestId, approved) => {
        try {
            await ownerService.approveLeaseDuration(requestId, approved);
            toast.success(approved ? 'Duration approved!' : 'Duration rejected');
            fetchData();
        } catch (err) {
            toast.error(err.message || 'Failed to process duration');
        }
    };

    const handleUpdateMaintenance = async (requestId, status) => {
        const notes = window.prompt('Enter updates/notes:');
        try {
            await maintenanceService.updateMaintenanceStatus(requestId, { status, notes });
            toast.success('Status updated!');
            fetchData();
        } catch (err) {
            toast.error(err.message || 'Failed to update status');
        }
    };

    const handleCreateAgreement = async (agreementData) => {
        try {
            await ownerService.createAgreement(selectedBooking.request_id || selectedBooking.booking_id, agreementData);
            toast.success('Agreement created!');
            setIsAgreementModalOpen(false);
            fetchData();
        } catch (err) {
            toast.error(err.message || 'Failed to create agreement');
        }
    };

    const handleRecordPayment = async (modalData) => {
        try {
            // Determine if it's a deposit (first payment) or monthly rent
            // If the booking status is 'payment_pending', it's likely the initial deposit
            const isInitialPayment = selectedAgreement.status === 'agreement_pending' || selectedAgreement.status === 'pending';

            const payload = {
                booking_id: selectedAgreement.booking_id,
                amount: modalData.total_amount,
                payment_type: isInitialPayment ? 'deposit' : 'monthly_rent',
                payment_method: 'bank_transfer',
                remarks: modalData.notes,
                electricity_units: modalData.electricity_units
            };

            await ownerService.recordPayment(payload);
            toast.success('Payment recorded successfully!');
            setIsPaymentModalOpen(false);
            fetchData();
        } catch (err) {
            toast.error(err.message || 'Failed to record payment');
        }
    };

    const handleTerminateAgreement = async (agreementId) => {
        if (!window.confirm('Are you sure you want to terminate/suspend this agreement?')) return;
        try {
            await ownerService.updateAgreementStatus(agreementId, 'terminated');
            toast.success('Agreement terminated');
            fetchData();
        } catch (err) {
            toast.error(err.message || 'Failed to terminate agreement');
        }
    };

    const handleUpdateProfile = async (data) => {
        const loadingToast = toast.loading('Updating profile...');
        try {
            // Convert plain object to FormData for multipart/form-data consistency
            const formData = new FormData();
            Object.keys(data).forEach(key => {
                formData.append(key, data[key]);
            });

            const result = await updateProfile(formData);
            toast.dismiss(loadingToast);
            if (result.success) {
                toast.success('Profile updated successfully!');
                setIsEditProfileModalOpen(false);
            } else {
                toast.error(result.message || 'Failed to update profile');
            }
        } catch (err) {
            toast.dismiss(loadingToast);
            toast.error('An error occurred during update');
            console.error(err);
        }
    };

    const tabs = [
        { id: 'overview', label: 'Overview', icon: FiTrendingUp },
        { id: 'properties', label: 'My Properties', icon: FiHome },
        { id: 'bookings', label: 'Booking Requests', icon: FiUsers },
        { id: 'payments', label: 'Payments', icon: FiDollarSign },
        { id: 'agreements', label: 'Agreements', icon: FiFileText },
        { id: 'maintenance', label: 'Maintenance', icon: FiTool },
        { id: 'profile', label: 'My Profile', icon: FiUsers },
    ];

    const earningsData = [
        { name: 'Jan', amount: 45000 },
        { name: 'Feb', amount: 48000 },
        { name: 'Mar', amount: 42000 },
        { name: 'Apr', amount: 55000 },
        { name: 'May', amount: 51000 },
        { name: 'Jun', amount: 60000 },
    ];

    if (loading && !stats) {
        return (
            <div className="min-h-screen bg-gray-50 p-8">
                <div className="max-w-7xl mx-auto space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}
                    </div>
                    <SkeletonChart />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            <Toaster position="top-right" />

            {/* Header */}
            <div className="bg-white border-b sticky top-0 z-20">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <h1 className="text-2xl font-bold text-gray-900">Owner Dashboard</h1>
                        <Badge variant={isTrusted ? 'success' : 'primary'}>
                            {isTrusted ? 'Trusted Owner' : 'Verified Owner'}
                        </Badge>
                    </div>
                    <div className="flex items-center gap-6">
                        <button className="relative text-gray-500 hover:text-primary-600 transition-colors">
                            <FiBell className="w-6 h-6" />
                            {notifications.length > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">
                                    {notifications.length}
                                </span>
                            )}
                        </button>
                        <div className="h-8 w-px bg-gray-200 hidden md:block"></div>
                        <div className="flex items-center gap-3">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-semibold text-gray-900">{user?.full_name}</p>
                                <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold border-2 border-primary-500 overflow-hidden">
                                {user?.profile_image ? (
                                    <img
                                        src={`${import.meta.env.VITE_API_URL?.replace('/api', '')}${user.profile_image}`}
                                        alt=""
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            e.target.src = `https://ui-avatars.com/api/?name=${user?.full_name}&background=random`;
                                        }}
                                    />
                                ) : (
                                    user?.full_name?.charAt(0)
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs Navigation */}
            <div className="bg-white border-b sticky top-[73px] z-10">
                <div className="max-w-7xl mx-auto px-6 overflow-x-auto">
                    <nav className="flex space-x-8">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`
                                        flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-all whitespace-nowrap
                                        ${activeTab === tab.id
                                            ? 'border-primary-500 text-primary-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }
                                    `}
                                >
                                    <Icon className="w-4 h-4" />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </nav>
                </div>
            </div>

            {/* Content Area */}
            <main className="max-w-7xl mx-auto px-6 py-8">
                {activeTab === 'overview' && (
                    <OverviewTab
                        stats={stats}
                        notifications={notifications}
                        properties={properties}
                        earningsData={earningsData}
                        onAddProperty={() => { setEditingProperty(null); setIsAddModalOpen(true); }}
                        setActiveTab={setActiveTab}
                    />
                )}
                {activeTab === 'properties' && (
                    <PropertiesTab
                        properties={properties}
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm}
                        onAddProperty={() => { setEditingProperty(null); setIsAddModalOpen(true); }}
                        onEditProperty={(prop) => { setEditingProperty(prop); setIsAddModalOpen(true); }}
                        onDeleteProperty={handleDeleteProperty}
                        IMG_BASE_URL={IMG_BASE_URL}
                    />
                )}
                {activeTab === 'bookings' && (
                    <BookingsTab
                        bookingRequests={bookingRequests}
                        onAccept={(booking) => {
                            const bookingData = bookingRequests.find(b => (b.booking_id || b.request_id) === booking);
                            setSelectedBooking(bookingData);
                            setIsBookingApprovalModalOpen(true);
                        }}
                        onReject={handleRejectBooking}
                        onApproveDuration={handleApproveDuration}
                        onCreateAgreement={(booking) => { setSelectedBooking(booking); setIsAgreementModalOpen(true); }}
                        onMoreInfo={(booking) => { setSelectedBooking(booking); setIsTenantModalOpen(true); }}
                    />
                )}
                {activeTab === 'payments' && (
                    <PaymentsTab
                        payments={payments}
                        formatDateSafe={formatDateSafe}
                    />
                )}
                {activeTab === 'agreements' && (
                    <AgreementsTab
                        agreements={agreements}
                        formatDateSafe={formatDateSafe}
                        onRecordPayment={(agm) => { setSelectedAgreement(agm); setIsPaymentModalOpen(true); }}
                        onTerminate={handleTerminateAgreement}
                    />
                )}
                {activeTab === 'maintenance' && (
                    <MaintenanceTab
                        maintenanceRequests={maintenanceRequests}
                        formatDateSafe={formatDateSafe}
                        onUpdateStatus={handleUpdateMaintenance}
                    />
                )}
                {activeTab === 'profile' && (
                    <div className="max-w-4xl mx-auto space-y-8">
                        <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
                            <div className="flex flex-col md:flex-row items-center gap-8">
                                <div className="relative group">
                                    <div className="w-32 h-32 rounded-3xl bg-primary-600 border-4 border-white shadow-xl flex items-center justify-center text-white text-5xl font-black overflow-hidden">
                                        {user?.profile_image ? (
                                            <img
                                                src={`${import.meta.env.VITE_API_URL?.replace('/api', '')}${user.profile_image}`}
                                                alt=""
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            user?.full_name?.charAt(0)
                                        )}
                                    </div>
                                    <label className="absolute inset-0 flex items-center justify-center bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-3xl">
                                        <div className="text-center">
                                            <FiPlus size={24} className="mx-auto mb-1" />
                                            <span className="text-[10px] font-bold uppercase tracking-wider">Change</span>
                                        </div>
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={async (e) => {
                                                const file = e.target.files[0];
                                                if (file) {
                                                    const formData = new FormData();
                                                    formData.append('profileImage', file);
                                                    const loadingToast = toast.loading('Uploading photo...');
                                                    try {
                                                        const result = await updateProfile(formData);
                                                        toast.dismiss(loadingToast);
                                                        if (result.success) {
                                                            toast.success('Profile photo updated!');
                                                        } else {
                                                            toast.error(result.message || 'Failed to upload photo');
                                                        }
                                                    } catch (err) {
                                                        toast.dismiss(loadingToast);
                                                        toast.error('An error occurred during upload');
                                                        console.error(err);
                                                    }
                                                }
                                            }}
                                        />
                                    </label>
                                </div>
                                <div className="text-center md:text-left flex-1">
                                    <h2 className="text-3xl font-black text-gray-900 mb-1">{user?.full_name}</h2>
                                    <p className="text-gray-500 font-medium mb-4">{user?.email}</p>
                                    <div className="flex flex-wrap justify-center md:justify-start gap-2">
                                        <Badge variant={user?.role === 'owner' ? 'success' : 'primary'}>{user?.role?.toUpperCase()}</Badge>
                                        <Badge variant={user?.is_verified ? 'success' : 'warning'}>
                                            {user?.is_verified ? 'VERIFIED' : 'PENDING VERIFICATION'}
                                        </Badge>
                                    </div>
                                </div>
                                <button
                                    onClick={logout}
                                    className="p-4 bg-red-50 text-red-600 rounded-2xl hover:bg-red-600 hover:text-white transition-all group"
                                    title="Logout"
                                >
                                    <FiLogOut size={24} className="group-hover:rotate-180 transition-transform duration-500" />
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
                                <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                                    <FiInfo className="text-primary-500" /> Account Information
                                </h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                        <span className="text-gray-500 text-sm">Phone</span>
                                        <span className="font-bold text-gray-900">{user?.phone || 'Not provided'}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                        <span className="text-gray-500 text-sm">Citizen ID</span>
                                        <span className="font-bold text-gray-900">{user?.citizen_number || 'Under review'}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                        <span className="text-gray-500 text-sm">Joined On</span>
                                        <span className="font-bold text-gray-900">{user?.created_at ? formatDateSafe(user.created_at, 'MMMM yyyy') : 'Recently'}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm flex flex-col justify-center items-center text-center">
                                <div className="w-12 h-12 bg-gray-50 text-gray-400 rounded-2xl flex items-center justify-center mb-4">
                                    <FiSettings size={24} />
                                </div>
                                <h3 className="font-bold text-gray-900 mb-2">Account Settings</h3>
                                <p className="text-gray-500 text-sm mb-6">Update your address, change password or verify documents.</p>
                                <button
                                    onClick={() => setIsEditProfileModalOpen(true)}
                                    className="w-full py-3 rounded-2xl bg-gray-900 text-white font-bold hover:bg-black transition-all"
                                >
                                    Edit Profile
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {/* Modals */}
            <AddPropertyModal
                isOpen={isAddModalOpen}
                onClose={() => { setIsAddModalOpen(false); setEditingProperty(null); }}
                onAdd={handleAddProperty}
                property={editingProperty}
            />
            <RecordPaymentModal
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                agreement={selectedAgreement}
                onRecord={handleRecordPayment}
            />
            <CreateAgreementModal
                isOpen={isAgreementModalOpen}
                onClose={() => setIsAgreementModalOpen(false)}
                booking={selectedBooking}
                onSubmit={handleCreateAgreement}
            />
            <TenantDetailModal
                isOpen={isTenantModalOpen}
                onClose={() => setIsTenantModalOpen(false)}
                tenant={selectedBooking}
            />
            <BookingApprovalModal
                isOpen={isBookingApprovalModalOpen}
                onClose={() => setIsBookingApprovalModalOpen(false)}
                booking={selectedBooking}
                onApprove={handleAcceptBooking}
                onReject={handleRejectBooking}
            />
            <EditProfileModal
                isOpen={isEditProfileModalOpen}
                onClose={() => setIsEditProfileModalOpen(false)}
                user={user}
                onUpdate={handleUpdateProfile}
            />
        </div>
    );
};

export default OwnerDashboard;
