import React, { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
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

  useEffect(() => {
    // Check if user is already logged in
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      // Auto-set team for TLs
      if (parsedUser.role === 'TL') {
        setSelectedTeam(parsedUser.assignedTeam);
      }
    }

    // Initial data seeding
    const initData = async () => {
      try {
        await seedData();
      } catch (err) {
        console.error('Initialization error:', err);
      }
    };
    initData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    if (userData.role === 'TL') {
      setSelectedTeam(userData.assignedTeam);
    } else if (userData.assignedTeam !== 'All') {
      setSelectedTeam(userData.assignedTeam);
    }
  };

  if (!user) {
    return (
      <>
        <Toaster position="top-right" />
        <Login onLoginSuccess={handleLoginSuccess} />
      </>
    );
  }

  const renderContent = () => {
    if (selectedMember) {
      return (
        <IndividualPerformance 
          member={selectedMember} 
          onBack={() => setSelectedMember(null)} 
        />
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return <Dashboard viewMode="overview" selectedTeam={selectedTeam} setSelectedTeam={setSelectedTeam} user={user} />;
      case 'hr-team':
        return <HRTeamList onSelectMember={(member) => setSelectedMember(member)} selectedTeam={selectedTeam} />;
      case 'profile':
        return <Dashboard viewMode="performance" selectedTeam={selectedTeam} setSelectedTeam={setSelectedTeam} user={user} />;
      default:
        return <Dashboard viewMode="overview" selectedTeam={selectedTeam} setSelectedTeam={setSelectedTeam} user={user} />;
    }
  };

  return (
    <div className="app-container">
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
    </div>
  );
}

export default App;
