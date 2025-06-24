// Diagnóstico completo del frontend para identificar fuentes de exportadores excluidos
const fs = require('fs');
const path = require('path');

console.log('🔍 DIAGNÓSTICO COMPLETO DEL FRONTEND');
console.log('=====================================');

// Función para buscar texto en archivos
function searchInFile(filePath, searchTerm) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n');
        const matches = [];
        
        lines.forEach((line, index) => {
            if (line.toLowerCase().includes(searchTerm.toLowerCase())) {
                matches.push({
                    line: index + 1,
                    content: line.trim(),
                    context: lines.slice(Math.max(0, index - 2), index + 3).join('\n')
                });
            }
        });
        
        return matches;
    } catch (error) {
        return [];
    }
}

// Función para buscar en directorio recursivamente
function searchInDirectory(dir, searchTerms, extensions = ['.js', '.jsx', '.ts', '.tsx']) {
    const results = {};
    
    function searchRecursive(currentDir) {
        const items = fs.readdirSync(currentDir);
        
        items.forEach(item => {
            const itemPath = path.join(currentDir, item);
            const stat = fs.statSync(itemPath);
            
            if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
                searchRecursive(itemPath);
            } else if (stat.isFile() && extensions.some(ext => item.endsWith(ext))) {
                searchTerms.forEach(term => {
                    const matches = searchInFile(itemPath, term);
                    if (matches.length > 0) {
                        if (!results[term]) results[term] = {};
                        results[term][itemPath] = matches;
                    }
                });
            }
        });
    }
    
    searchRecursive(dir);
    return results;
}

// Términos de búsqueda
const searchTerms = [
    'del monte',
    'videxport',
    'exporter',
    'exportador',
    'exportadores',
    'exporters',
    'Del Monte',
    'Videxport',
    'VIDEXPORT',
    'DEL MONTE'
];

console.log('\n📁 BUSCANDO EN ARCHIVOS FRONTEND...');
console.log('Términos de búsqueda:', searchTerms);

const srcDir = path.join(__dirname, 'src');
const results = searchInDirectory(srcDir, searchTerms);

console.log('\n📊 RESULTADOS DE BÚSQUEDA:');
Object.keys(results).forEach(term => {
    console.log(`\n🔍 "${term}":`);
    Object.keys(results[term]).forEach(filePath => {
        console.log(`  📄 ${filePath.replace(__dirname, '.')}`);
        results[term][filePath].forEach(match => {
            console.log(`    Línea ${match.line}: ${match.content}`);
        });
    });
});

// Verificar archivos de datos específicos
console.log('\n📋 VERIFICANDO ARCHIVOS DE DATOS...');

const dataFiles = [
    'src/data/costDataEmbedded.js',
    'src/data/salesDataEmbedded.js',
    'src/data/costDataCSV.js',
    'public/data/Charge Summary New.csv',
    'public/data/Initial_Stock_All.csv'
];

dataFiles.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
        console.log(`\n📄 ${file}:`);
        searchTerms.forEach(term => {
            const matches = searchInFile(filePath, term);
            if (matches.length > 0) {
                console.log(`  ⚠️  Encontrado "${term}" en ${matches.length} líneas`);
                matches.forEach(match => {
                    console.log(`    Línea ${match.line}: ${match.content.substring(0, 100)}...`);
                });
            }
        });
    } else {
        console.log(`  ❌ Archivo no encontrado: ${file}`);
    }
});

// Verificar si hay datos hardcodeados en componentes
console.log('\n🔧 VERIFICANDO COMPONENTES CRÍTICOS...');

const criticalComponents = [
    'src/components/reports/CostConsistencyReport.jsx',
    'src/components/common/FilterDropdown.jsx',
    'src/components/charts',
    'src/utils/dataProcessing.js'
];

criticalComponents.forEach(component => {
    const componentPath = path.join(__dirname, component);
    if (fs.existsSync(componentPath)) {
        console.log(`\n📄 ${component}:`);
        
        if (fs.statSync(componentPath).isDirectory()) {
            // Buscar en directorio
            const dirResults = searchInDirectory(componentPath, searchTerms);
            Object.keys(dirResults).forEach(term => {
                if (Object.keys(dirResults[term]).length > 0) {
                    console.log(`  ⚠️  "${term}" encontrado en archivos del directorio`);
                }
            });
        } else {
            // Buscar en archivo
            searchTerms.forEach(term => {
                const matches = searchInFile(componentPath, term);
                if (matches.length > 0) {
                    console.log(`  ⚠️  "${term}" encontrado en ${matches.length} líneas`);
                }
            });
        }
    } else {
        console.log(`  ❌ No encontrado: ${component}`);
    }
});

// Verificar localStorage y sessionStorage patterns
console.log('\n💾 BUSCANDO PATRONES DE ALMACENAMIENTO LOCAL...');

const storagePatterns = [
    'localStorage',
    'sessionStorage',
    'getItem',
    'setItem',
    'cache',
    'cached',
    'store',
    'persist'
];

const storageResults = searchInDirectory(srcDir, storagePatterns);
console.log('Archivos que usan almacenamiento local:');
Object.keys(storageResults).forEach(pattern => {
    if (Object.keys(storageResults[pattern]).length > 0) {
        console.log(`\n📦 ${pattern}:`);
        Object.keys(storageResults[pattern]).forEach(filePath => {
            console.log(`  📄 ${filePath.replace(__dirname, '.')}`);
        });
    }
});

console.log('\n✅ DIAGNÓSTICO COMPLETO TERMINADO');
console.log('=====================================');
