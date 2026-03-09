#!/bin/bash

echo "╔════════════════════════════════════════════════════════╗"
echo "║   Sistema de Seguimiento de Tareas - Inicio           ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

cd /home/user/Bard

echo "🚀 Iniciando servidor en puerto 4000..."
echo ""
echo "📍 Accede al dashboard en:"
echo "   http://localhost:4000"
echo ""
echo "⏹️  Para detener el servidor presiona: Ctrl+C"
echo ""

node server.js
