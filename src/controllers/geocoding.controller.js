import axios from "axios";

const apiKey = 'AIzaSyBpbWfaapgICG-f9pbWkxUtaN7FecRsl8A'

export async function getInterruptions(){
    const fileId = '1hK49eyZVCTSqNbxMEUBvje9LUYUaKMRc'
    const apiUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&key=${apiKey}`;
    return axios.get(apiUrl)
        .then((response) => {
            return response.data;
        })
        .catch((error) => {
            console.error('Erreur lors de la récupération des données GeoJSON :', error);
        });
}

export async function getRestrictions(){
    const fileId = '1eAU-fskCxSn93MswZQapBRLa73WnH7Eh'
    const apiUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&key=${apiKey}`;
    //const apiUrl = 'http://localhost:3001/restrictions'
    return axios.get(apiUrl)
        .then((response) => {
            return response.data;
            //return JSON.parse(response.data);
        })
        .catch((error) => {
            console.error('Erreur lors de la récupération des données GeoJSON :', error);
        });
}

export function searchCity(cityName) {
  const apiUrl = `https://nominatim.openstreetmap.org/search.php?q=${cityName}&format=jsonv2`;
  return axios.get(apiUrl)
            .then((city) => {
                const coords = {
                    name: city.data[0].name,
                    lat: parseFloat(city.data[0].lat),
                    lon: parseFloat(city.data[0].lon),
                };
                return coords;
            })
            .catch((error) => {
                console.error('Erreur lors de la récupération des données GeoJSON :', error);
            });
}

export async function getTelecom(){
    const fileId = '1tBnIj2i8As5ICCctPFgC7bBiCiPOygCA'
    const apiUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&key=${apiKey}`;
    return axios.get(apiUrl)
        .then((response) => {
            return response.data;
        })
        .catch((error) => {
            console.error('Erreur lors de la récupération des données GeoJSON :', error);
        });
}

export async function getElec(){
    const fileId = '1S6gPrvjUSeE-Z7-K3UgmS_X-5J4lzW6Q'
    const apiUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&key=${apiKey}`;
    return axios.get(apiUrl)
        .then((response) => {
            return response.data;
        })
        .catch((error) => {
            console.error('Erreur lors de la récupération des données GeoJSON :', error);
        });
}

export async function getEau(){
    const fileId = '1VwBIqCEDwmFPWVF5WmCIPs5w8t-y2uIw'
    const apiUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&key=${apiKey}`;
    return axios.get(apiUrl)
        .then((response) => {
            return response.data;
        })
        .catch((error) => {
            console.error('Erreur lors de la récupération des données GeoJSON:', error);
        });
}

export async function getAssainissement(){
    const fileId = '1wB02fyRLEGRdcyCBnT585RZK9ZeupzvQ'
    const apiUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&key=${apiKey}`;
    return axios.get(apiUrl)
        .then((response) => {
            return response.data;
        })
        .catch((error) => {
            console.error('Erreur lors de la récupération des données GeoJSON :', error);
        });
}

export async function getGaz(){
    const fileId = '1OtEsjW5tTVlBwN8dXMdmNJ2Pis20jmSr'
    const apiUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&key=${apiKey}`;
    return axios.get(apiUrl)
        .then((response) => {
            return response.data;
        })
        .catch((error) => {
            console.error('Erreur lors de la récupération des données GeoJSON :', error);
        });
}

export async function getCoucheRoulementDK(){
    const fileId = '1mva7sE-CT385WkxogeUvSEW3TnMfdu-_'
    const apiUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&key=${apiKey}`;
    //const apiUrl = 'http://localhost:3001/couche-roulement'
    return axios.get(apiUrl)
        .then((response) => {
            //return response;
            return response.data;
        })
        .catch((error) => {
            console.error('Erreur lors de la récupération des données GeoJSON :', error);
        });
}
export async function getCoucheRoulementDO(){
    const fileId = '1s19LpHFGPB42Yd6f96F4YGrabI2iQxaS'
    const apiUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&key=${apiKey}`;
    //const apiUrl = 'http://localhost:3001/couche-roulement'
    return axios.get(apiUrl)
        .then((response) => {
            //return response;
            return response.data;
        })
        .catch((error) => {
            console.error('Erreur lors de la récupération des données GeoJSON :', error);
        });
}
export async function getCoucheRoulementCA(){
    const fileId = '1zBBG4Pv662t218U2ALA5c0Rj8H3eGAu1'
    const apiUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&key=${apiKey}`;
    //const apiUrl = 'http://localhost:3001/couche-roulement'
    return axios.get(apiUrl)
        .then((response) => {
            //return response;
            return response.data;
        })
        .catch((error) => {
            console.error('Erreur lors de la récupération des données GeoJSON :', error);
        });
}
export async function getCoucheRoulementAV(){
    const fileId = '1PgkiZKiCaTb5QcvlaZHwLrnJeByLl3Gb'
    const apiUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&key=${apiKey}`;
    //const apiUrl = 'http://localhost:3001/couche-roulement'
    return axios.get(apiUrl)
        .then((response) => {
            //return response;
            return response.data;
        })
        .catch((error) => {
            console.error('Erreur lors de la récupération des données GeoJSON :', error);
        });
}
export async function getCoucheRoulementVA(){
    const fileId = '1eYFeUkSwbIeUg9n3Vhz6aG6Oo4yIfK-G'
    const apiUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&key=${apiKey}`;
    //const apiUrl = 'http://localhost:3001/couche-roulement'
    return axios.get(apiUrl)
        .then((response) => {
            //return response;
            return response.data;
        })
        .catch((error) => {
            console.error('Erreur lors de la récupération des données GeoJSON :', error);
        });
}
