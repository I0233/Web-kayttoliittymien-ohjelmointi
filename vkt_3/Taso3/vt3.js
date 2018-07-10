// data-muuttuja sisältää kaiken tarvittavan ja on rakenteeltaan lähes samankaltainen kuin viikkotehtävässä 2
// Rastileimaukset on siirretty tupa-rakenteesta suoraan jokaisen joukkueen yhteyteen
//
// voit tutkia tarkemmin käsiteltävää tietorakennetta konsolin kautta 
// tai json-editorin kautta osoitteessa http://jsoneditoronline.org/
// Jos käytät json-editoria niin avaa data osoitteesta:
// http://appro.mit.jyu.fi/tiea2120/vt/vt3/data.json

"use strict";

var idJoukkueelle = 100;
var jasen = 5;
var sarjojenLkm = 0;

// Alustetaan kaikki
window.onload = function () {
    console.log(data);
    luoSarjalistaus();
    luoJoukkuelistaus();
}

// Luodaan sarja listaus datan mukaan näkyviin
function luoSarjalistaus() {
    var sarjatNimet = [];
    // Kerätään sarjojen nimet datasta
    for (let i = 0; i < data.kisat.length; i++) {
        for (let j = 0; j < data.kisat[i].sarjat.length; j++) {
            var sarja = new Object();
            sarja = data.kisat[i].sarjat[j].nimi;
            sarjatNimet.push(sarja);
        }
    }
    // Järjestetään ne
    sarjatNimet.sort(jarjestykseen);
    // Elementti, johon sarjat lisätään
    var span = document.getElementById('sarjat');
    for (let i = 0; i < sarjatNimet.length; i++) {
        // Sarjan nimi
        var label = document.createElement('label');
        // Radiobutton
        var value = document.createElement('input');
        // rivinvaihto
        var br = document.createElement('br');
        // jos ensimmäinen lisättävä sarja, merkitään se valituksi
        if (i === 0) {
            value.setAttribute('checked', 'checked');
        }
        value.id = 'sarja' + i;
        sarjojenLkm++;
        // Attribuutit radiobuttonille
        value.setAttribute('type', 'radio');
        value.setAttribute('name', 'sarja');
        // lisäys
        label.appendChild(document.createTextNode(sarjatNimet[i]));
        label.appendChild(value);
        span.appendChild(label);
        span.appendChild(br);
    }
}

// Luodaan joukkuelistaus
function luoJoukkuelistaus() {
    var ul = document.getElementById("joukkueListaus");
    for (let i = 0; i < data.joukkueet.length; i++) {
        lisaaJoukkueListaan(ul, i);
    }
}

// Lisätään yksi joukkue listaukseen
function lisaaJoukkueListaan(ul, i) {
    var li = document.createElement("li");
    li.appendChild(document.createTextNode(data.joukkueet[i].nimi));
    ul.appendChild(li);
}

// Järjestetään sarjat tämän mukaan
function jarjestykseen(a, b) {
    if (a < b) {
        return -1;
    }
    if (a > b) {
        return 1;
    }
    return 0;
}

// Kun klikataan tallenna painiketta suoritetaan
function tallenna(e) {
    e.preventDefault();
    var nimiVirhe = joukueenNimiValidate();
    var aikaVirhe = aikaValidate();
    var checkVirhe = checkboxValidate();
    var jasenVirhe = jasenetValidate();
    var totVirheet = nimiVirhe + aikaVirhe + checkVirhe + jasenVirhe;
    // Jos ei löydy virheitä
    if (totVirheet === 0) {
        // uusiJoukkue ja sen tiedot
        var uusiJoukkue = new Object();
        uusiJoukkue.id = idJoukkueelle;
        uusiJoukkue.jasenet = saaJasenet();
        uusiJoukkue.leimaustapa = saaLeimaus();
        uusiJoukkue.luontiaika = saaAika();
        uusiJoukkue.matka = 0;
        uusiJoukkue.nimi = document.getElementById('joukkueenNimi').value;
        uusiJoukkue.pisteet = 0;
        var rastit = [];
        uusiJoukkue.rastit = rastit;
        uusiJoukkue.sarja = saaSarja();
        uusiJoukkue.seura = "";
        idJoukkueelle++;
        // lisätään uusi joukkue data.joukkeisiin
        data.joukkueet.push(uusiJoukkue);
        // lisätään uusi joukkue joukkuelistaukseen
        var ul = document.getElementById("joukkueListaus");
        lisaaJoukkueListaan(ul, data.joukkueet.length - 1);
        // tulostetaan vielä koko data, josta nähdään, että uusi joukkue on siellä oikein
        console.log(data);
    }
}

// Tarkastellaan, onko checkboxeista, jokin valittu
function checkboxValidate() {
    // Haetaan kaikki checkboxit
    var gps = document.getElementById('gps');
    var nfc = document.getElementById('nfc');
    var qr = document.getElementById('qr');
    var lomake = document.getElementById('lomake');
    // Virheiden lkm
    var virhe = 0;
    // Jos jokin valittu kaikki ok
    if ((gps.checked) || (nfc.checked) || (qr.checked) || (lomake.checked)) {
        gps.parentNode.style.color = "black";
        lomake.setCustomValidity("");
    } else {
        // Jos ei ole valittu mitään tulee virhe
        gps.parentNode.style.color = "red";
        lomake.setCustomValidity("Valitse leimaustapa");
        virhe = 1;
    }
    return virhe;
}

