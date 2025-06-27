// Variables globales
let selectedService = '';
let bookingData = {};

// Configuración de redes por departamento
const networkConfig = {
    'TAROT': {
        vlan: 'VLAN 10',
        network: '172.19.4.0/24',
        gateway: '172.19.4.1',
        qrData: 'https://lunallena.local/connect?dept=tarot&vlan=10&net=172.19.4.0',
        wifiConfig: 'WIFI:T:WPA3;S:LunaLlena_Tarot;P:TarotSecure2025;H:false;;'
    },
    'ASTRO': {
        vlan: 'VLAN 20', 
        network: '172.19.6.0/24',
        gateway: '172.19.6.1',
        qrData: 'https://lunallena.local/connect?dept=astrologia&vlan=20&net=172.19.6.0',
        wifiConfig: 'WIFI:T:WPA3;S:LunaLlena_Astro;P:AstroSecure2025;H:false;;'
    },
    'NUMERO': {
        vlan: 'VLAN 30',
        network: '172.19.7.0/24', 
        gateway: '172.19.7.1',
        qrData: 'https://lunallena.local/connect?dept=numerologia&vlan=30&net=172.19.7.0',
        wifiConfig: 'WIFI:T:WPA3;S:LunaLlena_Numero;P:NumeroSecure2025;H:false;;'
    }
};

// Inicialización cuando carga la página
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Configurar fecha mínima (hoy)
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('date').setAttribute('min', today);
    
    // Generar QR codes para las redes
    generateNetworkQRCodes();
    
    // Configurar eventos
    setupEventListeners();
    
    // Animaciones de scroll
    setupScrollAnimations();
    
    // Navegación suave
    setupSmoothScroll();
    
    // Detectar si viene de un QR scan
    checkQRConnection();
}

function checkQRConnection() {
    // Verificar si hay parámetros en la URL que indiquen que viene de un QR
    const urlParams = new URLSearchParams(window.location.search);
    const dept = urlParams.get('dept');
    const vlan = urlParams.get('vlan');
    const net = urlParams.get('net');
    
    if (dept && vlan && net) {
        // Mostrar pantalla de carga de conexión
        showQRConnectionScreen(dept, vlan, net);
    }
}

function showQRConnectionScreen(department, vlan, network) {
    const modal = document.getElementById('qrConnectionModal');
    const messageElement = document.getElementById('qrConnectionMessage');
    const iconElement = document.getElementById('qrServiceIcon');
    const detailsElement = document.getElementById('qrConnectionDetails');
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    
    // Configurar mensaje según departamento
    let serviceName, icon;
    
    switch(department) {
        case 'tarot':
            serviceName = 'TAROT';
            icon = '🔮';
            break;
        case 'astrologia':
            serviceName = 'ASTROLOGÍA';
            icon = '⭐';
            break;
        case 'numerologia':
            serviceName = 'NUMEROLOGÍA';
            icon = '🔢';
            break;
        default:
            serviceName = 'SESIÓN MÍSTICA';
            icon = '✨';
    }
    
    messageElement.textContent = `Conectándote a tu sesión de ${serviceName}`;
    iconElement.textContent = icon;
    detailsElement.textContent = `Accediendo a ${vlan} - Red: ${network}`;
    
    // Mostrar modal
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    
    // Generar datos de conexión VPC
    const connectionData = generateVPCConnectionData(department, vlan, network);
    
    // Simular proceso de conexión con barra de progreso
    let progress = 0;
    const steps = [
        { progress: 15, text: 'Iniciando túnel VPC...', delay: 800, action: () => logToSyslog('VPC_TUNNEL_INIT', connectionData) },
        { progress: 30, text: 'Verificando credenciales...', delay: 1000, action: () => logToSyslog('AUTH_VERIFY', connectionData) },
        { progress: 50, text: 'Conectando a red privada...', delay: 1200, action: () => logToSyslog('NETWORK_CONNECT', connectionData) },
        { progress: 70, text: 'Configurando firewall...', delay: 800, action: () => logToSyslog('FIREWALL_CONFIG', connectionData) },
        { progress: 85, text: 'Asignando IP privada...', delay: 600, action: () => logToSyslog('IP_ASSIGN', connectionData) },
        { progress: 100, text: '¡Conexión VPC establecida!', delay: 1000, action: () => logToSyslog('VPC_CONNECTED', connectionData) }
    ];
    
    let currentStep = 0;
    
    function executeStep() {
        if (currentStep < steps.length) {
            const step = steps[currentStep];
            
            setTimeout(() => {
                progressFill.style.width = step.progress + '%';
                progressText.textContent = step.text;
                
                // Ejecutar acción de logging
                if (step.action) {
                    step.action();
                }
                
                if (step.progress === 100) {
                    setTimeout(() => {
                        // Log final de sesión iniciada
                        logToSyslog('SESSION_STARTED', {
                            ...connectionData,
                            sessionStartTime: new Date().toISOString()
                        });
                        
                        // Redirigir a la página principal después de la conexión exitosa
                        window.location.href = window.location.pathname;
                        showSuccessMessage(serviceName, connectionData);
                    }, 1500);
                } else {
                    currentStep++;
                    executeStep();
                }
            }, step.delay);
        }
    }
    
    // Iniciar logging de conexión
    logToSyslog('QR_SCANNED', connectionData);
    executeStep();
}

