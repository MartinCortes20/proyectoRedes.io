// Centro Luna - Configuración LOCAL para pruebas
// Crea este archivo como "network-integration-local.js"

class LocalTestIntegration {
    constructor() {
        // Configuración LOCAL para pruebas
        this.networkConfig = {
            areas: {
                ventas: {
                    router: 'localhost',  // Simular con localhost
                    network: '172.19.0.0/22',
                    vpcs: ['localhost', '127.0.0.1']
                },
                sesiones: {
                    router: 'localhost',
                    network: '172.19.4.0/24',
                    vlans: {
                        tarot: { network: '172.19.4.0/24', vpcs: ['localhost'] },
                        astro: { network: '172.19.6.0/24', vpcs: ['localhost'] },
                        numero: { network: '172.19.7.0/24', vpcs: ['localhost'] }
                    }
                },
                inventarios: {
                    router: 'localhost',
                    network: '172.19.5.0/25',
                    vpcs: ['localhost']
                },
                servidores: {
                    router: 'localhost',
                    network: '172.19.5.144/29',
                    vms: {
                        vm1: 'localhost',
                        vm2: 'localhost',
                        webServer: 'localhost',
                        syslogServer: 'localhost'
                    }
                }
            },
            services: {
                http: { port: 8080, server: 'localhost' },
                syslog: { port: 514, server: 'localhost' },
                ftp: { port: 21, server: 'localhost' }
            }
        };
        
        this.isOnline = false;
        this.testMode = true;
        this.init();
    }

    init() {
        console.log('🧪 Modo de prueba LOCAL activado');
        this.setupLocalTesting();
        this.startTestMonitoring();
    }

    setupLocalTesting() {
        // Simular que todo está online para pruebas
        setTimeout(() => {
            this.simulateConnection();
        }, 2000);
    }

    simulateConnection() {
        this.isOnline = true;
        console.log('✅ Simulando conexión exitosa a servidores locales');
        
        // Simular estado de áreas
        const mockNetworkStatus = {
            timestamp: new Date().toISOString(),
            serverOnline: true,
            areas: {
                ventas: { status: 'online', latency: Math.floor(Math.random() * 50) + 10, router: 'localhost' },
                sesiones: { status: 'online', latency: Math.floor(Math.random() * 50) + 10, router: 'localhost' },
                inventarios: { status: 'online', latency: Math.floor(Math.random() * 50) + 10, router: 'localhost' },
                servidores: { status: 'online', latency: Math.floor(Math.random() * 50) + 10, router: 'localhost' }
            },
            services: {
                http: { status: 'active', server: 'localhost', port: 8080 },
                syslog: { status: 'active', server: 'localhost', port: 514 },
                ftp: { status: 'active', server: 'localhost', port: 21 }
            }
        };

        this.updateNetworkStatusUI(mockNetworkStatus);
        this.showNotification('🧪 Modo de prueba: Todas las áreas simuladas como online', 'success', 5000);
    }

    async checkRealServers() {
        // Intentar conectar a servidores reales si están disponibles
        try {
            const response = await fetch('http://localhost:8080/health', { timeout: 3000 });
            if (response.ok) {
                console.log('✅ Servidor web local detectado');
                this.showNotification('Servidor web local detectado en puerto 8080', 'success');
                return true;
            }
        } catch (error) {
            console.log('ℹ️ No hay servidor web local - usando simulación');
        }

        try {
            const response = await fetch('http://localhost:514/health', { timeout: 3000 });
            if (response.ok) {
                console.log('✅ Servidor SYSLOG local detectado');
                this.showNotification('Servidor SYSLOG local detectado en puerto 514', 'success');
                return true;
            }
        } catch (error) {
            console.log('ℹ️ No hay servidor SYSLOG local - usando simulación');
        }

        return false;
    }

    startTestMonitoring() {
        // Verificar servidores reales cada 30 segundos
        setInterval(async () => {
            const realServers = await this.checkRealServers();
            if (!realServers) {
                // Mantener simulación si no hay servidores reales
                this.simulateRandomActivity();
            }
        }, 30000);

        // Actividad simulada cada 10 segundos
        setInterval(() => {
            this.simulateRandomActivity();
        }, 10000);
    }

    simulateRandomActivity() {
        const activities = [
            { area: 'ventas', message: '🛒 Venta simulada procesada', service: 'SISTEMA' },
            { area: 'sesiones', message: '🔮 Sesión de tarot simulada iniciada', service: 'SISTEMA' },
            { area: 'inventarios', message: '📦 Inventario simulado actualizado', service: 'SISTEMA' },
            { area: 'servidores', message: '💾 Backup simulado completado', service: 'SISTEMA' },
            { area: 'sesiones', message: '📱 Cliente simulado conectado via QR', service: 'HTTP' },
            { area: 'ventas', message: '📊 Reporte de ventas simulado generado', service: 'FTP' }
        ];

        const randomActivity = activities[Math.floor(Math.random() * activities.length)];
        this.logToLocalStorage(randomActivity.service, randomActivity.message, randomActivity.area);
        
        console.log(`🎲 Actividad simulada: [${randomActivity.service}] ${randomActivity.message}`);

        // Simular cambios ocasionales de estado
        if (Math.random() < 0.1) { // 10% de probabilidad
            this.simulateStatusChange();
        }
    }

