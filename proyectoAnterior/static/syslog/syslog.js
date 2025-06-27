// Centro Luna - SYSLOG System REAL
// Equipo 3: Carmona Viana Israel • Cortes Buendia Martin

class SyslogSystem {
    constructor() {
        this.logs = [];
        this.areas = ['Ventas', 'Sesiones', 'Inventarios', 'Servidores'];
        this.services = ['SISTEMA', 'SYSLOG', 'FTP', 'HTTP'];
        this.isAutoRefresh = true;
        this.refreshInterval = null;
        this.serverUrl = window.location.hostname + ':514';
        this.isOnline = false;
        
        this.init();
    }

    init() {
        this.checkSyslogServer();
        this.setupEventListeners();
        this.updateStats();
        this.displayLogs();
        this.startAutoRefresh();
    }

    async checkSyslogServer() {
        try {
            // ✅ Intentar conectar al servidor SYSLOG real
            const response = await fetch(`http://${this.serverUrl}/health`);
            if (response.ok) {
                this.isOnline = true;
                console.log('✅ Conectado al servidor SYSLOG real');
                await this.loadLogsFromServer();
            } else {
                throw new Error('SYSLOG server not responding');
            }
        } catch (error) {
            this.isOnline = false;
            console.log('❌ Servidor SYSLOG no disponible, usando datos locales');
            this.loadLogsFromLocal();
        }
    }

    async loadLogsFromServer() {
        try {
            // ✅ Cargar logs REALES del servidor
            const response = await fetch(`http://${this.serverUrl}/logs?limit=100`);
            const data = await response.json();
            
            if (data.success) {
                this.logs = data.logs || [];
                console.log(`✅ Cargados ${this.logs.length} logs del servidor SYSLOG`);
            } else {
                throw new Error('Failed to load logs from server');
            }
        } catch (error) {
            console.error('❌ Error cargando logs del servidor:', error);
            this.loadLogsFromLocal();
        }
    }

    updateConnectionStatus() {
    // Actualizar estado principal del SYSLOG
    const syslogStatusInfo = document.getElementById('syslogStatusInfo');
    if (syslogStatusInfo) {
        syslogStatusInfo.textContent = this.isOnline ? '🟢 ACTIVO' : '🔴 OFFLINE';
    }

    // Actualizar indicadores de áreas
    const areaIndicators = document.querySelectorAll('.area-status-indicator');
    areaIndicators.forEach(indicator => {
        indicator.textContent = this.isOnline ? '🟢 Online' : '🔴 Offline';
        indicator.style.color = this.isOnline ? '#28a745' : '#dc3545';
    });
}

    loadLogsFromLocal() {
        // Fallback a localStorage solo en modo offline
        const storedLogs = localStorage.getItem('centroLunaLogs');
        if (storedLogs) {
            this.logs = JSON.parse(storedLogs);
            console.log(`💾 Cargados ${this.logs.length} logs desde almacenamiento local`);
        } else {
            this.logs = [];
            this.generateSampleLogs(); // Solo si no hay datos
        }
    }

    saveLogs() {
        if (this.isOnline) {
            // En modo online, los logs se guardan automáticamente en el servidor
            console.log('📡 Logs guardados automáticamente en servidor');
        } else {
            // En modo offline, guardar localmente
            localStorage.setItem('centroLunaLogs', JSON.stringify(this.logs));
            console.log('💾 Logs guardados localmente (modo offline)');
        }
    }

