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
        assignedTeam: 'All'
    });
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Teams fetching removed as per manual assignment requirement
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await register(formData);
            toast.success(`Account created! Please sign in.`);
            onBackToLogin();
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

                    <div className="input-group full-width">
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

                    <button type="submit" className="register-btn" disabled={loading}>
                        {loading ? 'Initializing...' : 'Create Account'}
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
