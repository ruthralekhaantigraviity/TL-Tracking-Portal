import React, { useState, useEffect } from 'react';
import { X, User, Lock, ShieldCheck, Mail, Briefcase, Users, Plus, CheckCircle } from 'lucide-react';
import { register, fetchTeams } from '../api/api';
import toast from 'react-hot-toast';
import '../styles/AddUserModal.css';

const AddUserModal = ({ isOpen, onClose, onUserAdded }) => {
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
        if (isOpen) {
            const getTeams = async () => {
                try {
                    const data = await fetchTeams();
                    setTeams(data);
                } catch (err) {
                    console.error('Failed to fetch teams:', err);
                }
            };
            getTeams();
        }
    }, [isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const data = await register(formData);
            toast.success(`Account created for ${data.user.name}`);
            onUserAdded(data.user);
            setFormData({
                username: '',
                password: '',
                name: '',
                role: 'TL',
                designation: '',
                assignedTeam: 'All'
            });
            onClose();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content glass add-user-modal">
                <header className="modal-header">
                    <div className="modal-title-area">
                        <div className="team-icon" style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)' }}>
                            <ShieldCheck size={24} />
                        </div>
                        <div>
                            <h2>Create New Account</h2>
                            <p>Generate login credentials for team members</p>
                        </div>
                    </div>
                    <button className="close-btn" onClick={onClose}>
                        <X size={20} />
                    </button>
                </header>

                <form onSubmit={handleSubmit} className="user-form">
                    <div className="input-group">
                        <label><User size={16} /> Full Name</label>
                        <input 
                            name="name"
                            type="text" 
                            placeholder="e.g. Jane Smith"
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
                            placeholder="login username"
                            value={formData.username} 
                            onChange={handleChange} 
                            required 
                        />
                    </div>

                    <div className="input-group">
                        <label><Lock size={16} /> Initial Password</label>
                        <input 
                            name="password"
                            type="password" 
                            placeholder="min. 6 chars"
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
                            placeholder="e.g. Sales Manager"
                            value={formData.designation} 
                            onChange={handleChange} 
                            required 
                        />
                    </div>

                    <div className="input-group">
                        <label><ShieldCheck size={16} /> User Role</label>
                        <select name="role" value={formData.role} onChange={handleChange}>
                            <option value="TL">Team Leader (TL)</option>
                            <option value="Manager">Operations Manager</option>
                            <option value="Admin">Portal Administrator</option>
                        </select>
                    </div>

                    <div className="input-group">
                        <label><Users size={16} /> Assigned Dashboard</label>
                        <select name="assignedTeam" value={formData.assignedTeam} onChange={handleChange}>
                            <option value="All">Global Overview</option>
                            {teams.map(team => (
                                <option key={team._id} value={team.name}>{team.name} Department</option>
                            ))}
                        </select>
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="cancel-btn" onClick={onClose}>Cancel</button>
                        <button type="submit" className="submit-btn" disabled={loading}>
                            {loading ? 'Creating...' : 'Create Account'}
                            <Plus size={20} />
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddUserModal;
