const API_URL = 'http://localhost:3000/api';

let tareas = [];
let categorias = [];
let tareaEditando = null;

// Inicializar la aplicación
document.addEventListener('DOMContentLoaded', () => {
    cargarCategorias();
    cargarEstadisticas();
    cargarTareas();
});

// ============= FUNCIONES DE CARGA =============

async function cargarTareas(filtros = {}) {
    try {
        const params = new URLSearchParams(filtros);
        const response = await fetch(`${API_URL}/tareas?${params}`);
        const data = await response.json();
        tareas = data.tareas;
        renderizarTareas();
    } catch (error) {
        console.error('Error al cargar tareas:', error);
        mostrarError('Error al cargar las tareas');
    }
}

async function cargarEstadisticas() {
    try {
        const response = await fetch(`${API_URL}/estadisticas`);
        const data = await response.json();

        document.getElementById('total-tareas').textContent = data.total;

        // Actualizar estadísticas por estado
        const estadoPendiente = data.por_estado.find(e => e.estado === 'Pendiente');
        const estadoEnProgreso = data.por_estado.find(e => e.estado === 'En Progreso');
        const estadoCompletada = data.por_estado.find(e => e.estado === 'Completada');

        document.getElementById('pendientes').textContent = estadoPendiente ? estadoPendiente.count : 0;
        document.getElementById('en-progreso').textContent = estadoEnProgreso ? estadoEnProgreso.count : 0;
        document.getElementById('completadas').textContent = estadoCompletada ? estadoCompletada.count : 0;

        // Actualizar progreso promedio
        const progreso = data.progreso_promedio;
        document.getElementById('progreso-promedio').style.width = `${progreso}%`;
        document.getElementById('progreso-numero').textContent = `${progreso}%`;
    } catch (error) {
        console.error('Error al cargar estadísticas:', error);
    }
}

async function cargarCategorias() {
    try {
        const response = await fetch(`${API_URL}/categorias`);
        const data = await response.json();
        categorias = data.categorias;

        // Actualizar selects de categoría
        const selectCategoria = document.getElementById('categoria');
        const filtroCategoria = document.getElementById('filtro-categoria');

        categorias.forEach(cat => {
            const option1 = document.createElement('option');
            option1.value = cat.nombre;
            option1.textContent = cat.nombre;
            selectCategoria.appendChild(option1);

            const option2 = document.createElement('option');
            option2.value = cat.nombre;
            option2.textContent = cat.nombre;
            filtroCategoria.appendChild(option2);
        });
    } catch (error) {
        console.error('Error al cargar categorías:', error);
    }
}

// ============= RENDERIZADO =============

