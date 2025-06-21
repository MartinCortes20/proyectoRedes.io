/**
 * ========================================
 * CENTRO MÍSTICO LUNA LLENA - MAIN JS
 * Sistema de Gestión Principal
 * ========================================
 */

// ========================================
// CONFIGURACIÓN GLOBAL
// ========================================

const CONFIG = {
    servers: {
        http: '172.19.5.146:80',
        smtp: '172.19.5.146:25',
        tftp: '172.19.5.149:69',
        syslog: '172.19.5.149:514'
    },
    updateInterval: 30000, // 30 segundos
    animationDuration: 300
};

// ========================================
// GESTIÓN DE TABS
// ========================================

function showTab(tabName) {
    // Ocultar todos los contenidos
    const contents = document.querySelectorAll('.tab-content');
    contents.forEach(content => {
        content.classList.remove('active');
    });
    
    // Quitar clase active de todos los botones
    const buttons = document.querySelectorAll('.tab-button');
    buttons.forEach(button => {
        button.classList.remove('active');
    });
    
    // Mostrar el contenido seleccionado
    const targetTab = document.getElementById(tabName);
    if (targetTab) {
        targetTab.classList.add('active');
    }
    
    // Activar el botón correspondiente
    if (event && event.target) {
        event.target.classList.add('active');
    }
    
    // Ejecutar funciones específicas del tab
    switch(tabName) {
        case 'dashboard':
            initDashboard();
            break;
        case 'qr-codes':
            initQRCodes();
            break;
        case 'inventario':
            initInventario();
            break;
        case 'mail-server':
            initMailServer();
            break;
        case 'file-server':
            initFileServer();
            break;
        case 'syslog':
            initSysLog();
            break;
    }
}

// ========================================
// GENERACIÓN DE QR CODES
// ========================================

