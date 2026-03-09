#!/bin/bash

echo "╔════════════════════════════════════════════════════════╗"
echo "║   Sistema de Seguimiento de Tareas - Inicio Rápido   ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

# Ir al directorio del proyecto
cd /home/user/Bard

echo "📦 Verificando dependencias..."
if [ ! -d "node_modules" ]; then
    echo "   Instalando dependencias..."
    npm install
else
    echo "   ✓ Dependencias ya instaladas"
fi

echo ""
echo "💾 Verificando base de datos..."
if [ ! -f "database.db" ]; then
    echo "   Creando base de datos..."
    npm run init-db
else
    echo "   ✓ Base de datos ya existe"
fi

echo ""
echo "📝 Verificando plantilla Excel..."
if [ ! -f "templates/plantilla_tareas.xlsx" ]; then
    echo "   Generando plantilla..."
    npm run create-template
else
    echo "   ✓ Plantilla ya existe"
fi

echo ""
echo "╔════════════════════════════════════════════════════════╗"
echo "║              ¡Todo listo para comenzar!               ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""
echo "🚀 Para iniciar el servidor ejecuta:"
echo "   npm start"
echo ""
echo "🌐 Luego abre tu navegador en:"
echo "   http://localhost:3000"
echo ""
echo "📋 Archivos disponibles:"
echo "   - Base de datos: database.db"
echo "   - Plantilla Excel: templates/plantilla_tareas.xlsx"
echo "   - Instrucciones: INSTRUCCIONES.md"
echo ""
