require([
    "esri/config",
    "esri/Map",
    "esri/views/MapView",
    "esri/layers/FeatureLayer"
], function (esriConfig, Map, MapView, FeatureLayer) {
    // set API key
    esriConfig.apiKey = "AAPKeb82c116636342a289d5172515b76b9d6Wz_Fi24SspiTAlNJq7OihpKOKxxxsU7_0FN8BM8OfEeAzRnknPrfq9hVRTSuyNQ"

    // Data from BGMAPP
    const url = "https://services9.arcgis.com/q5uyFfTZo3LFL04P/arcgis/rest/services/survey123_0954ef4c3eb74d9989a91330c7740a9f/FeatureServer/0";

    // Initialize FeatureLayer
    const featureLayer = new FeatureLayer({
        title: "Black-owned Businesses",
        url: url,
        copyright: "BGMAPP"
    })

    const map = new Map({
        basemap: "arcgis-light-gray",
        // basemap: "dark-gray" // no api-key needed
        layers: [featureLayer]
    });
    const view = new MapView({
        container: "viewDiv",
        map: map,
        extent: {
            // Bay Area extent:
            // xmin: 12.6,
            // ymin: 37.7,
            // xmax: 13.8,
            // ymax: 38.3,
            xmin: -122.38,
            ymin: 37.18,
            xmax: -122.15,
            ymax: 38.32,
            spatialReference: 4326
        },
        // center: [-122, 38],
        zoom: 10
        // Sicily: 11.451960,35.958486,16.978083,38.683835
        // Palermo: 12.594538,37.686469,13.786554,38.271004
        // East Bay: -122.381408,37.772258,-122.149322,37.919742
    });
});