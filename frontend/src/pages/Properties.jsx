import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as tenantService from '../services/tenantService';
import TenantPropertyCard from '../components/common/TenantPropertyCard';
import { SkeletonCard } from '../components/common/Skeleton';
import { FiSearch, FiFilter, FiX, FiInfo } from 'react-icons/fi';
import toast, { Toaster } from 'react-hot-toast';

const Properties = () => {
    const navigate = useNavigate();
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        city: '',
        property_type: '',
        min_price: '',
        max_price: '',
        bedrooms: ''
    });
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        fetchProperties();
    }, [filters]);

    const fetchProperties = async () => {
        setLoading(true);
        try {
            // Remove empty filters
            const activeFilters = Object.fromEntries(
                Object.entries(filters).filter(([_, v]) => v !== '')
            );
            const data = await tenantService.searchProperties(activeFilters);
            setProperties(data.properties || []);
        } catch (err) {
            console.error('Error fetching properties:', err);
            toast.error('Failed to load properties');
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const clearFilters = () => {
        setFilters({
            city: '',
            property_type: '',
            min_price: '',
            max_price: '',
            bedrooms: ''
        });
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] pb-20">
            <Toaster position="top-right" />

            {/* Header / Hero Section */}
            <div className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-6 py-12">
                    <h1 className="text-4xl font-black text-gray-900 mb-2">Find Your Perfect Home</h1>
                    <p className="text-gray-500 text-lg">Browse through verified properties in your preferred locations.</p>

                    {/* Search Bar & Filter Toggle */}
                    <div className="mt-8 flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                name="city"
                                value={filters.city}
                                onChange={handleFilterChange}
                                placeholder="Search by city (e.g. Kathmandu, Lalitpur)..."
                                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all font-medium"
                            />
                        </div>
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-bold transition-all border ${showFilters ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                                }`}
                        >
                            <FiFilter /> Filters {Object.values(filters).filter(v => v !== '').length > 0 && <span className="w-5 h-5 bg-white text-primary-600 rounded-full text-[10px] flex items-center justify-center border border-primary-200">{Object.values(filters).filter(v => v !== '').length}</span>}
                        </button>
                    </div>

                    {/* Expandable Filters */}
                    {showFilters && (
                        <div className="mt-6 p-6 bg-gray-50 rounded-2xl border border-gray-100 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in slide-in-from-top duration-300">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Property Type</label>
                                <select
                                    name="property_type"
                                    value={filters.property_type}
                                    onChange={handleFilterChange}
                                    className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none font-medium"
                                >
                                    <option value="">All Types</option>
                                    <option value="Apartment">Apartment</option>
                                    <option value="House">House</option>
                                    <option value="Room">Single Room</option>
                                    <option value="Hostel">Hostel</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Min Price (NPR)</label>
                                <input
                                    type="number"
                                    name="min_price"
                                    value={filters.min_price}
                                    onChange={handleFilterChange}
                                    placeholder="5000"
                                    className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none font-medium"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Max Price (NPR)</label>
                                <input
                                    type="number"
                                    name="max_price"
                                    value={filters.max_price}
                                    onChange={handleFilterChange}
                                    placeholder="50000"
                                    className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none font-medium"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Bedrooms</label>
                                <select
                                    name="bedrooms"
                                    value={filters.bedrooms}
                                    onChange={handleFilterChange}
                                    className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none font-medium"
                                >
                                    <option value="">Any</option>
                                    <option value="1">1 BHK</option>
                                    <option value="2">2 BHK</option>
                                    <option value="3">3+ BHK</option>
                                </select>
                            </div>
                            <div className="lg:col-span-4 flex justify-end gap-3 mt-2">
                                <button
                                    onClick={clearFilters}
                                    className="px-4 py-2 text-sm font-bold text-gray-500 hover:text-red-500 flex items-center gap-1 transition-colors"
                                >
                                    <FiX /> Reset Filters
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Content Section */}
            <main className="max-w-7xl mx-auto px-6 py-12">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-xl font-bold text-gray-900">
                        {loading ? 'Finding properties...' : `${properties.length} Properties Available`}
                    </h2>
                    <div className="flex gap-2">
                        {/* Sort options could go here */}
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <SkeletonCard key={i} />
                        ))}
                    </div>
                ) : properties.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {properties.map(property => (
                            <TenantPropertyCard
                                key={property.property_id}
                                property={property}
                                onClick={() => navigate(`/properties/${property.property_id}`)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-24 bg-white rounded-[2rem] border border-dashed border-gray-200">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-50 text-gray-300 mb-6">
                            <FiInfo size={40} />
                        </div>
                        <h3 className="text-2xl font-black text-gray-900 mb-2">No Properties Found</h3>
                        <p className="text-gray-500 mb-8 max-w-xs mx-auto">We couldn't find any properties matching your current filters. Try adjusting your search criteria.</p>
                        <button
                            onClick={clearFilters}
                            className="px-8 py-3 bg-primary-600 text-white rounded-2xl font-black hover:bg-primary-700 transition-all shadow-lg shadow-primary-200"
                        >
                            Reset All Filters
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Properties;
