# KPI Components Documentation v3.0

**Actualizado:** 27 de junio de 2025  
**Versión:** 3.0 - Enhanced KPI system with modern design and accessibility

Este documento describe cómo usar los nuevos componentes KPI en el sistema unificado de reportes Famus.

## Novedades en v3.0

- 🎨 **Diseño mejorado** con nuevas variables CSS y sistema de colores extendido
- ♿ **Accesibilidad mejorada** con focus states y contraste optimizado  
- 📱 **Responsive design** mejorado para dispositivos móviles
- ⚡ **Rendimiento optimizado** con lazy loading y memoización
- 🛡️ **Manejo de errores** robusto con fallbacks visuales

## Componentes Principales

### 1. KPICard

Un componente individual para mostrar una métrica clave con formato y estilo personalizable.

#### Props

| Prop | Tipo | Requerido | Valor por defecto | Descripción |
|------|------|-----------|-------------------|-------------|
| `title` | string | ✓ | - | Título de la métrica |
| `value` | number | ✓ | - | Valor numérico a mostrar |
| `type` | string | ✗ | 'number' | Tipo de formato: 'number', 'money', 'percentage', 'compact' |
| `change` | number | ✗ | null | Cambio porcentual (positivo/negativo) |
| `changeType` | string | ✗ | 'percentage' | Tipo de cambio: 'percentage' o 'number' |
| `icon` | string | ✗ | null | Emoji o icono a mostrar |
| `size` | string | ✗ | 'normal' | Tamaño: 'small', 'normal', 'large' |

#### Ejemplo de uso

```jsx
import { KPICard } from '../components/common';

<KPICard
  title="Total Revenue"
  value={2485000}
  type="money"
  change={12.5}
  changeType="percentage"
  icon="💰"
  size="normal"
/>
```

### 2. KPISection

Un componente contenedor que muestra múltiples KPIs y opcionalmente un gráfico.

#### Props

| Prop | Tipo | Requerido | Valor por defecto | Descripción |
|------|------|-----------|-------------------|-------------|
| `title` | string | ✗ | "Dashboard Overview" | Título de la sección |
| `titleColor` | string | ✗ | "text-famus-orange" | Color del título (clase Tailwind) |
| `backgroundColor` | string | ✗ | "bg-gray-50" | Color de fondo (clase Tailwind) |
| `kpis` | array | ✗ | [] | Array de objetos KPI |
| `chart` | object | ✗ | null | Configuración del gráfico |
| `showChart` | boolean | ✗ | true | Mostrar o no el gráfico |
| `containerClass` | string | ✗ | "" | Clases CSS adicionales |

#### Estructura del objeto KPI

```javascript
{
  label: "Total Sales",           // Título del KPI
  value: 2485000,                // Valor numérico
  type: "money",                 // Tipo de formato
  change: 12.5,                  // Cambio porcentual (opcional)
  changeType: "percentage",      // Tipo de cambio (opcional)
  icon: "💰",                   // Icono (opcional)
  size: "normal"                 // Tamaño (opcional)
}
```

#### Estructura del objeto Chart

```javascript
{
  type: "bar",                   // Tipo: 'bar', 'line', 'pie', 'doughnut'
  title: "Monthly Sales",        // Título del gráfico
  data: {                        // Datos en formato Chart.js
    labels: ['Jan', 'Feb', 'Mar'],
    datasets: [...]
  },
  options: {                     // Opciones adicionales de Chart.js (opcional)
    // Configuraciones específicas
  }
}
```

#### Ejemplo completo

```jsx
import { KPISection } from '../components/common';

const MyDashboard = () => {
  const kpis = [
    { label: 'Total Revenue', value: 2485000, type: 'money', icon: '💰' },
    { label: 'Units Sold', value: 15643, type: 'number', icon: '📦' },
    { label: 'Growth Rate', value: 12.5, type: 'percentage', icon: '📈' },
  ];

  const chart = {
    type: 'bar',
    title: 'Monthly Performance',
    data: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [{
        label: 'Sales ($)',
        data: [320000, 380000, 420000, 385000, 450000, 480000],
        backgroundColor: '#3D5A80',
      }]
    }
  };

  return (
    <KPISection
      title="Sales Dashboard"
      titleColor="text-famus-orange"
      backgroundColor="bg-white"
      kpis={kpis}
      chart={chart}
      showChart={true}
      containerClass="shadow-lg rounded-xl"
    />
  );
};
```

