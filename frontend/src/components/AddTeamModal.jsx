import React, { useState } from 'react';
import { X, Users, Globe, FileText, Plus } from 'lucide-react';
import '../styles/AddTeamModal.css';

const AddTeamModal = ({ isOpen, onClose, onAdd, theme }) => {
    const [formData, setFormData] = useState({
        name: '',
        domain: '',
        description: ''
    });

    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onAdd(formData);
            setFormData({ name: '', domain: '', description: '' });
            onClose();
        } catch (error) {
            console.error('Error adding team:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className={`modal-content add-team-modal ${theme === 'light' ? 'light-theme' : ''}`}>
                <div className="modal-header">
                    <div className="header-title">
                        <div className="icon-wrapper team-icon">
                            <Plus size={24} />
                        </div>
                        <div>
                            <h2>Add New Team</h2>
                            <p>Initialize a new department unit</p>
                        </div>
                    </div>
                    <button className="close-btn" onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="team-form">
                    <div className="form-grid">
                        <div className="form-group">
                            <label><Users size={16} /> Team Name</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g., Marketing, Sales"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label><Globe size={16} /> Primary Domain</label>
                            <input
                                type="text"
                                value={formData.domain}
                                onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                                placeholder="e.g., Digital Outreach"
                                required
                            />
                        </div>

                        <div className="form-group full-width">
                            <label><FileText size={16} /> Description</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Provide a brief overview of the team's objectives..."
                                rows={3}
                            />
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? 'Initializing...' : 'Add Team Unit'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddTeamModal;