function generateQR(elementId, url) {
    const qrElement = document.getElementById(elementId);
    if (qrElement) {
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(url)}`;
        qrElement.style.backgroundImage = `url(${qrUrl})`;
        qrElement.innerHTML = '';
    }
}

function initQRCodes() {
    const qrContainer = document.getElementById('qr-container');
    if (!qrContainer) return;
    
    const qrData = [
        {
            id: 'qr1',
            title: '🃏 Mesa Tarot 1',
            url: 'http://172.19.5.146/reserva/tarot-mesa1'
        },
        {
            id: 'qr2',
            title: '🔮 Mesa Videncia 1',
            url: 'http://172.19.5.146/reserva/videncia-mesa2'
        },
        {
            id: 'qr3',
            title: '✨ Mesa Terapia 1',
            url: 'http://172.19.5.146/reserva/terapia-mesa3'
        },
        {
            id: 'qr4',
            title: '👑 Sala VIP',
            url: 'http://172.19.5.146/reserva/vip-sala'
        }
    ];
    
    qrContainer.innerHTML = qrData.map(qr => `
        <div class="qr-card">
            <div class="qr-placeholder qr-real" id="${qr.id}"></div>
            <h4>${qr.title}</h4>
            <p>${qr.url}</p>
            <button class="btn" onclick="generateQR('${qr.id}', '${qr.url}')" 
                    style="margin-top: 10px; padding: 5px 10px; font-size: 12px;">
                Generar QR
            </button>
        </div>
    `).join('');
    
    // Generar QRs automáticamente
    qrData.forEach(qr => {
        generateQR(qr.id, qr.url);
    });
}

// ========================================
// GESTIÓN DE INVENTARIO
// ========================================

function initInventario() {
    const inventarioContainer = document.getElementById('inventario-container');
    if (!inventarioContainer) return;
    
    const inventarioData = {
        cristales: {
            title: '💎 Cristales y Gemas',
            items: [
                { name: 'Cuarzo Rosa', cantidad: 5, status: 'warning', icon: '⚠️' },
                { name: 'Amatista', cantidad: 23, status: 'success', icon: '✅' },
                { name: 'Cuarzo Blanco', cantidad: 18, status: 'success', icon: '✅' },
                { name: 'Obsidiana', cantidad: 12, status: 'normal', icon: '⚡' }
            ]
        },
        veladoras: {
            title: '🕯️ Veladoras e Inciensos',
            items: [
                { name: 'Veladora 7 Días', cantidad: 45, status: 'success', icon: '✅' },
                { name: 'Incienso Sándalo', cantidad: 8, status: 'warning', icon: '⚠️' },
                { name: 'Veladora Roja', cantidad: 32, status: 'success', icon: '✅' },
                { name: 'Sahumerios', cantidad: 15, status: 'normal', icon: '⚡' }
            ]
        },
        libros: {
            title: '📚 Libros y Material',
            items: [
                { name: 'Tarot Rider Waite', cantidad: 12, status: 'success', icon: '✅' },
                { name: 'Libro de Numerología', cantidad: 7, status: 'normal', icon: '⚡' },
                { name: 'Manual de Cristales', cantidad: 15, status: 'success', icon: '✅' },
                { name: 'Cartas de Angeles', cantidad: 3, status: 'warning', icon: '⚠️' }
            ]
        }
    };
    
    const getStatusColor = (status) => {
        switch(status) {
            case 'success': return '#51cf66';
            case 'warning': return '#ff6b6b';
            case 'normal': return '#ffd700';
            default: return '#ccc';
        }
    };
    
    inventarioContainer.innerHTML = Object.values(inventarioData).map(categoria => `
        <div class="card">
            <h3>${categoria.title}</h3>
            ${categoria.items.map(item => `
                <div class="metric">
                    <span>${item.name}</span>
                    <span style="color: ${getStatusColor(item.status)};">
                        <strong>${item.cantidad} ${item.cantidad > 1 ? 'disponibles' : 'restante'} ${item.icon}</strong>
                    </span>
                </div>
            `).join('')}
        </div>
    `).join('');
}

// ========================================
// UTILIDADES GENERALES
// ========================================

function formatDateTime(date = new Date()) {
    return date.toLocaleString('es-MX', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
}

function showNotification(message, type = 'info') {
    // Crear notificación temporal
    const notification = document.createElement('div');
    notification.className = `alert ${type === 'success' ? 'success' : ''}`;
    notification.innerHTML = message;
    notification.style.position = 'fixed';
    notification.style.top = '20px';
    notification.style.right = '20px';
    notification.style.zIndex = '9999';
    notification.style.maxWidth = '300px';
    
    document.body.appendChild(notification);
    
    // Remover después de 3 segundos
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 3000);
}

function updateCounter(elementId, newValue) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = newValue;
    }
}

// ========================================
// SIMULACIÓN DE DATOS EN TIEMPO REAL
// ========================================

function simulateRealTimeData() {
    // Simular actualización de métricas
    const metricas = {
        'emails-enviados': () => Math.floor(Math.random() * 10) + 45,
        'cola-envio': () => Math.floor(Math.random() * 5),
        'transferencias-hoy': () => Math.floor(Math.random() * 5) + 20,
        'eventos-hoy': () => Math.floor(Math.random() * 100) + 1200,
        'errores-criticos': () => Math.floor(Math.random() * 2)
    };
    
    Object.entries(metricas).forEach(([id, generator]) => {
        updateCounter(id, generator());
    });
}

// ========================================
// CONFIGURACIÓN DE FECHA MÍNIMA
// ========================================

function setMinDate() {
    const fechaInput = document.getElementById('fecha');
    if (fechaInput) {
        fechaInput.min = new Date().toISOString().split('T')[0];
    }
}

// ========================================
// INICIALIZACIÓN PRINCIPAL
// ========================================

function initApp() {
    console.log('🌙 Iniciando Centro Místico Luna Llena...');
    
    // Configurar fecha mínima
    setMinDate();
    
    // Inicializar tab activo
    initDashboard();
    
    // Inicializar datos en tiempo real
    simulateRealTimeData();
    
    // Configurar actualizaciones automáticas
    setInterval(() => {
        simulateRealTimeData();
    }, CONFIG.updateInterval);
    
    console.log('✅ Aplicación inicializada correctamente');
}

// ========================================
// EVENT LISTENERS
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    initApp();
});

window.addEventListener('load', function() {
    // Generar QRs iniciales
    setTimeout(() => {
        generateQR('qr1', 'http://172.19.5.146/reserva/tarot-mesa1');
        generateQR('qr2', 'http://172.19.5.146/reserva/videncia-mesa2');
        generateQR('qr3', 'http://172.19.5.146/reserva/terapia-mesa3');
        generateQR('qr4', 'http://172.19.5.146/reserva/vip-sala');
    }, 1000);
    
    // Inicializar gráficos
    if (typeof initCharts === 'function') {
        initCharts();
    }
});

// ========================================
// EXPORT PARA OTROS MÓDULOS
// ========================================

window.CentroMistico = {
    showTab,
    generateQR,
    formatDateTime,
    showNotification,
    updateCounter,
    CONFIG
};