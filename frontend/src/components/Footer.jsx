const Footer = () => {
    return (
        <footer className="bg-gray-800 text-white mt-12">
            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div>
                        <h3 className="text-xl font-bold mb-4">GharBhada</h3>
                        <p className="text-gray-400">
                            Your trusted platform for rental property management in Nepal.
                        </p>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-4">Quick Links</h4>
                        <ul className="space-y-2 text-gray-400">
                            <li><a href="/properties" className="hover:text-white">Browse Properties</a></li>
                            <li><a href="/about" className="hover:text-white">About Us</a></li>
                            <li><a href="/contact" className="hover:text-white">Contact</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-4">For Owners</h4>
                        <ul className="space-y-2 text-gray-400">
                            <li><a href="/register" className="hover:text-white">List Property</a></li>
                            <li><a href="/owner/dashboard" className="hover:text-white">Owner Dashboard</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-4">Contact</h4>
                        <ul className="space-y-2 text-gray-400">
                            <li>Email: info@gharbhada.com</li>
                            <li>Phone: +977 9841234567</li>
                            <li>Kathmandu, Nepal</li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
                    <p>&copy; 2026 GharBhada. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
