import React, { useState, useEffect } from 'react';
import { X, Save, Edit3, Target, Phone, DollarSign, Clock, AlertTriangle, CheckCircle, TrendingUp, MessageSquare, ShieldCheck, FileCheck, Truck, ThumbsUp, ThumbsDown, Briefcase, User } from 'lucide-react';
import '../styles/StatsEntryModal.css';

const StatsEntryModal = ({ member, onClose, onSave, user }) => {
    const [formData, setFormData] = useState({
        dailyTask: '',
        totalCallsToday: 0,
        callCategory: '',
        convertedCalls: 0,
        conversionSector: '',
        paidCount: 0,
        paidSector: '',
        workDuration: '',
        totalComplaints: 0,
        complaintReason: '',
        comments: '',
        achievementRate: 0,
        completedTarget: 0,
        dailyTarget: 0,
        // SBI Specific
        panVerified: 0,
        detailsVerified: 0,
        approvedCount: 0,
        declinedCount: 0,
        dispatchCompleted: 0,
        callsPicked: 0,
        callsNotPicked: 0,
        // BDE Specific
        companyName: '',
        rolePosition: ''
    });

    useEffect(() => {
        if (member) {
            const latest = member.performanceHistory[member.performanceHistory.length-1] || {};
            setFormData({
                dailyTask: member.dailyTask || '',
                totalCallsToday: latest.calls || 0,
                callCategory: latest.callCategory || member.callCategory || '',
                convertedCalls: member.convertedCalls || 0,
                conversionSector: member.conversionSector || '',
                paidCount: member.paidCount || 0,
                paidSector: member.paidSector || '',
                workDuration: member.workDuration || '',
                totalComplaints: member.totalComplaints || 0,
                complaintReason: member.complaintReason || '',
                comments: latest.comments || member.comments || '',
                achievementRate: member.achievementRate || 0,
                completedTarget: member.completedTarget || 0,
                dailyTarget: member.dailyTarget || 0,
                // SBI Specific
                panVerified: latest.panVerified || member.panVerified || 0,
                detailsVerified: latest.detailsVerified || member.detailsVerified || 0,
                approvedCount: latest.approvedCount || member.approvedCount || 0,
                declinedCount: latest.declinedCount || member.declinedCount || 0,
                dispatchCompleted: latest.dispatchCompleted || member.dispatchCompleted || 0,
                callsPicked: latest.callsPicked || 0,
                callsNotPicked: latest.callsNotPicked || 0,
                // BDE Specific
                companyName: member.companyName || '',
                rolePosition: member.rolePosition || ''
            });
        }
    }, [member]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        const isNumeric = ['totalCallsToday', 'convertedCalls', 'paidCount', 'totalComplaints', 'completedTarget', 'dailyTarget', 'achievementRate', 'panVerified', 'detailsVerified', 'approvedCount', 'declinedCount', 'dispatchCompleted', 'callsPicked', 'callsNotPicked'].includes(name);
        
        setFormData(prev => {
            const newValue = isNumeric ? Number(value) : value;
            const updated = { ...prev, [name]: newValue };
            
            // Auto-calculate total calls for SBI
            if (member.team === 'SBI' && (name === 'callsPicked' || name === 'callsNotPicked')) {
                updated.totalCallsToday = (updated.callsPicked || 0) + (updated.callsNotPicked || 0);
            }
            
            return updated;
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(member._id, formData);
    };

    if (!member) return null;

    const isSBITEAM = member.team === 'SBI';
    const isBDETEAM = member.team === 'BDE';
    const isAdmin = user?.role === 'Admin';

    return (
        <div className="modal-overlay">
            <div className="modal-content glass">
                <header className="modal-header">
                    <div className="header-title">
                        <Edit3 size={20} className="icon-purple" />
                        <h2>Update Performance: {member.name} ({member.team})</h2>
                    </div>
                    <button className="close-btn" onClick={onClose}>
                        <X size={24} />
                    </button>
                </header>

                <form onSubmit={handleSubmit} className="stats-form">
                    {isAdmin ? (
                        <div className="admin-manual-entry">
                            <div className="admin-header-badge">
                                <ShieldCheck size={18} />
                                <span>Administration Master Override</span>
                            </div>
                            <div className="form-group full-width">
                                <label><MessageSquare size={14} /> Administration Remarks & Manual Performance Data</label>
                                <textarea 
                                    name="comments" 
                                    value={formData.comments} 
                                    onChange={handleChange} 
                                    placeholder="Enter manual performance summary, disciplinary notes, or recognition here..." 
                                    rows={12} 
                                    className="admin-textarea"
                                />
                            </div>
                            <div className="admin-notice">
                                <AlertTriangle size={14} />
                                <span>As an administrator, your remarks will be directly recorded in the member's daily performance log.</span>
                            </div>
                        </div>
                    ) : (
                        <div className="form-grid">
                            <div className="form-group full-width">
                                <label><Target size={14} /> Today's Primary Task</label>
                                <input 
                                    type="text" 
                                    name="dailyTask" 
                                    value={formData.dailyTask} 
                                    onChange={handleChange}
                                    placeholder="e.g. Verification Process"
                                />
                            </div>

                            <div className="form-group">
                                <label><Phone size={14} /> Today's Total Calls</label>
                                <div className="dual-input">
                                    <input 
                                        type="number" 
                                        name="totalCallsToday" 
                                        value={formData.totalCallsToday} 
                                        onChange={handleChange}
                                        onFocus={(e) => e.target.select()}
                                        placeholder="Count"
                                        readOnly={isSBITEAM}
                                        style={isSBITEAM ? { background: 'rgba(99, 102, 241, 0.05)', cursor: 'not-allowed' } : {}}
                                    />

                                    <input 
                                        type="text" 
                                        name="callCategory" 
                                        value={formData.callCategory} 
                                        onChange={handleChange}
                                        placeholder="Purpose"
                                    />
                                </div>
                            </div>

                            {isSBITEAM ? (
                                <>
                                    <div className="form-group">
                                        <label style={{ color: '#10b981' }}><Phone size={14} /> Calls Picked</label>
                                        <input 
                                            type="number" 
                                            name="callsPicked" 
                                            value={formData.callsPicked} 
                                            onChange={handleChange}
                                            onFocus={(e) => e.target.select()}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label style={{ color: '#ef4444' }}><Phone size={14} /> Calls Not Picked</label>
                                        <input 
                                            type="number" 
                                            name="callsNotPicked" 
                                            value={formData.callsNotPicked} 
                                            onChange={handleChange}
                                            onFocus={(e) => e.target.select()}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label><ShieldCheck size={14} /> PAN Cards Verified</label>
                                        <input 
                                            type="number" 
                                            name="panVerified" 
                                            value={formData.panVerified} 
                                            onChange={handleChange}
                                            onFocus={(e) => e.target.select()}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label><FileCheck size={14} /> Details Verified</label>
                                        <input 
                                            type="number" 
                                            name="detailsVerified" 
                                            value={formData.detailsVerified} 
                                            onChange={handleChange}
                                            onFocus={(e) => e.target.select()}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label><ThumbsUp size={14} /> Approved Count</label>
                                        <input 
                                            type="number" 
                                            name="approvedCount" 
                                            value={formData.approvedCount} 
                                            onChange={handleChange}
                                            onFocus={(e) => e.target.select()}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label><ThumbsDown size={14} /> Declined Count</label>
                                        <input 
                                            type="number" 
                                            name="declinedCount" 
                                            value={formData.declinedCount} 
                                            onChange={handleChange}
                                            onFocus={(e) => e.target.select()}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label><Truck size={14} /> Dispatches Completed</label>
                                        <input 
                                            type="number" 
                                            name="dispatchCompleted" 
                                            value={formData.dispatchCompleted} 
                                            onChange={handleChange}
                                            onFocus={(e) => e.target.select()}
                                        />
                                    </div>
                                </>
                            ) : isBDETEAM ? (
                                <>
                                    <div className="form-group">
                                        <label><CheckCircle size={14} /> Converted Leads</label>
                                        <input 
                                            type="number" 
                                            name="convertedCalls" 
                                            value={formData.convertedCalls} 
                                            onChange={handleChange}
                                            onFocus={(e) => e.target.select()}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label><DollarSign size={14} /> Number of Joinings</label>
                                        <input 
                                            type="number" 
                                            name="paidCount" 
                                            value={formData.paidCount} 
                                            onChange={handleChange}
                                            onFocus={(e) => e.target.select()}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label><Briefcase size={14} /> Company Name</label>
                                        <input 
                                            type="text" 
                                            name="companyName" 
                                            value={formData.companyName} 
                                            onChange={handleChange}
                                            placeholder="e.g. ABC Corp"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label><User size={14} /> Role / Position</label>
                                        <input 
                                            type="text" 
                                            name="rolePosition" 
                                            value={formData.rolePosition} 
                                            onChange={handleChange}
                                            placeholder="e.g. Sales Executive"
                                        />
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="form-group">
                                        <label><CheckCircle size={14} /> Converted Calls</label>
                                        <div className="dual-input">
                                            <input 
                                                type="number" 
                                                name="convertedCalls" 
                                                value={formData.convertedCalls} 
                                                onChange={handleChange}
                                                onFocus={(e) => e.target.select()}
                                                placeholder="Count"
                                            />
                                            <input 
                                                type="text" 
                                                name="conversionSector" 
                                                value={formData.conversionSector} 
                                                onChange={handleChange}
                                                placeholder="Sector"
                                            />
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label><DollarSign size={14} /> Paid Conversions</label>
                                        <div className="dual-input">
                                            <input 
                                                type="number" 
                                                name="paidCount" 
                                                value={formData.paidCount} 
                                                onChange={handleChange}
                                                onFocus={(e) => e.target.select()}
                                                placeholder="Count"
                                            />
                                            <input 
                                                type="text" 
                                                name="paidSector" 
                                                value={formData.paidSector} 
                                                onChange={handleChange}
                                                placeholder="Sector"
                                            />
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label><AlertTriangle size={14} /> Complaints</label>
                                        <div className="dual-input">
                                            <input 
                                                type="number" 
                                                name="totalComplaints" 
                                                value={formData.totalComplaints} 
                                                onChange={handleChange}
                                                onFocus={(e) => e.target.select()}
                                                placeholder="Count"
                                            />
                                            <input 
                                                type="text" 
                                                name="complaintReason" 
                                                value={formData.complaintReason} 
                                                onChange={handleChange}
                                                placeholder="Reason"
                                            />
                                        </div>
                                    </div>
                                </>
                            )}

                            <div className="form-group">
                                <label><Clock size={14} /> Work Duration</label>
                                <input 
                                    type="text" 
                                    name="workDuration" 
                                    value={formData.workDuration} 
                                    onChange={handleChange}
                                    placeholder="e.g. 9h"
                                />
                            </div>

                            <div className="form-group">
                                <label><Target size={14} /> Completed Target</label>
                                <input 
                                    type="number" 
                                    name="completedTarget" 
                                    value={formData.completedTarget} 
                                    onChange={handleChange}
                                    onFocus={(e) => e.target.select()}
                                />
                            </div>

                            <div className="form-group">
                                <label><TrendingUp size={14} /> Daily Target</label>
                                <input 
                                    type="number" 
                                    name="dailyTarget" 
                                    value={formData.dailyTarget} 
                                    onChange={handleChange}
                                    onFocus={(e) => e.target.select()}
                                />
                            </div>

                            <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                <label><MessageSquare size={14} /> Team Leader Comments</label>
                                <textarea 
                                    name="comments" 
                                    value={formData.comments} 
                                    onChange={handleChange} 
                                    placeholder="Reasons for decline, feedback, suggestions..." 
                                    rows={2} 
                                    style={{
                                        background: 'rgba(255, 255, 255, 0.05)',
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                        borderRadius: '12px',
                                        padding: '0.75rem 1rem',
                                        color: '#fff',
                                        fontSize: '0.95rem',
                                        outline: 'none',
                                        width: '100%',
                                        resize: 'vertical'
                                    }}
                                />
                            </div>

                            <div className="form-group" style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '10px', borderRadius: '8px', alignSelf: 'end' }}>
                                <label style={{ color: '#6366f1', display: 'flex', justifyContent: 'space-between' }}>
                                    <span>Calculated Achievement Rate</span>
                                    <span style={{ fontWeight: 'bold' }}>{Math.round((formData.completedTarget / (formData.dailyTarget || 1)) * 100)}%</span>
                                </label>
                                <div className="progress-bar" style={{ marginTop: '8px' }}>
                                    <div 
                                        className="progress-fill" 
                                        style={{ 
                                            width: `${Math.min(100, (formData.completedTarget / (formData.dailyTarget || 1)) * 100)}%`,
                                            background: 'linear-gradient(90deg, #6366f1, #a855f7)'
                                        }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    )}


                    <footer className="modal-footer">
                        <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn-primary">
                            <Save size={18} />
                            Save Statistics
                        </button>
                    </footer>
                </form>
            </div>
        </div>
    );
};

export default StatsEntryModal;