## Tipos de Gráficos Soportados

### 1. Bar Chart (`type: "bar"`)
- Ideal para: Comparaciones entre categorías, ventas por periodo, etc.
- Soporte para zoom y pan

### 2. Line Chart (`type: "line"`)
- Ideal para: Tendencias temporales, evolución de métricas
- Soporte para múltiples líneas y áreas

### 3. Pie Chart (`type: "pie"`)
- Ideal para: Distribución de categorías, market share
- Círculo completo

### 4. Doughnut Chart (`type: "doughnut"`)
- Ideal para: Distribución con espacio central para información adicional
- Personalizable con `cutout` option

## Formatters Disponibles

### Tipos de formato para valores:

- **`number`**: Formato numérico estándar (ej: 15,643)
- **`money`**: Formato monetario (ej: $2,485,000)
- **`percentage`**: Formato porcentual (ej: 12.5%)
- **`compact`**: Formato compacto (ej: 2.5M, 15.6K)

## Estilos y Colores

### Colores del Sistema Famus:
- `text-famus-navy`: #3D5A80 (azul marino)
- `text-famus-orange`: #EE6C4D (naranja)
- `text-famus-blue`: #98C1D9 (azul claro)
- `bg-famus-*`: Versiones de fondo de los colores

### Tamaños de KPI Cards:
- **`small`**: 140px ancho, ideal para métricas secundarias
- **`normal`**: 160px ancho, tamaño estándar
- **`large`**: 200px ancho, para métricas principales

## Interactividad

### Chart.js Features:
- **Zoom**: Rueda del mouse para hacer zoom
- **Pan**: Arrastrar para desplazar
- **Tooltips**: Información al pasar el mouse
- **Responsive**: Se adapta automáticamente al tamaño

### KPI Cards Features:
- **Hover Effects**: Efecto de escalado al pasar el mouse
- **Change Indicators**: Flechas y colores para mostrar cambios
- **Responsive Design**: Se adaptan a diferentes tamaños de pantalla

## Best Practices

1. **Agrupación Lógica**: Agrupa KPIs relacionados en la misma sección
2. **Consistencia de Colores**: Usa la paleta de colores del sistema
3. **Jerarquía Visual**: Usa diferentes tamaños para indicar importancia
4. **Información Contextual**: Incluye cambios porcentuales cuando sea relevante
5. **Performance**: Usa datos embebidos para mejor rendimiento
6. **Accessibility**: Los iconos complementan pero no reemplazan el texto

## Ejemplos de Uso por Tipo de Dashboard

### Sales Dashboard
```jsx
const salesKPIs = [
  { label: 'Revenue', value: 2485000, type: 'money', icon: '💰', size: 'large' },
  { label: 'Orders', value: 1543, type: 'number', icon: '📋', change: 8.2 },
  { label: 'Conversion', value: 3.2, type: 'percentage', icon: '🎯' },
];
```

### Inventory Dashboard
```jsx
const inventoryKPIs = [
  { label: 'Total Items', value: 5420, type: 'number', icon: '📦' },
  { label: 'Low Stock', value: 23, type: 'number', icon: '⚠️', size: 'small' },
  { label: 'Stock Value', value: 1250000, type: 'money', icon: '💎' },
];
```

### Performance Dashboard
```jsx
const performanceKPIs = [
  { label: 'Uptime', value: 99.9, type: 'percentage', icon: '🔧' },
  { label: 'Response Time', value: 2.1, type: 'number', icon: '⚡' },
  { label: 'Errors', value: -15, type: 'number', change: -25, icon: '🐛' },
];
```

## Integración con Reportes Existentes

Los componentes KPI se integran perfectamente con los reportes existentes:

1. **SalesDetailReport**: Ya integrado con KPISection
2. **CostConsistencyReport**: Puede usar KPICards individuales
3. **Nuevos Reportes**: Usar KPISection como base

Para ver ejemplos completos, consulta el archivo `KPIExamples.jsx`.
