window.onload = function () {

  let childCanv1 = document.getElementById('childCanv1'),
    context = childCanv1.getContext('2d');

  let childCanv2 = document.getElementById('childCanv2'),
    context2 = childCanv2.getContext('2d');

  childCanv1.style.width = window.innerWidth / 2;
  childCanv1.style.height = window.innerHeight;

  childCanv1.width  = childCanv1.offsetWidth;
  childCanv1.height = childCanv1.offsetHeight;

  childCanv2.style.width = childCanv1.width ;
  childCanv2.style.height = window.innerHeight;

  childCanv2.width  = childCanv1.width ;
  childCanv2.height = childCanv2.offsetHeight;

  let bunnyImage1 = document.getElementById('bunny-img');

  context.drawImage(bunnyImage1, childCanv1.width  - bunnyImage1.width / 2,
    childCanv1.height / 2 - bunnyImage1.height / 2);
  context2.drawImage(bunnyImage1, -bunnyImage1.width / 2, childCanv1.height / 2 - bunnyImage1.height / 2);
}