    setupEventListeners() {
        // Botones principales
        document.getElementById('refreshLogs').addEventListener('click', () => {
            this.refreshLogs();
        });

        document.getElementById('clearLogs').addEventListener('click', () => {
            this.clearLogs();
        });

        document.getElementById('exportLogs').addEventListener('click', () => {
            this.exportLogs();
        });

        // Filtros
        document.getElementById('areaFilter').addEventListener('change', () => {
            this.displayLogs();
        });

        document.getElementById('serviceFilter').addEventListener('change', () => {
            this.displayLogs();
        });

        // Generador de logs manual
        document.getElementById('generateLog').addEventListener('click', () => {
            this.generateManualLog();
        });

        // Enter en el input de mensaje
        document.getElementById('manualMessage').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.generateManualLog();
            }
        });
    }

    async refreshLogs() {
        if (this.isOnline) {
            await this.loadLogsFromServer();
        } else {
            await this.checkSyslogServer(); // Intentar reconectar
            if (!this.isOnline) {
                this.loadLogsFromLocal();
            }
        }
        
        this.updateStats();
        this.displayLogs();
        this.showNotification('Logs actualizados', 'success');
    }

    async clearLogs() {
        if (confirm('¿Estás seguro de que quieres limpiar todos los logs?')) {
            if (this.isOnline) {
                try {
                    // ✅ Limpiar logs en el servidor real
                    const response = await fetch(`http://${this.serverUrl}/clear`, {
                        method: 'POST'
                    });
                    
                    if (response.ok) {
                        this.logs = [];
                        this.showNotification('Logs limpiados en servidor', 'warning');
                    } else {
                        throw new Error('Failed to clear logs on server');
                    }
                } catch (error) {
                    console.error('❌ Error limpiando logs en servidor:', error);
                    this.showNotification('Error limpiando logs en servidor', 'error');
                }
            } else {
                // Modo offline
                this.logs = [];
                this.saveLogs();
                this.showNotification('Logs limpiados localmente', 'warning');
            }
            
            this.updateStats();
            this.displayLogs();
        }
    }

    exportLogs() {
        const dataStr = JSON.stringify(this.logs, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `centro_luna_logs_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
        this.showNotification('Logs exportados', 'success');
    }

    async generateManualLog() {
        const service = document.getElementById('manualService').value;
        const area = document.getElementById('manualArea').value;
        const message = document.getElementById('manualMessage').value.trim();

        if (!message) {
            this.showNotification('Ingresa un mensaje para el log', 'error');
            return;
        }

        const logEntry = {
            timestamp: new Date().toISOString(),
            service: service,
            area: area,
            message: message
        };

        if (this.isOnline) {
            try {
                // ✅ Enviar log manual al servidor real
                const response = await fetch(`http://${this.serverUrl}/log`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        ...logEntry,
                        source_area: area,
                        facility: 16,
                        severity: 6,
                        hostname: 'manual-entry'
                    })
                });

                if (response.ok) {
                    // Recargar logs del servidor para ver el nuevo
                    await this.loadLogsFromServer();
                    this.showNotification('Log enviado al servidor', 'success');
                } else {
                    throw new Error('Failed to send log to server');
                }
            } catch (error) {
                console.error('❌ Error enviando log manual:', error);
                // Fallback a modo local
                this.addLogLocal(logEntry);
                this.showNotification('Log guardado localmente (servidor offline)', 'warning');
            }
        } else {
            // Modo offline
            this.addLogLocal(logEntry);
            this.showNotification('Log guardado localmente', 'info');
        }

        document.getElementById('manualMessage').value = '';
    }

    addLogLocal(logEntry) {
        this.logs.unshift(logEntry);
        
        // Mantener solo los últimos 200 logs
        if (this.logs.length > 200) {
            this.logs = this.logs.slice(0, 200);
        }
        
        this.saveLogs();
        this.updateStats();
        this.displayLogs();
    }

    updateStats() {
        const totalLogs = this.logs.length;
        const today = new Date().toDateString();
        const logsToday = this.logs.filter(log => 
            new Date(log.timestamp || log.received_at).toDateString() === today
        ).length;

        const lastActivity = this.logs.length > 0 ? 
            this.formatTimestamp(this.logs[0].timestamp || this.logs[0].received_at) : '-';

        const areaCount = {};
        this.logs.forEach(log => {
            const area = log.area || log.source_area || 'unknown';
            areaCount[area] = (areaCount[area] || 0) + 1;
        });

        const mostActiveArea = Object.keys(areaCount).length > 0 ?
            Object.keys(areaCount).reduce((a, b) => areaCount[a] > areaCount[b] ? a : b) : '-';

        // Actualizar UI
        document.getElementById('totalLogs').textContent = totalLogs;
        document.getElementById('logsToday').textContent = logsToday;
        document.getElementById('lastActivity').textContent = lastActivity;
        document.getElementById('mostActiveArea').textContent = mostActiveArea;

        // Actualizar contadores por área
        this.areas.forEach(area => {
            const count = areaCount[area] || areaCount[area.toLowerCase()] || 0;
            const element = document.getElementById(`${area.toLowerCase()}-logs`);
            if (element) {
                element.textContent = `${count} logs`;
            }
        });

        // Mostrar estado de conexión
        this.updateConnectionStatus();
    }

    updateConnectionStatus() {
        const connectionStatus = document.querySelector('.connection-status') || 
                               document.createElement('div');
        
        if (!document.querySelector('.connection-status')) {
            connectionStatus.className = 'connection-status';
            connectionStatus.style.cssText = `
                position: fixed;
                top: 80px;
                right: 20px;
                padding: 0.5rem 1rem;
                border-radius: 20px;
                font-size: 0.9rem;
                z-index: 999;
            `;
            document.body.appendChild(connectionStatus);
        }

        if (this.isOnline) {
            connectionStatus.textContent = '🟢 Conectado al servidor SYSLOG';
            connectionStatus.style.background = '#28a745';
            connectionStatus.style.color = 'white';
        } else {
            connectionStatus.textContent = '🔴 Servidor SYSLOG offline';
            connectionStatus.style.background = '#dc3545';
            connectionStatus.style.color = 'white';
        }
    }

    displayLogs() {
        const areaFilter = document.getElementById('areaFilter').value;
        const serviceFilter = document.getElementById('serviceFilter').value;
        const logsDisplay = document.getElementById('logsDisplay');

        let filteredLogs = this.logs;

        if (areaFilter) {
            filteredLogs = filteredLogs.filter(log => 
                (log.area && log.area === areaFilter) || 
                (log.source_area && log.source_area === areaFilter)
            );
        }

        if (serviceFilter) {
            filteredLogs = filteredLogs.filter(log => 
                log.service === serviceFilter
            );
        }

        // Limpiar display
        logsDisplay.innerHTML = '';

        if (filteredLogs.length === 0) {
            logsDisplay.innerHTML = `
                <div class="no-logs">
                    <p>📝 No hay logs para mostrar</p>
                    <p>${this.isOnline ? 'Los logs del servidor aparecerán aquí' : 'Conecta al servidor para ver logs en tiempo real'}</p>
                </div>
            `;
            return;
        }

        filteredLogs.forEach(log => {
            const logElement = this.createLogElement(log);
            logsDisplay.appendChild(logElement);
        });
    }

    createLogElement(log) {
        const logEntry = document.createElement('div');
        logEntry.className = 'log-entry';

        const timestamp = document.createElement('span');
        timestamp.className = 'log-timestamp';
        timestamp.textContent = this.formatTimestamp(log.timestamp || log.received_at);

        const service = document.createElement('span');
        service.className = `log-service ${(log.service || 'sistema').toLowerCase()}`;
        service.textContent = log.service || 'SISTEMA';

        const area = document.createElement('span');
        area.className = 'log-area';
        area.textContent = log.area || log.source_area || 'unknown';

        const message = document.createElement('span');
        message.className = 'log-message';
        message.textContent = log.message || '';

        logEntry.appendChild(timestamp);
        logEntry.appendChild(service);
        logEntry.appendChild(area);
        logEntry.appendChild(message);

        return logEntry;
    }

    formatTimestamp(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleString('es-ES', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    }

    generateSampleLogs() {
        // Solo generar logs de ejemplo si estamos offline y no hay datos
        if (!this.isOnline && this.logs.length === 0) {
            const sampleMessages = [
                'Sistema SYSLOG iniciado en modo offline',
                'Datos cargados desde almacenamiento local',
                'Esperando conexión con servidor real',
                'Logs de ejemplo generados para demostración'
            ];

            for (let i = 0; i < 4; i++) {
                const timestamp = new Date();
                timestamp.setMinutes(timestamp.getMinutes() - (i * 5));

                this.addLogLocal({
                    timestamp: timestamp.toISOString(),
                    service: 'SISTEMA',
                    area: 'Servidores',
                    message: sampleMessages[i]
                });
            }
        }
    }

    startAutoRefresh() {
        this.refreshInterval = setInterval(async () => {
            if (this.isAutoRefresh) {
                if (this.isOnline) {
                    // ✅ Recargar logs del servidor real cada 8 segundos
                    await this.loadLogsFromServer();
                    this.updateStats();
                    this.displayLogs();
                } else {
                    // Intentar reconectar al servidor
                    await this.checkSyslogServer();
                }
            }
        }, 8000);
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: ${type === 'success' ? '#238636' : type === 'error' ? '#da3633' : type === 'warning' ? '#ffc107' : '#1f6feb'};
            color: white;
            padding: 1rem 2rem;
            border-radius: 5px;
            z-index: 10000;
            box-shadow: 0 4px 8px rgba(0,0,0,0.3);
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            notification.style.transition = 'all 0.3s ease';
            
            setTimeout(() => {
                if (notification.parentElement) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    // Métodos públicos para debugging
    getServerStatus() {
        return {
            isOnline: this.isOnline,
            serverUrl: this.serverUrl,
            logsCount: this.logs.length,
            lastUpdate: this.logs[0]?.timestamp || this.logs[0]?.received_at || null
        };
    }

    async forceReconnect() {
        console.log('🔄 Forzando reconexión al servidor SYSLOG...');
        await this.checkSyslogServer();
        if (this.isOnline) {
            await this.loadLogsFromServer();
            this.updateStats();
            this.displayLogs();
            this.showNotification('Reconectado al servidor SYSLOG', 'success');
        } else {
            this.showNotification('No se pudo conectar al servidor SYSLOG', 'error');
        }
    }
}

// Inicializar el sistema SYSLOG
document.addEventListener('DOMContentLoaded', () => {
    window.syslogSystem = new SyslogSystem();
    
    // Funciones globales para debugging
    window.syslogUtils = {
        getStatus: () => window.syslogSystem.getServerStatus(),
        reconnect: () => window.syslogSystem.forceReconnect(),
        testLog: (message) => {
            document.getElementById('manualMessage').value = message || 'Log de prueba';
            window.syslogSystem.generateManualLog();
        }
    };
    
    console.log(`
    📝 Centro Luna - Sistema SYSLOG REAL Iniciado
    =============================================
    
    🔗 Configuración REAL:
    - Servidor: ${window.location.hostname}:514
    - Protocolo: HTTP API + UDP SYSLOG
    - Auto-refresh: Cada 8 segundos
    - Capacidad: Ilimitada (servidor)
    
    🌐 Áreas monitoreadas:
    - Área 1 - Ventas (172.19.0.0/22)
    - Área 2 - Sesiones (172.19.4.0/24)  
    - Área 3 - Inventarios (172.19.5.0/25)
    - Área 4 - Servidores (172.19.5.144/29)
    
    🧪 Comandos de prueba:
    syslogUtils.getStatus()     - Ver estado de conexión
    syslogUtils.reconnect()     - Forzar reconexión
    syslogUtils.testLog('msg')  - Enviar log de prueba
    
    ${window.syslogSystem.isOnline ? '✅ Conectado al servidor SYSLOG' : '❌ Servidor SYSLOG offline - Modo local'}
    `);
});