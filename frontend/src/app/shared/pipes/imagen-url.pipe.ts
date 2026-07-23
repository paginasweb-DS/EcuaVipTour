import { Pipe, PipeTransform } from '@angular/core';
import { ArchivoService } from '../../core/services/archivo.service';

/**
 * Pipe para resolver URLs de imágenes, compatible con:
 *  - URLs absolutas de Cloudflare R2 (https://pub-xxx.r2.dev/...)
 *  - Rutas relativas legacy del backend  (uploads/foto.jpg)
 *
 * Uso en template:
 *   <img [src]="foto_perfil_url | imagenUrl">
 */
@Pipe({
  name: 'imagenUrl',
  standalone: true,
  pure: true
})
export class ImagenUrlPipe implements PipeTransform {
  transform(url: string | null | undefined): string {
    return ArchivoService.resolverUrl(url);
  }
}
