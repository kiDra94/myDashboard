const getEuropMap = (async () => {

    const topology = await fetch(
        'https://code.highcharts.com/mapdata/custom/europe.topo.json'
    ).then(response => response.json());

    // Prepare demo data. The data is joined to map using value of 'hc-key'
    // property by default. See API docs for 'joinBy' for more info on linking
    // data and map.
    const data = [
        ['dk', 10], ['fo', 11], ['hr', 12], ['nl', 13], ['ee', 14], ['bg', 15],
        ['es', 16], ['it', 17], ['sm', 18], ['va', 19], ['tr', 20], ['mt', 21],
        ['fr', 22], ['no', 23], ['de', 24], ['ie', 25], ['ua', 26], ['fi', 27],
        ['se', 28], ['ru', 29], ['gb', 30], ['cy', 31], ['pt', 32], ['gr', 33],
        ['lt', 34], ['si', 35], ['ba', 36], ['mc', 37], ['al', 38], ['cnm', 39],
        ['nc', 40], ['rs', 41], ['ro', 42], ['me', 43], ['li', 44], ['at', 45],
        ['sk', 46], ['hu', 47], ['ad', 48], ['lu', 49], ['ch', 50], ['be', 51],
        ['kv', 52], ['pl', 53], ['mk', 54], ['lv', 55], ['by', 56], ['is', 57],
        ['md', 58], ['cz', 59]
    ];

    // Create the chart
    Highcharts.mapChart('container-map', {
        chart: {
            map: topology
        },

        title: {
            text: 'Highcharts Maps basic demo'
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
            min: 0
        },

        series: [{
            data: data,
            name: 'Random data',
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

})();

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
        let url = "https://api.awattar.at/v1/marketdata?";
        url += "start=" + $("#from").val(); //$("#[name]") -> id
        url += "&end=" + $("#to").val();
        $.get(url).then((resp) => {

            let prices = resp.data;
            console.log(myData);
            myData["series"] = [];
            console.log(myData);
            let chartline = {};
            chartline["name"] = "EPEX-Spot-Preice";
            let dataPoints = [];
            chartline["data"] = dataPoints;
            chartline.fillOpacity = 0.1;

            prices.forEach((price) => {
                dataPoints.push([price.start_timestamp, price.marketprice]);
            }
            );
            myData.series.push(chartline);
            Highcharts.chart("mychart", myData);
            writeTable();
        });
    }
    if (id == "map") {
        $("#container-map").toggleClass("d-none");
    }

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
    // setContent("fetch");
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