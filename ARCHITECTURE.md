# Travel Planner - Architettura

## 📁 Struttura del Progetto

```
src/
├── core/                    # Core business logic
│   ├── types/              # Type definitions globali
│   ├── plugins/            # Sistema di plugin
│   ├── store/              # State management (Context + Reducer)
│   └── utils/              # Utility functions
├── features/               # Feature modules (feature-based architecture)
│   ├── map/               # Feature: Mappa
│   ├── places/            # Feature: Gestione luoghi
│   ├── diary/             # Feature: Diario giornaliero
│   └── travel-info/       # Feature: Info viaggio
├── shared/                # Componenti e utilities condivise
│   ├── ui/               # UI components riutilizzabili
│   ├── hooks/            # Custom hooks condivisi
│   └── components/       # Componenti condivisi
├── plugins/              # Implementazioni plugin
└── App.tsx              # Root component
```

## 🏗️ Architettura

### Core Layer
Il layer core contiene la logica di business fondamentale:

- **types**: Definizioni TypeScript globali
- **plugins**: Sistema di plugin estendibile
- **store**: State management con Context API + useReducer
- **utils**: Funzioni utility riutilizzabili

### Features Layer
Ogni feature è un modulo indipendente con:

```
features/
└── feature-name/
    ├── components/    # Componenti specifici della feature
    ├── hooks/         # Custom hooks della feature
    ├── types.ts       # Types specifici (opzionale)
    └── index.ts       # Public API della feature
```

### Shared Layer
Componenti e utilities condivise tra più features:

- **ui**: Button, Input, Modal, etc.
- **hooks**: Custom hooks riutilizzabili
- **components**: Componenti generici

## 🔌 Sistema di Plugin

Il sistema di plugin permette di estendere l'applicazione senza modificare il core.

### Creare un Plugin

```typescript
import { Plugin } from './core/types';

const myPlugin: Plugin = {
  name: 'my-plugin',
  version: '1.0.0',
  description: 'Descrizione del plugin',
  
  init: async () => {
    // Inizializzazione
    console.log('Plugin inizializzato');
  },
  
  destroy: async () => {
    // Cleanup
    console.log('Plugin rimosso');
  },
  
  components: [
    {
      name: 'MyComponent',
      component: MyComponent,
      position: 'sidebar', // header | footer | sidebar | map-overlay | modal
    }
  ],
};

// Registra il plugin
import { pluginManager } from './core/plugins';
await pluginManager.register(myPlugin);
```

### Posizioni Plugin

- **header**: Componenti nell'header dell'app
- **footer**: Componenti nel footer
- **sidebar**: Componenti nella sidebar
- **map-overlay**: Componenti sovrapposti alla mappa
- **modal**: Componenti modal

## 🎯 Best Practices

### 1. Feature-Based Architecture
Ogni feature è autonoma e contiene tutto il necessario:
- Componenti
- Hooks
- Types
- Logica specifica

### 2. Separation of Concerns
- **Core**: Logica di business fondamentale
- **Features**: Logica specifica per feature
- **Shared**: Componenti riutilizzabili
- **UI**: Componenti presentational puri

### 3. Type Safety
- Usa TypeScript strict mode
- Definisci tipi espliciti per props e state
- Evita `any` quando possibile

### 4. State Management
- Usa Context + Reducer per stato globale
- Custom hooks per logica complessa
- localStorage per persistenza

### 5. Component Design
- Componenti piccoli e focalizzati
- Props ben tipizzate
- Separazione UI/logica

## 🚀 Aggiungere una Nuova Feature

1. Crea la cartella in `features/`
2. Implementa componenti, hooks, types
3. Esporta la public API in `index.ts`
4. Usa i componenti nell'App o in altre features

## 📝 Convenzioni

### Naming
- **Components**: PascalCase (`PlaceCard.tsx`)
- **Hooks**: camelCase con `use` prefix (`usePlaces.ts`)
- **Utils**: camelCase (`formatDate.ts`)
- **Types**: PascalCase (`Place.ts`)
- **Constants**: UPPER_SNAKE_CASE (`STORAGE_KEYS`)

### File Organization
- Un componente per file
- Co-locazione di test e styles
- Index file per public API

### Imports
```typescript
// Core imports
import { Place } from '@/core/types';
import { useAppContext } from '@/core/store';

// Feature imports
import { usePlaces } from '@/features/places';

// Shared imports
import { Button } from '@/shared/ui';
```

## 🔧 Sviluppo

### Aggiungere un Plugin
1. Crea il plugin in `plugins/`
2. Implementa l'interfaccia `Plugin`
3. Registra con `pluginManager.register()`

### Aggiungere una Feature
1. Crea cartella in `features/`
2. Implementa componenti e hooks
3. Esporta in `index.ts`
4. Integra nell'App

### Aggiungere un UI Component
1. Crea in `shared/ui/`
2. Implementa con TypeScript
3. Esporta in `index.ts`
4. Usa nelle features

## 📚 Risorse

- [React Best Practices](https://react.dev/learn)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Feature-Based Architecture](https://medium.com/@aleksandrasays/feature-based-architecture-in-react-4e0b4b1d4c6e)
