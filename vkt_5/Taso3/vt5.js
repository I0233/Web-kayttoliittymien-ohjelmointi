"use strict";

var mymap;
let circles = [];
let reitit = [];
let labels = [];
let marker;

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

window.onload = function () {
    var div = $("#map");
    div.css("height", Math.round(window.innerHeight) + "px");

    mymap = new L.map('map', {
        crs: L.TileLayer.MML.get3067Proj()
    }).setView([62.2333, 25.7333], 11);
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

        // Rastien koodien luonti
        mymap.createPane('labels');
        // Asetetaan koodit pallojen taakse
        mymap.getPane('labels').style.zIndex = 300;
        let label = L.marker(new L.LatLng(data.rastit[i].lat, parseFloat(data.rastit[i].lon) + parseFloat(0.004)), {
            icon: createLabelIcon("textLabelclass", data.rastit[i].koodi),
            name: data.rastit[i].koodi,
            pane: 'labels'
        }).addTo(mymap);


        let circle = L.circle(
            [data.rastit[i].lat, data.rastit[i].lon], {
                name: data.rastit[i].koodi,
                color: 'red',
                fillColor: '#f03',
                fillOpacity: 0.5,
                radius: 150
            }
        ).addTo(mymap).on("click", circleClick);

        circles.push(circle);
        labels.push(label);
    }

    // Muodostetaan alue pienimmistä ja suurimmista lon ja lat
    var bounds = new L.LatLngBounds([
        [maxLat, maxLon],
        [minLat, minLon]
    ]);
    // Kartan näkymä kohdistetaan rasteihin
    mymap.fitBounds(bounds);

    // Joukkueen kulkema matka
    joukkueenMatka();

    // Listaus joukkueista
    luoJoukkuelistaus();

    // Lisätään diveihin, joissa listat dragover ja drop eventit
    document.getElementById("valitut").addEventListener("dragover", ylla);
    document.getElementById("valitut").addEventListener("drop", drop);
    document.getElementById("Joukkueet").addEventListener("dragover", ylla);
    document.getElementById("Joukkueet").addEventListener("drop", dropTakaisin);
    console.log(data);

}

// Luodaan joukkuelistaus
function luoJoukkuelistaus() {
    let ul = document.getElementById("joukkueListaus");
    for (let i = 0; i < data.joukkueet.length; i++) {
        let li = document.createElement("li");
        tekstiElementtiin(li, i);
        ul.appendChild(li);
    }
}

// Lisätään teksti joukkue taulukkoon ja kartalla taulukkoon
function tekstiElementtiin(li, i) {
    let label = document.createElement("label");
    label.appendChild(document.createTextNode(data.joukkueet[i].nimi + ", " + data.joukkueet[i].matka + " km"));
    li.appendChild(label);
    // listan elementille väri
    li.style.backgroundColor = rainbow(data.joukkueet.length, i + 1);
    // asetetaan label dragattavaksi
    label.setAttribute("draggable", "true");
    // asetetaan listan elementille id:ksi siinä olevan joukkueen nimi
    li.setAttribute("id", data.joukkueet[i].nimi);
    // Lisätään draggayksen aloitus event, jossa kerätään tieto mitä joukkuetta liikutetaan
    label.addEventListener("dragstart", function (e) {
        e.dataTransfer.setData("text/plain", data.joukkueet[i].nimi);
    });
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
    reitit.push(polyline);
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
        for (let i = 0; i < reitit.length; i++) {
            if (reitit[i].options.name === li.id) {
                mymap.removeLayer(reitit[i]);
                reitit.splice(i, 1);
            }
        }
        // Lisätään joukkue joukkue listaukseen
        document.getElementById('joukkueListaus').appendChild(li);
    }
}

// Kerätään joukkueiden kulkemat matkat
function joukkueenMatka() {
    for (let i = 0; i < data.joukkueet.length; i++) {
        var lastLon;
        var lastLat;
        var matka = 0;
        for (let j = 0; j < data.joukkueet[i].rastit.length; j++) {
            for (let k = 0; k < data.rastit.length; k++) {
                if (data.joukkueet[i].rastit[j].id == data.rastit[k].id) {
                    if (j > 0) {
                        matka += getDistanceFromLatLonInKm(lastLat, lastLon, data.rastit[k].lat, data.rastit[k].lon);
                    }
                    lastLat = data.rastit[k].lat;
                    lastLon = data.rastit[k].lon
                }
            }
        }
        data.joukkueet[i].matka = Math.round(matka);
    }
}

