/**
 * ========================================
 * CENTRO MÍSTICO LUNA LLENA - CHARTS
 * Configuración de Gráficos con Chart.js
 * ========================================
 */

// ========================================
// CONFIGURACIÓN GLOBAL DE CHART.JS
// ========================================

Chart.defaults.color = '#fff';
Chart.defaults.font.family = 'Arial, sans-serif';

const CHART_COLORS = {
    primary: 'rgba(255, 215, 0, 0.8)',
    secondary: 'rgba(138, 43, 226, 0.8)',
    tertiary: 'rgba(0, 191, 255, 0.8)',
    quaternary: 'rgba(255, 69, 0, 0.8)',
    success: 'rgba(81, 207, 102, 0.8)',
    warning: 'rgba(255, 215, 0, 0.8)',
    danger: 'rgba(255, 107, 107, 0.8)',
    info: 'rgba(0, 191, 255, 0.8)',
    mystic: 'rgba(255, 20, 147, 0.8)'
};

const CHART_BORDERS = {
    primary: 'rgba(255, 215, 0, 1)',
    secondary: 'rgba(138, 43, 226, 1)',
    tertiary: 'rgba(0, 191, 255, 1)',
    quaternary: 'rgba(255, 69, 0, 1)',
    success: 'rgba(81, 207, 102, 1)',
    warning: 'rgba(255, 215, 0, 1)',
    danger: 'rgba(255, 107, 107, 1)',
    info: 'rgba(0, 191, 255, 1)',
    mystic: 'rgba(255, 20, 147, 1)'
};

// ========================================
// DATOS DE LOS GRÁFICOS
// ========================================

const CHART_DATA = {
    consultas: {
        labels: ['Tarotistas', 'Videntes', 'Terapeutas', 'VIP'],
        data: [15, 12, 8, 3]
    },
    ventas: {
        labels: ['Cristales', 'Veladoras', 'Libros', 'Inciensos', 'Amuletos'],
        data: [35, 25, 15, 15, 10]
    },
    temporada: {
        labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
        data: [120, 190, 150, 180, 200, 250]
    }
};

// ========================================
// INSTANCIAS DE GRÁFICOS
// ========================================

let chartInstances = {};

// ========================================
// INICIALIZACIÓN DE GRÁFICOS
// ========================================

function initCharts() {
    initConsultasChart();
    initVentasChart();
    initTemporadaChart();
}

// ========================================
// GRÁFICO DE CONSULTAS POR ESPECIALISTA
// ========================================

function initConsultasChart() {
    const ctx = document.getElementById('consultasChart');
    if (!ctx) return;
    
    // Destruir gráfico existente si existe
    if (chartInstances.consultas) {
        chartInstances.consultas.destroy();
    }
    
    chartInstances.consultas = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: CHART_DATA.consultas.labels,
            datasets: [{
                label: 'Consultas del Día',
                data: CHART_DATA.consultas.data,
                backgroundColor: [
                    CHART_COLORS.primary,
                    CHART_COLORS.secondary,
                    CHART_COLORS.tertiary,
                    CHART_COLORS.quaternary
                ],
                borderColor: [
                    CHART_BORDERS.primary,
                    CHART_BORDERS.secondary,
                    CHART_BORDERS.tertiary,
                    CHART_BORDERS.quaternary
                ],
                borderWidth: 2,
                borderRadius: 8,
                borderSkipped: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    labels: {
                        color: '#fff',
                        font: {
                            size: 14
                        }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#ffd700',
                    bodyColor: '#fff',
                    borderColor: '#ffd700',
                    borderWidth: 1
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: '#fff'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                y: {
                    ticks: {
                        color: '#fff'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    beginAtZero: true
                }
            },
            animation: {
                duration: 1000,
                easing: 'easeInOutQuart'
            }
        }
    });
}

// ========================================
// GRÁFICO DE VENTAS POR CATEGORÍA
// ========================================

