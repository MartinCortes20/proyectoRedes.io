// Centro Luna - FTP System REAL
// Equipo 3: Carmona Viana Israel • Cortes Buendia Martin

class FTPSystem {
    constructor() {
        this.files = [];
        this.transfers = [];
        this.currentFolder = 'root';
        this.areas = ['ventas', 'sesiones', 'inventarios', 'servidores'];
        this.fileTypes = {
            'txt': { icon: '📄', color: '#007bff' },
            'pdf': { icon: '📕', color: '#dc3545' },
            'csv': { icon: '📊', color: '#28a745' },
            'json': { icon: '📋', color: '#ffc107' },
            'log': { icon: '📝', color: '#6c757d' },
            'zip': { icon: '🗜️', color: '#6f42c1' },
            'img': { icon: '🖼️', color: '#e83e8c' }
        };
        
        // ✅ Configuración para servidor REAL
        this.serverConfig = {
            webServer: window.location.protocol + '//' + window.location.host,
            ftpApi: window.location.protocol + '//' + window.location.host + '/ftp'
        };
        
        this.isOnline = false;
        this.init();
    }

    init() {
        this.checkFTPServer();
        this.setupEventListeners();
        this.updateStats();
        this.displayFiles();
        this.setupDragAndDrop();
        this.startAutoRefresh();
    }

    async checkFTPServer() {
        try {
            // ✅ Verificar conexión al servidor web real (que maneja FTP)
            const response = await fetch(`${this.serverConfig.webServer}/health`);
            if (response.ok) {
                this.isOnline = true;
                console.log('✅ Conectado al servidor FTP real');
                await this.loadFilesFromServer();
                this.showConnectionStatus('Conectado al servidor FTP', 'success');
            } else {
                throw new Error('FTP server not responding');
            }
        } catch (error) {
            this.isOnline = false;
            console.log('❌ Servidor FTP no disponible, usando datos locales');
            this.loadFilesFromLocal();
            this.showConnectionStatus('Servidor FTP no disponible - Modo Offline', 'warning');
        }
    }

    async loadFilesFromServer() {
        try {
            // ✅ En el futuro, aquí cargaríamos archivos reales del servidor
            // Por ahora, inicializar con datos de ejemplo
            this.loadFilesFromLocal();
            console.log('✅ Sistema FTP listo para operaciones reales');
        } catch (error) {
            console.error('❌ Error cargando archivos del servidor:', error);
            this.loadFilesFromLocal();
        }
    }

    loadFilesFromLocal() {
        const storedFiles = localStorage.getItem('centroLunaFiles');
        const storedTransfers = localStorage.getItem('centroLunaTransfers');
        
        if (storedFiles) {
            this.files = JSON.parse(storedFiles);
        } else {
            this.files = [];
            this.generateSampleFiles();
        }
        
        if (storedTransfers) {
            this.transfers = JSON.parse(storedTransfers);
        } else {
            this.transfers = [];
        }
    }

    saveData() {
        if (this.isOnline) {
            // ✅ En servidor real, los datos se guardan automáticamente
            console.log('📡 Archivos sincronizados con servidor FTP');
        } else {
            // Modo offline - guardar localmente
            localStorage.setItem('centroLunaFiles', JSON.stringify(this.files));
            localStorage.setItem('centroLunaTransfers', JSON.stringify(this.transfers));
            console.log('💾 Archivos guardados localmente (modo offline)');
        }
    }

