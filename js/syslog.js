/**
 * ========================================
 * CENTRO MÍSTICO LUNA LLENA - SYSLOG
 * Sistema de Registro de Eventos
 * ========================================
 */

// ========================================
// CONFIGURACIÓN DEL SERVIDOR SYSLOG
// ========================================

const SYSLOG_CONFIG = {
    server: '172.19.5.149',
    port: 514,
    protocol: 'UDP',
    maxLogs: 1000,
    retention: '30 días'
};

// ========================================
// DATOS DEL SYSLOG
// ========================================

let syslogData = {
    eventosHoy: 1247,
    erroresCriticos: 0,
    estadisticas: {
        info: 1198,
        warning: 47,
        error: 2,
        critical: 0
    },
    dispositivosRed: [
        {
            nombre: 'Router Ventas',
            ip: '192.168.1.1',
            estado: 'online',
            tipo: 'router'
        },
        {
            nombre: 'Router Admin',
            ip: '192.168.2.1',
            estado: 'online',
            tipo: 'router'
        },
        {
            nombre: 'Router Sesiones',
            ip: '192.168.3.1',
            estado: 'online',
            tipo: 'router'
        },
        {
            nombre: 'Router Inventarios',
            ip: '192.168.4.1',
            estado: 'online',
            tipo: 'router'
        }
    ],
    traficoRed: {
        anchodeBanda: 67,
        paquetesTransmitidos: 2847293,
        paquetesPerdidos: 0.02,
        latenciaPromedio: 12
    },
    logs: [
        '[2025-06-21 14:32:15] INFO: Reserva confirmada - Cliente: María González - Servicio: Tarot',
        '[2025-06-21 14:31:42] INFO: SMTP - Email enviado exitosamente a maria.gonzalez@email.com',
        '[2025-06-21 14:30:18] INFO: TFTP - Descarga completada: manual_tarot_2024.pdf',
        '[2025-06-21 14:29:55] INFO: HTTP - Acceso a /reservas desde 192.168.1.105',
        '[2025-06-21 14:29:33] WARNING: Stock bajo detectado: Cuarzo Rosa (5 restantes)',
        '[2025-06-21 14:28:12] INFO: Sistema - QR Code generado para Mesa Tarot 1',
        '[2025-06-21 14:27:48] INFO: SMTP - Cola de envío procesada: 3 emails',
        '[2025-06-21 14:26:25] INFO: HTTP - Dashboard accedido desde 192.168.1.102',
        '[2025-06-21 14:25:59] ERROR: Conexión temporal perdida con Router Sesiones',
        '[2025-06-21 14:25:45] INFO: Conexión restaurada con Router Sesiones',
        '[2025-06-21 14:24:18] INFO: TFTP - Subida completada: backup_configuracion.cfg',
        '[2025-06-21 14:23:33] INFO: Venta registrada: Amatista x2 - $450 MXN'
    ]
};

// ========================================
// INICIALIZACIÓN DEL SYSLOG
// ========================================

function initSysLog() {
    renderEstadisticasLogs();
    renderMonitorRed();
    renderLogsEnTiempoReal();
    actualizarContadoresSyslog();
}

// ========================================
// RENDERIZADO DE ESTADÍSTICAS
// ========================================

function renderEstadisticasLogs() {
    const container = document.getElementById('estadisticas-logs');
    if (!container) return;
    
    const stats = syslogData.estadisticas;
    
    container.innerHTML = `
        <div class="metric">
            <span>Eventos INFO</span>
            <span style="color: #51cf66;"><strong>${stats.info} ✅</strong></span>
        </div>
        <div class="metric">
            <span>Eventos WARNING</span>
            <span style="color: #ffd700;"><strong>${stats.warning} ⚡</strong></span>
        </div>
        <div class="metric">
            <span>Eventos ERROR</span>
            <span style="color: #ff6b6b;"><strong>${stats.error} ⚠️</strong></span>
        </div>
        <div class="metric">
            <span>Eventos CRITICAL</span>
            <span style="color: #51cf66;"><strong>${stats.critical} ✅</strong></span>
        </div>
    `;
}

// ========================================
// MONITOR DE RED
// ========================================

