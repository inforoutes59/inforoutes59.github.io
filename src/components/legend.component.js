import React from 'react';
import L from 'leaflet';
import { useMap } from 'react-leaflet';

function Legend() {
    const map = useMap();

    // Fonction pour générer la légende HTML
    const createLegend = () => {
        const legendDiv = L.DomUtil.create('div', 'legend');
        legendDiv.style.backgroundColor = 'white';
        legendDiv.style.width = '11vh'; 
        legendDiv.style.fontSize = '1.2vh';
        legendDiv.innerHTML = `
            <div>Arrondissements :</div>
            <div><span style="background-color: #ebd834; width: 2em; height: 2em; display: inline-block; margin-right: 0.5em;"></span>Avesnes</div>
            <div><span style="background-color: #34eb71; width: 2em; height: 2em; display: inline-block; margin-right: 0.5em;"></span>Cambrai</div>
            <div><span style="background-color: #eb34e8; width: 2em; height: 2em; display: inline-block; margin-right: 0.5em;"></span>Douai</div>
            <div><span style="background-color: #eb3434; width: 2em; height: 2em; display: inline-block; margin-right: 0.5em;"></span>Dunkerque</div>
            <div><span style="background-color: #345eeb; width: 2em; height: 2em; display: inline-block; margin-right: 0.5em;"></span>Valenciennes</div>
            <div><span style="background-color: grey; width: 2em; height: 2em; display: inline-block; margin-right: 0.5em;"></span>MEL</div>
        `;
        return legendDiv;
    };

    // Ajouter la légende à la carte
    React.useEffect(() => {
        const legendControl = L.control({ position: 'bottomleft' });
        legendControl.onAdd = function () {
            return createLegend();
        };
        legendControl.addTo(map);

        return () => {
            map.removeControl(legendControl);
        };
    }, [map]);

    return null;
}

export default Legend;
