import React from 'react';

const Logo = ({ className = "h-8", showText = true, textColor = "text-gray-900" }) => {
    return (
        <div className={`flex items-center gap-2.5 ${className} group cursor-pointer`}>
            {/* Elegant House Icon */}
            <div className="relative flex items-center justify-center">
                <svg
                    width="40"
                    height="40"
                    viewBox="0 0 40 40"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="transform transition-transform group-hover:scale-110 duration-500"
                >
                    {/* Shadow/Glow Effect */}
                    <circle cx="20" cy="20" r="18" fill="url(#logo_gradient_bg)" opacity="0.1" />

                    {/* Main House Shape */}
                    <path
                        d="M20 8L32 18V30C32 31.1046 31.1046 32 30 32H10C8.89543 32 8 31.1046 8 30V18L20 8Z"
                        fill="white"
                        stroke="url(#logo_gradient)"
                        strokeWidth="2.5"
                        strokeLinejoin="round"
                    />

                    {/* Geometric Detail / Doorway */}
                    <path
                        d="M17 32V24C17 22.3431 18.3431 21 20 21C21.6569 21 23 22.3431 23 24V32"
                        stroke="url(#logo_gradient)"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                    />

                    {/* Accent Line / Roof Line */}
                    <path
                        d="M5 20L20 7.5L35 20"
                        stroke="url(#logo_gradient)"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />

                    <defs>
                        <linearGradient id="logo_gradient" x1="5" y1="7.5" x2="35" y2="32" gradientUnits="userSpaceOnProject">
                            <stop stopColor="#2563EB" />
                            <stop offset="1" stopColor="#4F46E5" />
                        </linearGradient>
                        <linearGradient id="logo_gradient_bg" x1="5" y1="7.5" x2="35" y2="32" gradientUnits="userSpaceOnProject">
                            <stop stopColor="#2563EB" />
                            <stop offset="1" stopColor="#4F46E5" />
                        </linearGradient>
                    </defs>
                </svg>

                {/* Micro detail: Floating pulse dot */}
                <div className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full animate-ping opacity-20" />
            </div>

            {showText && (
                <div className="flex flex-col">
                    <span className={`text-xl font-black tracking-tighter ${textColor} leading-none group-hover:text-blue-600 transition-colors`}>
                        Ghar<span className="text-blue-600">Bhada</span>
                    </span>
                    <span className="text-[8px] font-black uppercase tracking-[0.2em] text-gray-400 leading-none mt-0.5">
                        Premium Rentals
                    </span>
                </div>
            )}
        </div>
    );
};

export default Logo;