function renderMonitorRed() {
    const container = document.getElementById('monitor-red');
    if (!container) return;
    
    const dispositivos = syslogData.dispositivosRed;
    const trafico = syslogData.traficoRed;
    
    container.innerHTML = `
        <div class="card">
            <h3>🌐 Estado de Dispositivos</h3>
            ${dispositivos.map(dispositivo => `
                <div class="metric">
                    <span>
                        <span class="status-indicator status-${dispositivo.estado}"></span>
                        ${dispositivo.nombre}
                    </span>
                    <span><strong>${dispositivo.ip}</strong></span>
                </div>
            `).join('')}
        </div>

        <div class="card">
            <h3>📡 Tráfico de Red</h3>
            <div class="metric">
                <span>Ancho de banda utilizado</span>
                <span><strong>${trafico.anchodeBanda}%</strong></span>
            </div>
            <div class="metric">
                <span>Paquetes transmitidos</span>
                <span><strong>${trafico.paquetesTransmitidos.toLocaleString()}</strong></span>
            </div>
            <div class="metric">
                <span>Paquetes perdidos</span>
                <span style="color: #51cf66;"><strong>${trafico.paquetesPerdidos}% ✅</strong></span>
            </div>
            <div class="metric">
                <span>Latencia promedio</span>
                <span style="color: #51cf66;"><strong>${trafico.latenciaPromedio}ms ✅</strong></span>
            </div>
        </div>
    `;
}

// ========================================
// LOGS EN TIEMPO REAL
// ========================================

function renderLogsEnTiempoReal() {
    const container = document.getElementById('syslogMessages');
    if (!container) return;
    
    container.innerHTML = syslogData.logs.map(log => 
        `<div class="log-entry">${log}</div>`
    ).join('');
}

// ========================================
// ACTUALIZACIÓN DE CONTADORES
// ========================================

function actualizarContadoresSyslog() {
    const eventosElement = document.getElementById('eventos-hoy');
    const erroresElement = document.getElementById('errores-criticos');
    
    if (eventosElement) {
        eventosElement.textContent = syslogData.eventosHoy.toLocaleString();
    }
    
    if (erroresElement) {
        erroresElement.textContent = syslogData.erroresCriticos;
    }
}

// ========================================
// AGREGAR NUEVOS LOGS
// ========================================

function agregarLogEntry(mensaje) {
    // Agregar al inicio de la lista
    syslogData.logs.unshift(mensaje);
    
    // Mantener solo los últimos logs
    if (syslogData.logs.length > 50) {
        syslogData.logs = syslogData.logs.slice(0, 50);
    }
    
    // Actualizar contadores
    syslogData.eventosHoy++;
    
    // Determinar tipo de log y actualizar estadísticas
    const tipoLog = determinarTipoLog(mensaje);
    if (syslogData.estadisticas[tipoLog] !== undefined) {
        syslogData.estadisticas[tipoLog]++;
    }
    
    // Re-renderizar
    renderLogsEnTiempoReal();
    renderEstadisticasLogs();
    actualizarContadoresSyslog();
}

function determinarTipoLog(mensaje) {
    if (mensaje.includes('CRITICAL')) return 'critical';
    if (mensaje.includes('ERROR')) return 'error';
    if (mensaje.includes('WARNING')) return 'warning';
    return 'info';
}

// ========================================
// ACTUALIZAR LOGS MANUALMENTE
// ========================================

function actualizarLogs() {
    const mensajesAleatorios = [
        `[${new Date().toLocaleString()}] INFO: HTTP - Acceso a /dashboard desde 192.168.1.108`,
        `[${new Date().toLocaleString()}] INFO: Sistema - Backup automático completado`,
        `[${new Date().toLocaleString()}] INFO: Venta registrada: Veladora 7 días x3 - $135 MXN`,
        `[${new Date().toLocaleString()}] INFO: SMTP - Newsletter enviada a 127 suscriptores`,
        `[${new Date().toLocaleString()}] WARNING: Uso de CPU alto en Router Admin: 82%`,
        `[${new Date().toLocaleString()}] INFO: QR Code escaneado desde Mesa Videncia 1`,
        `[${new Date().toLocaleString()}] INFO: TFTP - Archivo sincronizado: inventario_actualizado.xlsx`,
        `[${new Date().toLocaleString()}] INFO: Sistema - Limpieza automática de logs completada`,
        `[${new Date().toLocaleString()}] WARNING: Temperatura alta en servidor principal: 78°C`,
        `[${new Date().toLocaleString()}] INFO: HTTP - Nueva sesión iniciada desde 192.168.2.155`
    ];
    
    const cantidad = Math.floor(Math.random() * 3) + 1; // 1-3 logs nuevos
    
    for (let i = 0; i < cantidad; i++) {
        const mensajeAleatorio = mensajesAleatorios[Math.floor(Math.random() * mensajesAleatorios.length)];
        agregarLogEntry(mensajeAleatorio);
    }
    
    // Mostrar notificación
    if (window.CentroMistico && window.CentroMistico.showNotification) {
        window.CentroMistico.showNotification(
            `${cantidad} nuevo${cantidad > 1 ? 's' : ''} evento${cantidad > 1 ? 's' : ''} registrado${cantidad > 1 ? 's' : ''}`,
            'info'
        );
    }
}

// ========================================
// FILTRADO DE LOGS
// ========================================

