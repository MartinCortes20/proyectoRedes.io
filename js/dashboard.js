/**
 * ========================================
 * CENTRO MÍSTICO LUNA LLENA - DASHBOARD
 * Panel Principal de Control
 * ========================================
 */

// ========================================
// DATOS DEL DASHBOARD
// ========================================

const DASHBOARD_DATA = {
    metricas: {
        consultorios: { ocupados: 8, total: 10 },
        streaming: { activo: true, viewers: 127 },
        ventas: { dia: 12450, moneda: 'MXN' },
        productos: {
            top: [
                { nombre: 'Cuarzo Rosa', vendidos: 23 },
                { nombre: 'Veladora 7 Días', vendidos: 18 },
                { nombre: 'Tarot Rider', vendidos: 12 },
                { nombre: 'Incienso Sándalo', vendidos: 15 }
            ]
        }
    },
    
    fases_lunares: [
        { fase: 'Luna Nueva', icono: '🌑', descripcion: 'Inicio de ciclo - Energía baja' },
        { fase: 'Cuarto Creciente', icono: '🌓', descripcion: 'Crecimiento - Actividad moderada' },
        { fase: 'Luna Llena', icono: '🌕', descripcion: 'Pico de demanda - Actividad 90% mayor' },
        { fase: 'Cuarto Menguante', icono: '🌗', descripcion: 'Reflexión - Energía contemplativa' }
    ],
    
    alertas: [
        { tipo: 'warning', mensaje: 'Stock Bajo: Cuarzos rosas (5 restantes)' },
        { tipo: 'success', mensaje: 'Consultorio Libre: Sala VIP disponible' },
        { tipo: 'info', mensaje: 'Pico de Tráfico: 15 personas en lista de espera' },
        { tipo: 'success', mensaje: 'Servidor SMTP: 47 emails enviados hoy' }
    ]
};

// ========================================
// INICIALIZACIÓN DEL DASHBOARD
// ========================================

function initDashboard() {
    renderMetricasTiempoReal();
    renderFaseLunar();
    renderAlertas();
    actualizarProductosTop();
}

// ========================================
// MÉTRICAS EN TIEMPO REAL
// ========================================

function renderMetricasTiempoReal() {
    const container = document.getElementById('metricas-tiempo-real');
    if (!container) return;
    
    const data = DASHBOARD_DATA.metricas;
    
    container.innerHTML = `
        <div class="metric">
            <span>Consultorios Ocupados:</span>
            <span><strong>${data.consultorios.ocupados}/${data.consultorios.total}</strong></span>
        </div>
        <div class="metric">
            <span>Streaming Activo:</span>
            <span><strong>${data.streaming.activo ? '🔴 LIVE' : '⚫ OFFLINE'}</strong></span>
        </div>
        <div class="metric">
            <span>Estudiantes Online:</span>
            <span><strong>${data.streaming.viewers}</strong></span>
        </div>
        <div class="metric">
            <span>Ventas del Día:</span>
            <span><strong>$${data.ventas.dia.toLocaleString()} ${data.ventas.moneda}</strong></span>
        </div>
    `;
}

// ========================================
// FASE LUNAR
// ========================================

function renderFaseLunar() {
    const container = document.getElementById('fase-lunar');
    if (!container) return;
    
    // Seleccionar fase lunar actual (simulación)
    const faseActual = DASHBOARD_DATA.fases_lunares[2]; // Luna Llena
    const proximoCambio = Math.floor(Math.random() * 7) + 1;
    
    container.innerHTML = `
        <div class="lunar-phase">
            <div class="phase-icon">${faseActual.icono}</div>
            <h4>${faseActual.fase}</h4>
            <p>${faseActual.descripcion}</p>
            <p><strong>Próximo cambio:</strong> ${proximoCambio} día${proximoCambio > 1 ? 's' : ''}</p>
        </div>
    `;
}

// ========================================
// SISTEMA DE ALERTAS
// ========================================

function renderAlertas() {
    const container = document.getElementById('alertas-sistema');
    if (!container) return;
    
    const alertasHTML = DASHBOARD_DATA.alertas.map(alerta => {
        const claseCSS = alerta.tipo === 'success' ? 'alert success' : 'alert';
        return `<div class="${claseCSS}"><strong>${alerta.mensaje}</strong></div>`;
    }).join('');
    
    container.innerHTML = alertasHTML;
}

