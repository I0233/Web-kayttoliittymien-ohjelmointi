"use strict";

class App extends React.Component {
    constructor(props) {
      super(props);

        // tehdään kopio tietorakenteen joukkueista
        // Tämä on tehtävä näin, että saadaan oikeasti aikaan kopio eikä vain viittausta samaan tietorakenteeseen. Objekteja ja taulukoita ei voida kopioida vain sijoitusoperaattorilla
        // päivitettäessä React-komponentin tilaa on aina vanha tila kopioitava uudeksi tällä tavalla
        // kts. https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/from
        let joukkueet = Array.from( data.joukkueet, function(j) {
            // luodaan uusijoukkue
            let uusij = {};
            // kopioidaan tavalliset kentät
            let kentat = ["nimi", "sarja", "seura", "id"];
            for( let i of kentat )
                uusij[i] = j[i];
            // taulukot on kopioitava erikseen. Nyt riittää pelkkä array.from, koska tauluiden
            // sisällä ei ole muita taulukoita tai objekteja
            let uusijasenet = Array.from( j["jasenet"] );
            let uusirastit = Array.from( j["rastit"] );
            let uusileimaustapa = Array.from( j["leimaustapa"] );
            uusij["jasenet"] = uusijasenet;
            uusij["rastit"] = uusirastit;
            uusij["leimaustapa"] = uusileimaustapa;
            return uusij;
        });
        console.log(joukkueet);
        this.state = { 
            "joukkueet" : joukkueet
        };
    }
    render () {
        return <LisaaJoukkue/>
    }
}

class LisaaJoukkue extends React.Component {
    constructor(props) {
        super(props);
        this.handleInsert = this.handleInsert.bind(this);
    }
    handleInsert = (event) => {
        console.log("1000 kertaa varma");
        event.preventDefault();
        this.joukueenNimiValidate();
    }
    render() {
        return (
            <div>
                <h1>Lisää joukkue</h1>
                <form method="post" onSubmit={this.handleInsert}>
                <fieldset>
                    <legend>Joukkueen tiedot</legend>
                    <div>
                        <label>Nimi</label>
                        <input id="joukkueenNimi" className="tekstikentta" required="required"/>
                    </div>
                    <div>
                        <label>Luontiaika</label>
                        <input type="datetime-local" defaultValue="vvvv-kk-ppThh:mm"/>
                    </div>
                    <div>
                        <label>Leimaustapa</label>
                        <span>
                            <div>
                                <label>GPS</label>
                                <input type="checkbox"/>
                            </div>
                            <br/>
                            <div>
                                <label>NFC</label>
                                <input type="checkbox"/>
                            </div>
                            <br/>
                            <div>
                                <label>QR</label>
                                <input type="checkbox"/>
                            </div>
                            <br/>
                            <div>
                                <label>Lomake</label>
                                <input type="checkbox"/>
                            </div>
                        </span>
                    </div>
                    <div>
                        <label>Sarja</label>
                        <span>
                            <div>
                                <label>2h</label>
                                <input defaultChecked="checked" name="sarja" type="radio"/>
                            </div>
                            <br/>
                            <div>
                                <label>4h</label>
                                <input name="sarja" type="radio"/>
                            </div>
                            <br/>
                            <div>
                                <label>8h</label>
                                <input name="sarja" type="radio"/>
                            </div>
                        </span>
                    </div>
                </fieldset>
                <fieldset>
                    <legend>Jäsenet</legend>
                    <div>
                        <label>Jäsen 1</label>
                        <input className="tekstikentta"/>
                    </div>
                    <div>
                        <label>Jäsen 2</label>
                        <input className="tekstikentta"/>
                    </div>
                    <div>
                        <label>Jäsen 3</label>
                        <input className="tekstikentta"/>
                    </div>
                    <div>
                        <label>Jäsen 4</label>
                        <input className="tekstikentta"/>
                    </div>
                    <div>
                        <label>Jäsen 5</label>
                        <input className="tekstikentta"/>
                    </div>
                </fieldset>
                </form>
                <button type="submit">Tallenna</button>
            </div>
        );
    }
    joukueenNimiValidate = () => {
        let tekstikentta = document.getElementById('joukkueenNimi');
        let joukkueenNimi = tekstikentta.value.trim();
        let virhe = 0;
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
            console.log(tekstikentta);
            tekstikentta.setCustomValidity("Joukkueen nimi ei saa olla tyhjä");
            tekstikentta.style.borderColor = "red";
            tekstikentta.style.boxShadow = "1px 1px 1px red";
        } else {
            tekstikentta.setCustomValidity("");
            tekstikentta.style.borderColor = "blue";
            tekstikentta.style.boxShadow = "";
        }
    }
}


ReactDOM.render(
    <App> </App>,
  document.getElementById('root')
);
