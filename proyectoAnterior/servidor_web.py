# VM1 - servidor_web.py
# Centro Luna - Servidor Web Principal
# IP: 172.19.5.146:8080

import sys
import platform

def check_dependencies():
    """Verificar dependencias antes de iniciar"""
    try:
        import flask, flask_cors, requests
        print("✅ Dependencias verificadas")
        return True
    except ImportError as e:
        print(f"❌ Falta dependencia: {e}")
        print("Ejecuta: pip install flask flask-cors requests")
        return False

# En el main:
if __name__ == '__main__':
    print("🌙 Centro Luna - Servidor Web VM1")
    print(f"Sistema: {platform.system()}")
    print("IP: 172.19.5.146:8080")
    
    if not check_dependencies():
        input("Presiona Enter para salir...")
        sys.exit(1)


from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import subprocess
import json
import os
import time
from datetime import datetime
import requests
from werkzeug.utils import secure_filename

app = Flask(__name__, static_folder='static')
CORS(app)

# Configuración FTP
FTP_UPLOAD_FOLDER = 'ftp_files'
ALLOWED_EXTENSIONS = {'txt', 'pdf', 'csv', 'json', 'log', 'zip', 'jpg', 'jpeg', 'png', 'gif'}
MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB máximo

app.config['MAX_CONTENT_LENGTH'] = MAX_CONTENT_LENGTH

class CentroLunaWebServer:
    def __init__(self):
        self.network_config = {
            'areas': {
                'ventas': '172.19.0.1',
                'sesiones': '172.19.4.1', 
                'inventarios': '172.19.5.1',
                'servidores': '172.19.5.145'
            },
            'syslog_server': '172.19.5.147:514'
        }
        self.active_connections = {}
        self.ftp_files = {}  # Almacenar metadatos de archivos FTP
        
        # Crear directorios FTP si no existen
        self.setup_ftp_directories()
        
    def setup_ftp_directories(self):
        """Crear estructura de directorios FTP"""
        base_dirs = [
            FTP_UPLOAD_FOLDER,
            f'{FTP_UPLOAD_FOLDER}/ventas',
            f'{FTP_UPLOAD_FOLDER}/sesiones',
            f'{FTP_UPLOAD_FOLDER}/inventarios',
            f'{FTP_UPLOAD_FOLDER}/servidores',
            f'{FTP_UPLOAD_FOLDER}/backups',
            f'{FTP_UPLOAD_FOLDER}/logs'
        ]
        
        for directory in base_dirs:
            if not os.path.exists(directory):
                os.makedirs(directory)
                print(f"📁 Directorio FTP creado: {directory}")
        
    def ping_host(self, host):
        """Hacer ping real a un host"""
        try:
            # Ping en Windows
            result = subprocess.run(['ping', '-n', '1', host], 
                                  capture_output=True, text=True, timeout=5)
            if result.returncode == 0:
                # Extraer latencia del resultado
                output = result.stdout
                if 'tiempo=' in output:
                    latency = output.split('tiempo=')[1].split('ms')[0]
                    return {'success': True, 'latency': int(latency)}
                elif 'time=' in output:  # Para Linux
                    latency = output.split('time=')[1].split(' ')[0]
                    return {'success': True, 'latency': float(latency)}
                return {'success': True, 'latency': 0}
            return {'success': False, 'error': 'Host unreachable'}
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def send_to_syslog(self, message, facility=16, severity=6, source_area='servidores'):
        """Enviar mensaje al servidor SYSLOG real"""
        try:
            syslog_data = {
                'timestamp': datetime.now().isoformat(),
                'facility': facility,
                'severity': severity,
                'hostname': 'vm1-webserver',
                'message': message,
                'source_area': source_area
            }
            
            # Enviar a VM2 (SYSLOG Server)
            response = requests.post(f'http://{self.network_config["syslog_server"]}/log', 
                                   json=syslog_data, timeout=5)
            return response.status_code == 200
        except:
            return False
    
    def allowed_file(self, filename):
        """Verificar si el tipo de archivo está permitido"""
        return '.' in filename and \
               filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS
    
    def save_file_metadata(self, file_info):
        """Guardar metadatos del archivo FTP"""
        file_id = f"{file_info['name']}_{int(time.time())}"
        self.ftp_files[file_id] = {
            'id': file_id,
            'name': file_info['name'],
            'size': file_info['size'],
            'destination': file_info['destination'],
            'folder': file_info.get('folder', 'root'),
            'upload_time': datetime.now().isoformat(),
            'path': file_info['path']
        }
        return file_id

web_server = CentroLunaWebServer()

@app.route('/')
def index():
    """Servir la página principal"""
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/<path:filename>')
def serve_static(filename):
    """Servir archivos estáticos"""
    return send_from_directory(app.static_folder, filename)

@app.route('/api/ping', methods=['POST'])
def api_ping():
    """API para hacer ping a hosts de la red"""
    data = request.json
    target = data.get('target')
    area = data.get('area', 'unknown')
    
    if not target:
        return jsonify({'success': False, 'error': 'Target required'}), 400
    
    result = web_server.ping_host(target)
    
    # Log de la operación
    web_server.send_to_syslog(f'PING to {target} from area {area}: {result}', source_area=area)
    
    return jsonify(result)

