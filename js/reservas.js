/**
 * ========================================
 * CENTRO MÍSTICO LUNA LLENA - RESERVAS
 * Sistema de Gestión de Reservas
 * ========================================
 */

// ========================================
// DATOS DE ESPECIALISTAS
// ========================================

const ESPECIALISTAS = {
    tarot: [
        'Madame Luna',
        'Maestro Carlos',
        'Esperanza Vidente',
        'Doña María'
    ],
    videncia: [
        'Cristal Mystic',
        'Profesor Alejandro',
        'Luna Plateada'
    ],
    terapia: [
        'Sanadora Paz',
        'Maestro Luz',
        'Terapeuta Armonia'
    ],
    vip: [
        'Gran Maestra Selene',
        'Vidente Supremo'
    ]
};

// ========================================
// GESTIÓN DE ESPECIALISTAS
// ========================================

function updateSpecialists() {
    const servicio = document.getElementById('servicio').value;
    const especialistaSelect = document.getElementById('especialista');
    
    if (!especialistaSelect) return;
    
    // Limpiar opciones existentes
    especialistaSelect.innerHTML = '<option value="">Selecciona un especialista...</option>';
    
    // Agregar especialistas según el servicio seleccionado
    if (servicio && ESPECIALISTAS[servicio]) {
        ESPECIALISTAS[servicio].forEach(especialista => {
            const option = document.createElement('option');
            option.value = especialista;
            option.textContent = especialista;
            especialistaSelect.appendChild(option);
        });
    }
}

// ========================================
// VALIDACIÓN DE FORMULARIO
// ========================================

function validarReserva() {
    const campos = {
        servicio: document.getElementById('servicio')?.value,
        especialista: document.getElementById('especialista')?.value,
        fecha: document.getElementById('fecha')?.value,
        hora: document.getElementById('hora')?.value,
        nombre: document.getElementById('nombre')?.value,
        telefono: document.getElementById('telefono')?.value
    };
    
    const errores = [];
    
    // Validar campos requeridos
    Object.entries(campos).forEach(([campo, valor]) => {
        if (!valor || valor.trim() === '') {
            errores.push(`El campo ${campo} es requerido`);
        }
    });
    
    // Validar fecha (no puede ser en el pasado)
    if (campos.fecha) {
        const fechaSeleccionada = new Date(campos.fecha);
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        
        if (fechaSeleccionada < hoy) {
            errores.push('La fecha no puede ser en el pasado');
        }
    }
    
    // Validar teléfono (formato básico)
    if (campos.telefono && !/^\d{10}$/.test(campos.telefono.replace(/\s|-/g, ''))) {
        errores.push('El teléfono debe tener 10 dígitos');
    }
    
    return {
        valido: errores.length === 0,
        errores: errores,
        datos: campos
    };
}

// ========================================
// PROCESAMIENTO DE RESERVA
// ========================================

function reservarCita() {
    const validacion = validarReserva();
    const resultDiv = document.getElementById('reservaResult');
    
    if (!resultDiv) return;
    
    if (!validacion.valido) {
        resultDiv.innerHTML = `
            <div class="alert">
                <h4>⚠️ Errores en el formulario:</h4>
                <ul>
                    ${validacion.errores.map(error => `<li>${error}</li>`).join('')}
                </ul>
            </div>
        `;
        return;
    }
    
    // Simular procesamiento
    const { datos } = validacion;
    const servicioTexto = document.getElementById('servicio').options[document.getElementById('servicio').selectedIndex].text;
    const numeroReserva = generarNumeroReserva();
    
    // Mostrar confirmación
    resultDiv.innerHTML = `
        <div class="alert success">
            <h4>✅ ¡Reserva Confirmada!</h4>
            <p><strong>Número de Reserva:</strong> ${numeroReserva}</p>
            <p><strong>Servicio:</strong> ${servicioTexto}</p>
            <p><strong>Especialista:</strong> ${datos.especialista}</p>
            <p><strong>Fecha:</strong> ${formatearFecha(datos.fecha)}</p>
            <p><strong>Hora:</strong> ${datos.hora}</p>
            <p><strong>Cliente:</strong> ${datos.nombre}</p>
            <br>
            <p>📧 Confirmación enviada vía SMTP</p>
            <p>📋 Evento registrado en SysLog</p>
            <p>🔮 Llega 10 minutos antes de tu cita</p>
            <p>📱 SMS enviado al ${datos.telefono}</p>
        </div>
    `;
    
    // Registrar en SysLog
    if (typeof agregarLogEntry === 'function') {
        agregarLogEntry(
            `[${window.CentroMistico.formatDateTime()}] INFO: Reserva confirmada - Cliente: ${datos.nombre} - Servicio: ${datos.servicio} - Reserva: ${numeroReserva}`
        );
    }
    
    // Simular envío de email
    if (typeof incrementarEmailsEnviados === 'function') {
        incrementarEmailsEnviados();
    }
    
    // Limpiar formulario después de 3 segundos
    setTimeout(() => {
        limpiarFormularioReserva();
    }, 3000);
    
    // Mostrar notificación
    if (window.CentroMistico && window.CentroMistico.showNotification) {
        window.CentroMistico.showNotification(
            `Reserva ${numeroReserva} confirmada para ${datos.nombre}`,
            'success'
        );
    }
}

// ========================================
// UTILIDADES
// ========================================

function generarNumeroReserva() {
    const fecha = new Date();
    const timestamp = fecha.getTime().toString().slice(-6);
    const random = Math.floor(Math.random() * 100).toString().padStart(2, '0');
    return `CM${timestamp}${random}`;
}

function formatearFecha(fechaString) {
    const fecha = new Date(fechaString);
    return fecha.toLocaleDateString('es-MX', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function limpiarFormularioReserva() {
    const campos = ['servicio', 'especialista', 'fecha', 'hora', 'nombre', 'telefono'];
    
    campos.forEach(campo => {
        const elemento = document.getElementById(campo);
        if (elemento) {
            elemento.value = '';
        }
    });
    
    // Limpiar resultado
    const resultDiv = document.getElementById('reservaResult');
    if (resultDiv) {
        resultDiv.innerHTML = '';
    }
}

// ========================================
// HORARIOS DISPONIBLES
// ========================================

function verificarDisponibilidad() {
    const fecha = document.getElementById('fecha')?.value;
    const especialista = document.getElementById('especialista')?.value;
    
    if (!fecha || !especialista) return;
    
    // Simular verificación de disponibilidad
    const horariosOcupados = ['10:00', '15:00']; // Simulación
    const horaSelect = document.getElementById('hora');
    
    if (horaSelect) {
        Array.from(horaSelect.options).forEach(option => {
            if (horariosOcupados.includes(option.value)) {
                option.disabled = true;
                option.textContent += ' (Ocupado)';
            } else {
                option.disabled = false;
                option.textContent = option.textContent.replace(' (Ocupado)', '');
            }
        });
    }
}

// ========================================
// EVENT LISTENERS
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    // Listener para cambio de fecha
    const fechaInput = document.getElementById('fecha');
    if (fechaInput) {
        fechaInput.addEventListener('change', verificarDisponibilidad);
    }
    
    // Listener para cambio de especialista
    const especialistaSelect = document.getElementById('especialista');
    if (especialistaSelect) {
        especialistaSelect.addEventListener('change', verificarDisponibilidad);
    }
});

// ========================================
// EXPORT
// ========================================

window.ReservasModule = {
    updateSpecialists,
    reservarCita,
    validarReserva,
    limpiarFormularioReserva,
    verificarDisponibilidad
};