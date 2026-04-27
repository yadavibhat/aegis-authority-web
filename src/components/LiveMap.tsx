import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import React, { useEffect } from 'react';
import { renderToString } from 'react-dom/server';
import { Radio } from 'lucide-react';
import { supabaseBrowser } from '@/lib/supabaseBrowser';
import { Alert, Tourist, Zone } from '@/types';

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
        <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center border-[3px] border-white shadow-[0_0_20px_rgba(239,68,68,0.9)] animate-panic-pulse">
            <Radio className="text-white animate-pulse" size={18} />
        </div>
    );
    return L.divIcon({
        className: 'bg-transparent border-none',
        html: iconHtml,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
    });
};

function ChangeView({ center }: { center: [number, number] }) {
    const map = useMap();
    useEffect(() => {
        if (center) {
            map.flyTo(center, map.getZoom(), { animate: true, duration: 1.5 });
        }
    }, [center, map]);
    return null;
}

interface LiveMapProps {
    center: [number, number];
    activeTourists: Tourist[];
    openAlerts: Alert[];
    zones: Zone[];
    onPanicDetected?: (alert: Alert) => void;
}

export default function LiveMap({ center, activeTourists, openAlerts, zones, onPanicDetected }: LiveMapProps) {
    
    useEffect(() => {
        // Realtime listener to trigger a global feed refresh when ANY new alert hits the grid
        const channel = supabaseBrowser
            .channel('live-map-alerts')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'alerts' },
                (payload) => {
                    const newAlert = payload.new as Alert;
                    const isNewPanic = ['PANIC', 'SOS', 'FALL_DETECTED'].includes(newAlert.type || '');
                    if (isNewPanic && onPanicDetected) {
                        onPanicDetected(newAlert);
                    }
                }
            )
            .subscribe();

        return () => {
            supabaseBrowser.removeChannel(channel);
        };
    }, [onPanicDetected]);

    if (!center) return null;

    return (
        <MapContainer center={center} zoom={14} style={{ height: '100%', width: '100%', zIndex: 0 }} zoomControl={false}>
            <ChangeView center={center} />
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />
            
            {zones?.map((zone: Zone) => (
                <Circle
                    key={zone.id}
                    center={[zone.center_lat, zone.center_lng]}
                    radius={zone.radius || 500}
                    pathOptions={{ 
                        color: zone.type === 'RESTRICTED' ? '#ef4444' : '#10b981', 
                        fillColor: zone.type === 'RESTRICTED' ? '#ef4444' : '#10b981', 
                        fillOpacity: 0.1, 
                        dashArray: '10, 15', 
                        weight: 2 
                    }}
                />
            ))}

            {activeTourists?.map((t: Tourist) => {
                const hasAlert = openAlerts?.some((a: Alert) => a.tourist_id === t.id && (a.status === 'OPEN' || a.resolved === false));
                const lat = t.latitude ?? t.lat ?? 0;
                const lng = t.longitude ?? t.lng ?? 0;
                const pos: [number, number] = [lat, lng];

                if (!lat || !lng) return null;
                
                return (
                    <Marker 
                        key={t.id} 
                        position={pos} 
                        icon={hasAlert ? createSOSIcon() : createTouristIcon()}
                    >
                        <Popup className="custom-popup" closeButton={false}>
                             <div className="p-3 min-w-[160px] bg-white rounded-lg shadow-xl">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className={`w-2 h-2 rounded-full ${hasAlert ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`}></div>
                                    <p className="text-slate-900 text-[12px] font-black uppercase tracking-tight">{t.name}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-slate-500 text-[10px] font-mono leading-none">DEVICE: {t.device_id}</p>
                                    {hasAlert && (
                                        <p className="text-red-600 text-[10px] font-black uppercase tracking-widest mt-2 bg-red-50 py-1 px-2 rounded border border-red-100 flex items-center gap-2">
                                            <Radio size={12} className="animate-pulse" /> Critical Event Active
                                        </p>
                                    )}
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                );
            })}
        </MapContainer>
    );
}
