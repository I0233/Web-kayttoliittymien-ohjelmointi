// data-muuttuja sisältää kaiken tarvittavan ja on rakenteeltaan lähes samankaltainen kuin viikkotehtävässä 2
// Rastileimaukset on siirretty tupa-rakenteesta suoraan jokaisen joukkueen yhteyteen
//
// voit tutkia tarkemmin käsiteltävää tietorakennetta konsolin kautta 
// tai json-editorin kautta osoitteessa http://jsoneditoronline.org/
// Jos käytät json-editoria niin avaa data osoitteesta:
// http://appro.mit.jyu.fi/tiea2120/vt/vt3/data.json

"use strict";

let mymap;

/**
 *   MML layers for Leaflet. https://github.com/jleh/Leaflet.MML-layers
 *   Copyright (c) 2013-2016 Juuso Lehtinen
 */
(function (factory, window) {
    var L;

    if (typeof define === "function" && define.amd) {
        define(["leaflet"], factory);
    } else if (typeof module !== "undefined") {
        if (window.L) {
            module.exports = factory(window.L);
        } else {
            module.exports = factory(require("leaflet"));
        }
    } else {
        if (typeof window.L === "undefined") {
            throw "Leaflet must be loaded first.";
        }

        window.L = factory(window.L);
    }

}(function (L) {
    L.TileLayer.MML = L.TileLayer.extend({
        options: {
            attribution: '&copy; <a href="http://www.maanmittauslaitos.fi/avoindata_lisenssi_versio1_20120501"' +
                'target=new>Maanmittauslaitos</a>'
        },

        statics: {
            /**
             *   Get EPSG:3067 CRS Projection.
             */
            get3067Proj: function () {
                return new L.Proj.CRS(
                    'EPSG:3067',
                    '+proj=utm +zone=35 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs', {
                        origin: [-548576, 8388608],
                        bounds: L.bounds([-548576, 8388608], [1548576, 6291456]),
                        resolutions: [
                            8192, 4096, 2048, 1024, 512, 256,
                            128, 64, 32, 16, 8, 4, 2, 1, 0.5,
                            0.25, 0.125, 0.0625, 0.03125, 0.015625
                        ]
                    }
                );
            }
        },

        urls: {
            "peruskartta": 'http://tiles.kartat.kapsi.fi/peruskartta/{z}/{x}/{y}.jpg',
            "taustakartta": 'http://tiles.kartat.kapsi.fi/taustakartta/{z}/{x}/{y}.jpg',
            "ortokuva": 'http://tiles.kartat.kapsi.fi/ortokuva/{z}/{x}/{y}.jpg',
            "peruskartta_3067": 'http://tiles.kartat.kapsi.fi/peruskartta_3067/{z}/{x}/{y}.jpg',
            "taustakartta_3067": 'http://tiles.kartat.kapsi.fi/taustakartta_3067/{z}/{x}/{y}.jpg',
            "ortokuva_3067": 'http://tiles.kartat.kapsi.fi/ortokuva_3067/{z}/{x}/{y}.jpg'
        },

        initialize: function (type, options) {
            L.setOptions(this, options);
            var url = this.urls[type.toLowerCase()];

            if (type.indexOf('3067') != -1) {
                // Check that Proj4Leaflet is loaded
                if (L.Proj === undefined) {
                    throw "Use of EPSG:3067 layers requires Proj4Leaflet plugin.";
                }
            }

            L.TileLayer.prototype.initialize.call(this, url, options);
        },

    });

    L.tileLayer.mml = function (type, options) {
        return new L.TileLayer.MML(type, options);
    };

    // WMTS Layer

    L.TileLayer.MML_WMTS = L.TileLayer.extend({

        options: {
            style: "default",
            maxZoom: 15,
            minZoom: 0,
            attribution: '&copy; <a href="http://www.maanmittauslaitos.fi/avoindata_lisenssi_versio1_20120501"' +
                'target=new>Maanmittauslaitos</a>'
        }
    });

    L.tileLayer.mml_wmts = function (options) {
        var layer = options.layer || "taustakartta";
        var url = "http://avoindata.maanmittauslaitos.fi/mapcache/wmts/1.0.0/" + layer + "/default/" +
            "ETRS-TM35FIN/{z}/{y}/{x}.png";

        return new L.TileLayer.MML_WMTS(url, options);
    };

    return L;

}, window));

// Alustetaan kaikki
window.onload = function () {

    // Kartan asettelu ja näkyvyys
    var div = $("#map");
    div.css("height", Math.round(window.innerHeight) + "px");

    mymap = new L.map('map', {
        crs: L.TileLayer.MML.get3067Proj()
    }).setView([62, 25], 11);
    L.tileLayer.mml_wmts({
        layer: "maastokartta"
    }).addTo(mymap);

    let minLon = 100;
    let minLat = 100;
    let maxLon = 0;
    let maxLat = 0;

    // Lisätään pallot kartaan rastien kohtaan ja etsitään pienimmät ja suurimmat lon ja lat
    for (let i = 0; i < data.rastit.length; i++) {
        let rastiKoords = [];
        if (data.rastit[i].lat >= maxLat) {
            maxLat = data.rastit[i].lat;
        }
        if (data.rastit[i].lon >= maxLon) {
            maxLon = data.rastit[i].lon;
        }
        if (data.rastit[i].lat <= minLat) {
            minLat = data.rastit[i].lat
        }
        if (data.rastit[i].lon <= minLon) {
            minLon = data.rastit[i].lon
        }
        var circle = L.circle(
            [data.rastit[i].lat, data.rastit[i].lon], {
                color: 'red',
                fillColor: '#f03',
                fillOpacity: 0.5,
                radius: 150 / 2
            }
        ).addTo(mymap);
    }

    // Muodostetaan alue pienimmistä ja suurimmista lon ja lat
    var bounds = new L.LatLngBounds([
        [maxLat, maxLon],
        [minLat, minLon]
    ]);
    // Kartan näkymä kohdistetaan rasteihin
    mymap.fitBounds(bounds);

    luoJoukkuelistaus();

    // Lisätään diveihin, joissa listat dragover ja drop eventit 
    document.getElementById("valitut").addEventListener("dragover", ylla);
    document.getElementById("valitut").addEventListener("drop", drop);
    document.getElementById("Joukkueet").addEventListener("dragover", ylla);
    document.getElementById("Joukkueet").addEventListener("drop", dropTakaisin);
};

