window.onload = function () {
  let canvas = document.getElementById('canvas'),
    context = canvas.getContext('2d');
  let bunnyImage1 = document.getElementById('bunny-img');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  context.drawImage(bunnyImage1, canvas.width / 2 - bunnyImage1.width / 2, 
  canvas.height / 2 - bunnyImage1.height / 2);
}