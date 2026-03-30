import React, { useEffect, useState } from 'react';
import { Search, Filter, ChevronRight, Phone, MessageSquare, Briefcase, Target, User } from 'lucide-react';
import '../styles/HRTeamList.css';
import { fetchMembers } from '../api/api';

const HRTeamList = ({ onSelectMember, selectedTeam }) => {
    const [members, setMembers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterDomain, setFilterDomain] = useState('All');

    useEffect(() => {
        const getMembers = async () => {
            try {
                const data = await fetchMembers(selectedTeam);
                setMembers(data);
            } catch (err) {
                console.error('Failed to fetch members:', err);
            }
        };
        getMembers();
    }, [selectedTeam]); // Re-fetch when team changes

    const filteredMembers = members.filter(member => {
        const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             member.designation.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterDomain === 'All' || member.domain === filterDomain;
        return matchesSearch && matchesFilter;
    });

    return (
        <div className="team-list-container">
            <header className="page-header">
                <div>
                    <h1>{selectedTeam} Team Members</h1>
                    <p>Select a member from the {selectedTeam} team to view detailed performance metrics</p>
                </div>
            </header>


            <div className="filter-bar">
                <div className="search-wrapper">
                    <Search size={18} />
                    <input 
                        type="text" 
                        placeholder="Search by name or role..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                {selectedTeam !== 'SBI' && (
                    <div className="filter-wrapper">
                        <Filter size={18} />
                        <select value={filterDomain} onChange={(e) => setFilterDomain(e.target.value)}>
                            <option value="All">All Domains</option>
                            <option value="Recruitment">Recruitment</option>
                            <option value="Employee Handling">Employee Handling</option>
                            <option value="Candidate Shortlisting">Candidate Shortlisting</option>
                            <option value="Client Handling">Client Handling</option>
                            <option value="Banking">Banking</option>
                            <option value="Manufacturing">Manufacturing</option>
                            <option value="Interviewing">Interviewing</option>
                        </select>
                    </div>
                )}
            </div>

            <div className="members-grid">
                {filteredMembers.map((member) => (
                    <div key={member._id} className="member-card glass" onClick={() => onSelectMember(member)}>
                        <div className="member-info">
                            <h3>{member.name}</h3>
                            <span className="designation">{member.designation}</span>
                            {selectedTeam !== 'SBI' && (
                                <div className="member-domain">
                                    <Briefcase size={14} />
                                    {member.domain}
                                </div>
                            )}
                        </div>
                        <div className="member-stats-preview">
                            <div className="stat-pill" title="Target Completion">
                                <Target size={12} />
                                {Math.round((member.completedTarget / member.dailyTarget) * 100) || 0}%
                            </div>
                            <div className="stat-pill" title="Clients Provided">
                                <User size={12} />
                                {member.clientsProvided}
                            </div>
                        </div>
                        <button className="view-details-btn">
                            View Profile
                            <ChevronRight size={16} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default HRTeamList;
