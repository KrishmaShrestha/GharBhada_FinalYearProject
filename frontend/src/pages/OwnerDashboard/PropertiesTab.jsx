import React from 'react';
import { FiHome, FiSearch, FiPlus, FiSettings, FiTrash2, FiExternalLink } from 'react-icons/fi';
import Badge from '../../components/common/Badge';
import { getAssetUrl } from '../../utils/urlHelper';

const PropertiesTab = ({ properties, searchTerm, setSearchTerm, onAddProperty, onEditProperty, onDeleteProperty, IMG_BASE_URL }) => {

    const propertyMatchesSearch = (p) => {
        const search = searchTerm.toLowerCase();
        return p.title?.toLowerCase().includes(search) ||
            p.address?.toLowerCase().includes(search) ||
            p.city?.toLowerCase().includes(search);
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">My Properties</h2>
                    <p className="text-sm text-gray-500">Manage and track your property listings</p>
                </div>
                <button
                    onClick={onAddProperty}
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
                        <button onClick={onAddProperty} className="bg-primary-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-primary-700 transition-all shadow-primary w-full">List Your First Property</button>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {properties.filter(propertyMatchesSearch).map((property) => (
                        <div key={property.property_id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-all group">
                            <div className="h-48 bg-gray-100 relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-10" />
                                <img
                                    src={getAssetUrl(property.images?.[0])}
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
                                                onEditProperty(property);
                                            }}
                                            className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
                                            title="Edit Property"
                                        >
                                            <FiSettings />
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onDeleteProperty(property.property_id);
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
        </div>
    );
};

export default PropertiesTab;
