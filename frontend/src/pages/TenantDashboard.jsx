import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import * as tenantService from '../services/tenantService';
import * as maintenanceService from '../services/maintenanceService';
import toast, { Toaster } from 'react-hot-toast';
import {
    FiHome, FiUsers, FiDollarSign, FiCalendar, FiClock,
    FiCheckCircle, FiAlertCircle, FiTrendingUp, FiPlus,
    FiFileText, FiBell, FiSettings, FiExternalLink, FiSearch,
    FiFilter, FiMapPin, FiInfo, FiHeart, FiLogOut,
    FiTool
} from 'react-icons/fi';
import { format } from 'date-fns';
import StatCard from '../components/admin/StatCard';
import Modal from '../components/common/Modal';
import Badge from '../components/common/Badge';
import { SkeletonCard, SkeletonChart, SkeletonTable } from '../components/common/Skeleton';
import TenantPropertyCard from '../components/common/TenantPropertyCard';
import DurationSelectionModal from '../components/common/DurationSelectionModal';
import AgreementReviewModal from '../components/common/AgreementReviewModal';
import PaymentModal from '../components/common/PaymentModal';
import MaintenanceModal from '../components/common/MaintenanceModal';

const TenantDashboard = () => {
    const { user, logout } = useAuth();
    const [activeTab, setActiveTab] = useState('search');
    const [properties, setProperties] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [agreements, setAgreements] = useState([]);
    const [payments, setPayments] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [maintenanceRequests, setMaintenanceRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');

    // Modal states
    const [isDurationModalOpen, setIsDurationModalOpen] = useState(false);
    const [isAgreementModalOpen, setIsAgreementModalOpen] = useState(false);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [selectedAgreement, setSelectedAgreement] = useState(null);
    const [selectedPayment, setSelectedPayment] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [propsData, bookingsData, agreementsData, paymentsData, notifsData, maintData] = await Promise.all([
                tenantService.searchProperties(),
                tenantService.getMyBookings(),
                tenantService.getMyAgreements(),
                tenantService.getMyPayments(),
                tenantService.getNotifications(),
                maintenanceService.getMaintenanceRequests()
            ]);

            setProperties(propsData.properties || []);
            setBookings(bookingsData.bookings || []);
            setAgreements(agreementsData.agreements || []);
            setPayments(paymentsData.payments || []);
            setNotifications(notifsData.notifications || []);
            setMaintenanceRequests(maintData.requests || []);
        } catch (err) {
            console.error('Error fetching tenant data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDurationSubmit = async (durationData) => {
        try {
            await tenantService.updateBookingDuration(selectedBooking.request_id || selectedBooking.booking_id, {
                rental_years: durationData.years,
                rental_months: durationData.months
            });
            toast.success('Duration request sent to owner!');
            setIsDurationModalOpen(false);
            fetchData();
        } catch (err) {
            toast.error(err.message || 'Failed to update duration');
        }
    };

    const handleAgreementRespond = async (status) => {
        try {
            await tenantService.respondToAgreement(selectedAgreement.agreement_id, status);
            if (status === 'approved') {
                toast.success('Agreement approved! Please pay the deposit.');
                setSelectedPayment({
                    type: 'deposit',
                    amount: selectedAgreement.deposit_amount || 5000,
                    owner_name: selectedAgreement.owner_name,
                    bank_name: selectedAgreement.bank_name,
                    bank_account_number: selectedAgreement.bank_account_number,
                    booking_id: selectedAgreement.booking_id
                });
                setIsAgreementModalOpen(false);
                setIsPaymentModalOpen(true);
            } else {
                toast.error('Agreement declined.');
                setIsAgreementModalOpen(false);
            }
            fetchData();
        } catch (err) {
            toast.error(err.message || 'Failed to respond to agreement');
        }
    };

    const handlePaymentConfirm = async () => {
        try {
            if (selectedPayment.type === 'deposit') {
                await tenantService.payDeposit(selectedPayment.booking_id, { amount: selectedPayment.amount });
                toast.success('Deposit payment recorded! Waiting for owner confirmation.');
            } else {
                await tenantService.payMonthlyRent(selectedPayment.payment_id, { amount: selectedPayment.amount });
                toast.success('Rent paid successfully!');
            }
            setIsPaymentModalOpen(false);
            fetchData();
        } catch (err) {
            toast.error(err.message || 'Failed to record payment');
        }
    };

    const handleMaintenanceSubmit = async (maintData) => {
        try {
            await maintenanceService.submitMaintenanceRequest(maintData);
            toast.success('Maintenance request submitted!');
            fetchData();
        } catch (err) {
            toast.error(err.message || 'Failed to submit request');
        }
    };

    const tabs = [
        { id: 'search', label: 'Explore Homes', icon: FiSearch },
        { id: 'bookings', label: 'My Bookings', icon: FiCalendar },
        { id: 'payments', label: 'Payments', icon: FiDollarSign },
        { id: 'agreements', label: 'Agreements', icon: FiFileText },
        { id: 'maintenance', label: 'Maintenance', icon: FiTool },
        { id: 'notifications', label: 'Notifications', icon: FiBell },
        { id: 'profile', label: 'My Profile', icon: FiUsers },
    ];

    const filteredProperties = properties.filter(p => {
        const matchesSearch = p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.city?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === 'all' || p.property_type === filterType;
        return matchesSearch && matchesType;
    });

    if (loading && properties.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 mx-auto mb-4"></div>
                    <p className="text-gray-500 font-medium">Loading your dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            <Toaster position="top-right" />

            {/* Header */}
            <header className="bg-white border-b sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center text-white text-xl font-black">G</div>
                        <h1 className="text-xl font-bold text-gray-900 hidden md:block">GharBhada <span className="text-primary-600">Tenant</span></h1>
                    </div>

                    <div className="flex items-center gap-6">
                        <button className="relative text-gray-400 hover:text-primary-600 transition-all">
                            <FiBell size={22} />
                            {notifications.length > 0 && (
                                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center border-2 border-white">
                                    {notifications.length}
                                </span>
                            )}
                        </button>
                        <div className="h-8 w-px bg-gray-100"></div>
                        <div className="flex items-center gap-3">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-bold text-gray-900">{user?.full_name}</p>
                                <p className="text-xs text-gray-500 capitalize">{user?.role} Account</p>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-primary-50 border-2 border-primary-200 flex items-center justify-center text-primary-700 font-bold">
                                {user?.full_name?.charAt(0)}
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Mobile Nav Placeholder or Secondary Nav */}
            <div className="bg-white border-b sticky top-[73px] z-20 overflow-x-auto no-scrollbar">
                <div className="max-w-7xl mx-auto px-6">
                    <nav className="flex space-x-8">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`
                                        flex items-center gap-2 py-4 px-1 border-b-2 font-bold text-sm transition-all whitespace-nowrap
                                        ${activeTab === tab.id
                                            ? 'border-primary-500 text-primary-600'
                                            : 'border-transparent text-gray-400 hover:text-gray-600'
                                        }
                                    `}
                                >
                                    <Icon size={18} />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </nav>
                </div>
            </div>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-6 py-8">
                {/* Account Status Alert */}
                {user?.is_verified === 0 && (
                    <div className="mb-8 p-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-center gap-4 text-blue-800 animate-pulse">
                        <FiInfo className="flex-shrink-0" />
                        <p className="text-sm font-medium">
                            Your account is currently <span className="font-bold underline">Pending Verification</span>. Admin will verify your ID proof within 24 hours. You can still browse properties!
                        </p>
                    </div>
                )}

                {/* Tab Content */}
                {activeTab === 'search' && (
                    <div className="space-y-8">
                        {/* Search & Stats Header */}
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                            <div>
                                <h2 className="text-2xl font-black text-gray-900 mb-1">Find Your Perfect Home</h2>
                                <p className="text-gray-500 text-sm">Showing {filteredProperties.length} active listings in Nepal</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="relative flex-1 sm:min-w-[300px]">
                                    <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search by city, title, or area..."
                                        className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all shadow-sm"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <button className="p-3 bg-white border border-gray-200 rounded-2xl text-gray-500 hover:text-primary-600 transition-all shadow-sm">
                                    <FiFilter size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Filter Pilss */}
                        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-2">
                            {['all', 'apartment', 'house', 'room', '1BHK', '2BHK'].map(type => (
                                <button
                                    key={type}
                                    onClick={() => setFilterType(type)}
                                    className={`
                                        px-6 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all border
                                        ${filterType === type
                                            ? 'bg-primary-600 border-primary-600 text-white shadow-lg shadow-primary-200'
                                            : 'bg-white border-gray-200 text-gray-500 hover:border-primary-400'
                                        }
                                    `}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>

                        {/* Properties Grid */}
                        {filteredProperties.length === 0 ? (
                            <div className="py-20 text-center">
                                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                                    <FiHome size={32} />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">No Properties Found</h3>
                                <p className="text-gray-500">Try adjusting your search terms or filters.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {filteredProperties.map(property => (
                                    <TenantPropertyCard
                                        key={property.property_id}
                                        property={property}
                                        onClick={() => navigate(`/properties/${property.property_id}`)}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'bookings' && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between mb-2">
                            <h2 className="text-2xl font-black text-gray-900">My Booking Requests</h2>
                            <Badge variant="primary">{bookings.length} Requests</Badge>
                        </div>

                        {bookings.length === 0 ? (
                            <div className="bg-white rounded-3xl border border-dashed border-gray-200 p-16 text-center">
                                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <FiCalendar size={24} />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900">No Bookings Yet</h3>
                                <p className="text-gray-500 text-sm mb-6">Find a property you like and click "Book Now" to start your journey.</p>
                                <button onClick={() => setActiveTab('search')} className="bg-primary-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-primary-700 transition-all">Browse Properties</button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {bookings.map(booking => (
                                    <div key={booking.request_id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-md transition-all">
                                        <div className="flex items-center gap-6">
                                            <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gray-100 flex-shrink-0">
                                                <img src={booking.property_image} alt="" className="w-full h-full object-cover" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-900 text-lg">{booking.property_title}</h4>
                                                <p className="text-sm text-gray-500 mb-2">{booking.property_address}</p>
                                                <div className="flex items-center gap-4">
                                                    <span className="text-xs text-gray-400 flex items-center gap-1"><FiCalendar /> {format(new Date(booking.requested_at), 'MMM d, yyyy')}</span>
                                                    <Badge variant={
                                                        booking.status === 'pending' ? 'warning' :
                                                            booking.status === 'accepted' ? 'primary' :
                                                                booking.status === 'duration_pending' ? 'warning' :
                                                                    booking.status === 'agreement_pending' ? 'primary' :
                                                                        booking.status === 'payment_pending' ? 'success' :
                                                                            booking.status === 'active' ? 'success' : 'danger'
                                                    }>
                                                        {booking.status === 'pending' ? 'Pending Approval' :
                                                            booking.status === 'accepted' ? 'Initial Approval' :
                                                                booking.status === 'duration_pending' ? 'Waiting for Owner Duration Review' :
                                                                    booking.status === 'agreement_pending' ? 'Agreement Ready for Review' :
                                                                        booking.status === 'payment_pending' ? 'Final Payment Needed' :
                                                                            booking.status.toUpperCase()}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <button className="flex-1 md:flex-none px-6 py-2 rounded-xl text-sm font-bold border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all">Details</button>

                                            {booking.status === 'accepted' && (
                                                <button
                                                    onClick={() => {
                                                        setSelectedBooking(booking);
                                                        setIsDurationModalOpen(true);
                                                    }}
                                                    className="flex-1 md:flex-none px-6 py-2 rounded-xl text-sm font-bold bg-primary-600 text-white hover:bg-primary-700 transition-all shadow-lg shadow-primary-100"
                                                >
                                                    Select Duration
                                                </button>
                                            )}

                                            {booking.status === 'agreement_pending' && (
                                                <button
                                                    onClick={async () => {
                                                        const agm = agreements.find(a => a.booking_id === booking.booking_id || a.booking_id === booking.request_id);
                                                        if (agm) {
                                                            setSelectedAgreement(agm);
                                                            setIsAgreementModalOpen(true);
                                                        } else {
                                                            // Fallback fetch if not in state
                                                            toast.loading('Loading agreement...');
                                                            const data = await tenantService.getMyAgreements();
                                                            const found = data.agreements.find(a => a.booking_id === booking.booking_id || a.booking_id === booking.request_id);
                                                            toast.dismiss();
                                                            if (found) {
                                                                setSelectedAgreement(found);
                                                                setIsAgreementModalOpen(true);
                                                            } else {
                                                                toast.error('Agreement not found yet');
                                                            }
                                                        }
                                                    }}
                                                    className="flex-1 md:flex-none px-6 py-2 rounded-xl text-sm font-bold bg-primary-600 text-white hover:bg-primary-700 transition-all shadow-lg shadow-primary-100"
                                                >
                                                    Review Agreement
                                                </button>
                                            )}

                                            {booking.status === 'payment_pending' && (
                                                <button
                                                    onClick={() => {
                                                        const agm = agreements.find(a => a.booking_id === booking.booking_id || a.booking_id === booking.request_id);
                                                        setSelectedPayment({
                                                            type: 'deposit',
                                                            amount: agm?.security_deposit || 5000,
                                                            owner_name: agm?.owner_name || 'Owner',
                                                            booking_id: booking.booking_id || booking.request_id
                                                        });
                                                        setIsPaymentModalOpen(true);
                                                    }}
                                                    className="flex-1 md:flex-none px-6 py-2 rounded-xl text-sm font-bold bg-green-600 text-white hover:bg-green-700 transition-all shadow-lg shadow-green-100"
                                                >
                                                    Pay Deposit (Rs. 5000)
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Payments Tab */}
                {activeTab === 'payments' && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h2 className="text-2xl font-black text-gray-900">Payment History</h2>
                                <p className="text-sm text-gray-500">Track your deposits and monthly rent payments</p>
                            </div>
                        </div>

                        {payments.length === 0 ? (
                            <div className="bg-white rounded-3xl border border-gray-100 p-20 text-center">
                                <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <FiDollarSign size={24} />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900">No Payments Yet</h3>
                                <p className="text-gray-500 text-sm">Once you complete a booking, your payment history will appear here.</p>
                            </div>
                        ) : (
                            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-gray-50 border-b border-gray-100">
                                            <tr>
                                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Property</th>
                                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Type</th>
                                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Date</th>
                                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Amount</th>
                                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {payments.map((p, idx) => (
                                                <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <p className="font-bold text-gray-900 text-sm">{p.property_title}</p>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <Badge variant={p.type === 'deposit' ? 'primary' : 'success'}>{p.type?.toUpperCase()}</Badge>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-500">
                                                        {format(new Date(p.created_at), 'MMM d, yyyy')}
                                                    </td>
                                                    <td className="px-6 py-4 font-black text-primary-600">
                                                        Rs. {p.amount?.toLocaleString()}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <Badge variant={p.status === 'paid' ? 'success' : 'warning'}>{p.status?.toUpperCase()}</Badge>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Agreements Tab */}
                {activeTab === 'agreements' && (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-black text-gray-900 mb-2">My Rental Agreements</h2>

                        {agreements.length === 0 ? (
                            <div className="bg-white rounded-3xl border border-gray-100 p-20 text-center">
                                <FiFileText size={48} className="mx-auto text-gray-200 mb-4" />
                                <h3 className="text-lg font-bold text-gray-900">No Active Agreements</h3>
                                <p className="text-gray-500">Agreements will be generated once owner approves your rental duration.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {agreements.map(agm => (
                                    <div key={agm.agreement_id} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:border-primary-500 transition-all flex flex-col justify-between group">
                                        <div>
                                            <div className="flex justify-between items-start mb-6">
                                                <div className="w-14 h-14 bg-primary-50 text-primary-600 rounded-2xl flex items-center justify-center text-2xl group-hover:bg-primary-600 group-hover:text-white transition-all">
                                                    <FiFileText />
                                                </div>
                                                <Badge variant={agm.status === 'active' ? 'success' : 'warning'}>{agm.status?.toUpperCase()}</Badge>
                                            </div>
                                            <h3 className="text-xl font-black text-gray-900 mb-2">{agm.property_title}</h3>
                                            <div className="space-y-2 mb-8">
                                                <p className="text-sm text-gray-500 flex justify-between">Monthly Rent <span className="font-bold text-gray-900 underline underline-offset-4 decoration-primary-200">Rs. {agm.monthly_rent?.toLocaleString()}</span></p>
                                                <p className="text-sm text-gray-500 flex justify-between">Duration <span className="font-bold text-gray-900">{agm.lease_duration_years} Years</span></p>
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-3">
                                            <button
                                                onClick={() => {
                                                    setSelectedAgreement(agm);
                                                    setIsAgreementModalOpen(true);
                                                }}
                                                className="w-full py-4 rounded-2xl bg-gray-900 text-white font-black hover:bg-black transition-all flex items-center justify-center gap-2"
                                            >
                                                Review Agreement <FiExternalLink />
                                            </button>
                                            <button
                                                onClick={() => handleRequestRenewal(agm.agreement_id)}
                                                className="w-full py-3 rounded-2xl bg-primary-50 text-primary-600 font-bold hover:bg-primary-100 transition-all text-sm"
                                            >
                                                Request Renewal
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Maintenance Tab */}
                {activeTab === 'maintenance' && (
                    <div className="space-y-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h2 className="text-2xl font-black text-gray-900">Maintenance & Repairs</h2>
                                <p className="text-sm text-gray-500">Report issues and track repair status</p>
                            </div>
                            <button
                                onClick={() => setIsMaintenanceModalOpen(true)}
                                className="bg-primary-600 text-white px-6 py-3 rounded-2xl font-black shadow-lg shadow-primary-200 hover:bg-primary-700 transition-all flex items-center justify-center gap-2"
                            >
                                <FiTool /> New Request
                            </button>
                        </div>

                        {maintenanceRequests.length === 0 ? (
                            <div className="bg-white rounded-3xl border border-gray-100 p-20 text-center">
                                <FiTool size={48} className="mx-auto text-gray-200 mb-4" />
                                <h3 className="text-lg font-bold text-gray-900">No Maintenance Requests</h3>
                                <p className="text-gray-500">If you have any issues with your rental, you can report them here.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-4">
                                {maintenanceRequests.map(req => (
                                    <div key={req.request_id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-primary-500 transition-all">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-bold text-gray-900">{req.title}</h3>
                                                <Badge variant={
                                                    req.priority === 'high' ? 'danger' :
                                                        req.priority === 'medium' ? 'warning' : 'info'
                                                } size="sm">{req.priority?.toUpperCase()}</Badge>
                                            </div>
                                            <p className="text-sm text-gray-500 line-clamp-1 mb-2">{req.description}</p>
                                            <div className="flex items-center gap-4 text-xs text-gray-400">
                                                <span>{req.property_title}</span>
                                                <span>•</span>
                                                <span>{format(new Date(req.created_at), 'MMM d, yyyy')}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 w-full md:w-auto">
                                            <Badge variant={
                                                req.status === 'completed' ? 'success' :
                                                    req.status === 'in_progress' ? 'primary' : 'warning'
                                            }>
                                                {req.status?.replace('_', ' ')?.toUpperCase()}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Integration Modals */}
                <DurationSelectionModal
                    isOpen={isDurationModalOpen}
                    onClose={() => setIsDurationModalOpen(false)}
                    onSubmit={handleDurationSubmit}
                />

                <AgreementReviewModal
                    isOpen={isAgreementModalOpen}
                    onClose={() => setIsAgreementModalOpen(false)}
                    agreement={selectedAgreement}
                    onApprove={() => handleAgreementRespond('approved')}
                    onDecline={() => handleAgreementRespond('rejected')}
                />

                <PaymentModal
                    isOpen={isPaymentModalOpen}
                    onClose={() => setIsPaymentModalOpen(false)}
                    payment={selectedPayment}
                    onConfirm={handlePaymentConfirm}
                />

                {activeTab === 'notifications' && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-2xl font-black text-gray-900">Notifications</h2>
                            <button className="text-primary-600 text-sm font-bold hover:underline">Mark all as read</button>
                        </div>

                        {notifications.length === 0 ? (
                            <div className="bg-white rounded-3xl border border-gray-100 p-20 text-center">
                                <div className="w-16 h-16 bg-gray-50 text-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <FiBell size={24} />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900">All caught up!</h3>
                                <p className="text-gray-500 text-sm">You have no new notifications.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {notifications.map((notif, idx) => (
                                    <div key={idx} className={`p-6 rounded-3xl border flex gap-6 transition-all cursor-pointer ${notif.is_read ? 'bg-white border-gray-100' : 'bg-primary-50/30 border-primary-100 hover:bg-primary-50'}`}>
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl flex-shrink-0 ${notif.type === 'booking' ? 'bg-blue-100 text-blue-600' :
                                            notif.type === 'payment' ? 'bg-green-100 text-green-600' :
                                                notif.type === 'agreement' ? 'bg-purple-100 text-purple-600' :
                                                    'bg-yellow-100 text-yellow-600'
                                            }`}>
                                            {notif.type === 'booking' ? <FiCalendar /> :
                                                notif.type === 'payment' ? <FiDollarSign /> :
                                                    notif.type === 'agreement' ? <FiFileText /> :
                                                        <FiInfo />}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start mb-1">
                                                <h4 className="font-bold text-gray-900">{notif.title}</h4>
                                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{notif.created_at ? format(new Date(notif.created_at), 'MMM d, h:mm a') : 'Now'}</span>
                                            </div>
                                            <p className="text-sm text-gray-600 leading-relaxed mb-3">{notif.message}</p>
                                            {!notif.is_read && <Badge variant="primary" size="sm">NEW</Badge>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'profile' && (
                    <div className="max-w-4xl mx-auto space-y-8">
                        <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
                            <div className="flex flex-col md:flex-row items-center gap-8">
                                <div className="w-32 h-32 rounded-3xl bg-primary-600 border-4 border-white shadow-xl flex items-center justify-center text-white text-5xl font-black">
                                    {user?.full_name?.charAt(0)}
                                </div>
                                <div className="text-center md:text-left flex-1">
                                    <h2 className="text-3xl font-black text-gray-900 mb-1">{user?.full_name}</h2>
                                    <p className="text-gray-500 font-medium mb-4">{user?.email}</p>
                                    <div className="flex flex-wrap justify-center md:justify-start gap-2">
                                        <Badge variant={user?.role === 'tenant' ? 'primary' : 'success'}>{user?.role.toUpperCase()}</Badge>
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
                                        <span className="font-bold text-gray-900">{user?.created_at ? format(new Date(user.created_at), 'MMMM yyyy') : 'Recently'}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm flex flex-col justify-center items-center text-center">
                                <div className="w-12 h-12 bg-gray-50 text-gray-400 rounded-2xl flex items-center justify-center mb-4">
                                    <FiSettings size={24} />
                                </div>
                                <h3 className="font-bold text-gray-900 mb-2">Account Settings</h3>
                                <p className="text-gray-500 text-sm mb-6">Update your address, change password or verify documents.</p>
                                <button className="w-full py-3 rounded-2xl bg-gray-900 text-white font-bold hover:bg-black transition-all">Edit Profile</button>
                            </div>
                        </div>
                    </div>
                )}
                <MaintenanceModal
                    isOpen={isMaintenanceModalOpen}
                    onClose={() => setIsMaintenanceModalOpen(false)}
                    onSubmit={handleMaintenanceSubmit}
                    propertyId={agreements.find(a => a.status === 'active')?.property_id}
                />
            </main>
        </div>
    );
};

export default TenantDashboard;
