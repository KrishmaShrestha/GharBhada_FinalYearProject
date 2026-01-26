import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const CompleteProfile = () => {
    const { user, completeProfile, logout } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        phone: '',
        street_address: '',
        city: '',
        district: '',
        postal_code: '',
        citizen_number: '',
        role: '', // Initialize empty to force selection
        id_proof: null,
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [preview, setPreview] = useState(null);

    useEffect(() => {
        if (!user) {
            navigate('/login');
        } else if (user.role === 'admin') {
            navigate('/admin/dashboard');
        } else if (user.is_profile_complete) {
            navigate('/login?status=pending');
        }
    }, [user, navigate]);

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (name === 'id_proof' && files && files[0]) {
            setFormData({ ...formData, id_proof: files[0] });
            const reader = new FileReader();
            reader.onloadend = () => setPreview(reader.result);
            reader.readAsDataURL(files[0]);
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!formData.role) {
            setError('Please select whether you are a Tenant or an Owner');
            return;
        }

        if (!formData.phone || !formData.citizen_number || !formData.id_proof || !formData.street_address || !formData.city || !formData.district) {
            setError('Please fill in all required fields and upload your ID proof');
            return;
        }

        setLoading(true);
        const submitData = new FormData();
        Object.keys(formData).forEach(key => {
            if (formData[key]) submitData.append(key, formData[key]);
        });

        const result = await completeProfile(submitData);
        if (result.success) {
            navigate('/login', { state: { message: result.message } });
        } else {
            setError(result.message);
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
            <div className="max-w-2xl w-full card">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold font-outfit">Complete Your Profile</h2>
                    <p className="text-gray-600 mt-2">Almost there! We need a few more details to verify your account.</p>
                </div>

                {user?.google_id && (
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 text-blue-800 px-6 py-4 rounded-xl mb-8 flex items-center shadow-sm">
                        <div className="bg-white p-2 rounded-full shadow-sm mr-4">
                            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="h-6 w-6" alt="Google" />
                        </div>
                        <div>
                            <p className="font-bold text-lg">Email Verified by Google</p>
                            <p className="text-sm opacity-80">You're securely logged in with <strong>{user?.email}</strong>. Just a few more details to get started!</p>
                        </div>
                    </div>
                )}

                {error && <div className="bg-red-100 text-red-700 p-4 rounded mb-6 font-medium border border-red-200">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="label">I am a *</label>
                            <select name="role" value={formData.role} onChange={handleChange} className="input-field border-2 border-primary-100 focus:border-primary-500" required>
                                <option value="" disabled>Choose role...</option>
                                <option value="tenant">Tenant (Looking for rent)</option>
                                <option value="owner">Owner (Property Lister)</option>
                            </select>
                        </div>
                        <div>
                            <label className="label">Phone Number *</label>
                            <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="input-field" placeholder="98XXXXXXXX" required />
                        </div>
                        <div>
                            <label className="label">Citizenship Number *</label>
                            <input type="text" name="citizen_number" value={formData.citizen_number} onChange={handleChange} className="input-field" placeholder="ID Number" required />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="font-semibold text-lg">Address Details</h3>
                        <div>
                            <label className="label">Street Address *</label>
                            <input type="text" name="street_address" value={formData.street_address} onChange={handleChange} className="input-field" required />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="label">City *</label>
                                <input type="text" name="city" value={formData.city} onChange={handleChange} className="input-field" required />
                            </div>
                            <div>
                                <label className="label">District *</label>
                                <input type="text" name="district" value={formData.district} onChange={handleChange} className="input-field" required />
                            </div>
                            <div>
                                <label className="label">Postal Code</label>
                                <input type="text" name="postal_code" value={formData.postal_code} onChange={handleChange} className="input-field" />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="label">Identity Proof (Citizenship/License/Passport) *</label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary cursor-pointer mt-2">
                            <input type="file" id="id_proof" name="id_proof" onChange={handleChange} accept="image/*,.pdf" className="hidden" />
                            <label htmlFor="id_proof" className="cursor-pointer">
                                {preview ? (
                                    <div className="space-y-2">
                                        <img src={preview} alt="ID Preview" className="max-h-40 mx-auto rounded" />
                                        <p className="text-sm text-gray-500">{formData.id_proof.name}</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <div className="text-4xl">📤</div>
                                        <p>Click to upload your ID proof</p>
                                    </div>
                                )}
                            </label>
                        </div>
                    </div>

                    <div className="flex justify-between items-center pt-6">
                        <button type="button" onClick={logout} className="text-gray-500 hover:text-red-500">Cancel & Logout</button>
                        <button type="submit" disabled={loading} className="btn-primary">
                            {loading ? 'Submitting...' : 'Submit for Verification'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CompleteProfile;
