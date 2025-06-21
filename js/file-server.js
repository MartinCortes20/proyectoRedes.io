/**
 * ========================================
 * CENTRO MÍSTICO LUNA LLENA - FILE SERVER
 * Sistema de Archivos TFTP
 * ======================================== 
 */

// ========================================
// CONFIGURACIÓN DEL SERVIDOR TFTP
// ========================================

const TFTP_CONFIG = {
    server: '172.19.5.149',
    port: 69,
    protocol: 'TFTP',
    maxFileSize: '50MB',
    allowedExtensions: ['.pdf', '.xlsx', '.mp3', '.cfg', '.zip', '.txt', '.doc', '.jpg', '.png']
};

// ========================================
// DATOS DEL FILE SERVER
// ========================================

let fileServerData = {
    transferenciasHoy: 23,
    espacioUsado: 2.3, // GB
    espacioTotal: 50, // GB
    estadisticas: {
        descargasCompletas: 18,
        subidasCompletas: 5,
        archivosActivos: 145,
        velocidadPromedio: 2.5 // MB/s
    },
    archivos: [
        {
            nombre: 'manual_tarot_2024.pdf',
            icono: '📄',
            tamaño: '2.3 MB',
            fechaModificacion: '2024-06-20',
            tipo: 'documento'
        },
        {
            nombre: 'reportes_ventas_junio.xlsx',
            icono: '📊',
            tamaño: '1.1 MB',
            fechaModificacion: '2024-06-21',
            tipo: 'hoja_calculo'
        },
        {
            nombre: 'musica_ambiente_relajacion.mp3',
            icono: '🎵',
            tamaño: '8.7 MB',
            fechaModificacion: '2024-06-19',
            tipo: 'audio'
        },
        {
            nombre: 'backup_configuracion.cfg',
            icono: '📋',
            tamaño: '156 KB',
            fechaModificacion: '2024-06-21',
            tipo: 'configuracion'
        },
        {
            nombre: 'fotos_productos_nuevos.zip',
            icono: '🖼️',
            tamaño: '15.2 MB',
            fechaModificacion: '2024-06-18',
            tipo: 'archivo'
        }
    ]
};

// ========================================
// INICIALIZACIÓN DEL FILE SERVER
// ========================================

function initFileServer() {
    renderActividadTFTP();
    renderListaArchivos();
    actualizarContadoresTFTP();
}

// ========================================
// RENDERIZADO DE ACTIVIDAD TFTP
// ========================================

function renderActividadTFTP() {
    const container = document.getElementById('actividad-tftp');
    if (!container) return;
    
    const stats = fileServerData.estadisticas;
    
    container.innerHTML = `
        <div class="metric">
            <span>Descargas completadas</span>
            <span><strong>${stats.descargasCompletas}</strong></span>
        </div>
        <div class="metric">
            <span>Subidas completadas</span>
            <span><strong>${stats.subidasCompletas}</strong></span>
        </div>
        <div class="metric">
            <span>Archivos activos</span>
            <span><strong>${stats.archivosActivos}</strong></span>
        </div>
        <div class="metric">
            <span>Velocidad promedio</span>
            <span style="color: #51cf66;"><strong>${stats.velocidadPromedio} MB/s ✅</strong></span>
        </div>
    `;
}

// ========================================
// RENDERIZADO DE LISTA DE ARCHIVOS
// ========================================

function renderListaArchivos() {
    const container = document.getElementById('lista-archivos');
    if (!container) return;
    
    container.innerHTML = fileServerData.archivos.map(archivo => `
        <div class="file-item">
            <span>${archivo.icono} ${archivo.nombre}</span>
            <div>
                <span style="color: #ccc; margin-right: 1rem;">${archivo.tamaño}</span>
                <button class="btn" onclick="descargarArchivo('${archivo.nombre}')" 
                        style="width: auto; padding: 0.3rem 0.8rem; margin: 0;">
                    ⬇️ Descargar
                </button>
            </div>
        </div>
    `).join('');
}

// ========================================
// ACTUALIZACIÓN DE CONTADORES
// ========================================

function actualizarContadoresTFTP() {
    const transferenciasElement = document.getElementById('transferencias-hoy');
    const espacioElement = document.getElementById('espacio-usado');
    
    if (transferenciasElement) {
        transferenciasElement.textContent = fileServerData.transferenciasHoy;
    }
    
    if (espacioElement) {
        espacioElement.textContent = `${fileServerData.espacioUsado}GB / ${fileServerData.espacioTotal}GB`;
    }
}

// ========================================
// SUBIDA DE ARCHIVOS
// ========================================

