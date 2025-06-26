// Centro Luna - JavaScript Principal con Integración Real
// Equipo 3: Carmona Viana Israel • Cortes Buendia Martin

class CentroLunaSystem {
    constructor() {
        // Configuración de red real
        this.serverConfig = {
            webServer: window.location.protocol + '//' + window.location.host,
            syslogServer: window.location.protocol + '//' + window.location.hostname + ':514'
        };
        
        this.areas = {
            ventas: { ip: '172.19.0.0/22', router: '172.19.0.1', name: 'Ventas', status: 'checking' },
            sesiones: { ip: '172.19.4.0/24', router: '172.19.4.1', name: 'Sesiones', status: 'checking' },
            inventarios: { ip: '172.19.5.0/25', router: '172.19.5.1', name: 'Inventarios', status: 'checking' },
            servidores: { ip: '172.19.5.144/29', router: '172.19.5.145', name: 'Servidores', status: 'checking' }
        };
        
        this.servicios = {
            http: { puerto: 8080, status: 'checking', descripcion: 'Servidor Web Principal' },
            syslog: { puerto: 514, status: 'checking', descripcion: 'Sistema de Logs' },
            ftp: { puerto: 21, status: 'checking', descripcion: 'Transferencia de Archivos' }
        };
        
        this.isOnline = false;
        this.init();
    }

    init() {
        this.checkServerConnection();
        this.updateAreaStatus();
        this.updateServiceStatus();
        this.setupEventListeners();
        this.startRealTimeMonitoring();
    }

    async checkServerConnection() {
        try {
            const response = await fetch(`${this.serverConfig.webServer}/health`);
            if (response.ok) {
                this.isOnline = true;
                console.log('✅ Conectado al servidor real');
                this.showConnectionStatus('Conectado al servidor real', 'success');
                await this.syncWithServer();
            } else {
                throw new Error('Server not responding');
            }
        } catch (error) {
            this.isOnline = false;
            console.log('❌ Servidor no disponible, modo offline');
            this.showConnectionStatus('Servidor no disponible - Modo Offline', 'warning');
            this.enableOfflineMode();
        }
    }

    async syncWithServer() {
        try {
            const response = await fetch(`${this.serverConfig.webServer}/api/status`);
            const data = await response.json();
            
            // Actualizar estado de áreas con datos reales del ping
            Object.entries(data.areas).forEach(([areaName, areaData]) => {
                if (this.areas[areaName]) {
                    this.areas[areaName].status = areaData.status;
                    this.areas[areaName].latency = areaData.latency;
                    this.areas[areaName].lastCheck = areaData.last_check;
                }
            });
            
            // Actualizar estado de servicios
            Object.entries(data.services).forEach(([serviceName, serviceData]) => {
                if (this.servicios[serviceName]) {
                    this.servicios[serviceName].status = serviceData.status;
                }
            });
            
            this.updateUI();
            
        } catch (error) {
            console.error('Error al sincronizar con servidor:', error);
        }
    }

    updateAreaStatus() {
        const areaCards = document.querySelectorAll('.area-card');
        areaCards.forEach((card, index) => {
            const areaNames = ['ventas', 'sesiones', 'inventarios', 'servidores'];
            const areaName = areaNames[index];
            const area = this.areas[areaName];
            
            if (area) {
                let statusIndicator = card.querySelector('.status-indicator');
                if (!statusIndicator) {
                    statusIndicator = document.createElement('div');
                    statusIndicator.className = 'status-indicator';
                    card.appendChild(statusIndicator);
                }
                
                const statusIcon = area.status === 'online' ? '🟢' : 
                                 area.status === 'offline' ? '🔴' : '🟡';
                const statusText = area.status === 'online' ? 'Online' : 
                                 area.status === 'offline' ? 'Offline' : 'Checking...';
                
                statusIndicator.innerHTML = `${statusIcon} ${statusText}`;
                if (area.latency !== undefined) {
                    statusIndicator.innerHTML += ` (${area.latency}ms)`;
                }
            }
        });
    }

