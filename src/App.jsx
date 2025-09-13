import React, { useState, useEffect } from "react";
import jsPDF from "jspdf";

const App = () => {
  const [kompetencemål, setKompetencemål] = useState({});
  const [selectedPraktik, setSelectedPraktik] = useState("");
  const [selectedMål, setSelectedMål] = useState([]);
  const [aktivitetTitel, setAktivitetTitel] = useState("");
  const [aktivitetBeskrivelse, setAktivitetBeskrivelse] = useState("");
  const [målgruppe, setMålgruppe] = useState("");
  const [varighed, setVarighed] = useState("");
  const [materialer, setMaterialer] = useState("");
  const [evaluering, setEvaluering] = useState("");
  const [gemteAktiviteter, setGemteAktiviteter] = useState([]);
  const [visGemteAktiviteter, setVisGemteAktiviteter] = useState(false);
  const [aiForslag, setAiForslag] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  // Load kompetencemål from JSON file
  useEffect(() => {
    fetch("/kompetencemal.json")
      .then((response) => response.json())
      .then((data) => setKompetencemål(data))
      .catch((error) => console.error("Error loading kompetencemål:", error));
  }, []);

  // Load saved activities from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("gemteAktiviteter");
    if (saved) {
      setGemteAktiviteter(JSON.parse(saved));
    }
  }, []);

  const handleMålChange = (mål, checked) => {
    if (checked) {
      setSelectedMål([...selectedMål, mål]);
    } else {
      setSelectedMål(selectedMål.filter((m) => m !== mål));
    }
  };

  const generateAIForslag = () => {
    if (!selectedPraktik || selectedMål.length === 0) {
      setSaveMessage("⚠️ Vælg praktik og mindst ét mål først");
      setTimeout(() => setSaveMessage(""), 3000);
      return;
    }

    setIsLoading(true);
    setAiForslag([]);

    // Simulate AI processing time
    setTimeout(() => {
      const forslag = [
        {
          titel: "Kreativ Leg og Læring",
          beskrivelse: "En aktivitet der kombinerer kreativ udfoldelse med målrettet læring gennem leg og eksperimenter.",
          målgruppe: "3-5 årige børn",
          varighed: "45 minutter",
          materialer: "Farver, papir, lim, naturmaterialer, kameraer til dokumentation",
          evaluering: "Observation af børnenes engagement, foto-dokumentation af proces og resultater, samtale med børnene om deres oplevelser"
        },
        {
          titel: "Samarbejde og Kommunikation",
          beskrivelse: "Struktureret gruppeaktivitet der fremmer sociale kompetencer og kommunikative færdigheder.",
          målgruppe: "4-6 årige børn",
          varighed: "30 minutter",
          materialer: "Byggeklodser, rollespilstøj, tavle til tegning",
          evaluering: "Struktureret observation af samarbejdsevner, dokumentation af kommunikative fremskridt"
        },
        {
          titel: "Natur og Opdagelse",
          beskrivelse: "Udendørs læringsaktivitet der kobler naturoplevelser med faglig udvikling og kropslig udfoldelse.",
          målgruppe: "2-5 årige børn",
          varighed: "60 minutter",
          materialer: "Lupper, indsamlingsbøtter, notesbøger, kamera",
          evaluering: "Portfolio-dokumentation, refleksionssamtaler, observation af nysgerrighed og engagement"
        }
      ];

      setAiForslag(forslag);
      setIsLoading(false);
    }, 2000);
  };

  const anvendForslag = (forslag) => {
    setAktivitetTitel(forslag.titel);
    setAktivitetBeskrivelse(forslag.beskrivelse);
    setMålgruppe(forslag.målgruppe);
    setVarighed(forslag.varighed);
    setMaterialer(forslag.materialer);
    setEvaluering(forslag.evaluering);
  };

  const gemAktivitet = () => {
    if (!aktivitetTitel.trim()) {
      setSaveMessage("⚠️ Indtast en titel for aktiviteten");
      setTimeout(() => setSaveMessage(""), 3000);
      return;
    }

    if (gemteAktiviteter.length >= 50) {
      setSaveMessage("⚠️ Maksimum 50 aktiviteter tilladt");
      setTimeout(() => setSaveMessage(""), 3000);
      return;
    }

    const nyAktivitet = {
      id: Date.now(),
      praktik: selectedPraktik,
      mål: [...selectedMål],
      titel: aktivitetTitel,
      beskrivelse: aktivitetBeskrivelse,
      målgruppe: målgruppe,
      varighed: varighed,
      materialer: materialer,
      evaluering: evaluering,
      oprettet: new Date().toLocaleDateString("da-DK")
    };

    const opdatereteAktiviteter = [...gemteAktiviteter, nyAktivitet];
    setGemteAktiviteter(opdatereteAktiviteter);
    localStorage.setItem("gemteAktiviteter", JSON.stringify(opdatereteAktiviteter));

    // Clear form
    setAktivitetTitel("");
    setAktivitetBeskrivelse("");
    setMålgruppe("");
    setVarighed("");
    setMaterialer("");
    setEvaluering("");
    setSelectedMål([]);
    setAiForslag([]);

    setSaveMessage("✅ Aktivitet gemt!");
    setTimeout(() => setSaveMessage(""), 3000);
  };

  const sletAktivitet = (id) => {
    const opdatereteAktiviteter = gemteAktiviteter.filter(aktivitet => aktivitet.id !== id);
    setGemteAktiviteter(opdatereteAktiviteter);
    localStorage.setItem("gemteAktiviteter", JSON.stringify(opdatereteAktiviteter));
  };

  const exportToPDF = () => {
    if (gemteAktiviteter.length === 0) {
      setSaveMessage("⚠️ Ingen aktiviteter at eksportere");
      setTimeout(() => setSaveMessage(""), 3000);
      return;
    }

    const doc = new jsPDF();
    const pageHeight = doc.internal.pageSize.height;
    let yPosition = 20;

    // Title
    doc.setFontSize(20);
    doc.text("Pædagogiske Aktiviteter", 20, yPosition);
    yPosition += 20;

    gemteAktiviteter.forEach((aktivitet, index) => {
      // Check if we need a new page
      if (yPosition > pageHeight - 60) {
        doc.addPage();
        yPosition = 20;
      }

      // Activity header
      doc.setFontSize(16);
      doc.text(`${index + 1}. ${aktivitet.titel}`, 20, yPosition);
      yPosition += 10;

      doc.setFontSize(12);
      doc.text(`Praktik: ${aktivitet.praktik}`, 20, yPosition);
      yPosition += 7;

      if (aktivitet.beskrivelse) {
        const beskrivelsesLinjer = doc.splitTextToSize(`Beskrivelse: ${aktivitet.beskrivelse}`, 170);
        doc.text(beskrivelsesLinjer, 20, yPosition);
        yPosition += beskrivelsesLinjer.length * 7;
      }

      if (aktivitet.målgruppe) {
        doc.text(`Målgruppe: ${aktivitet.målgruppe}`, 20, yPosition);
        yPosition += 7;
      }

      if (aktivitet.varighed) {
        doc.text(`Varighed: ${aktivitet.varighed}`, 20, yPosition);
        yPosition += 7;
      }

      if (aktivitet.materialer) {
        const materialerLinjer = doc.splitTextToSize(`Materialer: ${aktivitet.materialer}`, 170);
        doc.text(materialerLinjer, 20, yPosition);
        yPosition += materialerLinjer.length * 7;
      }

      if (aktivitet.evaluering) {
        const evalueringsLinjer = doc.splitTextToSize(`Evaluering: ${aktivitet.evaluering}`, 170);
        doc.text(evalueringsLinjer, 20, yPosition);
        yPosition += evalueringsLinjer.length * 7;
      }

      yPosition += 10; // Space between activities
    });

    doc.save("paedagogiske-aktiviteter.pdf");
  };

  const rydFormular = () => {
    setAktivitetTitel("");
    setAktivitetBeskrivelse("");
    setMålgruppe("");
    setVarighed("");
    setMaterialer("");
    setEvaluering("");
    setSelectedMål([]);
    setAiForslag([]);
    setSaveMessage("");
  };

  return (
    <div style={{ 
      fontFamily: "'Montserrat', sans-serif", 
      minHeight: "100vh", 
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      padding: "20px 0"
    }}>
      <div style={{ 
        maxWidth: "1200px", 
        margin: "0 auto", 
        padding: "0 20px"
      }}>
        {/* Header */}
        <div style={{
          background: "rgba(255, 255, 255, 0.95)",
          borderRadius: "20px",
          padding: "30px",
          marginBottom: "30px",
          boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
          backdropFilter: "blur(10px)",
          textAlign: "center"
        }}>
          <h1 style={{ 
            color: "#2d3748", 
            marginBottom: "10px", 
            fontSize: "2.5rem",
            fontWeight: "700",
            background: "linear-gradient(135deg, #667eea, #764ba2)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent"
          }}>
            🎯 Læringsassistent
          </h1>
          <p style={{ 
            color: "#718096", 
            fontSize: "1.1rem",
            margin: "0"
          }}>
            Planlæg pædagogiske aktiviteter baseret på kompetencemål
          </p>
        </div>

        {/* Navigation */}
        <div style={{
          background: "rgba(255, 255, 255, 0.95)",
          borderRadius: "15px",
          padding: "20px",
          marginBottom: "30px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
          backdropFilter: "blur(10px)"
        }}>
          <div style={{ 
            display: "flex", 
            gap: "15px", 
            flexWrap: "wrap",
            justifyContent: "center"
          }}>
            <button
              onClick={() => setVisGemteAktiviteter(false)}
              style={{
                padding: "12px 24px",
                borderRadius: "25px",
                border: "none",
                background: !visGemteAktiviteter 
                  ? "linear-gradient(135deg, #667eea, #764ba2)" 
                  : "transparent",
                color: !visGemteAktiviteter ? "white" : "#667eea",
                fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.3s ease",
                fontSize: "1rem",
                boxShadow: !visGemteAktiviteter ? "0 5px 15px rgba(102, 126, 234, 0.4)" : "none"
              }}
            >
              📝 Opret Aktivitet
            </button>
            <button
              onClick={() => setVisGemteAktiviteter(true)}
              style={{
                padding: "12px 24px",
                borderRadius: "25px",
                border: "none",
                background: visGemteAktiviteter 
                  ? "linear-gradient(135deg, #667eea, #764ba2)" 
                  : "transparent",
                color: visGemteAktiviteter ? "white" : "#667eea",
                fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.3s ease",
                fontSize: "1rem",
                boxShadow: visGemteAktiviteter ? "0 5px 15px rgba(102, 126, 234, 0.4)" : "none"
              }}
            >
              📚 Mine Aktiviteter ({gemteAktiviteter.length})
            </button>
          </div>
        </div>

        {!visGemteAktiviteter ? (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "30px" }}>
            {/* Left Column - Form */}
            <div style={{
              background: "rgba(255, 255, 255, 0.95)",
              borderRadius: "20px",
              padding: "30px",
              boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
              backdropFilter: "blur(10px)",
              height: "fit-content"
            }}>
              <h2 style={{ 
                color: "#2d3748", 
                marginBottom: "25px", 
                fontSize: "1.8rem",
                fontWeight: "600"
              }}>
                🎯 Planlæg Aktivitet
              </h2>

              {/* Praktik Selection */}
              <div style={{ marginBottom: "25px" }}>
                <label style={{ 
                  display: "block", 
                  marginBottom: "8px", 
                  fontWeight: "600", 
                  color: "#2d3748",
                  fontSize: "1rem"
                }}>
                  Vælg Praktik:
                </label>
                <select
                  value={selectedPraktik}
                  onChange={(e) => {
                    setSelectedPraktik(e.target.value);
                    setSelectedMål([]);
                  }}
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    borderRadius: "12px",
                    border: "2px solid #e2e8f0",
                    fontSize: "1rem",
                    transition: "all 0.3s ease",
                    background: "white"
                  }}
                >
                  <option value="">-- Vælg praktik --</option>
                  {Object.keys(kompetencemål).map((praktik) => (
                    <option key={praktik} value={praktik}>
                      {praktik}
                    </option>
                  ))}
                </select>
              </div>

              {/* Kompetencemål Selection */}
              {selectedPraktik && (
                <div style={{ marginBottom: "25px" }}>
                  <label style={{ 
                    display: "block", 
                    marginBottom: "12px", 
                    fontWeight: "600", 
                    color: "#2d3748",
                    fontSize: "1rem"
                  }}>
                    Vælg Mål:
                  </label>
                  
                  {/* Kompetencemål */}
                  <div style={{ 
                    background: "#f8fafc", 
                    padding: "15px", 
                    borderRadius: "12px", 
                    marginBottom: "15px",
                    border: "2px solid #e2e8f0"
                  }}>
                    <h4 style={{ 
                      color: "#4a5568", 
                      marginBottom: "10px", 
                      fontSize: "0.9rem",
                      fontWeight: "600",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px"
                    }}>
                      Kompetencemål
                    </h4>
                    <label style={{ 
                      display: "flex", 
                      alignItems: "flex-start", 
                      cursor: "pointer",
                      fontSize: "0.95rem",
                      lineHeight: "1.5"
                    }}>
                      <input
                        type="checkbox"
                        checked={selectedMål.includes(kompetencemål[selectedPraktik].kompetencemål)}
                        onChange={(e) => handleMålChange(kompetencemål[selectedPraktik].kompetencemål, e.target.checked)}
                        style={{ 
                          marginRight: "10px", 
                          marginTop: "2px",
                          transform: "scale(1.2)"
                        }}
                      />
                      <span style={{ color: "#2d3748" }}>
                        {kompetencemål[selectedPraktik].kompetencemål}
                      </span>
                    </label>
                  </div>

                  {/* Vidensmål */}
                  <div style={{ 
                    background: "#f0fff4", 
                    padding: "15px", 
                    borderRadius: "12px", 
                    marginBottom: "15px",
                    border: "2px solid #c6f6d5"
                  }}>
                    <h4 style={{ 
                      color: "#2f855a", 
                      marginBottom: "10px", 
                      fontSize: "0.9rem",
                      fontWeight: "600",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px"
                    }}>
                      Vidensmål
                    </h4>
                    {kompetencemål[selectedPraktik].vidensmål.map((mål, index) => (
                      <label key={index} style={{ 
                        display: "flex", 
                        alignItems: "flex-start", 
                        marginBottom: "8px", 
                        cursor: "pointer",
                        fontSize: "0.9rem",
                        lineHeight: "1.4"
                      }}>
                        <input
                          type="checkbox"
                          checked={selectedMål.includes(mål)}
                          onChange={(e) => handleMålChange(mål, e.target.checked)}
                          style={{ 
                            marginRight: "10px", 
                            marginTop: "2px",
                            transform: "scale(1.1)"
                          }}
                        />
                        <span style={{ color: "#2d3748" }}>{mål}</span>
                      </label>
                    ))}
                  </div>

                  {/* Færdighedsmål */}
                  <div style={{ 
                    background: "#fffaf0", 
                    padding: "15px", 
                    borderRadius: "12px",
                    border: "2px solid #fed7aa"
                  }}>
                    <h4 style={{ 
                      color: "#c05621", 
                      marginBottom: "10px", 
                      fontSize: "0.9rem",
                      fontWeight: "600",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px"
                    }}>
                      Færdighedsmål
                    </h4>
                    {kompetencemål[selectedPraktik].færdighedsmål.map((mål, index) => (
                      <label key={index} style={{ 
                        display: "flex", 
                        alignItems: "flex-start", 
                        marginBottom: "8px", 
                        cursor: "pointer",
                        fontSize: "0.9rem",
                        lineHeight: "1.4"
                      }}>
                        <input
                          type="checkbox"
                          checked={selectedMål.includes(mål)}
                          onChange={(e) => handleMålChange(mål, e.target.checked)}
                          style={{ 
                            marginRight: "10px", 
                            marginTop: "2px",
                            transform: "scale(1.1)"
                          }}
                        />
                        <span style={{ color: "#2d3748" }}>{mål}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* AI Forslag Button */}
              {selectedPraktik && selectedMål.length > 0 && (
                <div style={{ marginBottom: "25px" }}>
                  <button
                    onClick={generateAIForslag}
                    disabled={isLoading}
                    style={{
                      width: "100%",
                      padding: "15px",
                      borderRadius: "12px",
                      border: "none",
                      background: isLoading 
                        ? "#a0aec0" 
                        : "linear-gradient(135deg, #48bb78, #38a169)",
                      color: "white",
                      fontSize: "1.1rem",
                      fontWeight: "600",
                      cursor: isLoading ? "not-allowed" : "pointer",
                      transition: "all 0.3s ease",
                      boxShadow: "0 5px 15px rgba(72, 187, 120, 0.4)"
                    }}
                  >
                    {isLoading ? "🤖 Genererer forslag..." : "🤖 Få AI-forslag"}
                  </button>
                </div>
              )}
            </div>

            {/* Right Column - AI Suggestions & Activity Form */}
            <div>
              {/* AI Suggestions */}
              {aiForslag.length > 0 && (
                <div style={{
                  background: "rgba(255, 255, 255, 0.95)",
                  borderRadius: "20px",
                  padding: "30px",
                  marginBottom: "30px",
                  boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
                  backdropFilter: "blur(10px)"
                }}>
                  <h3 style={{ 
                    color: "#2d3748", 
                    marginBottom: "20px", 
                    fontSize: "1.5rem",
                    fontWeight: "600"
                  }}>
                    🤖 AI Forslag
                  </h3>
                  {aiForslag.map((forslag, index) => (
                    <div key={index} style={{
                      background: "linear-gradient(135deg, #f7fafc, #edf2f7)",
                      padding: "20px",
                      borderRadius: "15px",
                      marginBottom: "15px",
                      border: "2px solid #e2e8f0"
                    }}>
                      <h4 style={{ 
                        color: "#2d3748", 
                        marginBottom: "10px",
                        fontSize: "1.2rem",
                        fontWeight: "600"
                      }}>
                        {forslag.titel}
                      </h4>
                      <p style={{ 
                        color: "#4a5568", 
                        marginBottom: "15px",
                        lineHeight: "1.6"
                      }}>
                        {forslag.beskrivelse}
                      </p>
                      <button
                        onClick={() => anvendForslag(forslag)}
                        style={{
                          padding: "10px 20px",
                          borderRadius: "8px",
                          border: "none",
                          background: "linear-gradient(135deg, #667eea, #764ba2)",
                          color: "white",
                          fontWeight: "600",
                          cursor: "pointer",
                          transition: "all 0.3s ease",
                          fontSize: "0.9rem"
                        }}
                      >
                        📝 Anvend dette forslag
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Activity Form */}
              <div style={{
                background: "rgba(255, 255, 255, 0.95)",
                borderRadius: "20px",
                padding: "30px",
                boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
                backdropFilter: "blur(10px)"
              }}>
                <h3 style={{ 
                  color: "#2d3748", 
                  marginBottom: "25px", 
                  fontSize: "1.5rem",
                  fontWeight: "600"
                }}>
                  📋 Aktivitetsdetaljer
                </h3>

                <div style={{ marginBottom: "20px" }}>
                  <label style={{ 
                    display: "block", 
                    marginBottom: "8px", 
                    fontWeight: "600", 
                    color: "#2d3748"
                  }}>
                    Aktivitetstitel:
                  </label>
                  <input
                    type="text"
                    value={aktivitetTitel}
                    onChange={(e) => setAktivitetTitel(e.target.value)}
                    placeholder="Indtast titel på aktiviteten"
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      borderRadius: "12px",
                      border: "2px solid #e2e8f0",
                      fontSize: "1rem",
                      transition: "all 0.3s ease"
                    }}
                  />
                </div>

                <div style={{ marginBottom: "20px" }}>
                  <label style={{ 
                    display: "block", 
                    marginBottom: "8px", 
                    fontWeight: "600", 
                    color: "#2d3748"
                  }}>
                    Beskrivelse:
                  </label>
                  <textarea
                    value={aktivitetBeskrivelse}
                    onChange={(e) => setAktivitetBeskrivelse(e.target.value)}
                    placeholder="Beskriv aktiviteten detaljeret"
                    rows="4"
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      borderRadius: "12px",
                      border: "2px solid #e2e8f0",
                      fontSize: "1rem",
                      resize: "vertical",
                      transition: "all 0.3s ease"
                    }}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "20px" }}>
                  <div>
                    <label style={{ 
                      display: "block", 
                      marginBottom: "8px", 
                      fontWeight: "600", 
                      color: "#2d3748"
                    }}>
                      Målgruppe:
                    </label>
                    <input
                      type="text"
                      value={målgruppe}
                      onChange={(e) => setMålgruppe(e.target.value)}
                      placeholder="F.eks. 3-5 årige børn"
                      style={{
                        width: "100%",
                        padding: "12px 16px",
                        borderRadius: "12px",
                        border: "2px solid #e2e8f0",
                        fontSize: "1rem",
                        transition: "all 0.3s ease"
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ 
                      display: "block", 
                      marginBottom: "8px", 
                      fontWeight: "600", 
                      color: "#2d3748"
                    }}>
                      Varighed:
                    </label>
                    <input
                      type="text"
                      value={varighed}
                      onChange={(e) => setVarighed(e.target.value)}
                      placeholder="F.eks. 45 minutter"
                      style={{
                        width: "100%",
                        padding: "12px 16px",
                        borderRadius: "12px",
                        border: "2px solid #e2e8f0",
                        fontSize: "1rem",
                        transition: "all 0.3s ease"
                      }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: "20px" }}>
                  <label style={{ 
                    display: "block", 
                    marginBottom: "8px", 
                    fontWeight: "600", 
                    color: "#2d3748"
                  }}>
                    Materialer:
                  </label>
                  <textarea
                    value={materialer}
                    onChange={(e) => setMaterialer(e.target.value)}
                    placeholder="Liste over nødvendige materialer"
                    rows="3"
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      borderRadius: "12px",
                      border: "2px solid #e2e8f0",
                      fontSize: "1rem",
                      resize: "vertical",
                      transition: "all 0.3s ease"
                    }}
                  />
                </div>

                <div style={{ marginBottom: "25px" }}>
                  <label style={{ 
                    display: "block", 
                    marginBottom: "8px", 
                    fontWeight: "600", 
                    color: "#2d3748"
                  }}>
                    Evaluering:
                  </label>
                  <textarea
                    value={evaluering}
                    onChange={(e) => setEvaluering(e.target.value)}
                    placeholder="Hvordan vil du evaluere aktiviteten?"
                    rows="3"
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      borderRadius: "12px",
                      border: "2px solid #e2e8f0",
                      fontSize: "1rem",
                      resize: "vertical",
                      transition: "all 0.3s ease"
                    }}
                  />
                </div>

                {/* Action Buttons */}
                <div style={{ display: "flex", gap: "15px", flexWrap: "wrap" }}>
                  <button
                    onClick={gemAktivitet}
                    style={{
                      flex: "1",
                      minWidth: "200px",
                      padding: "15px 25px",
                      borderRadius: "12px",
                      border: "none",
                      backgroundColor: saveMessage.includes("✅") 
                        ? "#10b981" 
                        : saveMessage.includes("⚠️") 
                        ? "#ef4444" 
                        : "#667eea",
                      color: "white",
                      fontSize: "1.1rem",
                      fontWeight: "600",
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                      boxShadow: "0 5px 15px rgba(102, 126, 234, 0.4)"
                    }}
                    onMouseEnter={(e) => {
                      if (!saveMessage) {
                        e.target.style.backgroundColor = "#5a67d8";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!saveMessage) {
                        e.target.style.backgroundColor = "#667eea";
                      }
                    }}
                  >
                    {saveMessage || "💾 Gem Aktivitet"}
                  </button>
                  <button
                    onClick={rydFormular}
                    style={{
                      padding: "15px 25px",
                      borderRadius: "12px",
                      border: "2px solid #e2e8f0",
                      background: "white",
                      color: "#4a5568",
                      fontSize: "1.1rem",
                      fontWeight: "600",
                      cursor: "pointer",
                      transition: "all 0.3s ease"
                    }}
                  >
                    🗑️ Ryd
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Saved Activities View */
          <div style={{
            background: "rgba(255, 255, 255, 0.95)",
            borderRadius: "20px",
            padding: "30px",
            boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
            backdropFilter: "blur(10px)"
          }}>
            <div style={{ 
              display: "flex", 
              justifyContent: "space-between", 
              alignItems: "center", 
              marginBottom: "25px",
              flexWrap: "wrap",
              gap: "15px"
            }}>
              <h2 style={{ 
                color: "#2d3748", 
                fontSize: "1.8rem",
                fontWeight: "600",
                margin: "0"
              }}>
                📚 Mine Aktiviteter ({gemteAktiviteter.length})
              </h2>
              {gemteAktiviteter.length > 0 && (
                <button
                  onClick={exportToPDF}
                  style={{
                    padding: "12px 24px",
                    borderRadius: "12px",
                    border: "none",
                    background: "linear-gradient(135deg, #48bb78, #38a169)",
                    color: "white",
                    fontSize: "1rem",
                    fontWeight: "600",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    boxShadow: "0 5px 15px rgba(72, 187, 120, 0.4)"
                  }}
                >
                  📄 Eksporter til PDF
                </button>
              )}
            </div>

            {gemteAktiviteter.length === 0 ? (
              <div style={{ 
                textAlign: "center", 
                padding: "60px 20px",
                color: "#718096"
              }}>
                <div style={{ fontSize: "4rem", marginBottom: "20px" }}>📝</div>
                <h3 style={{ 
                  fontSize: "1.5rem", 
                  marginBottom: "10px",
                  color: "#4a5568"
                }}>
                  Ingen aktiviteter endnu
                </h3>
                <p style={{ fontSize: "1.1rem" }}>
                  Opret din første aktivitet for at komme i gang!
                </p>
              </div>
            ) : (
              <div style={{ 
                display: "grid", 
                gap: "20px"
              }}>
                {gemteAktiviteter.map((aktivitet) => (
                  <div key={aktivitet.id} style={{
                    background: "linear-gradient(135deg, #f8fafc, #edf2f7)",
                    padding: "25px",
                    borderRadius: "15px",
                    border: "2px solid #e2e8f0",
                    position: "relative"
                  }}>
                    <div style={{ 
                      display: "flex", 
                      justifyContent: "space-between", 
                      alignItems: "flex-start",
                      marginBottom: "15px"
                    }}>
                      <h3 style={{ 
                        color: "#2d3748", 
                        fontSize: "1.3rem",
                        fontWeight: "600",
                        margin: "0",
                        flex: "1"
                      }}>
                        {aktivitet.titel}
                      </h3>
                      <button
                        onClick={() => sletAktivitet(aktivitet.id)}
                        style={{
                          background: "#fed7d7",
                          border: "none",
                          borderRadius: "8px",
                          padding: "8px 12px",
                          color: "#c53030",
                          cursor: "pointer",
                          fontSize: "0.9rem",
                          fontWeight: "600",
                          transition: "all 0.3s ease"
                        }}
                      >
                        🗑️ Slet
                      </button>
                    </div>
                    
                    <div style={{ 
                      display: "grid", 
                      gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", 
                      gap: "15px",
                      marginBottom: "15px"
                    }}>
                      <div>
                        <strong style={{ color: "#4a5568" }}>Praktik:</strong>
                        <p style={{ margin: "5px 0", color: "#2d3748" }}>{aktivitet.praktik}</p>
                      </div>
                      {aktivitet.målgruppe && (
                        <div>
                          <strong style={{ color: "#4a5568" }}>Målgruppe:</strong>
                          <p style={{ margin: "5px 0", color: "#2d3748" }}>{aktivitet.målgruppe}</p>
                        </div>
                      )}
                      {aktivitet.varighed && (
                        <div>
                          <strong style={{ color: "#4a5568" }}>Varighed:</strong>
                          <p style={{ margin: "5px 0", color: "#2d3748" }}>{aktivitet.varighed}</p>
                        </div>
                      )}
                      <div>
                        <strong style={{ color: "#4a5568" }}>Oprettet:</strong>
                        <p style={{ margin: "5px 0", color: "#2d3748" }}>{aktivitet.oprettet}</p>
                      </div>
                    </div>

                    {aktivitet.beskrivelse && (
                      <div style={{ marginBottom: "15px" }}>
                        <strong style={{ color: "#4a5568" }}>Beskrivelse:</strong>
                        <p style={{ margin: "5px 0", color: "#2d3748", lineHeight: "1.6" }}>
                          {aktivitet.beskrivelse}
                        </p>
                      </div>
                    )}

                    {aktivitet.materialer && (
                      <div style={{ marginBottom: "15px" }}>
                        <strong style={{ color: "#4a5568" }}>Materialer:</strong>
                        <p style={{ margin: "5px 0", color: "#2d3748", lineHeight: "1.6" }}>
                          {aktivitet.materialer}
                        </p>
                      </div>
                    )}

                    {aktivitet.evaluering && (
                      <div style={{ marginBottom: "15px" }}>
                        <strong style={{ color: "#4a5568" }}>Evaluering:</strong>
                        <p style={{ margin: "5px 0", color: "#2d3748", lineHeight: "1.6" }}>
                          {aktivitet.evaluering}
                        </p>
                      </div>
                    )}

                    {aktivitet.mål && aktivitet.mål.length > 0 && (
                      <div>
                        <strong style={{ color: "#4a5568" }}>Valgte mål:</strong>
                        <ul style={{ margin: "5px 0", paddingLeft: "20px", color: "#2d3748" }}>
                          {aktivitet.mål.map((mål, index) => (
                            <li key={index} style={{ marginBottom: "5px", lineHeight: "1.5" }}>
                              {mål}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default App;