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
                <div className="p-5 bg-gradient-to-br from-primary-50 to-white rounded-[2rem] border border-primary-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-[10px] text-primary-600 font-black uppercase tracking-widest mb-1">Monthly Basic Rent</p>
                        <p className="text-2xl font-black text-gray-900">Rs. {agreement?.monthly_rent?.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Tenant</p>
                        <p className="text-sm font-black text-gray-900">{agreement?.tenant_name}</p>
                    </div>
                </div>

                {agreement?.start_date && new Date(agreement.start_date) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) && (
                    <div className="p-4 bg-yellow-50 rounded-2xl border border-yellow-100 flex gap-3 animate-pulse">
                        <FiFileText className="text-yellow-600 mt-1 shrink-0" />
                        <div>
                            <p className="text-[11px] font-bold text-yellow-800">First Month Special Logic</p>
                            <p className="text-[10px] text-yellow-700">Suggestion: If the tenant already paid Rs. {agreement.deposit_amount?.toLocaleString()} as deposit, you can adjust it here if needed.</p>
                        </div>
                    </div>
                )}

                <form className="space-y-5">
                    <div className="grid grid-cols-2 gap-5">
                        <div className="col-span-2 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                            <label className="block text-sm font-black text-gray-700 mb-2 flex items-center gap-2">
                                <FiZap className="text-yellow-500" /> Electricity Units Consumed
                            </label>
                            <input
                                type="number"
                                value={formData.electricity_units}
                                onChange={(e) => setFormData({ ...formData, electricity_units: e.target.value })}
                                className="w-full bg-white border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary-500 transition-all font-bold"
                                placeholder="Enter units (e.g. 150)"
                            />
                            <div className="flex justify-between items-center mt-2 px-1">
                                <span className="text-[10px] text-gray-400 font-medium">Rate: Rs. {agreement?.electricity_rate}/unit</span>
                                <span className="text-[10px] font-bold text-primary-600">Cost: Rs. {(formData.electricity_units * agreement?.electricity_rate || 0).toLocaleString()}</span>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                                <FiDroplet className="text-blue-500" /> Water
                            </label>
                            <input
                                type="number"
                                value={formData.water_amount}
                                onChange={(e) => setFormData({ ...formData, water_amount: e.target.value })}
                                className="w-full border-gray-200 rounded-xl px-4 py-2 font-bold focus:ring-2 focus:ring-primary-500"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                                <FiTrash2 className="text-green-500" /> Garbage
                            </label>
                            <input
                                type="number"
                                value={formData.garbage_amount}
                                onChange={(e) => setFormData({ ...formData, garbage_amount: e.target.value })}
                                className="w-full border-gray-200 rounded-xl px-4 py-2 font-bold focus:ring-2 focus:ring-primary-500"
                            />
                        </div>

                        <div className="col-span-2">
                            <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-2">Deposit Adjustment (Deduction)</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    value={formData.deposit_adjustment}
                                    onChange={(e) => setFormData({ ...formData, deposit_adjustment: e.target.value })}
                                    className="w-full border-gray-200 rounded-xl px-4 py-3 font-bold text-red-600 focus:ring-2 focus:ring-red-500 bg-red-50/30"
                                    placeholder="0"
                                />
                                {formData.deposit_adjustment > 0 && (
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, deposit_adjustment: 0 })}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500"
                                    >
                                        <FiX />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-dashed border-gray-200">
                        <div className="space-y-2 mb-4">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-500 font-medium">Rent + Utilities</span>
                                <span className="font-bold text-gray-900">Rs. {(calculateTotal() + Number(formData.deposit_adjustment)).toLocaleString()}</span>
                            </div>
                            {formData.deposit_adjustment > 0 && (
                                <div className="flex justify-between items-center text-sm text-red-600 bg-red-50 p-2 rounded-lg">
                                    <span className="font-medium">Deposit Deduction</span>
                                    <span className="font-black">- Rs. {Number(formData.deposit_adjustment).toLocaleString()}</span>
                                </div>
                            )}
                        </div>

                        <div className="bg-gray-900 rounded-[1.5rem] p-4 text-white shadow-xl shadow-gray-200 flex justify-between items-center ring-4 ring-white">
                            <div>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Total Payable</p>
                                <p className="text-2xl font-black">Rs. {calculateTotal().toLocaleString()}</p>
                            </div>
                            <FiDollarSign className="text-primary-400 text-3xl opacity-50" />
                        </div>
                    </div>
                </form>
            </div>
        </Modal>
    );
};

export default RecordPaymentModal;
