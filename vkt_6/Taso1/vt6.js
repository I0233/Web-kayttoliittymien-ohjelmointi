"use strict";

/*
App komponentti, jossa käsitellään näkymän avautuminen ja tietorakenteen kopiointi ja siihen lisäys
*/
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
		this.state = { 
			"joukkueet" : joukkueet
		};
	};

	/*
	Tallennetaan lomakkeella tehty joukkue tietorakenteeseen ja stateen
	*/
	tallennaJoukkue = (joukkue) => {
		if(joukkue) {
			// Kerätään kaikki tarpeelliset tiedot tietorakenteeseen tallennettavaan objektiin
			let tallennettava = new Object();
			let sarjaId = this.saaSarjaId(joukkue.sarja);
			tallennettava.id = parseInt(Math.random() * 100000000);
			tallennettava.jasenet = joukkue.jasenet;
			tallennettava.leimaustapa = joukkue.leimaustapa;
			tallennettava.luontiaika = joukkue.luontiaika;
			tallennettava.matka = 0;
			tallennettava.nimi = joukkue.nimi;
			tallennettava.pisteet = 0;
			tallennettava.rastit = [];
			tallennettava.sarja = sarjaId;
			tallennettava.seura = null;
			// Lisätään dataan joukkue
			data.joukkueet.push(tallennettava);
			// Tehdään kopio
			let joukkueCopy = Object.assign({}, tallennettava);
			// Poistetaan kopiosta ylimääräiset tiedot
			delete joukkueCopy.matka, delete joukkueCopy.pisteet, delete joukkueCopy.luontiaika;
			// Lisätään kopio stateen
			this.state.joukkueet.push(joukkueCopy);
			this.setState({"joukkueet": this.state.joukkueet});
			// Tulostetaan päivitetyt listaukset
			console.log("State joukkueet:", this.state.joukkueet);
			console.log("Data joukkueet:", data.joukkueet);
		}
	}

	// Etsitään sarjan id tietorakenteesta
	saaSarjaId = (sarja) => {
		if(sarja && data && data.kisat && data.kisat.length > 0) {
			for (let i = 0; i < data.kisat[0].sarjat.length; i++) {
				let _sarja = data.kisat[0].sarjat[i];
				if(_sarja.nimi === sarja) {
					return _sarja.id;
				}
			}
			return null;
		}
	}

	render () {
		return (
			// Luodaan näkymä, jossa vasemmalla lomake, jolla lisätään joukkue ja oikealla joukkue listaus.
			<div id="row">
				<div id="vasen">
					<LisaaJoukkue joukkueet={this.state.joukkueet} tallennaJoukkue={this.tallennaJoukkue} />
				</div>
				<div id="oikea">
					<ListaaJoukkueet joukkueet={this.state.joukkueet} />
				</div>
			</div>
		)
	}
}

/*
Komponentti, jolla luodaan lomake joukkueen lisäämiseksi
*/
class LisaaJoukkue extends React.Component {
    constructor(props) {
		super(props);
		
		// Bindataan funktiot, jotta toimivat
		this.handleChange = this.handleChange.bind(this);
		this.handleInsert = this.handleInsert.bind(this);
		this.haeLomakeTiedot = this.haeLomakeTiedot.bind(this);
		
		// Asetetaan stateen tiedot joukkueista ja alustetaan paikka lomakkeen tiedoille
		this.state = {
			"joukkueet": this.props.joukkueet,
			"lomakeTiedot": {}
		}
	}

	/*
	Käsitellään tietojen muuttuminen, kun tietoja kirjoitetaan lomakkeelle
	*/
	handleChange = (e) => {
		this.joukueenNimiValidate();
		this.jasenetValidate();
	}

	/*
	Kerätään lomakkeen tiedot, kun klikataan tallenna painiketta
	*/
	handleInsert = (e) => {
		e.preventDefault();
		this.haeLomakeTiedot();
	}

