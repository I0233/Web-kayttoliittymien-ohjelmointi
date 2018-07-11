'use strict';

// Laskee, kuinka monta palkkia tehdään
let requestId = 0;

window.onload = function () {
  // Haetaan canvakset ja sen context, johon pupun puolikaat lisätään
  let childCanv1 = document.getElementById('childCanv1');
  let context = childCanv1.getContext('2d');

  let childCanv2 = document.getElementById('childCanv2');
  let context2 = childCanv2.getContext('2d');

  let bunnyImage1 = document.getElementById('bunny-img');

  // Määritetään canvaksille koot, joihin pupun puolikkaat tulevat
  childCanv1.style.width = bunnyImage1.width / 2 + 'px';
  childCanv1.style.height = bunnyImage1.height + 'px';

  childCanv1.width = childCanv1.offsetWidth;
  childCanv1.height = childCanv1.offsetHeight;

  childCanv2.style.width = bunnyImage1.width / 2 + 'px';
  childCanv2.style.height = bunnyImage1.height + 'px';

  childCanv2.width = childCanv1.width;
  childCanv2.height = childCanv2.offsetHeight;

  // Lisätään pupun puolikkaat canvaksiin
  context.drawImage(bunnyImage1, childCanv1.width - bunnyImage1.width / 2,
    childCanv1.height / 2 - bunnyImage1.height / 2);
  context2.drawImage(bunnyImage1, -bunnyImage1.width / 2, childCanv1.height / 2 - bunnyImage1.height / 2);
  luoSvg();
}

// Luodaan palkit taustalle
function luoSvg() {

  var container = document.getElementById('container');

  // Muodostetaan svg ja neliö
  var svgns = "http://www.w3.org/2000/svg";
  var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  var rect = document.createElementNS(svgns, 'rect');

  // Asetetaan neliölle ominaisuudet
  rect.setAttributeNS(null, 'x', '0');
  rect.setAttributeNS(null, 'width', '50px');
  rect.setAttributeNS(null, 'height', window.innerHeight);
  rect.setAttributeNS(null, 'stroke', 'green');
  rect.setAttributeNS(null, 'stroke-width', '2');
  rect.setAttributeNS(null, 'fill', '#66FFFF');
  rect.setAttributeNS(null, 'filter', 'url(#f1)');

  // Lisätään palkki näkyviin
  svg.appendChild(rect);
  container.appendChild(svg);

  // Asetetaan time out, jotta palkkien väliin jää tilaa
  setTimeout(() => {
    requestId = requestAnimationFrame(luoSvg);
    // loptetaan, kun on kymmenen palkkia
    if (requestId >= 10) {
      window.cancelAnimationFrame(requestId);
    }
  }, 200);
}
