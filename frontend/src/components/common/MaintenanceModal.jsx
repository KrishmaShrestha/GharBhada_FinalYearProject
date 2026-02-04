import { useState } from 'react';
import { FiTool, FiX, FiCheck, FiUpload, FiAlertTriangle } from 'react-icons/fi';
import Modal from './Modal';

const MaintenanceModal = ({ isOpen, onClose, onSubmit, propertyId }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        priority: 'medium',
        property_id: propertyId
    });
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e) => {
        if (e.target.files) {
            setImages(Array.from(e.target.files));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onSubmit({ ...formData, images });
            setFormData({
                title: '',
                description: '',
                priority: 'medium',
                property_id: propertyId
            });
            setImages([]);
            onClose();
        } catch (err) {
            console.error('Submit maintenance error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Request Maintenance"
            size="md"
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="p-4 bg-orange-50 rounded-2xl border border-orange-100 flex gap-3 text-orange-800 text-sm">
                    <FiAlertTriangle className="flex-shrink-0 mt-1" />
                    <p>For urgent emergencies (fire, gas leak, flooding), please contact emergency services or the owner directly via phone.</p>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Issue Title</label>
                        <input
                            type="text" name="title" value={formData.title} onChange={handleChange} required
                            placeholder="e.g. Leaking Faucet, Broken Light Switch"
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary-500 transition-all"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Priority Level</label>
                        <select
                            name="priority" value={formData.priority} onChange={handleChange}
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary-500 transition-all"
                        >
                            <option value="low">Low - Minor issue, not urgent</option>
                            <option value="medium">Medium - Needs attention soon</option>
                            <option value="high">High - Urgent, affecting daily life</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
                        <textarea
                            name="description" value={formData.description} onChange={handleChange} required
                            rows="4" placeholder="Please provide as much detail as possible about the issue..."
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary-500 transition-all"
                        ></textarea>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Photos (Optional)</label>
                        <div className="border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center hover:border-primary-500 transition-colors cursor-pointer relative">
                            <input
                                type="file" multiple onChange={handleImageChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            <FiUpload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Upload Images</p>
                        </div>
                        {images.length > 0 && (
                            <div className="mt-2 text-xs text-gray-500">
                                {images.length} files selected
                            </div>
                        )}
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-4 rounded-2xl bg-primary-600 text-white font-black shadow-lg shadow-primary-200 hover:bg-primary-700 transition-all flex items-center justify-center gap-2 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    {loading ? 'Submitting...' : <><FiTool /> Submit Request</>}
                </button>
            </form>
        </Modal>
    );
};

export default MaintenanceModal;
