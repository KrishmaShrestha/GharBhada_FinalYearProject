import { useState, useEffect } from 'react';
import { FiCheck, FiX, FiDollarSign, FiZap, FiDroplet, FiTrash2, FiFileText } from 'react-icons/fi';
import Modal from '../common/Modal';

const RecordPaymentModal = ({ isOpen, onClose, agreement, onRecord }) => {
    const [formData, setFormData] = useState({
        electricity_units: 0,
        water_amount: agreement?.water_charge || 0,
        garbage_amount: agreement?.garbage_charge || 0,
        deposit_adjustment: 0,
        notes: ''
    });

    useEffect(() => {
        if (agreement) {
            setFormData(prev => ({
                ...prev,
                water_amount: agreement.water_charge || 0,
                garbage_amount: agreement.garbage_charge || 0
            }));
        }
    }, [agreement]);

    const calculateTotal = () => {
        const rent = agreement?.monthly_rent || 0;
        const electricity = (formData.electricity_units * (agreement?.electricity_rate || 0));
        return rent + electricity + Number(formData.water_amount) + Number(formData.garbage_amount) - Number(formData.deposit_adjustment);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onRecord({
            ...formData,
            base_rent: agreement.monthly_rent,
            total_amount: calculateTotal(),
            agreement_id: agreement.agreement_id
        });
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Record Monthly Payment"
            size="md"
            footer={
                <button onClick={handleSubmit} className="btn-primary w-full flex items-center justify-center gap-2">
                    <FiCheck /> Confirm & Generate Receipt
                </button>
            }
        >
            <div className="space-y-6">
                <div className="p-4 bg-primary-50 rounded-2xl flex items-center justify-between">
                    <div>
                        <p className="text-xs text-primary-600 font-bold uppercase">Basic Rent</p>
                        <p className="text-lg font-bold text-gray-900">Rs. {agreement?.monthly_rent?.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-primary-600 font-bold uppercase">Tenant</p>
                        <p className="text-sm font-bold text-gray-900">{agreement?.tenant_name}</p>
                    </div>
                </div>

                <form className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="block text-sm font-bold text-gray-700 mb-1 flex items-center gap-2">
                                <FiZap className="text-yellow-500" /> Electricity Units Consumed
                            </label>
                            <input
                                type="number"
                                value={formData.electricity_units}
                                onChange={(e) => setFormData({ ...formData, electricity_units: e.target.value })}
                                className="w-full border-gray-200 rounded-xl"
                                placeholder="Enter units (e.g. 150)"
                            />
                            <p className="text-[10px] text-gray-400 mt-1">Rate: Rs. {agreement?.electricity_rate}/unit = Rs. {(formData.electricity_units * agreement?.electricity_rate || 0).toLocaleString()}</p>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1 flex items-center gap-2">
                                <FiDroplet className="text-blue-500" /> Water Charge
                            </label>
                            <input
                                type="number"
                                value={formData.water_amount}
                                onChange={(e) => setFormData({ ...formData, water_amount: e.target.value })}
                                className="w-full border-gray-200 rounded-xl"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1 flex items-center gap-2">
                                <FiTrash2 className="text-green-500" /> Garbage Charge
                            </label>
                            <input
                                type="number"
                                value={formData.garbage_amount}
                                onChange={(e) => setFormData({ ...formData, garbage_amount: e.target.value })}
                                className="w-full border-gray-200 rounded-xl"
                            />
                        </div>

                        <div className="col-span-2">
                            <label className="block text-sm font-bold text-gray-700 mb-1">Deposit Adjustment (Deduction)</label>
                            <input
                                type="number"
                                value={formData.deposit_adjustment}
                                onChange={(e) => setFormData({ ...formData, deposit_adjustment: e.target.value })}
                                className="w-full border-gray-200 rounded-xl"
                            />
                        </div>
                    </div>

                    <div className="pt-4 border-t border-dashed">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-sm text-gray-500">Rent + Utilities</span>
                            <span className="font-bold text-gray-700">Rs. {(calculateTotal() + Number(formData.deposit_adjustment)).toLocaleString()}</span>
                        </div>
                        {formData.deposit_adjustment > 0 && (
                            <div className="flex justify-between items-center mb-1 text-red-500">
                                <span className="text-sm">Deposit Deduction</span>
                                <span className="font-bold">- Rs. {Number(formData.deposit_adjustment).toLocaleString()}</span>
                            </div>
                        )}
                        <div className="flex justify-between items-center mt-2 p-3 bg-gray-900 rounded-xl text-white">
                            <span className="font-bold">Total Payable</span>
                            <span className="text-xl font-bold">Rs. {calculateTotal().toLocaleString()}</span>
                        </div>
                    </div>
                </form>
            </div>
        </Modal>
    );
};

export default RecordPaymentModal;
