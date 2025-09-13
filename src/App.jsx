import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import './styles.css';

const App = () => {
  const [competenceGoals, setCompetenceGoals] = useState({});
  const [selectedGoal, setSelectedGoal] = useState('');
  const [activityData, setActivityData] = useState({
    title: '',
    description: '',
    duration: '',
    materials: '',
    method: '',
    evaluation: '',
    reflection: ''
  });
  const [savedActivities, setSavedActivities] = useState([]);
  const [saveStatus, setSaveStatus] = useState('idle'); // 'idle', 'saving', 'success', 'error'
  const [collapsedSections, setCollapsedSections] = useState({
    summary: false,
    profile: false,
    goals: false
  });

  // Load kompetencemål ved app start
  useEffect(() => {
    fetch('/kompetencemal.json')
      .then(response => response.json())
      .then(data => setCompetenceGoals(data))
      .catch(error => console.error('Fejl ved indlæsning af kompetencemål:', error));
  }, []);

  // Load gemte aktiviteter fra localStorage
  useEffect(() => {
    const saved = localStorage.getItem('savedActivities');
    if (saved) {
      setSavedActivities(JSON.parse(saved));
    }
  }, []);

  const handleInputChange = (field, value) => {
    setActivityData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const saveActivity = () => {
    if (!selectedGoal || !activityData.title) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 2000);
      return;
    }

    setSaveStatus('saving');
    
    setTimeout(() => {
      const newActivity = {
        id: Date.now(),
        goal: selectedGoal,
        ...activityData,
        createdAt: new Date().toISOString()
      };

      const updatedActivities = [...savedActivities, newActivity];
      setSavedActivities(updatedActivities);
      localStorage.setItem('savedActivities', JSON.stringify(updatedActivities));
      
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 2000);
      
      // Reset form
      setActivityData({
        title: '',
        description: '',
        duration: '',
        materials: '',
        method: '',
        evaluation: '',
        reflection: ''
      });
    }, 500);
  };

  const deleteActivity = (id) => {
    const updatedActivities = savedActivities.filter(activity => activity.id !== id);
    setSavedActivities(updatedActivities);
    localStorage.setItem('savedActivities', JSON.stringify(updatedActivities));
  };

  const exportToPDF = () => {
    const pdf = new jsPDF();
    let yPosition = 20;

    pdf.setFontSize(20);
    pdf.text('Pædagogiske Aktiviteter', 20, yPosition);
    yPosition += 20;

    savedActivities.forEach((activity, index) => {
      if (yPosition > 250) {
        pdf.addPage();
        yPosition = 20;
      }

      pdf.setFontSize(16);
      pdf.text(`${index + 1}. ${activity.title}`, 20, yPosition);
      yPosition += 10;

      pdf.setFontSize(12);
      pdf.text(`Kompetencemål: ${activity.goal}`, 20, yPosition);
      yPosition += 8;

      if (activity.description) {
        const descLines = pdf.splitTextToSize(`Beskrivelse: ${activity.description}`, 170);
        pdf.text(descLines, 20, yPosition);
        yPosition += descLines.length * 6;
      }

      yPosition += 10;
    });

    pdf.save('paedagogiske-aktiviteter.pdf');
  };

  const toggleSection = (section) => {
    setCollapsedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const getButtonStyle = () => {
    const baseStyle = {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem',
      padding: '0.75rem 1.5rem',
      border: 'none',
      borderRadius: '8px',
      fontSize: '1rem',
      fontWeight: '600',
      fontFamily: 'inherit',
      cursor: saveStatus === 'saving' ? 'not-allowed' : 'pointer',
      transition: 'all 0.3s ease',
      textDecoration: 'none',
      minHeight: '44px',
      opacity: saveStatus === 'saving' ? 0.6 : 1
    };

    switch (saveStatus) {
      case 'success':
        return {
          ...baseStyle,
          backgroundColor: '#10b981',
          color: 'white',
          boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)',
          transform: 'scale(1.02)'
        };
      case 'error':
        return {
          ...baseStyle,
          backgroundColor: '#ef4444',
          color: 'white',
          boxShadow: '0 2px 8px rgba(239, 68, 68, 0.3)'
        };
      default:
        return {
          ...baseStyle,
          backgroundColor: '#3b82f6',
          color: 'white',
          boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)'
        };
    }
  };

  const getButtonText = () => {
    switch (saveStatus) {
      case 'saving':
        return '💾 Gemmer...';
      case 'success':
        return '✅ Gemt!';
      case 'error':
        return '❌ Fejl - Udfyld titel';
      default:
        return '💾 Gem aktivitet';
    }
  };

  return (
    <div className="container">
      <header className="header">
        <h1>🎓 Læringsassistent</h1>
        <p>Planlæg pædagogiske aktiviteter baseret på kompetencemål</p>
      </header>

      <div className="grid grid-2">
        {/* Vælg kompetencemål */}
        <div className="card">
          <div 
            className="section-header" 
            onClick={() => toggleSection('goals')}
          >
            <h2>
              🎯 Vælg kompetencemål
            </h2>
            <span className={`collapse-icon ${collapsedSections.goals ? 'collapsed' : ''}`}>
              ▼
            </span>
          </div>
          
          {!collapsedSections.goals && (
            <div className="fade-in">
              <div className="form-group">
                <label htmlFor="goal-select">Kompetencemål:</label>
                <select 
                  id="goal-select"
                  value={selectedGoal} 
                  onChange={(e) => setSelectedGoal(e.target.value)}
                >
                  <option value="">Vælg et kompetencemål...</option>
                  {Object.keys(competenceGoals).map(goal => (
                    <option key={goal} value={goal}>{goal}</option>
                  ))}
                </select>
              </div>

              {selectedGoal && competenceGoals[selectedGoal] && (
                <div className="goal-details fade-in">
                  <h3>📋 Kompetencemål:</h3>
                  <p><strong>{competenceGoals[selectedGoal].kompetencemål}</strong></p>
                  
                  <h4>📚 Vidensmål:</h4>
                  <ul className="goal-list">
                    {competenceGoals[selectedGoal].vidensmål.map((mål, index) => (
                      <li key={index} className="goal-item">• {mål}</li>
                    ))}
                  </ul>
                  
                  <h4>🛠️ Færdighedsmål:</h4>
                  <ul className="goal-list">
                    {competenceGoals[selectedGoal].færdighedsmål.map((mål, index) => (
                      <li key={index} className="goal-item">• {mål}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Planlæg aktivitet */}
        <div className="card">
          <div 
            className="section-header"
            onClick={() => toggleSection('profile')}
          >
            <h2>
              ✏️ Planlæg aktivitet
            </h2>
            <span className={`collapse-icon ${collapsedSections.profile ? 'collapsed' : ''}`}>
              ▼
            </span>
          </div>
          
          {!collapsedSections.profile && (
            <div className="fade-in">
              <div className="form-group">
                <label htmlFor="title">Titel på aktivitet:</label>
                <input
                  id="title"
                  type="text"
                  value={activityData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="F.eks. Naturens farver - udforskende leg"
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Beskrivelse:</label>
                <textarea
                  id="description"
                  value={activityData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Beskriv aktiviteten i detaljer..."
                />
              </div>

              <div className="form-group">
                <label htmlFor="duration">Varighed:</label>
                <input
                  id="duration"
                  type="text"
                  value={activityData.duration}
                  onChange={(e) => handleInputChange('duration', e.target.value)}
                  placeholder="F.eks. 45 minutter"
                />
              </div>

              <div className="form-group">
                <label htmlFor="materials">Materialer:</label>
                <textarea
                  id="materials"
                  value={activityData.materials}
                  onChange={(e) => handleInputChange('materials', e.target.value)}
                  placeholder="Liste over nødvendige materialer..."
                />
              </div>

              <div className="form-group">
                <label htmlFor="method">Metode/Fremgangsmåde:</label>
                <textarea
                  id="method"
                  value={activityData.method}
                  onChange={(e) => handleInputChange('method', e.target.value)}
                  placeholder="Hvordan gennemføres aktiviteten?"
                />
              </div>

              <div className="form-group">
                <label htmlFor="evaluation">Evaluering:</label>
                <textarea
                  id="evaluation"
                  value={activityData.evaluation}
                  onChange={(e) => handleInputChange('evaluation', e.target.value)}
                  placeholder="Hvordan evalueres aktiviteten?"
                />
              </div>

              <div className="form-group">
                <label htmlFor="reflection">Refleksion:</label>
                <textarea
                  id="reflection"
                  value={activityData.reflection}
                  onChange={(e) => handleInputChange('reflection', e.target.value)}
                  placeholder="Refleksioner og læring..."
                />
              </div>

              <button
                style={getButtonStyle()}
                onClick={saveActivity}
                disabled={saveStatus === 'saving'}
              >
                {getButtonText()}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Gemte aktiviteter */}
      {savedActivities.length > 0 && (
        <div className="card">
          <div 
            className="section-header"
            onClick={() => toggleSection('summary')}
          >
            <h2>
              📚 Gemte aktiviteter ({savedActivities.length})
            </h2>
            <span className={`collapse-icon ${collapsedSections.summary ? 'collapsed' : ''}`}>
              ▼
            </span>
          </div>
          
          {!collapsedSections.summary && (
            <div className="fade-in">
              <div style={{ marginBottom: '1rem' }}>
                <button className="btn btn-primary" onClick={exportToPDF}>
                  📄 Eksporter til PDF
                </button>
              </div>
              
              <div className="grid">
                {savedActivities.map(activity => (
                  <div key={activity.id} className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                      <h3 style={{ margin: 0, color: '#667eea' }}>{activity.title}</h3>
                      <button 
                        onClick={() => deleteActivity(activity.id)}
                        style={{
                          background: '#ef4444',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          padding: '0.25rem 0.5rem',
                          cursor: 'pointer',
                          fontSize: '0.8rem'
                        }}
                      >
                        🗑️ Slet
                      </button>
                    </div>
                    
                    <p><strong>Kompetencemål:</strong> {activity.goal}</p>
                    {activity.description && <p><strong>Beskrivelse:</strong> {activity.description}</p>}
                    {activity.duration && <p><strong>Varighed:</strong> {activity.duration}</p>}
                    {activity.materials && <p><strong>Materialer:</strong> {activity.materials}</p>}
                    {activity.method && <p><strong>Metode:</strong> {activity.method}</p>}
                    {activity.evaluation && <p><strong>Evaluering:</strong> {activity.evaluation}</p>}
                    {activity.reflection && <p><strong>Refleksion:</strong> {activity.reflection}</p>}
                    
                    <small style={{ color: '#666', marginTop: '1rem', display: 'block' }}>
                      Oprettet: {new Date(activity.createdAt).toLocaleDateString('da-DK')}
                    </small>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default App;