/**
 * ========================================
 * CENTRO MÍSTICO LUNA LLENA - MAIL SERVER
 * Sistema de Correo SMTP
 * ========================================
 */

// ========================================
// CONFIGURACIÓN DEL SERVIDOR SMTP
// ========================================

const SMTP_CONFIG = {
    server: '172.19.5.146',
    port: 25,
    protocol: 'SMTP',
    maxQueue: 50,
    retryAttempts: 3
};

// ========================================
// DATOS DEL MAIL SERVER
// ========================================

let mailServerData = {
    emailsEnviados: 47,
    colaEnvio: 3,
    estadisticas: {
        confirmaciones: 32,
        recordatorios: 15,
        newsletters: 127,
        tasaEntrega: 98.5
    },
    historialEmails: []
};

// ========================================
// INICIALIZACIÓN DEL MAIL SERVER
// ========================================

function initMailServer() {
    renderEstadisticasEmail();
    actualizarContadoresEmail();
}

// ========================================
// RENDERIZADO DE ESTADÍSTICAS
// ========================================

function renderEstadisticasEmail() {
    const container = document.getElementById('estadisticas-email');
    if (!container) return;
    
    const stats = mailServerData.estadisticas;
    
    container.innerHTML = `
        <div class="metric">
            <span>Confirmaciones de Reserva</span>
            <span><strong>${stats.confirmaciones} enviados</strong></span>
        </div>
        <div class="metric">
            <span>Recordatorios de Cita</span>
            <span><strong>${stats.recordatorios} enviados</strong></span>
        </div>
        <div class="metric">
            <span>Newsletters</span>
            <span><strong>${stats.newsletters} enviados</strong></span>
        </div>
        <div class="metric">
            <span>Tasa de entrega</span>
            <span style="color: #51cf66;"><strong>${stats.tasaEntrega}% ✅</strong></span>
        </div>
    `;
}

// ========================================
// ACTUALIZACIÓN DE CONTADORES
// ========================================

function actualizarContadoresEmail() {
    const emailsElement = document.getElementById('emails-enviados');
    const colaElement = document.getElementById('cola-envio');
    
    if (emailsElement) {
        emailsElement.textContent = mailServerData.emailsEnviados;
    }
    
    if (colaElement) {
        colaElement.textContent = mailServerData.colaEnvio;
    }
}

function incrementarEmailsEnviados() {
    mailServerData.emailsEnviados++;
    mailServerData.estadisticas.confirmaciones++;
    
    // Reducir cola de envío ocasionalmente
    if (Math.random() > 0.7 && mailServerData.colaEnvio > 0) {
        mailServerData.colaEnvio--;
    }
    
    actualizarContadoresEmail();
    renderEstadisticasEmail();
}

// ========================================
// ENVÍO DE EMAILS
// ========================================

function enviarEmail() {
    const emailTo = document.getElementById('emailTo')?.value;
    const emailSubject = document.getElementById('emailSubject')?.value;
    const emailBody = document.getElementById('emailBody')?.value;
    const resultDiv = document.getElementById('emailResult');
    
    if (!resultDiv) return;
    
    // Validación básica
    const validacion = validarEmail(emailTo, emailSubject, emailBody);
    
    if (!validacion.valido) {
        resultDiv.innerHTML = `
            <div class="alert">
                <h4>⚠️ Errores en el email:</h4>
                <ul>
                    ${validacion.errores.map(error => `<li>${error}</li>`).join('')}
                </ul>
            </div>
        `;
        return;
    }
    
    // Simular envío
    const emailId = generarIdEmail();
    const timestamp = new Date();
    
    // Mostrar proceso de envío
    resultDiv.innerHTML = `
        <div class="alert">
            <h4>📤 Enviando Email...</h4>
            <p><strong>ID:</strong> ${emailId}</p>
            <p><strong>Estado:</strong> Procesando...</p>
        </div>
    `;
    
    // Simular tiempo de envío
    setTimeout(() => {
        const exitoso = Math.random() > 0.05; // 95% de éxito
        
        if (exitoso) {
            resultDiv.innerHTML = `
                <div class="alert success">
                    <h4>📧 ¡Email Enviado Exitosamente!</h4>
                    <p><strong>Para:</strong> ${emailTo}</p>
                    <p><strong>Asunto:</strong> ${emailSubject}</p>
                    <p><strong>ID:</strong> ${emailId}</p>
                    <p><strong>Servidor SMTP:</strong> ${SMTP_CONFIG.server}:${SMTP_CONFIG.port}</p>
                    <p><strong>Tiempo:</strong> ${timestamp.toLocaleString()}</p>
                    <p><strong>Estado:</strong> Entregado ✅</p>
                </div>
            `;
            
            // Registrar email exitoso
            registrarEmail(emailTo, emailSubject, emailBody, emailId, 'enviado');
            incrementarEmailsEnviados();
            
            // Limpiar formulario
            limpiarFormularioEmail();
            
        } else {
            resultDiv.innerHTML = `
                <div class="alert">
                    <h4>❌ Error al Enviar Email</h4>
                    <p><strong>ID:</strong> ${emailId}</p>
                    <p><strong>Error:</strong> Conexión temporal perdida con servidor SMTP</p>
                    <p><strong>Reintento:</strong> Agregado a cola de envío</p>
                </div>
            `;
            
            // Agregar a cola de reintento
            mailServerData.colaEnvio++;
            actualizarContadoresEmail();
        }
        
        // Registrar en SysLog
        if (typeof agregarLogEntry === 'function') {
            const status = exitoso ? 'exitosamente' : 'con error';
            agregarLogEntry(
                `[${window.CentroMistico?.formatDateTime() || new Date().toLocaleString()}] INFO: SMTP - Email ${status} a ${emailTo} - ID: ${emailId}`
            );
        }
        
    }, 2000);
}