function generateVPCConnectionData(department, vlan, network) {
    const timestamp = new Date().toISOString();
    const sessionId = 'VPC-' + Date.now().toString(36).toUpperCase();
    const clientIP = generateClientIP(network);
    const gatewayIP = network.replace('0/24', '1');
    
    return {
        sessionId: sessionId,
        timestamp: timestamp,
        department: department,
        vlan: vlan,
        network: network,
        clientIP: clientIP,
        gatewayIP: gatewayIP,
        clientMAC: generateRandomMAC(),
        userAgent: navigator.userAgent,
        protocol: 'WPA3-VPC',
        encryptionLevel: 'AES-256',
        tunnelType: 'OpenVPN',
        serverLocation: 'ZonaRosa-DC1'
    };
}

function generateClientIP(network) {
    // Generar IP aleatoria dentro del rango de la red
    const baseIP = network.split('.').slice(0, 3).join('.');
    const randomHost = Math.floor(Math.random() * 200) + 10; // IPs .10 a .210
    return `${baseIP}.${randomHost}`;
}

function generateRandomMAC() {
    return "XX:XX:XX:XX:XX:XX".replace(/X/g, function() {
        return "0123456789ABCDEF".charAt(Math.floor(Math.random() * 16));
    });
}

function logToSyslog(eventType, data) {
    const logEntry = {
        timestamp: new Date().toISOString(),
        facility: 'LOCAL0',
        severity: 'INFO',
        hostname: 'luna-llena-vpn-gw',
        appName: 'vpn-controller',
        procId: Math.floor(Math.random() * 9999),
        msgId: eventType,
        message: generateLogMessage(eventType, data)
    };
    
    // Mostrar en consola del navegador (simulando Syslog)
    console.log(`[SYSLOG] ${logEntry.timestamp} ${logEntry.hostname} ${logEntry.appName}[${logEntry.procId}]: ${logEntry.message}`);
    
    // Almacenar en localStorage para simulación
    const logs = JSON.parse(localStorage.getItem('luna_llena_vpn_logs') || '[]');
    logs.push(logEntry);
    
    // Mantener solo los últimos 100 logs
    if (logs.length > 100) {
        logs.splice(0, logs.length - 100);
    }
    
    localStorage.setItem('luna_llena_vpn_logs', JSON.stringify(logs));
    
    // En un entorno real, aquí enviarías a tu servidor Syslog
    // sendToSyslogServer(logEntry);
}

function generateLogMessage(eventType, data) {
    switch(eventType) {
        case 'QR_SCANNED':
            return `QR code scanned for ${data.department.toUpperCase()} session - SessionID: ${data.sessionId}`;
        case 'VPC_TUNNEL_INIT':
            return `Initializing VPC tunnel for VLAN ${data.vlan} - SessionID: ${data.sessionId}`;
        case 'AUTH_VERIFY':
            return `Authentication verified for client MAC: ${data.clientMAC} - SessionID: ${data.sessionId}`;
        case 'NETWORK_CONNECT':
            return `Client connecting to network ${data.network} via ${data.tunnelType} - SessionID: ${data.sessionId}`;
        case 'FIREWALL_CONFIG':
            return `Firewall rules configured for ${data.department.toUpperCase()} department access - SessionID: ${data.sessionId}`;
        case 'IP_ASSIGN':
            return `IP address ${data.clientIP} assigned to client - Gateway: ${data.gatewayIP} - SessionID: ${data.sessionId}`;
        case 'VPC_CONNECTED':
            return `VPC connection established successfully - Client: ${data.clientIP} - SessionID: ${data.sessionId}`;
        case 'SESSION_STARTED':
            return `${data.department.toUpperCase()} session started - Client: ${data.clientIP} - Encryption: ${data.encryptionLevel} - SessionID: ${data.sessionId}`;
        default:
            return `VPC event: ${eventType} - SessionID: ${data.sessionId}`;
    }
}