function filtrarLogs(tipo = 'todos') {
    let logsFiltrados;
    
    switch(tipo) {
        case 'error':
            logsFiltrados = syslogData.logs.filter(log => 
                log.includes('ERROR') || log.includes('CRITICAL')
            );
            break;
        case 'warning':
            logsFiltrados = syslogData.logs.filter(log => 
                log.includes('WARNING')
            );
            break;
        case 'info':
            logsFiltrados = syslogData.logs.filter(log => 
                log.includes('INFO') && !log.includes('WARNING') && !log.includes('ERROR')
            );
            break;
        default:
            logsFiltrados = syslogData.logs;
    }
    
    const container = document.getElementById('syslogMessages');
    if (container) {
        container.innerHTML = logsFiltrados.map(log => 
            `<div class="log-entry">${log}</div>`
        ).join('');
    }
}

// ========================================
// SIMULACIÓN DE EVENTOS DE RED
// ========================================

function simularEventosRed() {
    // Simular cambios en el tráfico de red
    const trafico = syslogData.traficoRed;
    
    trafico.anchodeBanda += Math.floor(Math.random() * 10) - 5;
    trafico.anchodeBanda = Math.max(0, Math.min(100, trafico.anchodeBanda));
    
    trafico.paquetesTransmitidos += Math.floor(Math.random() * 1000) + 500;
    trafico.latenciaPromedio += Math.floor(Math.random() * 6) - 3;
    trafico.latenciaPromedio = Math.max(8, Math.min(50, trafico.latenciaPromedio));
    
    // Simular eventos ocasionales de dispositivos
    if (Math.random() > 0.95) {
        const dispositivo = syslogData.dispositivosRed[Math.floor(Math.random() * syslogData.dispositivosRed.length)];
        
        if (dispositivo.estado === 'online' && Math.random() > 0.8) {
            dispositivo.estado = 'warning';
            agregarLogEntry(
                `[${new Date().toLocaleString()}] WARNING: Alta latencia detectada en ${dispositivo.nombre} (${dispositivo.ip})`
            );
        } else if (dispositivo.estado === 'warning') {
            dispositivo.estado = 'online';
            agregarLogEntry(
                `[${new Date().toLocaleString()}] INFO: ${dispositivo.nombre} ha vuelto a la normalidad`
            );
        }
    }
    
    renderMonitorRed();
}

// ========================================
// EXPORTAR LOGS
// ========================================

function exportarLogs(formato = 'txt') {
    const timestamp = new Date().toISOString().split('T')[0];
    let contenido;
    let nombreArchivo;
    
    switch(formato) {
        case 'json':
            contenido = JSON.stringify({
                servidor: SYSLOG_CONFIG,
                fecha_exportacion: new Date().toISOString(),
                estadisticas: syslogData.estadisticas,
                logs: syslogData.logs
            }, null, 2);
            nombreArchivo = `syslog_${timestamp}.json`;
            break;
        
        case 'csv':
            const headers = 'Timestamp,Nivel,Mensaje\n';
            const csvLogs = syslogData.logs.map(log => {
                const matches = log.match(/\[(.*?)\] (\w+): (.*)/);
                if (matches) {
                    return `"${matches[1]}","${matches[2]}","${matches[3]}"`;
                }
                return `"","INFO","${log}"`;
            }).join('\n');
            contenido = headers + csvLogs;
            nombreArchivo = `syslog_${timestamp}.csv`;
            break;
        
        default: // txt
            contenido = syslogData.logs.join('\n');
            nombreArchivo = `syslog_${timestamp}.txt`;
    }
    
    // Simular descarga
    if (window.CentroMistico && window.CentroMistico.showNotification) {
        window.CentroMistico.showNotification(
            `Logs exportados como ${nombreArchivo}`,
            'success'
        );
    }
    
    return { contenido, nombreArchivo };
}

// ========================================
// AUTO-ACTUALIZACIÓN
// ========================================

let syslogInterval;

function iniciarSimulacionSyslog() {
    syslogInterval = setInterval(() => {
        simularEventosRed();
        
        // Generar logs automáticos ocasionalmente
        if (Math.random() > 0.7) {
            actualizarLogs();
        }
    }, 30000); // Cada 30 segundos
}

function detenerSimulacionSyslog() {
    if (syslogInterval) {
        clearInterval(syslogInterval);
        syslogInterval = null;
    }
}

// ========================================
// EVENT LISTENERS
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    iniciarSimulacionSyslog();
});

// ========================================
// EXPORT
// ========================================

window.SysLogModule = {
    initSysLog,
    agregarLogEntry,
    actualizarLogs,
    filtrarLogs,
    exportarLogs,
    obtenerEstadisticas: () => syslogData,
    iniciarSimulacionSyslog,
    detenerSimulacionSyslog
};