// ========================================
// VALIDACIÓN DE EMAILS
// ========================================

function validarEmail(para, asunto, cuerpo) {
    const errores = [];
    
    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!para || !emailRegex.test(para)) {
        errores.push('Dirección de email inválida');
    }
    
    // Validar asunto
    if (!asunto || asunto.trim().length < 3) {
        errores.push('El asunto debe tener al menos 3 caracteres');
    }
    
    // Validar cuerpo
    if (!cuerpo || cuerpo.trim().length < 10) {
        errores.push('El mensaje debe tener al menos 10 caracteres');
    }
    
    return {
        valido: errores.length === 0,
        errores: errores
    };
}

// ========================================
// UTILIDADES
// ========================================

function generarIdEmail() {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return `EMAIL_${timestamp}_${random}`.toUpperCase();
}

function limpiarFormularioEmail() {
    const campos = ['emailTo', 'emailSubject', 'emailBody'];
    
    campos.forEach(campo => {
        const elemento = document.getElementById(campo);
        if (elemento) {
            elemento.value = '';
        }
    });
}

function registrarEmail(para, asunto, cuerpo, id, estado) {
    const email = {
        id: id,
        para: para,
        asunto: asunto,
        cuerpo: cuerpo.substring(0, 100) + (cuerpo.length > 100 ? '...' : ''),
        estado: estado,
        timestamp: new Date(),
        servidor: `${SMTP_CONFIG.server}:${SMTP_CONFIG.port}`
    };
    
    mailServerData.historialEmails.unshift(email);
    
    // Mantener solo los últimos 50 emails
    if (mailServerData.historialEmails.length > 50) {
        mailServerData.historialEmails = mailServerData.historialEmails.slice(0, 50);
    }
}

// ========================================
// TEMPLATES DE EMAIL
// ========================================

const EMAIL_TEMPLATES = {
    confirmacionReserva: (nombre, servicio, fecha, hora) => ({
        asunto: `Confirmación de Reserva - Centro Místico Luna Llena`,
        cuerpo: `Estimado/a ${nombre},

Su reserva ha sido confirmada exitosamente.

Detalles de la cita:
- Servicio: ${servicio}
- Fecha: ${fecha}
- Hora: ${hora}
- Ubicación: Zona Rosa, CDMX

Por favor llegue 10 minutos antes de su cita.

Bendiciones,
Centro Místico Luna Llena 🌙`
    }),
    
    recordatorio: (nombre, servicio, fecha, hora) => ({
        asunto: `Recordatorio de Cita - Centro Místico Luna Llena`,
        cuerpo: `Estimado/a ${nombre},

Le recordamos su cita programada para mañana:

- Servicio: ${servicio}
- Fecha: ${fecha}
- Hora: ${hora}

¡Esperamos verle pronto!

Centro Místico Luna Llena 🌙`
    })
};

function aplicarTemplate(tipo, datos) {
    const template = EMAIL_TEMPLATES[tipo];
    if (!template) return;
    
    const email = template(...datos);
    
    document.getElementById('emailSubject').value = email.asunto;
    document.getElementById('emailBody').value = email.cuerpo;
}

// ========================================
// PROCESAMIENTO DE COLA
// ========================================

function procesarColaEnvio() {
    if (mailServerData.colaEnvio > 0) {
        mailServerData.colaEnvio = Math.max(0, mailServerData.colaEnvio - 1);
        mailServerData.emailsEnviados++;
        
        actualizarContadoresEmail();
        
        if (typeof agregarLogEntry === 'function') {
            agregarLogEntry(
                `[${window.CentroMistico?.formatDateTime() || new Date().toLocaleString()}] INFO: SMTP - Email de cola procesado exitosamente`
            );
        }
    }
}

// ========================================
// SIMULACIÓN AUTOMÁTICA
// ========================================

function simularActividadSMTP() {
    // Simular emails automáticos ocasionales
    if (Math.random() > 0.8) {
        mailServerData.emailsEnviados++;
        
        const tipos = ['confirmaciones', 'recordatorios', 'newsletters'];
        const tipo = tipos[Math.floor(Math.random() * tipos.length)];
        mailServerData.estadisticas[tipo]++;
        
        actualizarContadoresEmail();
        renderEstadisticasEmail();
    }
    
    // Procesar cola ocasionalmente
    if (Math.random() > 0.6) {
        procesarColaEnvio();
    }
}

// ========================================
// AUTO-ACTUALIZACIÓN
// ========================================

let smtpInterval;

function iniciarSimulacionSMTP() {
    smtpInterval = setInterval(simularActividadSMTP, 45000); // Cada 45 segundos
}

function detenerSimulacionSMTP() {
    if (smtpInterval) {
        clearInterval(smtpInterval);
        smtpInterval = null;
    }
}

// ========================================
// EVENT LISTENERS
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    iniciarSimulacionSMTP();
});

// ========================================
// EXPORT
// ========================================

window.MailServerModule = {
    initMailServer,
    enviarEmail,
    incrementarEmailsEnviados,
    aplicarTemplate,
    validarEmail,
    procesarColaEnvio,
    obtenerEstadisticas: () => mailServerData,
    iniciarSimulacionSMTP,
    detenerSimulacionSMTP
};