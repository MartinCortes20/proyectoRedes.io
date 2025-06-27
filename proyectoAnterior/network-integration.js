// Centro Luna - Integración con Red Real
// Configuración para conectar con la topología física
// Equipo 3: Carmona Viana Israel • Cortes Buendia Martin

class RealNetworkIntegration {
    constructor() {
        // IPs reales de tu topología
        this.networkConfig = {
            areas: {
                ventas: {
                    router: '172.19.0.1',
                    network: '172.19.0.0/22',
                    vpcs: ['172.19.0.2', '172.19.0.3', '172.19.0.4', '172.19.0.5']
                },
                sesiones: {
                    router: '172.19.4.1',
                    network: '172.19.4.0/24',
                    vlans: {
                        tarot: { network: '172.19.4.0/24', vpcs: ['172.19.4.5', '172.19.4.9'] },
                        astro: { network: '172.19.6.0/24', vpcs: ['172.19.6.6', '172.19.6.10'] },
                        numero: { network: '172.19.7.0/24', vpcs: ['172.19.7.7', '172.19.7.8'] }
                    }
                },
                inventarios: {
                    router: '172.19.5.1',
                    network: '172.19.5.0/25',
                    vpcs: ['172.19.5.2', '172.19.5.3']
                },
                servidores: {
                    router: '172.19.5.145',
                    network: '172.19.5.144/29',
                    vms: {
                        vm1: '172.19.5.146',
                        vm2: '172.19.5.147',
                        webServer: '172.19.5.146',  // Tu servidor web
                        syslogServer: '172.19.5.147' // Servidor SYSLOG
                    }
                }
            },
            services: {
                http: { port: 8080, server: '172.19.5.146' },
                syslog: { port: 514, server: '172.19.5.147' },
                ftp: { port: 21, server: '172.19.5.146' }
            }
        };
        
        this.isOnline = false;
        this.lastHealthCheck = null;
        this.init();
    }

    init() {
        console.log('🔧 Inicializando integración con red real...');
        this.setupNetworkMonitoring();
        this.setupRealTimeUpdates();
        this.startHealthCheck();
    }

    // Verificar conectividad real con la red
    async checkNetworkConnectivity() {
        const results = {
            areas: {},
            services: {},
            timestamp: new Date().toISOString(),
            serverOnline: false
        };

        // Primero verificar si el servidor web está disponible
        try {
            const serverResponse = await fetch(`http://${this.networkConfig.services.http.server}:${this.networkConfig.services.http.port}/health`, {
                method: 'GET',
                timeout: 5000
            });
            
            if (serverResponse.ok) {
                results.serverOnline = true;
                this.isOnline = true;
            }
        } catch (error) {
            results.serverOnline = false;
            this.isOnline = false;
            console.log('❌ Servidor VM1 no disponible');
        }

        // Si el servidor está online, verificar cada área
        if (this.isOnline) {
            for (const [areaName, config] of Object.entries(this.networkConfig.areas)) {
                results.areas[areaName] = await this.pingArea(areaName, config);
            }

            // Verificar servicios
            for (const [serviceName, config] of Object.entries(this.networkConfig.services)) {
                results.services[serviceName] = await this.checkService(serviceName, config);
            }
        } else {
            // Marcar todo como offline si no hay servidor
            Object.keys(this.networkConfig.areas).forEach(area => {
                results.areas[area] = { status: 'server_offline', router: this.networkConfig.areas[area].router };
            });
            Object.keys(this.networkConfig.services).forEach(service => {
                results.services[service] = { status: 'server_offline' };
            });
        }

        this.lastHealthCheck = results;
        return results;
    }