    updateServiceStatus() {
        const serviceCards = document.querySelectorAll('.servicio-red-card');
        serviceCards.forEach(card => {
            const h3 = card.querySelector('h3');
            const serviceName = h3.textContent.toLowerCase();
            
            let service = null;
            if (serviceName.includes('syslog')) service = this.servicios.syslog;
            else if (serviceName.includes('ftp')) service = this.servicios.ftp;
            else if (serviceName.includes('http')) service = this.servicios.http;
            
            if (service) {
                let statusIndicator = card.querySelector('.service-status');
                if (!statusIndicator) {
                    statusIndicator = document.createElement('div');
                    statusIndicator.className = 'service-status';
                    card.appendChild(statusIndicator);
                }
                
                const statusIcon = service.status === 'active' ? '✅' : 
                                 service.status === 'inactive' ? '❌' : '🔄';
                const statusText = service.status === 'active' ? 'Activo' : 
                                 service.status === 'inactive' ? 'Inactivo' : 'Verificando...';
                
                statusIndicator.innerHTML = `${statusIcon} ${statusText}`;
            }
        });
    }

    setupEventListeners() {
        // Smooth scrolling para navegación
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });

        // Event listeners para botones de servicios
        const syslogBtn = document.querySelector('a[href="syslog/syslog.html"]');
        const ftpBtn = document.querySelector('a[href="ftp/ftp.html"]');

        if (syslogBtn) {
            syslogBtn.addEventListener('click', (e) => {
                this.logActivity('SYSLOG', 'Usuario accediendo al sistema de logs');
            });
        }

        if (ftpBtn) {
            ftpBtn.addEventListener('click', (e) => {
                this.logActivity('FTP', 'Usuario accediendo al sistema de archivos');
            });
        }
    }

    startRealTimeMonitoring() {
        // Verificar conexión cada 30 segundos
        setInterval(async () => {
            if (this.isOnline) {
                await this.syncWithServer();
            } else {
                await this.checkServerConnection();
            }
        }, 30000);

        // Generar actividad de red cada 10 segundos
        setInterval(() => {
            this.generateNetworkActivity();
        }, 10000);
    }

    generateNetworkActivity() {
        const activities = [
            { area: 'ventas', message: 'Venta registrada en el sistema' },
            { area: 'sesiones', message: 'Sesión de tarot iniciada' }, 
            { area: 'inventarios', message: 'Inventario actualizado' },
            { area: 'servidores', message: 'Backup automático ejecutado' },
            { area: 'sesiones', message: 'Cliente conectado via QR' },
            { area: 'ventas', message: 'Reporte de ventas generado' }
        ];

        const randomActivity = activities[Math.floor(Math.random() * activities.length)];
        this.logActivity('SISTEMA', randomActivity.message, randomActivity.area);
    }

    async logActivity(service, message, area = 'unknown') {
        const timestamp = new Date().toISOString();
        const logEntry = {
            timestamp: timestamp,
            service: service,
            message: message,
            area: area
        };

        if (this.isOnline) {
            try {
                // ✅ ENVIAR AL SERVIDOR REAL - No más localStorage
                const response = await fetch(`${this.serverConfig.webServer}/log`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        message: `${service}: ${message}`,
                        source_area: area,
                        timestamp: timestamp
                    })
                });
                
                if (response.ok) {
                    console.log(`✅ Log enviado al servidor: [${service}] ${message}`);
                } else {
                    throw new Error('Failed to send log');
                }
            } catch (error) {
                console.error('❌ Error enviando log al servidor:', error);
                this.logToLocalStorage(logEntry);
            }
        } else {
            // Modo offline - guardar localmente
            this.logToLocalStorage(logEntry);
        }
    }

    logToLocalStorage(logEntry) {
        let logs = JSON.parse(localStorage.getItem('centroLunaLogs') || '[]');
        logs.unshift(logEntry);
        
        if (logs.length > 100) {
            logs = logs.slice(0, 100);
        }
        
        localStorage.setItem('centroLunaLogs', JSON.stringify(logs));
        console.log(`💾 Log guardado offline: [${logEntry.service}] ${logEntry.message}`);
    }

    updateUI() {
        this.updateAreaStatus();
        this.updateServiceStatus();
    }

    enableOfflineMode() {
        // Configurar funcionalidad offline
        this.areas = Object.fromEntries(
            Object.entries(this.areas).map(([key, area]) => [
                key, { ...area, status: 'unknown' }
            ])
        );
        
        this.servicios = Object.fromEntries(
            Object.entries(this.servicios).map(([key, service]) => [
                key, { ...service, status: 'unknown' }
            ])
        );
        
        this.updateUI();
    }

    showConnectionStatus(message, type) {
        const notification = document.createElement('div');
        notification.className = `connection-status ${type}`;
        notification.textContent = message;
        
        const colors = {
            'success': '#28a745',
            'warning': '#ffc107',
            'error': '#dc3545'
        };
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: ${colors[type]};
            color: white;
            padding: 0.5rem 2rem;
            border-radius: 25px;
            z-index: 10000;
            font-weight: bold;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }

    getCurrentArea() {
        const hour = new Date().getHours();
        if (hour >= 9 && hour < 12) return 'ventas';
        if (hour >= 12 && hour < 18) return 'sesiones';
        if (hour >= 18 && hour < 21) return 'inventarios';
        return 'servidores';
    }

    // API pública para otros scripts
    getNetworkStatus() {
        return {
            isOnline: this.isOnline,
            areas: this.areas,
            services: this.servicios,
            server: this.serverConfig
        };
    }

    async pingArea(areaName) {
        if (!this.isOnline) return { success: false, error: 'Offline mode' };
        
        const area = this.areas[areaName];
        if (!area) return { success: false, error: 'Area not found' };
        
        try {
            const response = await fetch(`${this.serverConfig.webServer}/api/ping`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    target: area.router,
                    area: areaName
                })
            });
            
            return await response.json();
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
}