// Valmiiksi annettu funktio, jolla saadaan etäisyys rasitlta toiselle laskettua
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2 - lat1); // deg2rad below
    var dLon = deg2rad(lon2 - lon1);
    var a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c; // Distance in km
    return d;
}

// Valmiiksi annettu funktio, jolla saadaan asteet radiaaneiksi
function deg2rad(deg) {
    return deg * (Math.PI / 180)
}

// Kun klikataan yhtä rastia
function circleClick(e) {
    // Poistetaan aikaisempi marker näymästä, jos sellainen on
    if (marker !== undefined) {
        mymap.removeLayer(marker);
    }

    let latAndLon;
    let name;

    // Asetetaan klikattu pallo kokonaan punaiseksi ja alustetaan muut takaisin
    for (let i = 0; i < circles.length; i++) {
        if (circles[i] === e.target) {
            name = circles[i].options.name;
            circles[i].setStyle({
                fillColor: 'red',
                fillOpacity: 1
            });
            latAndLon = circles[i].getLatLng();
        } else {
            circles[i].setStyle({
                fillColor: '#f03',
                fillOpacity: 0.5
            });
        }
    }

    // Tehdään marker ja sille dragatty event
    marker = L.marker(latAndLon, {
        draggable: 'true'
    }).addTo(mymap).on('dragend', function (e) {
        // Kun marker on liikutettu uuteen kohtaan tullaan tähän
        // Luodaan uusi label uudelle rastin paikalle
        let label = L.marker(new L.LatLng(marker.getLatLng().lat, parseFloat(marker.getLatLng().lng) + parseFloat(0.004)), {
            icon: createLabelIcon("textLabelclass", name),
            name: name,
            pane: 'labels'
        }).addTo(mymap);
        // Luodaan uusi ympyrä siihen kohtaan, johon marker tiputettu
        var circle = L.circle(
            marker.getLatLng(), {
                color: 'red',
                fillColor: '#f03',
                fillOpacity: 0.5,
                radius: 150,
                name: name
            }
        ).addTo(mymap).on("click", circleClick);

        circles.push(circle);
        labels.push(label);

        // Muutetaan liikutetun rastin lat ja lon
        for (let i = 0; i < data.rastit.length; i++) {
            if (parseFloat(data.rastit[i].lat).toFixed(6) == latAndLon.lat.toFixed(6) && parseFloat(data.rastit[i].lon).toFixed(6) == latAndLon.lng.toFixed(6)) {
                data.rastit[i].lat = marker.getLatLng().lat;
                data.rastit[i].lon = marker.getLatLng().lng;
            }
        }
        // Poistetaan aikaisempi rasti
        for (let i = 0; i < circles.length; i++) {
            if (circles[i].options.fillColor === 'red') {
                mymap.removeLayer(circles[i]);
                circles.splice(i, 1);
            }
        }
        // poistetaan aikaisempi rastin koodi
        for (let i = 0; i < labels.length; i++) {
            if (labels[i].options.name === name) {
                mymap.removeLayer(labels[i]);
                labels.splice(i, 1);
                break;
            }
        }

        // Kerätään reittien koordinaatit
        for (let i = 0; i < reitit.length; i++) {
            let koordinaatit = reitit[i].getLatLngs();
            for (let j = 0; j < koordinaatit.length; j++) {
                if (koordinaatit[j].lat == latAndLon.lat && koordinaatit[j].lng == latAndLon.lng) {
                    koordinaatit[j].lat = marker.getLatLng().lat;
                    koordinaatit[j].lng = marker.getLatLng().lng;
                }
            }
            // Poistetaan aikaisempi reitti näkymästä
            mymap.removeLayer(reitit[i]);

            // Näytetään päivitetty reitti
            let polyline = L.polyline(koordinaatit, {
                name: reitit[i].options.name,
                color: reitit[i].options.color
            }).addTo(mymap);
            reitit.splice(i, 1, polyline);
        }

        // Lasketaan joukkueille uudet matkat, kun rasti on siirretty
        joukkueenMatka();

        // Päivitetään matkat näkyviin taulukoihin
        for (let i = 0; i < data.joukkueet.length; i++) {
            var li = document.getElementById(data.joukkueet[i].nimi);
            while (li.firstChild) {
                li.removeChild(li.firstChild);
            }
            tekstiElementtiin(li, i);
        }
        // Poistetaan marker
        mymap.removeLayer(marker);
    });
}

// Labelin ominaisuuksien asettaminen
var createLabelIcon = function (labelClass, labelText) {
    return L.divIcon({
        className: labelClass,
        html: labelText
    })
}