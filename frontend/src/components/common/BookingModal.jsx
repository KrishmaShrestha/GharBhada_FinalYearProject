import { useState } from 'react';
import { FiUser, FiPhone, FiMapPin, FiCreditCard, FiCheck, FiX, FiArrowRight, FiArrowLeft } from 'react-icons/fi';
import Modal from '../common/Modal';
import Badge from '../common/Badge';

const BookingModal = ({ isOpen, onClose, property, onSubmit }) => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        full_name: '',
        phone: '',
        address: '',
        citizen_number: '',
        move_in_date: '',
        message: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleNext = () => setStep(step + 1);
    const handleBack = () => setStep(step - 1);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    const steps = [
        { id: 1, title: 'Personal Info', icon: FiUser },
        { id: 2, title: 'Verification', icon: FiCreditCard },
        { id: 3, title: 'Confirm', icon: FiCheck },
    ];

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Book Your New Home"
            size="md"
            footer={
                <div className="flex justify-between w-full">
                    {step > 1 && (
                        <button onClick={handleBack} className="px-6 py-2 text-gray-500 font-bold flex items-center gap-2">
                            <FiArrowLeft /> Back
                        </button>
                    )}
                    {step < 3 ? (
                        <button
                            onClick={handleNext}
                            disabled={!formData.full_name || !formData.phone}
                            className={`btn-primary ml-auto flex items-center gap-2 ${(!formData.full_name || !formData.phone) ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            Continue <FiArrowRight />
                        </button>
                    ) : (
                        <button onClick={handleSubmit} className="btn-primary ml-auto flex items-center gap-2 shadow-lg shadow-primary-200">
                            Send Booking Request <FiCheck />
                        </button>
                    )}
                </div>
            }
        >
            {/* Step Indicator */}
            <div className="flex items-center justify-between mb-8 relative">
                {steps.map((s, idx) => (
                    <div key={s.id} className="flex flex-col items-center relative z-10">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${step >= s.id ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-400'
                            }`}>
                            <s.icon size={18} />
                        </div>
                        <span className={`text-[10px] mt-2 font-bold uppercase tracking-wider ${step >= s.id ? 'text-primary-700' : 'text-gray-400'
                            }`}>{s.title}</span>
                    </div>
                ))}
                <div className="absolute top-5 left-0 w-full h-0.5 bg-gray-100 -z-0">
                    <div
                        className="h-full bg-primary-600 transition-all duration-500"
                        style={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }}
                    />
                </div>
            </div>

            <div className="space-y-6">
                {step === 1 && (
                    <div className="space-y-4 animate-fadeIn">
                        <div>
                            <label className="label">Full Name *</label>
                            <input
                                type="text" name="full_name" value={formData.full_name} onChange={handleChange}
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary-500 transition-all"
                                placeholder="As per your ID"
                            />
                        </div>
                        <div>
                            <label className="label">Phone Number *</label>
                            <input
                                type="tel" name="phone" value={formData.phone} onChange={handleChange}
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary-500 transition-all"
                                placeholder="98XXXXXXXX"
                            />
                        </div>
                        <div>
                            <label className="label">Current Address</label>
                            <input
                                type="text" name="address" value={formData.address} onChange={handleChange}
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary-500 transition-all"
                                placeholder="Your current city/area"
                            />
                        </div>
                        <div>
                            <label className="label">Desired Move-in Date *</label>
                            <input
                                type="date" name="move_in_date" value={formData.move_in_date} onChange={handleChange}
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary-500 transition-all"
                                required
                            />
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-4 animate-fadeIn">
                        <div>
                            <label className="label">Citizenship / National ID Number *</label>
                            <input
                                type="text" name="citizen_number" value={formData.citizen_number} onChange={handleChange}
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary-500 transition-all"
                                placeholder="Enter ID number"
                            />
                        </div>
                        <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 flex gap-3">
                            <FiCreditCard className="text-blue-600 flex-shrink-0 mt-1" />
                            <p className="text-xs text-blue-800">Your ID will be used only for generating the rental agreement and will be visible only to the property owner.</p>
                        </div>
                        <div>
                            <label className="label">Message to Owner (Optional)</label>
                            <textarea
                                name="message" value={formData.message} onChange={handleChange}
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary-500 transition-all"
                                rows="3"
                                placeholder="Introduce yourself, mention planned move-in date..."
                            />
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="space-y-6 animate-fadeIn">
                        <div className="p-6 bg-primary-600 rounded-3xl text-white shadow-xl shadow-primary-200">
                            <p className="text-xs font-bold uppercase tracking-widest opacity-80 mb-2">Booking Summary</p>
                            <h4 className="text-xl font-black mb-1">{property?.title}</h4>
                            <p className="text-sm opacity-90 flex items-center gap-2"><FiMapPin /> {property?.city}</p>

                            <div className="mt-6 flex justify-between items-end border-t border-white/20 pt-4">
                                <div>
                                    <p className="text-xs opacity-80 uppercase font-bold">Monthly Rent</p>
                                    <p className="text-2xl font-black">NPR {property?.price_per_month?.toLocaleString()}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs opacity-80 uppercase font-bold">Minimum Deposit</p>
                                    <p className="text-lg font-bold">NPR 5,000</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center gap-3 text-sm text-gray-700">
                                <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0">
                                    <FiCheck size={14} />
                                </div>
                                <p>Booking request will be sent to the owner.</p>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-700">
                                <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0">
                                    <FiCheck size={14} />
                                </div>
                                <p>You will receive a notification when the owner responds.</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default BookingModal;
