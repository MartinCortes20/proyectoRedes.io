// // Centro Luna - FTP System
// // Equipo 3: Carmona Viana Israel • Cortes Buendia Martin

// class FTPSystem {
//     constructor() {
//         this.files = [];
//         this.transfers = [];
//         this.currentFolder = 'root';
//         this.areas = ['ventas', 'sesiones', 'inventarios', 'servidores'];
//         this.fileTypes = {
//             'txt': { icon: '📄', color: '#007bff' },
//             'pdf': { icon: '📕', color: '#dc3545' },
//             'csv': { icon: '📊', color: '#28a745' },
//             'json': { icon: '📋', color: '#ffc107' },
//             'log': { icon: '📝', color: '#6c757d' },
//             'zip': { icon: '🗜️', color: '#6f42c1' },
//             'img': { icon: '🖼️', color: '#e83e8c' }
//         };
        
//         this.init();
//     }

//     init() {
//         this.loadData();
//         this.setupEventListeners();
//         this.updateStats();
//         this.displayFiles();
//         this.generateSampleFiles();
//         this.setupDragAndDrop();
//         this.startAutoRefresh();
//     }

//     loadData() {
//         const storedFiles = localStorage.getItem('centroLunaFiles');
//         const storedTransfers = localStorage.getItem('centroLunaTransfers');
        
//         if (storedFiles) {
//             this.files = JSON.parse(storedFiles);
//         }
        
//         if (storedTransfers) {
//             this.transfers = JSON.parse(storedTransfers);
//         }
//     }

//     saveData() {
//         localStorage.setItem('centroLunaFiles', JSON.stringify(this.files));
//         localStorage.setItem('centroLunaTransfers', JSON.stringify(this.transfers));
//     }

//     setupEventListeners() {
//         // Botones principales
//         document.getElementById('refreshFiles').addEventListener('click', () => {
//             this.refreshFiles();
//         });

//         document.getElementById('uploadFile').addEventListener('click', () => {
//             document.getElementById('fileInput').click();
//         });

//         document.getElementById('createFolder').addEventListener('click', () => {
//             this.createFolder();
//         });

//         document.getElementById('selectFiles').addEventListener('click', () => {
//             document.getElementById('fileInput').click();
//         });

//         // Input de archivos
//         document.getElementById('fileInput').addEventListener('change', (e) => {
//             this.handleFileUpload(e.target.files);
//         });

//         // Filtros
//         document.getElementById('fileTypeFilter').addEventListener('change', () => {
//             this.displayFiles();
//         });

//         document.getElementById('areaSourceFilter').addEventListener('change', () => {
//             this.displayFiles();
//         });

//         // Vista
//         document.getElementById('listView').addEventListener('click', () => {
//             this.setView('list');
//         });

//         document.getElementById('gridView').addEventListener('click', () => {
//             this.setView('grid');
//         });

//         // Navegación de carpetas
//         document.querySelectorAll('.folder-item').forEach(item => {
//             item.addEventListener('click', () => {
//                 this.navigateToFolder(item.dataset.folder);
//             });
//         });
//     }

//     setupDragAndDrop() {
//         const uploadArea = document.getElementById('uploadArea');
        
//         uploadArea.addEventListener('dragover', (e) => {
//             e.preventDefault();
//             uploadArea.classList.add('dragover');
//         });

//         uploadArea.addEventListener('dragleave', (e) => {
//             e.preventDefault();
//             uploadArea.classList.remove('dragover');
//         });

//         uploadArea.addEventListener('drop', (e) => {
//             e.preventDefault();
//             uploadArea.classList.remove('dragover');
//             this.handleFileUpload(e.dataTransfer.files);
//         });

//         uploadArea.addEventListener('click', () => {
//             document.getElementById('fileInput').click();
//         });
//     }

//     refreshFiles() {
//         this.loadData();
//         this.updateStats();
//         this.displayFiles();
//         this.displayTransfers();
//         this.showNotification('Archivos actualizados', 'success');
//     }

//     createFolder() {
//         const folderName = prompt('Nombre de la nueva carpeta:');
//         if (folderName && folderName.trim()) {
//             const folder = {
//                 id: Date.now(),
//                 name: folderName.trim(),
//                 type: 'folder',
//                 size: 0,
//                 source: 'manual',
//                 folder: this.currentFolder,
//                 dateCreated: new Date().toISOString(),
//                 dateModified: new Date().toISOString()
//             };
            
