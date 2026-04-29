"use client";
import { useState, useEffect } from "react";
import { supabase } from "./lib/supabase";

export default function Home() {
  // --- ÉTATS ---
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true); // État pour l'accueil
  const [activeTab, setActiveTab] = useState("Projets");
  const [loading, setLoading] = useState(false);
  
  const [projects, setProjects] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);

  const [formData, setFormData] = useState({ 
    fullName: "", projectName: "", category: "AgriTech", 
    status: "Idée", needs: "", contact: "" 
  });
  const [forumData, setForumData] = useState({ authorName: "", content: "", category: "AgriTech" });

  // --- CHARGEMENT ---
  const fetchData = async () => {
    const { data: pData } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
    const { data: fData } = await supabase.from("forum_posts").select("*").order("created_at", { ascending: false });
    if (pData) setProjects(pData);
    if (fData) setPosts(fData);
  };

  useEffect(() => {
    if (isLoggedIn) fetchData();
  }, [isLoggedIn]);

  // --- ACTIONS ---
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => { 
      setIsLoggedIn(true);
      setShowWelcome(false); // On cache l'accueil après connexion
      setLoading(false);
    }, 800);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setShowWelcome(true); // Retour à l'accueil
  };

  const handleSubmitProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.from("profiles").insert([{ 
      full_name: formData.fullName, project_name: formData.projectName, 
      category: formData.category, status: formData.status, 
      description: formData.needs, contact: formData.contact
    }]);
    setLoading(false);
    if (!error) {
      alert("Projet sécurisé et publié !");
      setFormData({ ...formData, projectName: "", needs: "" });
      fetchData();
    }
  };

  const handleSubmitForum = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.from("forum_posts").insert([{ 
      author_name: forumData.authorName, content: forumData.content, category: forumData.category 
    }]);
    setLoading(false);
    if (!error) {
      alert("Message publié sur le forum !");
      setForumData({ ...forumData, content: "" });
      fetchData();
    }
  };

  const handleContact = (p: any) => {
    const msg = `Bonjour ${p.full_name}, je souhaite collaborer sur "${p.project_name}". J'accepte les clauses de confidentialité (NDA) de Novateurs 229.`;
    const cleanContact = p.contact.replace(/\s/g, '');
    if (p.contact.includes('@')) {
      window.location.href = `mailto:${p.contact}?subject=Collaboration NDA&body=${msg}`;
    } else {
      window.open(`https://wa.me/${cleanContact}?text=${encodeURIComponent(msg)}`, '_blank');
    }
  };

  // --- 1. RENDU : ACCUEIL & PRÉSENTATION ---
  if (showWelcome && !isLoggedIn) {
    return (
      <div style={{ backgroundColor: "#f0f4f8", minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>
        <header style={{ backgroundColor: "#003366", color: "white", padding: "20px 5%", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h1 style={{ margin: 0, fontSize: "1.5rem" }}>NOVATEURS 229</h1>
          <button onClick={() => setShowWelcome(false)} style={actionButtonStyle}>S'inscrire / Se connecter</button>
        </header>

        <main style={{ maxWidth: "1000px", margin: "60px auto", padding: "0 20px", textAlign: "center" }}>
          <h2 style={{ fontSize: "2.5rem", color: "#003366" }}>Propulsez l'Innovation au Bénin 🇧🇯</h2>
          <p style={{ fontSize: "1.2rem", color: "#4a5568", lineHeight: "1.6", margin: "20px 0" }}>
            Novateurs 229 est la plateforme de référence pour connecter porteurs de projets, développeurs et investisseurs. 
            Notre mission est de structurer l'écosystème startup béninois via la collaboration et la protection des idées.
          </p>
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "20px", marginTop: "40px" }}>
            <div style={welcomeCardStyle}>
              <h3>🚀 Collaboration</h3>
              <p>Trouvez des associés complémentaires pour vos projets AgriTech, FinTech et plus.</p>
            </div>
            <div style={welcomeCardStyle}>
              <h3>🔒 Sécurité</h3>
              <p>Échangez en toute confiance grâce à notre système de NDA numérique intégré.</p>
            </div>
            <div style={welcomeCardStyle}>
              <h3>💬 Forum</h3>
              <p>Posez vos questions à la communauté et participez aux meetups exclusifs.</p>
            </div>
          </div>

          <button onClick={() => setShowWelcome(false)} style={{ ...buttonStyle, width: "auto", padding: "15px 40px", marginTop: "50px", fontSize: "1.1rem" }}>
            Découvrir les projets en cours
          </button>
        </main>
      </div>
    );
  }

  // --- 2. RENDU : ÉCRAN DE CONNEXION ---
  if (!isLoggedIn) {
    return (
      <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#003366", fontFamily: "'Inter', sans-serif" }}>
        <div style={{ backgroundColor: "white", padding: "40px", borderRadius: "24px", width: "100%", maxWidth: "400px", boxShadow: "0 10px 25px rgba(0,0,0,0.2)" }}>
          <button onClick={() => setShowWelcome(true)} style={{ background: "none", border: "none", color: "#003366", cursor: "pointer", marginBottom: "20px" }}>← Retour</button>
          <h1 style={{ color: "#003366", textAlign: "center", marginBottom: "10px" }}>NOVATEURS 229</h1>
          <p style={{ textAlign: "center", color: "#666", fontSize: "0.9rem", marginBottom: "30px" }}>Rejoignez le Hub</p>
          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
            <input type="email" placeholder="Email" style={inputStyle} required />
            <input type="password" placeholder="Mot de passe" style={inputStyle} required />
            <button type="submit" style={buttonStyle}>{loading ? "Connexion..." : "Se connecter"}</button>
          </form>
        </div>
      </div>
    );
  }

  // --- 3. RENDU : APP PRINCIPALE ---
  return (
    <div style={{ backgroundColor: "#f0f4f8", minHeight: "100vh", fontFamily: "'Inter', sans-serif", color: "#1a202c" }}>
      
      <header style={{ backgroundColor: "#003366", color: "white", padding: "20px 5%", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, zIndex: 10 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "1.5rem", letterSpacing: "1px" }}>NOVATEURS 229</h1>
          <p style={{ margin: 0, fontSize: "0.8rem", opacity: 0.8 }}>Session Active 🟢</p>
        </div>
        <div style={{ display: "flex", gap: "25px", fontSize: "0.9rem", alignItems: "center" }}>
          <span onClick={() => setActiveTab("Forum")} style={navStyle(activeTab === "Forum")}>📢 Forum</span>
          <span onClick={() => setActiveTab("Events")} style={navStyle(activeTab === "Events")}>📅 Événements</span>
          <span onClick={() => setActiveTab("Projets")} style={navStyle(activeTab === "Projets")}>🚀 Projets</span>
          <button onClick={handleLogout} style={logoutButtonStyle}>Déconnexion</button>
        </div>
      </header>

      <main style={{ maxWidth: "1200px", margin: "40px auto", padding: "0 20px", display: "grid", gridTemplateColumns: "350px 1fr", gap: "40px" }}>
        
        <section>
          <div style={{ backgroundColor: "white", padding: "30px", borderRadius: "20px", boxShadow: "0 10px 25px rgba(0,0,0,0.05)", position: "sticky", top: "100px" }}>
            {activeTab === "Projets" ? (
              <>
                <h2 style={{ fontSize: "1.2rem", marginBottom: "20px", color: "#003366" }}>Initialiser un Projet</h2>
                <form onSubmit={handleSubmitProject} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                  <input placeholder="Ton nom" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} style={inputStyle} required />
                  <input placeholder="Nom du Projet" value={formData.projectName} onChange={e => setFormData({...formData, projectName: e.target.value})} style={inputStyle} required />
                  <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} style={inputStyle}>
                    <option>AgriTech</option><option>FinTech</option><option>EdTech</option><option>Santé</option>
                  </select>
                  <textarea placeholder="Profils recherchés..." value={formData.needs} onChange={e => setFormData({...formData, needs: e.target.value})} style={{...inputStyle, height: "80px"}} required />
                  <input placeholder="WhatsApp (ex: 229...)" value={formData.contact} onChange={e => setFormData({...formData, contact: e.target.value})} style={inputStyle} required />
                  <button type="submit" disabled={loading} style={buttonStyle}>{loading ? "Envoi..." : "Publier ma fiche"}</button>
                </form>
              </>
            ) : activeTab === "Forum" ? (
              <>
                <h2 style={{ fontSize: "1.2rem", marginBottom: "20px", color: "#003366" }}>Poser une question</h2>
                <form onSubmit={handleSubmitForum} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                  <input placeholder="Ton nom" value={forumData.authorName} onChange={e => setForumData({...forumData, authorName: e.target.value})} style={inputStyle} required />
                  <textarea placeholder="Votre message..." value={forumData.content} onChange={e => setForumData({...forumData, content: e.target.value})} style={{...inputStyle, height: "100px"}} required />
                  <button type="submit" disabled={loading} style={buttonStyle}>Envoyer au forum</button>
                </form>
              </>
            ) : (
              <p style={{color: "#003366", fontWeight: "bold"}}>Bientôt : Inscription aux Hackathons Novateurs 229.</p>
            )}
          </div>
        </section>

        <section>
          <h2 style={{ fontSize: "1.5rem", marginBottom: "20px" }}>{activeTab} en direct</h2>
          <div style={{ display: "grid", gap: "20px" }}>
            {activeTab === "Projets" && projects.map((p) => (
              <div key={p.id} style={cardStyle}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={badgeStyle}>{p.category}</span>
                  <span style={{color: "#059669", fontSize: "0.7rem", fontWeight: "bold"}}>🔒 Sous NDA</span>
                </div>
                <h3 style={{ margin: "10px 0", color: "#003366" }}>{p.project_name || p.projectName}</h3>
                <p style={{ color: "#4a5568", fontSize: "0.9rem" }}>🔍 {p.description}</p>
                <div style={{ marginTop: "15px", display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #eee", paddingTop: "10px" }}>
                  <small>Innovateur: <strong>{p.full_name}</strong></small>
                  <button onClick={() => handleContact(p)} style={actionButtonStyle}>Demander l'accès</button>
                </div>
              </div>
            ))}
            {activeTab === "Forum" && posts.map((post) => (
              <div key={post.id} style={{...cardStyle, borderLeft: "5px solid #ffcc00"}}>
                <h4 style={{margin: 0}}>{post.author_name}</h4>
                <p style={{margin: "10px 0"}}>{post.content}</p>
                <button onClick={() => alert("Réponse bientôt disponible")} style={{...actionButtonStyle, backgroundColor: "#f0f0f0", color: "#333"}}>Répondre</button>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

// --- STYLES ---
const inputStyle = { width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid #e2e8f0", fontSize: "0.9rem", color: "black", boxSizing: "border-box" as const };
const buttonStyle = { width: "100%", padding: "14px", backgroundColor: "#003366", color: "white", border: "none", borderRadius: "10px", fontWeight: "bold" as const, cursor: "pointer" };
const actionButtonStyle = { padding: "8px 16px", backgroundColor: "#ffcc00", color: "#003366", border: "none", borderRadius: "8px", fontWeight: "bold" as const, cursor: "pointer", fontSize: "0.8rem" };
const logoutButtonStyle = { padding: "6px 12px", backgroundColor: "transparent", color: "white", border: "1px solid white", borderRadius: "8px", cursor: "pointer", fontSize: "0.8rem" };
const cardStyle = { backgroundColor: "white", padding: "20px", borderRadius: "20px", boxShadow: "0 4px 15px rgba(0,0,0,0.05)", border: "1px solid #edf2f7" };
const welcomeCardStyle = { backgroundColor: "white", padding: "20px", borderRadius: "15px", boxShadow: "0 4px 10px rgba(0,0,0,0.05)", textAlign: "left" as const };
const badgeStyle = { fontSize: "0.65rem", padding: "4px 10px", borderRadius: "12px", fontWeight: "bold" as const, backgroundColor: "#E2E8F0", color: "#4A5568" };
const navStyle = (active: boolean) => ({ cursor: "pointer", fontWeight: active ? "bold" : "normal", borderBottom: active ? "2px solid #ffcc00" : "none", paddingBottom: "5px" });