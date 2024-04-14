$(document).ready(function () {
  var map = L.map("map").setView([51.505, -0.09], 13);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  $("#routeForm").on("submit", function (e) {
    e.preventDefault();
    var start = $("#startInput").val();
    var end = $("#endInput").val();
    searchRoute(start, end);
  });

  function searchRoute(start, end) {
    var control = L.Routing.control({
      waypoints: [L.latLng(start), L.latLng(end)],
      routeWhileDragging: true,
    }).addTo(map);

    control.on("routesfound", function (e) {
      var routes = e.routes;
      console.log(routes);
    });
  }
});
