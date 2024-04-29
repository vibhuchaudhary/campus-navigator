const map = L.map("map", {
    minZoom: 2,
  });
  map.setView([28.631049, 77.371839], 18); // Jaypee
  const apiKey =
    "AAPKc5296e327f6a44e0b41e6c10d10da373DiX36STTeip9d-XDXSPYEQqhSECRDqsHgV8ZnxhYJH0Pu84RDx5ABwva7GFFbBZj";

  const basemapEnum = "arcgis/navigation";

  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution:
      '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(map);

  L.Control.PlacesSelect = L.Control.extend({
    onAdd: function (map) {
      const placeCategories = [
        ["", "Choose a category..."],
        ["Coffee shop", "Coffee shop"],
        ["Gas station", "Gas station"],
        ["Food", "Food"],
        ["Hotel", "Hotel"],
        ["Parks and Outdoors", "Parks and Outdoors"],
      ];

      const select = L.DomUtil.create("select", "");
      select.setAttribute("id", "optionsSelect");
      select.setAttribute("style", "font-size: 16px;padding:4px 8px;");

      placeCategories.forEach((category) => {
        let option = L.DomUtil.create("option");
        option.value = category[0];
        option.innerHTML = category[1];
        select.appendChild(option);
      });

      return select;
    },

    onRemove: function (map) {
      // Nothing to do here
    },
  });
  L.control.placesSelect = function (opts) {
    return new L.Control.PlacesSelect(opts);
  };

  L.control
    .placesSelect({
      position: "bottomright",
    })
    .addTo(map);

  const layerGroup = L.layerGroup().addTo(map);
  function showPlaces(category) {
    L.esri.Geocoding.geocode({
      apikey: apiKey,
    })
      .category(category)
      .nearby(map.getCenter(), 10)
      .run(function (error, response) {
        if (error) {
          return;
        }
        layerGroup.clearLayers();
        response.results.forEach((searchResult) => {
          L.marker(searchResult.latlng)
            .addTo(layerGroup)
            .bindPopup(
              `<b>${searchResult.properties.PlaceName}</b></br>${searchResult.properties.Place_addr}`,
            );
        });
      });
  }
  const select = document.getElementById("optionsSelect");
  select.addEventListener("change", () => {
    if (select.value !== "") {
      showPlaces(select.value);
    }
  });
  const directions = document.createElement("div");
  directions.id = "directions";
  directions.innerHTML =
    "Click on the map to create a start and end for the route.";
  document.body.appendChild(directions);

  const startLayerGroup = L.layerGroup().addTo(map);
  const endLayerGroup = L.layerGroup().addTo(map);

  const routeLines = L.layerGroup().addTo(map);
  let currentStep = "start";
  let stops = [];

  map.on("click", (e) => {
    const coordinates = [e.latlng.lng, e.latlng.lat];

    if (currentStep === "start") {
      startLayerGroup.clearLayers();
      routeLines.clearLayers();

      L.marker(e.latlng).addTo(startLayerGroup);
      stops.push(coordinates);

      currentStep = "end";
    } else {
      L.marker(e.latlng).addTo(endLayerGroup);
      stops.push(coordinates);

      currentStep = "start";
    }
    if (stops.length > 1) {
      updateRoute();
    }
  });

  function updateRoute() {
    // Create the arcgis-rest-js authentication object to use later.
    const authentication = arcgisRest.ApiKeyManager.fromKey(apiKey);

    // make the API request with options for shortest path
    arcgisRest
      .solveRoute({
        stops: stops,
        endpoint:
          "https://route-api.arcgis.com/arcgis/rest/services/World/Route/NAServer/Route_World/solve",
        authentication,
        outputLines: "esriNAOutputLineTrueShape",
        returnDirections: true,
        returnRoutes: true,
        directionsLengthUnits: "esriNAUnitKilometers",
        findBestSequence: true,
        preserveFirstStop: true,
        preserveLastStop: true,
      })
      .then((response) => {
        routeLines.clearLayers();
        L.geoJSON(response.routes.geoJson).addTo(routeLines);
        const directionsHTML = response.directions[0].features
          .map((f) => f.attributes.text)
          .join("<br/>");
        directions.innerHTML = directionsHTML;
      })
      .catch((error) => {
        console.error(error);
        alert(
          "There was a problem using the route service. See the console for details.",
        );
      });
  }

  function searchClassroom() {
    var classroom = document.getElementById("classroomSearch").value;
    var classroomInfo = getClassroomInfo(classroom);
    if (classroomInfo) {
      document.getElementById("buildingName").textContent =
        classroomInfo.building;
      document.getElementById("floor").textContent = classroomInfo.floor;
      document.getElementById("roomNumber").textContent = classroomInfo.room;
      document.getElementById("capacity").textContent = classroomInfo.capacity;
      document.getElementById("classroomInfo").style.display = "block";

      // If the searched classroom is TS9, center the map on its location
      if (
        classroom === "TS9" ||
        classroom === "FF1" ||
        classroom === "TS8" ||
        classroom === "FF2"
      ) {
        map.setView([28.630566, 77.372154], 18); // Set the map view to TS9's coordinates
        L.marker([28.630566, 77.372154]).addTo(map); // Add a marker at TS9's location
      } else if (classroom === "Admin Office" || classroom === "Registrar") {
        map.setView([28.630876951846005, 77.37096703901497], 18); // Set the map view to Admin Office or Registrar's coordinates
        L.marker([28.630876951846005, 77.37096703901497]).addTo(map); // Add a marker at Admin Office or Registrar's location
      } else {
        map.setView([28.62933171975423, 77.37149164531024], 18); // Set the map view to default coordinates
        L.marker([28.62933171975423, 77.37149164531024]).addTo(map); // Add a marker at default location
      }
    } else {
      alert("Classroom not found!");
    }
  }

  function getClassroomInfo(classroom) {
    // Sample classroom data (replace this with actual data)
    const classrooms = {
      FF1: {
        building: "ABB1",
        floor: "First Floor",
        room: "FF1",
        capacity: 30,
      },
      FF2: {
        building: "ABB1",
        floor: "First Floor",
        room: "FF2",
        capacity: 25,
      },
      TS9: {
        building: "ABB2",
        floor: "First Floor",
        room: "TS9",
        capacity: 35,
      },
      "Admin Office": {
        building: "ABB2",
        floor: "First Floor",
        room: "Admin Office",
        capacity: 40,
      },
      Registrar: {
        building: "ABB2",
        floor: "First Floor",
        room: "Registrar",
        capacity: 35,
      },
      TS18: {
        building: "JBS",
        floor: "First Floor",
        room: "TS18",
        capacity: 50,
      },
    };

    return classrooms[classroom];
  }

  function clearPaths() {
    startLayerGroup.clearLayers();
    endLayerGroup.clearLayers();
    routeLines.clearLayers();
    directions.innerHTML =
      "Click on the map to create a start and end for the route.";
    stops = [];
    currentStep = "start";
  }
