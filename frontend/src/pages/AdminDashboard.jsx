import { useState, useEffect } from 'react';
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

    const fetchDashboardData = async () => {
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
        } catch (err) {
            toast.error(err.message || 'Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const fetchAllUsers = async () => {
        try {
            const data = await adminService.getAllUsers({ page: 1, limit: 100 });
            setAllUsers(data.users || []);
        } catch (err) {
            toast.error(err.message);
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

    const filteredUsers = allUsers.filter(u => {
        const matchesSearch = u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.email?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = filterRole === 'all' || u.role === filterRole;
        const matchesStatus = filterStatus === 'all' ||
            (filterStatus === 'active' && u.is_active) ||
            (filterStatus === 'suspended' && !u.is_active);
        return matchesSearch && matchesRole && matchesStatus;
    });

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
            <div className="bg-white shadow-sm border-b sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                Admin Dashboard
                            </h1>
                            <p className="text-gray-600 mt-1">Welcome back, {user?.full_name}</p>
                        </div>
                        <button
                            onClick={fetchDashboardData}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <FiRefreshCw className="w-4 h-4" />
                            Refresh
                        </button>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white border-b sticky top-[73px] z-10">
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
                    <div className="space-y-6">
                        {/* Search and Filters */}
                        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="md:col-span-2">
                                    <div className="relative">
                                        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Search users..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>
                                <select
                                    value={filterRole}
                                    onChange={(e) => setFilterRole(e.target.value)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="all">All Roles</option>
                                    <option value="owner">Owners</option>
                                    <option value="tenant">Tenants</option>
                                </select>
                                <select
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="all">All Status</option>
                                    <option value="active">Active</option>
                                    <option value="suspended">Suspended</option>
                                </select>
                            </div>
                        </div>

                        {/* Users Table */}
                        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {filteredUsers.map((u) => (
                                            <tr key={u.user_id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="font-medium text-gray-900">{u.full_name}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{u.email}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <Badge variant={u.role === 'owner' ? 'primary' : 'success'}>
                                                        {u.role}
                                                    </Badge>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <Badge variant={u.is_active ? 'success' : 'danger'}>
                                                        {u.is_active ? 'Active' : 'Suspended'}
                                                    </Badge>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => setSelectedUser(u)}
                                                            className="text-blue-600 hover:text-blue-900"
                                                            title="View Details"
                                                        >
                                                            <FiEye className="w-4 h-4" />
                                                        </button>
                                                        {u.is_active ? (
                                                            <button
                                                                onClick={() => handleSuspendUser(u.user_id)}
                                                                className="text-red-600 hover:text-red-900"
                                                                title="Suspend"
                                                            >
                                                                Suspend
                                                            </button>
                                                        ) : (
                                                            <button
                                                                onClick={() => adminService.activateUser(u.user_id).then(fetchAllUsers)}
                                                                className="text-green-600 hover:text-green-900"
                                                                title="Activate"
                                                            >
                                                                Activate
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
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
                                    title="Refresh List"
                                >
                                    <FiRefreshCw className="w-5 h-5" />
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
                    title="User Details"
                    size="lg"
                >
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                            <div className="col-span-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 block">Full Name</label>
                                <p className="text-gray-900 font-bold">{selectedUser.full_name}</p>
                            </div>
                            <div className="col-span-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 block">Email</label>
                                <p className="text-gray-900 font-bold">{selectedUser.email}</p>
                            </div>
                            <div className="col-span-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 block">Phone</label>
                                <p className="text-gray-900 font-bold">{selectedUser.phone || 'N/A'}</p>
                            </div>
                            <div className="col-span-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 block">Role</label>
                                <p><Badge variant={selectedUser.role === 'owner' ? 'primary' : 'success'}>{selectedUser.role}</Badge></p>
                            </div>
                            <div className="col-span-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 block">Status</label>
                                <p><Badge variant={selectedUser.is_active ? 'success' : 'danger'}>
                                    {selectedUser.is_active ? 'Active' : 'Suspended'}
                                </Badge></p>
                            </div>
                            <div className="col-span-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 block">Joined</label>
                                <p className="text-gray-900 font-bold">{selectedUser.created_at ? format(new Date(selectedUser.created_at), 'PPP') : 'N/A'}</p>
                            </div>
                        </div>

                        <div className="h-px bg-gray-100 w-full" />

                        <div className="space-y-4">
                            <h3 className="text-sm font-black uppercase tracking-widest text-gray-900">Verification & Identification</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                    <label className="text-[10px] font-black tracking-widest text-gray-400 mb-1 block uppercase">Citizenship / ID Number</label>
                                    <p className="font-bold text-gray-900">{selectedUser.citizenship_number || 'Not provided'}</p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                    <label className="text-[10px] font-black tracking-widest text-gray-400 mb-1 block uppercase">Permanent Address</label>
                                    <p className="font-bold text-gray-900">{selectedUser.permanent_address || 'Not provided'}</p>
                                </div>
                            </div>
                        </div>

                        {selectedUser.role === 'owner' && (
                            <div className="space-y-4">
                                <h3 className="text-sm font-black uppercase tracking-widest text-gray-900">Bank Details</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100/50">
                                        <label className="text-[10px] font-black tracking-widest text-blue-400 mb-1 block uppercase">Bank Name</label>
                                        <p className="font-bold text-blue-900">{selectedUser.bank_name || 'Not provided'}</p>
                                    </div>
                                    <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100/50">
                                        <label className="text-[10px] font-black tracking-widest text-blue-400 mb-1 block uppercase">Account Number</label>
                                        <p className="font-bold text-blue-900">{selectedUser.bank_account_number || 'Not provided'}</p>
                                    </div>
                                </div>
                            </div>
                        )}
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
