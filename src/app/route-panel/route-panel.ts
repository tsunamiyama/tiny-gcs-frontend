import { AfterViewInit, Component, effect, ElementRef, inject, viewChild } from '@angular/core';
import * as L from 'leaflet'
import { TelemetryService } from '../telemetry/telemetry.service';

@Component({
  imports: [],
  selector: 'app-route-panel',
  styleUrl: './route-panel.css',
  templateUrl: './route-panel.html',
})
export class RoutePanel implements AfterViewInit {
  private telemetryService = inject(TelemetryService);
  private readonly mapEl = viewChild.required<ElementRef<HTMLDivElement>>('mapEl');

  private map?: L.Map;
  private marker?: L.Marker;

  constructor() {
    effect(() => {
      const pos = this.telemetryService.position();   // per-slice signal: { lat, lon, ... } | null
      // console.log('effect fired, position =', pos, 'map ready =', !!this.map);
      if (!pos || !this.map) return;           // no fix yet, or map not built
      this.updateMarker(pos.lat, pos.lon);
    });
  }

  ngAfterViewInit(): void {
    this.map = L.map(this.mapEl().nativeElement).setView([0, 0], 2);  // neutral pre-fix view

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png', {
      maxZoom: 20,
      attribution: '&copy; OpenStreetMap &middot; CARTO'
    }).addTo(this.map);
  }

  private updateMarker(lat: number, lon: number): void {
    const latlng: L.LatLngExpression = [lat, lon];
    if (!this.marker) {
      const icon = L.divIcon({
        className: 'drone-marker',
        html: '<div class="drone-dot"></div>',
        iconSize: [16, 16],
        iconAnchor: [8, 8],   // center the icon on the coordinate
      });
      this.marker = L.marker(latlng, { icon }).addTo(this.map!);
      this.map!.setView(latlng, 16);
    } else {
      this.marker.setLatLng(latlng);
    }
  }

  ngOnDestroy(): void {
    this.map?.remove();
  }
}
