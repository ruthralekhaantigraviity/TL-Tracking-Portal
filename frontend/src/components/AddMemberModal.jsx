import React, { useState } from 'react';
import { X, UserPlus, Briefcase, User, Users } from 'lucide-react';


import '../styles/AddMemberModal.css';

const AddMemberModal = ({ isOpen, onClose, onAdd, defaultTeam = 'HR', teams = [] }) => {
    const [formData, setFormData] = useState({
        name: '',
        designation: '',
        domain: defaultTeam === 'SBI' ? 'Sales' : defaultTeam === 'BDE' ? 'Field Sales' : 'Recruitment',
        team: (!defaultTeam || defaultTeam === 'All') ? 'HR' : defaultTeam
    });

    if (!isOpen) return null;


    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const updated = { ...prev, [name]: value };
            
            // Auto-switch domain for SBI Team
            if (name === 'team' && value === 'SBI') {
                updated.domain = 'Sales';
            } else if (name === 'team' && value === 'BDE') {
                updated.domain = 'Field Sales';
            } else if (name === 'team' && value === 'HR') {
                updated.domain = 'Recruitment';
            }

            
            return updated;
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onAdd(formData);
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content glass add-member-modal">
                <header className="modal-header">
                    <div className="header-title">
                        <UserPlus size={20} className="icon-purple" />
                        <h2>Add New Team Member</h2>
                    </div>
                    <button className="close-btn" onClick={onClose}>
                        <X size={24} />
                    </button>
                </header>

                <form onSubmit={handleSubmit} className="stats-form">
                    <div className="form-group">
                        <label><User size={14} /> Full Name</label>
                        <input 
                            type="text" 
                            name="name" 
                            required 
                            value={formData.name} 
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label><Briefcase size={14} /> Designation</label>
                        <input 
                            type="text" 
                            name="designation" 
                            required 
                            value={formData.designation} 
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label><Briefcase size={14} /> Domain</label>
                        <select 
                            name="domain" 
                            value={formData.domain} 
                            onChange={handleChange}
                            className="modal-select"
                        >
                            <option value="All">All Domains</option>
                            <option value="Recruitment">Recruitment</option>
                            <option value="Sales">Sales</option>
                            <option value="Employee Handling">Employee Handling</option>
                            <option value="Candidate Shortlisting">Candidate Shortlisting</option>
                            <option value="Client Handling">Client Handling</option>
                            <option value="Banking">Banking</option>
                            <option value="Manufacturing">Manufacturing</option>
                            <option value="Interviewing">Interviewing</option>
                        </select>

                    </div>

                    <div className="form-group">
                        <label><Users size={14} /> Assign Team</label>
                        <select 
                            name="team" 
                            value={formData.team} 
                            onChange={handleChange}
                            className="modal-select"
                        >
                            {teams.length > 0 ? (
                                teams.map(team => (
                                    <option key={team._id} value={team.name}>{team.name} Team</option>
                                ))
                            ) : (
                                <>
                                    <option value="HR">HR Team</option>
                                    <option value="SBI">SBI Team</option>
                                    <option value="BDE">BDE Team</option>
                                    <option value="IT">IT Team</option>
                                    <option value="Administration">Administration</option>
                                    <option value="Sales">Sales Team</option>
                                </>
                            )}
                        </select>

                    </div>



                    <footer className="modal-footer">
                        <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn-primary">
                            <UserPlus size={18} />
                            Create Member
                        </button>
                    </footer>
                </form>
            </div>
        </div>
    );
};

export default AddMemberModal;
