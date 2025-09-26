import { Client } from 'xrpl';
import { getAvailableFundings } from '../../core';
import React, { useEffect, useState } from 'react';

interface CarruselProps {
    client: Client;
}

const CARDS_PER_PAGE = 4; // 2 filas x 2 columnas

const Carrusel: React.FC<CarruselProps> = ({ client }) => {
    const [fundings, setFundings] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(0);
    const [filterLetter, setFilterLetter] = useState<string>("");
    const [showActive, setShowActive] = useState(true); // Nuevo estado para el switch

    useEffect(() => {
        if (!client) {
            setError('Debes conectar el nodo primero.');
            return;
        }
        setError(null);
        getAvailableFundings(client)
            .then(setFundings)
            .catch(e => {
                setError('Error al consultar los fondos disponibles');
                console.error(e);
            });
    }, [client]);

    // Obtén las letras y números iniciales únicas de los nombres de pool
    const initials = fundings
        .map(f => (f.PoolName || "").charAt(0).toUpperCase())
        .filter(l => l.match(/[A-ZÁÉÍÓÚÑ0-9]/i));

    const letters = Array.from(new Set(initials.filter(l => l.match(/[A-ZÁÉÍÓÚÑ]/i)))).sort();
    const numbers = Array.from(new Set(initials.filter(l => l.match(/[0-9]/)))).sort();

    // Filtro por estado (activo o expirado)
    const filteredByStatus = fundings.filter(f =>
        showActive ? f.Status === "Activo" : f.Status === "Expirado"
    );

    // Aplica el filtro por letra
    const filteredFundings = filterLetter
        ? filteredByStatus.filter(f => (f.PoolName || "").toUpperCase().startsWith(filterLetter))
        : filteredByStatus;

    const totalPages = Math.ceil(filteredFundings.length / CARDS_PER_PAGE);
    const visibleFundings = filteredFundings.slice(page * CARDS_PER_PAGE, (page + 1) * CARDS_PER_PAGE);

    useEffect(() => {
        setPage(0);
    }, [filterLetter, showActive]);

    const RIPPLE_EPOCH_OFFSET = 946684800;

    return (
        <div>
            <h2>Carrusel de Proyectos</h2>
            <p> fondos disponibles</p>
            {/* Switch de estado */}
            <div style={{ marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ color: showActive ? "#fff" : "#aaa" }}>Expirados</span>
                <label style={{ display: "inline-block", position: "relative", width: 50, height: 24 }}>
                    <input
                        type="checkbox"
                        checked={showActive}
                        onChange={() => setShowActive(v => !v)}
                        style={{ opacity: 0, width: 0, height: 0 }}
                    />
                    <span style={{
                        position: "absolute",
                        cursor: "pointer",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: showActive ? "#5b3ce696" : "#c5372d6e",
                        borderRadius: 24,
                        transition: ".4s"
                    }} />
                    <span style={{
                        position: "absolute",
                        left: showActive ? 26 : 2,
                        top: 2,
                        width: 20,
                        height: 20,
                        backgroundColor: "#fff",
                        borderRadius: "50%",
                        transition: ".4s"
                    }} />
                </label>
                <span style={{ color: showActive ? "#ffffffb6" : "#fff" }}>Activos</span>
            </div>
            {/* Filtro por letra o número */}
            <div style={{
                marginBottom: 16,
                display: "flex",
                gap: 8,
                flexWrap: "wrap",
                justifyContent: "flex-start"
            }}>
                <button
                    style={{
                        width: 12,
                        height: 12,
                        borderRadius: "20%",
                        border: "1px solid #741a1aff",
                        background: filterLetter === "" ? "rgba(102, 87, 87, 0.39)" : "transparent",
                        color: "#fff",
                        fontWeight: filterLetter === "" ? "bold" : "normal",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 16,
                        transition: "background 0.2s"
                    }}
                    onClick={() => setFilterLetter("")}
                    title="All"
                >
                    <span style={{ fontSize: 14 }}>All</span>
                </button>
                {letters.map(letter => (
                    <button
                        key={letter}
                        style={{
                            width: 12,
                            height: 12,
                            borderRadius: "20%",
                            border: "1px solid #444",
                            background: filterLetter === letter ? "#fff2" : "transparent",
                            color: "#fff",
                            fontWeight: filterLetter === letter ? "bold" : "normal",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 16,
                            transition: "background 0.2s"
                        }}
                        onClick={() => setFilterLetter(letter)}
                        title={letter}
                    >
                        {letter}
                    </button>
                ))}
                {numbers.length > 0 && (
                    <>
                        <span style={{ width: 8 }} /> {/* Espacio visual entre letras y números */}
                        {numbers.map(number => (
                            <button
                                key={number}
                                style={{
                                    width: 12,
                                    height: 12,
                                    borderRadius: "20%",
                                    border: "1px solid #444",
                                    background: filterLetter === number ? "#fff2" : "transparent",
                                    color: "#fff",
                                    fontWeight: filterLetter === number ? "bold" : "normal",
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: 16,
                                    transition: "background 0.2s"
                                }}
                                onClick={() => setFilterLetter(number)}
                                title={number}
                            >
                                {number}
                            </button>
                        ))}
                    </>
                )}
            </div>
            {error && <div style={{ color: "salmon" }}>{error}</div>}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2, 1fr)",
                    gridTemplateRows: "repeat(2, auto)",
                    gap: "16px",
                    marginTop: 16,
                    minHeight: 350,
                }}
            >
                {visibleFundings.length === 0 && !error && (
                    <div style={{ gridColumn: "span 2" }}>No hay fondos disponibles.</div>
                )}
                {visibleFundings.map((funding, idx) => (
                    <div
                        key={idx}
                        style={{
                            background: "#181a20",
                            color: "#fff",
                            border: "1px solid #333",
                            borderRadius: 14,
                            padding: 20,
                            minWidth: 0,
                            boxShadow: "0 2px 8px #0002",
                            wordBreak: "break-word",
                            whiteSpace: "pre-line",
                            overflowWrap: "break-word",
                            maxWidth: "100%",
                        }}
                    >
                        <div>
                            <b>Nombre:</b> {funding.PoolName || <i>Sin nombre</i>}
                        </div>
                        <div>
                            <b>Fecha de finalización:</b> {funding.FinishAfter
                                ? new Date((funding.FinishAfter + RIPPLE_EPOCH_OFFSET) * 1000).toLocaleString()
                                : "N/A"}
                        </div>
                        <div>
                            <b>Estado:</b> {funding.Status || <i>N/A</i>}
                        </div>
                        <div>
                            <b>Monto:</b> {funding.Amount || <i>N/A</i>}
                        </div>
                        <div>
                            <b>Dueño:</b> {funding.Owner}
                        </div>
                    </div>
                ))}
            </div>
            {/* Controles del carrusel */}
            <div style={{ display: "flex", justifyContent: "center", marginTop: 16, gap: 16 }}>
                <button
                    onClick={() => setPage(p => Math.max(0, p - 1))}
                    disabled={page === 0}
                >
                    ⬅️ Anterior
                </button>
                <span style={{ alignSelf: "center" }}>
                    Página {page + 1} de {totalPages || 1}
                </span>
                <button
                    onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                    disabled={page >= totalPages - 1}
                >
                    Siguiente ➡️
                </button>
            </div>
        </div>
    );
};

export default Carrusel;
