import React, { useState, useEffect, useRef } from 'react';
import { FiBell, FiCheckCircle, FiFileText, FiClock, FiX } from 'react-icons/fi';
import * as notificationService from '../../services/notificationService';
import { formatDistanceToNow } from 'date-fns';

const NotificationBell = () => {
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const dropdownRef = useRef(null);

    const fetchNotifications = async () => {
        try {
            const data = await notificationService.getNotifications();
            setNotifications(data.notifications);
            setUnreadCount(data.notifications.filter(n => !n.is_read).length);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    useEffect(() => {
        fetchNotifications();
        // Poll for new notifications every 30 seconds
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleMarkAsRead = async (id) => {
        try {
            await notificationService.markAsRead(id);
            setNotifications(notifications.map(n =>
                n.notification_id === id ? { ...n, is_read: 1 } : n
            ));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'booking': return <FiClock className="text-blue-500" />;
            case 'agreement': return <FiFileText className="text-purple-500" />;
            case 'payment': return <FiCheckCircle className="text-green-500" />;
            default: return <FiBell className="text-gray-500" />;
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-full transition-all focus:outline-none"
            >
                <FiBell className="w-6 h-6" />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-black flex items-center justify-center rounded-full border-2 border-white animate-bounce">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
                    <div className="p-4 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
                        <h3 className="font-black text-gray-900 text-sm uppercase tracking-widest">Notifications</h3>
                        {unreadCount > 0 && <span className="text-[10px] bg-primary-100 text-primary-600 px-2 py-0.5 rounded-full font-black">{unreadCount} New</span>}
                    </div>

                    <div className="max-h-[400px] overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center text-gray-400">
                                <FiBell className="w-10 h-10 mx-auto mb-2 opacity-20" />
                                <p className="text-xs font-bold uppercase tracking-tighter">No new updates</p>
                            </div>
                        ) : (
                            notifications.map((notif) => (
                                <div
                                    key={notif.notification_id}
                                    onClick={() => !notif.is_read && handleMarkAsRead(notif.notification_id)}
                                    className={`p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer relative ${!notif.is_read ? 'bg-primary-50/20' : ''}`}
                                >
                                    {!notif.is_read && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary-500" />}
                                    <div className="flex gap-4">
                                        <div className="mt-1 shrink-0 w-8 h-8 rounded-lg bg-white border border-gray-100 flex items-center justify-center shadow-sm">
                                            {getIcon(notif.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-black text-gray-900 text-xs mb-1 truncate">{notif.title}</p>
                                            <p className="text-[11px] text-gray-600 leading-relaxed line-clamp-2">{notif.message}</p>
                                            <p className="text-[9px] text-gray-400 font-bold mt-2 uppercase tracking-tighter">
                                                {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true })}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="p-3 bg-gray-50 border-t border-gray-100 text-center">
                        <button className="text-[10px] font-black text-primary-600 uppercase tracking-widest hover:text-primary-700">View All Notifications</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
