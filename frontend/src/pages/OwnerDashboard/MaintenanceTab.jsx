import React from 'react';
import { FiTool, FiHome, FiUsers, FiClock } from 'react-icons/fi';
import Badge from '../../components/common/Badge';

const MaintenanceTab = ({ maintenanceRequests, formatDateSafe, onUpdateStatus }) => {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Maintenance Requests</h2>
                    <p className="text-sm text-gray-500">Track and manage repair requests from your tenants</p>
                </div>
            </div>

            {maintenanceRequests.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400 shadow-sm">
                    <FiTool className="w-16 h-16 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-gray-900 mb-1">No Maintenance Requests</h3>
                    <p className="text-sm">Requests will appear here once submitted by your tenants.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {maintenanceRequests.map((req) => (
                        <div key={req.request_id} className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col md:flex-row items-center justify-between gap-6 hover:shadow-md transition-all">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-1">
                                    <h3 className="font-bold text-gray-900">{req.title}</h3>
                                    <Badge variant={
                                        req.priority === 'high' ? 'danger' :
                                            req.priority === 'medium' ? 'warning' : 'info'
                                    } size="sm">{req.priority?.toUpperCase()}</Badge>
                                </div>
                                <p className="text-sm text-gray-600 mb-2">{req.description}</p>
                                <div className="flex flex-wrap gap-4 text-xs text-gray-400">
                                    <span className="flex items-center gap-1"><FiHome /> {req.property_title}</span>
                                    <span className="flex items-center gap-1"><FiUsers /> {req.tenant_name} ({req.tenant_phone})</span>
                                    <span className="flex items-center gap-1"><FiClock /> {formatDateSafe(req.created_at)}</span>
                                </div>
                                {req.notes && (
                                    <p className="text-xs text-blue-600 mt-2 bg-blue-50 p-2 rounded-lg italic">Owner Notes: {req.notes}</p>
                                )}
                            </div>
                            <div className="flex items-center gap-2 w-full md:w-auto">
                                {req.status === 'pending' && (
                                    <button
                                        onClick={() => onUpdateStatus(req.request_id, 'in_progress')}
                                        className="grow md:grow-0 px-4 py-2 bg-primary-50 text-primary-600 rounded-xl font-bold hover:bg-primary-100 transition-all text-sm"
                                    >
                                        Start Work
                                    </button>
                                )}
                                {req.status === 'in_progress' && (
                                    <button
                                        onClick={() => onUpdateStatus(req.request_id, 'completed')}
                                        className="grow md:grow-0 px-4 py-2 bg-green-500 text-white rounded-xl font-bold hover:bg-green-600 transition-all text-sm"
                                    >
                                        Mark Resolved
                                    </button>
                                )}
                                <Badge variant={
                                    req.status === 'completed' ? 'success' :
                                        req.status === 'in_progress' ? 'primary' : 'warning'
                                }>
                                    {req.status?.replace('_', ' ')?.toUpperCase()}
                                </Badge>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MaintenanceTab;
