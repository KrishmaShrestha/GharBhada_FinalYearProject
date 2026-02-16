import { FiHome, FiMapPin, FiCalendar, FiZap, FiDroplet, FiTrash2, FiShield, FiExternalLink } from 'react-icons/fi';
import Badge from './Badge';
import { getAssetUrl } from '../../utils/urlHelper';

const TenantPropertyCard = ({ property, onClick }) => {
    // Determine if owner is trusted (in real app, this would come from the property object or owner association)
    const isOwnerTrusted = property.is_trusted_owner === 1 || property.is_trusted_owner === true;

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-lg transition-all group flex flex-col h-full cursor-pointer" onClick={onClick}>
            {/* Image Section */}
            <div className="h-52 relative overflow-hidden">
                <img
                    src={getAssetUrl(property.images?.[0])}
                    alt={property.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                    <Badge variant="primary" size="sm">{property.property_type?.toUpperCase()}</Badge>
                    {isOwnerTrusted && (
                        <div className="bg-yellow-400 text-yellow-900 text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-sm border border-yellow-500">
                            <FiShield size={10} /> TRUSTED OWNER
                        </div>
                    )}
                </div>
                <div className="absolute bottom-4 left-4 z-10">
                    <p className="bg-black/60 backdrop-blur-sm text-white px-3 py-1 rounded-lg text-sm font-bold border border-white/20">
                        NPR {property.price_per_month?.toLocaleString()}<span className="text-[10px] font-normal opacity-80">/mo</span>
                    </p>
                </div>
            </div>

            {/* Content Section */}
            <div className="p-5 flex-1 flex flex-col">
                <div className="mb-4">
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-1">{property.title}</h3>
                    <p className="text-gray-500 text-sm flex items-center gap-1 mt-1">
                        <FiMapPin className="flex-shrink-0" /> {property.city}, {property.district || 'Nepal'}
                    </p>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 p-2 rounded-xl">
                        <FiHome className="text-primary-500" />
                        <span>{property.bedrooms || 0} Beds</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 p-2 rounded-xl">
                        <FiZap className="text-blue-500" />
                        <span>Fixed Utils</span>
                    </div>
                </div>

                <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold border-2 border-white shadow-sm">
                            {property.owner_name?.charAt(0) || 'O'}
                        </div>
                        <span className="text-xs font-semibold text-gray-700">{property.owner_name || 'Owner'}</span>
                    </div>
                    <button className="text-primary-600 font-bold text-xs flex items-center gap-1 group-hover:underline">
                        Details <FiExternalLink />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TenantPropertyCard;
