/**
 * Formats a given path into a full backend URL for assets.
 * Handles normalization of slashes and provides placeholders.
 */
export const getAssetUrl = (path) => {
    if (!path) {
        // Return a professional placeholder if no path provided
        return 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
    }

    // If it's already an absolute URL, return it
    if (path.startsWith('http://') || path.startsWith('https://')) {
        return path;
    }

    // Normalize slashes (convert backslashes to forward slashes)
    const normalizedPath = path.replace(/\\/g, '/');

    // Get Base URL from environment or default
    // We strip /api from VITE_API_URL to get the root server URL
    const BASE_URL = import.meta.env.VITE_API_URL
        ? import.meta.env.VITE_API_URL.replace('/api', '')
        : 'http://localhost:5001';

    // Ensure path starts with a single /
    const cleanPath = normalizedPath.startsWith('/') ? normalizedPath : `/${normalizedPath}`;

    return `${BASE_URL}${cleanPath}`;
};

export const getProfileAvatar = (user) => {
    if (user?.profile_image) {
        return getAssetUrl(user.profile_image);
    }
    // Professional avatar placeholder with user initials
    const name = user?.full_name || 'User';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0284c7&color=fff&bold=true`;
};
