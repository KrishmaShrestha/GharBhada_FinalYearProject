import { Link } from 'react-router-dom';

const Home = () => {
    return (
        <div>
            {/* Hero Section */}
            <section className="bg-gradient-to-r from-primary-500 to-primary-700 text-white py-20">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-5xl font-bold mb-6">
                        Find Your Perfect Rental Home
                    </h1>
                    <p className="text-xl mb-8">
                        Discover the best rental properties across Nepal
                    </p>
                    <Link to="/properties" className="bg-white text-primary-500 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                        Browse Properties
                    </Link>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-16">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-bold text-center mb-12">Why Choose GharBhada?</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="card text-center">
                            <div className="text-4xl mb-4">🏠</div>
                            <h3 className="text-xl font-semibold mb-2">Wide Selection</h3>
                            <p className="text-gray-600">
                                Browse through hundreds of verified properties
                            </p>
                        </div>
                        <div className="card text-center">
                            <div className="text-4xl mb-4">💳</div>
                            <h3 className="text-xl font-semibold mb-2">Secure Payments</h3>
                            <p className="text-gray-600">
                                Multiple payment options including eSewa, Khalti, and Stripe
                            </p>
                        </div>
                        <div className="card text-center">
                            <div className="text-4xl mb-4">🔒</div>
                            <h3 className="text-xl font-semibold mb-2">Trusted Platform</h3>
                            <p className="text-gray-600">
                                Verified owners and secure booking process
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
