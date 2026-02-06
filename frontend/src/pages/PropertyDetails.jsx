import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import * as tenantService from '../services/tenantService';
import toast, { Toaster } from 'react-hot-toast';
import {
    FiHome, FiMapPin, FiCalendar, FiZap, FiDroplet, FiTrash2,
    FiShield, FiArrowLeft, FiHeart, FiShare2, FiInfo, FiCheck,
    FiUser, FiActivity, FiClock, FiPlus
} from 'react-icons/fi';
import Badge from '../components/common/Badge';
import BookingModal from '../components/common/BookingModal';

const IMG_BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5001';

const PropertyDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [property, setProperty] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeImage, setActiveImage] = useState(0);
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

    useEffect(() => {
        fetchProperty();
    }, [id]);

    const fetchProperty = async () => {
        setLoading(true);
        try {
            const data = await tenantService.getPropertyDetails(id);
            setProperty(data.property);
        } catch (err) {
            console.error('Error fetching property:', err);
            toast.error('Failed to load property details');
        } finally {
            setLoading(false);
        }
    };

    const handleBookingSubmit = async (bookingData) => {
        try {
            await tenantService.submitBookingRequest({
                property_id: id,
                ...bookingData,
                start_date: bookingData.move_in_date,
                notes: bookingData.message
            });
            toast.success('Booking request sent successfully!');
            setIsBookingModalOpen(false);
            setTimeout(() => navigate('/tenant/dashboard'), 2000);
        } catch (err) {
            toast.error(err.message || 'Failed to submit booking');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (!property) {
        return (
            <div className="min-h-screen bg-gray-50 p-8 text-center">
                <p className="text-gray-500">Property not found.</p>
                <button onClick={() => navigate(-1)} className="mt-4 text-primary-600 font-bold underline">Go Back</button>
            </div>
        );
    }

    const isTrusted = property.is_trusted_owner === 1 || property.is_trusted_owner === true;

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            <Toaster position="top-right" />

            {/* Top Navigation */}
            <div className="bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-xl transition-all flex items-center gap-2 text-gray-600 font-bold">
                        <FiArrowLeft /> Back
                    </button>
                    <div className="flex gap-2">
                        <button className="p-2 hover:bg-gray-100 rounded-xl transition-all text-gray-400 group">
                            <FiHeart className="group-hover:text-red-500 transition-colors" />
                        </button>
                        <button className="p-2 hover:bg-gray-100 rounded-xl transition-all text-gray-400">
                            <FiShare2 />
                        </button>
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-6 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Left Column: Images & Primary Info */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Gallery */}
                        <div className="space-y-4">
                            <div className="aspect-[16/9] w-full rounded-[2rem] overflow-hidden bg-gray-200 border border-gray-100 shadow-xl shadow-gray-200/50">
                                <img
                                    src={property.images?.[activeImage] ?
                                        (property.images[activeImage].startsWith('http') ? property.images[activeImage] : `${IMG_BASE_URL}/${property.images[activeImage].replace(/\\/g, '/')}`) :
                                        'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'}
                                    alt={property.title}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
                                {(property.images || [null, null, null]).map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setActiveImage(idx)}
                                        className={`w-24 h-24 rounded-2xl overflow-hidden border-4 transition-all flex-shrink-0 ${activeImage === idx ? 'border-primary-500 scale-95' : 'border-transparent'
                                            }`}
                                    >
                                        <img
                                            src={img ? (img.startsWith('http') ? img : `${IMG_BASE_URL}/${img.replace(/\\/g, '/')}`) : 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'}
                                            className="w-full h-full object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Title & Stats */}
                        <div>
                            <div className="flex items-center gap-3 mb-3">
                                <Badge variant="primary" size="lg">{property.property_type}</Badge>
                                <div className="flex items-center gap-1 text-xs font-bold text-gray-400 uppercase tracking-widest">
                                    <FiActivity /> Property ID: {property.property_id}
                                </div>
                            </div>
                            <h1 className="text-4xl font-black text-gray-900 leading-tight mb-2">{property.title}</h1>
                            <p className="text-lg text-gray-500 flex items-center gap-2"><FiMapPin /> {property.address}, {property.city}</p>
                        </div>

                        {/* Description */}
                        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">Description</h3>
                            <p className="text-gray-600 leading-relaxed text-lg">
                                {property.description || "This beautiful property offers a comfortable living experience with modern amenities and a peaceful neighborhood. Perfect for professionals and families looking for their next home."}
                            </p>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8 pt-8 border-t border-gray-50">
                                <div className="text-center md:text-left">
                                    <p className="text-xs text-gray-400 font-bold uppercase mb-1">Bedrooms</p>
                                    <p className="text-xl font-black text-gray-900">{property.bedrooms || '2'} <span className="text-sm font-bold text-gray-400">BHK</span></p>
                                </div>
                                <div className="text-center md:text-left">
                                    <p className="text-xs text-gray-400 font-bold uppercase mb-1">Bathrooms</p>
                                    <p className="text-xl font-black text-gray-900">{property.bathrooms || '1'}</p>
                                </div>
                                <div className="text-center md:text-left">
                                    <p className="text-xs text-gray-400 font-bold uppercase mb-1">Kitchen</p>
                                    <p className="text-xl font-black text-gray-900">{property.has_kitchen ? 'Separate' : 'Attached'}</p>
                                </div>
                                <div className="text-center md:text-left">
                                    <p className="text-xs text-gray-400 font-bold uppercase mb-1">Parking</p>
                                    <p className="text-xl font-black text-gray-900">{property.has_parking ? 'Available' : 'No'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Rules & Utilities */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                    <FiCheck className="text-green-500" /> House Rules
                                </h3>
                                <div className="space-y-4">
                                    {(property.house_rules?.split(',') || ['No late night noise', 'No pets', 'Cleanliness maintained', 'Visitor Policy']).map((rule, idx) => (
                                        <div key={idx} className="flex gap-4 items-center">
                                            <div className="w-2 h-2 rounded-full bg-primary-500"></div>
                                            <span className="text-gray-600 font-medium">{rule.trim()}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                    <FiZap className="text-primary-500" /> Utility Billing
                                </h3>
                                <div className="space-y-6">
                                    <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-yellow-50 text-yellow-600 rounded-xl"><FiZap /></div>
                                            <span className="text-sm font-bold text-gray-700">Electricity</span>
                                        </div>
                                        <span className="font-black text-gray-900">Rs. {property.electricity_rate || '12'}/unit</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl"><FiDroplet /></div>
                                            <span className="text-sm font-bold text-gray-700">Water Bill</span>
                                        </div>
                                        <span className="font-black text-gray-900">Rs. {property.water_charge || '500'}/mo</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-green-50 text-green-600 rounded-xl"><FiTrash2 /></div>
                                            <span className="text-sm font-bold text-gray-700">Garbage</span>
                                        </div>
                                        <span className="font-black text-gray-900">Rs. {property.garbage_charge || '200'}/mo</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Pricing & Booking Sidebar */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="sticky top-28 space-y-6">
                            {/* Booking Card */}
                            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-2xl shadow-primary-200/20 overflow-hidden relative">
                                <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary-50 rounded-full opacity-50 blur-3xl"></div>

                                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-2">Monthly Rent</p>
                                <div className="flex items-end gap-1 mb-6">
                                    <h2 className="text-4xl font-black text-gray-900">Rs. {property.price_per_month?.toLocaleString()}</h2>
                                    <span className="text-gray-400 font-bold mb-1">/month</span>
                                </div>

                                <div className="space-y-4 mb-8">
                                    <div className="flex justify-between items-center bg-gray-50 p-4 rounded-2xl">
                                        <span className="text-sm text-gray-500 font-medium">Security Deposit</span>
                                        <span className="font-black text-gray-900">Rs. {property.security_deposit?.toLocaleString() || '5,000+'}</span>
                                    </div>
                                    <div className="flex justify-between items-center p-4">
                                        <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                                            <FiClock /> Min. Duration
                                        </div>
                                        <span className="font-black text-gray-900">{property.lease_duration_min || '1'} {property.lease_duration_min === 1 ? 'Year' : 'Years'}</span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => {
                                        if (user?.is_verified === 0) {
                                            toast.error('Your account is pending verification. Please wait.');
                                        } else {
                                            setIsBookingModalOpen(true);
                                        }
                                    }}
                                    className="w-full py-5 bg-primary-600 text-white rounded-3xl font-black text-lg hover:bg-primary-700 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-primary-200 flex items-center justify-center gap-3"
                                >
                                    Book Now <FiPlus size={22} />
                                </button>

                                <p className="text-[10px] text-gray-400 text-center mt-4 font-bold uppercase tracking-wider">No hidden charges • Secure digital payment</p>
                            </div>

                            {/* Owner Trust Card */}
                            <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-4">
                                <div className="w-16 h-16 rounded-2xl bg-primary-50 border-2 border-primary-200 flex items-center justify-center text-primary-600 text-2xl font-black">
                                    {property.owner_name?.charAt(0) || 'O'}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-bold text-gray-900">{property.owner_name || 'Property Owner'}</h4>
                                        {isTrusted && <FiShield size={14} className="text-yellow-500" />}
                                    </div>
                                    <p className="text-xs text-gray-500 mb-1">Member since {property.owner_since ? new Date(property.owner_since).getFullYear() : '2024'}</p>
                                    <Badge variant={isTrusted ? 'warning' : 'default'} size="sm">
                                        {isTrusted ? 'TRUSTED OWNER' : 'REGULAR OWNER'}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <BookingModal
                isOpen={isBookingModalOpen}
                onClose={() => setIsBookingModalOpen(false)}
                property={property}
                onSubmit={handleBookingSubmit}
            />
        </div>
    );
};

export default PropertyDetails;
