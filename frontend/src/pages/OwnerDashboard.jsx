import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import * as ownerService from '../services/ownerService';
import * as maintenanceService from '../services/maintenanceService';
import toast, { Toaster } from 'react-hot-toast';
import {
    FiHome, FiUsers, FiDollarSign, FiCalendar, FiClock,
    FiCheckCircle, FiAlertCircle, FiTrendingUp, FiPlus,
    FiFileText, FiBell, FiSettings, FiExternalLink, FiSearch,
    FiTrash2, FiCheck, FiX, FiTool
} from 'react-icons/fi';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Legend, PieChart, Pie, Cell
} from 'recharts';
import { format, differenceInYears } from 'date-fns';
import StatCard from '../components/admin/StatCard';
import Modal from '../components/common/Modal';
import Badge from '../components/common/Badge';
import { SkeletonCard, SkeletonChart, SkeletonTable } from '../components/common/Skeleton';
import AddPropertyModal from '../components/admin/AddPropertyModal';
import RecordPaymentModal from '../components/admin/RecordPaymentModal';
import CreateAgreementModal from '../components/admin/CreateAgreementModal';

const IMG_BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5001';

const OwnerDashboard = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('overview');
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [properties, setProperties] = useState([]);
    const [bookingRequests, setBookingRequests] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [agreements, setAgreements] = useState([]);
    const [payments, setPayments] = useState([]);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [isAgreementModalOpen, setIsAgreementModalOpen] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [selectedAgreement, setSelectedAgreement] = useState(null);
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingProperty, setEditingProperty] = useState(null);
    const [maintenanceRequests, setMaintenanceRequests] = useState([]);

    // Check if owner is trusted (registered > 1 year)
    const isTrusted = user?.created_at ? differenceInYears(new Date(), new Date(user.created_at)) >= 1 : false;

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const results = await Promise.allSettled([
                ownerService.getDashboardStats(),
                ownerService.getOwnerProperties(),
                ownerService.getBookingRequests('all'),
                ownerService.getNotifications(true),
                ownerService.getAgreements('active'),
                ownerService.getPaymentHistory(),
                maintenanceService.getMaintenanceRequests()
            ]);

            const statsRes = results[0].status === 'fulfilled' ? results[0].value : null;
            const propsRes = results[1].status === 'fulfilled' ? results[1].value : null;
            const requestsRes = results[2].status === 'fulfilled' ? results[2].value : null;
            const notifsRes = results[3].status === 'fulfilled' ? results[3].value : null;
            const agreementsRes = results[4].status === 'fulfilled' ? results[4].value : null;
            const paymentsRes = results[5].status === 'fulfilled' ? results[5].value : null;

            if (statsRes) setStats(statsRes.stats);
            if (propsRes) setProperties(propsRes.properties || []);
            if (requestsRes) setBookingRequests(requestsRes.requests || []);
            if (notifsRes) setNotifications(notifsRes.notifications || []);
            if (agreementsRes) setAgreements(agreementsRes.agreements || []);
            if (paymentsRes) setPayments(paymentsRes.payments || []);
            if (results[6]?.status === 'fulfilled') setMaintenanceRequests(results[6].value.requests || []);

            // Log individual failures for debugging
            results.forEach((res, i) => {
                if (res.status === 'rejected') console.warn(`Fetch index ${i} failed:`, res.reason);
            });

            if (!statsRes) {
                setStats({
                    total_properties: propsRes?.properties?.length || 0,
                    active_rentals: 0,
                    pending_requests: requestsRes?.requests?.length || 0,
                    monthly_earnings: 0
                });
            }
        } catch (err) {
            console.error('Error fetching owner data:', err);
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
            throw err;
        }
    };

    const handleDeleteProperty = async (propertyId) => {
        if (!window.confirm('Are you sure you want to delete this property? This action cannot be undone.')) return;
        try {
            await ownerService.deleteProperty(propertyId);
            toast.success('Property deleted successfully!');
            fetchData();
        } catch (err) {
            toast.error(err.message || 'Failed to delete property');
        }
    };

    const propertyMatchesSearch = (p) => {
        const search = searchTerm.toLowerCase();
        return p.title?.toLowerCase().includes(search) ||
            p.address?.toLowerCase().includes(search) ||
            p.city?.toLowerCase().includes(search);
    };

    const handleAcceptBooking = async (requestId) => {
        try {
            await ownerService.acceptBookingRequest(requestId);
            toast.success('Initial request accepted! Waiting for tenant to select duration.');
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
            if (approved) {
                toast.success('Duration approved! Please proceed to create agreement.');
            } else {
                toast.error('Duration request rejected');
            }
            fetchData();
        } catch (err) {
            toast.error(err.message || 'Failed to process duration');
        }
    };

    const handleUpdateMaintenance = async (requestId, status) => {
        const notes = window.prompt('Enter updates/notes:');
        try {
            await maintenanceService.updateMaintenanceStatus(requestId, { status, notes });
            toast.success('Maintenance status updated!');
            fetchData();
        } catch (err) {
            toast.error(err.message || 'Failed to update status');
        }
    };

    const handleCreateAgreement = async (agreementData) => {
        try {
            await ownerService.createAgreement(selectedBooking.booking_id || selectedBooking.request_id, agreementData);
            toast.success('Agreement sent to tenant successfully!');
            setIsAgreementModalOpen(false);
            fetchData();
        } catch (err) {
            toast.error(err.message || 'Failed to create agreement');
        }
    };

    const tabs = [
        { id: 'overview', label: 'Overview', icon: FiTrendingUp },
        { id: 'properties', label: 'My Properties', icon: FiHome },
        { id: 'bookings', label: 'Booking Requests', icon: FiUsers },
        { id: 'rentals', label: 'Active Rentals', icon: FiCalendar },
        { id: 'payments', label: 'Payments', icon: FiDollarSign },
        { id: 'agreements', label: 'Agreements', icon: FiFileText },
        { id: 'maintenance', label: 'Maintenance', icon: FiTool },
    ];

    // Mock data for charts
    const earningsData = [
        { name: 'Jan', amount: 45000 },
        { name: 'Feb', amount: 45000 },
        { name: 'Mar', amount: 48000 },
        { name: 'Apr', amount: 48000 },
        { name: 'May', amount: 52000 },
        { name: 'Jun', amount: 55000 },
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
        <div className="min-h-screen bg-gray-50">
            <Toaster position="top-right" />

            {/* Top Navigation / Header */}
            <div className="bg-white border-b sticky top-0 z-20">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <h1 className="text-2xl font-bold text-gray-900">Owner Panel</h1>
                        <Badge variant={isTrusted ? 'success' : 'primary'}>
                            {isTrusted ? 'Trusted Owner' : 'Regular Owner'}
                        </Badge>
                    </div>
                    <div className="flex items-center gap-6">
                        <button className="relative text-gray-500 hover:text-primary-500 transition-colors">
                            <FiBell className="w-6 h-6" />
                            {notifications.length > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">
                                    {notifications.length}
                                </span>
                            )}
                        </button>
                        <div className="h-8 w-px bg-gray-200"></div>
                        <div className="flex items-center gap-3">
                            <div className="text-right">
                                <p className="text-sm font-semibold text-gray-900">{user?.full_name}</p>
                                <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold border-2 border-primary-500">
                                {user?.full_name?.charAt(0)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sub Header / Tabs */}
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
                                        flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-all
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

            {/* Main Content Area */}
            <main className="max-w-7xl mx-auto px-6 py-8">
                {activeTab === 'overview' && (
                    <div className="space-y-8">
                        {/* Summary Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <StatCard
                                title="Properties Listed"
                                value={stats?.total_properties || 0}
                                icon={FiHome}
                                color="blue"
                                subtitle="Total properties owned"
                            />
                            <StatCard
                                title="Active Rentals"
                                value={stats?.active_rentals || 0}
                                icon={FiCalendar}
                                color="green"
                                subtitle="Currently occupied"
                            />
                            <StatCard
                                title="Pending Requests"
                                value={stats?.pending_requests || 0}
                                icon={FiUsers}
                                color="orange"
                                subtitle="New booking interests"
                            />
                            <StatCard
                                title="Monthly Earnings"
                                value={`Rs. ${(stats?.monthly_earnings || 0).toLocaleString()}`}
                                icon={FiDollarSign}
                                color="purple"
                                subtitle="Earned this month"
                            />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Earnings Chart */}
                            <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-lg font-bold text-gray-900">Earnings Summary</h3>
                                    <select className="text-sm border-none bg-gray-50 rounded-lg px-3 py-1 text-gray-600 focus:ring-0">
                                        <option>Last 6 Months</option>
                                        <option>Last Year</option>
                                    </select>
                                </div>
                                <div className="h-[300px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={earningsData}>
                                            <defs>
                                                <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#2C5EBA" stopOpacity={0.1} />
                                                    <stop offset="95%" stopColor="#2C5EBA" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} dy={10} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} tickFormatter={(value) => `Rs.${value / 1000}k`} />
                                            <Tooltip
                                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                                formatter={(value) => [`Rs. ${value.toLocaleString()}`, 'Earnings']}
                                            />
                                            <Area type="monotone" dataKey="amount" stroke="#2C5EBA" strokeWidth={3} fillOpacity={1} fill="url(#colorEarnings)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Recent Notifications */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-lg font-bold text-gray-900">Notifications</h3>
                                    <button className="text-primary-600 text-sm font-medium hover:underline">View All</button>
                                </div>
                                <div className="space-y-4">
                                    {notifications.length === 0 ? (
                                        <div className="text-center py-8">
                                            <FiBell className="w-12 h-12 text-gray-200 mx-auto mb-2" />
                                            <p className="text-gray-400 text-sm">No new notifications</p>
                                        </div>
                                    ) : (
                                        notifications.slice(0, 5).map((notif, idx) => (
                                            <div key={idx} className="flex gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer">
                                                <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center ${notif.type === 'booking' ? 'bg-blue-100 text-blue-600' :
                                                    notif.type === 'payment' ? 'bg-green-100 text-green-600' :
                                                        'bg-purple-100 text-purple-600'
                                                    }`}>
                                                    {notif.type === 'booking' ? <FiUsers /> :
                                                        notif.type === 'payment' ? <FiDollarSign /> :
                                                            <FiFileText />}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-semibold text-gray-900 truncate">{notif.title}</p>
                                                    <p className="text-xs text-gray-500 line-clamp-1">{notif.message}</p>
                                                    <p className="text-[10px] text-gray-400 mt-1">{format(new Date(notif.created_at), 'MMM d, h:mm a')}</p>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Recent Properties Section */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">My Recent Properties</h3>
                                    <p className="text-sm text-gray-500">Quick view of your latest listings</p>
                                </div>
                                <button
                                    onClick={() => setActiveTab('properties')}
                                    className="text-primary-600 font-bold text-sm hover:underline"
                                >
                                    View All Properties
                                </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                                {properties.length === 0 ? (
                                    <div className="col-span-full py-12 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                        <FiHome className="w-12 h-12 text-gray-200 mx-auto mb-2" />
                                        <p className="text-gray-400 text-sm">No properties listed yet</p>
                                        <button
                                            onClick={() => setIsAddModalOpen(true)}
                                            className="mt-4 text-primary-600 font-bold text-sm"
                                        >
                                            + List Your First Property
                                        </button>
                                    </div>
                                ) : (
                                    properties.slice(0, 5).map(p => (
                                        <div key={p.property_id} className="group cursor-pointer" onClick={() => setActiveTab('properties')}>
                                            <div className="aspect-[4/3] rounded-2xl overflow-hidden mb-3 relative">
                                                <img
                                                    src={p.images?.[0] ? (p.images[0].startsWith('http') ? p.images[0] : `${IMG_BASE_URL}/${p.images[0].replace(/\\/g, '/')}`) : 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                    alt={p.title}
                                                />
                                                <div className="absolute top-2 left-2">
                                                    <Badge variant={
                                                        p.admin_approval_status === 'approved' ? 'success' :
                                                            p.admin_approval_status === 'pending' ? 'warning' : 'danger'
                                                    } size="sm">
                                                        {p.admin_approval_status === 'approved' ? 'Live' : p.admin_approval_status}
                                                    </Badge>
                                                </div>
                                            </div>
                                            <h4 className="font-bold text-sm text-gray-900 line-clamp-1 group-hover:text-primary-600 transition-colors">{p.title}</h4>
                                            <p className="text-xs text-gray-500">{p.city}</p>
                                            <p className="text-xs font-black text-primary-600 mt-1">Rs. {p.price_per_month?.toLocaleString()}</p>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <button
                                onClick={() => setActiveTab('properties')}
                                className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 hover:border-primary-500 transition-all group"
                            >
                                <div className="w-12 h-12 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center text-xl group-hover:bg-primary-600 group-hover:text-white transition-all">
                                    <FiPlus />
                                </div>
                                <div className="text-left">
                                    <p className="text-sm font-bold text-gray-900">List Property</p>
                                    <p className="text-xs text-gray-500">Add a new rental</p>
                                </div>
                            </button>
                            {/* More quick action buttons can be added here */}
                        </div>
                    </div>
                )}

                {/* Properties Tab */}
                {activeTab === 'properties' && (
                    <div className="space-y-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">My Properties</h2>
                                <p className="text-sm text-gray-500">Manage and track your property listings</p>
                            </div>
                            <button
                                onClick={() => setIsAddModalOpen(true)}
                                className="bg-primary-600 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 justify-center hover:bg-primary-700 transition-all shadow-primary"
                            >
                                <FiPlus /> List New Property
                            </button>
                        </div>

                        {/* Search and Filters */}
                        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4">
                            <div className="flex-1 relative">
                                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search by title or address..."
                                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-primary-500"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <select className="bg-gray-50 border-none rounded-xl px-4 py-2 text-sm text-gray-600 focus:ring-2 focus:ring-primary-500">
                                <option>All Types</option>
                                <option>Apartment</option>
                                <option>House</option>
                                <option>Room</option>
                            </select>
                            <select className="bg-gray-50 border-none rounded-xl px-4 py-2 text-sm text-gray-600 focus:ring-2 focus:ring-primary-500">
                                <option>All Status</option>
                                <option>Active</option>
                                <option>Pending</option>
                                <option>Occupied</option>
                            </select>
                        </div>

                        {/* Properties Grid */}
                        {properties.length === 0 ? (
                            <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-12 text-center">
                                <div className="max-w-xs mx-auto">
                                    <div className="w-16 h-16 bg-primary-50 text-primary-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                                        <FiHome />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-1">No Properties Yet</h3>
                                    <p className="text-gray-500 text-sm mb-6">Start your rental business by listing your first property on the platform.</p>
                                    <button onClick={() => setIsAddModalOpen(true)} className="bg-primary-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-primary-700 transition-all shadow-primary w-full">List Your First Property</button>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {properties.filter(p => propertyMatchesSearch(p)).map((property) => (
                                    <div key={property.property_id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-all group">
                                        {/* Property Image Placeholder */}
                                        <div className="h-48 bg-gray-100 relative overflow-hidden">
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-10" />
                                            <img
                                                src={property.images?.[0] ?
                                                    (property.images[0].startsWith('http') ? property.images[0] : `${IMG_BASE_URL}/${property.images[0].replace(/\\/g, '/')}`) :
                                                    'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'}
                                                alt={property.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                            <div className="absolute top-4 left-4 z-20">
                                                <Badge variant={
                                                    property.admin_approval_status === 'approved' ? 'success' :
                                                        property.admin_approval_status === 'pending' ? 'warning' : 'danger'
                                                }>
                                                    {property.admin_approval_status === 'approved' ? 'Active' : property.admin_approval_status}
                                                </Badge>
                                            </div>
                                            <div className="absolute bottom-4 left-4 z-20 text-white font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 cursor-pointer">
                                                <FiExternalLink /> View Details
                                            </div>
                                        </div>

                                        <div className="p-5">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <h3 className="font-bold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-1">{property.title}</h3>
                                                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                                        <FiHome className="flex-shrink-0" /> {property.property_type} • {property.city}
                                                    </p>
                                                </div>
                                                <p className="text-primary-600 font-bold whitespace-nowrap">Rs.{property.price_per_month?.toLocaleString()}</p>
                                            </div>

                                            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50">
                                                <div className="flex gap-4">
                                                    <div className="text-center">
                                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Bookings</p>
                                                        <p className="text-sm font-bold text-gray-700">0</p>
                                                    </div>
                                                    <div className="text-center">
                                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Status</p>
                                                        <p className={`text-sm font-bold ${property.is_available ? 'text-green-600' : 'text-red-500'}`}>
                                                            {property.is_available ? 'Vacant' : 'Occupied'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setEditingProperty(property);
                                                            setIsAddModalOpen(true);
                                                        }}
                                                        className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
                                                        title="Edit Property"
                                                    >
                                                        <FiSettings />
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDeleteProperty(property.property_id);
                                                        }}
                                                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                        title="Delete Property"
                                                    >
                                                        <FiTrash2 />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <AddPropertyModal
                            isOpen={isAddModalOpen}
                            onClose={() => {
                                setIsAddModalOpen(false);
                                setEditingProperty(null);
                            }}
                            onAdd={handleAddProperty}
                            property={editingProperty}
                        />
                    </div>
                )}

                {/* Booking Requests Tab */}
                {activeTab === 'bookings' && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Booking Requests</h2>
                                <p className="text-sm text-gray-500">Respond to tenant interests in your properties</p>
                            </div>
                        </div>

                        {bookingRequests.length === 0 ? (
                            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                                <div className="max-w-xs mx-auto text-gray-400">
                                    <FiUsers className="w-16 h-16 mx-auto mb-4" />
                                    <h3 className="text-lg font-bold text-gray-900 mb-1">All Caught Up!</h3>
                                    <p className="text-sm">You have no pending booking requests at the moment.</p>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-4">
                                {bookingRequests.map((request) => (
                                    <div key={request.request_id} className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col md:flex-row items-center justify-between gap-6 hover:shadow-md transition-all">
                                        <div className="flex items-center gap-6 w-full md:w-auto">
                                            <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-xl font-bold border-2 border-blue-500">
                                                {request.tenant_name?.charAt(0)}
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                                    {request.tenant_name}
                                                    <span className="text-xs font-normal text-gray-400">requested</span>
                                                    {request.property_title}
                                                </h3>
                                                <div className="flex flex-wrap gap-4 mt-2">
                                                    <p className="text-xs text-gray-500 flex items-center gap-1"><FiCalendar /> Duration: {request.lease_duration_years} Years</p>
                                                    <p className="text-xs text-gray-500 flex items-center gap-1"><FiClock /> {format(new Date(request.requested_at), 'MMM d, yyyy')}</p>
                                                </div>
                                                {request.tenant_message && (
                                                    <p className="text-sm text-gray-600 mt-2 italic bg-gray-50 p-2 rounded-lg border-l-4 border-primary-500">"{request.tenant_message}"</p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 w-full md:w-auto">
                                            {request.status === 'pending' && (
                                                <>
                                                    <button
                                                        onClick={() => handleAcceptBooking(request.request_id)}
                                                        className="flex-1 md:flex-none px-6 py-2 bg-green-500 text-white rounded-xl font-bold hover:bg-green-600 transition-all flex items-center justify-center gap-2"
                                                    >
                                                        <FiCheck /> Accept
                                                    </button>
                                                    <button
                                                        onClick={() => handleRejectBooking(request.request_id)}
                                                        className="flex-1 md:flex-none px-6 py-2 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-100 transition-all flex items-center justify-center gap-2"
                                                    >
                                                        <FiX /> Reject
                                                    </button>
                                                </>
                                            )}
                                            {request.status === 'duration_pending' && (
                                                <>
                                                    <button
                                                        onClick={() => handleApproveDuration(request.request_id, true)}
                                                        className="flex-1 md:flex-none px-6 py-2 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-all flex items-center justify-center gap-2"
                                                    >
                                                        <FiCheck /> Approve Duration
                                                    </button>
                                                    <button
                                                        onClick={() => handleApproveDuration(request.request_id, false)}
                                                        className="flex-1 md:flex-none px-6 py-2 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-100 transition-all flex items-center justify-center gap-2"
                                                    >
                                                        <FiX /> Decline
                                                    </button>
                                                </>
                                            )}
                                            {request.status === 'duration_approved' && (
                                                <button
                                                    onClick={() => {
                                                        setSelectedBooking(request);
                                                        setIsAgreementModalOpen(true);
                                                    }}
                                                    className="flex-1 md:flex-none px-6 py-2 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-all flex items-center justify-center gap-2"
                                                >
                                                    <FiFileText /> Create Agreement
                                                </button>
                                            )}
                                            {request.status === 'agreement_pending' && (
                                                <Badge variant="warning">Awaiting Tenant Signature</Badge>
                                            )}
                                            {request.status === 'payment_pending' && (
                                                <Badge variant="primary">Awaiting Deposit Payment</Badge>
                                            )}
                                            {request.status === 'accepted' && (
                                                <Badge variant="info">Waiting for Tenant Duration</Badge>
                                            )}
                                            {request.status === 'rejected' && (
                                                <Badge variant="danger">Rejected</Badge>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Active Rentals Tab */}
                {activeTab === 'rentals' && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Active Rentals</h2>
                                <p className="text-sm text-gray-500">Manage your current active property agreements</p>
                            </div>
                        </div>

                        {/* Replace with real data when available */}
                        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                            <div className="max-w-xs mx-auto text-gray-400">
                                <FiCalendar className="w-16 h-16 mx-auto mb-4" />
                                <h3 className="text-lg font-bold text-gray-900 mb-1">No Active Rentals</h3>
                                <p className="text-sm">Once you accept a booking and complete the agreement, it will appear here.</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Payments Tab */}
                {activeTab === 'payments' && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Payment Management</h2>
                                <p className="text-sm text-gray-500">Track monthly rent and utility payments</p>
                            </div>
                        </div>

                        {payments.length === 0 ? (
                            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400">
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
                                                        <p className="text-xs text-gray-500">{format(new Date(p.paid_at), 'MMM d, yyyy')}</p>
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
                )}

                {/* Agreements Tab */}
                {activeTab === 'agreements' && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Rental Agreements</h2>
                                <p className="text-sm text-gray-500">Digital contracts and legal documents</p>
                            </div>
                        </div>

                        {agreements.length === 0 ? (
                            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400">
                                <FiFileText className="w-16 h-16 mx-auto mb-4" />
                                <h3 className="text-lg font-bold text-gray-900 mb-1">No Active Agreements</h3>
                                <p className="text-sm">Active rental agreements will be listed here.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {agreements.map((agm) => (
                                    <div key={agm.agreement_id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:border-primary-500 transition-all flex flex-col justify-between">
                                        <div>
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="w-12 h-12 bg-primary-50 text-primary-600 rounded-xl flex items-center justify-center text-xl">
                                                    <FiFileText />
                                                </div>
                                                <Badge variant="success">Active</Badge>
                                            </div>
                                            <h3 className="font-bold text-gray-900 mb-1">{agm.property_title}</h3>
                                            <p className="text-sm text-gray-500 mb-4">Agreement with {agm.tenant_name}</p>

                                            <div className="space-y-2 border-t border-gray-50 pt-4">
                                                <div className="flex justify-between text-xs">
                                                    <span className="text-gray-400 uppercase font-bold tracking-wider">Monthly Rent</span>
                                                    <span className="font-bold text-gray-700">Rs. {agm.monthly_rent?.toLocaleString()}</span>
                                                </div>
                                                <div className="flex justify-between text-xs">
                                                    <span className="text-gray-400 uppercase font-bold tracking-wider">Lease Duration</span>
                                                    <span className="font-bold text-gray-700">{agm.lease_duration_years} Years</span>
                                                </div>
                                                <div className="flex justify-between text-xs">
                                                    <span className="text-gray-400 uppercase font-bold tracking-wider">Expires On</span>
                                                    <span className="font-bold text-gray-700">{format(new Date(agm.lease_end_date), 'MMM d, yyyy')}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-6 flex gap-2">
                                            <button
                                                onClick={() => {
                                                    setSelectedAgreement(agm);
                                                    setIsPaymentModalOpen(true);
                                                }}
                                                className="flex-1 bg-primary-600 text-white py-2 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary-700 transition-all text-sm"
                                            >
                                                <FiDollarSign /> Record Payment
                                            </button>
                                            <button className="px-4 py-2 bg-gray-50 text-gray-600 rounded-xl hover:bg-gray-100 transition-all">
                                                <FiExternalLink />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Integration Modals */}
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

                {/* More tabs will be implemented in the next steps */}
                {activeTab !== 'overview' && activeTab !== 'properties' && activeTab !== 'bookings' && activeTab !== 'rentals' && activeTab !== 'payments' && activeTab !== 'agreements' && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                        <div className="max-w-md mx-auto">
                            <FiSettings className="w-16 h-16 text-gray-100 mx-auto mb-4 animate-spin-slow" />
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Coming Soon</h3>
                            <p className="text-gray-500">The {tabs.find(t => t.id === activeTab)?.label} section is currently under development to ensure a professional experience.</p>
                            <button onClick={() => setActiveTab('overview')} className="mt-6 text-primary-600 font-bold hover:underline">Return to Overview</button>
                        </div>
                    </div>
                )}
                {/* Maintenance Tab */}
                {activeTab === 'maintenance' && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Maintenance Requests</h2>
                                <p className="text-sm text-gray-500">Track and manage repair requests from your tenants</p>
                            </div>
                        </div>

                        {maintenanceRequests.length === 0 ? (
                            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400">
                                <FiTool className="w-16 h-16 mx-auto mb-4" />
                                <h3 className="text-lg font-bold text-gray-900 mb-1">No Maintenance Requests</h3>
                                <p className="text-sm">Requests will appear here once submitted by your tenants.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-4">
                                {maintenanceRequests.map((req) => (
                                    <div key={req.request_id} className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col md:flex-row items-center justify-between gap-6 hover:shadow-md transition-all">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-1">
                                                <h3 className="font-bold text-gray-900">{req.title}</h3>
                                                <Badge variant={
                                                    req.priority === 'high' ? 'danger' :
                                                        req.priority === 'medium' ? 'warning' : 'info'
                                                } size="sm">{req.priority?.toUpperCase()}</Badge>
                                            </div>
                                            <p className="text-sm text-gray-600 mb-2">{req.description}</p>
                                            <div className="flex flex-wrap gap-4 text-xs text-gray-400">
                                                <span className="flex items-center gap-1"><FiHome /> {req.property_title}</span>
                                                <span className="flex items-center gap-1"><FiUsers /> {req.tenant_name} ({req.tenant_phone})</span>
                                                <span className="flex items-center gap-1"><FiClock /> {format(new Date(req.created_at), 'MMM d, yyyy')}</span>
                                            </div>
                                            {req.notes && (
                                                <p className="text-xs text-blue-600 mt-2 bg-blue-50 p-2 rounded-lg italic">Owner Notes: {req.notes}</p>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 w-full md:w-auto">
                                            {req.status === 'pending' && (
                                                <button
                                                    onClick={() => handleUpdateMaintenance(req.request_id, 'in_progress')}
                                                    className="flex-1 md:flex-none px-4 py-2 bg-primary-50 text-primary-600 rounded-xl font-bold hover:bg-primary-100 transition-all text-sm"
                                                >
                                                    Start Work
                                                </button>
                                            )}
                                            {req.status === 'in_progress' && (
                                                <button
                                                    onClick={() => handleUpdateMaintenance(req.request_id, 'completed')}
                                                    className="flex-1 md:flex-none px-4 py-2 bg-green-500 text-white rounded-xl font-bold hover:bg-green-600 transition-all text-sm"
                                                >
                                                    Mark Resolved
                                                </button>
                                            )}
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
            </main>
        </div>
    );
};

export default OwnerDashboard;
