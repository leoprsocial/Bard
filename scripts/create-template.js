const ExcelJS = require('exceljs');
const path = require('path');

async function createTemplate() {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Tareas');

    // Configurar columnas
    worksheet.columns = [
        { header: 'ID', key: 'id', width: 8 },
        { header: 'Título', key: 'titulo', width: 30 },
        { header: 'Descripción', key: 'descripcion', width: 50 },
        { header: 'Estado', key: 'estado', width: 15 },
        { header: 'Prioridad', key: 'prioridad', width: 12 },
        { header: 'Asignado a', key: 'asignado', width: 20 },
        { header: 'Fecha Inicio', key: 'fecha_inicio', width: 15 },
        { header: 'Fecha Fin', key: 'fecha_fin', width: 15 },
        { header: 'Progreso (%)', key: 'progreso', width: 12 },
        { header: 'Categoría', key: 'categoria', width: 15 },
        { header: 'Etiquetas', key: 'etiquetas', width: 20 },
        { header: 'Notas', key: 'notas', width: 40 }
    ];

    // Estilos de encabezado
    worksheet.getRow(1).font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } };
    worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4472C4' }
    };
    worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

    // Datos de ejemplo
    const ejemplos = [
        {
            id: 1,
            titulo: 'Configurar servidor',
            descripcion: 'Instalar y configurar servidor de producción',
            estado: 'En Progreso',
            prioridad: 'Alta',
            asignado: 'Juan Pérez',
            fecha_inicio: new Date('2025-10-20'),
            fecha_fin: new Date('2025-10-25'),
            progreso: 60,
            categoria: 'Infraestructura',
            etiquetas: 'servidor, DevOps',
            notas: 'Requiere acceso VPN'
        },
        {
            id: 2,
            titulo: 'Diseño UI/UX',
            descripcion: 'Crear mockups de la interfaz principal',
            estado: 'Pendiente',
            prioridad: 'Media',
            asignado: 'María González',
            fecha_inicio: new Date('2025-10-22'),
            fecha_fin: new Date('2025-10-30'),
            progreso: 0,
            categoria: 'Diseño',
            etiquetas: 'UI, diseño',
            notas: 'Usar paleta de colores corporativa'
        },
        {
            id: 3,
            titulo: 'Implementar API REST',
            descripcion: 'Desarrollar endpoints para módulo de usuarios',
            estado: 'Completada',
            prioridad: 'Alta',
            asignado: 'Carlos López',
            fecha_inicio: new Date('2025-10-15'),
            fecha_fin: new Date('2025-10-20'),
            progreso: 100,
            categoria: 'Desarrollo',
            etiquetas: 'backend, API',
            notas: 'Incluye autenticación JWT'
        }
    ];

    // Agregar datos de ejemplo
    ejemplos.forEach(ejemplo => {
        const row = worksheet.addRow(ejemplo);

        // Formatear fechas
        row.getCell('fecha_inicio').numFmt = 'dd/mm/yyyy';
        row.getCell('fecha_fin').numFmt = 'dd/mm/yyyy';

        // Formatear porcentaje
        row.getCell('progreso').numFmt = '0"%"';

        // Colorear según estado
        const estado = row.getCell('estado').value;
        if (estado === 'Completada') {
            row.getCell('estado').fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FF92D050' }
            };
        } else if (estado === 'En Progreso') {
            row.getCell('estado').fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFFFC000' }
            };
        } else if (estado === 'Pendiente') {
            row.getCell('estado').fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFFF6B6B' }
            };
        }

        // Colorear según prioridad
        const prioridad = row.getCell('prioridad').value;
        if (prioridad === 'Alta') {
            row.getCell('prioridad').font = { color: { argb: 'FFFF0000' }, bold: true };
        } else if (prioridad === 'Media') {
            row.getCell('prioridad').font = { color: { argb: 'FFFF8C00' } };
        }
    });

    // Agregar validación de datos para Estado
    worksheet.getColumn('estado').eachCell({ includeEmpty: false }, (cell, rowNumber) => {
        if (rowNumber > 1) { // Saltar encabezado
            cell.dataValidation = {
                type: 'list',
                allowBlank: false,
                formulae: ['"Pendiente,En Progreso,Completada,Cancelada"']
            };
        }
    });

    // Agregar validación de datos para Prioridad
    worksheet.getColumn('prioridad').eachCell({ includeEmpty: false }, (cell, rowNumber) => {
        if (rowNumber > 1) {
            cell.dataValidation = {
                type: 'list',
                allowBlank: false,
                formulae: ['"Baja,Media,Alta,Urgente"']
            };
        }
    });

    // Crear hoja de Resumen
    const resumenSheet = workbook.addWorksheet('Resumen');

    resumenSheet.getCell('A1').value = 'PANEL DE CONTROL - SEGUIMIENTO DE TAREAS';
    resumenSheet.getCell('A1').font = { bold: true, size: 16, color: { argb: 'FF4472C4' } };
    resumenSheet.mergeCells('A1:D1');

    resumenSheet.getCell('A3').value = 'Estado';
    resumenSheet.getCell('B3').value = 'Cantidad';
    resumenSheet.getRow(3).font = { bold: true };

    resumenSheet.getCell('A4').value = 'Pendientes';
    resumenSheet.getCell('B4').value = { formula: 'COUNTIF(Tareas!D:D,"Pendiente")' };

    resumenSheet.getCell('A5').value = 'En Progreso';
    resumenSheet.getCell('B5').value = { formula: 'COUNTIF(Tareas!D:D,"En Progreso")' };

    resumenSheet.getCell('A6').value = 'Completadas';
    resumenSheet.getCell('B6').value = { formula: 'COUNTIF(Tareas!D:D,"Completada")' };

    resumenSheet.getCell('A7').value = 'Canceladas';
    resumenSheet.getCell('B7').value = { formula: 'COUNTIF(Tareas!D:D,"Cancelada")' };

    resumenSheet.getCell('A9').value = 'Total de Tareas';
    resumenSheet.getCell('B9').value = { formula: 'COUNTA(Tareas!A:A)-1' };
    resumenSheet.getCell('A9').font = { bold: true };
    resumenSheet.getCell('B9').font = { bold: true };

    // Ajustar anchos
    resumenSheet.getColumn('A').width = 20;
    resumenSheet.getColumn('B').width = 15;

    // Guardar archivo
    const templatePath = path.join(__dirname, '../templates/plantilla_tareas.xlsx');
    await workbook.xlsx.writeFile(templatePath);

    console.log(`✓ Plantilla Excel creada exitosamente en: ${templatePath}`);
}

// Ejecutar si se llama directamente
if (require.main === module) {
    createTemplate().catch(console.error);
}

module.exports = createTemplate;
