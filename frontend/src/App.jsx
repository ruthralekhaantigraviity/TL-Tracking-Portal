import React, { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { Sun, Moon } from 'lucide-react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import HRTeamList from './pages/HRTeamList';
import IndividualPerformance from './pages/IndividualPerformance';
import Login from './pages/Login';
import { seedData } from './api/api';

function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedTeam, setSelectedTeam] = useState('HR'); 
  const [selectedMember, setSelectedMember] = useState(null);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    // Check if user is already logged in
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      // Auto-set team for TLs, default to 'All' for Admin/Manager
      if (parsedUser.role === 'TL') {
        setSelectedTeam(parsedUser.assignedTeam);
      } else if (parsedUser.role === 'Admin' || parsedUser.role === 'Manager') {
        setSelectedTeam('All');
      }
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
          <Login onLoginSuccess={handleLoginSuccess} theme={theme} toggleTheme={toggleTheme} />
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
        return <Dashboard viewMode="overview" selectedTeam={selectedTeam} setSelectedTeam={setSelectedTeam} user={user} theme={theme} toggleTheme={toggleTheme} />;
      case 'hr-team':
        return <HRTeamList onSelectMember={(member) => setSelectedMember(member)} selectedTeam={selectedTeam} theme={theme} />;
      case 'profile':
        return <Dashboard viewMode="performance" selectedTeam={selectedTeam} setSelectedTeam={setSelectedTeam} user={user} theme={theme} toggleTheme={toggleTheme} />;
      default:
        return <Dashboard viewMode="overview" selectedTeam={selectedTeam} setSelectedTeam={setSelectedTeam} user={user} theme={theme} toggleTheme={toggleTheme} />;
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
        user={user}
        selectedTeam={selectedTeam}
      />
      <main className="main-content">
        {renderContent()}
      </main>
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
