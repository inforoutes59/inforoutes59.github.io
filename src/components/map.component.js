import React from 'react';
import { TileLayer, MapContainer, Marker, Popup, ZoomControl } from 'react-leaflet';
import Legend from './legend.component';
import { GeoJSON } from 'react-leaflet/GeoJSON'
import geojson from '../departement-59-nord.json';
import communes from '../communes.json';
import L from 'leaflet';
import rdData from '../rd.json';
import { useEffect, useState, useRef } from 'react';
import { searchCity, getInterruptions, getRestrictions, getTelecom, getAssainissement, getEau, getElec, getGaz } from '../controllers/geocoding.controller';
import FilterComponent from './filter.component';
import { useNavigate } from 'react-router-dom';

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
    const mapRef = useRef(null);
    let highlightedDeviationLayer = null;
    const [restrictionShown, setRestrictionShown] = useState(true);
    const [interruptionShown, setInterruptionShown] = useState(true);
    const [telecomShown, setTelecomShown] = useState(true);
    const [elecShown, setElecShown] = useState(true);
    const [eauShown, setEauShown] = useState(true);
    const [gazShown, setGazShown] = useState(true);
    const [assainissementShown, setAssainissementShown] = useState(true);
    const [zoom, setZoom] = useState(9);
    const firstRender = useRef(false);


    const navigate = useNavigate();

    const handleButtonClick = () => {
        navigate('/couche');
    };

    function formatDate(inputDate) {
        const dateParts = inputDate.split('+')[0].split('-');
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
            const watchId = navigator.geolocation.watchPosition(success, error);

            return () => {
                navigator.geolocation.clearWatch(watchId);
            };
        } else {
            console.log("Geolocation is not supported by this browser");
        }
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        if (highlightedDeviationLayer) {
            mapRef.current.removeLayer(highlightedDeviationLayer);
            highlightedDeviationLayer = null;
        }
        let searchValue = document.querySelector('#search-input').value;
        const regexNumber = /\d/;
        let searchPoint = '';
        let searchLetter = '';
        if (regexNumber.test(searchValue)) {
            if (searchValue.includes(' ')) {
                searchValue = searchValue.replaceAll(' ', '');
            }
            let searchNum = searchValue;
            if (/[a-zA-Z]/.test(searchValue)) {
                searchNum = searchValue.replace('RD', '');
                searchNum = searchNum.replace('Rd', '');
                searchNum = searchNum.replace('rd', '');
                searchNum = searchNum.replace('rD', '');
                if (/^D/.test(searchNum)) {
                    searchNum = searchNum.substring(1);
                }
                if (/^d/.test(searchNum)) {
                    searchNum = searchNum.substring(1);
                }
                console.log(searchNum);
            }
            if (searchValue.includes('.')) {
                if (searchValue.split('.')[1].length < 2) {
                    searchPoint = `.${searchValue.split('.')[1].padStart(2, '0')}`
                } else {
                    searchPoint = `.${searchValue.split('.')[1]}`
                }
                searchNum = searchValue.split('.')[0];
            }
            if (/[a-zA-Z]/.test(searchNum)) {
                let match = searchNum.match(/(.*?)([A-Za-z]+)$/);

                if (match) {
                    searchNum = match[1];
                    searchLetter = match[2];
                    if (searchLetter.toLowerCase() === 'g') {
                        searchLetter = ` ${searchLetter}`;
                    }
                } else if (searchNum.match(/(\d+)([A-Za-z]+\d*)$/)) {
                    match = searchNum.match(/(\d+)([A-Za-z]+\d*)$/);
                    console.log(match)
                    searchNum = match[1];
                    searchLetter = match[2];
                }
            }
            if (searchNum.length < 4) {
                searchNum = searchNum.padStart(4, '0');
            }
            searchNum = `RD${searchNum}${searchLetter}${searchPoint}`;
            rdData.features.forEach((feature) => {
                if (feature.properties.designation.toLowerCase() === searchNum.toLowerCase()) {
                    const bounds = L.geoJSON(feature).getBounds();
                    mapRef.current.fitBounds(bounds);
                    const geometryRD = feature.geometry;
                    const rdLayer = L.geoJSON(geometryRD, {
                        style: {
                            color: 'blue',
                            weight: 7,
                        },
                    });
                    rdLayer.addTo(mapRef.current);
                    highlightedDeviationLayer = rdLayer;
                }
            });
        } else {
            searchCity(searchValue)
                .then((city) => {
                    communes.features.forEach((feature) => {
                        if (feature.properties.name.toLowerCase() === city.name.toLowerCase()) {
                            const bounds = L.geoJSON(feature).getBounds();
                            mapRef.current.fitBounds(bounds);
                            const geometryCommune = feature.geometry;
                            const communeLayer = L.geoJSON(geometryCommune, {
                                style: {
                                    color: 'blue',
                                    weight: 7,
                                },
                            });
                            communeLayer.addTo(mapRef.current);
                            highlightedDeviationLayer = communeLayer;
                        }
                    });
                })
                .catch((error) => {
                    console.error(error.message);
                });
        }
        mapRef.current.on('click', function (event) {
            if (highlightedDeviationLayer) {
                mapRef.current.removeLayer(highlightedDeviationLayer);
                highlightedDeviationLayer = null;
                document.getElementById('search-input').value = '';
            }
        }
        );
    };

    const handleRdClick = (feature, map, e) => {
        if (feature.properties) {
            let popupContent = '<div>';
            if (feature.properties.designation) {
                popupContent += `${feature.properties.designation}`;
            }
            popupContent += '</div>';
            L.popup()
                .setLatLng(e.latlng)
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


    const handleFeatureClick = (feature, map) => {
        if (feature.properties) {
            const lengthCoord = parseInt(feature.geometry.coordinates[0].length / 2);
            let popupContent = '<div>';
            if (feature.properties.voie_designation) {
                popupContent += `<strong>Voie: </strong> ${feature.properties.voie_designation}<br>`;
            }
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
                date = `dans la période du ${formatDate(feature.properties.gdp_arretes_de_circulation_date_de_debut)} au ${formatDate(feature.properties.gdp_arretes_de_circulation_date_de_fin)}`;
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

            if (feature.properties.gdp_arretes_de_circulation_type_arrete) {
                if (feature.properties.gdp_arretes_de_circulation_type_arrete === "Interruption" && feature.properties.deviation) {
                    mapRef.current.fitBounds(highlightedDeviationLayer.getBounds());
                } else {
                    if (mapRef.current.getZoom() < 14) {
                        mapRef.current.setView([feature.geometry.coordinates[0][lengthCoord][1], feature.geometry.coordinates[0][lengthCoord][0]], 14);
                    } else {
                        mapRef.current.setView([feature.geometry.coordinates[0][lengthCoord][1], feature.geometry.coordinates[0][lengthCoord][0]], mapRef.current.getZoom());
                    }
                }
            }
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
        setGeolocDetect(true);
        if (!firstRender.current) {
            setZoom(12);
            mapRef.current.setView([latitude, longitude], 12);
            firstRender.current = true;
        }
    }

    const error = () => {
        console.log("Unable to retrieve your location");
    }

    const handleAtpClick = (feature, map) => {
        if (feature.properties) {
            const lengthCoord = parseInt(feature.geometry.coordinates[0].length / 2);
            let popupContent = '<div>';
            if (feature.properties.voie_designation) {
                popupContent += `<strong>Voie:</strong> ${feature.properties.voie_designation}<br>`;
            }
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
            if (mapRef.current.getZoom() < 14) {
                mapRef.current.setView(latLng, 14);
            } else {
                mapRef.current.setView(latLng, mapRef.current.getZoom());
            }

        }
    };

    const handleFilterChange = (filters) => {
        if (filters["Restriction"] === "restriction") {
            setRestrictionShown(true);
        } else {
            setRestrictionShown(false);
        }
        if (filters["Interruption"] === "interruption") {
            setInterruptionShown(true);
        } else {
            setInterruptionShown(false);
        }
        if (filters["Télécommunications"] === "telecom") {
            setTelecomShown(true);
        } else {
            setTelecomShown(false);
        }
        if (filters["Electricité"] === "elec") {
            setElecShown(true);
        }
        else {
            setElecShown(false);
        }
        if (filters["Eau potable"] === "eau") {
            setEauShown(true);
        }
        else {
            setEauShown(false);
        }
        if (filters["Gaz"] === "gaz") {
            setGazShown(true);
        } else {
            setGazShown(false);
        }
        if (filters["assainissement"] === "assainissement") {
            setAssainissementShown(true);
        } else {
            setAssainissementShown(false);
        }


    };

    const handleCenterLocation = () => {
        mapRef.current.setView(location, 12);
    }

    return (
        <div className='container-fluid'>
            <div className='row' id="navbar">
                <div className={`burger-icon col-1 ${isNavOpen ? 'open' : ''}`} onClick={toggleNav}>
                    <div className='bar'></div>
                    <div className='bar'></div>
                    <div className='bar'></div>
                </div>
                <form onSubmit={handleSearch} className="col-6" id="search-bar">
                    <input id="search-input" type="text" name="city" placeholder="Ville" />
                    <button type="submit">Rechercher</button>
                </form>
                <button onClick={handleButtonClick} className="button-change-page col-5">Module couches de roulement</button>
            </div>
            <div className="row">
                <FilterComponent onFilterChange={handleFilterChange} isOpen={isNavOpen} />
                <div className={isNavOpen ? 'col-6' : 'col-12'}>
                    {geolocDetect && (
                        <button onClick={handleCenterLocation} className="button-location">Centrer sur ma position</button>
                    )}
                    <MapContainer
                        className="markercluster-map"
                        center={location}
                        zoom={zoom}
                        maxZoom={18}
                        ref={mapRef}
                        zoomControl={false}
                    >
                        {geojson.features.map((feature, index) => {
                            let colorArrondissement = '#eb3434';
                            let zindex = 99
                            if (feature.properties.Name === "ARRONDISSEMENT ROUTIER AVESNES") {
                                colorArrondissement = '#ebd834';
                            } else if (feature.properties.Name === "ARRONDISSEMENT ROUTIER CAMBRAI") {
                                colorArrondissement = '#34eb71';
                            } else if (feature.properties.Name === "ARRONDISSEMENT ROUTIER DOUAI") {
                                colorArrondissement = '#eb34e8';
                            } else if (feature.properties.Name === "ARRONDISSEMENT ROUTIER DUNKERQUE") {
                                colorArrondissement = '#345eeb';
                            } else if (feature.properties.Name === "MEL") {
                                colorArrondissement = 'grey';
                                zindex = 98
                            }
                            return (<GeoJSON
                                data={feature}
                                style={{
                                    fillColor: 'transparent',
                                    fillRule: 'nonzero',
                                    color: colorArrondissement,
                                    weight: 2,
                                    fillOpacity: 0.6,
                                    zIndex: zindex
                                }}
                            />)
                        })
                        }
                        <GeoJSON
                            data={rdData}
                            style={(feature) => {
                                return {
                                    color: '#00A9CE',
                                    weight: 2
                                };
                            }}
                            onEachFeature={(feature, layer) => {
                                layer.on({
                                    click: (e) => {
                                        handleRdClick(feature, mapRef.current, e);
                                    },
                                });
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
                        {restrictionShown && restrictions && restrictions[0] && (
                            <GeoJSON
                                key={0}
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
                                className="restriction"
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
                            } else {
                                return (
                                    <Marker
                                        key={index}
                                        position={[
                                            feature.geometry.coordinates[1],
                                            feature.geometry.coordinates[0],
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
                        {interruptionShown && interruptions && interruptions[0] && (
                            <GeoJSON
                                key={1}
                                data={interruptions}
                                style={(feature) => {
                                    return {
                                        color: 'red',
                                        weight: 4,
                                    };
                                }}
                                onEachFeature={(feature, layer) => {
                                    layer.on({
                                        click: () => {
                                            handleFeatureClick(feature, mapRef.current);
                                        },
                                    });
                                }}
                                className="interruption"
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
                            } else {
                                return (
                                    <Marker
                                        key={index}
                                        position={[
                                            feature.geometry.coordinates[1],
                                            feature.geometry.coordinates[0],
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
                            } else {
                                return null;
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
                            } else {
                                return null;
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
                            } else {
                                return null;
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
                            } else {
                                return null;
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
                            } else {
                                return null;
                            }
                        })}
                        <Legend arrondissements={geojson} />
                        <ZoomControl position="topright" />
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