function renderizarTareas() {
    const container = document.getElementById('tareas-lista');

    if (tareas.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📋</div>
                <h3>No hay tareas</h3>
                <p>Comienza creando una nueva tarea</p>
            </div>
        `;
        return;
    }

    container.innerHTML = tareas.map(tarea => `
        <div class="task-card">
            <div class="task-header">
                <div>
                    <h3 class="task-title">${tarea.titulo}</h3>
                    <div class="task-meta">
                        <span class="task-badge badge-estado ${tarea.estado.toLowerCase().replace(' ', '-')}">
                            ${tarea.estado}
                        </span>
                        <span class="task-badge badge-prioridad ${tarea.prioridad.toLowerCase()}">
                            ${tarea.prioridad}
                        </span>
                        ${tarea.categoria ? `<span class="task-badge">${tarea.categoria}</span>` : ''}
                    </div>
                </div>
            </div>

            ${tarea.descripcion ? `<p class="task-description">${tarea.descripcion}</p>` : ''}

            <div class="task-details">
                ${tarea.asignado ? `<div class="task-detail"><strong>👤 Asignado:</strong> ${tarea.asignado}</div>` : ''}
                ${tarea.fecha_inicio ? `<div class="task-detail"><strong>📅 Inicio:</strong> ${formatearFecha(tarea.fecha_inicio)}</div>` : ''}
                ${tarea.fecha_fin ? `<div class="task-detail"><strong>📅 Fin:</strong> ${formatearFecha(tarea.fecha_fin)}</div>` : ''}
                ${tarea.etiquetas ? `<div class="task-detail"><strong>🏷️ Etiquetas:</strong> ${tarea.etiquetas}</div>` : ''}
            </div>

            <div class="task-progress">
                <small><strong>Progreso:</strong> ${tarea.progreso}%</small>
                <div class="task-progress-bar">
                    <div class="task-progress-fill" style="width: ${tarea.progreso}%"></div>
                </div>
            </div>

            ${tarea.notas ? `<p class="task-description"><strong>📝 Notas:</strong> ${tarea.notas}</p>` : ''}

            <div class="task-actions">
                <button class="btn btn-small btn-primary" onclick="editarTarea(${tarea.id})">✏️ Editar</button>
                <button class="btn btn-small btn-danger" onclick="eliminarTarea(${tarea.id})">🗑️ Eliminar</button>
            </div>
        </div>
    `).join('');
}

// ============= FUNCIONES DE TAREA =============

function mostrarModalNuevaTarea() {
    tareaEditando = null;
    document.getElementById('modal-titulo').textContent = 'Nueva Tarea';
    document.getElementById('form-tarea').reset();
    document.getElementById('modal-tarea').style.display = 'block';
}

function editarTarea(id) {
    const tarea = tareas.find(t => t.id === id);
    if (!tarea) return;

    tareaEditando = id;
    document.getElementById('modal-titulo').textContent = 'Editar Tarea';

    // Rellenar formulario
    document.getElementById('titulo').value = tarea.titulo || '';
    document.getElementById('descripcion').value = tarea.descripcion || '';
    document.getElementById('estado').value = tarea.estado || 'Pendiente';
    document.getElementById('prioridad').value = tarea.prioridad || 'Media';
    document.getElementById('asignado').value = tarea.asignado || '';
    document.getElementById('categoria').value = tarea.categoria || '';
    document.getElementById('fecha-inicio').value = tarea.fecha_inicio || '';
    document.getElementById('fecha-fin').value = tarea.fecha_fin || '';
    document.getElementById('progreso').value = tarea.progreso || 0;
    document.getElementById('progreso-valor').textContent = (tarea.progreso || 0) + '%';
    document.getElementById('etiquetas').value = tarea.etiquetas || '';
    document.getElementById('notas').value = tarea.notas || '';

    document.getElementById('modal-tarea').style.display = 'block';
}

async function guardarTarea(event) {
    event.preventDefault();

    const datos = {
        titulo: document.getElementById('titulo').value,
        descripcion: document.getElementById('descripcion').value,
        estado: document.getElementById('estado').value,
        prioridad: document.getElementById('prioridad').value,
        asignado: document.getElementById('asignado').value,
        categoria: document.getElementById('categoria').value,
        fecha_inicio: document.getElementById('fecha-inicio').value,
        fecha_fin: document.getElementById('fecha-fin').value,
        progreso: parseInt(document.getElementById('progreso').value),
        etiquetas: document.getElementById('etiquetas').value,
        notas: document.getElementById('notas').value
    };

    try {
        let response;
        if (tareaEditando) {
            response = await fetch(`${API_URL}/tareas/${tareaEditando}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datos)
            });
        } else {
            response = await fetch(`${API_URL}/tareas`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datos)
            });
        }

        if (response.ok) {
            cerrarModal();
            cargarTareas();
            cargarEstadisticas();
            mostrarExito(tareaEditando ? 'Tarea actualizada' : 'Tarea creada');
        } else {
            const error = await response.json();
            mostrarError(error.error || 'Error al guardar tarea');
        }
    } catch (error) {
        console.error('Error:', error);
        mostrarError('Error al guardar la tarea');
    }
}

async function eliminarTarea(id) {
    if (!confirm('¿Estás seguro de eliminar esta tarea?')) return;

    try {
        const response = await fetch(`${API_URL}/tareas/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            cargarTareas();
            cargarEstadisticas();
            mostrarExito('Tarea eliminada');
        } else {
            mostrarError('Error al eliminar tarea');
        }
    } catch (error) {
        console.error('Error:', error);
        mostrarError('Error al eliminar la tarea');
    }
}

// ============= FILTROS =============

function aplicarFiltros() {
    const filtros = {};

    const estado = document.getElementById('filtro-estado').value;
    const prioridad = document.getElementById('filtro-prioridad').value;
    const categoria = document.getElementById('filtro-categoria').value;

    if (estado) filtros.estado = estado;
    if (prioridad) filtros.prioridad = prioridad;
    if (categoria) filtros.categoria = categoria;

    cargarTareas(filtros);
}

function limpiarFiltros() {
    document.getElementById('filtro-estado').value = '';
    document.getElementById('filtro-prioridad').value = '';
    document.getElementById('filtro-categoria').value = '';
    cargarTareas();
}

// ============= MODAL =============

function cerrarModal() {
    document.getElementById('modal-tarea').style.display = 'none';
    document.getElementById('form-tarea').reset();
    tareaEditando = null;
}

// Cerrar modal al hacer clic fuera
window.onclick = function(event) {
    const modal = document.getElementById('modal-tarea');
    if (event.target === modal) {
        cerrarModal();
    }
}

// ============= UTILIDADES =============

function formatearFecha(fecha) {
    if (!fecha) return '';
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function mostrarExito(mensaje) {
    alert('✓ ' + mensaje);
}

function mostrarError(mensaje) {
    alert('✗ ' + mensaje);
}

// ============= EXPORTAR A EXCEL =============

async function descargarExcel() {
    try {
        window.location.href = '/templates/plantilla_tareas.xlsx';
        mostrarExito('Plantilla descargada. Para exportar datos actuales, ejecuta: npm run export-excel');
    } catch (error) {
        console.error('Error:', error);
        mostrarError('Error al descargar plantilla');
    }
}