// Función para enviar a servidor Syslog real (comentada para demo)
function sendToSyslogServer(logEntry) {
    /*
    // En un entorno real, enviarías los logs a tu servidor Syslog
    // Ejemplo usando fetch API:
    
    fetch('https://tu-servidor-syslog.com/api/logs', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer tu-token-aqui'
        },
        body: JSON.stringify(logEntry)
    })
    .then(response => response.json())
    .then(data => {
        console.log('Log enviado a Syslog server:', data);
    })
    .catch(error => {
        console.error('Error enviando a Syslog:', error);
    });
    */
}

// Función para conectar con GNS3 (simulación)
function connectToGNS3Network(connectionData) {
    /*
    // En un entorno real con GNS3, podrías:
    // 1. Conectar vía API de GNS3
    // 2. Activar interfaces específicas
    // 3. Configurar VLANs dinámicamente
    
    const gns3Config = {
        projectId: 'luna-llena-network',
        nodeId: connectionData.department + '-switch',
        vlan: connectionData.vlan,
        clientMAC: connectionData.clientMAC,
        assignedIP: connectionData.clientIP
    };
    
    fetch('http://localhost:3080/v2/projects/' + gns3Config.projectId + '/nodes/' + gns3Config.nodeId, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            vlan_config: gns3Config.vlan,
            client_mac: gns3Config.clientMAC,
            assigned_ip: gns3Config.assignedIP
        })
    });
    */
}

// Función para mostrar dashboard de conexiones (bonus)
function showConnectionDashboard() {
    const logs = JSON.parse(localStorage.getItem('luna_llena_vpn_logs') || '[]');
    const connections = logs.filter(log => log.msgId === 'SESSION_STARTED');
    
    console.log('=== DASHBOARD DE CONEXIONES ACTIVAS ===');
    console.log(`Total de sesiones iniciadas: ${connections.length}`);
    
    const departmentStats = {};
    connections.forEach(conn => {
        const dept = conn.message.split(' ')[0];
        departmentStats[dept] = (departmentStats[dept] || 0) + 1;
    });
    
    console.log('Estadísticas por departamento:');
    Object.entries(departmentStats).forEach(([dept, count]) => {
        console.log(`  ${dept}: ${count} conexiones`);
    });
    
    console.log('Últimas 5 conexiones:');
    connections.slice(-5).forEach(conn => {
        console.log(`  ${conn.timestamp} - ${conn.message}`);
    });
    console.log('======================================');
}

function showSuccessMessage(serviceName, connectionData) {
    const message = `¡Conectado exitosamente a ${serviceName}! Tu sesión está lista.\nIP asignada: ${connectionData.clientIP}`;
    showAlert(message, 'success');
    
    // Mostrar información de conexión en consola
    console.log('=== CONEXIÓN VPC ESTABLECIDA ===');
    console.log(`Servicio: ${serviceName}`);
    console.log(`IP Cliente: ${connectionData.clientIP}`);
    console.log(`Gateway: ${connectionData.gatewayIP}`);
    console.log(`Session ID: ${connectionData.sessionId}`);
    console.log(`Encriptación: ${connectionData.encryptionLevel}`);
    console.log('================================');
}

function setupEventListeners() {
    // Formulario de reserva
    const bookingForm = document.getElementById('bookingForm');
    if (bookingForm) {
        bookingForm.addEventListener('submit', handleBookingSubmit);
    }
    
    // Navegación móvil
    const hamburger = document.querySelector('.hamburger');
    if (hamburger) {
        hamburger.addEventListener('click', toggleMobileMenu);
    }
    
    // Cerrar modales con ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeModal();
            closeBookingModal();
            closeQRConnectionModal();
        }
    });
    
    // Cerrar modal al hacer clic fuera
    window.addEventListener('click', function(event) {
        const connectionModal = document.getElementById('connectionModal');
        const bookingModal = document.getElementById('bookingModal');
        const qrConnectionModal = document.getElementById('qrConnectionModal');
        
        if (event.target === connectionModal) {
            closeModal();
        }
        if (event.target === bookingModal) {
            closeBookingModal();
        }
        if (event.target === qrConnectionModal) {
            closeQRConnectionModal();
        }
    });
}

