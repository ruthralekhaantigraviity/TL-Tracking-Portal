import React, { useState, useEffect } from 'react';
import { UserPlus, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { register, getTeams } from '../api/api';

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
        const fetchTeamsData = async () => {
            try {
                const response = await getTeams();
                if (response) {
                    const teamNames = response.map(t => t.name);
                    setExistingTeams(prev => [...new Set([...prev, ...teamNames])]);
                }
            } catch (error) {
                console.error('Failed to fetch teams:', error);
            }
        };
        if (isOpen) fetchTeamsData();
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

export default AddUserModal;
