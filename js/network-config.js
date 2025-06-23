/**
 * ========================================
 * CENTRO MÍSTICO LUNA LLENA - NETWORK CONFIG
 * Configuración Dinámica de Red
 * ========================================
 */

// Detectar desde dónde se está accediendo
const getNetworkConfig = () => {
    const hostname = window.location.hostname;
    const port = window.location.port;
    
    // Si se accede desde una IP de la topología
    if (hostname.startsWith('172.19.5.')) {
        return {
            HTTP_SERVER: hostname,
            SMTP_SERVER: hostname,
            TFTP_SERVER: hostname.replace('146', '149'), // Si es .146, cambiar a .149
            SYSLOG_SERVER: hostname.replace('146', '149'),
            isTopologyAccess: true
        };
    }
    
    // Si se accede desde red local (laptop/VM)
    return {
        HTTP_SERVER: '172.19.5.146',
        SMTP_SERVER: '172.19.5.146', 
        TFTP_SERVER: '172.19.5.149',
        SYSLOG_SERVER: '172.19.5.149',
        isTopologyAccess: false
    };
};

// Configuración global
window.NETWORK_CONFIG = getNetworkConfig();