import { useState } from 'react';
import PropTypes from 'prop-types';

const PendingUsersTable = ({ users, onApprove, onReject, loading }) => {
    const [processingId, setProcessingId] = useState(null);

    const handleApprove = async (userId) => {
        setProcessingId(userId);
        try {
            await onApprove(userId);
        } finally {
            setProcessingId(null);
        }
    };

    const handleReject = async (userId) => {
        setProcessingId(userId);
        try {
            await onReject(userId);
        } finally {
            setProcessingId(null);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
            </div>
        );
    }

    if (!users || users.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500">
                <p className="text-lg">No pending users</p>
                <p className="text-sm mt-2">All users have been reviewed</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Phone
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Role
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Registered
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                        <tr key={user.user_id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">
                                    {user.full_name}
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-500">{user.email}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-500">
                                    {user.phone || 'N/A'}
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === 'owner'
                                        ? 'bg-blue-100 text-blue-800'
                                        : 'bg-green-100 text-green-800'
                                    }`}>
                                    {user.role}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatDate(user.created_at)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <button
                                    onClick={() => handleApprove(user.user_id)}
                                    disabled={processingId === user.user_id}
                                    className="text-green-600 hover:text-green-900 mr-4 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {processingId === user.user_id ? 'Processing...' : 'Approve'}
                                </button>
                                <button
                                    onClick={() => handleReject(user.user_id)}
                                    disabled={processingId === user.user_id}
                                    className="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {processingId === user.user_id ? 'Processing...' : 'Reject'}
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

PendingUsersTable.propTypes = {
    users: PropTypes.arrayOf(PropTypes.shape({
        user_id: PropTypes.number.isRequired,
        full_name: PropTypes.string.isRequired,
        email: PropTypes.string.isRequired,
        phone: PropTypes.string,
        role: PropTypes.string.isRequired,
        created_at: PropTypes.string.isRequired
    })),
    onApprove: PropTypes.func.isRequired,
    onReject: PropTypes.func.isRequired,
    loading: PropTypes.bool
};

export default PendingUsersTable;