// Inicializar el sistema cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
    window.centroLuna = new CentroLunaSystem();
    
    // Mensaje de bienvenida en consola
    console.log(`
    🌙 Centro Luna - Sistema REAL Iniciado
    ======================================
    Equipo 3: Carmona Viana Israel • Cortes Buendia Martin
    
    🔗 Conectando a servidores reales:
    - Web Server: ${window.location.host}
    - SYSLOG Server: ${window.location.hostname}:514
    
    🌐 Topología de Red REAL:
    - Área 1 - Ventas: 172.19.0.0/22 (Router: 172.19.0.1)
    - Área 2 - Sesiones: 172.19.4.0/24 (Router: 172.19.4.1)  
    - Área 3 - Inventarios: 172.19.5.0/25 (Router: 172.19.5.1)
    - Área 4 - Servidores: 172.19.5.144/29 (Router: 172.19.5.145)
    
    ✅ Verificando conectividad real con routers...
    `);
});

// Funciones globales útiles actualizadas
window.centroLunaUtils = {
    formatTimestamp: (timestamp) => {
        return new Date(timestamp).toLocaleString('es-ES');
    },
    
    getLogs: () => {
        return JSON.parse(localStorage.getItem('centroLunaLogs') || '[]');
    },
    
    clearLogs: () => {
        localStorage.removeItem('centroLunaLogs');
        console.log('Logs offline limpiados');
    },
    
    getNetworkStatus: () => {
        return window.centroLuna ? window.centroLuna.getNetworkStatus() : null;
    },
    
    pingArea: async (areaName) => {
        return window.centroLuna ? await window.centroLuna.pingArea(areaName) : null;
    },
    
    testConnection: async () => {
        if (window.centroLuna) {
            console.log('🔍 Probando conectividad REAL...');
            const areas = ['ventas', 'sesiones', 'inventarios', 'servidores'];
            
            for (const area of areas) {
                const result = await window.centroLuna.pingArea(area);
                console.log(`${area}: ${result.success ? '✅ Online' : '❌ Offline'} ${result.latency ? `(${result.latency}ms)` : ''}`);
            }
        }
    }
};