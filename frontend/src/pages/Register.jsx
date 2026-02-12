import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import Logo from '../components/common/Logo';

const Register = () => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        // Step 1: Basic Info
        email: '',
        password: '',
        confirmPassword: '',
        full_name: '',
        phone: '',
        role: 'tenant',

        // Step 2: Address
        street_address: '',
        city: '',
        district: '',
        postal_code: '',

        // Step 3: Verification & Bank
        citizen_number: '',
        id_proof: null,
        bank_name: '',
        bank_account_number: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [preview, setPreview] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value, files } = e.target;

        if (name === 'id_proof' && files && files[0]) {
            setFormData({ ...formData, id_proof: files[0] });
            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result);
            };
            reader.readAsDataURL(files[0]);
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const validateStep = (currentStep) => {
        setError('');

        if (currentStep === 1) {
            if (!formData.full_name || !formData.email || !formData.password || !formData.phone) {
                setError('Please fill in all required fields');
                return false;
            }
            if (formData.password.length < 6) {
                setError('Password must be at least 6 characters');
                return false;
            }
            if (formData.password !== formData.confirmPassword) {
                setError('Passwords do not match');
                return false;
            }
            const phoneRegex = /^[0-9]{10}$/;
            if (!phoneRegex.test(formData.phone)) {
                setError('Please enter a valid 10-digit phone number');
                return false;
            }
        }

        if (currentStep === 2) {
            if (!formData.street_address || !formData.city || !formData.district) {
                setError('Please fill in all address fields');
                return false;
            }
        }

        if (currentStep === 3) {
            if (!formData.citizen_number) {
                setError('Please enter your citizen number');
                return false;
            }
            if (!formData.id_proof) {
                setError('Please upload your ID proof');
                return false;
            }
            if (formData.role === 'owner') {
                if (!formData.bank_name || !formData.bank_account_number) {
                    setError('Please provide bank details for rental payments');
                    return false;
                }
            }
        }

        return true;
    };

    const nextStep = () => {
        if (validateStep(step)) {
            setStep(step + 1);
        }
    };

    const prevStep = () => {
        setError('');
        setStep(step - 1);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateStep(3)) return;

        setError('');
        setLoading(true);

        // Create FormData for file upload
        const submitData = new FormData();
        Object.keys(formData).forEach(key => {
            if (key !== 'confirmPassword' && formData[key]) {
                submitData.append(key, formData[key]);
            }
        });

        const result = await register(submitData);

        if (result.success) {
            // Show success message and redirect
            navigate('/login', {
                state: {
                    message: result.message || 'Registration successful! Please wait for admin approval before logging in.'
                }
            });
        } else {
            setError(result.message);
        }

        setLoading(false);
    };

    const handleGoogleSignup = () => {
        // VITE_API_URL already contains /api, so we just use /auth/google
        window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:5001/api'}/auth/google`;
    };

    const renderStepIndicator = () => (
        <div className="step-indicator mb-8">
            <div className="step">
                <div className={`step-circle ${step >= 1 ? 'step-completed' : 'step-pending'}`}>
                    1
                </div>
                <span className="text-xs font-medium">Basic Info</span>
            </div>
            <div className="flex-1 h-0.5 bg-gray-200 mx-2 mt-5">
                <div className={`h-full ${step >= 2 ? 'progress-fill' : ''}`}></div>
            </div>
            <div className="step">
                <div className={`step-circle ${step >= 2 ? (step > 2 ? 'step-completed' : 'step-active') : 'step-pending'}`}>
                    2
                </div>
                <span className="text-xs font-medium">Address</span>
            </div>
            <div className="flex-1 h-0.5 bg-gray-200 mx-2 mt-5">
                <div className={`h-full ${step >= 3 ? 'progress-fill' : ''}`}></div>
            </div>
            <div className="step">
                <div className={`step-circle ${step >= 3 ? 'step-active' : 'step-pending'}`}>
                    3
                </div>
                <span className="text-xs font-medium">{formData.role === 'owner' ? 'Verification & Bank' : 'Verification'}</span>
            </div>
        </div>
    );

    const renderStep1 = () => (
        <div className="space-y-4">
            <div>
                <label className="label">Full Name *</label>
                <input
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="Enter your full name"
                />
            </div>

            <div>
                <label className="label">Email *</label>
                <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="your.email@example.com"
                />
            </div>

            <div>
                <label className="label">Phone Number *</label>
                <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="9841234567"
                    maxLength="10"
                />
            </div>

            <div className="relative">
                <label className="label">Password *</label>
                <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="input-field pr-10"
                    placeholder="At least 6 characters"
                />
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-[38px] text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                    {showPassword ? <FaEye size={20} /> : <FaEyeSlash size={20} />}
                </button>
            </div>

            <div className="relative">
                <label className="label">Confirm Password *</label>
                <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="input-field pr-10"
                    placeholder="Re-enter your password"
                />
                <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-[38px] text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                    {showConfirmPassword ? <FaEye size={20} /> : <FaEyeSlash size={20} />}
                </button>
            </div>

            <div>
                <label className="label">I am a *</label>
                <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="input-field"
                >
                    <option value="tenant">Tenant (Looking for property)</option>
                    <option value="owner">Owner (Listing property)</option>
                </select>
            </div>
        </div>
    );

    const renderStep2 = () => (
        <div className="space-y-4">
            <div>
                <label className="label">Street Address *</label>
                <input
                    type="text"
                    name="street_address"
                    value={formData.street_address}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="House/Apartment number, Street name"
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="label">City *</label>
                    <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        className="input-field"
                        placeholder="e.g., Kathmandu"
                    />
                </div>

                <div>
                    <label className="label">District *</label>
                    <input
                        type="text"
                        name="district"
                        value={formData.district}
                        onChange={handleChange}
                        className="input-field"
                        placeholder="e.g., Kathmandu"
                    />
                </div>
            </div>

            <div>
                <label className="label-optional">Postal Code</label>
                <input
                    type="text"
                    name="postal_code"
                    value={formData.postal_code}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="e.g., 44600"
                />
            </div>
        </div>
    );

    const renderStep3 = () => (
        <div className="space-y-4">
            <div>
                <label className="label">Citizen Number *</label>
                <input
                    type="text"
                    name="citizen_number"
                    value={formData.citizen_number}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="Enter your citizenship number"
                />
                <p className="text-xs text-gray-500 mt-1">
                    This will be verified by admin before account activation
                </p>
            </div>

            <div>
                <label className="label">ID Proof Upload *</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary transition-colors">
                    <input
                        type="file"
                        name="id_proof"
                        onChange={handleChange}
                        accept="image/*,.pdf"
                        className="hidden"
                        id="id-proof-upload"
                    />
                    <label htmlFor="id-proof-upload" className="cursor-pointer">
                        {preview ? (
                            <div className="space-y-2">
                                {formData.id_proof?.type?.startsWith('image/') ? (
                                    <img src={preview} alt="ID Preview" className="max-h-40 mx-auto rounded" />
                                ) : (
                                    <div className="text-4xl">📄</div>
                                )}
                                <p className="text-sm text-gray-600">{formData.id_proof?.name}</p>
                                <button type="button" className="text-primary text-sm hover:underline">
                                    Change file
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <div className="text-4xl">📤</div>
                                <p className="text-sm font-medium">Click to upload ID proof</p>
                                <p className="text-xs text-gray-500">Citizenship, License, or Passport</p>
                                <p className="text-xs text-gray-400">PNG, JPG or PDF (max 5MB)</p>
                            </div>
                        )}
                    </label>
                </div>
            </div>

            {formData.role === 'owner' && (
                <div className="space-y-4 pt-4 border-t border-gray-100">
                    <p className="text-sm font-bold text-gray-700">🏦 Payment Details (for Rent Collection)</p>
                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <label className="label">Bank Name *</label>
                            <input
                                type="text"
                                name="bank_name"
                                value={formData.bank_name}
                                onChange={handleChange}
                                className="input-field"
                                placeholder="e.g., Nabil Bank"
                            />
                        </div>
                        <div>
                            <label className="label">Account Number *</label>
                            <input
                                type="text"
                                name="bank_account_number"
                                value={formData.bank_account_number}
                                onChange={handleChange}
                                className="input-field"
                                placeholder="Enter your bank account number"
                            />
                        </div>
                    </div>
                </div>
            )}

            <div className="alert alert-info">
                <p className="text-sm font-medium">📋 Verification Process</p>
                <p className="text-xs mt-1">
                    Your account will be reviewed by our admin team. You'll receive a notification once approved (usually within 24 hours).
                </p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-accent-50 py-12 px-4">
            <div className="max-w-2xl w-full">
                <div className="card">
                    <div className="flex flex-col items-center justify-center mb-10">
                        <Logo className="scale-125" showText={true} />
                    </div>
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-black text-gray-900 tracking-tight mb-2">Create Your Account</h2>
                        <p className="text-gray-500 font-medium">Join GharBhada and find your perfect rental home</p>
                    </div>

                    {renderStepIndicator()}

                    {error && (
                        <div className="alert alert-error mb-6">
                            <p className="font-medium">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        {step === 1 && renderStep1()}
                        {step === 2 && renderStep2()}
                        {step === 3 && renderStep3()}

                        <div className="flex justify-between mt-8">
                            {step > 1 && (
                                <button
                                    type="button"
                                    onClick={prevStep}
                                    className="btn-secondary"
                                >
                                    ← Previous
                                </button>
                            )}

                            {step < 3 ? (
                                <button
                                    type="button"
                                    onClick={nextStep}
                                    className="btn-primary ml-auto"
                                >
                                    Next →
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="btn-primary ml-auto"
                                >
                                    {loading ? 'Creating Account...' : 'Complete Registration'}
                                </button>
                            )}
                        </div>

                        {step === 1 && (
                            <>
                                <div className="relative my-6">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-gray-300"></div>
                                    </div>
                                    <div className="relative flex justify-center text-sm">
                                        <span className="px-2 bg-white text-gray-500 font-medium font-outfit">Or sign up with</span>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={handleGoogleSignup}
                                    className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
                                >
                                    <img
                                        className="h-5 w-5 mr-2"
                                        src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                                        alt="Google logo"
                                    />
                                    Sign up with Google
                                </button>
                            </>
                        )}
                    </form>

                    <p className="mt-6 text-center text-gray-600">
                        Already have an account?{' '}
                        <Link to="/login" className="text-primary hover:text-primary-600 font-semibold">
                            Login
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
