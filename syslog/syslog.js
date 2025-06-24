// Centro Luna - SYSLOG System
// Equipo 3: Carmona Viana Israel • Cortes Buendia Martin

class SyslogSystem {
    constructor() {
        this.logs = [];
        this.areas = ['Ventas', 'Sesiones', 'Inventarios', 'Servidores'];
        this.services = ['SISTEMA', 'SYSLOG', 'FTP', 'HTTP'];
        this.isAutoRefresh = true;
        this.refreshInterval = null;
        
        this.init();
    }

    init() {
        this.loadLogs();
        this.setupEventListeners();
        this.updateStats();
        this.displayLogs();
        this.startAutoRefresh();
        this.generateSampleLogs();
    }

    loadLogs() {
        const storedLogs = localStorage.getItem('centroLunaLogs');
        if (storedLogs) {
            this.logs = JSON.parse(storedLogs);
        } else {
            this.logs = [];
        }
    }

    saveLogs() {
        localStorage.setItem('centroLunaLogs', JSON.stringify(this.logs));
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

    refreshLogs() {
        this.loadLogs();
        this.updateStats();
        this.displayLogs();
        this.showNotification('Logs actualizados', 'success');
    }

    clearLogs() {
        if (confirm('¿Estás seguro de que quieres limpiar todos los logs?')) {
            this.logs = [];
            this.saveLogs();
            this.updateStats();
            this.displayLogs();
            this.showNotification('Logs limpiados', 'warning');
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

    generateManualLog() {
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

        this.addLog(logEntry);
        document.getElementById('manualMessage').value = '';
        this.showNotification('Log generado exitosamente', 'success');
    }

    addLog(logEntry) {
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
            new Date(log.timestamp).toDateString() === today
        ).length;

        const lastActivity = this.logs.length > 0 ? 
            this.formatTimestamp(this.logs[0].timestamp) : '-';

        const areaCount = {};
        this.logs.forEach(log => {
            areaCount[log.area] = (areaCount[log.area] || 0) + 1;
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
            const count = areaCount[area] || 0;
            const element = document.getElementById(`${area.toLowerCase()}-logs`);
            if (element) {
                element.textContent = `${count} logs`;
            }
        });
    }

    displayLogs() {
        const areaFilter = document.getElementById('areaFilter').value;
        const serviceFilter = document.getElementById('serviceFilter').value;
        const logsDisplay = document.getElementById('logsDisplay');

        let filteredLogs = this.logs;

        if (areaFilter) {
            filteredLogs = filteredLogs.filter(log => log.area === areaFilter);
        }

        if (serviceFilter) {
            filteredLogs = filteredLogs.filter(log => log.service === serviceFilter);
        }

        // Limpiar display
        logsDisplay.innerHTML = '';

        if (filteredLogs.length === 0) {
            logsDisplay.innerHTML = `
                <div class="no-logs">
                    <p>📝 No hay logs para mostrar</p>
                    <p>Los logs aparecerán automáticamente aquí</p>
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
        timestamp.textContent = this.formatTimestamp(log.timestamp);

        const service = document.createElement('span');
        service.className = `log-service ${log.service.toLowerCase()}`;
        service.textContent = log.service;

        const area = document.createElement('span');
        area.className = 'log-area';
        area.textContent = log.area;

        const message = document.createElement('span');
        message.className = 'log-message';
        message.textContent = log.message;

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
        const sampleMessages = [
            'Servidor SYSLOG iniciado en puerto 514',
            'Conexión establecida desde Área de Ventas',
            'Log recibido: Venta de cristal de cuarzo registrada',
            'Log recibido: Sesión de tarot iniciada - Mesa 1',
            'Log recibido: Inventario actualizado - Piedras energéticas',
            'Backup automático de logs completado',
            'Log recibido: Cliente conectado via QR',
            'Sistema de monitoreo funcionando correctamente',
            'Log recibido: Consulta de numerología finalizada',
            'Transferencia FTP detectada desde Área de Ventas'
        ];

        // Generar logs iniciales si no existen
        if (this.logs.length === 0) {
            for (let i = 0; i < 10; i++) {
                const randomMessage = sampleMessages[Math.floor(Math.random() * sampleMessages.length)];
                const randomArea = this.areas[Math.floor(Math.random() * this.areas.length)];
                const randomService = this.services[Math.floor(Math.random() * this.services.length)];
                
                const timestamp = new Date();
                timestamp.setMinutes(timestamp.getMinutes() - (i * 5));

                this.addLog({
                    timestamp: timestamp.toISOString(),
                    service: randomService,
                    area: randomArea,
                    message: randomMessage
                });
            }
        }
    }

    startAutoRefresh() {
        this.refreshInterval = setInterval(() => {
            if (this.isAutoRefresh) {
                this.generateRandomLog();
                this.updateStats();
                this.displayLogs();
            }
        }, 8000); // Cada 8 segundos
    }

    generateRandomLog() {
        const activities = [
            'Nueva venta procesada en el sistema',
            'Sesión de tarot registrada en base de datos', 
            'Cliente escaneó QR para reserva',
            'Inventario sincronizado con servidor central',
            'Backup automático ejecutado',
            'Usuario autenticado en el sistema',
            'Reporte de ventas generado',
            'Log de actividad enviado a servidor',
            'Conexión FTP establecida',
            'Sistema de monitoreo activo'
        ];

        const randomMessage = activities[Math.floor(Math.random() * activities.length)];
        const randomArea = this.areas[Math.floor(Math.random() * this.areas.length)];
        const randomService = this.services[Math.floor(Math.random() * this.services.length)];

        this.addLog({
            timestamp: new Date().toISOString(),
            service: randomService,
            area: randomArea,
            message: randomMessage
        });
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: ${type === 'success' ? '#238636' : type === 'error' ? '#da3633' : '#1f6feb'};
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
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
}

// Inicializar el sistema SYSLOG
document.addEventListener('DOMContentLoaded', () => {
    window.syslogSystem = new SyslogSystem();
    
    console.log(`
    📝 Centro Luna - Sistema SYSLOG Iniciado
    ========================================
    
    🔧 Configuración:
    - Puerto: 514 UDP
    - Servidor: 172.19.5.0/25 (Área 3 - Inventarios)
    - Auto-refresh: Activo (cada 8 segundos)
    - Capacidad: 200 logs máximo
    
    🌐 Áreas monitoreadas:
    - Área 1 - Ventas (172.19.0.0/22)
    - Área 2 - Sesiones (172.19.4.0/24)  
    - Área 3 - Inventarios (172.19.5.0/25)
    - Área 4 - Servidores (172.19.5.144/29)
    
    ✅ Sistema listo para recibir logs
    `);
});