// Add a marker for the user's location
let userMarker;

// Function to handle location updates
function onLocationFound(e) {
  if (!userMarker) {
    userMarker = L.marker(e.latlng).addTo(map);
  } else {
    userMarker.setLatLng(e.latlng);
  }
}

// Function to handle location errors
function onLocationError(e) {
  alert(e.message);
}

// Start locating the user
map.locate({ setView: true, maxZoom: 16 });

// Listen for location updates
map.on("locationfound", onLocationFound);

// Listen for location errors
map.on("locationerror", onLocationError);

// Function to add a marker for the user's location
function addUserLocationMarker(latlng) {
    L.marker(latlng).addTo(map).bindPopup("Your Location").openPopup();
}

// Function to calculate and display path from user's location to the added marker
function calculateAndDisplayPath(userLocation, markerLocation) {
    const userLatLng = [userLocation.latitude, userLocation.longitude];
    const markerLatLng = [markerLocation.latitude, markerLocation.longitude];

    // Clear any existing route lines
    routeLines.clearLayers();

    // Add start and end markers for the route
    L.marker(userLatLng).addTo(routeLines);
    L.marker(markerLatLng).addTo(routeLines);

    // Calculate route using ArcGIS REST API
    arcgisRest
        .solveRoute({
            stops: [userLatLng, markerLatLng],
            endpoint: "https://route-api.arcgis.com/arcgis/rest/services/World/Route/NAServer/Route_World/solve",
            authentication: arcgisRest.ApiKeyManager.fromKey(apiKey),
            outputLines: "esriNAOutputLineTrueShape",
            returnDirections: true,
            returnRoutes: true,
            directionsLengthUnits: "esriNAUnitKilometers",
            findBestSequence: true,
            preserveFirstStop: true,
            preserveLastStop: true,
        })
        .then((response) => {
            // Display the route on the map
            L.geoJSON(response.routes.geoJson).addTo(routeLines);
            const directionsHTML = response.directions[0].features.map((f) => f.attributes.text).join("<br/>");
            directions.innerHTML = directionsHTML;
        })
        .catch((error) => {
            console.error(error);
            alert("There was a problem calculating the route. See the console for details.");
        });
}

// Modify the code inside the success callback of the geolocation API
function onLocationFound(e) {
    const userLocation = e.latlng;
    addUserLocationMarker(userLocation);

    // Assuming markerLocation contains the coordinates of the added marker
    const markerLocation = { latitude: 28.63, longitude: 77.37 }; // Example marker location
    calculateAndDisplayPath(e.latlng, markerLocation);
}
