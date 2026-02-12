import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import * as adminService from '../services/adminService';
import toast, { Toaster } from 'react-hot-toast';
import {
    FiUsers, FiHome, FiDollarSign, FiCalendar, FiClock,
    FiCheckCircle, FiAlertCircle, FiTrendingUp, FiSearch,
    FiFilter, FiDownload, FiRefreshCw, FiEye, FiX, FiCheck
} from 'react-icons/fi';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import StatCard from '../components/admin/StatCard';
import Modal from '../components/common/Modal';
import Badge from '../components/common/Badge';
import { SkeletonCard, SkeletonTable, SkeletonChart } from '../components/common/Skeleton';

const IMG_BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5001';

const AdminDashboard = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('overview');
    const [stats, setStats] = useState(null);
    const [pendingUsers, setPendingUsers] = useState([]);
    const [pendingProperties, setPendingProperties] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [allProperties, setAllProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedProperty, setSelectedProperty] = useState(null);
    const [filterRole, setFilterRole] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');

    useEffect(() => {
        fetchDashboardData();
    }, []);

    useEffect(() => {
        if (activeTab === 'users' && allUsers.length === 0) {
            fetchAllUsers();
        } else if (activeTab === 'properties' && allProperties.length === 0) {
            fetchAllProperties();
        }
    }, [activeTab]);

    const fetchDashboardData = async (showToast = false) => {
        setLoading(true);
        try {
            const [statsData, pendingUsersData, pendingPropsData] = await Promise.all([
                adminService.getDashboardStats(),
                adminService.getPendingUsers(),
                adminService.getPendingProperties()
            ]);

            setStats(statsData.stats);
            setPendingUsers(pendingUsersData.users || []);
            setPendingProperties(pendingPropsData.properties || []);
            if (showToast) toast.success('Dashboard data refreshed');
        } catch (err) {
            toast.error(err.message || 'Failed to load dashboard data');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        const refreshPromise = (async () => {
            await fetchDashboardData();
            if (activeTab === 'users') {
                await fetchAllUsers();
            } else if (activeTab === 'properties') {
                await fetchAllProperties();
            }
        })();

        toast.promise(refreshPromise, {
            loading: 'Refreshing data...',
            success: 'Data refreshed successfully',
            error: (err) => `Refresh failed: ${err.message || 'Unknown error'}`
        });
    };

    const fetchAllUsers = async () => {
        try {
            console.log('Fetching all users...');
            const data = await adminService.getAllUsers({ page: 1, limit: 100 });
            console.log('Users data received:', data);
            setAllUsers(data.users || []);
            console.log('Users set to state:', data.users?.length || 0, 'users');
        } catch (err) {
            console.error('Error fetching users:', err);
            toast.error(err.message || 'Failed to load users');
        }
    };

    const fetchAllProperties = async () => {
        try {
            const data = await adminService.getAllProperties({ page: 1, limit: 100 });
            setAllProperties(data.properties || []);
        } catch (err) {
            toast.error(err.message);
        }
    };

    const handleApproveUser = async (userId) => {
        try {
            await adminService.approveUser(userId);
            toast.success('User approved successfully');
            fetchDashboardData();
            if (activeTab === 'users') fetchAllUsers();
        } catch (err) {
            toast.error(err.message);
        }
    };

    const handleRejectUser = async (userId) => {
        if (!window.confirm('Are you sure you want to reject this user?')) return;
        try {
            await adminService.rejectUser(userId);
            toast.success('User rejected');
            fetchDashboardData();
            if (activeTab === 'users') fetchAllUsers();
        } catch (err) {
            toast.error(err.message);
        }
    };

    const handleSuspendUser = async (userId) => {
        const reason = window.prompt('Enter suspension reason:');
        if (!reason) return;
        try {
            await adminService.suspendUser(userId, reason);
            toast.success('User suspended');
            fetchAllUsers();
        } catch (err) {
            toast.error(err.message);
        }
    };

    const handleApproveProperty = async (propertyId) => {
        try {
            await adminService.approveProperty(propertyId);
            toast.success('Property approved successfully');
            fetchDashboardData();
            if (activeTab === 'properties') fetchAllProperties();
        } catch (err) {
            toast.error(err.message);
        }
    };

    const handleRejectProperty = async (propertyId) => {
        const reason = window.prompt('Enter rejection reason:');
        if (!reason) return;
        try {
            await adminService.rejectProperty(propertyId, reason);
            toast.success('Property rejected');
            fetchDashboardData();
            if (activeTab === 'properties') fetchAllProperties();
        } catch (err) {
            toast.error(err.message);
        }
    };

    // Mock data for charts (replace with real data from backend)
    const revenueData = [
        { month: 'Jan', revenue: 45000 },
        { month: 'Feb', revenue: 52000 },
        { month: 'Mar', revenue: 48000 },
        { month: 'Apr', revenue: 61000 },
        { month: 'May', revenue: 55000 },
        { month: 'Jun', revenue: 67000 },
    ];

    const userGrowthData = [
        { month: 'Jan', users: 120 },
        { month: 'Feb', users: 145 },
        { month: 'Mar', users: 168 },
        { month: 'Apr', users: 192 },
        { month: 'May', users: 215 },
        { month: 'Jun', users: 248 },
    ];

    const propertyTypeData = [
        { name: 'Apartment', value: 45 },
        { name: 'House', value: 30 },
        { name: 'Room', value: 20 },
        { name: 'Commercial', value: 5 },
    ];

    const COLORS = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B'];


    const tabs = [
        { id: 'overview', label: 'Overview', icon: FiTrendingUp },
        { id: 'analytics', label: 'Analytics', icon: FiDollarSign },
        { id: 'users', label: 'Users', icon: FiUsers },
        { id: 'properties', label: 'Properties', icon: FiHome },
    ];

    // Calculate filtered users with useMemo for performance
    const filteredUsers = useMemo(() => {
        return (allUsers || []).filter(u => {
            const matchesSearch = (u.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (u.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (u.phone || '').toLowerCase().includes(searchTerm.toLowerCase());
            const matchesRole = filterRole === 'all' || u.role === filterRole;
            const matchesStatus = filterStatus === 'all' ||
                (filterStatus === 'active' && u.is_active) ||
                (filterStatus === 'suspended' && !u.is_active) ||
                (filterStatus === 'pending' && u.approval_status === 'pending');
            return matchesSearch && matchesRole && matchesStatus;
        });
    }, [allUsers, searchTerm, filterRole, filterStatus]);

    const getInitials = (name) => {
        if (!name) return '?';
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
    };

    if (loading && !stats) {
        return (
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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

            {/* Header */}
            <div className="glass sticky top-0 z-20 shadow-sm border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                Admin Dashboard
                            </h1>
                            <p className="text-gray-600 mt-1">Welcome back, {user?.full_name}</p>
                        </div>
                        <button
                            onClick={handleRefresh}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md active:scale-95"
                        >
                            <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                            Refresh
                        </button>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="glass sticky top-[73px] z-20 border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-6">
                    <nav className="flex space-x-8" aria-label="Tabs">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => {
                                        setActiveTab(tab.id);
                                        if (tab.id === 'users') fetchAllUsers();
                                        if (tab.id === 'properties') fetchAllProperties();
                                    }}
                                    className={`
                                        flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors
                                        ${activeTab === tab.id
                                            ? 'border-blue-500 text-blue-600'
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

            {/* Content */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Overview Tab */}
                {activeTab === 'overview' && stats && (
                    <div className="space-y-8">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <StatCard
                                title="Total Users"
                                value={stats.users?.total_users || 0}
                                icon={FiUsers}
                                color="blue"
                                subtitle={`${stats.users?.pending_approvals || 0} pending approval`}
                                trend="up"
                                trendValue="+12%"
                            />
                            <StatCard
                                title="Properties"
                                value={stats.properties?.total_properties || 0}
                                icon={FiHome}
                                color="green"
                                subtitle={`${stats.properties?.pending_properties || 0} pending review`}
                                trend="up"
                                trendValue="+8%"
                            />
                            <StatCard
                                title="Active Bookings"
                                value={stats.bookings?.active_bookings || 0}
                                icon={FiCalendar}
                                color="purple"
                                subtitle={`${stats.bookings?.total_bookings || 0} total bookings`}
                                trend="up"
                                trendValue="+15%"
                            />
                            <StatCard
                                title="Total Revenue"
                                value={`NPR ${(stats.payments?.total_revenue || 0).toLocaleString()}`}
                                icon={FiDollarSign}
                                color="orange"
                                subtitle={`${stats.payments?.total_transactions || 0} transactions`}
                                trend="up"
                                trendValue="+23%"
                            />
                        </div>

                        {/* Additional Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <StatCard
                                title="Pending Approvals"
                                value={(stats.users?.pending_approvals || 0) + (stats.properties?.pending_properties || 0)}
                                icon={FiClock}
                                color="indigo"
                                subtitle="Users + Properties"
                            />
                            <StatCard
                                title="Approved Properties"
                                value={stats.properties?.approved_properties || 0}
                                icon={FiCheckCircle}
                                color="teal"
                                subtitle={`${stats.properties?.available_properties || 0} available`}
                            />
                            <StatCard
                                title="Trusted Owners"
                                value={stats.users?.trusted_owners || 0}
                                icon={FiUsers}
                                color="pink"
                                subtitle={`of ${stats.users?.total_owners || 0} total owners`}
                            />
                            <StatCard
                                title="Complaints"
                                value={stats.complaints?.total_complaints || 0}
                                icon={FiAlertCircle}
                                color="red"
                                subtitle={`${stats.complaints?.pending_complaints || 0} pending`}
                            />
                        </div>

                        {/* Pending Actions */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Pending User Approvals */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900">Pending Users</h3>
                                        <p className="text-xs text-gray-500">Awaiting verification</p>
                                    </div>
                                    <Badge variant="warning">{pendingUsers.length}</Badge>
                                </div>
                                {pendingUsers.length === 0 ? (
                                    <div className="text-center py-12">
                                        <FiCheckCircle className="w-12 h-12 mx-auto mb-3 text-green-200" />
                                        <p className="text-gray-400 text-sm">No pending users</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                                        {pendingUsers.map((u) => (
                                            <div key={u.user_id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group">
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-bold text-gray-900 truncate">{u.full_name}</div>
                                                    <div className="text-xs text-gray-500 truncate">{u.email}</div>
                                                    <div className="mt-1"><Badge variant="info" size="sm">{u.role}</Badge></div>
                                                </div>
                                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => handleApproveUser(u.user_id)}
                                                        className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors shadow-sm"
                                                        title="Approve"
                                                    >
                                                        <FiCheck className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleRejectUser(u.user_id)}
                                                        className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-sm"
                                                        title="Reject"
                                                    >
                                                        <FiX className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Pending Property Approvals */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900">Pending Listings</h3>
                                        <p className="text-xs text-gray-500">New properties to review</p>
                                    </div>
                                    <Badge variant="primary">{pendingProperties.length}</Badge>
                                </div>
                                {pendingProperties.length === 0 ? (
                                    <div className="text-center py-12">
                                        <FiHome className="w-12 h-12 mx-auto mb-3 text-blue-200" />
                                        <p className="text-gray-400 text-sm">No pending properties</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                                        {pendingProperties.map((p) => (
                                            <div key={p.property_id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group">
                                                <div className="flex items-center gap-4 flex-1 min-w-0">
                                                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                                                        <img
                                                            src={p.images?.[0] ? (p.images[0].startsWith('http') ? p.images[0] : `${IMG_BASE_URL}/${p.images[0].replace(/\\/g, '/')}`) : ''}
                                                            className="w-full h-full object-cover"
                                                            alt=""
                                                        />
                                                    </div>
                                                    <div className="truncate">
                                                        <div className="font-bold text-gray-900 truncate">{p.title}</div>
                                                        <div className="text-xs text-gray-500">{p.city} • Rs. {p.price_per_month?.toLocaleString()}</div>
                                                        <div className="text-xs text-primary-600 font-medium">By: {p.owner_name}</div>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => setSelectedProperty(p)}
                                                        className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors shadow-sm"
                                                        title="View Details"
                                                    >
                                                        <FiEye className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleApproveProperty(p.property_id)}
                                                        className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors shadow-sm"
                                                        title="Approve"
                                                    >
                                                        <FiCheck className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Recent Activity / Approved Items */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">Recently Approved Properties</h3>
                                    <p className="text-sm text-gray-500">Latest listings added to the platform</p>
                                </div>
                                <button
                                    onClick={() => {
                                        setActiveTab('properties');
                                        setFilterStatus('approved');
                                        fetchAllProperties();
                                    }}
                                    className="text-primary-600 font-bold text-sm hover:underline"
                                >
                                    View All Approved
                                </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                                {allProperties
                                    .filter(p => p.admin_approval_status === 'approved')
                                    .slice(0, 5)
                                    .map(p => (
                                        <div key={p.property_id} className="group cursor-pointer" onClick={() => setSelectedProperty(p)}>
                                            <div className="aspect-[4/3] rounded-2xl overflow-hidden mb-3 relative">
                                                <img
                                                    src={p.images?.[0] ? (p.images[0].startsWith('http') ? p.images[0] : `${IMG_BASE_URL}/${p.images[0].replace(/\\/g, '/')}`) : ''}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                    alt={p.title}
                                                />
                                                <div className="absolute top-2 right-2">
                                                    <Badge variant="success" size="sm">Live</Badge>
                                                </div>
                                            </div>
                                            <h4 className="font-bold text-sm text-gray-900 line-clamp-1 group-hover:text-primary-600 transition-colors">{p.title}</h4>
                                            <p className="text-xs text-gray-500">{p.city}</p>
                                            <p className="text-xs font-black text-primary-600 mt-1">Rs. {p.price_per_month?.toLocaleString()}</p>
                                        </div>
                                    ))}
                                {allProperties.filter(p => p.admin_approval_status === 'approved').length === 0 && (
                                    <div className="col-span-full py-8 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                        <p className="text-gray-400 text-sm">No approved properties yet</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Analytics Tab */}
                {activeTab === 'analytics' && (
                    <div className="space-y-8">
                        <h2 className="text-2xl font-bold text-gray-900">Platform Analytics</h2>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Revenue Chart */}
                            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                                <h3 className="text-lg font-semibold mb-4 text-gray-900">Monthly Revenue</h3>
                                <ResponsiveContainer width="100%" height={300}>
                                    <AreaChart data={revenueData}>
                                        <defs>
                                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                                                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="month" />
                                        <YAxis />
                                        <Tooltip />
                                        <Area type="monotone" dataKey="revenue" stroke="#3B82F6" fillOpacity={1} fill="url(#colorRevenue)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>

                            {/* User Growth Chart */}
                            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                                <h3 className="text-lg font-semibold mb-4 text-gray-900">User Growth</h3>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={userGrowthData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="month" />
                                        <YAxis />
                                        <Tooltip />
                                        <Bar dataKey="users" fill="#8B5CF6" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Property Distribution */}
                            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                                <h3 className="text-lg font-semibold mb-4 text-gray-900">Property Distribution</h3>
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={propertyTypeData}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            {propertyTypeData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Booking Trends */}
                            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                                <h3 className="text-lg font-semibold mb-4 text-gray-900">Booking Trends</h3>
                                <ResponsiveContainer width="100%" height={300}>
                                    <LineChart data={userGrowthData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="month" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Line type="monotone" dataKey="users" stroke="#10B981" strokeWidth={2} name="Bookings" />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                )}

                {/* Users Tab */}
                {activeTab === 'users' && (
                    <div className="space-y-8">
                        {/* Header Section */}
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div>
                                <h2 className="text-3xl font-black text-gray-900 tracking-tight">User Management</h2>
                                <p className="text-sm text-gray-500 mt-1">Manage and monitor all platform users</p>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={fetchAllUsers}
                                    className="flex items-center gap-2 px-4 py-2.5 bg-white border-2 border-gray-200 text-gray-700 rounded-xl hover:border-blue-500 hover:text-blue-600 transition-all font-semibold shadow-sm"
                                >
                                    <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                                    Refresh
                                </button>
                                <button className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-semibold shadow-lg shadow-blue-500/30">
                                    <FiDownload className="w-4 h-4" />
                                    Export
                                </button>
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-5 text-white shadow-lg shadow-blue-500/30">
                                <div className="flex items-center justify-between mb-2">
                                    <FiUsers className="w-8 h-8 opacity-80" />
                                    <div className="text-xs font-bold bg-white/20 px-2 py-1 rounded-full">TOTAL</div>
                                </div>
                                <div className="text-3xl font-black mb-1">{allUsers?.length || 0}</div>
                                <div className="text-xs font-semibold text-blue-100">All Users</div>
                            </div>
                            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-5 text-white shadow-lg shadow-green-500/30">
                                <div className="flex items-center justify-between mb-2">
                                    <FiCheckCircle className="w-8 h-8 opacity-80" />
                                    <div className="text-xs font-bold bg-white/20 px-2 py-1 rounded-full">ACTIVE</div>
                                </div>
                                <div className="text-3xl font-black mb-1">{allUsers?.filter(u => u.is_active).length || 0}</div>
                                <div className="text-xs font-semibold text-green-100">Active Users</div>
                            </div>
                            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-5 text-white shadow-lg shadow-purple-500/30">
                                <div className="flex items-center justify-between mb-2">
                                    <FiHome className="w-8 h-8 opacity-80" />
                                    <div className="text-xs font-bold bg-white/20 px-2 py-1 rounded-full">OWNERS</div>
                                </div>
                                <div className="text-3xl font-black mb-1">{allUsers?.filter(u => u.role === 'owner').length || 0}</div>
                                <div className="text-xs font-semibold text-purple-100">Property Owners</div>
                            </div>
                            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-5 text-white shadow-lg shadow-orange-500/30">
                                <div className="flex items-center justify-between mb-2">
                                    <FiUsers className="w-8 h-8 opacity-80" />
                                    <div className="text-xs font-bold bg-white/20 px-2 py-1 rounded-full">TENANTS</div>
                                </div>
                                <div className="text-3xl font-black mb-1">{allUsers?.filter(u => u.role === 'tenant').length || 0}</div>
                                <div className="text-xs font-semibold text-orange-100">Tenants</div>
                            </div>
                        </div>
                        {/* Search and Filters */}
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                            <div className="flex flex-col lg:flex-row gap-4">
                                <div className="relative flex-1">
                                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                                        <FiSearch className="w-5 h-5" />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Search users by name, email, or phone number..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-12 pr-12 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all outline-none text-sm font-medium placeholder:text-gray-400"
                                    />
                                    {searchTerm && (
                                        <button
                                            onClick={() => setSearchTerm('')}
                                            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                        >
                                            <FiX className="w-5 h-5" />
                                        </button>
                                    )}
                                </div>
                                <div className="flex gap-3">
                                    <div className="relative min-w-[160px]">
                                        <FiFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                                        <select
                                            value={filterRole}
                                            onChange={(e) => setFilterRole(e.target.value)}
                                            className="w-full pl-10 pr-4 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all outline-none appearance-none text-sm font-semibold cursor-pointer"
                                        >
                                            <option value="all">All Roles</option>
                                            <option value="owner">Owners</option>
                                            <option value="tenant">Tenants</option>
                                        </select>
                                    </div>
                                    <div className="relative min-w-[160px]">
                                        <FiFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                                        <select
                                            value={filterStatus}
                                            onChange={(e) => setFilterStatus(e.target.value)}
                                            className="w-full pl-10 pr-4 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all outline-none appearance-none text-sm font-semibold cursor-pointer"
                                        >
                                            <option value="all">All Status</option>
                                            <option value="active">Active</option>
                                            <option value="suspended">Suspended</option>
                                            <option value="pending">Pending</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            {(searchTerm || filterRole !== 'all' || filterStatus !== 'all') && (
                                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                                    <p className="text-sm text-gray-600">
                                        <span className="font-semibold text-gray-900">{filteredUsers.length}</span> {filteredUsers.length === 1 ? 'user' : 'users'} found
                                    </p>
                                    <button
                                        onClick={() => {
                                            setSearchTerm('');
                                            setFilterRole('all');
                                            setFilterStatus('all');
                                        }}
                                        className="text-sm text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
                                    >
                                        <FiX className="w-4 h-4" /> Clear filters
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Users Table */}
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="min-w-full">
                                    <thead>
                                        <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                                            <th className="px-8 py-5 text-left">
                                                <span className="text-xs font-black text-gray-600 uppercase tracking-wider">User</span>
                                            </th>
                                            <th className="px-6 py-5 text-left">
                                                <span className="text-xs font-black text-gray-600 uppercase tracking-wider">Contact</span>
                                            </th>
                                            <th className="px-6 py-5 text-left">
                                                <span className="text-xs font-black text-gray-600 uppercase tracking-wider">Role</span>
                                            </th>
                                            <th className="px-6 py-5 text-left">
                                                <span className="text-xs font-black text-gray-600 uppercase tracking-wider">Status</span>
                                            </th>
                                            <th className="px-6 py-5 text-left">
                                                <span className="text-xs font-black text-gray-600 uppercase tracking-wider">Trust Level</span>
                                            </th>
                                            <th className="px-8 py-5 text-right">
                                                <span className="text-xs font-black text-gray-600 uppercase tracking-wider">Actions</span>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {filteredUsers.length > 0 ? filteredUsers.map((u, index) => (
                                            <tr key={u.user_id} className="hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-transparent transition-all duration-200 group">
                                                <td className="px-8 py-5">
                                                    <div className="flex items-center gap-4">
                                                        <div className="relative">
                                                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-base shadow-lg shadow-blue-500/30 ring-4 ring-blue-50 group-hover:ring-blue-100 transition-all">
                                                                {getInitials(u.full_name)}
                                                            </div>
                                                            {u.is_active && (
                                                                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-sm" />
                                                            )}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="font-bold text-gray-900 text-base group-hover:text-blue-600 transition-colors truncate">{u.full_name}</div>
                                                            <div className="text-xs text-gray-500 font-medium mt-0.5">ID: {String(u.user_id || '').substring(0, 8)}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <div className="text-sm font-semibold text-gray-900">{u.email}</div>
                                                    <div className="text-xs text-gray-500 mt-0.5">{u.phone || 'No phone'}</div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs ${u.role === 'owner'
                                                        ? 'bg-purple-100 text-purple-700 ring-1 ring-purple-200'
                                                        : 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200'
                                                        }`}>
                                                        {u.role === 'owner' ? <FiHome className="w-3.5 h-3.5" /> : <FiUsers className="w-3.5 h-3.5" />}
                                                        {u.role?.toUpperCase()}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs ${u.is_active
                                                        ? 'bg-green-100 text-green-700 ring-1 ring-green-200'
                                                        : 'bg-red-100 text-red-700 ring-1 ring-red-200'
                                                        }`}>
                                                        <div className={`w-1.5 h-1.5 rounded-full ${u.is_active ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
                                                        {u.is_active ? 'ACTIVE' : 'SUSPENDED'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    {u.role === 'owner' && (
                                                        <div>
                                                            {u.trust_level === 'trusted' ? (
                                                                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg font-black text-xs shadow-md shadow-blue-500/30">
                                                                    <FiCheckCircle className="w-3.5 h-3.5" />
                                                                    VERIFIED
                                                                </div>
                                                            ) : (
                                                                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg font-bold text-xs">
                                                                    <FiClock className="w-3.5 h-3.5" />
                                                                    STANDARD
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-8 py-5">
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            onClick={() => setSelectedUser(u)}
                                                            className="p-2.5 text-blue-600 hover:bg-blue-100 rounded-xl transition-all hover:scale-110 active:scale-95"
                                                            title="View Details"
                                                        >
                                                            <FiEye className="w-5 h-5" />
                                                        </button>
                                                        {u.is_active ? (
                                                            <button
                                                                onClick={() => handleSuspendUser(u.user_id)}
                                                                className="px-3 py-2 text-red-600 hover:bg-red-100 rounded-xl transition-all font-bold text-xs hover:scale-105 active:scale-95"
                                                                title="Suspend"
                                                            >
                                                                SUSPEND
                                                            </button>
                                                        ) : (
                                                            <button
                                                                onClick={() => adminService.activateUser(u.user_id).then(fetchAllUsers)}
                                                                className="px-3 py-2 text-green-600 hover:bg-green-100 rounded-xl transition-all font-bold text-xs hover:scale-105 active:scale-95"
                                                                title="Activate"
                                                            >
                                                                ACTIVATE
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan="6" className="px-8 py-16 text-center">
                                                    <div className="flex flex-col items-center justify-center">
                                                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                                            <FiUsers className="w-10 h-10 text-gray-300" />
                                                        </div>
                                                        <h3 className="text-lg font-bold text-gray-900 mb-1">No users found</h3>
                                                        <p className="text-sm text-gray-500">Try adjusting your search or filters</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* Properties Tab */}
                {activeTab === 'properties' && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-gray-900">Property Management</h2>
                            <div className="flex gap-2">
                                <button
                                    onClick={fetchAllProperties}
                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                    title="Refresh Properties"
                                >
                                    <FiRefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                                </button>
                                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                                    <FiDownload className="w-4 h-4" />
                                    Export
                                </button>
                            </div>
                        </div>

                        {/* Search and Filters */}
                        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="md:col-span-2 relative">
                                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search by title, city or owner..."
                                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <select
                                    className="border border-gray-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                >
                                    <option value="all">All Status</option>
                                    <option value="pending">Pending</option>
                                    <option value="approved">Approved</option>
                                    <option value="rejected">Rejected</option>
                                </select>
                                <select className="border border-gray-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500">
                                    <option value="all">All Types</option>
                                    <option value="apartment">Apartment</option>
                                    <option value="house">House</option>
                                    <option value="room">Room</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {allProperties
                                .filter(p => {
                                    const matchesSearch = p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                        p.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                        p.owner_name?.toLowerCase().includes(searchTerm.toLowerCase());
                                    const matchesStatus = filterStatus === 'all' || p.admin_approval_status === filterStatus;
                                    return matchesSearch && matchesStatus;
                                })
                                .map((p) => (
                                    <div key={p.property_id} className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow group">
                                        <div className="h-48 bg-gray-100 relative overflow-hidden">
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-10" />
                                            <img
                                                src={p.images?.[0] ?
                                                    (p.images[0].startsWith('http') ? p.images[0] : `${IMG_BASE_URL}/${p.images[0].replace(/\\/g, '/')}`) :
                                                    'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'}
                                                alt={p.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                            <div className="absolute top-4 left-4 z-20">
                                                <Badge variant={
                                                    p.admin_approval_status === 'approved' ? 'success' :
                                                        p.admin_approval_status === 'pending' ? 'warning' : 'danger'
                                                }>
                                                    {p.admin_approval_status}
                                                </Badge>
                                            </div>
                                        </div>
                                        <div className="p-6">
                                            <div className="flex items-start justify-between mb-4">
                                                <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">{p.title}</h3>
                                            </div>
                                            <p className="text-gray-600 text-sm mb-4 line-clamp-2">{p.description}</p>
                                            <div className="space-y-2 text-sm border-t pt-4">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-500">Type:</span>
                                                    <span className="font-medium capitalize">{p.property_type}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-500">Location:</span>
                                                    <span className="font-medium">{p.city}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-500">Rent:</span>
                                                    <span className="font-black text-primary-600">NPR {p.price_per_month?.toLocaleString()}</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-gray-500">Owner:</span>
                                                    <span className="font-medium flex items-center gap-1">
                                                        {p.owner_name}
                                                        {p.trust_level === 'trusted' && <FiCheckCircle className="text-blue-500 w-3 h-3" />}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex gap-2 mt-6">
                                                <button
                                                    onClick={() => setSelectedProperty(p)}
                                                    className="flex-1 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center gap-2 font-bold"
                                                >
                                                    <FiEye className="w-4 h-4" /> Details
                                                </button>
                                                {p.admin_approval_status === 'pending' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleApproveProperty(p.property_id)}
                                                            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                                                            title="Approve"
                                                        >
                                                            <FiCheck />
                                                        </button>
                                                        <button
                                                            onClick={() => handleRejectProperty(p.property_id)}
                                                            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                                                            title="Reject"
                                                        >
                                                            <FiX />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                        </div>

                        {allProperties.length === 0 && (
                            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-12 text-center">
                                <FiHome className="w-16 h-16 mx-auto mb-4 text-gray-200" />
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Properties Found</h3>
                                <p className="text-gray-600">Try adjusting your filters or refresh the list</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* User Details Modal */}
            {selectedUser && (
                <Modal
                    isOpen={!!selectedUser}
                    onClose={() => setSelectedUser(null)}
                    title="User Profile Management"
                    size="lg"
                >
                    <div className="space-y-8">
                        {/* Profile Header */}
                        <div className="flex items-center gap-6 p-6 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl text-white shadow-lg">
                            <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-3xl font-black shadow-inner border border-white/30">
                                {getInitials(selectedUser.full_name)}
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-1">
                                    <h2 className="text-2xl font-black tracking-tight">{selectedUser.full_name}</h2>
                                    <Badge
                                        variant={selectedUser.role === 'owner' ? 'warning' : 'info'}
                                        className="bg-white/20 text-white border-none backdrop-blur-sm"
                                    >
                                        {selectedUser.role?.toUpperCase()}
                                    </Badge>
                                </div>
                                <p className="text-blue-100 flex items-center gap-2 text-sm">
                                    <FiUsers className="w-4 h-4 opactiy-70" /> User ID: #{String(selectedUser.user_id || '').substring(0, 8)}
                                </p>
                            </div>
                            <div className="text-right">
                                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-black shadow-sm ${selectedUser.is_active ? 'bg-green-500/20 text-green-100 border border-green-500/30' : 'bg-red-500/20 text-red-100 border border-red-500/30'}`}>
                                    <div className={`w-2 h-2 rounded-full ${selectedUser.is_active ? 'bg-green-400' : 'bg-red-400'} animate-pulse`} />
                                    {selectedUser.is_active ? 'ACTIVE' : 'SUSPENDED'}
                                </div>
                                <p className="text-[10px] text-blue-200 mt-2 font-black uppercase tracking-widest opacity-70">Status</p>
                            </div>
                        </div>

                        {/* Info Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <div className="w-1.5 h-6 bg-blue-600 rounded-full" />
                                        Contact Information
                                    </h3>
                                    <div className="space-y-4">
                                        <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100 transition-all hover:border-blue-200 group">
                                            <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-blue-600 border border-gray-100 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                                <FiUsers />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Full Name</p>
                                                <p className="font-bold text-gray-900">{selectedUser.full_name}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100 transition-all hover:border-blue-200 group">
                                            <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-blue-600 border border-gray-100 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                                <FiUsers />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Email Address</p>
                                                <p className="font-bold text-gray-900 truncate">{selectedUser.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100 transition-all hover:border-blue-200 group">
                                            <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-blue-600 border border-gray-100 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                                <FiUsers />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Phone Number</p>
                                                <p className="font-bold text-gray-900">{selectedUser.phone || 'N/A'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <div className="w-1.5 h-6 bg-purple-600 rounded-full" />
                                        Activity & Logs
                                    </h3>
                                    <div className="space-y-4">
                                        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Account Created</p>
                                            <p className="font-bold text-gray-900">{selectedUser.created_at ? format(new Date(selectedUser.created_at), 'PPP') : 'N/A'}</p>
                                            <p className="text-[10px] text-gray-400 mt-1">{selectedUser.created_at ? format(new Date(selectedUser.created_at), 'p') : ''}</p>
                                        </div>
                                        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Last System Update</p>
                                            <p className="font-bold text-gray-900">{selectedUser.updated_at ? format(new Date(selectedUser.updated_at), 'PPP') : 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Verification Section */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
                                <div className="w-1.5 h-6 bg-green-600 rounded-full" />
                                Verification Documentation
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-gray-50 rounded-2xl border border-gray-100">
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Government Issued ID</p>
                                    <p className="text-xl font-black text-gray-900 mb-4">{selectedUser.citizenship_number || 'IDENTIFICATION PENDING'}</p>
                                    {selectedUser.id_proof_url ? (
                                        <div className="aspect-video bg-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-zoom-in group">
                                            <img
                                                src={selectedUser.id_proof_url.startsWith('http') ? selectedUser.id_proof_url : `${IMG_BASE_URL}/${selectedUser.id_proof_url.replace(/\\/g, '/')}`}
                                                alt="ID Proof"
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                                                onClick={() => window.open(selectedUser.id_proof_url.startsWith('http') ? selectedUser.id_proof_url : `${IMG_BASE_URL}/${selectedUser.id_proof_url.replace(/\\/g, '/')}`, '_blank')}
                                            />
                                        </div>
                                    ) : (
                                        <div className="aspect-video bg-gray-100 border border-dashed border-gray-300 rounded-xl flex items-center justify-center text-gray-400 italic text-sm">
                                            No ID document uploaded
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-6">
                                    {selectedUser.role === 'owner' && (
                                        <div className="p-5 bg-blue-600 rounded-2xl shadow-lg shadow-blue-200 text-white">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                                                    <FiDollarSign className="text-white" />
                                                </div>
                                                <Badge className="bg-white/20 text-white border-none uppercase text-[8px] font-black">Settlement Bank</Badge>
                                            </div>
                                            <div>
                                                <p className="text-[8px] font-black uppercase text-blue-200 tracking-widest">Bank Name</p>
                                                <p className="text-lg font-black mb-3">{selectedUser.bank_name || 'NOT CONFIGURED'}</p>
                                                <p className="text-[8px] font-black uppercase text-blue-200 tracking-widest">Account Number</p>
                                                <p className="text-xl font-mono tracking-tighter">{selectedUser.bank_account_number || 'XXXX-XXXX-XXXX'}</p>
                                            </div>
                                        </div>
                                    )}
                                    <div className="p-4 bg-white rounded-xl border border-gray-100">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Permanent Address</p>
                                        <p className="text-sm font-bold text-gray-900">{selectedUser.permanent_address || 'Address not verified'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Management Actions */}
                        <div className="flex gap-4 pt-6 border-t border-gray-100">
                            {selectedUser.is_active ? (
                                <button
                                    onClick={() => handleSuspendUser(selectedUser.user_id)}
                                    className="flex-1 bg-red-600 text-white p-4 rounded-2xl font-black hover:bg-red-700 transition-all shadow-lg shadow-red-100 flex items-center justify-center gap-2 transform active:scale-95"
                                >
                                    <FiAlertCircle /> Suspend User Account
                                </button>
                            ) : (
                                <button
                                    onClick={() => adminService.activateUser(selectedUser.user_id).then(() => {
                                        fetchAllUsers();
                                        setSelectedUser(null);
                                        toast.success('User account activated');
                                    })}
                                    className="flex-1 bg-green-600 text-white p-4 rounded-2xl font-black hover:bg-green-700 transition-all shadow-lg shadow-green-100 flex items-center justify-center gap-2 transform active:scale-95"
                                >
                                    <FiCheckCircle /> Activate User Account
                                </button>
                            )}
                            <button
                                onClick={() => setSelectedUser(null)}
                                className="px-8 bg-gray-100 text-gray-600 p-4 rounded-2xl font-black hover:bg-gray-200 transition-all flex items-center justify-center transform active:scale-95"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </Modal>
            )}

            {/* Property Details Modal */}
            {selectedProperty && (
                <Modal
                    isOpen={!!selectedProperty}
                    onClose={() => setSelectedProperty(null)}
                    title="Property Review"
                    size="xl"
                >
                    <div className="space-y-8">
                        {/* Summary Header */}
                        <div className="flex flex-col md:flex-row justify-between gap-6">
                            <div className="flex-1">
                                <h2 className="text-2xl font-black text-gray-900 mb-2">{selectedProperty.title}</h2>
                                <p className="text-gray-500 flex items-center gap-2">
                                    <FiHome /> {selectedProperty.address}, {selectedProperty.city}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1">Monthly Rent</p>
                                <p className="text-3xl font-black text-primary-600">NPR {selectedProperty.price_per_month?.toLocaleString()}</p>
                            </div>
                        </div>

                        {/* Image Gallery */}
                        {selectedProperty.images && selectedProperty.images.length > 0 && (
                            <div className="space-y-4">
                                <h3 className="text-sm font-black uppercase tracking-widest text-gray-900">Property Photos</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {selectedProperty.images.map((img, idx) => (
                                        <div key={idx} className="aspect-video rounded-2xl overflow-hidden border border-gray-100 shadow-sm transition-all hover:shadow-lg cursor-zoom-in group">
                                            <img
                                                src={img.startsWith('http') ? img : `${IMG_BASE_URL}/${img.replace(/\\/g, '/')}`}
                                                alt={`Property ${idx + 1}`}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                onClick={() => window.open(img.startsWith('http') ? img : `${IMG_BASE_URL}/${img.replace(/\\/g, '/')}`, '_blank')}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Details Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col items-center justify-center text-center">
                                <FiHome className="text-gray-400 mb-2" />
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Layout</p>
                                <p className="font-bold text-gray-900">{selectedProperty.bedrooms} BR • {selectedProperty.bathrooms} BA</p>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col items-center justify-center text-center">
                                <FiHome className="text-gray-400 mb-2" />
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Area</p>
                                <p className="font-bold text-gray-900">{selectedProperty.area_sqft} Sq. Ft.</p>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col items-center justify-center text-center">
                                <FiUsers className="text-gray-400 mb-2" />
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Owner</p>
                                <p className="font-bold text-gray-900">{selectedProperty.owner_name}</p>
                            </div>
                        </div>

                        {/* Utilities & Config */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <h3 className="text-sm font-black uppercase tracking-widest text-gray-900">Utilities Billing</h3>
                                <div className="space-y-2">
                                    <div className="flex justify-between p-3 bg-yellow-50/50 rounded-xl border border-yellow-100">
                                        <span className="text-sm font-bold text-yellow-800">Electricity</span>
                                        <span className="text-sm font-black text-yellow-900">Rs. {selectedProperty.electricity_rate || 0} / Unit</span>
                                    </div>
                                    <div className="flex justify-between p-3 bg-blue-50/50 rounded-xl border border-blue-100">
                                        <span className="text-sm font-bold text-blue-800">Water</span>
                                        <span className="text-sm font-black text-blue-900">Rs. {selectedProperty.water_charge || 0} / Month</span>
                                    </div>
                                    <div className="flex justify-between p-3 bg-green-50/50 rounded-xl border border-green-100">
                                        <span className="text-sm font-bold text-green-800">Garbage</span>
                                        <span className="text-sm font-black text-green-900">Rs. {selectedProperty.garbage_charge || 0} / Month</span>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-sm font-black uppercase tracking-widest text-gray-900">House Rules</h3>
                                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 text-sm text-gray-600 italic">
                                    "{selectedProperty.house_rules || 'No specific rules provided.'}"
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        {selectedProperty.admin_approval_status === 'pending' && (
                            <div className="flex gap-4 pt-6 border-t border-gray-100">
                                <button
                                    onClick={() => {
                                        handleApproveProperty(selectedProperty.property_id);
                                        setSelectedProperty(null);
                                    }}
                                    className="flex-1 bg-green-600 text-white p-4 rounded-2xl font-black hover:bg-green-700 transition-all shadow-lg shadow-green-100 flex items-center justify-center gap-2"
                                >
                                    <FiCheck /> Approve Listing
                                </button>
                                <button
                                    onClick={() => {
                                        handleRejectProperty(selectedProperty.property_id);
                                        setSelectedProperty(null);
                                    }}
                                    className="flex-1 bg-red-600 text-white p-4 rounded-2xl font-black hover:bg-red-700 transition-all shadow-lg shadow-red-100 flex items-center justify-center gap-2"
                                >
                                    <FiX /> Reject Listing
                                </button>
                            </div>
                        )}
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default AdminDashboard;