function generateNetworkQRCodes() {
    // Generar QR para cada departamento
    Object.keys(networkConfig).forEach(dept => {
        const qrElement = document.getElementById(`qr-${dept.toLowerCase()}`);
        if (qrElement) {
            generateQRCode(qrElement, networkConfig[dept].qrData);
        }
    });
}

function generateQRCode(container, data) {
    // Limpiar el contenedor
    container.innerHTML = '';
    
    try {
        // Método 1: Usar qrcode-generator si está disponible
        if (typeof qrcode !== 'undefined') {
            const qr = qrcode(0, 'M');
            qr.addData(data);
            qr.make();
            
            const qrImage = qr.createImgTag(4, 8);
            container.innerHTML = qrImage;
            
            const img = container.querySelector('img');
            if (img) {
                img.style.width = '100%';
                img.style.height = '100%';
                img.style.objectFit = 'contain';
                img.style.borderRadius = '8px';
            }
            return;
        }
    } catch (error) {
        console.log('qrcode-generator no disponible, usando método alternativo');
    }
    
    // Método 2: Usar API de QR online como fallback
    const qrSize = 160;
    const qrURL = `https://api.qrserver.com/v1/create-qr-code/?size=${qrSize}x${qrSize}&data=${encodeURIComponent(data)}&color=2c2c2c&bgcolor=ffffff`;
    
    const img = document.createElement('img');
    img.src = qrURL;
    img.alt = 'Código QR';
    img.style.width = '100%';
    img.style.height = '100%';
    img.style.objectFit = 'contain';
    img.style.borderRadius = '8px';
    img.style.display = 'block';
    
    // Agregar evento de error para mostrar un placeholder si falla
    img.onerror = function() {
        container.innerHTML = generateQRPlaceholder();
    };
    
    container.appendChild(img);
}

function generateQRPlaceholder() {
    return `
        <div style="
            width: 100%;
            height: 100%;
            background: linear-gradient(45deg, #f0f0f0 25%, transparent 25%, transparent 75%, #f0f0f0 75%, #f0f0f0),
                        linear-gradient(45deg, #f0f0f0 25%, transparent 25%, transparent 75%, #f0f0f0 75%, #f0f0f0);
            background-size: 20px 20px;
            background-position: 0 0, 10px 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: column;
            border-radius: 8px;
            border: 2px solid #ddd;
            color: #666;
            font-size: 0.8rem;
            text-align: center;
            padding: 1rem;
        ">
            <div style="font-size: 2rem; margin-bottom: 0.5rem;">📱</div>
            <div><strong>Código QR</strong></div>
            <div style="font-size: 0.7rem; opacity: 0.8;">Escanea para conectar</div>
        </div>
    `;
}

