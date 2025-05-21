const getEuropMap = async () => {
    const topology = await fetch(
        'https://code.highcharts.com/mapdata/custom/europe.topo.json'
    ).then(response => response.json());

    // Prepare demo data. The data is joined to map using value of 'hc-key'
    // property by default. See API docs for 'joinBy' for more info on linking
    // data and map.
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

    // Create the chart
    Highcharts.mapChart('container-map', {
        chart: {
            map: topology,
            height: 700
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
};

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
            });
            myData.series.push(chartline);
            Highcharts.chart("mychart", myData);
            writeTable();
        });
    }
    
    if (id == "map") {
        getEuropMap();
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
        $("#mytable").html(html); // Changed from append to html to avoid duplication
    });
    console.log("Achtung: dieser Code steht ach dem $.get wird aber vor .then ausgefuert");
}

$(document).ready(() => { // document (dom) ready!
    // setContent("fetch");
    $("#fetch-link").click(() => { setContent('fetch'); });
    $("#map-link").click(() => { setContent('map'); });
    $("#contact-link").click(() => { setContent('contact'); });
    
    $("#redraw").click(() => {
        setContent("fetch");
    });
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
};