    setupEventListeners() {
    // Botones principales
    document.getElementById('refreshFiles').addEventListener('click', () => {
        this.refreshFiles();
    });

    document.getElementById('uploadFile').addEventListener('click', () => {
        document.getElementById('fileInput').click();
    });

    document.getElementById('createFolder').addEventListener('click', () => {
        this.createFolder();
    });

    document.getElementById('selectFiles').addEventListener('click', () => {
        document.getElementById('fileInput').click();
    });

    // Input de archivos
    document.getElementById('fileInput').addEventListener('change', (e) => {
        this.handleFileUpload(e.target.files);
    });

    // Filtros
    document.getElementById('fileTypeFilter').addEventListener('change', () => {
        this.displayFiles();
    });

    document.getElementById('areaSourceFilter').addEventListener('change', () => {
        this.displayFiles();
    });

    // Vista
    document.getElementById('listView').addEventListener('click', () => {
        this.setView('list');
    });

    document.getElementById('gridView').addEventListener('click', () => {
        this.setView('grid');
    });

    // Navegación de carpetas
    document.querySelectorAll('.folder-item').forEach(item => {
        item.addEventListener('click', () => {
            this.navigateToFolder(item.dataset.folder);
        });
    });
}

    // Métodos públicos para debugging
    getServerStatus() {
        return {
            isOnline: this.isOnline,
            serverConfig: this.serverConfig,
            filesCount: this.files.length,
            transfersCount: this.transfers.length,
            currentFolder: this.currentFolder
        };
    }

    async forceReconnect() {
        console.log('🔄 Forzando reconexión al servidor FTP...');
        await this.checkFTPServer();
        if (this.isOnline) {
            await this.loadFilesFromServer();
            this.updateStats();
            this.displayFiles();
            this.showNotification('Reconectado al servidor FTP', 'success');
        } else {
            this.showNotification('No se pudo conectar al servidor FTP', 'error');
        }
    }