    simulateStatusChange() {
        const areas = ['ventas', 'sesiones', 'inventarios', 'servidores'];
        const randomArea = areas[Math.floor(Math.random() * areas.length)];
        const isOnline = Math.random() > 0.3; // 70% probabilidad de estar online
        
        const statusInfo = isOnline ? 
            { text: `🟢 ${randomArea} reconectado`, color: '#28a745' } :
            { text: `🔴 ${randomArea} desconectado`, color: '#dc3545' };

        // Actualizar UI
        const areaElement = this.findAreaElement(randomArea);
        if (areaElement) {
            let statusIndicator = areaElement.querySelector('.area-status-indicator') || 
                                areaElement.querySelector('.status-indicator');
            
            if (statusIndicator) {
                statusIndicator.innerHTML = statusInfo.text;
                statusIndicator.style.color = statusInfo.color;
            }
        }

        this.logToLocalStorage('NETWORK', `Estado simulado: ${randomArea} - ${isOnline ? 'Online' : 'Offline'}`, randomArea);
        console.log(`🔄 Cambio de estado simulado: ${statusInfo.text}`);
    }

    findAreaElement(areaName) {
        // Buscar elemento del área en la página
        const areaIndex = { 'ventas': 1, 'sesiones': 2, 'inventarios': 3, 'servidores': 4 };
        return document.querySelector(`[data-area="${areaName}"]`) || 
               document.querySelector(`.area-card:nth-child(${areaIndex[areaName]})`);
    }

    updateNetworkStatusUI(networkStatus) {
        // Actualizar indicadores de áreas
        Object.entries(networkStatus.areas).forEach(([area, status]) => {
            const areaElement = this.findAreaElement(area);
            
            if (areaElement) {
                let statusIndicator = areaElement.querySelector('.area-status-indicator') || 
                                    areaElement.querySelector('.status-indicator');
                
                if (!statusIndicator) {
                    statusIndicator = document.createElement('div');
                    statusIndicator.className = 'area-status-indicator';
                    areaElement.appendChild(statusIndicator);
                }

                const statusText = status.status === 'online' ? 
                    `🟢 Online (${status.latency}ms)` : '🔴 Offline';
                
                statusIndicator.innerHTML = statusText;
                statusIndicator.style.color = status.status === 'online' ? '#28a745' : '#dc3545';
            }
        });

        // Actualizar indicadores de servicios
        Object.entries(networkStatus.services).forEach(([service, status]) => {
            const serviceCards = document.querySelectorAll('.servicio-red-card');
            serviceCards.forEach(card => {
                const h3 = card.querySelector('h3');
                const serviceName = h3.textContent.toLowerCase();
                
                if ((service === 'syslog' && serviceName.includes('syslog')) ||
                    (service === 'ftp' && serviceName.includes('ftp')) ||
                    (service === 'http' && serviceName.includes('http'))) {
                    
                    let statusIndicator = card.querySelector('.service-status');
                    if (!statusIndicator) {
                        statusIndicator = document.createElement('div');
                        statusIndicator.className = 'service-status';
                        card.appendChild(statusIndicator);
                    }
                    
                    statusIndicator.innerHTML = '✅ Activo (Simulado)';
                    statusIndicator.style.color = '#28a745';
                }
            });
        });
    }

    logToLocalStorage(service, message, area) {
        const timestamp = new Date().toISOString();
        const logEntry = {
            timestamp: timestamp,
            service: service,
            message: message,
            area: area
        };

        let logs = JSON.parse(localStorage.getItem('centroLunaLogs') || '[]');
        logs.unshift(logEntry);
        
        if (logs.length > 100) {
            logs = logs.slice(0, 100);
        }
        
        localStorage.setItem('centroLunaLogs', JSON.stringify(logs));
    }

    showNotification(message, type = 'info', duration = 5000) {
        const notification = document.createElement('div');
        notification.className = `test-notification ${type}`;
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
        `;

        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, duration);
    }

    // API pública para pruebas
    getTestStatus() {
        return {
            testMode: this.testMode,
            isOnline: this.isOnline,
            config: this.networkConfig
        };
    }

    manualTest(areaName) {
        console.log(`🧪 Prueba manual de área: ${areaName}`);
        this.logToLocalStorage('TEST', `Prueba manual ejecutada en área ${areaName}`, areaName);
        this.showNotification(`Prueba ejecutada en área ${areaName}`, 'info');
    }
}

// Funciones globales para pruebas
window.testUtils = {
    runTest: (area) => {
        if (window.localTest) {
            window.localTest.manualTest(area);
        }
    },
    
    getStatus: () => {
        return window.localTest ? window.localTest.getTestStatus() : null;
    },
    
    simulateFailure: (area) => {
        console.log(`🔴 Simulando falla en área: ${area}`);
        if (window.localTest) {
            window.localTest.logToLocalStorage('ERROR', `Falla simulada en área ${area}`, area);
        }
    },
    
    generateTestLogs: () => {
        const areas = ['ventas', 'sesiones', 'inventarios', 'servidores'];
        areas.forEach(area => {
            window.testUtils.runTest(area);
        });
        console.log('✅ Logs de prueba generados para todas las áreas');
    }
};

// Inicializar pruebas locales
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        window.localTest = new LocalTestIntegration();
        console.log(`
        🧪 MODO DE PRUEBA LOCAL ACTIVADO
        ================================
        
        Comandos de prueba disponibles en consola:
        
        testUtils.getStatus()           - Ver estado del sistema
        testUtils.runTest('ventas')     - Probar área específica
        testUtils.generateTestLogs()    - Generar logs de prueba
        testUtils.simulateFailure('sesiones') - Simular falla
        
        ✅ Todas las áreas simuladas como online
        🔄 Actividad automática cada 10 segundos
        `);
    }, 1000);
});