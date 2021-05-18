function clockTime() {
  var today = new Date();
  var m = today.getMinutes();
  var s = today.getSeconds();
  var date = new Date();

  m = checkTime(m);
  s = checkTime(s);

  document.getElementById("clock").innerHTML = date;
  var t = setTimeout(clockTime, 500);
}
function checkTime(i) {
  if (i < 10) {
    i = "0" + i;
  } // add zero in front of numbers < 10
  return i;
}