function subirArchivo() {
    const fileInput = document.getElementById('fileUpload');
    const resultDiv = document.getElementById('fileResult');
    
    if (!fileInput || !resultDiv) return;
    
    if (!fileInput.files.length) {
        resultDiv.innerHTML = '<div class="alert">Por favor selecciona un archivo</div>';
        return;
    }
    
    const file = fileInput.files[0];
    const validacion = validarArchivo(file);
    
    if (!validacion.valido) {
        resultDiv.innerHTML = `
            <div class="alert">
                <h4>⚠️ Error en el archivo:</h4>
                <ul>
                    ${validacion.errores.map(error => `<li>${error}</li>`).join('')}
                </ul>
            </div>
        `;
        return;
    }
    
    // Simular proceso de subida
    const transferId = generarIdTransferencia();
    const fileSize = (file.size / 1024 / 1024).toFixed(1);
    
    // Mostrar progreso
    resultDiv.innerHTML = `
        <div class="alert">
            <h4>📤 Subiendo Archivo...</h4>
            <p><strong>Archivo:</strong> ${file.name}</p>
            <p><strong>Tamaño:</strong> ${fileSize} MB</p>
            <p><strong>ID Transferencia:</strong> ${transferId}</p>
            <p><strong>Estado:</strong> Transfiriendo... ⏳</p>
        </div>
    `;
    
    // Simular tiempo de subida basado en el tamaño
    const tiempoSubida = Math.max(2000, file.size / 1000000 * 1000); // Mínimo 2 segundos
    
    setTimeout(() => {
        const exitoso = Math.random() > 0.05; // 95% de éxito
        
        if (exitoso) {
            resultDiv.innerHTML = `
                <div class="alert success">
                    <h4>📤 ¡Archivo Subido Exitosamente!</h4>
                    <p><strong>Archivo:</strong> ${file.name}</p>
                    <p><strong>Tamaño:</strong> ${fileSize} MB</p>
                    <p><strong>ID:</strong> ${transferId}</p>
                    <p><strong>Servidor TFTP:</strong> ${TFTP_CONFIG.server}:${TFTP_CONFIG.port}</p>
                    <p><strong>Ubicación:</strong> /uploads/${file.name}</p>
                    <p><strong>Estado:</strong> Transferencia completa ✅</p>
                </div>
            `;
            
            // Agregar archivo a la lista
            agregarArchivoALista(file.name, fileSize);
            
            // Actualizar estadísticas
            fileServerData.estadisticas.subidasCompletas++;
            fileServerData.estadisticas.archivosActivos++;
            fileServerData.transferenciasHoy++;
            fileServerData.espacioUsado += parseFloat(fileSize) / 1000; // Convertir MB a GB
            
            actualizarContadoresTFTP();
            renderActividadTFTP();
            
            // Limpiar input
            fileInput.value = '';
            
        } else {
            resultDiv.innerHTML = `
                <div class="alert">
                    <h4>❌ Error en la Transferencia</h4>
                    <p><strong>ID:</strong> ${transferId}</p>
                    <p><strong>Error:</strong> Conexión interrumpida con servidor TFTP</p>
                    <p><strong>Sugerencia:</strong> Intente nuevamente</p>
                </div>
            `;
        }
        
        // Registrar en SysLog
        if (typeof agregarLogEntry === 'function') {
            const status = exitoso ? 'completada' : 'fallida';
            agregarLogEntry(
                `[${window.CentroMistico?.formatDateTime() || new Date().toLocaleString()}] INFO: TFTP - Subida ${status}: ${file.name} - ID: ${transferId}`
            );
        }
        
    }, tiempoSubida);
}

// ========================================
// DESCARGA DE ARCHIVOS
// ========================================