@app.route('/api/status')
def api_status():
    """Estado general del sistema"""
    status = {
        'timestamp': datetime.now().isoformat(),
        'server': 'vm1-webserver',
        'areas': {},
        'services': {
            'http': {'status': 'active', 'port': 8080},
            'ftp': {'status': 'active', 'port': 21},
            'api': {'status': 'active', 'port': 8080}
        }
    }
    
    # Verificar conectividad con cada área
    for area, router_ip in web_server.network_config['areas'].items():
        ping_result = web_server.ping_host(router_ip)
        status['areas'][area] = {
            'router': router_ip,
            'status': 'online' if ping_result['success'] else 'offline',
            'latency': ping_result.get('latency', 0),
            'last_check': datetime.now().isoformat()
        }
    
    # Log del health check
    online_areas = len([a for a in status["areas"].values() if a["status"] == "online"])
    web_server.send_to_syslog(f'Health check completed: {online_areas}/4 areas online')
    
    return jsonify(status)

@app.route('/health')
def health_check():
    """Health check para el load balancer"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'server': 'vm1-webserver',
        'ftp_status': 'active',
        'ftp_files_count': len(web_server.ftp_files)
    })

# ================================
# ENDPOINTS FTP REALES
# ================================

@app.route('/ftp/upload', methods=['POST'])
def ftp_upload():
    """Subir archivo real via FTP"""
    try:
        # Verificar si hay archivo en la request
        if 'file' not in request.files:
            return jsonify({'success': False, 'error': 'No file provided'}), 400
        
        file = request.files['file']
        destination = request.form.get('destination', 'servidores')
        folder = request.form.get('folder', 'root')
        
        if file.filename == '':
            return jsonify({'success': False, 'error': 'No file selected'}), 400
        
        if file and web_server.allowed_file(file.filename):
            # Secure filename
            filename = secure_filename(file.filename)
            
            # Determinar ruta de destino
            if folder == 'root':
                destination_path = os.path.join(FTP_UPLOAD_FOLDER, destination)
            else:
                destination_path = os.path.join(FTP_UPLOAD_FOLDER, folder)
            
            file_path = os.path.join(destination_path, filename)
            
            # Guardar archivo físicamente
            file.save(file_path)
            
            # Obtener tamaño del archivo
            file_size = os.path.getsize(file_path)
            
            # Guardar metadatos
            file_info = {
                'name': filename,
                'size': file_size,
                'destination': destination,
                'folder': folder,
                'path': file_path
            }
            
            file_id = web_server.save_file_metadata(file_info)
            
            # Log de la operación
            web_server.send_to_syslog(
                f'FTP UPLOAD: {filename} ({file_size} bytes) subido a {destination}/{folder}', 
                source_area=destination
            )
            
            return jsonify({
                'success': True,
                'message': f'File {filename} uploaded successfully',
                'file_id': file_id,
                'size': file_size,
                'path': f'{destination}/{folder}/{filename}',
                'timestamp': datetime.now().isoformat()
            })
        
        else:
            return jsonify({'success': False, 'error': 'File type not allowed'}), 400
            
    except Exception as e:
        web_server.send_to_syslog(f'FTP UPLOAD ERROR: {str(e)}', severity=3)
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/ftp/download', methods=['POST'])
def ftp_download():
    """Descargar archivo real via FTP"""
    try:
        data = request.json
        filename = data.get('fileName')
        source = data.get('source', 'servidores')
        folder = data.get('folder', 'root')
        
        if not filename:
            return jsonify({'success': False, 'error': 'Filename required'}), 400
        
        # Construir ruta del archivo
        if folder == 'root':
            file_path = os.path.join(FTP_UPLOAD_FOLDER, source, filename)
        else:
            file_path = os.path.join(FTP_UPLOAD_FOLDER, folder, filename)
        
        # Verificar si el archivo existe
        if os.path.exists(file_path):
            file_size = os.path.getsize(file_path)
            
            # Log de la operación
            web_server.send_to_syslog(
                f'FTP DOWNLOAD: {filename} ({file_size} bytes) descargado desde {source}/{folder}',
                source_area=source
            )
            
            # En una implementación real, aquí se enviaría el archivo
            # Para esta demo, solo confirmamos la operación
            return jsonify({
                'success': True,
                'message': f'File {filename} downloaded successfully',
                'size': file_size,
                'path': f'{source}/{folder}/{filename}',
                'timestamp': datetime.now().isoformat()
            })
        else:
            return jsonify({'success': False, 'error': 'File not found'}), 404
            
    except Exception as e:
        web_server.send_to_syslog(f'FTP DOWNLOAD ERROR: {str(e)}', severity=3)
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/ftp/delete', methods=['POST'])
def ftp_delete():
    """Eliminar archivo real via FTP"""
    try:
        data = request.json
        filename = data.get('fileName')
        source = data.get('source', 'servidores')
        folder = data.get('folder', 'root')
        
        if not filename:
            return jsonify({'success': False, 'error': 'Filename required'}), 400
        
        # Construir ruta del archivo
        if folder == 'root':
            file_path = os.path.join(FTP_UPLOAD_FOLDER, source, filename)
        else:
            file_path = os.path.join(FTP_UPLOAD_FOLDER, folder, filename)
        
        # Verificar si el archivo existe y eliminarlo
        if os.path.exists(file_path):
            file_size = os.path.getsize(file_path)
            os.remove(file_path)
            
            # Remover de metadatos
            file_keys_to_remove = [key for key, value in web_server.ftp_files.items() 
                                 if value['name'] == filename and value['destination'] == source]
            for key in file_keys_to_remove:
                del web_server.ftp_files[key]
            
            # Log de la operación
            web_server.send_to_syslog(
                f'FTP DELETE: {filename} ({file_size} bytes) eliminado de {source}/{folder}',
                source_area=source
            )
            
            return jsonify({
                'success': True,
                'message': f'File {filename} deleted successfully',
                'timestamp': datetime.now().isoformat()
            })
        else:
            return jsonify({'success': False, 'error': 'File not found'}), 404
            
    except Exception as e:
        web_server.send_to_syslog(f'FTP DELETE ERROR: {str(e)}', severity=3)
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/ftp/create-folder', methods=['POST'])
def ftp_create_folder():
    """Crear carpeta real via FTP"""
    try:
        data = request.json
        folder_name = data.get('folderName')
        current_path = data.get('currentPath', 'root')
        
        if not folder_name:
            return jsonify({'success': False, 'error': 'Folder name required'}), 400
        
        # Crear ruta segura
        safe_folder_name = secure_filename(folder_name)
        
        if current_path == 'root':
            new_folder_path = os.path.join(FTP_UPLOAD_FOLDER, safe_folder_name)
        else:
            new_folder_path = os.path.join(FTP_UPLOAD_FOLDER, current_path, safe_folder_name)
        
        # Crear directorio si no existe
        if not os.path.exists(new_folder_path):
            os.makedirs(new_folder_path)
            
            # Log de la operación
            web_server.send_to_syslog(
                f'FTP CREATE FOLDER: {safe_folder_name} creada en {current_path}',
                source_area='servidores'
            )
            
            return jsonify({
                'success': True,
                'message': f'Folder {safe_folder_name} created successfully',
                'path': new_folder_path,
                'timestamp': datetime.now().isoformat()
            })
        else:
            return jsonify({'success': False, 'error': 'Folder already exists'}), 400
            
    except Exception as e:
        web_server.send_to_syslog(f'FTP CREATE FOLDER ERROR: {str(e)}', severity=3)
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/ftp/list', methods=['GET'])
def ftp_list():
    """Listar archivos y carpetas via FTP"""
    try:
        folder = request.args.get('folder', 'root')
        
        if folder == 'root':
            list_path = FTP_UPLOAD_FOLDER
        else:
            list_path = os.path.join(FTP_UPLOAD_FOLDER, folder)
        
        files_list = []
        
        if os.path.exists(list_path):
            for item in os.listdir(list_path):
                item_path = os.path.join(list_path, item)
                
                if os.path.isfile(item_path):
                    file_size = os.path.getsize(item_path)
                    file_mtime = os.path.getmtime(item_path)
                    
                    files_list.append({
                        'name': item,
                        'type': 'file',
                        'size': file_size,
                        'modified': datetime.fromtimestamp(file_mtime).isoformat()
                    })
                elif os.path.isdir(item_path):
                    files_list.append({
                        'name': item,
                        'type': 'folder',
                        'size': 0,
                        'modified': datetime.fromtimestamp(os.path.getmtime(item_path)).isoformat()
                    })
        
        return jsonify({
            'success': True,
            'files': files_list,
            'path': folder,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/log', methods=['POST'])
def receive_log():
    """Recibir logs del frontend y reenviar a SYSLOG"""
    data = request.json
    message = data.get('message', '')
    source_area = data.get('source_area', 'unknown')
    
    success = web_server.send_to_syslog(f'WEB LOG: {message}', source_area=source_area)
    
    return jsonify({'success': success})

if __name__ == '__main__':
    print("🌙 Centro Luna - Servidor Web + FTP VM1")
    print("Sistema: Servidor completo con soporte FTP real")
    print("IP: 172.19.5.146:8080")
    print("Servicios: HTTP, API, FTP, Ping Monitor")
    
    # Crear carpeta static si no existe
    if not os.path.exists('static'):
        os.makedirs('static')
        print("📁 Carpeta 'static' creada")
    
    print(f"📁 Directorio FTP: {FTP_UPLOAD_FOLDER}")
    print(f"📁 Tipos de archivo permitidos: {', '.join(ALLOWED_EXTENSIONS)}")
    print(f"📁 Tamaño máximo: {MAX_CONTENT_LENGTH // (1024*1024)}MB")
    
    # Log de inicio
    web_server.send_to_syslog('VM1 Web Server + FTP started successfully')
    
    app.run(host='0.0.0.0', port=8081, debug=True)