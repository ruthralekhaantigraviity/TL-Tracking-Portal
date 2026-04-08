import React, { useState } from 'react';
import { User, Lock, ArrowRight, ShieldCheck } from 'lucide-react';
import { login } from '../api/api';
import toast from 'react-hot-toast';
import '../styles/Login.css';

const Login = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await login(username.toLowerCase(), password);
      localStorage.setItem('token', data.token);

      localStorage.setItem('user', JSON.stringify(data.user));
      toast.success(`Welcome back, ${data.user.name}!`);
      onLoginSuccess(data.user);
    } catch (err) {
      toast.error(err.message || 'Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-container glass">
        <header className="login-header">
          <div className="logo-icon">
            <ShieldCheck size={32} />
          </div>
          <h1>Team Tracking Portal</h1>
          <p>Secure Team Leader Access & Oversight Hub</p>
        </header>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <label><User size={16} /> Username</label>
            <input 
              type="text" 
              placeholder="" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              required 
            />
          </div>

          <div className="input-group">
            <label><Lock size={16} /> Password</label>
            <input 
              type="password" 
              placeholder="" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Authenticating...' : 'Sign In to Portal'}
            <ArrowRight size={20} />
          </button>
        </form>

        <footer className="login-footer">
          <p className="copyright">© {new Date().getFullYear()} Forge India Connect</p>
        </footer>
      </div>
    </div>
  );
};

export default Login;
