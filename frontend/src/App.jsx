import React, { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { Sun, Moon } from 'lucide-react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import HRTeamList from './pages/HRTeamList';
import IndividualPerformance from './pages/IndividualPerformance';
import Login from './pages/Login';
import { seedData, getTeams, register } from './api/api';
import toast from 'react-hot-toast';
import { UserPlus, X } from 'lucide-react';

const AddUserModal = ({ isOpen, onClose }) => {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        name: '',
        designation: '',
        role: 'TL',
        assignedTeam: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [existingTeams, setExistingTeams] = useState(['SBI', 'BDE', 'Insurance', 'All', 'Administration']);

    useEffect(() => {
        const fetchTeams = async () => {
            try {
                const response = await getTeams();
                if (response.data) {
                    const teamNames = response.data.map(t => t.name);
                    setExistingTeams(prev => [...new Set([...prev, ...teamNames])]);
                }
            } catch (error) {
                console.error('Failed to fetch teams:', error);
            }
        };
        if (isOpen) fetchTeams();
    }, [isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await register(formData);
            toast.success('User account created successfully!');
            onClose();
            setFormData({ username: '', password: '', name: '', designation: '', role: 'TL', assignedTeam: '' });
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Failed to create user account';
            toast.error(errorMsg);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose} style={{ zIndex: 2000 }}>
            <div className="modal-content glass" onClick={e => e.stopPropagation()} style={{ maxWidth: '450px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <h3 style={{ margin: 0 }}>Create New User Account</h3>
                    <button className="close-btn" onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                        <X size={20} />
                    </button>
                </div>
                <p className="modal-subtitle" style={{ marginBottom: '20px', fontSize: '0.9rem', opacity: 0.7 }}>Generate login credentials for team members.</p>
                
                <form onSubmit={handleSubmit} className="add-member-form">
                    <div className="form-group" style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem' }}>Full Name</label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            placeholder="e.g. John Doe"
                            className="glass-input"
                            style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                        />
                    </div>

                    <div className="form-group" style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem' }}>Username</label>
                        <input
                            type="text"
                            required
                            value={formData.username}
                            onChange={(e) => setFormData({...formData, username: e.target.value.toLowerCase()})}
                            placeholder="login_username"
                            className="glass-input"
                            style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                        />
                    </div>

                    <div className="form-group" style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem' }}>Password</label>
                        <input
                            type="password"
                            required
                            value={formData.password}
                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                            placeholder="********"
                            className="glass-input"
                            style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                        <div className="form-group">
                            <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem' }}>Designation</label>
                            <input
                                type="text"
                                required
                                value={formData.designation}
                                onChange={(e) => setFormData({...formData, designation: e.target.value})}
                                placeholder="e.g. Team Leader"
                                className="glass-input"
                                style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                            />
                        </div>
                        <div className="form-group">
                            <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem' }}>Role</label>
                            <select
                                value={formData.role}
                                onChange={(e) => setFormData({...formData, role: e.target.value})}
                                className="glass-input"
                                style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                            >
                                <option value="TL" style={{ background: '#1e293b' }}>Team Leader</option>
                                <option value="Manager" style={{ background: '#1e293b' }}>Manager</option>
                                <option value="Admin" style={{ background: '#1e293b' }}>Administrator</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-group" style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem' }}>Assigned Team</label>
                        <select
                            required
                            value={formData.assignedTeam}
                            onChange={(e) => setFormData({...formData, assignedTeam: e.target.value})}
                            className="glass-input"
                            style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                        >
                            <option value="" style={{ background: '#1e293b' }}>Select Team</option>
                            {existingTeams.map(team => (
                                <option key={team} value={team} style={{ background: '#1e293b' }}>{team}</option>
                            ))}
                        </select>
                    </div>

                    <div className="modal-actions" style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                        <button type="button" className="btn-secondary" onClick={onClose} style={{ padding: '10px 20px', borderRadius: '8px', background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', cursor: 'pointer' }}>Cancel</button>
                        <button type="submit" className="btn-primary" disabled={isSubmitting} style={{ padding: '10px 20px', borderRadius: '8px', background: 'var(--accent-color)', border: 'none', color: 'white', cursor: 'pointer', opacity: isSubmitting ? 0.7 : 1 }}>
                            {isSubmitting ? 'Creating...' : 'Create Account'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedTeam, setSelectedTeam] = useState('HR'); 
  const [selectedMember, setSelectedMember] = useState(null);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [isAddTeamModalOpen, setIsAddTeamModalOpen] = useState(false);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);

  useEffect(() => {
    // Check if user is already logged in with a valid token
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (storedUser && token) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        
        // Restore context based on role
        if (parsedUser.role === 'TL') {
          setSelectedTeam(parsedUser.assignedTeam);
        } else if (parsedUser.role === 'Admin' || parsedUser.role === 'Manager') {
          setSelectedTeam('All');
        }
      } catch (err) {
        console.error('Session restoration failed:', err);
        handleLogout();
      }
    } else if (storedUser || token) {
      // Partial session detected, clear it
      handleLogout();
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    if (userData.role === 'Admin' || userData.role === 'Manager') {
      setSelectedTeam('All');
    } else {
      setSelectedTeam(userData.assignedTeam);
    }
  };

  if (!user) {
    return (
      <div className={`theme-wrapper ${theme}-theme`}>
        <Toaster position="top-right" />
        <div className="login-wrapper">
          <Login 
            onLoginSuccess={handleLoginSuccess} 
            theme={theme} 
            toggleTheme={toggleTheme} 
          />
        </div>
        <button 
          className="global-theme-toggle" 
          onClick={toggleTheme}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>
    );
  }

  const renderContent = () => {
    if (selectedMember) {
      return (
        <IndividualPerformance 
          member={selectedMember} 
          onBack={() => setSelectedMember(null)} 
          theme={theme}
        />
      );
    }

      case 'dashboard':
        return (
          <Dashboard 
            viewMode="overview" 
            selectedTeam={selectedTeam} 
            setSelectedTeam={setSelectedTeam} 
            user={user} 
            theme={theme} 
            toggleTheme={toggleTheme}
            isAddTeamModalOpen={isAddTeamModalOpen}
            setIsAddTeamModalOpen={setIsAddTeamModalOpen}
            isAddModalOpen={isAddMemberModalOpen}
            setIsAddModalOpen={setIsAddMemberModalOpen}
          />
        );
      case 'hr-team':
        return <HRTeamList onSelectMember={(member) => setSelectedMember(member)} selectedTeam={selectedTeam} theme={theme} />;
      case 'profile':
        return (
          <Dashboard 
            viewMode="performance" 
            selectedTeam={selectedTeam} 
            setSelectedTeam={setSelectedTeam} 
            user={user} 
            theme={theme} 
            toggleTheme={toggleTheme}
            isAddTeamModalOpen={isAddTeamModalOpen}
            setIsAddTeamModalOpen={setIsAddTeamModalOpen}
            isAddModalOpen={isAddMemberModalOpen}
            setIsAddModalOpen={setIsAddMemberModalOpen}
          />
        );
      default:
        return (
          <Dashboard 
            viewMode="overview" 
            selectedTeam={selectedTeam} 
            setSelectedTeam={setSelectedTeam} 
            user={user} 
            theme={theme} 
            toggleTheme={toggleTheme}
            isAddTeamModalOpen={isAddTeamModalOpen}
            setIsAddTeamModalOpen={setIsAddTeamModalOpen}
            isAddModalOpen={isAddMemberModalOpen}
            setIsAddModalOpen={setIsAddMemberModalOpen}
          />
        );
  };

  return (
    <div className={`app-container ${theme}-theme`}>
      <Toaster position="top-right" reverseOrder={false} />
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setSelectedMember(null);
        }} 
        onLogout={handleLogout}
        user={user}
        selectedTeam={selectedTeam}
        onAddAccount={() => setIsAddUserModalOpen(true)}
        onAddTeam={() => setIsAddTeamModalOpen(true)}
        onAddMember={() => setIsAddMemberModalOpen(true)}
      />
      <main className="main-content">
        {renderContent()}
      </main>
      
      {isAddUserModalOpen && (
        <AddUserModal 
          isOpen={isAddUserModalOpen} 
          onClose={() => setIsAddUserModalOpen(false)} 
        />
      )}
      <button 
        className="global-theme-toggle" 
        onClick={toggleTheme}
        title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      >
        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
      </button>
    </div>
  );
}

export default App;
