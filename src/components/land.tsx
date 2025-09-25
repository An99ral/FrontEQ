import React from "react";
import logo from "../assets/Logo-About-EQ.png"; // Usa tu logo real

const LandPage = () => (
    <div className="centered-section" style={{ padding: 24, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <img src={logo} alt="Equilibrium Games" className="logo" style={{ filter: "drop-shadow(0 0 2em #646cff52)", marginLeft: "auto", marginRight: "auto" }} />
        <div style={{ maxWidth: 600, textAlign: "center", marginBottom: 32 }}>
            <div className="section-title">WHAT IS EQUILIBRIUM (EQ)</div>
            <p>
                Equilibrium (EQ) is a gaming ecosystem token designed for use globally in Equilibrium Games.
                EQ is listed on multiple exchanges and can be swapped, traded, and used in games and decentralized exchanges.
            </p>
            <button style={{
                background: "#fff",
                color: "#18232d",
                border: "none",
                borderRadius: 6,
                padding: "8px 20px",
                fontWeight: "bold",
                cursor: "pointer",
                marginTop: 8
            }}>LEARN MORE</button>
        </div>

       
         
    </div>
);

export default LandPage;