// ========================================
// PRODUCTOS TOP
// ========================================

function actualizarProductosTop() {
    // Esta función se puede llamar para actualizar los productos más vendidos
    const productos = DASHBOARD_DATA.metricas.productos.top;
    
    // Simular cambios en las ventas
    productos.forEach(producto => {
        producto.vendidos += Math.floor(Math.random() * 3);
    });
    
    // Reordenar por ventas
    productos.sort((a, b) => b.vendidos - a.vendidos);
}

// ========================================
// SIMULACIÓN DE DATOS EN TIEMPO REAL
// ========================================

function actualizarMetricasEnTiempoReal() {
    const data = DASHBOARD_DATA.metricas;
    
    // Simular cambios en consultorios
    data.consultorios.ocupados = Math.min(
        data.consultorios.total,
        Math.max(0, data.consultorios.ocupados + (Math.random() > 0.5 ? 1 : -1))
    );
    
    // Simular cambios en viewers
    data.streaming.viewers += Math.floor(Math.random() * 10) - 5;
    data.streaming.viewers = Math.max(50, Math.min(200, data.streaming.viewers));
    
    // Simular incremento en ventas
    data.ventas.dia += Math.floor(Math.random() * 500);
    
    // Re-renderizar métricas
    renderMetricasTiempoReal();
}

// ========================================
// GESTIÓN DE NOTIFICACIONES
// ========================================

function agregarAlerta(tipo, mensaje) {
    DASHBOARD_DATA.alertas.unshift({ tipo, mensaje });
    
    // Mantener solo las últimas 4 alertas
    if (DASHBOARD_DATA.alertas.length > 4) {
        DASHBOARD_DATA.alertas.pop();
    }
    
    renderAlertas();
}

function limpiarAlertas() {
    DASHBOARD_DATA.alertas = [];
    renderAlertas();
}

// ========================================
// ESTADÍSTICAS AVANZADAS
// ========================================

function obtenerEstadisticasCompletas() {
    return {
        ventas: {
            total: DASHBOARD_DATA.metricas.ventas.dia,
            promedioPorHora: Math.round(DASHBOARD_DATA.metricas.ventas.dia / 10),
            productos: DASHBOARD_DATA.metricas.productos.top
        },
        ocupacion: {
            consultorios: DASHBOARD_DATA.metricas.consultorios,
            porcentaje: Math.round((DASHBOARD_DATA.metricas.consultorios.ocupados / DASHBOARD_DATA.metricas.consultorios.total) * 100)
        },
        streaming: DASHBOARD_DATA.metricas.streaming,
        alertas: DASHBOARD_DATA.alertas.length
    };
}

// ========================================
// FUNCIONES DE EXPORT PARA REPORTES
// ========================================

function exportarDatosDashboard() {
    const datos = {
        fecha: new Date().toISOString(),
        metricas: DASHBOARD_DATA.metricas,
        alertas: DASHBOARD_DATA.alertas,
        faseActual: DASHBOARD_DATA.fases_lunares[2]
    };
    
    return JSON.stringify(datos, null, 2);
}

// ========================================
// AUTO-ACTUALIZACIÓN
// ========================================

let dashboardInterval;

function iniciarActualizacionAutomatica() {
    dashboardInterval = setInterval(() => {
        actualizarMetricasEnTiempoReal();
        actualizarProductosTop();
    }, 30000); // Cada 30 segundos
}

function detenerActualizacionAutomatica() {
    if (dashboardInterval) {
        clearInterval(dashboardInterval);
        dashboardInterval = null;
    }
}

// ========================================
// EVENT LISTENERS
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    // Iniciar actualización automática cuando se carga la página
    iniciarActualizacionAutomatica();
});

// Detener actualizaciones cuando se cambia de tab
document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        detenerActualizacionAutomatica();
    } else {
        iniciarActualizacionAutomatica();
    }
});

// ========================================
// EXPORT
// ========================================

window.DashboardModule = {
    initDashboard,
    actualizarMetricasEnTiempoReal,
    agregarAlerta,
    limpiarAlertas,
    obtenerEstadisticasCompletas,
    exportarDatosDashboard,
    iniciarActualizacionAutomatica,
    detenerActualizacionAutomatica
};