    // Ping a un área específica
    async pingArea(areaName, config) {
        if (!this.isOnline) {
            return {
                status: 'server_offline',
                router: config.router,
                lastCheck: new Date().toISOString()
            };
        }

        try {
            const response = await fetch(`http://${this.networkConfig.services.http.server}:${this.networkConfig.services.http.port}/api/ping`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ target: config.router, area: areaName }),
                timeout: 8000
            });
            
            const result = await response.json();
            return {
                status: result.success ? 'online' : 'offline',
                latency: result.latency || 0,
                router: config.router,
                lastCheck: new Date().toISOString(),
                error: result.error || null
            };
        } catch (error) {
            return {
                status: 'error',
                error: error.message,
                router: config.router,
                lastCheck: new Date().toISOString()
            };
        }
    }

    // Verificar servicios de red
    async checkService(serviceName, config) {
        if (!this.isOnline) {
            return { status: 'server_offline', server: config.server, port: config.port };
        }

        try {
            let url;
            if (serviceName === 'syslog') {
                url = `http://${config.server}:${config.port}/health`;
            } else {
                url = `http://${config.server}:${config.port}/health`;
            }

            const response = await fetch(url, {
                method: 'GET',
                timeout: 5000
            });
            
            return {
                status: response.ok ? 'active' : 'inactive',
                server: config.server,
                port: config.port,
                lastCheck: new Date().toISOString()
            };
        } catch (error) {
            return {
                status: 'error',
                error: error.message,
                server: config.server,
                port: config.port,
                lastCheck: new Date().toISOString()
            };
        }
    }

    // Enviar logs reales al servidor SYSLOG
    async sendSyslogMessage(facility, severity, message, sourceArea = 'unknown') {
        if (!this.isOnline) {
            this.logToLocalStorage('SYSLOG_OFFLINE', message, sourceArea);
            return false;
        }

        const syslogConfig = this.networkConfig.services.syslog;
        
        try {
            const syslogMessage = {
                timestamp: new Date().toISOString(),
                facility: facility,
                severity: severity,
                hostname: window.location.hostname || 'centro-luna-web',
                appName: 'centro-luna-web',
                message: message,
                sourceArea: sourceArea,
                sourceIP: await this.getClientIP()
            };

            // Enviar al servidor SYSLOG real
            const response = await fetch(`http://${syslogConfig.server}:${syslogConfig.port}/log`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(syslogMessage),
                timeout: 5000
            });

            if (response.ok) {
                console.log('✅ SYSLOG: Mensaje enviado exitosamente');
                return true;
            } else {
                console.error('❌ SYSLOG: Error al enviar mensaje');
                return false;
            }
        } catch (error) {
            console.error('❌ SYSLOG: Error de conexión:', error);
            // Fallback a localStorage para modo offline
            this.logToLocalStorage('SYSLOG_ERROR', message, sourceArea);
            return false;
        }
    }

    // Operaciones FTP reales
    async ftpOperation(operation, params) {
        if (!this.isOnline) {
            return { success: false, error: 'Servidor offline' };
        }

        const ftpConfig = this.networkConfig.services.ftp;
        
        try {
            const response = await fetch(`http://${ftpConfig.server}:${ftpConfig.port}/ftp/${operation}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(params),
                timeout: 10000
            });

            const result = await response.json();
            
            // Log de la operación
            await this.sendSyslogMessage(16, 6, `FTP ${operation}: ${result.message}`, 'servidores');
            
            return result;
        } catch (error) {
            console.error('❌ FTP: Error en operación:', error);
            await this.sendSyslogMessage(16, 3, `FTP ERROR: ${error.message}`, 'servidores');
            return { success: false, error: error.message };
        }
    }

    // Obtener IP del cliente
    async getClientIP() {
        try {
            const response = await fetch('https://api.ipify.org?format=json', { timeout: 3000 });
            const data = await response.json();
            return data.ip;
        } catch (error) {
            return 'unknown';
        }
    }

    // Monitoreo de red en tiempo real
    setupNetworkMonitoring() {
        // Verificación inicial
        setTimeout(() => {
            this.performNetworkCheck();
        }, 2000);

        // Verificación periódica cada 30 segundos
        setInterval(async () => {
            await this.performNetworkCheck();
        }, 30000);
    }

    async performNetworkCheck() {
        console.log('🔍 Verificando estado de la red...');
        const networkStatus = await this.checkNetworkConnectivity();
        
        // Actualizar UI con estado real
        this.updateNetworkStatusUI(networkStatus);
        
        // Enviar log del estado si está online
        if (this.isOnline) {
            const onlineAreas = Object.values(networkStatus.areas).filter(area => area.status === 'online').length;
            await this.sendSyslogMessage(16, 6, 
                `Network Status Check: ${onlineAreas}/4 areas online`, 
                'servidores'
            );
        }

        // Mostrar notificación de estado
        this.showNetworkStatus(networkStatus);
    }

    // Actualizar interfaz con estado real de la red
    updateNetworkStatusUI(networkStatus) {
        // Actualizar indicadores de áreas
        Object.entries(networkStatus.areas).forEach(([area, status]) => {
            // Buscar el elemento del área
            const areaElement = document.querySelector(`[data-area="${area}"]`) || 
                              document.querySelector(`.area-card:nth-child(${this.getAreaIndex(area)})`);
            
            if (areaElement) {
                let statusIndicator = areaElement.querySelector('.area-status-indicator') || 
                                    areaElement.querySelector('.status-indicator');
                
                if (!statusIndicator) {
                    statusIndicator = document.createElement('div');
                    statusIndicator.className = 'area-status-indicator';
                    areaElement.appendChild(statusIndicator);
                }

                const statusInfo = this.getStatusDisplay(status.status, status.latency);
                statusIndicator.innerHTML = statusInfo.text;
                statusIndicator.className = `area-status-indicator ${status.status}`;
                statusIndicator.style.color = statusInfo.color;
            }
        });

        // Actualizar indicadores de servicios
        Object.entries(networkStatus.services).forEach(([service, status]) => {
            const serviceElement = document.querySelector(`[data-service="${service}"]`);
            if (serviceElement) {
                let statusIndicator = serviceElement.querySelector('.service-status');
                if (!statusIndicator) {
                    statusIndicator = document.createElement('div');
                    statusIndicator.className = 'service-status';
                    serviceElement.appendChild(statusIndicator);
                }

                const statusInfo = this.getServiceStatusDisplay(status.status);
                statusIndicator.innerHTML = statusInfo.text;
                statusIndicator.className = `service-status ${status.status}`;
                statusIndicator.style.color = statusInfo.color;
            }
        });
    }

    getAreaIndex(areaName) {
        const areaMap = { 'ventas': 1, 'sesiones': 2, 'inventarios': 3, 'servidores': 4 };
        return areaMap[areaName] || 1;
    }

    getStatusDisplay(status, latency) {
        switch (status) {
            case 'online':
                return { 
                    text: `🟢 Online${latency ? ` (${latency}ms)` : ''}`, 
                    color: '#28a745' 
                };
            case 'offline':
                return { 
                    text: '🔴 Offline', 
                    color: '#dc3545' 
                };
            case 'server_offline':
                return { 
                    text: '⚠️ Sin servidor', 
                    color: '#ffc107' 
                };
            case 'error':
                return { 
                    text: '❌ Error', 
                    color: '#dc3545' 
                };
            default:
                return { 
                    text: '🟡 Verificando...', 
                    color: '#ffc107' 
                };
        }
    }

    getServiceStatusDisplay(status) {
        switch (status) {
            case 'active':
                return { text: '✅ Activo', color: '#28a745' };
            case 'inactive':
                return { text: '❌ Inactivo', color: '#dc3545' };
            case 'server_offline':
                return { text: '⚠️ Sin servidor', color: '#ffc107' };
            case 'error':
                return { text: '❌ Error', color: '#dc3545' };
            default:
                return { text: '🔄 Verificando...', color: '#ffc107' };
        }
    }

    showNetworkStatus(networkStatus) {
        const onlineAreas = Object.values(networkStatus.areas).filter(area => area.status === 'online').length;
        const totalAreas = Object.keys(networkStatus.areas).length;
        
        if (!networkStatus.serverOnline) {
            this.showNotification('⚠️ Servidor no disponible - Modo Offline', 'warning', 8000);
        } else if (onlineAreas === totalAreas) {
            this.showNotification(`✅ Todas las áreas conectadas (${onlineAreas}/${totalAreas})`, 'success', 3000);
        } else if (onlineAreas > 0) {
            this.showNotification(`⚠️ Conectividad parcial (${onlineAreas}/${totalAreas} áreas)`, 'warning', 5000);
        } else {
            this.showNotification('❌ Sin conectividad con las áreas', 'error', 5000);
        }
    }

    // Configurar actualizaciones en tiempo real (simplificado)
    setupRealTimeUpdates() {
        // Por ahora usar polling, más adelante se puede agregar WebSocket
        console.log('📡 Sistema de actualizaciones en tiempo real activo');
    }

    // Health check continuo
    startHealthCheck() {
        // Health check inicial
        setTimeout(() => {
            this.performHealthCheck();
        }, 5000);

        // Health check cada 2 minutos
        setInterval(async () => {
            await this.performHealthCheck();
        }, 120000);
    }

    // Realizar health check completo
    async performHealthCheck() {
        const issues = [];
        const criticalIssues = [];
        
        if (!this.lastHealthCheck) return { issues, criticalIssues };

        // Verificar conectividad con cada área
        Object.entries(this.lastHealthCheck.areas).forEach(([areaName, status]) => {
            if (status.status === 'offline') {
                issues.push(`Área ${areaName} sin conectividad (${status.router})`);
            } else if (status.status === 'error') {
                criticalIssues.push(`Error crítico en área ${areaName}`);
            }
        });

        // Verificar servicios críticos
        Object.entries(this.lastHealthCheck.services).forEach(([serviceName, status]) => {
            if (status.status !== 'active') {
                if (serviceName === 'http') {
                    criticalIssues.push(`Servicio web principal no disponible`);
                } else {
                    issues.push(`Servicio ${serviceName} no disponible`);
                }
            }
        });

        // Mostrar alertas si hay problemas
        criticalIssues.forEach(issue => {
            this.showCriticalAlert(issue);
            this.sendSyslogMessage(16, 2, `CRITICAL: ${issue}`, 'servidores');
        });

        return { issues, criticalIssues };
    }

    // Mostrar notificación
    showNotification(message, type = 'info', duration = 5000) {
        const notification = document.createElement('div');
        notification.className = `network-notification ${type}`;
        notification.textContent = message;
        
        const colors = {
            'success': '#28a745',
            'error': '#dc3545',
            'warning': '#ffc107',
            'info': '#17a2b8'
        };
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${colors[type] || colors.info};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            max-width: 350px;
            font-weight: 500;
            animation: slideInRight 0.3s ease;
        `;
        
        // Agregar estilos de animación si no existen
        if (!document.querySelector('#network-animations')) {
            const style = document.createElement('style');
            style.id = 'network-animations';
            style.textContent = `
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentElement) {
                notification.style.opacity = '0';
                notification.style.transform = 'translateX(100%)';
                notification.style.transition = 'all 0.3s ease';
                setTimeout(() => notification.remove(), 300);
            }
        }, duration);
    }

    // Mostrar alerta crítica
    showCriticalAlert(message) {
        this.showNotification(`🚨 CRÍTICO: ${message}`, 'error', 10000);
    }

    // Fallback para modo offline
    logToLocalStorage(type, message, area) {
        const logs = JSON.parse(localStorage.getItem('offlineLogs') || '[]');
        logs.unshift({
            timestamp: new Date().toISOString(),
            type: type,
            message: message,
            area: area
        });
        
        if (logs.length > 50) {
            logs.splice(50);
        }
        
        localStorage.setItem('offlineLogs', JSON.stringify(logs));
        console.log(`💾 Log offline: [${type}] ${message}`);
    }

    // Métodos públicos para usar en la aplicación
    async logActivity(service, message, area = 'unknown') {
        return await this.sendSyslogMessage(16, 6, `${service}: ${message}`, area);
    }

    async uploadFile(fileName, fileData, destination) {
        return await this.ftpOperation('upload', {
            fileName: fileName,
            fileData: fileData,
            destination: destination
        });
    }

    async downloadFile(fileName, source) {
        return await this.ftpOperation('download', {
            fileName: fileName,
            source: source
        });
    }

    getNetworkConfig() {
        return this.networkConfig;
    }

    getConnectionStatus() {
        return {
            isOnline: this.isOnline,
            lastCheck: this.lastHealthCheck,
            serverConfig: this.networkConfig.services
        };
    }
}

// Inicializar integración con red real cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
    // Esperar un poco para que otros scripts se inicialicen
    setTimeout(() => {
        window.realNetwork = new RealNetworkIntegration();
        console.log('🌐 Integración con red real inicializada');
        
        // Hacer disponible globalmente para debugging
        window.networkUtils = {
            checkStatus: () => window.realNetwork.getConnectionStatus(),
            pingArea: (area) => window.realNetwork.pingArea(area, window.realNetwork.networkConfig.areas[area]),
            sendLog: (message, area) => window.realNetwork.logActivity('MANUAL', message, area),
            getConfig: () => window.realNetwork.getNetworkConfig()
        };
    }, 1000);
});