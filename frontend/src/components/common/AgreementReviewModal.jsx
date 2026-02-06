import { FiFileText, FiCheck, FiX, FiShield, FiExternalLink, FiDownload, FiInfo } from 'react-icons/fi';
import Modal from '../common/Modal';
import Badge from '../common/Badge';

const AgreementReviewModal = ({ isOpen, onClose, agreement, onApprove, onDecline }) => {
    if (!agreement) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Review Rental Agreement"
            size="lg"
            footer={
                <div className="flex gap-4 w-full">
                    <button
                        onClick={onDecline}
                        className="flex-1 px-6 py-3 rounded-2xl border border-red-200 text-red-600 font-bold hover:bg-red-50 transition-all"
                    >
                        Decline
                    </button>
                    <button
                        onClick={onApprove}
                        className="flex-[2] bg-primary-600 text-white px-6 py-3 rounded-2xl font-black shadow-lg shadow-primary-200 hover:bg-primary-700 transition-all flex items-center justify-center gap-2"
                    >
                        Approve & Pay Deposit <FiCheck />
                    </button>
                </div>
            }
        >
            <div className="space-y-6">
                {/* Agreement Visual Component */}
                <div className="bg-gray-50 p-8 rounded-[2.5rem] border border-gray-100 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                        <FiShield size={200} />
                    </div>

                    <div className="text-center mb-8">
                        <Badge variant="primary">DIGITAL CONTRACT</Badge>
                        <h3 className="text-2xl font-black text-gray-900 mt-2">Residential Rental Agreement</h3>
                        <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">ID: {agreement.agreement_id}</p>
                    </div>

                    <div className="space-y-6 text-sm text-gray-700 leading-relaxed">
                        <div className="grid grid-cols-2 gap-8 border-b border-gray-200 pb-6">
                            <div>
                                <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Landlord / Owner</p>
                                <p className="font-black text-gray-900">{agreement.owner_name}</p>
                                <p className="text-xs text-gray-500">{agreement.owner_phone}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Tenant</p>
                                <p className="font-black text-gray-900">{agreement.tenant_name}</p>
                                <p className="text-xs text-gray-500">{agreement.tenant_phone}</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h4 className="font-black text-gray-900 border-l-4 border-primary-500 pl-3">Property & Financials</h4>
                            <div className="grid grid-cols-2 gap-4 bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
                                <div>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase">Monthly Rent</p>
                                    <p className="font-black text-primary-600">Rs. {agreement.base_rent?.toLocaleString()}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase">Security Deposit</p>
                                    <p className="font-black text-gray-900">Rs. {agreement.deposit_amount?.toLocaleString()}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase">Lease Term</p>
                                    <p className="font-black text-gray-900">{agreement.rental_years} Years {agreement.rental_months} Months</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase">Start Date</p>
                                    <p className="font-black text-gray-900">{agreement.start_date ? new Date(agreement.start_date).toLocaleDateString() : 'TBD'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h4 className="font-black text-gray-900 border-l-4 border-primary-500 pl-3">Utilities & Rules</h4>
                            <div className="space-y-2">
                                <p>• Electricity will be charged at <span className="font-bold">Rs. {agreement.electricity_rate}/unit</span> based on consumption.</p>
                                <p>• Fixed <span className="font-bold">Rs. {agreement.water_bill}</span> for water and <span className="font-bold">Rs. {agreement.garbage_bill}</span> for garbage per month.</p>
                                <p>• Tenant agrees to follow all house rules: <span className="italic">{agreement.rules_and_regulations}</span>.</p>
                            </div>
                        </div>

                        <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 flex gap-3 text-blue-800 text-xs shadow-sm">
                            <div className="flex-shrink-0 mt-0.5 text-lg">🏦</div>
                            <div>
                                <p className="font-black uppercase tracking-wider mb-1">Owner Payment Details</p>
                                <p>Please transfer the deposit of <span className="font-bold">Rs. {agreement.deposit_amount?.toLocaleString()}</span> to:</p>
                                <div className="mt-2 p-3 bg-white/60 rounded-xl border border-blue-200">
                                    <p><span className="text-gray-500">Bank:</span> <span className="font-bold">{agreement.bank_name || 'Not provided'}</span></p>
                                    <p><span className="text-gray-500">A/C Number:</span> <span className="font-bold tracking-widest">{agreement.bank_account_number || 'Not provided'}</span></p>
                                </div>
                                <p className="mt-3 italic">By clicking "Approve", you legally agree to the terms mentioned above and commit to the transfer.</p>
                            </div>
                        </div>
                    </div>

                    <button className="mt-8 w-full flex items-center justify-center gap-2 text-primary-600 text-xs font-bold hover:underline">
                        <FiDownload /> Download Agreement PDF
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default AgreementReviewModal;
