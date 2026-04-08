import React, { useState, useEffect } from 'react'; // HMR trigger
import { Toaster } from 'react-hot-toast';
import { Sun, Moon } from 'lucide-react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import HRTeamList from './pages/HRTeamList';
import IndividualPerformance from './pages/IndividualPerformance';
import Login from './pages/Login';
import AddUserModal from './components/AddUserModal';
import { seedData, getTeams, register } from './api/api';
import toast from 'react-hot-toast';
import { Sun, Moon } from 'lucide-react';

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

  const handleResetData = async () => {
    if (window.confirm('WARNING: This will clear ALL existing data and reset the portal with sample members and teams. Proceed?')) {
      const loading = toast.loading('Resetting portal...');
      try {
        await seedData();
        toast.success('Portal Reset Successful!', { id: loading });
        window.location.reload(); 
      } catch (err) {
        toast.error('Failed to reset portal', { id: loading });
        console.error(err);
      }
    }
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

    switch (activeTab) {
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
    }
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
        onResetData={handleResetData}
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
