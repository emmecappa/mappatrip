import { Plugin } from '../types';

/**
 * Plugin Manager - Gestisce il ciclo di vita dei plugin
 * Permette di registrare, inizializzare e rimuovere plugin dinamicamente
 */
class PluginManager {
  private plugins: Map<string, Plugin> = new Map();
  private listeners: Set<() => void> = new Set();

  /**
   * Registra un nuovo plugin
   */
  async register(plugin: Plugin): Promise<void> {
    if (this.plugins.has(plugin.name)) {
      console.warn(`Plugin "${plugin.name}" già registrato`);
      return;
    }

    console.log(`🔌 Registrazione plugin: ${plugin.name} v${plugin.version}`);
    
    // Inizializza il plugin se ha un metodo init
    if (plugin.init) {
      await plugin.init();
    }

    this.plugins.set(plugin.name, plugin);
    this.notifyListeners();
  }

  /**
   * Rimuove un plugin
   */
  async unregister(name: string): Promise<void> {
    const plugin = this.plugins.get(name);
    if (!plugin) return;

    console.log(`🔌 Rimozione plugin: ${name}`);
    
    // Chiama destroy se disponibile
    if (plugin.destroy) {
      await plugin.destroy();
    }

    this.plugins.delete(name);
    this.notifyListeners();
  }

  /**
   * Ottieni tutti i plugin registrati
   */
  getAll(): Plugin[] {
    return Array.from(this.plugins.values());
  }

  /**
   * Ottieni un plugin per nome
   */
  get(name: string): Plugin | undefined {
    return this.plugins.get(name);
  }

  /**
   * Ottieni tutti i componenti di un tipo specifico
   */
  getComponentsByPosition(position: 'header' | 'footer' | 'sidebar' | 'map-overlay' | 'modal') {
    const components: Array<{
      name: string;
      component: React.ComponentType<any>;
      position: 'header' | 'footer' | 'sidebar' | 'map-overlay' | 'modal';
    }> = [];
    
    for (const plugin of this.plugins.values()) {
      if (plugin.components) {
        const filtered = plugin.components.filter(c => c.position === position);
        components.push(...filtered);
      }
    }
    
    return components;
  }

  /**
   * Sottoscrivi ai cambiamenti dei plugin
   */
  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener());
  }
}

// Singleton instance
export const pluginManager = new PluginManager();
