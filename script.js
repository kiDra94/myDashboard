const BZN = [
    "AT", "BE", "CH", "CZ", "DE-LU", "DE-AT-LU",
    "DK1", "DK2", "FR", "HU", "IT-North", "NL",
    "NO2", "PL", "SE4", "SI"
  ];

function printHeader() {
    let html = "<thead>";
    html += "<tr>";
    html += "<th scope='col'>Zeit</th>";
    html += "<th scope='col'>Preis</th>";
    html += "<th scope='col'>Einheit</th>";
    html += "</tr>";
    html += "</thead >";
    return html;
}
function printRow(priceObj) {
    let html = "<tr>";
    html += "<td>" +
        new Date(priceObj.start_timestamp).toLocaleTimeString()
        + "</td>";
    html += "<td>" + priceObj.marketprice + "</td>";
    html += "<td>" + priceObj.unit + "</td>";
    html += "</tr >";
    return html;
}
function setContent(id) {
    let contents = document.querySelectorAll(".content");
    let links = document.querySelectorAll(".nav-link");

    for (let i = 0; i < contents.length; i++) {
        let ele = contents[i];
        ele.classList.add("d-none");
    };
    $("#" + id + "-content").removeClass("d-none");


    if (id == "fetch") {
        let url = "https://api.energy-charts.info/price?";
        url += "start=" + $("#from").val(); //$("#[name]") -> id
        url += "&end=" + $("#to").val();
        $.get(url).then((resp) => {

            let prices = resp.data;
            console.log(myData);
            myData["series"] = []; // erzeugt einen neue property
            console.log(myData);
            let chartline = {};
            chartline["name"] = "EPEX-Spot-Preice"; // erzeugt eine NEUSES property name in chartline
            let dataPoints = [];
            chartline["data"] = dataPoints;
            chartline.fillOpacity = 0.1;

            prices.forEach((price) => {
                // p[0] = price.start_timestamp; // [x-Wert] Zeitachse
                // p[1] = price.marketprice; // [y-Wert] Preis
                dataPoints.push([price.start_timestamp, price.marketprice]);
            }
            );
            myData.series.push(chartline);
            Highcharts.chart("mychart", myData);
            writeTable();
        });
    }
    if (id = "map"){getEuropMap()};

}

function writeTable() {
    let url = "https://api.awattar.at/v1/marketdata";
    $.get(url).then((resp) => {

        let prices = resp.data;
        console.log(prices);
        let html = printHeader();
        html += "<tbody>";
        prices.forEach(price => {
            html += printRow(price);

        });
        html += "</tbody>";
        $("#mytable").append(html);

    });
    console.log("Achtung: dieser Code steht ach dem $.get wird aber vor .then ausgefuert")
}
$(document).ready(() => { // document (dom) ready!
    $("#fetch-link").click(() => { setContent('fetch') });//registering
    $("#map-link").click(() => { setContent('map') });
    $("#redraw").click(() => {
        setContent("fetch");
    }
    )

});

let myData = {
    chart: {
        type: 'area',
        zooming: {
            type: "x"
        }
    },
    title: {
        text: 'Strompreise von EPEX-Spot'
    },
    subtitle: {
        text: 'we are now better'
    },
    xAxis: {
        type: 'datetime' // In ms [epochalzeot]
    },
    yAxis: {
        title: {
            text: 'Preis (€/MWh)'
        }
    },
    navigator: {
        enabled: true, // Enable the navigator
        series: {
            type: 'line', // Customize the series type
            color: '#FF0000' // Customize the color
        }
    }
}

// Function to fetch and display European map
const getEuropMap = async () => {
    try {
        const topology = await fetch(
            'https://code.highcharts.com/mapdata/custom/europe.topo.json'
        ).then(response => response.json());

        // Prepare demo data
        const data = [
            ['dk', -1], ['fo', 0], ['hr', 0], ['nl', 0], ['ee', 0], ['bg', 0],
            ['es', -0.5], ['it', 0.5], ['sm', 0], ['va', 0], ['tr', 0], ['mt', 0],
            ['fr', 0], ['no', 0], ['de', 0], ['ie', 0], ['ua', 0], ['fi', 0],
            ['se', 0], ['ru', 1], ['gb', 0], ['cy', 0], ['pt', 0], ['gr', 0],
            ['lt', 0], ['si', 0], ['ba', 0], ['mc', 0], ['al', 0], ['cnm', 0],
            ['nc', 0], ['rs', 0], ['ro', 0], ['me', 0], ['li', 0], ['at', 0],
            ['sk', 0], ['hu', 0], ['ad', 0], ['lu', 0], ['ch', 0], ['be', 0],
            ['kv', 0], ['pl', 0], ['mk', 0], ['lv', 0], ['by', 0], ['is', 0],
            ['md', 0], ['cz', 0]
        ];

        // Create the map chart
        Highcharts.mapChart('container-map', {
            chart: {
                map: topology,
                height: 700
            },
            title: {
                text: 'European Energy Map'
            },
            subtitle: {
                text: 'Source map: <a href="https://code.highcharts.com/mapdata/custom/europe.topo.json">Europe</a>'
            },
            mapNavigation: {
                enabled: true,
                buttonOptions: {
                    verticalAlign: 'bottom'
                }
            },
            colorAxis: {
                min: -1,
                max: 1,
                stops: [
                    [0, '#ff6666'],
                    [0.5, '#cccccc'],
                    [1, '#66ff66']
                ]
            },
            series: [{
                data: data,
                name: 'Energy Price Index',
                states: {
                    hover: {
                        color: '#BADA55'
                    }
                },
                dataLabels: {
                    enabled: true,
                    format: '{point.name}'
                }
            }]
        });
    } catch (error) {
        console.error('Error loading map:', error);
        document.getElementById('container-map').innerHTML = 
            '<div class="alert alert-danger">Error loading map data. Please try again later.</div>';
    }
};