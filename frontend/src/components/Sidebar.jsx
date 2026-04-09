import React from 'react';
import { LayoutDashboard, Users, User, LogOut, ChevronRight, Shield, UserPlus, Plus, RefreshCw } from 'lucide-react';
import '../styles/Sidebar.css';

const Sidebar = ({ activeTab, setActiveTab, onLogout, onResetData, user, selectedTeam, onAddAccount, onAddTeam, onAddMember }) => {
    const isAdministration = selectedTeam === 'Administration';
    const canManagePortal = user?.role === 'Admin' || user?.role === 'Manager';
    const isAdmin = user?.role === 'Admin';
    const isGlobalView = selectedTeam === 'All';
    const menuItems = [
        { id: 'dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
        { id: 'hr-team', icon: <Users size={20} />, label: 'Team' },
        { id: 'profile', icon: <User size={20} />, label: 'Performance' },
    ].filter(item => isAdministration ? item.id === 'profile' : true);

    return (
        <aside className="sidebar">
            <div className="sidebar-logo">
                <div className="logo-icon">P</div>
                <div className="logo-text">
                    <h2>Team Portal</h2>
                    <span className="role-tag"><Shield size={10} /> {user?.role || 'User'}</span>
                </div>
            </div>

            <nav className="sidebar-nav">
                {menuItems.map((item) => (
                    <button
                        key={item.id}
                        className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
                        onClick={() => setActiveTab(item.id)}
                    >
                        <span className="item-icon">{item.icon}</span>
                        <span className="item-label">{item.label}</span>
                        {activeTab === item.id && <ChevronRight size={16} className="active-indicator" />}
                    </button>
                ))}

                {canManagePortal && (
                    <>
                        <div className="nav-divider">Management</div>
                        
                        <button className="nav-item action-item" onClick={onAddAccount}>
                            <span className="item-icon"><Shield size={20} /></span>
                            <span className="item-label">Add Account</span>
                        </button>
                        
                        {isGlobalView ? (
                            <button className="nav-item action-item" onClick={onAddTeam}>
                                <span className="item-icon"><Plus size={20} /></span>
                                <span className="item-label">Add Team</span>
                            </button>
                        ) : (
                            <button className="nav-item action-item" onClick={onAddMember}>
                                <span className="item-icon"><UserPlus size={20} /></span>
                                <span className="item-label">Add Member</span>
                            </button>
                        )}

                        {isAdmin && (
                            <button className="nav-item action-item rest-nav-item" onClick={onResetData}>
                                <span className="item-icon"><RefreshCw size={20} /></span>
                                <span className="item-label">Reset Portal</span>
                            </button>
                        )}
                    </>
                )}
            </nav>

            <div className="sidebar-footer">
                <button className="nav-item logout" onClick={onLogout}>
                    <span className="item-icon"><LogOut size={20} /></span>
                    <span className="item-label">Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