	/*
	Validoidaan joukkueen nimi
	*/
	joukueenNimiValidate = () => {
		let tekstikentta = document.querySelector("input[name='joukkueenNimi']");
		let virhe = 0;
		// Jos joukkueen nimi on tyhjä, tulee siitä virhe
		if (tekstikentta.value.length === 0) {
			virhe = 2;
		}
		for (let i = 0; i < this.state.joukkueet.length; i++) {
			// Jos joukkueen nimi on jo toisella joukkueella ei sitä saa hyväksyä
			if (this.state.joukkueet[i].nimi.trim() === tekstikentta.value) {
				virhe = 1;
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
	
	/*
	Jäsenien validointi
	*/
	jasenetValidate = () => {
		var lkm = 0;
		let jasenetKentat = document.getElementsByClassName('tekstikentta');
		
		// lasketaan, onko vähintään kaksi jäsentä nimetty
		for (let i = 0; i < jasenetKentat.length; i++) {
			let jasenetKentta = jasenetKentat[i];
			if(jasenetKentta.value) {
				++lkm;
			}
		}
		// Jos ei ole kahta jäsentä, virhe
		if (lkm < 2) {
			for (let i = 0; i < jasenetKentat.length; i++) {
				let jasenetKentta = jasenetKentat[i];
				jasenetKentta.style.borderColor = "red";
				jasenetKentta.style.boxShadow = "1px 1px 1px red";
				jasenetKentta.setCustomValidity("Joukkueella on oltava vähintään kaksi jäsentä");
			}
		} else {
			for (let i = 0; i < jasenetKentat.length; i++) {
				let jasenetKentta = jasenetKentat[i];
				jasenetKentta.style.borderColor = "blue";
				jasenetKentta.style.boxShadow = "";
				jasenetKentta.setCustomValidity("");
			}
		}
	}

	/*
	Kerätään, mitkä leimaukset on valittuina
	*/
	saaLeimaus = () => {
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
	
	/*
	Saadaan aika oikeaan muotoon kentästä
	*/
	saaAika = (aika) => {
		var year = aika.substring(0, 4);
		var month = aika.substring(5, 7);
		var day = aika.substring(8, 10);
		var hour = aika.substring(11, 13);
		var minute = aika.substring(14, 16);
		aika = year + "-" + month + "-" + day + " " + hour + ":" + minute + ":00";
		let dateTmp = new Date(year, month, day, hour, minute);
		// Jos aika on oikeaa muotoa palautetaan se, muulloin null
		return (dateTmp instanceof Date && !isNaN(dateTmp.getTime())) ? aika : null;
	}

	/*
	Saadaan valitun sarjan nimi
	*/
	saaSarja = () => {
		let nimi;
		let sarjat = document.querySelectorAll('input[name="sarja"]');
		for (let sarja of sarjat) {
			if (sarja.checked) {
				nimi = sarja.parentElement.textContent;
				break;
			}
		}
		return nimi;
	}

	/*
	Kerätään jäsenten nimet
	*/
	saaJasenet = () => {
		let jasenet = [];
		let jasenetKentat = document.getElementsByClassName('tekstikentta');
		for (let i = 0; i < jasenetKentat.length; i++) {
			let jasenetKentta = jasenetKentat[i];
			if(jasenetKentta.value){
				jasenet.push(jasenetKentta.value);
			}
		}
		return jasenet;
	}

	/*
	Kerätään kaikki lomakkeen tiedot stateen
	*/
	haeLomakeTiedot = () => {
		this.state.lomakeTiedot['nimi'] = document.querySelector("input[name='joukkueenNimi']").value;
		this.state.lomakeTiedot['luontiaika'] = this.saaAika(document.getElementById('alkuaika').value);
		this.state.lomakeTiedot['leimaustapa'] = this.saaLeimaus();
		this.state.lomakeTiedot['sarja'] = this.saaSarja();
		this.state.lomakeTiedot['jasenet'] = this.saaJasenet();
		this.setState({lomakeTiedot: this.state.lomakeTiedot});
		this.props.tallennaJoukkue(this.state.lomakeTiedot);
		// Tyhjennetään lomake
		this.reset();
	}

	/*
	Lomakkeen tyhjennys alkuperäiseksi
	*/
	reset = () => {
		document.querySelector("input[name='joukkueenNimi']").value = "";
		document.getElementById('alkuaika').value = "vvvv-kk-ppThh:mm";
		document.getElementById('gps').checked = false;
		document.getElementById('nfc').checked = false;
		document.getElementById('qr').checked = false;
		document.getElementById('lomake').checked = false;
		document.querySelector('input[name="sarja"]').checked = true;
		let jasenetKentat = document.getElementsByClassName('tekstikentta');
		for (let i = 0; i < jasenetKentat.length; i++) {
			jasenetKentat[i].value = "";
		}
	}

	render() {
		return (
			// Lomakkeen asettelu sellaiseksi kuin pitää olla
			<div>
				<h1>Lisää joukkue</h1>
				<form method="post" onSubmit={this.handleInsert}>
					<fieldset>
						<legend>Joukkueen tiedot</legend>
						<div>
							<label>Nimi</label>
							<input name="joukkueenNimi" required="required" onChange={this.handleChange}/>
						</div>
						<div>
							<label>Luontiaika</label>
							<input id="alkuaika" type="datetime-local" defaultValue="vvvv-kk-ppThh:mm"/>
						</div>
						<div>
							<label>Leimaustapa</label>
							<span>
								<div>
									<label>GPS</label>
									<input id="gps" type="checkbox"/>
								</div>
								<br/>
								<div>
									<label>NFC</label>
									<input id="nfc" type="checkbox"/>
								</div>
								<br/>
								<div>
									<label>QR</label>
									<input id="qr" type="checkbox"/>
								</div>
								<br/>
								<div>
									<label>Lomake</label>
									<input id="lomake" type="checkbox"/>
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
							<input className="tekstikentta" onChange={this.handleChange}/>
						</div>
						<div>
							<label>Jäsen 2</label>
							<input className="tekstikentta" onChange={this.handleChange}/>
						</div>
						<div>
							<label>Jäsen 3</label>
							<input className="tekstikentta" onChange={this.handleChange}/>
						</div>
						<div>
							<label>Jäsen 4</label>
							<input className="tekstikentta" onChange={this.handleChange}/>
						</div>
						<div>
							<label>Jäsen 5</label>
							<input className="tekstikentta" onChange={this.handleChange}/>
						</div>
					</fieldset>
					<button type="submit">Tallenna</button>
				</form>
			</div>
		);
	}
}

/*
Joukkue listaus komponentti
*/
class ListaaJoukkueet extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			joukkueet: this.props.joukkueet
		}
	}
	haeJoukkueet
	render = () => {
		let joukkueet = this.state.joukkueet;
		return(
			// Listaus näykmä
			<div id="listaus">
				<h2>Joukkueet</h2>
				<ul>
					{joukkueet.map(function(joukkue, i){
						return (<li key={i}>{joukkue.nimi}</li>);
					})}
				</ul>
			</div>
		);
	}
}

/*
Ohjelman käynnistys
*/
ReactDOM.render(
	<App> </App>,
	document.getElementById('root')
);