// Luodaan joukkuelistaus
function luoJoukkuelistaus() {
    let ul = document.getElementById("joukkueListaus");
    for (let i = 0; i < data.joukkueet.length; i++) {
        let li = document.createElement("li");
        let label = document.createElement("label");
        label.appendChild(document.createTextNode(data.joukkueet[i].nimi));
        li.appendChild(label);
        // listan elementille väri
        li.style.backgroundColor = rainbow(data.joukkueet.length, i + 1);
        // asetetaan label dragattavaksi
        label.setAttribute("draggable", "true");
        // asetetaan listan elementille id:ksi siinä olevan joukkueen nimi
        li.setAttribute("id", data.joukkueet[i].nimi);
        ul.appendChild(li);

        // Lisätään draggayksen aloitus event, jossa kerätään tieto mitä joukkuetta liikutetaan
        label.addEventListener("dragstart", function (e) {
            e.dataTransfer.setData("text/plain", data.joukkueet[i].nimi);
        });
    }
}

// Valmiiksi annettu värien hakuun tarkoitettu funktio
function rainbow(numOfSteps, step) {
    // This function generates vibrant, "evenly spaced" colours (i.e. no clustering). This is ideal for creating easily distinguishable vibrant markers in Google Maps and other apps.
    // Adam Cole, 2011-Sept-14
    // HSV to RBG adapted from: http://mjijackson.com/2008/02/rgb-to-hsl-and-rgb-to-hsv-color-model-conversion-algorithms-in-javascript
    let r, g, b;
    let h = step / numOfSteps;
    let i = ~~(h * 6);
    let f = h * 6 - i;
    let q = 1 - f;
    switch (i % 6) {
        case 0:
            r = 1;
            g = f;
            b = 0;
            break;
        case 1:
            r = q;
            g = 1;
            b = 0;
            break;
        case 2:
            r = 0;
            g = 1;
            b = f;
            break;
        case 3:
            r = 0;
            g = q;
            b = 1;
            break;
        case 4:
            r = f;
            g = 0;
            b = 1;
            break;
        case 5:
            r = 1;
            g = 0;
            b = q;
            break;
    }
    let c = "#" + ("00" + (~~(r * 255)).toString(16)).slice(-2) + ("00" + (~~(g * 255)).toString(16)).slice(-2) + ("00" + (~~(b * 255)).toString(16)).slice(-2);
    return (c);
}

// Kun dragatty on dropattavan yllä
function ylla(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
}

// Kun dropataan kartalla listaukseen
function drop(e) {
    e.preventDefault();
    let li = document.getElementById(e.dataTransfer.getData("text"));
    // lisätään ensimmäiseksi
    document.getElementById('kartalla').insertBefore(li, document.getElementById('kartalla').firstChild);
    // Kerätään joukkueen kulkema reitti
    let koords = [];
    for (let i = 0; i < data.joukkueet.length; i++) {
        if (data.joukkueet[i].nimi === li.id) {
            for (let j = 0; j < data.joukkueet[i].rastit.length; j++) {
                for (let k = 0; k < data.rastit.length; k++) {
                    if (data.joukkueet[i].rastit[j].id == data.rastit[k].id) {
                        var latLon = [];
                        latLon.push(data.rastit[k].lat);
                        latLon.push(data.rastit[k].lon);
                        koords.push(latLon);
                    }
                }
            }
        }
    }
    // Piirretään reitti
    let polyline = L.polyline(koords, {
        name: e.dataTransfer.getData("text"),
        color: li.style.backgroundColor
    }).addTo(mymap);
}

// Kun dropataan takaisin joukkue listaukseen
function dropTakaisin(e) {
    e.preventDefault();
    let joukkueet = document.getElementById('joukkueListaus').childNodes;
    let li = document.getElementById(e.dataTransfer.getData("text"));
    let loytyy = 0;
    // Tarkastetaan, ettei dropattava joukkue ole otettu jo joukkuelistauksesta vaan
    // se on kartalla oleva joukkue
    for (let i = 0; i < joukkueet.length; i++) {
        if (joukkueet[i].id === li.id) {
            loytyy = 1;
        }
    }
    // Jos ei löydy joukkuelistauksesta, tällöin dropattava on ollut kartalla
    if (loytyy === 0) {
        // Poistetaan kyseisen joukkueen reitti kartalta
        mymap.eachLayer(function (layer) {
            if (layer.options.name === li.id) {
                mymap.removeLayer(layer);
            }
        });

        // Lisätään joukkue joukkue listaukseen
        document.getElementById('joukkueListaus').appendChild(li);
    }
}