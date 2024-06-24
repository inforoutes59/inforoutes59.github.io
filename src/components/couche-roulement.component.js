import React from 'react';
import { TileLayer, MapContainer, Marker, Popup } from 'react-leaflet';
import { GeoJSON } from 'react-leaflet/GeoJSON'
import geojson from '../departement-59-nord.json';
import L, { popup } from 'leaflet';
import { useEffect, useState, useRef } from 'react';
import { searchCity, getCoucheRoulement } from '../controllers/geocoding.controller';
import { useNavigate } from 'react-router-dom';


function CoucheRoulementComponent() {
    const [isNavOpen, setIsNavOpen] = useState(false);
    const [location, setLocation] = useState([50.62925, 3.057256]);
    const [geolocDetect, setGeolocDetect] = useState(false)
    const mapRef = useRef(null);
    let highlightedDeviationLayer = null;
    const [couche, setCouche] = useState([]);
    const [cityCoords, setCityCoords] = useState({});
    function formatDate(inputDate) {
        const dateParts = inputDate.split('+')[0].split('-'); // Sépare les parties de la date
        const day = dateParts[2];
        const month = dateParts[1];
        const year = dateParts[0];
        return `${day}/${month}/${year}`;
    }

    const navigate = useNavigate();

    const handleButtonClick = () => {
        navigate('/');
    };

    const toggleNav = () => {
        setIsNavOpen(!isNavOpen);
    };

    useEffect(() => {
        getCoucheRoulement()
            .then((response) => {
                setCouche(JSON.parse(response.data));
                console.log(JSON.parse(response.data))
            })
            .catch((error) => {
                console.error('Erreur lors de la récupération des données GeoJSON :', error);
            });
        // if(navigator.geolocation){
        //     navigator.geolocation.getCurrentPosition(success, error);
        // } else {
        //     console.log("Geolocation is not supported by this browser");
        // }
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        const cityName = e.target.elements.city.value;
        searchCity(cityName)
            .then((coords) => {
                setCityCoords(coords);
                mapRef.current.setView(coords, 12);
            })
            .catch((error) => {
                console.error(error.message);
            });
    };

    const handleFeatureClick = (feature, map) => {
        if (feature.properties) {
            if (highlightedDeviationLayer) {
                map.removeLayer(highlightedDeviationLayer);
                highlightedDeviationLayer = null;
            }
            const deviationGeometry = feature.geometry;
            const deviationLayer = L.geoJSON(deviationGeometry);
            deviationLayer.addTo(map).setStyle({
                color: 'blue',
                weight: 5,
            });
            highlightedDeviationLayer = deviationLayer;
            const lengthCoord = parseInt(feature.geometry.coordinates[0].length / 2);
            let popupContent = '<div>';
            if (feature.properties.voie_designation) {
                popupContent += `<strong>Voie:</strong> ${feature.properties.voie_designation}<br>`;
            }
            if (feature.properties.ploabscissedebut && feature.properties.ploabscissefin) {
                popupContent += `<strong>Plo+Abs :</strong> Du PR ${feature.properties.ploabscissedebut} au PR ${feature.properties.ploabscissefin}<br>`;
            }
            if (feature.properties.en_hors_agglo_formule) {
                popupContent += `<strong>Agglomération:</strong> ${feature.properties.en_hors_agglo_formule}<br>`;
            }
            if (feature.properties.categorie_technique_code_categorie) {
                popupContent += `<strong>Catégorie technique:</strong> ${feature.properties.categorie_technique_code_categorie}<br>`;
            }
            if (feature.properties.couche_de_surface_code_de_couche) {
                popupContent += `<strong>Couche de surface:</strong> ${feature.properties.couche_de_surface_code_de_couche}<br>`;
            }
            if (feature.properties.couche_de_surface_epaisseur_cm) {
                popupContent += `<strong>Epaisseur:</strong> ${feature.properties.couche_de_surface_epaisseur_cm} cm<br>`;
            }
            if (feature.properties.couche_de_surface_date_couche) {
                popupContent += `<strong>Date de la couche</strong> ${formatDate(feature.properties.couche_de_surface_date_couche)}<br>`;
            }
            if (feature.properties.couche_de_surface_granulat) {
                popupContent += `<strong>Granulat:</strong> ${feature.properties.couche_de_surface_granulat}<br>`;
            }
            if (feature.properties.couche_de_surface_granulometrie) {
                popupContent += `<strong>Granulométrie:</strong> ${feature.properties.couche_de_surface_granulometrie}<br>`;
            }
            if (feature.properties.notation_2023_note_surface) {
                popupContent += `<strong>Note:</strong> ${feature.properties.notation_2023_note_surface}<br>`;
            }
            if(feature.properties.notation_2023_indicateur){
                popupContent += `<strong>Etat:</strong> ${feature.properties.notation_2023_indicateur}<br>`;
            }
            if (feature.properties.couche_de_surface_presence_d_amiante) {
                popupContent += `<strong>Présence d'amiante:</strong> ${feature.properties.couche_de_surface_presence_d_amiante}<br>`;
            }
            if (feature.properties.couche_de_surface_presence_d_hap) {
                popupContent += `<strong>Présence d'HAP:</strong> ${feature.properties.couche_de_surface_presence_d_hap}<br>`;
            }
            popupContent += '</div>';
            let latLng = feature.geometry.coordinates[0][lengthCoord] !== undefined ? [feature.geometry.coordinates[0][lengthCoord][1], feature.geometry.coordinates[0][lengthCoord][0]] : [feature.geometry.coordinates[1], feature.geometry.coordinates[0]]
            L.popup()
                .setLatLng(latLng)
                .setContent(popupContent)
                .openOn(map);
            mapRef.current.on('popupclose', () => {
                if (highlightedDeviationLayer) {
                    mapRef.current.removeLayer(highlightedDeviationLayer);
                    highlightedDeviationLayer = null;
                }
            });
        }
    };

    const success = (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        setLocation([latitude, longitude]);
        setGeolocDetect(true)
    }

    const error = () => {
        console.log("Unable to retrieve your location");
    }

    const getFeatureStyle = (feature) => {
        const status = feature.properties.notation_2023_indicateur;
        let color;
    
        switch (status) {
            case 'Excellent':
              color = '#00ff00';
              break;
            case 'Bon':
              color = '#80ff00';
              break;
            case 'Moyen':
              color = '#ffff00';
              break;
            case 'Mauvais':
              color = '#ff8000';
              break;
            case 'Détérioré':
              color = '#ff0000';
              break;
            default:
              color = 'gray';
          }
        return {
          color: color,
          weight: 3,
        };
      };


    return (
        <div className='container-fluid'>
            <div className='row' id="navbar">
                <div className={`burger-icon col-1 ${isNavOpen ? 'open' : ''}`} onClick={toggleNav}>
                    <div className='bar'></div>
                    <div className='bar'></div>
                    <div className='bar'></div>
                </div>
                <form onSubmit={handleSearch} className="col-11" id="search-bar">
                    <input id="search-input" type="text" name="city" placeholder="Ville" />
                    <button type="submit">Rechercher</button>
                </form>
                <button onClick={handleButtonClick} className="button-change-page">Module arrêtés de circulation</button>
            </div>
            <div className="row">
                <div className={isNavOpen ? 'col-6' : 'col-12'}>
                    <MapContainer
                        center={location}
                        zoom={9}
                        maxZoom={18}
                        ref={mapRef}
                    >
                        <GeoJSON
                            data={geojson}
                            style={(feature) => {
                                return {
                                    fillColor: 'transparent',
                                    color: '#00A9CE',
                                    weight: 2,
                                    fillOpacity: 0.6
                                };
                            }}
                        />
                        {geolocDetect && (<Marker
                            position={location}
                            icon={L.divIcon({
                                className: 'custom-icon',
                                html: `<i class="fa-solid fa-location-dot"></i>`,
                            })}
                        >
                            <Popup>Vous êtes ici</Popup>
                        </Marker>)}
                        {couche && couche[0] &&(
                            <GeoJSON
                                data={couche[0].features.filter((feature) => { return feature.geometry && feature.geometry.type === "MultiLineString" })}
                                style={getFeatureStyle}
                                onEachFeature={(feature, layer) => {
                                    layer.on({
                                        click: () => {
                                            handleFeatureClick(feature, mapRef.current);
                                        },
                                    });
                                }}
                            />
                        )}
                        <TileLayer
                            url="https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}.png"
                            attribution='<a href="https://stadiamaps.com/">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> contributors'
                        />
                    </MapContainer>
                </div>
            </div>
        </div>
    );
}

export default CoucheRoulementComponent;
