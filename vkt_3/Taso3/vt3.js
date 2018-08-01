// data-muuttuja sisältää kaiken tarvittavan ja on rakenteeltaan lähes samankaltainen kuin viikkotehtävässä 2
// Rastileimaukset on siirretty tupa-rakenteesta suoraan jokaisen joukkueen yhteyteen
//
// voit tutkia tarkemmin käsiteltävää tietorakennetta konsolin kautta
// tai json-editorin kautta osoitteessa http://jsoneditoronline.org/
// Jos käytät json-editoria niin avaa data osoitteesta:
// http://appro.mit.jyu.fi/tiea2120/vt/vt3/data.json

"use strict";

var idJoukkueelle = 100;
var idKisoille = 324;
var jasen = 5;
var joukkueMuokattavana = 0;

// Alustetaan kaikki
window.onload = function () {
    console.log(data);
    luoAlasveto();
    luoSarjalistaus();
    luoJoukkuelistaus();
    // jokaiselle validoitavalle kentälle luodaan onchange tapahtuma, joka tarkistaa kenttien oikeellisuudet
    document.getElementById('joukkueenNimi').addEventListener("change", joukueenNimiValidate);
    document.getElementById('joukkueenNimi').setCustomValidity("Joukkueen nimi ei saa olla tyhjä");
    document.getElementById('aika').addEventListener("change", aikaValidate);
    var checkboxit = document.querySelectorAll('input[name="leimaus"]');
    for (let c of checkboxit) {
        c.addEventListener("change", checkboxValidate);
    }
    var jasenet = document.querySelectorAll('input[name="jasen"]');
    for (let j of jasenet) {
        j.addEventListener("change", jasenetValidate);
    }
    document.getElementById('jasenLisays').addEventListener("submit", function (e) {
        tallenna();
        e.preventDefault();
    });

    // Kisan validate kenttien onchange tapahtumien lisäys
    document.getElementById('kisanNimi').addEventListener("change", kisanNimiValidate);
    document.getElementById('kisanNimi').setCustomValidity("Kisan nimi ei saa olla tyhjä");
    document.getElementById('kisanKesto').addEventListener("change", kisanKestoValidate);
    document.getElementById('alkuaika').addEventListener("change", alkuaikaValidate);
    document.getElementById('loppuaika').addEventListener("change", loppuaikaValidate);
    document.getElementById('kisaLisays').addEventListener("submit", function (e) {
        tallennaKisa();
        e.preventDefault();
    });
};

// Tarkistetaan joukkueen lisäämisen/muokaamiseen tarvittavien kenttien oikeellisuudet
function validate() {
    joukueenNimiValidate();
    aikaValidate();
    checkboxValidate();
    jasenetValidate();
}

// Tehdään alasveto, jossa kilpailut
function luoAlasveto() {
    var select = document.getElementById('select');
    while (select.firstChild) {
        select.removeChild(select.firstChild);
    }
    select.addEventListener("change", luoSarjalistaus);
    for (let i = 0; i < data.kisat.length; i++) {
        var option = document.createElement('option');
        option.appendChild(document.createTextNode(data.kisat[i].nimi));
        option.id = 'kisa' + i;
        select.appendChild(option);
    }
}

// Luodaan sarja listaus datan mukaan näkyviin
function luoSarjalistaus() {
    var sarjatNimet = [];
    // Kerätään sarjojen nimet datasta
    for (let i = 0; i < data.kisat.length; i++) {
        var kisa = document.getElementById('kisa' + i);
        if (kisa.selected) {
            for (let j = 0; j < data.kisat[i].sarjat.length; j++) {
                var sarja = new Object();
                sarja = data.kisat[i].sarjat[j].nimi;
                sarjatNimet.push(sarja);
            }
        }
    }
    // Järjestetään ne
    sarjatNimet.sort(jarjestykseen);
    // Elementti, johon sarjat lisätään
    var span = document.getElementById('sarjat');
    while (span.firstChild) {
        span.removeChild(span.firstChild);
    }
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
        value.id = sarjatNimet[i];
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
    while (ul.firstChild) {
        ul.removeChild(ul.firstChild);
    }
    for (let i = 0; i < data.joukkueet.length; i++) {
        lisaaJoukkueListaan(ul, i);
    }
}

