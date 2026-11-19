import { useEffect, useRef } from 'preact/hooks';
import { CETI_LAT, CETI_LNG, CETI_NOMBRE } from '../lib/constants';
type AddressPoint = { lat: number; lng: number; text?: string } | null;
type Props = { height?: number; address?: AddressPoint; interactive?: boolean };
let leafletPromise: Promise<any> | null = null;
function loadLeaflet(): Promise<any> {
  if (!leafletPromise) {
    leafletPromise = Promise.all([import('leaflet'), import('leaflet/dist/leaflet.css')]).then(([mod]) => (mod as any).default);
  }
  return leafletPromise;
}
export default function CETIMap({ height = 200, address = null, interactive = false }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const L = await loadLeaflet();
      if (cancelled || !containerRef.current) return;
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; }
      const map = L.map(containerRef.current, { zoomControl: interactive, scrollWheelZoom: interactive, dragging: interactive, attributionControl: true });
      mapRef.current = map;
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap', maxZoom: 19 }).addTo(map);
      const cetiIcon = L.divIcon({ className: 'ceti-marker', html: '<div class="ceti-marker-dot"></div>', iconSize: [18, 18], iconAnchor: [9, 9] });
      L.marker([CETI_LAT, CETI_LNG], { icon: cetiIcon }).bindPopup(`<strong>${CETI_NOMBRE}</strong><br/>Origen de envío`).addTo(map);
      if (address) {
        const userIcon = L.divIcon({ className: 'user-marker', html: '<div class="user-marker-dot"></div>', iconSize: [14, 14], iconAnchor: [7, 7] });
        L.marker([address.lat, address.lng], { icon: userIcon }).bindPopup(address.text ?? 'Destino').addTo(map);
        map.fitBounds([[CETI_LAT, CETI_LNG], [address.lat, address.lng]], { padding: [24, 24], maxZoom: 15 });
      } else { map.setView([CETI_LAT, CETI_LNG], 15); }
    })();
    return () => { cancelled = true; if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; } };
  }, [address?.lat, address?.lng, interactive]);
  return (<div ref={containerRef} class="leaflet-dark w-full overflow-hidden rounded-sm border border-border bg-elevated" style={{ height: `${height}px` }} aria-label={`Mapa: ${CETI_NOMBRE}`} />);
}
