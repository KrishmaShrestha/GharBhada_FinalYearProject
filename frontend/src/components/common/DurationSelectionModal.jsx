import { useState } from 'react';
import { FiClock, FiCalendar, FiArrowRight, FiInfo } from 'react-icons/fi';
import Modal from '../common/Modal';

const DurationSelectionModal = ({ isOpen, onClose, onSubmit }) => {
    const [years, setYears] = useState(1);
    const [months, setMonths] = useState(0);

    const handleSubmit = () => {
        onSubmit({ years, months });
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Select Rental Duration"
            size="sm"
            footer={
                <button
                    onClick={handleSubmit}
                    className="btn-primary w-full flex items-center justify-center gap-2"
                >
                    Confirm Duration <FiArrowRight />
                </button>
            }
        >
            <div className="space-y-6">
                <div className="p-4 bg-primary-50 rounded-2xl flex gap-3 text-sm text-primary-800">
                    <FiInfo className="flex-shrink-0 mt-1" />
                    <p>The owner has accepted your interest! Please select how long you plan to stay. This will be used to generate your contract.</p>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="label">Years</label>
                        <select
                            value={years}
                            onChange={(e) => setYears(Number(e.target.value))}
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary-500 font-bold"
                        >
                            {[1, 2, 3, 4, 5].map(y => (
                                <option key={y} value={y}>{y} {y === 1 ? 'Year' : 'Years'}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="label">Additional Months</label>
                        <select
                            value={months}
                            onChange={(e) => setMonths(Number(e.target.value))}
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary-500 font-bold"
                        >
                            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(m => (
                                <option key={m} value={m}>{m} {m === 1 ? 'Month' : 'Months'}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="pt-4 border-t border-dashed flex justify-between items-center text-sm">
                    <span className="text-gray-500">Total Duration:</span>
                    <span className="font-black text-gray-900">{years}yr {months}mo</span>
                </div>
            </div>
        </Modal>
    );
};

export default DurationSelectionModal;
