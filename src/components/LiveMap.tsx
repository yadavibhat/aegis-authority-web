import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import React, { useEffect } from 'react';
import { renderToString } from 'react-dom/server';
import { Radio } from 'lucide-react';

const createTouristIcon = () => {
    return L.divIcon({
        className: 'bg-transparent border-none',
        html: `<div class="w-4 h-4 rounded-full bg-emerald-500 border-2 border-white shadow-md"></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8],
    });
};

const createSOSIcon = () => {
    const iconHtml = renderToString(
        <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center border-[3px] border-white shadow-[0_0_15px_rgba(239,68,68,0.8)] animate-pulse">
            <Radio className="text-white" size={14} />
        </div>
    );
    return L.divIcon({
        className: 'bg-transparent border-none',
        html: iconHtml,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
    });
};

function ChangeView({ center }: { center: any }) {
    const map = useMap();
    useEffect(() => {
        if (center) {
            map.flyTo(center, 14, { animate: true, duration: 1.5 });
        }
    }, [center, map]);
    return null;
}

export default function LiveMap({ center, activeTourists, openAlerts, zones }: any) {
    if (!center) return null;

    return (
        <MapContainer center={center} zoom={14} style={{ height: '100%', width: '100%', zIndex: 0 }} zoomControl={false}>
            <ChangeView center={center} />
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />
            
            {zones?.map((zone: any, i: number) => {
                const zCenter = [center[0] + (i * 0.005) - 0.002, center[1] + (i * -0.005) + 0.002];
                return (
                    <Circle
                        key={zone.id}
                        center={zCenter as [number, number]}
                        radius={500}
                        pathOptions={{ color: '#10b981', fillColor: '#10b981', fillOpacity: 0.05, dashArray: '10, 10', weight: 2 }}
                    />
                );
            })}

            {activeTourists?.map((t: any, idx: number) => {
                const hasAlert = openAlerts.some((a: any) => a.tourist_id === t.id);
                const offsetLat = center[0] + (idx * 0.004) - 0.006;
                const offsetLng = center[1] + (idx * 0.006) - 0.004;
                
                return (
                    <Marker 
                        key={t.id} 
                        position={[offsetLat, offsetLng]} 
                        icon={hasAlert ? createSOSIcon() : createTouristIcon()}
                    >
                        <Popup className="custom-popup">
                             <div className="p-1 min-w-[140px]">
                                <p className="text-slate-900 text-[11px] font-bold font-mono">{t.name}</p>
                                <p className={hasAlert ? "text-red-500 text-[10px] font-mono mt-1" : "text-slate-500 text-[9px] font-mono mt-0.5"}>
                                    ID: {hasAlert ? `${t.id} - ALERT ACTIVE` : t.aadhaar}
                                </p>
                            </div>
                        </Popup>
                    </Marker>
                );
            })}
        </MapContainer>
    );
}