function initVentasChart() {
    const ctx = document.getElementById('ventasChart');
    if (!ctx) return;
    
    // Destruir gráfico existente si existe
    if (chartInstances.ventas) {
        chartInstances.ventas.destroy();
    }
    
    chartInstances.ventas = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: CHART_DATA.ventas.labels,
            datasets: [{
                data: CHART_DATA.ventas.data,
                backgroundColor: [
                    CHART_COLORS.primary,
                    CHART_COLORS.quaternary,
                    CHART_COLORS.secondary,
                    CHART_COLORS.tertiary,
                    CHART_COLORS.mystic
                ],
                borderColor: [
                    CHART_BORDERS.primary,
                    CHART_BORDERS.quaternary,
                    CHART_BORDERS.secondary,
                    CHART_BORDERS.tertiary,
                    CHART_BORDERS.mystic
                ],
                borderWidth: 2,
                hoverBorderWidth: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        color: '#fff',
                        font: {
                            size: 12
                        },
                        usePointStyle: true,
                        padding: 15
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#ffd700',
                    bodyColor: '#fff',
                    borderColor: '#ffd700',
                    borderWidth: 1,
                    callbacks: {
                        label: function(context) {
                            const total = context.dataset.data.reduce((sum, value) => sum + value, 0);
                            const percentage = ((context.parsed / total) * 100).toFixed(1);
                            return `${context.label}: ${context.parsed}% (${percentage}%)`;
                        }
                    }
                }
            },
            animation: {
                animateRotate: true,
                animateScale: true,
                duration: 1500
            },
            cutout: '50%'
        }
    });
}

// ========================================
// GRÁFICO DE TEMPORADA
// ========================================

