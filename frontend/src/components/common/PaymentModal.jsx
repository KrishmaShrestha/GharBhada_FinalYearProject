import { FiDollarSign, FiCheck, FiInfo, FiCopy } from 'react-icons/fi';
import Modal from '../common/Modal';

const PaymentModal = ({ isOpen, onClose, payment, onConfirm }) => {
    if (!payment) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={payment.type === 'deposit' ? 'Pay Security Deposit' : 'Pay Monthly Rent'}
            size="md"
            footer={
                <button
                    onClick={onConfirm}
                    className="btn-primary w-full flex items-center justify-center gap-2 shadow-lg shadow-primary-200"
                >
                    <FiCheck /> I Have Paid
                </button>
            }
        >
            <div className="space-y-6">
                <div className="text-center">
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">Total Amount Due</p>
                    <h2 className="text-4xl font-black text-primary-600">Rs. {payment.amount?.toLocaleString()}</h2>
                </div>

                <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 space-y-4">
                    <h4 className="font-bold text-gray-900 border-b pb-2 flex items-center gap-2">
                        <FiInfo className="text-primary-500" /> Payment Instructions
                    </h4>
                    <p className="text-sm text-gray-600">Please transfer the amount to the owner's bank account or eSewa ID below and upload the transaction details.</p>

                    <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 bg-white rounded-xl border border-gray-100">
                            <div>
                                <p className="text-[10px] text-gray-400 font-bold uppercase">Bank Name</p>
                                <p className="text-sm font-bold text-gray-800">{payment.bank_name || 'Nabil Bank'}</p>
                            </div>
                            <FiCopy className="text-gray-300 hover:text-primary-500 cursor-pointer" />
                        </div>
                        <div className="flex justify-between items-center p-3 bg-white rounded-xl border border-gray-100">
                            <div>
                                <p className="text-[10px] text-gray-400 font-bold uppercase">Account Name</p>
                                <p className="text-sm font-bold text-gray-800">{payment.owner_name}</p>
                            </div>
                            <FiCopy className="text-gray-300 hover:text-primary-500 cursor-pointer" />
                        </div>
                        <div className="flex justify-between items-center p-3 bg-white rounded-xl border border-gray-100">
                            <div>
                                <p className="text-[10px] text-gray-400 font-bold uppercase">Account Number</p>
                                <p className="text-sm font-bold text-gray-800">{payment.bank_account_number || '1234567890123'}</p>
                            </div>
                            <FiCopy className="text-gray-300 hover:text-primary-500 cursor-pointer" />
                        </div>
                    </div>
                </div>

                <div className="p-4 border-2 border-dashed border-gray-200 rounded-3xl text-center hover:border-primary-500 transition-colors cursor-pointer space-y-2">
                    <FiDollarSign size={24} className="mx-auto text-gray-300" />
                    <p className="text-xs font-bold text-gray-500 uppercase">Upload Payment Screenshot</p>
                    <p className="text-[10px] text-gray-400">Transaction ID, Date and Amount must be visible</p>
                </div>
            </div>
        </Modal>
    );
};

export default PaymentModal;
