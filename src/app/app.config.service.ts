import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { AppConfig } from './app.config.tokens';

@Injectable({
  providedIn: 'root'
})
export class AppConfigService {
  // Almacenamos la configuración de forma privada para que no sea alterada
  private configuration: AppConfig | null = null;
  private readonly http = inject(HttpClient);

  /**
   * Este método es el que llamará el inicializador de Angular.
   * Carga el archivo JSON desde la carpeta assets.
   */
  async loadConfig(): Promise<void> {
    try {
      // En producción, podrías tener un solo 'config.json' que se reemplaza en el servidor
      // o detectar la URL para saber qué archivo cargar.
      this.configuration = await firstValueFrom(
        this.http.get<AppConfig>('assets/config.json')
      );
      console.log('Configuración cargada correctamente:', this.configuration);
    } catch (error) {
      console.error('Error crítico: No se pudo cargar la configuración', error);
      // Opcional: podrías establecer valores por defecto aquí si la carga falla
      this.configuration = { apiUrl: 'https://fallback-api.com' };
    }
  }

  /**
   * Getter para obtener la configuración completa
   */
  get config(): AppConfig {
    if (!this.configuration) {
      throw new Error('ConfigService: Se intentó acceder a la configuración antes de ser cargada.');
    }
    return this.configuration;
  }

  /**
   * Getter específico para la URL de la API
   */
  get apiUrl(): string {
    return this.config.apiUrl;
  }
}
