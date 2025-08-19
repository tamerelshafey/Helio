import React from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import type { Language } from '../App';
import { translations } from '../data/translations';
import { propertiesData } from '../data/properties';
import { BedIcon, BathIcon, AreaIcon } from './icons/Icons';

interface PropertiesMapPageProps {
  language: Language;
}

// Custom amber icon for the map markers
const amberIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const PropertiesMapPage: React.FC<PropertiesMapPageProps> = ({ language }) => {
    const t = translations[language];
    const map_t = t.propertiesMapPage;
    const card_t = t.propertyCard;
    const position: [number, number] = [30.122421, 31.605335]; // Center of New Heliopolis

    return (
        <div className="bg-gray-900">
            <div className="container mx-auto px-6 py-12">
                 <div className="text-center mb-10">
                    <h1 className="text-4xl md:text-5xl font-bold text-white">{map_t.title}</h1>
                    <p className="text-lg text-gray-400 mt-4 max-w-2xl mx-auto">{map_t.subtitle}</p>
                </div>
            </div>
            <div className="h-[75vh] w-full">
                <MapContainer center={position} zoom={14} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    {propertiesData.map(prop => (
                        <Marker key={prop.id} position={[prop.location.lat, prop.location.lng]} icon={amberIcon}>
                            <Popup>
                               <div className="w-full">
                                    <img src={prop.imageUrl} alt={prop.title[language]} className="w-full h-32 object-cover rounded-t-lg" />
                                    <div className="p-4">
                                        <h3 className="text-md font-bold text-amber-500 mb-1 truncate">{prop.title[language]}</h3>
                                        <p className="text-sm font-semibold text-gray-200 mb-3">{prop.price[language]}</p>
                                         <div className="flex justify-between items-center text-gray-400 text-xs border-t border-gray-600 pt-3">
                                            <div className="flex items-center gap-1">
                                                <BedIcon className="w-4 h-4 text-gray-500" />
                                                <span>{prop.beds} {card_t.beds}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <BathIcon className="w-4 h-4 text-gray-500" />
                                                <span>{prop.baths} {card_t.baths}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <AreaIcon className="w-4 h-4 text-gray-500" />
                                                <span>{prop.area} {card_t.area}</span>
                                            </div>
                                        </div>
                                        <Link 
                                            to={`/properties/${prop.id}`}
                                            className="mt-4 block w-full text-center bg-amber-500 text-gray-900 font-semibold px-3 py-2 rounded-md text-sm hover:bg-amber-600 transition-colors"
                                        >
                                           {map_t.viewDetails}
                                        </Link>
                                    </div>
                               </div>
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>
            </div>
        </div>
    );
};

export default PropertiesMapPage;
