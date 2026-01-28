import { useState } from 'react';
import { FiFileText, FiZap, FiDroplet, FiTrash2, FiDollarSign, FiCheck, FiX, FiAlertCircle } from 'react-icons/fi';
import Modal from '../common/Modal';

const CreateAgreementModal = ({ isOpen, onClose, booking, onSubmit }) => {
    const [formData, setFormData] = useState({
        electricity_rate: '12',
        water_bill: '500',
        garbage_bill: '200',
        security_deposit: '5000',
        rules: '1. Rent must be paid by the 5th of every month.\n2. No late night noise after 10 PM.\n3. Cleanliness must be maintained in common areas.'
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    if (!booking) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Create Rental Agreement"
            size="lg"
            footer={
                <div className="flex justify-end gap-3 w-full">
                    <button onClick={onClose} className="px-6 py-2 text-gray-500 font-bold hover:bg-gray-100 rounded-xl transition-all">
                        Cancel
                    </button>
                    <button onClick={handleSubmit} className="btn-primary flex items-center gap-2">
                        Send to Tenant <FiCheck />
                    </button>
                </div>
            }
        >
            <div className="space-y-6">
                <div className="p-4 bg-primary-50 rounded-2xl border border-primary-100">
                    <h4 className="text-sm font-bold text-primary-800 mb-1">Agreement for: {booking.property_title}</h4>
                    <p className="text-xs text-primary-600">Tenant: {booking.tenant_name} • Duration: {booking.rental_years} yrs {booking.rental_months} mos</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest">Utility Billing</h3>

                        <div>
                            <label className="label flex items-center gap-2"><FiZap className="text-yellow-500" /> Electricity Rate (Rs./unit)</label>
                            <input
                                type="number" name="electricity_rate" value={formData.electricity_rate} onChange={handleChange}
                                className="input-field" placeholder="e.g. 12"
                            />
                        </div>

                        <div>
                            <label className="label flex items-center gap-2"><FiDroplet className="text-blue-500" /> Fixed Water Bill (Rs./mo)</label>
                            <input
                                type="number" name="water_bill" value={formData.water_bill} onChange={handleChange}
                                className="input-field" placeholder="e.g. 500"
                            />
                        </div>

                        <div>
                            <label className="label flex items-center gap-2"><FiTrash2 className="text-green-500" /> Garbage Bill (Rs./mo)</label>
                            <input
                                type="number" name="garbage_bill" value={formData.garbage_bill} onChange={handleChange}
                                className="input-field" placeholder="e.g. 200"
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest">Financials</h3>

                        <div>
                            <label className="label flex items-center gap-2"><FiDollarSign className="text-primary-600" /> Security Deposit (Rs.)</label>
                            <input
                                type="number" name="security_deposit" value={formData.security_deposit} onChange={handleChange}
                                className="input-field" placeholder="Min 5000"
                            />
                            <p className="text-[10px] text-gray-400 mt-1">Tenant must pay this to confirm booking.</p>
                        </div>

                        <div>
                            <label className="label">Terms & Special Rules</label>
                            <textarea
                                name="rules" value={formData.rules} onChange={handleChange}
                                className="input-field h-32 resize-none"
                                placeholder="Enter specific rules for this tenant..."
                            />
                        </div>
                    </div>
                </div>

                <div className="p-4 bg-yellow-50 rounded-2xl border border-yellow-100 flex gap-3">
                    <FiAlertCircle className="text-yellow-600 flex-shrink-0 mt-1" />
                    <p className="text-xs text-yellow-800">
                        By sending this agreement, you confirm that your property is ready for move-in. The tenant will be asked to pay the deposit once they approve these terms.
                    </p>
                </div>
            </div>
        </Modal>
    );
};

export default CreateAgreementModal;