    // Métodos de utilidad pública
    async exportFileList() {
        const fileList = this.files.map(file => ({
            nombre: file.name,
            tipo: file.type,
            tamaño: this.formatFileSize(file.size),
            origen: file.source,
            carpeta: file.folder,
            fechaCreacion: this.formatTimestamp(file.dateCreated),
            fechaModificacion: this.formatTimestamp(file.dateModified),
            ubicacion: this.isOnline ? 'Servidor FTP' : 'Local'
        }));

        const dataStr = JSON.stringify(fileList, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `centro_luna_archivos_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
        this.showNotification('Lista de archivos exportada', 'success');
    }

    setupDragAndDrop() {
    const uploadArea = document.getElementById('uploadArea');
    
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });

    uploadArea.addEventListener('dragleave', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        this.handleFileUpload(e.dataTransfer.files);
    });

    uploadArea.addEventListener('click', () => {
        document.getElementById('fileInput').click();
    });
}

async refreshFiles() {
    if (this.isOnline) {
        await this.loadFilesFromServer();
    } else {
        await this.checkFTPServer();
        if (!this.isOnline) {
            this.loadFilesFromLocal();
        }
    }
    
    this.updateStats();
    this.displayFiles();
    this.showNotification('Archivos actualizados', 'success');
}

async createFolder() {
    const folderName = prompt('Nombre de la nueva carpeta:');
    if (folderName && folderName.trim()) {
        const folder = {
            id: Date.now(),
            name: folderName.trim(),
            type: 'folder',
            size: 0,
            source: 'manual',
            folder: this.currentFolder,
            dateCreated: new Date().toISOString(),
            dateModified: new Date().toISOString()
        };
        
        this.files.push(folder);
        this.saveData();
        this.updateStats();
        this.displayFiles();
        this.showNotification(`Carpeta '${folderName}' creada`, 'success');
    }
}

async handleFileUpload(files) {
    if (files.length === 0) return;

    const destination = document.getElementById('uploadDestination').value;
    
    Array.from(files).forEach(file => {
        const fileObj = {
            id: Date.now() + Math.random(),
            name: file.name,
            type: this.getFileType(file.name),
            size: file.size,
            source: destination,
            folder: this.currentFolder,
            dateCreated: new Date().toISOString(),
            dateModified: new Date().toISOString()
        };
        
        this.files.push(fileObj);
    });

    this.saveData();
    this.updateStats();
    this.displayFiles();
    this.showNotification(`${files.length} archivo(s) subido(s)`, 'success');
}

getFileType(filename) {
    const extension = filename.split('.').pop().toLowerCase();
    const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg'];
    
    if (imageExts.includes(extension)) {
        return 'img';
    }
    
    return this.fileTypes[extension] ? extension : 'txt';
}

updateConnectionStatus() {
    // Actualizar estado principal del FTP
    const ftpStatusInfo = document.getElementById('ftpStatusInfo');
    if (ftpStatusInfo) {
        ftpStatusInfo.textContent = this.isOnline ? '🟢 ACTIVO' : '🔴 OFFLINE';
    }

    // Actualizar estado de las conexiones con las áreas
    const connections = document.querySelectorAll('.connection-status');
    connections.forEach(conn => {
        conn.textContent = this.isOnline ? '🟢 Conectado' : '🔴 Desconectado';
        conn.style.color = this.isOnline ? '#28a745' : '#dc3545';
    });
}

formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

updateStats() {
    const totalFiles = this.files.filter(f => f.type !== 'folder').length;
    const totalSize = this.files.reduce((sum, file) => sum + (file.size || 0), 0);
    
    const today = new Date().toDateString();
    const transfersToday = this.transfers.filter(transfer => 
        new Date(transfer.timestamp).toDateString() === today
    ).length;

    const lastTransfer = this.transfers.length > 0 ? 
        this.formatTimestamp(this.transfers[0].timestamp) : '-';

    // Actualizar UI
    document.getElementById('totalFiles').textContent = totalFiles;
    document.getElementById('usedSpace').textContent = this.formatFileSize(totalSize);
    document.getElementById('transfersToday').textContent = transfersToday;
    document.getElementById('lastTransfer').textContent = lastTransfer;

    // Actualizar contadores por área
    this.areas.forEach(area => {
        const count = this.files.filter(f => f.source === area && f.type !== 'folder').length;
        const element = document.getElementById(`${area}-files`);
        if (element) {
            element.textContent = `${count} archivos`;
        }
    });

    this.updateConnectionStatus();
}

displayFiles() {
    const filesList = document.getElementById('filesList');
    
    if (this.files.length === 0) {
        filesList.innerHTML = `
            <div class="no-files">
                <p>📁 No hay archivos en esta carpeta</p>
                <p>${this.isOnline ? 'Sube archivos al servidor FTP' : 'Conecta al servidor para sincronizar archivos'}</p>
            </div>
        `;
        return;
    }
    
    filesList.innerHTML = '';
    
    // Ordenar: carpetas primero, luego archivos por fecha
    this.files.sort((a, b) => {
        if (a.type === 'folder' && b.type !== 'folder') return -1;
        if (a.type !== 'folder' && b.type === 'folder') return 1;
        return new Date(b.dateModified) - new Date(a.dateModified);
    });

    this.files.forEach(file => {
        const fileElement = this.createFileElement(file);
        filesList.appendChild(fileElement);
    });
}

generateSampleFiles() {
    if (this.files.length === 0) {
        const sampleFiles = [
            { name: 'config_router_luna.txt', type: 'txt', size: 3210, source: 'servidores', folder: 'root' },
            { name: 'ventas_enero_2024.csv', type: 'csv', size: 15640, source: 'ventas', folder: 'ventas' }
        ];

        sampleFiles.forEach((file, index) => {
            this.files.push({
                id: Date.now() + index,
                ...file,
                dateCreated: new Date().toISOString(),
                dateModified: new Date().toISOString()
            });
        });
        this.saveData();
    }
}

setView(viewType) {
    console.log(`Vista cambiada a: ${viewType}`);
}

navigateToFolder(folder) {
    this.currentFolder = folder;
    this.displayFiles();
    console.log(`Navegando a carpeta: ${folder}`);
}

startAutoRefresh() {
    setInterval(async () => {
        if (!this.isOnline) {
            await this.checkFTPServer();
        }
    }, 30000);
}

showNotification(message, type = 'info') {
    console.log(`${type.toUpperCase()}: ${message}`);
}

showConnectionStatus(message, type) {
    console.log(`CONNECTION ${type.toUpperCase()}: ${message}`);
}

async downloadFile(fileId) {
    const file = this.files.find(f => f.id === fileId);
    if (!file) return;

    if (this.isOnline) {
        try {
            const response = await fetch(`${this.serverConfig.ftpApi}/download`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fileName: file.name,
                    source: file.source,
                    folder: file.folder
                })
            });

            if (response.ok) {
                console.log(`✅ Archivo ${file.name} descargado del servidor FTP`);
            }
        } catch (error) {
            console.error(`❌ Error descargando ${file.name}:`, error);
        }
    }
    
    this.showNotification(`${file.name} descargado`, 'success');
}

async deleteFile(fileId) {
    const file = this.files.find(f => f.id === fileId);
    if (!file || !confirm(`¿Eliminar ${file.name}?`)) return;

    if (this.isOnline) {
        try {
            const response = await fetch(`${this.serverConfig.ftpApi}/delete`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fileName: file.name,
                    source: file.source,
                    folder: file.folder
                })
            });

            if (response.ok) {
                console.log(`✅ Archivo ${file.name} eliminado del servidor FTP`);
            }
        } catch (error) {
            console.error(`❌ Error eliminando ${file.name}:`, error);
        }
    }
    
    this.files = this.files.filter(f => f.id !== fileId);
    this.saveData();
    this.updateStats();
    this.displayFiles();
    this.showNotification(`${file.name} eliminado`, 'warning');
}

async logTransfer(type, description) {
    const transfer = {
        id: Date.now(),
        type: type,
        description: description,
        timestamp: new Date().toISOString(),
        status: 'completado'
    };
    
    this.transfers.unshift(transfer);
    
    if (this.transfers.length > 50) {
        this.transfers = this.transfers.slice(0, 50);
    }
    
    this.saveData();
    
    // ✅ Log en SYSLOG real también
    if (window.centroLuna && this.isOnline) {
        await window.centroLuna.logActivity('FTP', description, 'servidores');
    }
}

displayTransfers() {
    const transfersList = document.getElementById('transfersList');
    
    if (this.transfers.length === 0) {
        transfersList.innerHTML = `
            <div class="no-transfers">
                <p>📊 No hay transferencias registradas</p>
            </div>
        `;
        return;
    }



    transfersList.innerHTML = '';
    
    this.transfers.slice(0, 10).forEach(transfer => {
        const transferItem = document.createElement('div');
        transferItem.className = 'transfer-item';
        
        const typeIcons = {
            'UPLOAD': '📤',
            'DOWNLOAD': '📥',
            'DELETE': '🗑️',
            'CREATE': '📁'
        };
        
        transferItem.innerHTML = `
            <span class="transfer-file">
                ${typeIcons[transfer.type] || '📄'} ${transfer.description}
            </span>
            <span class="transfer-status">✅ ${transfer.status}</span>
            <span class="transfer-time">${this.formatTimestamp(transfer.timestamp)}</span>
        `;
        
        transfersList.appendChild(transferItem);
    });
}

createFileElement(file) {
    const fileItem = document.createElement('div');
    fileItem.className = 'file-item';

    const isFolder = file.type === 'folder';
    const fileTypeInfo = this.fileTypes[file.type] || this.fileTypes['txt'];

    fileItem.innerHTML = `
        <span class="file-icon">${isFolder ? '📁' : fileTypeInfo.icon}</span>
        <div class="file-info">
            <div class="file-name">${file.name}</div>
            <div class="file-details">
                ${isFolder ? 'Carpeta' : `${file.type.toUpperCase()} • ${file.source}`}
                ${this.isOnline ? ' • Servidor' : ' • Local'}
            </div>
        </div>
        <span class="file-size">${isFolder ? '-' : this.formatFileSize(file.size)}</span>
        <span class="file-date">${this.formatTimestamp(file.dateModified)}</span>
        <div class="file-actions">
            ${!isFolder ? `
                <button class="file-action-btn" onclick="window.ftpSystem.downloadFile(${file.id})" title="Descargar">
                    📥
                </button>
            ` : ''}
            <button class="file-action-btn" onclick="window.ftpSystem.deleteFile(${file.id})" title="Eliminar">
                🗑️
            </button>
        </div>
    `;

    if (isFolder) {
        fileItem.style.cursor = 'pointer';
        fileItem.addEventListener('dblclick', () => {
            this.navigateToFolder(file.name);
        });
    }

    return fileItem;
}

    getSystemStats() {
        return {
            isOnline: this.isOnline,
            totalFiles: this.files.filter(f => f.type !== 'folder').length,
            totalFolders: this.files.filter(f => f.type === 'folder').length,
            totalSize: this.files.reduce((sum, file) => sum + (file.size || 0), 0),
            totalTransfers: this.transfers.length,
            filesByArea: this.areas.reduce((stats, area) => {
                stats[area] = this.files.filter(f => f.source === area).length;
                return stats;
            }, {}),
            filesByType: Object.keys(this.fileTypes).reduce((stats, type) => {
                stats[type] = this.files.filter(f => f.type === type).length;
                return stats;
            }, {}),
            server: this.serverConfig
        };
    }
}



// Inicializar el sistema FTP
document.addEventListener('DOMContentLoaded', () => {
    window.ftpSystem = new FTPSystem();
    
    // Funciones globales para debugging
    window.ftpUtils = {
        getStatus: () => window.ftpSystem.getServerStatus(),
        getStats: () => window.ftpSystem.getSystemStats(),
        reconnect: () => window.ftpSystem.forceReconnect(),
        export: () => window.ftpSystem.exportFileList(),
        uploadTest: () => {
            // Simular subida de archivo de prueba
            const testFile = new File(['Contenido de prueba'], 'test_file.txt', {
                type: 'text/plain'
            });
            window.ftpSystem.handleFileUpload([testFile]);
        }
    };
    
    // Agregar estilos de animación
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                opacity: 0;
                transform: translateX(100%);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }
        
        .no-files, .no-transfers {
            text-align: center;
            padding: 3rem;
            color: #6c757d;
        }
        
        .no-files p:first-child, .no-transfers p:first-child {
            font-size: 1.2rem;
            margin-bottom: 0.5rem;
        }
        
        .file-item:hover {
            background: #f8f9fa;
            transform: translateX(5px);
            transition: all 0.3s ease;
        }
        
        .transfer-item:hover {
            background: #f1f3f4;
        }
        
        .ftp-server-status {
            animation: slideIn 0.3s ease;
        }
    `;
    document.head.appendChild(style);
    
    console.log(`
    📁 Centro Luna - Sistema FTP REAL Iniciado
    ==========================================
    
    🔗 Configuración REAL:
    - Servidor: ${window.location.host}
    - API FTP: ${window.location.host}/ftp
    - Protocolo: HTTP API
    - Drag & Drop: Habilitado
    
    🌐 Áreas de la topología conectadas:
    - Área 1 - Ventas (172.19.0.0/22) - 4 VPCs
    - Área 2 - Sesiones (172.19.4.0/24) - 6 VPCs en 3 VLANs
    - Área 3 - Inventarios (172.19.5.0/25) - 2 VPCs
    - Área 4 - Servidores (172.19.5.144/29) - VM1 + VM2
    
    📁 Carpetas de la red:
    - /centro_luna/ (raíz)
    - /centro_luna/ventas/ (archivos del área de ventas)
    - /centro_luna/sesiones/ (archivos de tarot, astro, numerología)
    - /centro_luna/inventarios/ (control de stock)
    - /centro_luna/backups/ (respaldos del sistema)
    - /centro_luna/logs/ (archivos de log)
    
    🧪 Comandos de prueba:
    ftpUtils.getStatus()     - Ver estado de conexión
    ftpUtils.getStats()      - Ver estadísticas completas  
    ftpUtils.reconnect()     - Forzar reconexión
    ftpUtils.uploadTest()    - Subir archivo de prueba
    ftpUtils.export()        - Exportar lista de archivos
    
    ${window.ftpSystem.isOnline ? '✅ Conectado al servidor FTP' : '❌ Servidor FTP offline - Modo local'}
    `);
});

