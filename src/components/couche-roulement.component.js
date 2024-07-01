import React from 'react';
import { TileLayer, MapContainer, Marker, Popup } from 'react-leaflet';
import { GeoJSON } from 'react-leaflet/GeoJSON'
import geojson from '../departement-59-nord.json';
import L, { popup } from 'leaflet';
import { useEffect, useState, useRef } from 'react';
import { searchCity, getCoucheRoulement } from '../controllers/geocoding.controller';
import { useNavigate } from 'react-router-dom';
import communes from '../communes.json';
import rdData from '../rd.json';
import Legend from './legend.component';
import { ZoomControl } from 'react-leaflet';
import { saveAs } from 'file-saver';

function CoucheRoulementComponent() {
    const [location, setLocation] = useState([50.62925, 3.057256]);
    const [geolocDetect, setGeolocDetect] = useState(false);
    const mapRef = useRef(null);
    let highlightedDeviationLayer = null;
    let marker = null;
    const [couche, setCouche] = useState([]);
    let featuresWithComments = useRef([]);
    const selectedFeatureRef = useRef(null);
    const [isFeatureClicked, setIsFeatureClicked] = useState(false);
    const coordinatesRef = useRef(null);
    const firstRender = useRef(false);


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


    useEffect(() => {
        getCoucheRoulement()
            .then((response) => {
                //setCouche(JSON.parse(response.data))
                setCouche(response);
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
        const searchValue = document.querySelector('#search-input').value;
        const regexNumber = /\d/;
        if (regexNumber.test(searchValue)) {
            let searchNum = searchValue;
            if (searchNum.length < 4 && !searchValue.includes('.') && !searchValue.includes(' ') && !searchValue.includes('G')) {
                searchNum = searchValue.replace(/\D/g, '');
                searchNum = searchNum.padStart(4, '0');
            } else {
                if (searchValue.includes('.')) {
                    searchNum = searchValue.replace(/A-Za-z/g, '');
                    searchNum = searchValue.split('.')[0];
                    if (searchNum.length < 4) {
                        searchNum = searchNum.padStart(4, '0');
                    }
                    if (searchValue.split('.')[1].length < 2) {
                        searchNum = `${searchNum}.${searchValue.split('.')[1].padStart(2, '0')}`
                    } else {
                        searchNum = `${searchNum}.${searchValue.split('.')[1]}`
                    }
                } else if (searchValue.includes(' ')) {
                    searchNum = searchValue.replace(/A-Za-z/g, '');
                    searchNum = searchValue.split(' ')[0];
                    if (searchNum.length < 4) {
                        searchNum = searchNum.padStart(4, '0');
                    }
                    searchNum = `${searchNum} ${searchValue.split(' ')[1]}`
                } else if (searchValue.includes('G')) {
                    searchNum = searchValue.replace('RD', '');
                    searchNum = searchValue.split('G')[0];
                    console.log(searchNum);
                    if (searchNum.length < 4) {
                        searchNum = searchNum.padStart(4, '0');
                    }
                    searchNum = `${searchNum} G`
                }
            }
            searchNum = `RD${searchNum}`
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

    const handleFeatureClick = (e, feature, map) => {
        if (feature.properties) {
            if (highlightedDeviationLayer) {
                map.removeLayer(highlightedDeviationLayer);
                highlightedDeviationLayer = null;
            }
            if (marker) {
                map.removeLayer(marker);
                marker = null;
            }
            const deviationGeometry = feature.geometry;
            const deviationLayer = L.geoJSON(deviationGeometry);
            deviationLayer.addTo(map).setStyle({
                color: 'blue',
                weight: 5,
            });
            highlightedDeviationLayer = deviationLayer;
            const lengthCoord = parseInt(feature.geometry.coordinates[0].length / 2);
            selectedFeatureRef.current = feature;
            coordinatesRef.current = e.latlng
            const markLayer = L.marker()
                .setIcon(L.divIcon({
                    className: 'custom-icon',
                    html: `<i class="fa-solid fa-thumbtack"></i>`,
                }))
                .setLatLng(coordinatesRef.current)
            markLayer.addTo(map);
            marker = markLayer;
            setIsFeatureClicked(true);
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
                popupContent += `<strong>Date de la couche:</strong> ${formatDate(feature.properties.couche_de_surface_date_couche)}<br>`;
            }
            if (feature.properties.couche_de_surface_granulat) {
                popupContent += `<strong>Granulat:</strong> ${feature.properties.couche_de_surface_granulat}<br>`;
            }
            if (feature.properties.couche_de_surface_granulometrie) {
                popupContent += `<strong>Granulométrie:</strong> ${feature.properties.couche_de_surface_granulometrie}<br>`;
            }
            if (feature.properties.notation_note_globale !== null) {
                popupContent += `<strong>Note globale:</strong> ${feature.properties.notation_note_globale}<br>`;
            }
            if (feature.properties.notation_note_surface !== null) {
                popupContent += `<strong>Note de surface:</strong> ${feature.properties.notation_note_surface}<br>`;
            }
            if (feature.properties.notation_note_structure !== null) {
                popupContent += `<strong>Note de structure:</strong> ${feature.properties.notation_note_structure}<br>`;
            }
            if (feature.properties.notation_indicateur) {
                popupContent += `<strong>Etat:</strong> ${feature.properties.notation_indicateur}<br>`;
            }
            if (feature.properties.couche_de_surface_presence_d_amiante) {
                popupContent += `<strong>Présence d'amiante:</strong> ${feature.properties.couche_de_surface_presence_d_amiante}<br>`;
            }
            if (feature.properties.couche_de_surface_presence_d_hap) {
                popupContent += `<strong>Présence d'HAP:</strong> ${feature.properties.couche_de_surface_presence_d_hap}<br>`;
            }
            if (feature.properties.suivi_des_operations_echeance) {
                popupContent += `<strong>Echéance:</strong> ${feature.properties.suivi_des_operations_echeance}<br>`;
            }
            if (feature.properties.suivi_des_operations_proposition_travaux) {
                popupContent += `<strong>Proposition de travaux:</strong> ${feature.properties.suivi_des_operations_proposition_travaux}<br>`;
            }
            popupContent += '</div>';
            //let latLng = feature.geometry.coordinates[0][lengthCoord] !== undefined ? [feature.geometry.coordinates[0][lengthCoord][1], feature.geometry.coordinates[0][lengthCoord][0]] : [feature.geometry.coordinates[1], feature.geometry.coordinates[0]]

            L.popup()
                .setLatLng(coordinatesRef.current)
                .setContent(popupContent)
                .openOn(map);

            mapRef.current.on('popupclose', () => {
                if (highlightedDeviationLayer) {
                    mapRef.current.removeLayer(highlightedDeviationLayer);
                    highlightedDeviationLayer = null;
                    mapRef.current.removeLayer(marker);
                    marker = null;
                    selectedFeatureRef.current = null;
                    coordinatesRef.current = null;
                    setIsFeatureClicked(false);
                }
            });
        }
    };

    const handleFeatureComment = (e) => {
        e.preventDefault();
        const commentaire = document.querySelector('#comm-input').value;
        if (commentaire) {
            if (selectedFeatureRef.current !== null) {
                featuresWithComments.current.push({ feature: selectedFeatureRef.current, commentaire: commentaire, coords: coordinatesRef.current });
                document.querySelector('#comm-input').value = '';
            } else {
                alert('Veuillez sélectionner un élément avant de commenter')
            }
        } else {
            alert('Veuillez saisir un commentaire')
        }
    }

    const handleExport = () => {
        const header = ["Voie", "Plo+Abs", "Commentaire", "Latitude", "Longitude", "Date du commentaire"];
        const rows = featuresWithComments.current.map(item => {
            let feature = item.feature;
            const latLng = item.coords
            return [
                feature.properties.voie_designation || "",
                feature.properties.ploabscissedebut && feature.properties.ploabscissefin ? `Du PR ${feature.properties.ploabscissedebut} au PR ${feature.properties.ploabscissefin}` : "",
                item.commentaire || "",
                latLng.lat,
                latLng.lng,
                new Date().toLocaleDateString()
            ]
        });
        const csvContent = [header, ...rows].map(e => e.join(";")).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        saveAs(blob, "commentaires.csv");
    };

    const success = (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        setLocation([latitude, longitude]);
        setGeolocDetect(true);
        if(!firstRender.current){
            mapRef.current.setView([latitude, longitude], 12);
            firstRender.current = true;
        }
    }

    const error = () => {
        console.log("Unable to retrieve your location");
    }

    const getFeatureStyle = (feature) => {
        const status = feature.properties.notation_indicateur;
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
            weight: 10,
        };
    };

    const handleCenterLocation = () => {
        mapRef.current.setView(location, 12);
    }


    return (
        <div className='container-fluid'>
            <div className='row' id="navbar">
                <button onClick={handleExport} className="button-change-page col-4">Exporter vos commentaires</button>
                <form onSubmit={handleSearch} className="col-4" id="search-bar">
                    <input id="search-input" type="text" name="city" placeholder="Ville" />
                    <button type="submit">Rechercher</button>
                </form>
                <button onClick={handleButtonClick} className="button-change-page col-4">Module arrêtés de circulation</button>
            </div>
            {isFeatureClicked && (<div className='row'>
                <input id="comm-input" type="text" name="commentaire" className='col-10' placeholder="Votre commentaire" />
                <button onClick={handleFeatureComment} className='button-change-page col-2'>Ajouter</button>
            </div>)}
            <div className="row">
                <div className={'col-12'}>
                    {geolocDetect && (
                        <button onClick={handleCenterLocation} className="button-location">Centrer sur ma position</button>
                    )}                    <MapContainer
                        center={location}
                        zoom={9}
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
                        {geolocDetect && (<Marker
                            position={location}
                            icon={L.divIcon({
                                className: 'custom-icon',
                                html: `<i class="fa-solid fa-location-dot"></i>`,
                            })}
                        >
                            <Popup>Vous êtes ici</Popup>
                        </Marker>)}
                        {couche && couche[0] && (
                            <GeoJSON
                                data={couche[0].features.filter((feature) => {
                                    return feature.geometry && feature.geometry.type === "MultiLineString";
                                })}
                                style={getFeatureStyle}
                                onEachFeature={(feature, layer) => {
                                    layer.on({
                                        click: (e) => {
                                            handleFeatureClick(e, feature, mapRef.current);
                                        },
                                    });
                                }}
                            />
                        )
                        }
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

export default CoucheRoulementComponent;