function selectService(service) {
    selectedService = service;
    const serviceSelect = document.getElementById('service');
    if (serviceSelect) {
        serviceSelect.value = service;
    }
    
    // Scroll a la sección de reserva
    const reserveSection = document.getElementById('reservar');
    if (reserveSection) {
        reserveSection.scrollIntoView({ behavior: 'smooth' });
    }
    
    // Highlight del servicio seleccionado
    document.querySelectorAll('.service-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    const selectedCard = document.querySelector(`[data-service="${service}"]`);
    if (selectedCard) {
        selectedCard.classList.add('selected');
    }
}

function handleBookingSubmit(e) {
    e.preventDefault();
    
    // Recopilar datos del formulario
    const formData = new FormData(e.target);
    bookingData = {
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        service: formData.get('service'),
        date: formData.get('date'),
        time: formData.get('time'),
        birthdate: formData.get('birthdate'),
        message: formData.get('message')
    };
    
    // Validar campos requeridos
    if (!bookingData.name || !bookingData.email || !bookingData.phone || 
        !bookingData.service || !bookingData.date || !bookingData.time) {
        showAlert('Por favor, completa todos los campos requeridos.', 'error');
        return;
    }
    
    // Validar fecha no sea en el pasado
    const selectedDate = new Date(bookingData.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
        showAlert('La fecha seleccionada no puede ser anterior a hoy.', 'error');
        return;
    }
    
    // Procesar reserva
    processBooking();
}

function processBooking() {
    // Simular procesamiento
    showLoadingState();
    
    setTimeout(() => {
        // Asignar red según servicio
        let assignedNetwork = '';
        switch(bookingData.service) {
            case 'tarot':
                assignedNetwork = 'TAROT';
                break;
            case 'astrologia':
                assignedNetwork = 'ASTRO'; 
                break;
            case 'numerologia':
                assignedNetwork = 'NUMERO';
                break;
        }
        
        // Generar ID único para la cita
        const appointmentId = generateAppointmentId();
        
        // Mostrar modal de confirmación
        showBookingConfirmation(assignedNetwork, appointmentId);
        
        // Limpiar formulario
        document.getElementById('bookingForm').reset();
        
    }, 2000);
}

function generateAppointmentId() {
    return 'LLA-' + Date.now().toString(36).toUpperCase();
}

function showBookingConfirmation(network, appointmentId) {
    const modal = document.getElementById('bookingModal');
    const qrElement = document.getElementById('booking-qr');
    const networkDetails = document.getElementById('network-details');
    const assignedNetworkElement = document.getElementById('assigned-network');
    const appointmentDetailsElement = document.getElementById('appointment-details');
    
    // Configurar información de red
    const config = networkConfig[network];
    assignedNetworkElement.textContent = `Red asignada: ${config.vlan}`;
    networkDetails.textContent = config.network;
    
    // Generar QR personalizado para la cita que incluya la URL de conexión
    let departmentParam = '';
    switch(bookingData.service) {
        case 'tarot':
            departmentParam = 'tarot';
            break;
        case 'astrologia':
            departmentParam = 'astrologia';
            break;
        case 'numerologia':
            departmentParam = 'numerologia';
            break;
    }
    
    const appointmentQRData = `${window.location.origin}${window.location.pathname}?dept=${departmentParam}&vlan=${config.vlan.split(' ')[1]}&net=${config.network}&id=${appointmentId}&name=${encodeURIComponent(bookingData.name)}`;
    
    if (qrElement) {
        generateQRCode(qrElement, appointmentQRData);
    }
    
    // Mostrar detalles de la cita
    appointmentDetailsElement.innerHTML = `
        <div class="detail-item">
            <strong>Servicio</strong>
            ${getServiceName(bookingData.service)}
        </div>
        <div class="detail-item">
            <strong>Fecha</strong>
            ${formatDate(bookingData.date)}
        </div>
        <div class="detail-item">
            <strong>Hora</strong>
            ${bookingData.time}
        </div>
        <div class="detail-item">
            <strong>ID de Cita</strong>
            ${appointmentId}
        </div>
        <div class="detail-item">
            <strong>Red</strong>
            ${config.vlan}
        </div>
        <div class="detail-item">
            <strong>Gateway</strong>
            ${config.gateway}
        </div>
    `;
    
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function getServiceName(service) {
    const serviceNames = {
        'tarot': '🔮 Lectura de Tarot',
        'astrologia': '⭐ Carta Astral', 
        'numerologia': '🔢 Numerología'
    };
    return serviceNames[service] || service;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function connectToNetwork(department) {
    const modal = document.getElementById('connectionModal');
    const welcomeMessage = document.getElementById('welcomeMessage');
    const sessionDetails = document.getElementById('sessionDetails');
    const connectionStatus = document.getElementById('connectionStatus');
    
    const config = networkConfig[department];
    
    // Configurar mensaje según departamento
    let message, details;
    
    switch(department) {
        case 'TAROT':
            message = '🔮 Bienvenido a tu sesión de TAROT';
            details = `Conectando a ${config.vlan} - Departamento Tarot`;
            break;
        case 'ASTRO':
            message = '⭐ Bienvenido a tu sesión de ASTROLOGÍA';
            details = `Conectando a ${config.vlan} - Departamento Astrología`;
            break;
        case 'NUMERO':
            message = '🔢 Bienvenido a tu sesión de NUMEROLOGÍA';
            details = `Conectando a ${config.vlan} - Departamento Numerología`;
            break;
    }
    
    welcomeMessage.textContent = message;
    sessionDetails.textContent = details;
    connectionStatus.textContent = 'Estableciendo conexión VPN...';
    
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    
    // Simular proceso de conexión
    setTimeout(() => {
        connectionStatus.textContent = 'Verificando credenciales...';
    }, 1000);
    
    setTimeout(() => {
        connectionStatus.textContent = 'Asignando dirección IP...';
    }, 2000);
    
    setTimeout(() => {
        connectionStatus.textContent = `Conectado a red: ${config.network}`;
    }, 3000);
    
    setTimeout(() => {
        connectionStatus.innerHTML = `
            <div style="color: #4CAF50;">
                ✅ Conexión establecida exitosamente<br>
                <strong>Red:</strong> ${config.network}<br>
                <strong>Gateway:</strong> ${config.gateway}<br>
                <strong>Encriptación:</strong> WPA3<br>
                <em style="opacity: 0.9;">Tu sesión es completamente privada y segura</em>
            </div>
        `;
    }, 4000);
}

function closeQRConnectionModal() {
    const modal = document.getElementById('qrConnectionModal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
    
    // Limpiar URL de parámetros QR
    const url = new URL(window.location);
    url.search = '';
    window.history.replaceState({}, document.title, url);
}

function closeModal() {
    const modal = document.getElementById('connectionModal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

function closeBookingModal() {
    const modal = document.getElementById('bookingModal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

function showLoadingState() {
    const submitBtn = document.querySelector('.submit-btn');
    if (submitBtn) {
        submitBtn.textContent = 'Procesando reserva...';
        submitBtn.disabled = true;
        
        setTimeout(() => {
            submitBtn.textContent = 'Confirmar Reserva';
            submitBtn.disabled = false;
        }, 3000);
    }
}

function showAlert(message, type = 'info') {
    // Crear elemento de alerta
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'error' ? '#ff4757' : '#2ed573'};
        color: white;
        padding: 1rem 2rem;
        border-radius: 10px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        z-index: 3000;
        animation: slideInRight 0.3s ease;
        max-width: 400px;
        font-weight: 500;
    `;
    
    alert.textContent = message;
    document.body.appendChild(alert);
    
    // Remover después de 5 segundos
    setTimeout(() => {
        alert.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            if (alert.parentNode) {
                alert.parentNode.removeChild(alert);
            }
        }, 300);
    }, 5000);
}

function setupScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    // Observar todas las secciones
    document.querySelectorAll('section').forEach(section => {
        observer.observe(section);
    });
    
    // Efecto parallax en hero
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const hero = document.querySelector('.hero');
        if (hero) {
            const rate = scrolled * -0.3;
            hero.style.transform = `translateY(${rate}px)`;
        }
        
        // Header background en scroll
        const header = document.querySelector('header');
        if (header) {
            if (scrolled > 100) {
                header.style.background = 'rgba(255, 255, 255, 0.98)';
                header.style.boxShadow = '0 2px 30px rgba(0, 0, 0, 0.15)';
            } else {
                header.style.background = 'rgba(255, 255, 255, 0.95)';
                header.style.boxShadow = '0 2px 30px rgba(0, 0, 0, 0.1)';
            }
        }
    });
}

function setupSmoothScroll() {
    // Navegación suave
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const headerHeight = document.querySelector('header').offsetHeight;
                const targetPosition = target.offsetTop - headerHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

function toggleMobileMenu() {
    const navLinks = document.querySelector('.nav-links');
    const hamburger = document.querySelector('.hamburger');
    
    if (navLinks && hamburger) {
        navLinks.classList.toggle('mobile-active');
        hamburger.classList.toggle('active');
    }
}

// Funciones auxiliares
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

// Optimizar scroll con throttle
const optimizedScroll = throttle(() => {
    const scrolled = window.pageYOffset;
    const hero = document.querySelector('.hero');
    const header = document.querySelector('header');
    
    if (hero) {
        const rate = scrolled * -0.3;
        hero.style.transform = `translateY(${rate}px)`;
    }
    
    if (header) {
        if (scrolled > 100) {
            header.style.background = 'rgba(255, 255, 255, 0.98)';
            header.style.boxShadow = '0 2px 30px rgba(0, 0, 0, 0.15)';
        } else {
            header.style.background = 'rgba(255, 255, 255, 0.95)';
            header.style.boxShadow = '0 2px 30px rgba(0, 0, 0, 0.1)';
        }
    }
}, 16);

// Aplicar scroll optimizado
window.addEventListener('scroll', optimizedScroll);

// Animaciones adicionales
function addFloatingAnimation() {
    const stars = document.querySelectorAll('.star');
    stars.forEach((star, index) => {
        star.style.animationDelay = `${index * 0.5}s`;
        star.style.animationDuration = `${4 + Math.random() * 4}s`;
    });
}

function validateForm(formData) {
    const errors = [];
    
    // Validar nombre
    if (!formData.name || formData.name.length < 2) {
        errors.push('El nombre debe tener al menos 2 caracteres');
    }
    
    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email || !emailRegex.test(formData.email)) {
        errors.push('Por favor ingresa un email válido');
    }
    
    // Validar teléfono
    const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/;
    if (!formData.phone || !phoneRegex.test(formData.phone)) {
        errors.push('Por favor ingresa un teléfono válido');
    }
    
    // Validar fecha
    if (!formData.date) {
        errors.push('Por favor selecciona una fecha');
    } else {
        const selectedDate = new Date(formData.date);
        const today = new Date();
        
        if (selectedDate < today) {
            errors.push('La fecha no puede ser anterior a hoy');
        }
        
        // Permitir reservas hasta 6 meses adelante
        const maxDate = new Date();
        maxDate.setMonth(maxDate.getMonth() + 6);
        
        if (selectedDate > maxDate) {
            errors.push('Solo se pueden agendar citas hasta 6 meses adelante');
        }
    }
    
    // Validar hora
    if (!formData.time) {
        errors.push('Por favor selecciona una hora');
    }
    
    // Validar servicio
    if (!formData.service) {
        errors.push('Por favor selecciona un servicio');
    }
    
    return errors;
}

// Función mejorada para manejar el envío del formulario
function handleBookingSubmit(e) {
    e.preventDefault();
    
    // Recopilar datos del formulario
    const formData = new FormData(e.target);
    bookingData = {
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        service: formData.get('service'),
        date: formData.get('date'),
        time: formData.get('time'),
        birthdate: formData.get('birthdate'),
        message: formData.get('message')
    };
    
    // Validar formulario
    const errors = validateForm(bookingData);
    
    if (errors.length > 0) {
        showAlert(errors[0], 'error');
        return;
    }
    
    // Verificar disponibilidad de la fecha/hora
    if (!checkAvailability(bookingData.date, bookingData.time)) {
        showAlert('La fecha y hora seleccionadas no están disponibles. Por favor elige otra.', 'error');
        return;
    }
    
    // Procesar reserva
    processBooking();
}

// Simular verificación de disponibilidad
function checkAvailability(date, time) {
    // Siempre devolver true para que todas las fechas estén disponibles
    return true;
}

// Función para guardar datos localmente (simulación)
function saveBookingLocally(bookingData, appointmentId) {
    const bookings = JSON.parse(localStorage.getItem('luna_llena_bookings') || '[]');
    const newBooking = {
        ...bookingData,
        id: appointmentId,
        createdAt: new Date().toISOString(),
        status: 'confirmed'
    };
    
    bookings.push(newBooking);
    localStorage.setItem('luna_llena_bookings', JSON.stringify(bookings));
}

// Función para cargar estilos adicionales dinámicamente
function loadAdditionalStyles() {
    const additionalCSS = `
        @keyframes slideInRight {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOutRight {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
        
        .service-card.selected {
            border: 2px solid var(--gold-color);
            box-shadow: 0 15px 40px rgba(255, 215, 0, 0.3);
            transform: translateY(-5px);
        }
        
        .nav-links.mobile-active {
            display: flex;
            position: fixed;
            top: 70px;
            left: 0;
            right: 0;
            background: rgba(255, 255, 255, 0.98);
            backdrop-filter: blur(20px);
            flex-direction: column;
            padding: 2rem;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
            z-index: 999;
        }
        
        .hamburger.active span:nth-child(1) {
            transform: rotate(45deg) translate(5px, 5px);
        }
        
        .hamburger.active span:nth-child(2) {
            opacity: 0;
        }
        
        .hamburger.active span:nth-child(3) {
            transform: rotate(-45deg) translate(7px, -6px);
        }
        
        .loading-spinner {
            display: inline-block;
            width: 20px;
            height: 20px;
            border: 3px solid rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            border-top-color: #fff;
            animation: spin 1s ease-in-out infinite;
        }
        
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
        
        .form-group.error input,
        .form-group.error select,
        .form-group.error textarea {
            border-color: #ff4757;
            box-shadow: 0 0 0 3px rgba(255, 71, 87, 0.3);
        }
        
        .error-message {
            color: #ff4757;
            font-size: 0.85rem;
            margin-top: 0.5rem;
            display: none;
        }
        
        .form-group.error .error-message {
            display: block;
        }
    `;
    
    const style = document.createElement('style');
    style.textContent = additionalCSS;
    document.head.appendChild(style);
}

// Función para manejar errores de conexión
function handleConnectionError(error) {
    console.error('Error de conexión:', error);
    showAlert('Error de conexión. Por favor verifica tu internet e intenta nuevamente.', 'error');
}

// Función para formatear el teléfono mientras se escribe
function formatPhoneInput(input) {
    input.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        let formattedValue = '';
        
        if (value.length >= 1) {
            if (value.length <= 3) {
                formattedValue = value;
            } else if (value.length <= 6) {
                formattedValue = value.slice(0, 3) + '-' + value.slice(3);
            } else if (value.length <= 10) {
                formattedValue = value.slice(0, 3) + '-' + value.slice(3, 6) + '-' + value.slice(6);
            } else {
                formattedValue = value.slice(0, 3) + '-' + value.slice(3, 6) + '-' + value.slice(6, 10);
            }
        }
        
        e.target.value = formattedValue;
    });
}

// Inicializar funciones adicionales
document.addEventListener('DOMContentLoaded', function() {
    loadAdditionalStyles();
    addFloatingAnimation();
    
    // Formatear input de teléfono
    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
        formatPhoneInput(phoneInput);
    }
    
    // Agregar validación en tiempo real
    const inputs = document.querySelectorAll('#bookingForm input, #bookingForm select');
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            validateField(this);
        });
    });
});

function validateField(field) {
    const formGroup = field.closest('.form-group');
    const errorMessage = formGroup.querySelector('.error-message') || createErrorMessage(formGroup);
    
    let isValid = true;
    let message = '';
    
    switch (field.type) {
        case 'email':
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (field.value && !emailRegex.test(field.value)) {
                isValid = false;
                message = 'Por favor ingresa un email válido';
            }
            break;
        case 'tel':
            const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/;
            if (field.value && !phoneRegex.test(field.value)) {
                isValid = false;
                message = 'Por favor ingresa un teléfono válido';
            }
            break;
        case 'date':
            // Solo validar fecha para el campo de cita, no para fecha de nacimiento
            if (field.id === 'date' && field.value) {
                const selectedDate = new Date(field.value);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                
                if (selectedDate < today) {
                    isValid = false;
                    message = 'La fecha no puede ser anterior a hoy';
                }
            }
            // Para fecha de nacimiento no validamos que sea anterior a hoy
            break;
    }
    
    if (isValid) {
        formGroup.classList.remove('error');
        errorMessage.style.display = 'none';
    } else {
        formGroup.classList.add('error');
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
    }
    
    return isValid;
}

function createErrorMessage(formGroup) {
    const errorMessage = document.createElement('div');
    errorMessage.className = 'error-message';
    formGroup.appendChild(errorMessage);
    return errorMessage;
}

// Función para enviar confirmación por email (simulación)
function sendConfirmationEmail(bookingData, appointmentId) {
    // En una implementación real, esto enviaría un email real
    console.log('Enviando email de confirmación a:', bookingData.email);
    console.log('ID de cita:', appointmentId);
    
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({ success: true });
        }, 1000);
    });
}

// Mejorar la función processBooking
async function processBooking() {
    const submitBtn = document.querySelector('.submit-btn');
    
    if (submitBtn) {
        const originalText = submitBtn.textContent;
        submitBtn.innerHTML = '<span class="loading-spinner"></span> Procesando reserva...';
        submitBtn.disabled = true;
        
        try {
            // Simular validación en servidor
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Generar ID único para la cita
            const appointmentId = generateAppointmentId();
            
            // Guardar localmente
            saveBookingLocally(bookingData, appointmentId);
            
            // Enviar confirmación
            await sendConfirmationEmail(bookingData, appointmentId);
            
            // Asignar red según servicio
            let assignedNetwork = '';
            switch(bookingData.service) {
                case 'tarot':
                    assignedNetwork = 'TAROT';
                    break;
                case 'astrologia':
                    assignedNetwork = 'ASTRO'; 
                    break;
                case 'numerologia':
                    assignedNetwork = 'NUMERO';
                    break;
            }
            
            // Mostrar modal de confirmación
            showBookingConfirmation(assignedNetwork, appointmentId);
            
            // Limpiar formulario
            document.getElementById('bookingForm').reset();
            
            // Mostrar mensaje de éxito
            showAlert('¡Reserva confirmada! Revisa tu email para más detalles.', 'success');
            
        } catch (error) {
            handleConnectionError(error);
        } finally {
            if (submitBtn) {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        }
    }
}