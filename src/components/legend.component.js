import {useEffect} from 'react';
import L from 'leaflet';
import { useMap } from 'react-leaflet';

function Legend({arrondissements}) {
    const map = useMap();   

    useEffect(() => {
        const getBoundsOfArrondissement = (arrondissement) => {
            const features = arrondissements.features;
            for (let i = 0; i < features.length; i++) {
                const properties = features[i].properties;
                if (properties.Name.toLowerCase().includes(arrondissement.toLowerCase())) {
                    const bounds = L.geoJSON(features[i]).getBounds();
                    return bounds;
                }
            }
            return null;
        };

        const createLegend = () => {
            const legendDiv = L.DomUtil.create('div', 'legend');
            legendDiv.style.backgroundColor = 'white';
            legendDiv.style.width = '12vh'; 
            legendDiv.style.fontSize = '1.2vh';
            legendDiv.style.padding = '0.2vh';
            legendDiv.innerHTML = `
                <div>Arrondissements :</div>
                <div id="avesnes" class="arrondissement" style="cursor: pointer;"><span style="background-color: #ebd834; width: 2em; height: 2em; display: inline-block; margin-right: 0.5em;"></span>Avesnes</div>
                <div id="cambrai" class="arrondissement" style="cursor: pointer;"><span style="background-color: #34eb71; width: 2em; height: 2em; display: inline-block; margin-right: 0.5em;"></span>Cambrai</div>
                <div id="douai" class="arrondissement" style="cursor: pointer;"><span style="background-color: #eb34e8; width: 2em; height: 2em; display: inline-block; margin-right: 0.5em;"></span>Douai</div>
                <div id="dunkerque" class="arrondissement" style="cursor: pointer;"><span style="background-color: #345eeb; width: 2em; height: 2em; display: inline-block; margin-right: 0.5em;"></span>Dunkerque</div>
                <div id="valenciennes" class="arrondissement" style="cursor: pointer;"><span style="background-color: #eb3434; width: 2em; height: 2em; display: inline-block; margin-right: 0.5em;"></span>Valenciennes</div>
                <div id="mel" class="arrondissement" style="cursor: pointer;"><span style="background-color: grey; width: 2em; height: 2em; display: inline-block; margin-right: 0.5em;"></span>MEL</div>
            `;
    
            // Gestion des clics sur les arrondissements
            legendDiv.querySelectorAll('.arrondissement').forEach(item => {
                item.addEventListener('click', () => {
                    const arrondissement = item.id;
                    const bounds = getBoundsOfArrondissement(arrondissement);
                    if (bounds) {
                        map.fitBounds(bounds);
                    }
                });
            });
    
            return legendDiv;
        };
        const legendControl = L.control({ position: 'bottomleft' });
        legendControl.onAdd = function () {
            return createLegend();
        };
        legendControl.addTo(map);

        return () => {
            map.removeControl(legendControl);
        };
    }, [map, arrondissements]);

    return null;
}

export default Legend;