// Lisätään yksi joukkue listaukseen
function lisaaJoukkueListaan(ul, i) {
    var li = document.createElement("li");
    li.appendChild(document.createTextNode(data.joukkueet[i].nimi));
    li.addEventListener("click", naytaJoukkueenTiedot);
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

// Näytetään valitun joukkueen tiedot
function naytaJoukkueenTiedot(e) {
    alustaLomake();
    joukkueMuokattavana = e.target.textContent;
    for (let i = 0; i < data.joukkueet.length; i++) {
        if (data.joukkueet[i].nimi === joukkueMuokattavana) {
            document.getElementById('joukkueenNimi').value = data.joukkueet[i].nimi;
            document.getElementById('aika').value = data.joukkueet[i].luontiaika.replace(" ", "T").substring(0, 16);
            // Kerätään leimaustavat
            for (let j = 0; j < data.joukkueet[i].leimaustapa.length; j++) {
                if (data.joukkueet[i].leimaustapa[j] === "GPS") {
                    document.getElementById('gps').checked = true;
                }
                if (data.joukkueet[i].leimaustapa[j] === "NFC") {
                    document.getElementById('nfc').checked = true;
                }
                if (data.joukkueet[i].leimaustapa[j] === "QR") {
                    document.getElementById('qr').checked = true;
                }
                if (data.joukkueet[i].leimaustapa[j] === "Lomake") {
                    document.getElementById('lomake').checked = true;
                }
            }
            // sarja näkyviin
            loop:
                for (let j = 0; j < data.kisat.length; j++) {
                    for (let k = 0; k < data.kisat[j].sarjat.length; k++) {
                        if (data.kisat[j].sarjat[k].id === data.joukkueet[i].sarja) {
                            var sarjat = document.querySelectorAll('input[name="sarja"]');
                            for (let sarja of sarjat) {
                                if (sarja.id === data.kisat[j].sarjat[k].nimi) {
                                    sarja.checked = true;
                                    document.getElementById("select").selectedIndex = j;
                                    break loop;
                                }
                            }
                        }
                    }
                }
            // jäsenten nimet näkyviin
            for (let j = 0; j < data.joukkueet[i].jasenet.length; j++) {
                if (jasen < j + 1) {
                    lisaaJasen();
                }
                document.getElementById('kentta' + parseInt(j + 1)).value = data.joukkueet[i].jasenet[j];
            }
            validate();
        }
    }
}

// Alustetaan joukkueen 
function alustaLomake() {
    document.getElementById('joukkueenNimi').value = "";
    document.getElementById('aika').value = "2014-01-02T11:42:00";
    document.getElementById('gps').checked = false;
    document.getElementById('nfc').checked = false;
    document.getElementById('qr').checked = false;
    document.getElementById('lomake').checked = false;
    var sarjat = document.querySelectorAll('input[name="sarja"]');
    for (let sarja of sarjat) {
        sarja.checked = true;
        break;
    }
    document.getElementById("select").selectedIndex = 0;
    for (let j = 1; j <= jasen; j++) {
        document.getElementById('kentta' + j).value = "";
    }
}

// Peruutetaan lisäys klikkaamalla peruuta painiketta
function peruutaLisays(e) {
    e.preventDefault();
    joukkueMuokattavana = 0;
    alustaLomake();
}

// Kun klikataan tallenna painiketta suoritetaan
function tallenna() {
    if (joukkueMuokattavana === 0) {
        // uusiJoukkue ja sen tiedot
        var uusiJoukkue = new Object();
        uusiJoukkue.id = idJoukkueelle;
        uusiJoukkue.jasenet = saaJasenet();
        uusiJoukkue.leimaustapa = saaLeimaus();
        var aika = document.getElementById('aika').value;
        uusiJoukkue.luontiaika = saaAika(aika)+".000";
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
    } else {
        for (let i = 0; i < data.joukkueet.length; i++) {
            if (data.joukkueet[i].nimi === joukkueMuokattavana) {
                data.joukkueet[i].nimi = document.getElementById('joukkueenNimi').value;
                data.joukkueet[i].jasenet = saaJasenet();
                data.joukkueet[i].leimaustapa = saaLeimaus();
                var aika = document.getElementById('aika').value;
                data.joukkueet[i].luontiaika = saaAika(aika)+".000";
                data.joukkueet[i].sarja = saaSarja();
            }
        }
        luoJoukkuelistaus();
        joukkueMuokattavana = 0;
    }
    // tulostetaan vielä koko data, josta nähdään, että uusi joukkue on siellä oikein
    console.log(data);
    alustaLomake();
};

// Tarkastellaan, onko checkboxeista, jokin valittu
function checkboxValidate() {
    // Haetaan kaikki checkboxit
    var gps = document.getElementById('gps');
    var nfc = document.getElementById('nfc');
    var qr = document.getElementById('qr');
    var lomake = document.getElementById('lomake');
    lomake.setCustomValidity("Valitse leimaustapa");
    // Jos jokin valittu kaikki ok
    if ((gps.checked) || (nfc.checked) || (qr.checked) || (lomake.checked)) {
        gps.parentNode.style.color = "black";
        lomake.setCustomValidity("");
    } else {
        // Jos ei ole valittu mitään tulee virhe
        gps.parentNode.style.color = "red";
        lomake.setCustomValidity("Valitse leimaustapa");
    }
}

// Ajan validointi
function aikaValidate() {
    var aika = document.getElementById('aika');
    if (aika.value >= '2018-01-01T01:00') {
        aika.style.color = "red";
        aika.style.boxShadow = "1px 1px 1px red";
        aika.setCustomValidity("Ajan on oltava pienempi kuin 01/01/2018 01:00");
    } else if (aika.value === null || aika.value === "") {
        aika.style.color = "red";
        aika.style.boxShadow = "1px 1px 1px red";
        aika.setCustomValidity("Aseta aika");
    } else {
        aika.style.color = "blue";
        aika.style.boxShadow = "";
        aika.setCustomValidity("");
    }
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
            if (joukkueMuokattavana !== data.joukkueet[i].nimi) {
                virhe = 1;
            }
        }
    }
    // virheen käsittely
    if (virhe === 1) {
        tekstikentta.setCustomValidity("Joukkueen nimi on jo olemassa");
        tekstikentta.style.borderColor = "red";
        tekstikentta.style.boxShadow = "1px 1px 1px red";
    } else if (virhe === 2) {
        tekstikentta.setCustomValidity("Joukkueen nimi ei saa olla tyhjä");
        tekstikentta.style.borderColor = "red";
        tekstikentta.style.boxShadow = "1px 1px 1px red";
    } else {
        tekstikentta.setCustomValidity("");
        tekstikentta.style.borderColor = "blue";
        tekstikentta.style.boxShadow = "";
    }
}