function descargarArchivo(fileName) {
    const resultDiv = document.getElementById('fileResult');
    if (!resultDiv) return;
    
    const archivo = fileServerData.archivos.find(a => a.nombre === fileName);
    if (!archivo) {
        resultDiv.innerHTML = '<div class="alert">Archivo no encontrado</div>';
        return;
    }
    
    const transferId = generarIdTransferencia();
    
    // Mostrar inicio de descarga
    resultDiv.innerHTML = `
        <div class="alert">
            <h4>⬇️ Iniciando Descarga...</h4>
            <p><strong>Archivo:</strong> ${fileName}</p>
            <p><strong>Tamaño:</strong> ${archivo.tamaño}</p>
            <p><strong>ID:</strong> ${transferId}</p>
            <p><strong>Servidor TFTP:</strong> ${TFTP_CONFIG.server}:${TFTP_CONFIG.port}</p>
            <p><strong>Estado:</strong> Descargando... ⏳</p>
        </div>
    `;
    
    // Simular tiempo de descarga
    const tiempoDescarga = Math.random() * 3000 + 2000; // 2-5 segundos
    
    setTimeout(() => {
        const exitoso = Math.random() > 0.03; // 97% de éxito
        
        if (exitoso) {
            resultDiv.innerHTML = `
                <div class="alert success">
                    <h4>✅ ¡Descarga Completada!</h4>
                    <p><strong>Archivo:</strong> ${fileName}</p>
                    <p><strong>Tamaño:</strong> ${archivo.tamaño}</p>
                    <p><strong>ID:</strong> ${transferId}</p>
                    <p><strong>Ubicación:</strong> /downloads/${fileName}</p>
                    <p><strong>Velocidad:</strong> ${(Math.random() * 2 + 1.5).toFixed(1)} MB/s</p>
                    <p><strong>Estado:</strong> Transferencia completa ✅</p>
                </div>
            `;
            
            // Actualizar estadísticas
            fileServerData.estadisticas.descargasCompletas++;
            fileServerData.transferenciasHoy++;
            
            actualizarContadoresTFTP();
            renderActividadTFTP();
            
        } else {
            resultDiv.innerHTML = `
                <div class="alert">
                    <h4>❌ Error en la Descarga</h4>
                    <p><strong>ID:</strong> ${transferId}</p>
                    <p><strong>Error:</strong> Tiempo de conexión agotado</p>
                    <p><strong>Estado:</strong> Transferencia interrumpida</p>
                </div>
            `;
        }
        
        // Registrar en SysLog
        if (typeof agregarLogEntry === 'function') {
            const status = exitoso ? 'completada' : 'fallida';
            agregarLogEntry(
                `[${window.CentroMistico?.formatDateTime() || new Date().toLocaleString()}] INFO: TFTP - Descarga ${status}: ${fileName} - ID: ${transferId}`
            );
        }
        
    }, tiempoDescarga);
}

// ========================================
// VALIDACIÓN DE ARCHIVOS
// ========================================

function validarArchivo(file) {
    const errores = [];
    const maxSize = 50 * 1024 * 1024; // 50MB en bytes
    
    // Validar tamaño
    if (file.size > maxSize) {
        errores.push(`El archivo es demasiado grande. Máximo: ${TFTP_CONFIG.maxFileSize}`);
    }
    
    // Validar extensión
    const extension = '.' + file.name.split('.').pop().toLowerCase();
    if (!TFTP_CONFIG.allowedExtensions.includes(extension)) {
        errores.push(`Extensión no permitida. Permitidas: ${TFTP_CONFIG.allowedExtensions.join(', ')}`);
    }
    
    // Validar nombre
    if (file.name.length > 100) {
        errores.push('El nombre del archivo es demasiado largo (máximo 100 caracteres)');
    }
    
    return {
        valido: errores.length === 0,
        errores: errores
    };
}

// ========================================
// UTILIDADES
// ========================================

function generarIdTransferencia() {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return `TFTP_${timestamp}_${random}`.toUpperCase();
}

function agregarArchivoALista(nombre, tamaño) {
    const icono = obtenerIconoArchivo(nombre);
    
    const nuevoArchivo = {
        nombre: nombre,
        icono: icono,
        tamaño: `${tamaño} MB`,
        fechaModificacion: new Date().toISOString().split('T')[0],
        tipo: 'subido'
    };
    
    fileServerData.archivos.unshift(nuevoArchivo);
    renderListaArchivos();
}

function obtenerIconoArchivo(nombre) {
    const extension = nombre.split('.').pop().toLowerCase();
    
    const iconos = {
        'pdf': '📄',
        'xlsx': '📊',
        'xls': '📊',
        'mp3': '🎵',
        'wav': '🎵',
        'cfg': '📋',
        'txt': '📝',
        'zip': '🗜️',
        'rar': '🗜️',
        'jpg': '🖼️',
        'png': '🖼️',
        'gif': '🖼️',
        'doc': '📝',
        'docx': '📝'
    };
    
    return iconos[extension] || '📄';
}

// ========================================
// SIMULACIÓN AUTOMÁTICA
// ========================================

function simularActividadTFTP() {
    // Simular transferencias automáticas ocasionales
    if (Math.random() > 0.85) {
        fileServerData.transferenciasHoy++;
        
        if (Math.random() > 0.5) {
            fileServerData.estadisticas.descargasCompletas++;
        } else {
            fileServerData.estadisticas.subidasCompletas++;
        }
        
        actualizarContadoresTFTP();
        renderActividadTFTP();
    }
}

// ========================================
// AUTO-ACTUALIZACIÓN
// ========================================

let tftpInterval;

function iniciarSimulacionTFTP() {
    tftpInterval = setInterval(simularActividadTFTP, 60000); // Cada minuto
}

function detenerSimulacionTFTP() {
    if (tftpInterval) {
        clearInterval(tftpInterval);
        tftpInterval = null;
    }
}

// ========================================
// EVENT LISTENERS
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    iniciarSimulacionTFTP();
});

// ========================================
// EXPORT
// ========================================

window.FileServerModule = {
    initFileServer,
    subirArchivo,
    descargarArchivo,
    validarArchivo,
    obtenerEstadisticas: () => fileServerData,
    iniciarSimulacionTFTP,
    detenerSimulacionTFTP
};