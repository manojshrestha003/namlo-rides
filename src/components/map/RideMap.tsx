
import { useEffect, useRef } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from 'react-leaflet';

import L from 'leaflet';
import type { Location } from '../../types';

// Fix default marker icon bug in Vite + Leaflet
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Custom icons
const riderIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const driverIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

// Kathmandu center
const KATHMANDU: [number, number] = [27.7172, 85.3240];

// Smoothly pan map when driver moves
const MapUpdater = ({ center }: { center: [number, number] | null }) => {
  const map = useMap();
  useEffect(() => {
    if (center) map.panTo(center);
  }, [center, map]);
  return null;
};

interface RideMapProps {
  pickupLocation?: Location | null;
  driverLocation?: Location | null;
  onMapClick?: (location: Location) => void;
  interactive?: boolean;
}

const RideMap = ({
  pickupLocation,
  driverLocation,
  onMapClick,
  interactive = false,
}: RideMapProps) => {

  // Click handler component (inside map context)
  const MapClickHandler = () => {
    const map = useMap();

    useEffect(() => {
      if (!interactive || !onMapClick) return;

      const handleClick = (e: L.LeafletMouseEvent) => {
        onMapClick({ lat: e.latlng.lat, lng: e.latlng.lng });
      };

      map.on('click', handleClick);
      return () => { map.off('click', handleClick); }; // cleanup
    }, [map]);

    return null;
  };

  const driverCenter: [number, number] | null = driverLocation
    ? [driverLocation.lat, driverLocation.lng]
    : null;

  return (
    <MapContainer
      center={KATHMANDU}
      zoom={13}
      className="w-full h-full rounded-xl z-0"
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Click to set pickup */}
      {interactive && <MapClickHandler />}

      {/* Smooth pan to driver */}
      {driverCenter && <MapUpdater center={driverCenter} />}

      {/* Pickup marker */}
      {pickupLocation && (
        <Marker
          position={[pickupLocation.lat, pickupLocation.lng]}
          icon={riderIcon}
        >
          <Popup>Pickup location</Popup>
        </Marker>
      )}

      {/* Driver marker */}
      {driverLocation && (
        <Marker
          position={[driverLocation.lat, driverLocation.lng]}
          icon={driverIcon}
        >
          <Popup>Driver is here</Popup>
        </Marker>
      )}
    </MapContainer>
  );
};

export default RideMap;