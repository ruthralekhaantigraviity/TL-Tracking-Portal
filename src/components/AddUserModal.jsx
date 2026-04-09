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
            <div className="modal-content glass animate-enter" onClick={e => e.stopPropagation()} style={{ maxWidth: '480px', padding: '30px' }}>
                <div style={{ display: 'flex', gap: '15px', marginBottom: '8px' }}>
                    <div style={{ 
                        width: '40px', height: '40px', borderRadius: '12px', background: 'var(--accent-primary)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white'
                    }}>
                        <UserPlus size={22} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 700, lineHeight: 1.2, color: 'var(--text-primary)' }}>Create New <br/>User Account</h3>
                            <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '5px' }}>
                                <X size={20} />
                            </button>
                        </div>
                    </div>
                </div>
                
                <p style={{ marginBottom: '25px', fontSize: '0.9rem', color: 'var(--text-secondary)', marginLeft: '55px' }}>
                    Generate portal credentials for team members.
                </p>
                
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div className="form-group">
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>Full Name</label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            placeholder="e.g. John Doe"
                            style={{ 
                                width: '100%', padding: '12px 16px', borderRadius: '10px', 
                                background: 'var(--input-bg)', border: '1px solid var(--border-color)', 
                                color: 'var(--text-primary)', outline: 'none', transition: 'border-color 0.2s'
                            }}
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                        <div className="form-group">
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>Username</label>
                            <input
                                type="text"
                                required
                                value={formData.username}
                                onChange={(e) => setFormData({...formData, username: e.target.value.toLowerCase()})}
                                placeholder="username"
                                style={{ 
                                    width: '100%', padding: '12px 16px', borderRadius: '10px', 
                                    background: 'var(--input-bg)', border: '1px solid var(--border-color)', 
                                    color: 'var(--text-primary)', outline: 'none'
                                }}
                            />
                        </div>

                        <div className="form-group">
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>Password</label>
                            <input
                                type="password"
                                required
                                value={formData.password}
                                onChange={(e) => setFormData({...formData, password: e.target.value})}
                                placeholder="********"
                                style={{ 
                                    width: '100%', padding: '12px 16px', borderRadius: '10px', 
                                    background: 'var(--input-bg)', border: '1px solid var(--border-color)', 
                                    color: 'var(--text-primary)', outline: 'none'
                                }}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '60% 1fr', gap: '15px' }}>
                        <div className="form-group">
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>Designation</label>
                            <input
                                type="text"
                                required
                                value={formData.designation}
                                onChange={(e) => setFormData({...formData, designation: e.target.value})}
                                placeholder="e.g. TL - BDE"
                                style={{ 
                                    width: '100%', padding: '12px 16px', borderRadius: '10px', 
                                    background: 'var(--input-bg)', border: '1px solid var(--border-color)', 
                                    color: 'var(--text-primary)', outline: 'none'
                                }}
                            />
                        </div>
                        <div className="form-group">
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>Role</label>
                            <select
                                value={formData.role}
                                onChange={(e) => setFormData({...formData, role: e.target.value})}
                                style={{ 
                                    width: '100%', padding: '12px 10px', borderRadius: '10px', 
                                    background: 'var(--bg-glass-heavy)', border: '1px solid var(--border-color)', 
                                    color: 'var(--text-primary)', outline: 'none', cursor: 'pointer'
                                }}
                            >
                                <option value="TL" style={{ background: 'var(--bg-sidebar)', color: 'var(--text-primary)' }}>TL</option>
                                <option value="Manager" style={{ background: 'var(--bg-sidebar)', color: 'var(--text-primary)' }}>Manager</option>
                                <option value="Admin" style={{ background: 'var(--bg-sidebar)', color: 'var(--text-primary)' }}>Admin</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-group" style={{ marginBottom: '10px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>Assigned Team</label>
                        <select
                            required
                            value={formData.assignedTeam}
                            onChange={(e) => setFormData({...formData, assignedTeam: e.target.value})}
                            style={{ 
                                width: '100%', padding: '12px 16px', borderRadius: '10px', 
                                background: 'var(--bg-glass-heavy)', border: '1px solid var(--border-color)', 
                                color: 'var(--text-primary)', outline: 'none', cursor: 'pointer'
                            }}
                        >
                            <option value="" style={{ background: 'var(--bg-sidebar)', color: 'var(--text-primary)' }}>Select Team</option>
                            {existingTeams.map(team => (
                                <option key={team} value={team} style={{ background: 'var(--bg-sidebar)', color: 'var(--text-primary)' }}>{team}</option>
                            ))}
                        </select>
                    </div>

                    <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                        <button type="button" onClick={onClose} style={{ 
                            flex: 1, padding: '12px', borderRadius: '12px', background: 'var(--bg-glass)', 
                            border: '1px solid var(--border-color)', color: 'var(--text-primary)', cursor: 'pointer', fontWeight: 600
                        }}>
                            Cancel
                        </button>
                        <button type="submit" disabled={isSubmitting} style={{ 
                            flex: 2, padding: '12px', borderRadius: '12px', background: 'linear-gradient(135deg, #6366f1, #a855f7)', 
                            border: 'none', color: 'white', cursor: 'pointer', fontWeight: 700,
                            boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)', opacity: isSubmitting ? 0.7 : 1
                        }}>
                            {isSubmitting ? 'Creating...' : 'Create Account'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddUserModal;
