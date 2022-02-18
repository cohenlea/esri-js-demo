require([
    "esri/config",
    "esri/Map",
    "esri/views/MapView",
    "esri/layers/FeatureLayer",
    "esri/widgets/Legend",
    "esri/widgets/Expand",
    "esri/widgets/FeatureTable"
], function (esriConfig, Map, MapView, FeatureLayer, Legend, Expand, FeatureTable) {
    // set API key
    esriConfig.apiKey = "AAPKeb82c116636342a289d5172515b76b9d6Wz_Fi24SspiTAlNJq7OihpKOKxxxsU7_0FN8BM8OfEeAzRnknPrfq9hVRTSuyNQ"

    // Data from BGMAPP
    const url = "https://services9.arcgis.com/q5uyFfTZo3LFL04P/arcgis/rest/services/survey123_0954ef4c3eb74d9989a91330c7740a9f/FeatureServer/0";

    // PopupTemplate with some Arcade to check if feature has website field value
    const template = {
        title: "{Name}",
        lastEditInfoEnabled: false,
        content: [{
            type: "fields",
            fieldInfos: [{
                fieldName: "Address",
                label: "Address"
            }, {
                fieldName: "Industry",
                label: "Industry"
            }]
        }, {
            type: "text",
            text: '<b>{expression/has-website}</b> <a href={expression/website-expr}>{expression/website-expr}</a>'
        }],
        expressionInfos: [{
            name: 'website-expr',
            title: "Website:",
            expression: 'IIF(!IsEmpty($feature.Website), $feature.Website, null)'
        }, {
            name: 'has-website',
            expression: 'IIf(!IsEmpty($feature.Website), "Website: ", "No website found for this business")'
        }]
    };

    // Unique Value Renderer to apply on the FeatureLayer
    const uvrRenderer = {
        type: "unique-value", // autocasts as new UniqueValueRenderer()
        field: "Industry",
        defaultSymbol: {
            type: "simple-marker",
            color: "#b2b2b2", // light-gray
            size: "10px",
            outline: null
        },
        uniqueValueInfos: [{
            value: "accessories_&_clothing",
            label: "Accessories & Clothing",  // labels will appear on the Legend widget
            symbol: {
                type: "simple-marker",
                color: "#d9351a",
                size: "10px",
                outline: null
            }
        }, {
            value: "arts_&_culture",
            label: "Arts & Culture",
            symbol: {
                type: "simple-marker",
                color: "#ffc730",
                size: "10px",
                outline: null
            }
        }, {
            value: "auto",
            label: "Auto",
            symbol: {
                type: "simple-marker",
                color: "#144d59",
                size: "10px",
                outline: null
            }
        }, {
            value: "food_+_beverage",
            label: "Food + Beverage",
            symbol: {
                type: "simple-marker",
                color: "#2c6954",
                size: "10px",
                outline: null
            }
        }, {
            value: "hair_body_&_beauty",
            label: "Hair, Body & Beauty",
            symbol: {
                type: "simple-marker",
                color: "#ed9310",
                size: "10px",
                outline: null
            }
        }, {
            value: "health_&_medicine",
            label: "Health & Medicine",
            symbol: {
                type: "simple-marker",
                color: "#8c213f",
                size: "10px",
                outline: null
            }
        }, {
            value: "it_&_tech_hardware+software_",
            label: "IT & Tech",
            symbol: {
                type: "simple-marker",
                color: "#102432",
                size: "10px",
                outline: null
            }
        }, {
            value: "legal",
            label: "Legal",
            symbol: {
                type: "simple-marker",
                color: "#a64f1b",
                size: "10px",
                outline: null
            }
        }, {
            value: "management",
            label: "Management",
            symbol: {
                type: "simple-marker",
                color: "#18382e",
                size: "10px",
                outline: null
            }
        }, {
            value: "non_profit_organization",
            label: "Non Profit Organization",
            symbol: {
                type: "simple-marker",
                color: "#b31515",
                size: "10px",
                outline: null
            }
        }, {
            value: "religious",
            label: "Religious",
            symbol: {
                type: "simple-marker",
                color: "#4a0932",
                size: "10px",
                outline: null
            }
        }]
    };

    // Initialize FeatureLayer
    const featureLayer = new FeatureLayer({
        title: "Black-owned Businesses",
        url: url,
        copyright: "BGMAPP",
        popupTemplate: template,
        renderer: uvrRenderer
    })

    const map = new Map({
        basemap: "arcgis-dark-gray",
        // basemap: "dark-gray" // no api-key needed
        layers: [featureLayer]
    });
    const view = new MapView({
        container: "viewDiv",
        map: map,
        extent: {
            // Bay Area extent:
            xmin: -122.38,
            ymin: 37.18,
            xmax: -122.15,
            ymax: 38.32,
            spatialReference: 4326
        },
        // center: [-122, 38],
        zoom: 10
    });

    // Add Legend widget
    const legend = new Legend({
        view: view,
        container: "legendDiv"
    });

    // Add Expand widget
    const expand = new Expand({
        view: view,
        content: document.getElementById("infoDiv"),
        expanded: true
    });

    view.ui.add(expand, "top-right");


    // Client-side filtering by industry
    view.whenLayerView(featureLayer).then((layerView) => {
        const field = "Industry";

        const filterSelect = document.getElementById("filter");
        // Event fires every time a different option is selected 
        // from the dropdown
        filterSelect.addEventListener('input', (event) => {
            let filterExpression;
            if (event.target.value === '1=1') {
                // show all the features
                filterExpression = event.target.value
            } else if (event.target.value === "other") {
                // Show all other features with all other industries not
                // included in the UniqueValueRenderer.uniqueValueInfos
                filterExpression = generateOtherSQLString(field);
            } else {
                // Filter by the selected industry in the dropdown
                filterExpression = `${field}='${event.target.value}'`;
            }
            // Apply the filter on the client-side layerView.
            // No request will be sent out to the feature service for this.
            layerView.filter = {
                where: filterExpression
            }
        });
    });

    // This function generates a SQL string for all other industries not
    // included in the UniqueValueRenderer.uniqueValueInfos
    function generateOtherSQLString(field) {
        // Loop through each uniqueValueInfos object and create a sql string to 
        // exclude all of these industries
        let sqlString = '';
        uvrRenderer.uniqueValueInfos.forEach(valueInfo => {
            sqlString += `${field} <> '${valueInfo.value}' AND `;
        });
        // cut out the last `AND` string from the final sql string
        // as the loop above adds one at the end
        let lastStrIndex = sqlString.lastIndexOf(`AND`);
        sqlString = sqlString.substr(0, lastStrIndex);

        return sqlString;
    }

    // Adding the FeatureTable widget
    view.when(() => {
        // Create the feature table
        const featureTable = new FeatureTable({
            view: view, // required for feature highlight to work
            layer: featureLayer,
            // Autocast the FieldColumnConfigs
            // These are the fields that will display as columns in the FeatureTable
            fieldConfigs: [{
                name: "Name",
                label: "Business Name",
                direction: "asc"
            },
            {
                name: "Address",
                label: "Address"
            },
            {
                name: "Website",
                label: "Website"
            },
            {
                name: "Industry",
                label: "Industry"
            },
            {
                name: "Phone",
                label: "Phone number"
            }
            ],
            container: document.getElementById("tableDiv")
        });

        // Query for the selected features and zoom to them
        // automatically
        featureTable.on('selection-change', zoomToSelectedFeatures);
    });

    // This function zooms into the selected features based off the records
    // selected or deselected from the FeatureTable
    function zoomToSelectedFeatures(event) {
        // check if a row is selected or deselected
        if (event.added.length > 0) {
            // row was selected
            currentSelectedOIDs.push(event.added[0].objectId);
        } else {
            // row was deselected - remove the objectid from
            // the currentSelectedOIDs
            event.removed.forEach((feature, index) => {
                let deleteIndex = currentSelectedOIDs.indexOf(event.removed[index].objectId);
                currentSelectedOIDs.splice(deleteIndex, 1);
            });
        }

        // only perform the query and zoom to the extent
        // if the currentSelectedOIDs is greater than 0.
        if (currentSelectedOIDs.length > 0) {
            const query = featureLayer.createQuery();
            query.objectIds = currentSelectedOIDs;
            query.returnGeometry = true;

            // Client-side querying is not being used here as currently, the FeatureTable
            // does not have the ability to only restrict records to features within
            // the current view extent. This is currently in development.
            featureLayer.queryFeatures(query).then((results) => {
                view.goTo(results.features);
            });
        }
    }

});