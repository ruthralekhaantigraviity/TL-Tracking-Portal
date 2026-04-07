import React, { useState, useEffect } from 'react';
import { User, Lock, ArrowRight, ShieldCheck, Mail, Briefcase, Users, Plus } from 'lucide-react';
import { register, fetchTeams } from '../api/api';
import toast from 'react-hot-toast';
import '../styles/Register.css';

const Register = ({ onRegisterSuccess, onBackToLogin }) => {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        name: '',
        role: 'TL',
        designation: '',
        assignedTeam: 'HR'
    });
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const getTeams = async () => {
            try {
                const data = await fetchTeams();
                setTeams(data);
                if (data.length > 0) {
                    setFormData(prev => ({ ...prev, assignedTeam: data[0].name }));
                }
            } catch (err) {
                console.error('Failed to fetch teams:', err);
            }
        };
        getTeams();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const data = await register(formData);
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            toast.success(`Account created! Welcome, ${data.user.name}`);
            onRegisterSuccess(data.user);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Registration failed. Please check your inputs.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="register-wrapper">
            <div className="register-container glass">
                <header className="register-header">
                    <div className="logo-icon">
                        <ShieldCheck size={32} />
                    </div>
                    <h1>Create Portal Account</h1>
                    <p>Initialize your session for team tracking operations</p>
                </header>

                <form onSubmit={handleSubmit} className="register-form">
                    <div className="input-group">
                        <label><User size={16} /> Full Name</label>
                        <input 
                            name="name"
                            type="text" 
                            placeholder="e.g. John Doe"
                            value={formData.name} 
                            onChange={handleChange} 
                            required 
                        />
                    </div>

                    <div className="input-group">
                        <label><Mail size={16} /> Username</label>
                        <input 
                            name="username"
                            type="text" 
                            placeholder="unique username"
                            value={formData.username} 
                            onChange={handleChange} 
                            required 
                        />
                    </div>

                    <div className="input-group">
                        <label><Lock size={16} /> Password</label>
                        <input 
                            name="password"
                            type="password" 
                            placeholder="min. 6 characters"
                            value={formData.password} 
                            onChange={handleChange} 
                            required 
                        />
                    </div>

                    <div className="input-group">
                        <label><Briefcase size={16} /> Designation</label>
                        <input 
                            name="designation"
                            type="text" 
                            placeholder="e.g. Senior Team Lead"
                            value={formData.designation} 
                            onChange={handleChange} 
                            required 
                        />
                    </div>

                    <div className="input-group">
                        <label><ShieldCheck size={16} /> Access Role</label>
                        <select name="role" value={formData.role} onChange={handleChange}>
                            <option value="TL">Team Leader (TL)</option>
                            <option value="Manager">Operations Manager</option>
                            <option value="Admin">Portal Administrator</option>
                        </select>
                    </div>

                    <div className="input-group">
                        <label><Users size={16} /> Assigned Team</label>
                        <select name="assignedTeam" value={formData.assignedTeam} onChange={handleChange}>
                            <option value="All">All Operations</option>
                            {teams.map(team => (
                                <option key={team._id} value={team.name}>{team.name} Department</option>
                            ))}
                        </select>
                    </div>

                    <button type="submit" className="register-btn" disabled={loading}>
                        {loading ? 'Initializing...' : 'Create Account & Sign In'}
                        <ArrowRight size={20} />
                    </button>

                    <footer className="register-footer">
                        <p>Already have an account? <span className="register-link" onClick={onBackToLogin}>Sign In</span></p>
                    </footer>
                </form>
            </div>
        </div>
    );
};

export default Register;