//             this.files.push(folder);
//             this.saveData();
//             this.updateStats();
//             this.displayFiles();
//             this.logTransfer('CREATE', `Carpeta '${folderName}' creada`);
//             this.showNotification(`Carpeta '${folderName}' creada`, 'success');
//         }
//     }

//     handleFileUpload(files) {
//         if (files.length === 0) return;

//         const destination = document.getElementById('uploadDestination').value;
        
//         Array.from(files).forEach(file => {
//             const fileObj = {
//                 id: Date.now() + Math.random(),
//                 name: file.name,
//                 type: this.getFileType(file.name),
//                 size: file.size,
//                 source: destination,
//                 folder: this.currentFolder,
//                 dateCreated: new Date().toISOString(),
//                 dateModified: new Date().toISOString()
//             };
            
//             this.files.push(fileObj);
//             this.logTransfer('UPLOAD', `${file.name} subido a ${destination}`);
//         });

//         this.saveData();
//         this.updateStats();
//         this.displayFiles();
//         this.showNotification(`${files.length} archivo(s) subido(s)`, 'success');
        
//         // Reset input
//         document.getElementById('fileInput').value = '';
//     }

//     downloadFile(fileId) {
//         const file = this.files.find(f => f.id === fileId);
//         if (file) {
//             this.logTransfer('DOWNLOAD', `${file.name} descargado`);
//             this.showNotification(`Descargando ${file.name}`, 'info');
            
//             // Simular descarga
//             setTimeout(() => {
//                 this.showNotification(`${file.name} descargado exitosamente`, 'success');
//             }, 1000);
//         }
//     }

//     deleteFile(fileId) {
//         const file = this.files.find(f => f.id === fileId);
//         if (file && confirm(`¿Eliminar ${file.name}?`)) {
//             this.files = this.files.filter(f => f.id !== fileId);
//             this.saveData();
//             this.updateStats();
//             this.displayFiles();
//             this.logTransfer('DELETE', `${file.name} eliminado`);
//             this.showNotification(`${file.name} eliminado`, 'warning');
//         }
//     }

//     getFileType(filename) {
//         const extension = filename.split('.').pop().toLowerCase();
//         const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg'];
        
//         if (imageExts.includes(extension)) {
//             return 'img';
//         }
        
//         return this.fileTypes[extension] ? extension : 'txt';
//     }

//     formatFileSize(bytes) {
//         if (bytes === 0) return '0 B';
//         const k = 1024;
//         const sizes = ['B', 'KB', 'MB', 'GB'];
//         const i = Math.floor(Math.log(bytes) / Math.log(k));
//         return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
//     }

//     updateStats() {
//         const totalFiles = this.files.filter(f => f.type !== 'folder').length;
//         const totalSize = this.files.reduce((sum, file) => sum + (file.size || 0), 0);
        
//         const today = new Date().toDateString();
//         const transfersToday = this.transfers.filter(transfer => 
//             new Date(transfer.timestamp).toDateString() === today
//         ).length;

//         const lastTransfer = this.transfers.length > 0 ? 
//             this.formatTimestamp(this.transfers[0].timestamp) : '-';

//         // Actualizar UI
//         document.getElementById('totalFiles').textContent = totalFiles;
//         document.getElementById('usedSpace').textContent = this.formatFileSize(totalSize);
//         document.getElementById('transfersToday').textContent = transfersToday;
//         document.getElementById('lastTransfer').textContent = lastTransfer;

//         // Actualizar contadores por área
//         this.areas.forEach(area => {
//             const count = this.files.filter(f => f.source === area && f.type !== 'folder').length;
//             const element = document.getElementById(`${area}-files`);
//             if (element) {
//                 element.textContent = `${count} archivos`;
//             }
//         });
//     }

//     displayFiles() {
//         const typeFilter = document.getElementById('fileTypeFilter').value;
//         const sourceFilter = document.getElementById('areaSourceFilter').value;
//         const filesList = document.getElementById('filesList');

//         let filteredFiles = this.files.filter(file => file.folder === this.currentFolder);

//         if (typeFilter) {
//             filteredFiles = filteredFiles.filter(file => file.type === typeFilter);
//         }

//         if (sourceFilter) {
//             filteredFiles = filteredFiles.filter(file => file.source === sourceFilter);
//         }

//         // Limpiar lista
//         filesList.innerHTML = '';

//         if (filteredFiles.length === 0) {
//             filesList.innerHTML = `
//                 <div class="no-files">
//                     <p>📁 No hay archivos en esta carpeta</p>
//                     <p>Sube archivos para comenzar</p>
//                 </div>
//             `;
//             return;
//         }

