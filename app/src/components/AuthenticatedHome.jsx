import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../utils';
import '../css/AuthenticatedHome.css';

const AuthenticatedHome = () => {
    const { user, isManager, logout } = useAuth();
    const navigate = useNavigate();
    const { socket } = useSocket();
    const [userProfile, setUserProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    // Future enhancement: Add quick stats functionality
    // const [quickStats, setQuickStats] = useState({
    //     upcomingShifts: 0,
    //     totalHours: 0,
    //     pendingRequests: 0
    // });

    useEffect(() => {
        if (socket && socket.readyState === WebSocket.OPEN) {
            // Fetch user profile
            const profileRequest = { request_id: 70 }; // SEND_PROFILE
            socket.send(JSON.stringify(profileRequest));

            const handleMessage = (event) => {
                try {
                    const response = JSON.parse(event.data);
                    if (response.request_id === 70 && response.success) {
                        setUserProfile(response.data);
                        setLoading(false);
                    }
                } catch (error) {
                    console.error('Error parsing profile response:', error);
                    setLoading(false);
                }
            };

            socket.addEventListener('message', handleMessage);
            return () => socket.removeEventListener('message', handleMessage);
        } else {
            setLoading(false);
        }
    }, [socket]);

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 17) return 'Good Afternoon';
        return 'Good Evening';
    };

    const managerQuickActions = [
        { title: 'Employee Directory', icon: '👥', path: '/employeeListPage', description: 'Manage your workforce' },
        { title: 'Schedule Management', icon: '📅', path: '/enhanced-schedule', description: 'Create and manage shifts' },
        { title: 'Client Companies', icon: '🏢', path: '/manager-clients', description: 'Manage client relationships' },
        { title: 'Job Management', icon: '💼', path: '/manager-jobs', description: 'Oversee active projects' },
        { title: 'Timesheets', icon: '⏰', path: '/manager-timesheets', description: 'Review and approve hours' },
        { title: 'Shift Requests', icon: '📋', path: '/managerViewShiftsRequests', description: 'Handle worker requests' }
    ];

    const employeeQuickActions = [
        { title: 'My Profile', icon: '👤', path: '/employee-profile', description: 'Update your information' },
        { title: 'My Shifts', icon: '📅', path: '/shiftsPage', description: 'View your schedule' },
        { title: 'Request Shifts', icon: '✋', path: '/signInShifts', description: 'Submit availability' },
        { title: 'Crew Chief Dashboard', icon: '👷‍♂️', path: '/crew-chief-dashboard', description: 'Manage your crew', condition: userProfile?.role?.includes('Crew Chief') }
    ];

    const quickActions = isManager ? managerQuickActions : employeeQuickActions.filter(action => !action.condition || action.condition);

    if (loading) {
        return (
            <div className="authenticated-home loading">
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Loading your dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="authenticated-home">
            {/* Header Section */}
            <section className="dashboard-header">
                <div className="container">
                    <div className="header-content">
                        <div className="welcome-section">
                            <h1 className="welcome-title">
                                {getGreeting()}, {userProfile?.name || user?.username || 'User'}!
                            </h1>
                            <p className="welcome-subtitle">
                                Welcome to your Hands on Labor dashboard
                            </p>
                            <div className="user-info">
                                <span className="user-role">
                                    {isManager ? '👔 Manager' : '👷 Worker'}
                                </span>
                                {userProfile?.workplace && (
                                    <span className="user-workplace">
                                        📍 {userProfile.workplace}
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="header-actions">
                            <button onClick={handleLogout} className="logout-btn">
                                🚪 Sign Out
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Quick Actions Grid */}
            <section className="quick-actions-section">
                <div className="container">
                    <h2 className="section-title">Quick Actions</h2>
                    <div className="actions-grid">
                        {quickActions.map((action, index) => (
                            <Link 
                                key={index} 
                                to={action.path} 
                                className="action-card"
                            >
                                <div className="action-icon">{action.icon}</div>
                                <h3 className="action-title">{action.title}</h3>
                                <p className="action-description">{action.description}</p>
                                <div className="action-arrow">→</div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Recent Activity Section */}
            <section className="recent-activity-section">
                <div className="container">
                    <h2 className="section-title">Recent Activity</h2>
                    <div className="activity-cards">
                        <div className="activity-card">
                            <div className="activity-icon">📊</div>
                            <div className="activity-content">
                                <h3>System Status</h3>
                                <p>All systems operational</p>
                                <span className="activity-time">Just now</span>
                            </div>
                        </div>
                        <div className="activity-card">
                            <div className="activity-icon">🔔</div>
                            <div className="activity-content">
                                <h3>Welcome to EasyShifts</h3>
                                <p>Your dashboard is ready to use</p>
                                <span className="activity-time">Today</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Company Info Footer */}
            <section className="company-info-section">
                <div className="container">
                    <div className="company-info">
                        <div className="company-brand">
                            <h3>Hands on Labor</h3>
                            <p>Professional Staffing Solutions • San Diego, CA</p>
                        </div>
                        <div className="company-links">
                            <a href="https://handsonlabor.com" target="_blank" rel="noopener noreferrer">
                                🌐 Visit Website
                            </a>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default AuthenticatedHome;
