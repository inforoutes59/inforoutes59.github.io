import React, { useState } from 'react';

function FilterComponent({ onFilterChange, isOpen }) {
    const [filters, setFilters] = useState({ "Restriction": "restriction", "Interruption": "interruption", "Télécommunications": "telecom", "Electricité": "elec", "Eau potable": "eau", "Gaz": "gaz", "assainissement": "assainissement" });

    const handleFilterChange = (filterType, value) => {
        const newFilters = { ...filters };

        if (newFilters[filterType] === value) {
            newFilters[filterType] = "";
            document.querySelector(`#${value}-filter`).classList.add("unactive-filter");
        } else {
            newFilters[filterType] = value;
            document.querySelector(`#${value}-filter`).classList.remove("unactive-filter");
        }
        setFilters(newFilters);
        onFilterChange(newFilters);
    };

    if(isOpen) {
    return (
        <div className='col-6 container' id="sidenav">
            <h4 id="type-intervention">Type d'intervention</h4>
            <div className='row'>
                <div className={`${filters['Restriction']!=='restriction'?'unactive-filter':''} 'col-12'`} id="restriction-filter" onClick={(e) => handleFilterChange("Restriction", "restriction")}>
                    <label className='filter'><img src="./images/AK14.png" className="filter-logo"/><div className='filter-text'>Restriction</div></label>
                </div>
                <div className={`${filters['Interruption']!=='interruption'?'unactive-filter':''} 'col-12'`} id="interruption-filter" onClick={(e) => handleFilterChange("Interruption", "interruption")}>
                    <label className='filter'><img src="./images/B1.png" className="filter-logo"/><div className='filter-text'>Interruption</div></label>
                </div>
                <div className={`${filters['Télécommunications']!=='telecom'?'unactive-filter':''} 'col-12'`} id="telecom-filter" onClick={(e) => handleFilterChange("Télécommunications", "telecom")}>
                    <label className='filter'><i className="fa-solid fa-phone" style={{ color: "green" }}></i><div className='filter-text'>Télécommunications</div></label>
                </div>
                <div className={`${filters['Electricité']!=='elec'?'unactive-filter':''} 'col-12'`} id="elec-filter" onClick={(e) => handleFilterChange("Electricité", "elec")}>
                    <label className='filter'><i className="fa-solid fa-bolt" style={{ color: "red" }}></i><div className='filter-text'>Eléctricité</div></label>
                </div>
                <div className={`${filters['Eau potable']!=='eau'?'unactive-filter':''} 'col-12'`} id="eau-filter" onClick={(e) => handleFilterChange("Eau potable", "eau")}>
                    <label className='filter'><i className="fa-solid fa-droplet" style={{ color: "blue" }}></i><div className='filter-text'>Eau potable</div></label>
                </div>
                <div className={`${filters['Gaz']!=='gaz'?'unactive-filter':''} 'col-12'`} id="gaz-filter" onClick={(e) => handleFilterChange("Gaz", "gaz")}>
                    <label className='filter'><i className="fa-solid fa-fire-flame-curved" style={{ color: "yellow" }}></i><div className='filter-text'>Gaz</div></label>
                </div>
                <div className={`${filters['assainissement']!=='assainissement'?'unactive-filter':''} 'col-12'`} id="assainissement-filter" onClick={(e) => handleFilterChange("assainissement", "assainissement")}>
                    <label className='filter'><i className="fa-solid fa-droplet" style={{ color: "brown" }}></i><div className='filter-text'>Assainissement</div></label>
                </div>
            </div>
        </div>
    );
    }else {
        return null;
    }
}

export default FilterComponent;
