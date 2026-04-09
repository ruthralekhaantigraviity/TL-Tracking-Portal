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
        // BDE Specific
        project: '',
        officeVisits: 0,
        underInterview: 0,
        paymentProgress: 0,
        partialPaid: 0,
        joinedCompany: 0,
        // SBI Specific
        rnr: 0,
        od: 0,
        cardProcessing: 0,
        cardReceived: 0,
        // Insurance Specific
        insuranceConverted: 0,
        partialPaymentDone: 0,
        fullyPaid: 0
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
                // BDE Specific
                project: member.project || '',
                officeVisits: latest.officeVisits || 0,
                underInterview: latest.underInterview || 0,
                paymentProgress: latest.paymentProgress || 0,
                partialPaid: latest.partialPaid || 0,
                joinedCompany: latest.joinedCompany || 0,
                // SBI Specific
                rnr: latest.rnr || 0,
                od: latest.od || 0,
                cardProcessing: latest.cardProcessing || 0,
                cardReceived: latest.cardReceived || 0,
                // Insurance Specific
                insuranceConverted: latest.insuranceConverted || 0,
                partialPaymentDone: latest.partialPaymentDone || 0,
                fullyPaid: latest.fullyPaid || 0
            });
        }
    }, [member]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        const isNumeric = ['totalCallsToday', 'convertedCalls', 'paidCount', 'totalComplaints', 'completedTarget', 'dailyTarget', 'achievementRate', 'officeVisits', 'underInterview', 'paymentProgress', 'partialPaid', 'joinedCompany', 'rnr', 'od', 'cardProcessing', 'cardReceived', 'insuranceConverted', 'partialPaymentDone', 'fullyPaid'].includes(name);
        
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
                    <div className="form-grid">
                        {isAdmin && (
                            <div className="admin-manual-entry full-width" style={{ marginBottom: '1.5rem', border: '1px solid #6366f1', borderRadius: '12px', padding: '1rem', background: 'rgba(99, 102, 241, 0.05)', gridColumn: 'span 2' }}>
                                <div className="admin-header-badge" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6366f1', marginBottom: '10px', fontSize: '14px', fontWeight: 'bold' }}>
                                    <ShieldCheck size={18} />
                                    <span>Executive Administrative Override</span>
                                </div>
                                <textarea 
                                    name="comments" 
                                    value={formData.comments} 
                                    onChange={handleChange} 
                                    placeholder="Add manual performance summary, disciplinary notes, or administrative recognition..." 
                                    rows={3} 
                                    className="admin-textarea"
                                    style={{ width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '10px', color: 'var(--text-primary)', outline: 'none' }}
                                />
                            </div>
                        )}

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
                                    style={isSBITEAM ? { background: 'var(--bg-glass)', cursor: 'not-allowed' } : {}}
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
                                    <label><Phone size={14} /> Connected Calls</label>
                                    <input type="number" name="convertedCalls" value={formData.convertedCalls} onChange={handleChange} onFocus={(e) => e.target.select()} />
                                </div>
                                <div className="form-group">
                                    <label><AlertTriangle size={14} /> RNR</label>
                                    <input type="number" name="rnr" value={formData.rnr} onChange={handleChange} onFocus={(e) => e.target.select()} />
                                </div>
                                <div className="form-group">
                                    <label><ShieldCheck size={14} /> OD</label>
                                    <input type="number" name="od" value={formData.od} onChange={handleChange} onFocus={(e) => e.target.select()} />
                                </div>
                                <div className="form-group">
                                    <label><Clock size={14} /> Card Processing</label>
                                    <input type="number" name="cardProcessing" value={formData.cardProcessing} onChange={handleChange} onFocus={(e) => e.target.select()} />
                                </div>
                                <div className="form-group">
                                    <label><ThumbsUp size={14} /> Card Received</label>
                                    <input type="number" name="cardReceived" value={formData.cardReceived} onChange={handleChange} onFocus={(e) => e.target.select()} />
                                </div>
                            </>
                        ) : isBDETEAM ? (
                            <>
                                <div className="form-group">
                                    <label><Briefcase size={14} /> Project</label>
                                    <input type="text" name="project" value={formData.project} onChange={handleChange} placeholder="e.g. Asset Acquisition" />
                                </div>
                                <div className="form-group">
                                    <label><CheckCircle size={14} /> Connected</label>
                                    <input type="number" name="convertedCalls" value={formData.convertedCalls} onChange={handleChange} onFocus={(e) => e.target.select()} />
                                </div>
                                <div className="form-group">
                                    <label><User size={14} /> Office Visits</label>
                                    <input type="number" name="officeVisits" value={formData.officeVisits} onChange={handleChange} onFocus={(e) => e.target.select()} />
                                </div>
                                <div className="form-group">
                                    <label><Clock size={14} /> Under Interview</label>
                                    <input type="number" name="underInterview" value={formData.underInterview} onChange={handleChange} onFocus={(e) => e.target.select()} />
                                </div>
                                <div className="form-group">
                                    <label><DollarSign size={14} /> In Payment Progress</label>
                                    <input type="number" name="paymentProgress" value={formData.paymentProgress} onChange={handleChange} onFocus={(e) => e.target.select()} />
                                </div>
                                <div className="form-group">
                                    <label><AlertTriangle size={14} /> Partial Paid</label>
                                    <input type="number" name="partialPaid" value={formData.partialPaid} onChange={handleChange} onFocus={(e) => e.target.select()} />
                                </div>
                                <div className="form-group">
                                    <label><ThumbsUp size={14} /> Joined Company</label>
                                    <input type="number" name="joinedCompany" value={formData.joinedCompany} onChange={handleChange} onFocus={(e) => e.target.select()} />
                                </div>
                            </>
                        ) : member.team === 'Insurance' ? (
                            <>
                                <div className="form-group">
                                    <label><CheckCircle size={14} /> Connected</label>
                                    <input type="number" name="convertedCalls" value={formData.convertedCalls} onChange={handleChange} onFocus={(e) => e.target.select()} />
                                </div>
                                <div className="form-group">
                                    <label><AlertTriangle size={14} /> RNR</label>
                                    <input type="number" name="rnr" value={formData.rnr} onChange={handleChange} onFocus={(e) => e.target.select()} />
                                </div>
                                <div className="form-group">
                                    <label><TrendingUp size={14} /> Converted</label>
                                    <input type="number" name="insuranceConverted" value={formData.insuranceConverted} onChange={handleChange} onFocus={(e) => e.target.select()} />
                                </div>
                                <div className="form-group">
                                    <label><DollarSign size={14} /> Partial Payment Done</label>
                                    <input type="number" name="partialPaymentDone" value={formData.partialPaymentDone} onChange={handleChange} onFocus={(e) => e.target.select()} />
                                </div>
                                <div className="form-group">
                                    <label><ThumbsUp size={14} /> Fully Paid</label>
                                    <input type="number" name="fullyPaid" value={formData.fullyPaid} onChange={handleChange} onFocus={(e) => e.target.select()} />
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
                            <label><MessageSquare size={14} /> {!isAdmin ? 'Team Leader Comments' : 'Additional Remarks'}</label>
                            <textarea 
                                name="comments" 
                                value={formData.comments} 
                                onChange={handleChange} 
                                placeholder="Reasons for decline, feedback, suggestions..." 
                                rows={2} 
                                style={{
                                    background: 'var(--bg-glass)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '12px',
                                    padding: '0.75rem 1rem',
                                    color: 'var(--text-primary)',
                                    fontSize: '0.95rem',
                                    outline: 'none',
                                    width: '100%',
                                    resize: 'vertical'
                                }}
                            />
                        </div>
                    </div>

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
