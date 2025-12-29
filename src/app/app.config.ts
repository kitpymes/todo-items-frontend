import { ApplicationConfig, inject, provideAppInitializer, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { HttpClient, provideHttpClient } from '@angular/common/http';

import { APP_CONFIG_TOKEN } from './app.config.tokens';
import { firstValueFrom } from 'rxjs';
import { AppConfigService } from './app.config.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(),
   // 1. Proveemos el servicio de configuración
    AppConfigService,
    // 2. Ejecutamos la carga al arrancar la app
    provideAppInitializer(() => {
        const configService = inject(AppConfigService);
        return configService.loadConfig();
    }),
    // 3. Mapeamos el InjectionToken al valor que el servicio acaba de cargar
    {
      provide: APP_CONFIG_TOKEN,
      useFactory: (configService: AppConfigService) => configService.apiUrl,
      deps: [AppConfigService]
    }
  ]
};