// Jäsenien validointi
function jasenetValidate() {
    var lkm = 0;
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
            kentta.style.boxShadow = "1px 1px 1px red";
        }
        document.getElementById('kentta' + jasen).setCustomValidity("Joukkueella on oltava vähintään kaksi jäsentä");
    } else {
        for (let i = 1; i <= jasen; i++) {
            var kentta = document.getElementById('kentta' + i);
            kentta.style.boxShadow = "";
            kentta.style.borderColor = "blue";
        }
        document.getElementById('kentta' + jasen).setCustomValidity("");
    }
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
    var div = document.createElement('div');
    var label = document.createElement('label');
    var input = document.createElement('input');
    var buttonJasen = document.getElementById('buttonJasen')
    input.setAttribute("name", "jasen");
    input.id = 'kentta' + jasen;
    input.style.border = "1px solid blue";
    label.appendChild(document.createTextNode(teksti));
    div.appendChild(label);
    div.appendChild(input);
    fieldset.appendChild(div);
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
function saaAika(aika) {
    var year = aika.substring(0, 4);
    var month = aika.substring(5, 7);
    var day = aika.substring(8, 10);
    var hour = aika.substring(11, 13);
    var minute = aika.substring(14, 16);
    return year + "-" + month + "-" + day + " " + hour + ":" + minute + ":00";
}

