import React from 'react';
import { TileLayer, MapContainer, Marker, Popup } from 'react-leaflet';
import { GeoJSON } from 'react-leaflet/GeoJSON'
import geojson from '../departement-59-nord.json';
import L from 'leaflet';
import rdData from '../rd.json';
import { useEffect, useState, useRef } from 'react';
import { searchCity, getInterruptions, getRestrictions, getTelecom, getAssainissement, getEau, getElec, getGaz } from '../controllers/geocoding.controller';
import FilterComponent from './filter.component';

function MapComponent() {
    const [isNavOpen, setIsNavOpen] = useState(false);
    const [location, setLocation] = useState([50.62925, 3.057256]);
    const [geolocDetect, setGeolocDetect] = useState(false)
    const [interruptions, setInterruptions] = useState({});
    const [restrictions, setRestrictions] = useState({});
    const [telecom, setTelecom] = useState({});
    const [elec, setElec] = useState({});
    const [eau, setEau] = useState({});
    const [gaz, setGaz] = useState({});
    const [assainissement, setAssainissement] = useState({});
    const [rerenderRestr, setRerenderRestr] = useState(0);
    const [rerender, setRerender] = useState(0);
    const [rerenderTelecom, setRerenderTelecom] = useState(0);
    const [rerenderEau, setRerenderEau] = useState(0);
    const [rerenderElec, setRerenderElec] = useState(0);
    const [rerenderGaz, setRerenderGaz] = useState(0);
    const [rerenderAssainissement, setRerenderAssainissement] = useState(0);
    const mapRef = useRef(null);
    let highlightedDeviationLayer = null;
    const [restrictionShown, setRestrictionShown] = useState(true);
    const [interruptionShown, setInterruptionShown] = useState(true);
    const [telecomShown, setTelecomShown] = useState(true);
    const [elecShown, setElecShown] = useState(true);
    const [eauShown, setEauShown] = useState(true);
    const [gazShown, setGazShown] = useState(true);
    const [assainissementShown, setAssainissementShown] = useState(true);
    const [cityCoords, setCityCoords] = useState({});
    function formatDate(inputDate) {
        const dateParts = inputDate.split('+')[0].split('-'); // Sépare les parties de la date
        const day = dateParts[2];
        const month = dateParts[1];
        const year = dateParts[0];
        return `${day}/${month}/${year}`;
    }

    const toggleNav = () => {
        setIsNavOpen(!isNavOpen);
    };

    useEffect(() => {
        getInterruptions()
            .then((response) => {
                setInterruptions(response);
            })
            .catch((error) => {
                console.error('Erreur lors de la récupération des données GeoJSON :', error);
            });
        getRestrictions()
            .then((response) => {
                setRestrictions(response);
                console.log(response)
            })
            .catch((error) => {
                console.error('Erreur lors de la récupération des données GeoJSON :', error);
            });
        getTelecom()
            .then((response) => {
                setTelecom(response);
            })
            .catch((error) => {
                console.error('Erreur lors de la récupération des données GeoJSON :', error);
            });
        getElec()
            .then((response) => {
                setElec(response);
            })
            .catch((error) => {
                console.error('Erreur lors de la récupération des données GeoJSON :', error);
            });
        getEau()
            .then((response) => {
                setEau(response);
            })
            .catch((error) => {
                console.error('Erreur lors de la récupération des données GeoJSON :', error);
            });
        getAssainissement()
            .then((response) => {
                setAssainissement(response);
            })
            .catch((error) => {
                console.error('Erreur lors de la récupération des données GeoJSON :', error);
            });
        getGaz()
            .then((response) => {
                setGaz(response);
            })
            .catch((error) => {
                console.error('Erreur lors de la récupération des données GeoJSON :', error);
            });
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(success, error);
        } else {
            console.log("Geolocation is not supported by this browser");
        }
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
            const lengthCoord = parseInt(feature.geometry.coordinates[0].length / 2);
            let popupContent = '<div>';
            if (feature.properties.gdp_arretes_de_circulation_type_arrete) {
                popupContent += `<strong>Type:</strong> ${feature.properties.gdp_arretes_de_circulation_type_arrete}<br>`;
                if (feature.properties.gdp_arretes_de_circulation_type_arrete === "Interruption" && feature.properties.deviation) {
                    if (highlightedDeviationLayer) {
                        map.removeLayer(highlightedDeviationLayer);
                        highlightedDeviationLayer = null;
                    }
                    const deviationGeometry = feature.properties.deviation.geometry;
                    const deviationLayer = L.geoJSON(deviationGeometry);
                    deviationLayer.addTo(map).setStyle({
                        color: 'green',
                        weight: 5,
                    });
                    highlightedDeviationLayer = deviationLayer;
                }
            }
            if (feature.properties.gdp_arretes_de_circulation_nature) {
                popupContent += `<strong>Nature:</strong> ${feature.properties.gdp_arretes_de_circulation_nature}<br>`;
            }
            var date = ``;
            if (feature.properties.gdp_arretes_de_circulation_date_de_debut && feature.properties.gdp_arretes_de_circulation_date_de_fin) {
                var date = `dans la période du ${formatDate(feature.properties.gdp_arretes_de_circulation_date_de_debut)} au ${formatDate(feature.properties.gdp_arretes_de_circulation_date_de_fin)}`;
                if (feature.properties.gdp_arretes_de_circulation_nombre_de_jours === 1) {
                    date = `le ${formatDate(feature.properties.gdp_arretes_de_circulation_date_de_debut)}`;
                }
            }
            if (feature.properties.gdp_arretes_de_circulation_nombre_de_jours) {
                var jour = "jour";
                if (feature.properties.gdp_arretes_de_circulation_nombre_de_jours > 1) {
                    jour = "jours"
                }
                popupContent += `<strong>Durée d'intervention :</strong> ${feature.properties.gdp_arretes_de_circulation_nombre_de_jours} ${jour} ${date}<br>`;
            }
            if (feature.properties.en_cours_interdiction && feature.properties.en_cours_interdiction[0] !== null) {
                let interdictions = feature.properties.en_cours_interdiction[0].split("\n").map((str) => {
                    return `<li>${str}</li>`;
                });
                popupContent += `<strong>Interdiction(s):</strong><ul class="liste_interdictions">${interdictions.join("")}</ul>`
            }
            if (feature.properties.en_cours_alternat && feature.properties.en_cours_alternat[0] !== null) {
                popupContent += `<strong>Circulation alternée:</strong> Oui<br>`
            }
            if (feature.properties.en_cours_limitation) {
                let limitations = feature.properties.en_cours_limitation;
                popupContent += `<strong>Limitation(s):</strong> ${limitations}`
            }
            popupContent += '</div>';
            L.popup()
                .setLatLng([feature.geometry.coordinates[0][lengthCoord][1], feature.geometry.coordinates[0][lengthCoord][0]])
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

    const handleAtpClick = (feature, map) => {
        if (feature.properties) {
            const lengthCoord = parseInt(feature.geometry.coordinates[0].length / 2);
            let popupContent = '<div>';
            if (feature.properties.gdp_atp_sous_objet) {
                popupContent += `<strong>Objet:</strong> ${feature.properties.gdp_atp_sous_objet}<br>`;
            }
            if (feature.properties.gdp_atp_objet) {
                popupContent += `<strong>Nature:</strong> ${feature.properties.gdp_atp_objet}<br>`;
            }
            if (feature.properties.gdp_atp_date_demande && feature.properties.gdp_atp_duree_de_validite) {
                let dateDemandeStr = feature.properties.gdp_atp_date_demande.split('+')[0];
                let dateDemande = new Date(dateDemandeStr);
                let dureeEnMois = parseInt(feature.properties.gdp_atp_duree_de_validite.split(' ')[0]);
                if (dureeEnMois === 1) dureeEnMois = 12;
                let dateFin = new Date(dateDemande.getFullYear(), dateDemande.getMonth() + dureeEnMois, dateDemande.getDate());

                var date = `<strong>Date:</strong> Du ${dateDemande.toLocaleDateString('FR-fr')} au ${dateFin.toLocaleDateString('FR-fr')}<br>`;
                popupContent += date
            }
            if (feature.properties.gdp_atp_concessionnaire_designation) {
                popupContent += `<strong>Concessionnaire:</strong> ${feature.properties.gdp_atp_concessionnaire_designation}<br>`;
            }
            popupContent += '</div>';
            let latLng = feature.geometry.coordinates[0][lengthCoord] !== undefined ? [feature.geometry.coordinates[0][lengthCoord][1], feature.geometry.coordinates[0][lengthCoord][0]] : [feature.geometry.coordinates[1], feature.geometry.coordinates[0]]
            L.popup()
                .setLatLng(latLng)
                .setContent(popupContent)
                .openOn(map);
        }
    };

    const handleFilterChange = (filters) => {
        if (filters["Restriction"] === "restriction") {
            setRestrictionShown(true);
            setRerenderRestr(rerenderRestr + 1);
        } else {
            setRestrictionShown(false);
        }
        if (filters["Interruption"] === "interruption") {
            setInterruptionShown(true);
            setRerender(rerender + 1);
        } else {
            setInterruptionShown(false);
        }
        if (filters["Télécommunications"] === "telecom") {
            setTelecomShown(true);
            setRerenderTelecom(rerenderTelecom + 1);
        } else {
            setTelecomShown(false);
        }
        if (filters["Electricité"] === "elec") {
            setElecShown(true);
            setRerenderElec(rerenderElec + 1);
        }
        else {
            setElecShown(false);
        }
        if (filters["Eau potable"] === "eau") {
            setEauShown(true);
            setRerenderEau(rerenderEau + 1);
        }
        else {
            setEauShown(false);
        }
        if (filters["Gaz"] === "gaz") {
            setGazShown(true);
            setRerenderGaz(rerenderGaz + 1);
        } else {
            setGazShown(false);
        }
        if (filters["assainissement"] === "assainissement") {
            setAssainissementShown(true);
            setRerenderAssainissement(rerenderAssainissement + 1);
        } else {
            setAssainissementShown(false);
        }


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
            </div>
            <div className="row">
                <FilterComponent onFilterChange={handleFilterChange} isOpen={isNavOpen} />
                <div className={isNavOpen ? 'col-6' : 'col-12'}>
                    <MapContainer
                        className="markercluster-map"
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
                        <GeoJSON
                            data={rdData}
                            style={(feature) => {
                                return {
                                    color: '#00A9CE',
                                    weight: 2
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
                        {interruptionShown && interruptions && interruptions[0] && (
                            <GeoJSON
                                key={rerender + 1}
                                data={interruptions}
                                style={(feature) => {
                                    return {
                                        color: 'red',
                                        weight: 3,
                                    };
                                }}
                                onEachFeature={(feature, layer) => {
                                    layer.on({
                                        click: () => {
                                            handleFeatureClick(feature, mapRef.current);
                                        },
                                    });
                                }}
                                
                            />
                        )}
                        {interruptionShown && interruptions && interruptions[0] && interruptions.map((feature, index) => {
                            var lengthCoord = parseInt(feature.geometry.coordinates[0].length / 2)
                            if (feature.geometry.coordinates[0][lengthCoord]) {
                                return (
                                    <Marker
                                        key={index}
                                        position={[
                                            feature.geometry.coordinates[0][lengthCoord][1],
                                            feature.geometry.coordinates[0][lengthCoord][0],
                                        ]}
                                        icon={L.divIcon({
                                            className: 'custom-icon',
                                            html: `<img src="./images/B1.png" class="icone"/>`,
                                        })}
                                        eventHandlers={{
                                            click: (e) => {
                                                handleFeatureClick(feature, mapRef.current)
                                            },
                                        }}
                                    />
                                );
                            }
                        })}
                        {telecomShown && telecom && telecom[0] && telecom.map((feature, index) => {
                            var lengthCoord = parseInt(feature.geometry.coordinates[0].length / 2)
                            let markerIcon = L.divIcon({
                                className: 'custom-icon',
                                html: `<i class="fa-solid fa-phone" style="color:green"></i>`,
                            });
                            if (feature.geometry.type === "MultiLineString") {
                                return (
                                    <Marker
                                        key={feature.properties.gdp_atp_numero_arrete}
                                        position={[
                                            feature.geometry.coordinates[0][lengthCoord][1],
                                            feature.geometry.coordinates[0][lengthCoord][0],
                                        ]}
                                        icon={markerIcon}
                                        eventHandlers={{
                                            click: (e) => {
                                                handleAtpClick(feature, mapRef.current)
                                            },
                                        }}
                                    />
                                );
                            } else if (feature.geometry.type === "Point") {
                                return (
                                    <Marker
                                        key={feature.properties.gdp_atp_numero_arrete}
                                        position={[
                                            feature.geometry.coordinates[1],
                                            feature.geometry.coordinates[0],
                                        ]}
                                        icon={markerIcon}
                                        eventHandlers={{
                                            click: (e) => {
                                                handleAtpClick(feature, mapRef.current)
                                            },
                                        }}
                                    />
                                );
                            }
                        })}
                        {eauShown && eau && eau[0] && eau.map((feature, index) => {
                            var lengthCoord = parseInt(feature.geometry.coordinates[0].length / 2)
                            let markerIcon = L.divIcon({
                                className: 'custom-icon',
                                html: `<i class="fa-solid fa-droplet" style="color:blue"></i>`,
                            });
                            if (feature.geometry.type === "MultiLineString") {
                                return (
                                    <Marker
                                        key={feature.properties.gdp_atp_numero_arrete}
                                        position={[
                                            feature.geometry.coordinates[0][lengthCoord][1],
                                            feature.geometry.coordinates[0][lengthCoord][0],
                                        ]}
                                        icon={markerIcon}
                                        eventHandlers={{
                                            click: (e) => {
                                                handleAtpClick(feature, mapRef.current)
                                            },
                                        }}
                                    />
                                );
                            } else if (feature.geometry.type === "Point") {
                                return (
                                    <Marker
                                        key={feature.properties.gdp_atp_numero_arrete}
                                        position={[
                                            feature.geometry.coordinates[1],
                                            feature.geometry.coordinates[0],
                                        ]}
                                        icon={markerIcon}
                                        eventHandlers={{
                                            click: (e) => {
                                                handleAtpClick(feature, mapRef.current)
                                            },
                                        }}
                                    />
                                );
                            }
                        })}
                        {elecShown && elec && elec[0] && elec.map((feature, index) => {
                            var lengthCoord = parseInt(feature.geometry.coordinates[0].length / 2)

                            let markerIcon = L.divIcon({
                                className: 'custom-icon',
                                html: `<i class="fa-solid fa-bolt" style="color:red"></i>`,
                            });
                            if (feature.geometry.type === "MultiLineString") {
                                return (
                                    <Marker
                                        key={feature.properties.gdp_atp_numero_arrete}
                                        position={[
                                            feature.geometry.coordinates[0][lengthCoord][1],
                                            feature.geometry.coordinates[0][lengthCoord][0],
                                        ]}
                                        icon={markerIcon}
                                        eventHandlers={{
                                            click: (e) => {
                                                handleAtpClick(feature, mapRef.current)
                                            },
                                        }}
                                    />
                                );
                            } else if (feature.geometry.type === "Point") {
                                return (
                                    <Marker
                                        key={feature.properties.gdp_atp_numero_arrete}
                                        position={[
                                            feature.geometry.coordinates[1],
                                            feature.geometry.coordinates[0],
                                        ]}
                                        icon={markerIcon}
                                        eventHandlers={{
                                            click: (e) => {
                                                handleAtpClick(feature, mapRef.current)
                                            },
                                        }}
                                    />
                                );
                            }
                        })}
                        {assainissementShown && assainissement && assainissement[0] && assainissement.map((feature, index) => {
                            var lengthCoord = parseInt(feature.geometry.coordinates[0].length / 2)

                            let markerIcon = L.divIcon({
                                className: 'custom-icon',
                                html: `<i class="fa-solid fa-droplet" style="color:brown"></i>`,
                            });
                            if (feature.geometry.type === "MultiLineString") {
                                return (
                                    <Marker
                                        key={feature.properties.gdp_atp_numero_arrete}
                                        position={[
                                            feature.geometry.coordinates[0][lengthCoord][1],
                                            feature.geometry.coordinates[0][lengthCoord][0],
                                        ]}
                                        icon={markerIcon}
                                        eventHandlers={{
                                            click: (e) => {
                                                handleAtpClick(feature, mapRef.current)
                                            },
                                        }}
                                    />
                                );
                            } else if (feature.geometry.type === "Point") {
                                return (
                                    <Marker
                                        key={feature.properties.gdp_atp_numero_arrete}
                                        position={[
                                            feature.geometry.coordinates[1],
                                            feature.geometry.coordinates[0],
                                        ]}
                                        icon={markerIcon}
                                        eventHandlers={{
                                            click: (e) => {
                                                handleAtpClick(feature, mapRef.current)
                                            },
                                        }}
                                    />
                                );
                            }
                        })}
                        {gazShown && gaz && gaz[0] && gaz.map((feature, index) => {
                            var lengthCoord = parseInt(feature.geometry.coordinates[0].length / 2)

                            let markerIcon = L.divIcon({
                                className: 'custom-icon',
                                html: `<i class="fa-solid fa-fire-flame-curved" style="color:yellow"></i>`,
                            });
                            if (feature.geometry.type === "MultiLineString") {
                                return (
                                    <Marker
                                        key={feature.properties.gdp_atp_numero_arrete}
                                        position={[
                                            feature.geometry.coordinates[0][lengthCoord][1],
                                            feature.geometry.coordinates[0][lengthCoord][0],
                                        ]}
                                        icon={markerIcon}
                                        eventHandlers={{
                                            click: (e) => {
                                                handleAtpClick(feature, mapRef.current)
                                            },
                                        }}
                                    />
                                );
                            } else if (feature.geometry.type === "Point") {
                                return (
                                    <Marker
                                        key={feature.properties.gdp_atp_numero_arrete}
                                        position={[
                                            feature.geometry.coordinates[1],
                                            feature.geometry.coordinates[0],
                                        ]}
                                        icon={markerIcon}
                                        eventHandlers={{
                                            click: (e) => {
                                                handleAtpClick(feature, mapRef.current)
                                            },
                                        }}
                                    />
                                );
                            }
                        })}

                        {restrictionShown && restrictions && restrictions[0] && (
                            <GeoJSON
                                key={rerender + 1}
                                data={restrictions}
                                style={(feature) => {
                                    return {
                                        color: 'orange',
                                        weight: 3,
                                    };
                                }}
                                onEachFeature={(feature, layer) => {
                                    layer.on({
                                        click: () => {
                                            handleFeatureClick(feature, mapRef.current);
                                        },
                                    });
                                }}
                            />
                        )}
                        {restrictionShown && restrictions && restrictions[0] && restrictions.map((feature, index) => {
                            var lengthCoord = parseInt(feature.geometry.coordinates[0].length / 2)
                            if (feature.geometry.coordinates[0][lengthCoord]) {
                                return (
                                    <Marker
                                        key={index}
                                        position={[
                                            feature.geometry.coordinates[0][lengthCoord][1],
                                            feature.geometry.coordinates[0][lengthCoord][0],
                                        ]}
                                        icon={L.divIcon({
                                            className: 'custom-icon',
                                            html: `<img src="./images/AK14.png" class="icone"/>`,
                                        })}
                                        eventHandlers={{
                                            click: (e) => {
                                                handleFeatureClick(feature, mapRef.current)
                                            },
                                        }}
                                    />
                                );
                            }
                        })}
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

export default MapComponent;
