// Centro Luna - JavaScript Principal
// Equipo 3: Carmona Viana Israel • Cortes Buendia Martin

class CentroLunaSystem {
    constructor() {
        this.areas = {
            ventas: { ip: '172.19.0.0/22', name: 'Ventas', status: 'online' },
            sesiones: { ip: '172.19.4.0/24', name: 'Sesiones', status: 'online' },
            inventarios: { ip: '172.19.5.0/25', name: 'Inventarios', status: 'online' },
            servidores: { ip: '172.19.5.144/29', name: 'Servidores', status: 'online' }
        };
        
        this.servicios = {
            http: { puerto: 80, status: 'activo', descripcion: 'Servidor Web Principal' },
            syslog: { puerto: 514, status: 'activo', descripcion: 'Sistema de Logs' },
            ftp: { puerto: 21, status: 'activo', descripcion: 'Transferencia de Archivos' }
        };
        
        this.init();
    }

    init() {
        this.updateAreaStatus();
        this.updateServiceStatus();
        this.setupEventListeners();
        this.simulateNetworkActivity();
    }

    updateAreaStatus() {
        const areaCards = document.querySelectorAll('.area-card');
        areaCards.forEach((card, index) => {
            const statusIndicator = document.createElement('div');
            statusIndicator.className = 'status-indicator online';
            statusIndicator.innerHTML = '🟢 Online';
            card.appendChild(statusIndicator);
        });
    }

    updateServiceStatus() {
        const serviceCards = document.querySelectorAll('.servicio-red-card');
        serviceCards.forEach(card => {
            const h3 = card.querySelector('h3');
            const serviceName = h3.textContent.toLowerCase();
            
            if (serviceName.includes('syslog') || serviceName.includes('ftp') || serviceName.includes('http')) {
                const statusIndicator = document.createElement('div');
                statusIndicator.className = 'service-status active';
                statusIndicator.innerHTML = '✅ Activo';
                card.appendChild(statusIndicator);
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

    simulateNetworkActivity() {
        // Simular actividad de red cada 5 segundos
        setInterval(() => {
            this.generateNetworkLog();
        }, 5000);
    }

    generateNetworkLog() {
        const activities = [
            'Venta registrada en Área 1 - Ventas',
            'Sesión de tarot iniciada en Área 2 - Sesiones', 
            'Inventario actualizado en Área 3 - Inventarios',
            'Backup automático en Área 4 - Servidores',
            'Cliente conectado via QR desde móvil',
            'Transferencia FTP completada: reportes_ventas.txt',
            'Log SYSLOG generado: actividad_sesiones.log'
        ];

        const randomActivity = activities[Math.floor(Math.random() * activities.length)];
        this.logActivity('SISTEMA', randomActivity);
    }

    logActivity(service, message) {
        const timestamp = new Date().toISOString();
        const logEntry = {
            timestamp: timestamp,
            service: service,
            message: message,
            area: this.getCurrentArea()
        };

        // Almacenar en localStorage para simular logs
        let logs = JSON.parse(localStorage.getItem('centroLunaLogs') || '[]');
        logs.unshift(logEntry); // Agregar al inicio
        
        // Mantener solo los últimos 100 logs
        if (logs.length > 100) {
            logs = logs.slice(0, 100);
        }
        
        localStorage.setItem('centroLunaLogs', JSON.stringify(logs));
        
        console.log(`[${service}] ${message}`);
    }

    getCurrentArea() {
        // Simular área actual basada en la hora
        const hour = new Date().getHours();
        if (hour >= 9 && hour < 12) return 'Ventas';
        if (hour >= 12 && hour < 18) return 'Sesiones';
        if (hour >= 18 && hour < 21) return 'Inventarios';
        return 'Servidores';
    }

    // Métodos para los QR codes
    initQRCodes() {
        const qrData = [
            {
                id: 'qr1',
                title: '🃏 Mesa Tarot 1',
                url: 'http://172.19.5.148/reserva/tarot-mesa1',
                area: 'Área 4 - Servidores'
            },
            {
                id: 'qr2',
                title: '🔮 Mesa Videncia 1',
                url: 'http://172.19.5.144/reserva/videncia-mesa2',
                area: 'Área 4 - Servidores'
            },
            {
                id: 'qr3',
                title: '✨ Mesa Terapia 1',
                url: 'http://172.19.5.148/reserva/terapia-mesa3',
                area: 'Área 4 - Servidores'
            },
            {
                id: 'qr4',
                title: '👑 Sala VIP',
                url: 'http://172.19.5.144/reserva/vip-sala',
                area: 'Área 4 - Servidores'
            }
        ];

        return qrData;
    }
}

// Inicializar el sistema cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
    window.centroLuna = new CentroLunaSystem();
    
    // Mensaje de bienvenida en consola
    console.log(`
    🌙 Centro Luna - Sistema Iniciado
    ================================
    Equipo 3: Carmona Viana Israel • Cortes Buendia Martin
    
    Servicios Activos:
    - HTTP (Puerto 80): Servidor Web ✅
    - SYSLOG (Puerto 514): Sistema de Logs ✅  
    - FTP (Puerto 21): Transferencia de Archivos ✅
    
    Áreas de Red:
    - Área 1 - Ventas: 172.19.0.0/22
    - Área 2 - Sesiones: 172.19.4.0/24
    - Área 3 - Inventarios: 172.19.5.0/25
    - Área 4 - Servidores: 172.19.5.144/29
    `);
});

// Funciones globales útiles
window.centroLunaUtils = {
    // Formatear timestamp para mostrar
    formatTimestamp: (timestamp) => {
        return new Date(timestamp).toLocaleString('es-ES');
    },
    
    // Obtener logs del sistema
    getLogs: () => {
        return JSON.parse(localStorage.getItem('centroLunaLogs') || '[]');
    },
    
    // Limpiar logs
    clearLogs: () => {
        localStorage.removeItem('centroLunaLogs');
        console.log('Logs del sistema limpiados');
    },
    
    // Simular conexión de área
    connectArea: (areaName) => {
        console.log(`🔗 Conectando a ${areaName}...`);
        window.centroLuna.logActivity('CONEXION', `Conectado a ${areaName}`);
    }
};