// Saadaan valittu sarja
function saaSarja() {
    var nimi;
    var ret;
    var sarjat = document.querySelectorAll('input[name="sarja"]');
    for (let sarja of sarjat) {
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

// Kilpailun täyttämisen vaasitut tarkastukset
function validateKilpailu() {
    kisanNimiValidate();
    kisanKestoValidate();
    alkuaikaValidate();
    loppuaikaValidate();
}

// Kisan nimen validointi
function kisanNimiValidate() {
    var tekstikentta = document.getElementById('kisanNimi');
    var kisanNimi = tekstikentta.value.trim();
    var virhe = 0;
    // Jos Kisan nimi on tyhjä, tulee siitä virhe
    if (kisanNimi.length === 0) {
        virhe = 2;
    }
    for (let i = 0; i < data.kisat.length; i++) {
        // Jos Kisan nimi löytyy trimmatusta datasta, tulee virhe
        if (data.kisat[i].nimi.trim() === kisanNimi) {
            virhe = 1;
        }
    }
    // virheen käsittely
    if (virhe === 1) {
        tekstikentta.setCustomValidity("Kisan nimi on jo olemassa");
        tekstikentta.style.borderColor = "red";
        tekstikentta.style.boxShadow = "1px 1px 1px red";
    } else if (virhe === 2) {
        tekstikentta.setCustomValidity("Kisan nimi ei saa olla tyhjä");
        tekstikentta.style.borderColor = "red";
        tekstikentta.style.boxShadow = "1px 1px 1px red";
    } else {
        tekstikentta.setCustomValidity("");
        tekstikentta.style.borderColor = "blue";
        tekstikentta.style.boxShadow = "";
    }
}

// Kisan keston validate
function kisanKestoValidate() {
    if (parseInt(document.getElementById('kisanKesto').value) && parseInt(document.getElementById('kisanKesto').value) >= 1) {
        document.getElementById('kisanKesto').setCustomValidity("");
        document.getElementById('kisanKesto').style.borderColor = "blue";
        document.getElementById('kisanKesto').style.boxShadow = "";
    } else {
        document.getElementById('kisanKesto').setCustomValidity("Kesto on oltava numero ja >= 1");
        document.getElementById('kisanKesto').style.borderColor = "red";
        document.getElementById('kisanKesto').style.boxShadow = "1px 1px 1px red";
    }
}

// Alku ajan validate
function alkuaikaValidate() {
    var alkuaika = document.getElementById('alkuaika');
    if (alkuaika.value === null || alkuaika.value === "") {
        alkuaika.style.color = "red";
        alkuaika.style.boxShadow = "1px 1px 1px red";
        alkuaika.setCustomValidity("Aseta aika");
    } else {
        alkuaika.style.color = "blue";
        alkuaika.style.boxShadow = "";
        alkuaika.setCustomValidity("");
    }
}

// Loppuajan validatw
function loppuaikaValidate() {
    var loppuaika = document.getElementById('loppuaika');
    var alkuaika = document.getElementById('alkuaika');
    var kisanKesto = document.getElementById('kisanKesto');
    var aloitus = new Date(alkuaika.value.substring(0, 4), alkuaika.value.substring(5, 7) - 1, alkuaika.value.substring(8, 10),
        alkuaika.value.substring(11, 13), alkuaika.value.substring(14, 16), 0, 0);
    var lopetus = new Date(loppuaika.value.substring(0, 4), loppuaika.value.substring(5, 7) - 1, loppuaika.value.substring(8, 10),
        loppuaika.value.substring(11, 13), loppuaika.value.substring(14, 16), 0, 0);
    var minimilopetus = new Date(alkuaika.value.substring(0, 4), alkuaika.value.substring(5, 7) - 1, alkuaika.value.substring(8, 10),
        alkuaika.value.substring(11, 13), alkuaika.value.substring(14, 16), 0, 0).addHours(kisanKesto.value);
    if (lopetus < minimilopetus || lopetus < aloitus) {
        loppuaika.style.color = "red";
        loppuaika.style.boxShadow = "1px 1px 1px red";
        loppuaika.setCustomValidity("Loppuajan on oltava suurempi kuin alkuaika + kesto");
    } else if (loppuaika.value === null || loppuaika.value === "") {
        loppuaika.style.color = "red";
        loppuaika.style.boxShadow = "1px 1px 1px red";
        loppuaika.setCustomValidity("Aseta aika");
    } else {
        loppuaika.style.color = "blue";
        loppuaika.style.boxShadow = "";
        loppuaika.setCustomValidity("");
    }
}

// Lisätään tunnit
Date.prototype.addHours = function (h) {
    this.setHours(this.getHours() + parseInt(h));
    return this;
}

// Tallennetaan uuden kisan tiedot
function tallennaKisa() {
    // uusi kisa ja sen tiedot
    var uusiKisa = new Object();
    var alkuaika = document.getElementById('alkuaika').value;
    uusiKisa.alkuaika = saaAika(alkuaika);
    uusiKisa.id = idKisoille;
    uusiKisa.kesto = parseInt(document.getElementById('kisanKesto').value);
    var loppuaika = document.getElementById('loppuaika').value;
    uusiKisa.loppuaika = saaAika(loppuaika);
    uusiKisa.nimi = document.getElementById('kisanNimi').value;
    var sarjatKisalle = [];
    for (let i = 0; i < data.kisat[0].sarjat.length; i++) {
        sarjatKisalle.push(data.kisat[0].sarjat[i]);
    }
    uusiKisa.sarjat = sarjatKisalle;
    idKisoille++;
    // lisätään uusi kisa data.kisoihin
    data.kisat.push(uusiKisa);
    // tulostetaan vielä koko data, josta nähdään, että uusi kisa on siellä oikein
    console.log(data);
    luoAlasveto();
    document.getElementById('kisanNimi').value = "";
    document.getElementById('kisanKesto').value = "";
    document.getElementById('alkuaika').value = "2018-01-02T11:42:00";
    document.getElementById('loppuaika').value = "2018-01-02T13:42:00";
}