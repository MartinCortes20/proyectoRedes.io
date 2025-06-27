# VM2 - servidor_syslog.py  
# Centro Luna - Servidor SYSLOG
# IP: 172.19.5.147
# Puerto SYSLOG UDP: 514
# Puerto HTTP API: 5000

from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os
from datetime import datetime
import threading
import socket

app = Flask(__name__)
CORS(app)

class SyslogServer:
    def __init__(self):
        self.logs = []
        self.max_logs = 1000
        self.log_file = 'centro_luna_syslog.txt'
        
        # Configuración de áreas de red
        self.areas_config = {
            'ventas': {'network': '172.19.0.0/22', 'router': '172.19.0.1'},
            'sesiones': {'network': '172.19.4.0/24', 'router': '172.19.4.1'},
            'inventarios': {'network': '172.19.5.0/25', 'router': '172.19.5.1'},
            'servidores': {'network': '172.19.5.144/29', 'router': '172.19.5.145'}
        }
        
        self.udp_server_running = False
        self.start_udp_server()
    
    def add_log(self, log_entry):
        """Agregar log al sistema"""
        log_entry['id'] = len(self.logs) + 1
        log_entry['received_at'] = datetime.now().isoformat()
        
        self.logs.insert(0, log_entry)
        
        # Mantener solo los últimos N logs
        if len(self.logs) > self.max_logs:
            self.logs = self.logs[:self.max_logs]
        
        # Escribir a archivo
        self.write_to_file(log_entry)
        
        # Imprimir en consola para debug
        print(f"[{log_entry['received_at']}] {log_entry.get('source_area', 'UNKNOWN')}: {log_entry.get('message', '')}")
    
    def write_to_file(self, log_entry):
        """Escribir log a archivo"""
        try:
            with open(self.log_file, 'a', encoding='utf-8') as f:
                log_line = f"{log_entry['received_at']} | {log_entry.get('facility', 16)} | {log_entry.get('severity', 6)} | {log_entry.get('hostname', 'unknown')} | {log_entry.get('source_area', 'unknown')} | {log_entry.get('message', '')}\n"
                f.write(log_line)
        except Exception as e:
            print(f"Error writing to log file: {e}")
    
    def start_udp_server(self):
        """Iniciar servidor UDP para recibir logs SYSLOG reales"""
        def udp_server():
            sock = None
            try:
                sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
                # Permitir reutilizar la dirección
                sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
                
                # Intentar diferentes puertos si 514 está ocupado
                ports_to_try = [514, 1514, 2514]
                bound_port = None
                
                for port in ports_to_try:
                    try:
                        sock.bind(('0.0.0.0', port))
                        bound_port = port
                        print(f"✅ UDP SYSLOG Server listening on port {port}")
                        break
                    except OSError as e:
                        if port == 514:
                            print(f"⚠️  Port 514 occupied, trying alternative port...")
                        continue
                
                if bound_port is None:
                    print("❌ Could not bind to any UDP port")
                    return
                
                self.udp_server_running = True
                
                while True:
                    try:
                        data, addr = sock.recvfrom(1024)
                        message = data.decode('utf-8')
                        
                        # Parsear mensaje SYSLOG RFC3164
                        log_entry = {
                            'timestamp': datetime.now().isoformat(),
                            'facility': 16,
                            'severity': 6,
                            'hostname': addr[0],
                            'source_area': self.determine_area_from_ip(addr[0]),
                            'message': message,
                            'raw_message': message,
                            'source_ip': addr[0]
                        }
                        
                        self.add_log(log_entry)
                        
                    except Exception as e:
                        print(f"UDP Server error: {e}")
                        
            except Exception as e:
                print(f"❌ Error starting UDP server: {e}")
                print("Continuing with HTTP only...")
            finally:
                if sock:
                    sock.close()
        
        thread = threading.Thread(target=udp_server, daemon=True)
        thread.start()
    
    def determine_area_from_ip(self, ip):
        """Determinar área basada en IP"""
        try:
            import ipaddress
            
            client_ip = ipaddress.ip_address(ip)
            
            for area, config in self.areas_config.items():
                network = ipaddress.ip_network(config['network'])
                if client_ip in network:
                    return area
            
            return 'external'
        except:
            return 'unknown'

