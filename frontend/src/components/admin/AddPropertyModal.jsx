import { useState, useEffect } from 'react';
import { FiPlus, FiX, FiCheck, FiUpload, FiHome, FiDollarSign, FiZap, FiActivity, FiAlertCircle } from 'react-icons/fi';
import Modal from '../common/Modal';
import Badge from '../common/Badge';
import toast from 'react-hot-toast';

const AddPropertyModal = ({ isOpen, onClose, onAdd, property = null }) => {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        property_type: 'apartment',
        address: '',
        city: '',
        price_per_month: '',
        security_deposit: '',
        lease_duration_min: 1,
        lease_duration_max: 5,
        bedrooms: 0,
        bathrooms: 0,
        area_sqft: '',
        has_kitchen: true,
        has_parking: false,
        electricity_rate: '',
        water_charge: '',
        garbage_charge: '',
        house_rules: '',
        amenities: []
    });
    const [images, setImages] = useState([]);

    useEffect(() => {
        if (property) {
            setFormData({
                title: property.title || '',
                description: property.description || '',
                property_type: property.property_type || 'apartment',
                address: property.address || '',
                city: property.city || '',
                price_per_month: property.price_per_month || '',
                security_deposit: property.security_deposit || '',
                lease_duration_min: property.lease_duration_min || 1,
                lease_duration_max: property.lease_duration_max || 5,
                bedrooms: property.bedrooms || 0,
                bathrooms: property.bathrooms || 0,
                area_sqft: property.area_sqft || '',
                has_kitchen: !!property.has_kitchen,
                has_parking: !!property.has_parking,
                electricity_rate: property.electricity_rate || '',
                water_charge: property.water_charge || '',
                garbage_charge: property.garbage_charge || '',
                house_rules: property.house_rules || '',
                amenities: property.amenities || []
            });
        } else {
            setFormData({
                title: '',
                description: '',
                property_type: 'apartment',
                address: '',
                city: '',
                price_per_month: '',
                security_deposit: '',
                lease_duration_min: 1,
                lease_duration_max: 5,
                bedrooms: 0,
                bathrooms: 0,
                area_sqft: '',
                has_kitchen: true,
                has_parking: false,
                electricity_rate: '',
                water_charge: '',
                garbage_charge: '',
                house_rules: '',
                amenities: []
            });
        }
    }, [property, isOpen]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleImageChange = (e) => {
        if (e.target.files) {
            setImages(Array.from(e.target.files));
        }
    };

    const nextStep = (e) => {
        if (e) e.preventDefault();
        if (step < 5) {
            setStep(prev => prev + 1);
            const modalBody = document.querySelector('.modal-body');
            if (modalBody) modalBody.scrollTop = 0;
        }
    };

    const prevStep = (e) => {
        if (e) e.preventDefault();
        if (step > 1) {
            setStep(prev => prev - 1);
            const modalBody = document.querySelector('.modal-body');
            if (modalBody) modalBody.scrollTop = 0;
        }
    };

    const goToStep = (s) => {
        if (s >= 1 && s <= 5) {
            setStep(s);
            const modalBody = document.querySelector('.modal-body');
            if (modalBody) modalBody.scrollTop = 0;
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && step < 5) {
            e.preventDefault();
            nextStep();
        }
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        if (step < 5) {
            nextStep();
            return;
        }

        setLoading(true);
        try {
            await onAdd(formData, images);
            setStep(1);
            onClose();
        } catch (error) {
            console.error('Error adding property:', error);
            toast.error(error.message || 'Failed to submit listing');
        } finally {
            setLoading(false);
        }
    };

    const steps = [
        { id: 1, title: 'Basic Info', icon: FiHome },
        { id: 2, title: 'Details & Amenities', icon: FiActivity },
        { id: 3, title: 'Pricing & Rules', icon: FiDollarSign },
        { id: 4, title: 'Utilities', icon: FiZap },
        { id: 5, title: 'Photos', icon: FiUpload },
    ];

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={property ? "Edit Property Listing" : "List New Property"}
            size="lg"
            footer={
                <div className="flex justify-between w-full shadow-sm">
                    {step > 1 ? (
                        <button
                            type="button"
                            onClick={prevStep}
                            className="px-6 py-2.5 bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl font-bold transition-all"
                        >
                            Back
                        </button>
                    ) : (
                        <div />
                    )}
                    {step < 5 ? (
                        <button
                            type="button"
                            onClick={nextStep}
                            className="px-8 py-2.5 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-all shadow-lg shadow-primary-100 flex items-center gap-2"
                        >
                            Next Step <FiPlus size={16} />
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={loading}
                            className={`px-8 py-2.5 bg-green-600 text-white rounded-xl font-bold shadow-lg shadow-green-100 hover:bg-green-700 flex items-center gap-2 transition-all ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {loading ? 'Submitting...' : <><FiCheck /> Submit Listing</>}
                        </button>
                    )}
                </div>
            }
        >
            <div className="mb-10 px-2">
                <div className="flex items-center justify-between relative">
                    {steps.map((s, idx) => (
                        <div
                            key={s.id}
                            className="flex flex-col items-center relative z-10 cursor-pointer group"
                            onClick={() => goToStep(s.id)}
                        >
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 border-2 ${step >= s.id
                                ? 'bg-primary-600 text-white border-primary-600 shadow-lg shadow-primary-100'
                                : 'bg-white text-gray-300 border-gray-100 group-hover:border-primary-200'
                                }`}>
                                <s.icon size={20} />
                            </div>
                            <p className={`text-[10px] mt-2 font-black uppercase tracking-widest ${step >= s.id ? 'text-primary-600' : 'text-gray-300'
                                }`}>{s.title}</p>
                        </div>
                    ))}
                    <div className="absolute top-6 left-0 w-full h-1 bg-gray-50 -z-0 rounded-full">
                        <div
                            className="h-full bg-primary-600 transition-all duration-500 rounded-full"
                            style={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }}
                        />
                    </div>
                </div>
            </div>

            <form onKeyDown={handleKeyDown} onSubmit={handleSubmit} className="space-y-6 modal-body">
                {step === 1 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fadeIn">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-bold text-gray-700 mb-1">Property Title</label>
                            <input
                                type="text" name="title" value={formData.title} onChange={handleChange} required
                                placeholder="e.g. Spacious 2BHK Apartment in Baluwatar"
                                className="w-full border-gray-200 rounded-xl focus:ring-primary-500 focus:border-primary-500"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-bold text-gray-700 mb-1">Full Address</label>
                            <input
                                type="text" name="address" value={formData.address} onChange={handleChange} required
                                placeholder="Street, Neighborhood"
                                className="w-full border-gray-200 rounded-xl focus:ring-primary-500 focus:border-primary-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">City</label>
                            <input
                                type="text" name="city" value={formData.city} onChange={handleChange} required
                                placeholder="e.g. Kathmandu"
                                className="w-full border-gray-200 rounded-xl focus:ring-primary-500 focus:border-primary-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Property Type</label>
                            <select
                                name="property_type" value={formData.property_type} onChange={handleChange}
                                className="w-full border-gray-200 rounded-xl focus:ring-primary-500 focus:border-primary-500"
                            >
                                <option value="apartment">Apartment</option>
                                <option value="house">House</option>
                                <option value="room">Room</option>
                                <option value="1BHK">1BHK</option>
                                <option value="2BHK">2BHK</option>
                                <option value="3BHK">3BHK</option>
                                <option value="commercial">Commercial</option>
                            </select>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fadeIn">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Bedrooms</label>
                            <input
                                type="number" name="bedrooms" value={formData.bedrooms} onChange={handleChange}
                                className="w-full border-gray-200 rounded-xl"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Bathrooms</label>
                            <input
                                type="number" name="bathrooms" value={formData.bathrooms} onChange={handleChange}
                                className="w-full border-gray-200 rounded-xl"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Area (sq. ft.)</label>
                            <input
                                type="number" name="area_sqft" value={formData.area_sqft} onChange={handleChange}
                                placeholder="e.g. 1200"
                                className="w-full border-gray-200 rounded-xl"
                            />
                        </div>
                        <div className="flex items-center gap-4 p-4 border border-gray-100 rounded-xl bg-gray-50/50">
                            <input
                                type="checkbox" name="has_kitchen" checked={formData.has_kitchen} onChange={handleChange}
                                className="w-5 h-5 text-primary-600 rounded"
                            />
                            <label className="text-sm font-bold text-gray-700">Separate Kitchen</label>
                        </div>
                        <div className="flex items-center gap-4 p-4 border border-gray-100 rounded-xl bg-gray-50/50">
                            <input
                                type="checkbox" name="has_parking" checked={formData.has_parking} onChange={handleChange}
                                className="w-5 h-5 text-primary-600 rounded"
                            />
                            <label className="text-sm font-bold text-gray-700">Parking Space</label>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
                            <textarea
                                name="description" value={formData.description} onChange={handleChange}
                                rows="3" className="w-full border-gray-200 rounded-xl"
                                placeholder="Describe the environment, nearby landmarks..."
                            ></textarea>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fadeIn">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Monthly Rent (NPR)</label>
                            <input
                                type="number" name="price_per_month" value={formData.price_per_month} onChange={handleChange} required
                                className="w-full border-gray-200 rounded-xl"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Security Deposit (NPR)</label>
                            <input
                                type="number" name="security_deposit" value={formData.security_deposit} onChange={handleChange} required
                                placeholder="Default min: Rs. 5000"
                                className="w-full border-gray-200 rounded-xl"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-bold text-gray-700 mb-1">Lease Duration (Years)</label>
                            <div className="flex items-center gap-4">
                                <label className="text-xs text-gray-500">Min:</label>
                                <input type="number" name="lease_duration_min" value={formData.lease_duration_min} onChange={handleChange} className="w-20 border-gray-200 rounded-xl" />
                                <label className="text-xs text-gray-500">Max:</label>
                                <input type="number" name="lease_duration_max" value={formData.lease_duration_max} onChange={handleChange} className="w-20 border-gray-200 rounded-xl" />
                            </div>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-bold text-gray-700 mb-1">House Rules</label>
                            <textarea
                                name="house_rules" value={formData.house_rules} onChange={handleChange}
                                rows="3" className="w-full border-gray-200 rounded-xl"
                                placeholder="e.g. No noise after 10 PM, No pets allowed..."
                            ></textarea>
                        </div>
                    </div>
                )}

                {step === 4 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fadeIn">
                        <div className="md:col-span-2 p-4 bg-yellow-50 rounded-xl border border-yellow-100 flex gap-3 text-sm text-yellow-800 mb-2">
                            <FiAlertCircle className="flex-shrink-0 mt-1" />
                            <p>Define utility billing clearly. Electricity is usually per unit consumed, while water and garbage are fixed monthly charges.</p>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Electricity (Per Unit)</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">Rs.</span>
                                <input
                                    type="number" name="electricity_rate" value={formData.electricity_rate} onChange={handleChange}
                                    className="w-full pl-10 border-gray-200 rounded-xl"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Water (Monthly Fixed)</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">Rs.</span>
                                <input
                                    type="number" name="water_charge" value={formData.water_charge} onChange={handleChange}
                                    className="w-full pl-10 border-gray-200 rounded-xl"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Garbage (Monthly Fixed)</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">Rs.</span>
                                <input
                                    type="number" name="garbage_charge" value={formData.garbage_charge} onChange={handleChange}
                                    className="w-full pl-10 border-gray-200 rounded-xl"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {step === 5 && (
                    <div className="space-y-4 animate-fadeIn">
                        <label className="block text-sm font-bold text-gray-700 mb-1">Property Photos</label>
                        <div className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center hover:border-primary-500 transition-colors cursor-pointer relative">
                            <input
                                type="file" multiple onChange={handleImageChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            <FiUpload className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                            <p className="text-sm font-semibold text-gray-900">Click or drag images to upload</p>
                            <p className="text-xs text-gray-400 mt-1">Upload multiple photos for better response</p>
                        </div>
                        {images.length > 0 && (
                            <div className="grid grid-cols-4 gap-2">
                                {images.map((img, idx) => (
                                    <div key={idx} className="h-20 bg-gray-100 rounded-lg relative overflow-hidden">
                                        <img src={URL.createObjectURL(img)} alt="preview" className="w-full h-full object-cover" />
                                        <button
                                            onClick={() => setImages(prev => prev.filter((_, i) => i !== idx))}
                                            className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-0.5"
                                        >
                                            <FiX size={12} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </form>
        </Modal>
    );
};

export default AddPropertyModal;