//         // Ordenar: carpetas primero, luego archivos por fecha
//         filteredFiles.sort((a, b) => {
//             if (a.type === 'folder' && b.type !== 'folder') return -1;
//             if (a.type !== 'folder' && b.type === 'folder') return 1;
//             return new Date(b.dateModified) - new Date(a.dateModified);
//         });

//         filteredFiles.forEach(file => {
//             const fileElement = this.createFileElement(file);
//             filesList.appendChild(fileElement);
//         });
//     }

//     createFileElement(file) {
//         const fileItem = document.createElement('div');
//         fileItem.className = 'file-item';

//         const isFolder = file.type === 'folder';
//         const fileTypeInfo = this.fileTypes[file.type] || this.fileTypes['txt'];

//         fileItem.innerHTML = `
//             <span class="file-icon">${isFolder ? '📁' : fileTypeInfo.icon}</span>
//             <div class="file-info">
//                 <div class="file-name">${file.name}</div>
//                 <div class="file-details">
//                     ${isFolder ? 'Carpeta' : `${file.type.toUpperCase()} • ${file.source}`}
//                 </div>
//             </div>
//             <span class="file-size">${isFolder ? '-' : this.formatFileSize(file.size)}</span>
//             <span class="file-date">${this.formatTimestamp(file.dateModified)}</span>
//             <div class="file-actions">
//                 ${!isFolder ? `
//                     <button class="file-action-btn" onclick="window.ftpSystem.downloadFile(${file.id})" title="Descargar">
//                         📥
//                     </button>
//                 ` : ''}
//                 <button class="file-action-btn" onclick="window.ftpSystem.deleteFile(${file.id})" title="Eliminar">
//                     🗑️
//                 </button>
//             </div>
//         `;

//         if (isFolder) {
//             fileItem.style.cursor = 'pointer';
//             fileItem.addEventListener('dblclick', () => {
//                 this.navigateToFolder(file.name);
//             });
//         }

//         return fileItem;
//     }

//     navigateToFolder(folder) {
//         this.currentFolder = folder;
        
//         // Actualizar UI de carpetas
//         document.querySelectorAll('.folder-item').forEach(item => {
//             item.classList.remove('active');
//         });
        
//         const targetFolder = document.querySelector(`[data-folder="${folder}"]`);
//         if (targetFolder) {
//             targetFolder.classList.add('active');
//         }

//         // Actualizar path
//         const pathMap = {
//             'root': '/centro_luna/',
//             'ventas': '/centro_luna/ventas/',
//             'sesiones': '/centro_luna/sesiones/',
//             'inventarios': '/centro_luna/inventarios/',
//             'backups': '/centro_luna/backups/',
//             'logs': '/centro_luna/logs/'
//         };
        
//         document.getElementById('currentPath').textContent = pathMap[folder] || '/centro_luna/';
        
//         this.displayFiles();
//     }

//     setView(viewType) {
//         document.querySelectorAll('.view-btn').forEach(btn => {
//             btn.classList.remove('active');
//         });
        
//         document.getElementById(`${viewType}View`).classList.add('active');
        
//         // Aquí podrías cambiar el estilo de visualización
//         // Por simplicidad, mantenemos la vista de lista
//     }

//     logTransfer(type, description) {
//         const transfer = {
//             id: Date.now(),
//             type: type,
//             description: description,
//             timestamp: new Date().toISOString(),
//             status: 'completado'
//         };
        
//         this.transfers.unshift(transfer);
        
//         // Mantener solo las últimas 50 transferencias
//         if (this.transfers.length > 50) {
//             this.transfers = this.transfers.slice(0, 50);
//         }
        
//         this.saveData();
//         this.displayTransfers();
        
//         // Log en SYSLOG también
//         if (window.centroLuna) {
//             window.centroLuna.logActivity('FTP', description);
//         }
//     }

//     displayTransfers() {
//         const transfersList = document.getElementById('transfersList');
        
//         if (this.transfers.length === 0) {
//             transfersList.innerHTML = `
//                 <div class="no-transfers">
//                     <p>📊 No hay transferencias registradas</p>
//                 </div>
//             `;
//             return;
//         }

//         transfersList.innerHTML = '';
        
//         this.transfers.slice(0, 10).forEach(transfer => {
//             const transferItem = document.createElement('div');
//             transferItem.className = 'transfer-item';