syslog_server = SyslogServer()

@app.route('/log', methods=['POST'])
def receive_http_log():
    """Recibir logs vía HTTP"""
    data = request.json
    
    if not data:
        return jsonify({'success': False, 'error': 'No data provided'}), 400
    
    # Agregar IP del cliente
    data['source_ip'] = request.remote_addr
    
    # Determinar área si no está especificada
    if 'source_area' not in data:
        data['source_area'] = syslog_server.determine_area_from_ip(request.remote_addr)
    
    syslog_server.add_log(data)
    
    return jsonify({'success': True, 'log_id': len(syslog_server.logs)})

@app.route('/logs', methods=['GET'])
def get_logs():
    """Obtener logs almacenados"""
    area_filter = request.args.get('area')
    service_filter = request.args.get('service') 
    limit = int(request.args.get('limit', 50))
    
    filtered_logs = syslog_server.logs
    
    if area_filter:
        filtered_logs = [log for log in filtered_logs if log.get('source_area') == area_filter]
    
    if service_filter:
        filtered_logs = [log for log in filtered_logs if service_filter.lower() in log.get('message', '').lower()]
    
    return jsonify({
        'success': True,
        'logs': filtered_logs[:limit],
        'total': len(syslog_server.logs),
        'filtered': len(filtered_logs)
    })

@app.route('/stats', methods=['GET'])
def get_stats():
    """Estadísticas del sistema SYSLOG"""
    stats = {
        'total_logs': len(syslog_server.logs),
        'areas': {},
        'last_activity': syslog_server.logs[0]['received_at'] if syslog_server.logs else None,
        'server_info': {
            'hostname': 'vm2-syslog',
            'ip': '172.19.5.147',
            'udp_port': 514,
            'http_port': 5000,
            'protocol': 'UDP/HTTP',
            'udp_running': syslog_server.udp_server_running
        }
    }
    
    # Contar logs por área
    for log in syslog_server.logs:
        area = log.get('source_area', 'unknown')
        stats['areas'][area] = stats['areas'].get(area, 0) + 1
    
    return jsonify(stats)

@app.route('/health')
def health_check():
    """Health check del servidor SYSLOG"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'server': 'vm2-syslog',
        'logs_count': len(syslog_server.logs),
        'udp_server_running': syslog_server.udp_server_running
    })

@app.route('/clear', methods=['POST'])
def clear_logs():
    """Limpiar logs (solo para testing)"""
    syslog_server.logs = []
    return jsonify({'success': True, 'message': 'Logs cleared'})

@app.route('/')
def index():
    """Página de información del servidor"""
    return jsonify({
        'server': 'Centro Luna SYSLOG Server VM2',
        'ip': '172.19.5.147',
        'endpoints': {
            '/logs': 'GET - Obtener logs',
            '/log': 'POST - Enviar log',
            '/stats': 'GET - Estadísticas',
            '/health': 'GET - Health check',
            '/clear': 'POST - Limpiar logs'
        },
        'udp_running': syslog_server.udp_server_running
    })

if __name__ == '__main__':
    print("📝 Centro Luna - Servidor SYSLOG VM2")
    print("IP: 172.19.5.147")
    print("HTTP API Port: 5000")
    print("UDP SYSLOG Port: 514 (or alternative if occupied)")
    print("Log file: centro_luna_syslog.txt")
    
    # Log de inicio
    syslog_server.add_log({
        'timestamp': datetime.now().isoformat(),
        'facility': 16,
        'severity': 6,
        'hostname': 'vm2-syslog',
        'source_area': 'servidores',
        'message': 'SYSLOG Server VM2 started successfully'
    })
    
    # Ejecutar Flask en puerto 5000, NO en 514
    app.run(host='0.0.0.0', port=5000, debug=False)