// Ajan validointi
function aikaValidate() {
    var aika = document.getElementById('aika');
    var virhe = 0;
    if (aika.value >= '2018-01-01T01:00') {
        aika.style.color = "red";
        aika.setCustomValidity("Ajan on olatava pienempi kuin 01/01/2018 01:00");
        virhe = 1;
    } else {
        aika.style.color = "blue";
        aika.setCustomValidity("");
    }
    return virhe;
}

// Joukkueen nimen validointi
function joukueenNimiValidate() {
    var tekstikentta = document.getElementById('joukkueenNimi');
    var joukkueenNimi = tekstikentta.value.trim();
    var virhe = 0;
    // Jos joukkueen nimi on tyhjä, tulee siitä virhe
    if (joukkueenNimi.length === 0) {
        virhe = 2;
    }
    for (let i = 0; i < data.joukkueet.length; i++) {
        // Jos joukkueen nimi löytyy trimmatusta datasta, tulee virhe
        if (data.joukkueet[i].nimi.trim() === joukkueenNimi) {
            virhe = 1;
        }
    }
    // virheen käsittely
    if (virhe === 1) {
        tekstikentta.setCustomValidity("Joukkueen nimi on jo olemassa");
        tekstikentta.style.borderColor = "red";
    } else if (virhe === 2) {
        tekstikentta.setCustomValidity("Joukkueen nimi ei saa olla tyhjä");
        tekstikentta.style.borderColor = "red";
    } else {
        tekstikentta.setCustomValidity("");
        tekstikentta.style.borderColor = "blue";
    }
    return virhe;
}

// Jäsenien validointi
function jasenetValidate() {
    var lkm = 0;
    var virhe = 0;
    // lasketaan, onko vähintään kaksi jäsentä nimetty
    for (let i = 1; i <= jasen; i++) {
        var kentta = document.getElementById('kentta' + i);
        if (kentta.value.length > 0) {
            lkm++;
        }
    }
    // Jos ei ole kahta jäsentä, virhe
    if (lkm < 2) {
        for (let i = 1; i <= jasen; i++) {
            var kentta = document.getElementById('kentta' + i);
            kentta.style.borderColor = "red";
        }
        document.getElementById('kentta' + jasen).setCustomValidity("Joukkueella on oltava vähintään kaksi jäsentä");
        virhe = 1;
    } else {
        for (let i = 1; i <= jasen; i++) {
            var kentta = document.getElementById('kentta' + i);
            kentta.style.borderColor = "blue";
        }
        document.getElementById('kentta' + jasen).setCustomValidity("");
    }
    return virhe;
}

// Lisätään uusi jäsen kenttä klikkaamalla painiketta
function lisaaJasen(e) {
    e.preventDefault();
    jasen++;
    var name = 'jasen' + jasen;
    var fieldset = document.getElementById('fieldset');
    luoRivi(name, 'Jäsen ' + jasen, fieldset);
}

// Lisätään rivi, jossa on label ja tekstikenttä
function luoRivi(id, teksti, fieldset) {
    var p = document.createElement('p');
    var label = document.createElement('label');
    var input = document.createElement('input');
    var br = document.createElement('br');
    var buttonJasen = document.getElementById('buttonJasen')
    input.setAttribute("size", "40");
    input.setAttribute("required", "required");
    input.id = 'kentta' + jasen;
    label.appendChild(document.createTextNode(teksti));
    label.appendChild(input);
    p.appendChild(label);
    p.appendChild(br);
    fieldset.appendChild(p);
    fieldset.removeChild(buttonJasen);
    fieldset.appendChild(buttonJasen);
}

// Kerätään jäsenten tiedot
function saaJasenet() {
    var jasenet = [];
    for (let i = 1; i <= jasen; i++) {
        var kentta = document.getElementById('kentta' + i);
        if (kentta.value.length > 0) {
            jasenet.push(kentta.value);
        }
    }
    return jasenet;
}

// Kerätään, mitkä leimaukset on valittuina
function saaLeimaus() {
    var leimaus = [];
    var gps = document.getElementById('gps');
    var nfc = document.getElementById('nfc');
    var qr = document.getElementById('qr');
    var lomake = document.getElementById('lomake');
    if (gps.checked) {
        leimaus.push("GPS");
    }
    if (nfc.checked) {
        leimaus.push("NFC");
    }
    if (qr.checked) {
        leimaus.push("QR");
    }
    if (lomake.checked) {
        leimaus.push("Lomake");
    }
    return leimaus;
}

// Saadaan aika oikeaan muotoon kentästä
function saaAika() {
    var aika = document.getElementById('aika').value;
    var year = aika.substring(0, 4);
    var month = aika.substring(5, 7);
    var day = aika.substring(8, 10);
    var hour = aika.substring(11, 13);
    var minute = aika.substring(14, 16);
    return year + "-" + month + "-" + day + " " + hour + ":" + minute + ":00.000";
}

// Saadaan valittu sarja
function saaSarja() {
    var nimi;
    var ret;
    for (let i = 0; i < sarjojenLkm; i++) {
        var sarja = document.getElementById('sarja' + i);
        if (sarja.checked) {
            nimi = sarja.parentElement.textContent;
            break;
        }
    }
    for (let i = 0; i < data.kisat.length; i++) {
        for (let j = 0; j < data.kisat[i].sarjat.length; j++) {
            if (nimi === data.kisat[i].sarjat[j].nimi) {
                ret = data.kisat[i].sarjat[j].id;
            }
        }
    }
    return ret;
}