function initTemporadaChart() {
    const ctx = document.getElementById('temporadaChart');
    if (!ctx) return;
    
    // Destruir gráfico existente si existe
    if (chartInstances.temporada) {
        chartInstances.temporada.destroy();
    }
    
    chartInstances.temporada = new Chart(ctx, {
        type: 'line',
        data: {
            labels: CHART_DATA.temporada.labels,
            datasets: [{
                label: 'Ventas por Mes (Miles MXN)',
                data: CHART_DATA.temporada.data,
                borderColor: CHART_BORDERS.primary,
                backgroundColor: CHART_COLORS.primary,
                tension: 0.4,
                borderWidth: 3,
                pointBackgroundColor: CHART_BORDERS.primary,
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 6,
                pointHoverRadius: 8,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: '#fff',
                        font: {
                            size: 14
                        }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#ffd700',
                    bodyColor: '#fff',
                    borderColor: '#ffd700',
                    borderWidth: 1,
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: $${context.parsed.y.toLocaleString()} MXN`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: '#fff'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                y: {
                    ticks: {
                        color: '#fff',
                        callback: function(value) {
                            return '$' + value + 'K';
                        }
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    beginAtZero: true
                }
            },
            animation: {
                duration: 2000,
                easing: 'easeInOutQuart'
            }
        }
    });
}

// ========================================
// ACTUALIZACIÓN DE DATOS
// ========================================

function actualizarDatosConsultas(nuevos_datos) {
    if (chartInstances.consultas) {
        chartInstances.consultas.data.datasets[0].data = nuevos_datos;
        chartInstances.consultas.update('smooth');
    }
}

function actualizarDatosVentas(nuevos_datos) {
    if (chartInstances.ventas) {
        chartInstances.ventas.data.datasets[0].data = nuevos_datos;
        chartInstances.ventas.update('smooth');
    }
}

function actualizarDatosTemporada(nuevos_datos) {
    if (chartInstances.temporada) {
        chartInstances.temporada.data.datasets[0].data = nuevos_datos;
        chartInstances.temporada.update('smooth');
    }
}

// ========================================
// SIMULACIÓN DE DATOS EN TIEMPO REAL
// ========================================

function simularActualizacionGraficos() {
    // Actualizar datos de consultas con variaciones pequeñas
    const nuevasConsultas = CHART_DATA.consultas.data.map(valor => 
        Math.max(0, valor + Math.floor(Math.random() * 6) - 3)
    );
    
    // Actualizar datos de ventas con cambios menores
    const nuevasVentas = CHART_DATA.ventas.data.map(valor => 
        Math.max(5, valor + Math.floor(Math.random() * 10) - 5)
    );
    
    // Actualizar datos de temporada (agregar nuevo mes)
    if (CHART_DATA.temporada.data.length < 12) {
        const ultimoValor = CHART_DATA.temporada.data[CHART_DATA.temporada.data.length - 1];
        const nuevoValor = Math.max(100, ultimoValor + Math.floor(Math.random() * 100) - 50);
        CHART_DATA.temporada.data.push(nuevoValor);
        
        const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        if (CHART_DATA.temporada.labels.length < 12) {
            CHART_DATA.temporada.labels.push(meses[CHART_DATA.temporada.labels.length]);
        }
    }
    
    // Aplicar actualizaciones
    actualizarDatosConsultas(nuevasConsultas);
    actualizarDatosVentas(nuevasVentas);
    actualizarDatosTemporada(CHART_DATA.temporada.data);
    
    // Actualizar datos originales para la próxima iteración
    CHART_DATA.consultas.data = nuevasConsultas;
    CHART_DATA.ventas.data = nuevasVentas;
}

// ========================================
// GRÁFICOS ADICIONALES PARA OTROS MÓDULOS
// ========================================

function crearGraficoPersonalizado(canvasId, tipo, datos, opciones = {}) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return null;
    
    const opcionesDefault = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                labels: {
                    color: '#fff'
                }
            }
        },
        scales: {
            x: {
                ticks: { color: '#fff' },
                grid: { color: 'rgba(255, 255, 255, 0.1)' }
            },
            y: {
                ticks: { color: '#fff' },
                grid: { color: 'rgba(255, 255, 255, 0.1)' }
            }
        }
    };
    
    const opcionesFinal = { ...opcionesDefault, ...opciones };
    
    return new Chart(ctx, {
        type: tipo,
        data: datos,
        options: opcionesFinal
    });
}

// ========================================
// EXPORT DE GRÁFICOS
// ========================================

function exportarGrafico(chartId, formato = 'png') {
    const chart = chartInstances[chartId];
    if (!chart) {
        console.error(`Gráfico ${chartId} no encontrado`);
        return null;
    }
    
    const url = chart.toBase64Image(formato, 1.0);
    const nombreArchivo = `grafico_${chartId}_${new Date().toISOString().split('T')[0]}.${formato}`;
    
    // Simular descarga
    if (window.CentroMistico && window.CentroMistico.showNotification) {
        window.CentroMistico.showNotification(
            `Gráfico exportado como ${nombreArchivo}`,
            'success'
        );
    }
    
    return { url, nombreArchivo };
}

// ========================================
// RESIZE HANDLER
// ========================================

function redimensionarGraficos() {
    Object.values(chartInstances).forEach(chart => {
        if (chart && typeof chart.resize === 'function') {
            chart.resize();
        }
    });
}

// ========================================
// DESTRUIR GRÁFICOS
// ========================================

function destruirGraficos() {
    Object.keys(chartInstances).forEach(key => {
        if (chartInstances[key]) {
            chartInstances[key].destroy();
            delete chartInstances[key];
        }
    });
}

// ========================================
// ANIMACIONES PERSONALIZADAS
// ========================================

const ANIMACIONES_PERSONALIZADAS = {
    aparicionSuave: {
        duration: 2000,
        easing: 'easeInOutQuart',
        delay: (context) => context.dataIndex * 100
    },
    
    rebote: {
        duration: 1500,
        easing: 'easeInOutBounce'
    },
    
    rotacion: {
        animateRotate: true,
        duration: 2000,
        easing: 'easeInOutElastic'
    }
};

// ========================================
// AUTO-ACTUALIZACIÓN
// ========================================

let chartsInterval;

function iniciarActualizacionGraficos() {
    chartsInterval = setInterval(() => {
        simularActualizacionGraficos();
    }, 60000); // Cada minuto
}

function detenerActualizacionGraficos() {
    if (chartsInterval) {
        clearInterval(chartsInterval);
        chartsInterval = null;
    }
}

// ========================================
// EVENT LISTENERS
// ========================================

window.addEventListener('resize', () => {
    setTimeout(redimensionarGraficos, 100);
});

document.addEventListener('DOMContentLoaded', function() {
    // Delay para asegurar que el DOM esté completamente cargado
    setTimeout(() => {
        initCharts();
        iniciarActualizacionGraficos();
    }, 500);
});

// Limpiar al salir
window.addEventListener('beforeunload', function() {
    destruirGraficos();
    detenerActualizacionGraficos();
});

// ========================================
// EXPORT
// ========================================

window.ChartsModule = {
    initCharts,
    actualizarDatosConsultas,
    actualizarDatosVentas,
    actualizarDatosTemporada,
    simularActualizacionGraficos,
    crearGraficoPersonalizado,
    exportarGrafico,
    redimensionarGraficos,
    destruirGraficos,
    iniciarActualizacionGraficos,
    detenerActualizacionGraficos,
    obtenerInstancias: () => chartInstances,
    obtenerDatos: () => CHART_DATA,
    colores: CHART_COLORS,
    animaciones: ANIMACIONES_PERSONALIZADAS
};