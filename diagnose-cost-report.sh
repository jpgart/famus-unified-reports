#!/bin/bash

echo "🧪 DIAGNÓSTICO COMPLETO DEL REPORTE DE COSTOS"
echo "=============================================="

# Verificar servidor
echo "1. ✅ Verificando servidor..."
if curl -s http://localhost:3003 > /dev/null; then
    echo "   ✅ Servidor responde en puerto 3003"
else
    echo "   ❌ Servidor no responde"
    exit 1
fi

# Verificar archivos JavaScript
echo "2. ✅ Verificando archivos JavaScript..."
if curl -s -I http://localhost:3003/main.46c9d35f94bb37aaa584.js | grep "200 OK" > /dev/null; then
    echo "   ✅ main.js disponible"
else
    echo "   ❌ main.js no disponible"
fi

if curl -s -I http://localhost:3003/vendors.18ec0a56478e33f92aff.js | grep "200 OK" > /dev/null; then
    echo "   ✅ vendors.js disponible"
else
    echo "   ❌ vendors.js no disponible"
fi

# Verificar contenido HTML
echo "3. ✅ Verificando contenido HTML..."
RESPONSE=$(curl -s http://localhost:3003)
if echo "$RESPONSE" | grep "Cargando Famus Reports" > /dev/null; then
    echo "   ✅ HTML contiene mensaje de carga esperado"
else
    echo "   ❌ HTML no contiene mensaje de carga esperado"
fi

if echo "$RESPONSE" | grep "main.46c9d35f94bb37aaa584.js" > /dev/null; then
    echo "   ✅ HTML referencia archivo JS principal"
else
    echo "   ❌ HTML no referencia archivo JS principal"
fi

# Verificar tamaño del archivo principal
echo "4. ✅ Verificando tamaño de archivos..."
MAIN_SIZE=$(curl -s -I http://localhost:3003/main.46c9d35f94bb37aaa584.js | grep -i content-length | cut -d: -f2 | tr -d ' \r')
if [ "$MAIN_SIZE" -gt 1000000 ]; then
    echo "   ✅ main.js tiene tamaño apropiado (~${MAIN_SIZE} bytes)"
else
    echo "   ⚠️  main.js podría ser demasiado pequeño (${MAIN_SIZE} bytes)"
fi

echo ""
echo "🎯 INSTRUCCIONES PARA VERIFICAR EL REPORTE:"
echo "1. Abre http://localhost:3003 en tu navegador"
echo "2. Verifica que la aplicación cargue (sin mensaje 'Cargando...' permanente)"
echo "3. Haz clic en la pestaña 'Cost Consistency Report'"
echo "4. Verifica que el reporte se muestre correctamente"
echo "5. Si hay problemas, abre las Herramientas de Desarrollador (F12) y verifica la consola"
echo ""
echo "🔧 Si el reporte sigue sin mostrarse:"
echo "- Verifica la consola del navegador en busca de errores JavaScript"
echo "- Asegúrate de hacer hard refresh (Ctrl+F5 o Cmd+Shift+R)"
echo "- Verifica que no hay errores de CORS"
