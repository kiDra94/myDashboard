// Function to fetch and display European map
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

// Function to create table header
function printHeader() {
    let html = "<thead>";
    html += "<tr>";
    html += "<th scope='col'>Zeit</th>";
    html += "<th scope='col'>Preis</th>";
    html += "<th scope='col'>Einheit</th>";
    html += "</tr>";
    html += "</thead>";
    return html;
}

// Function to create table row from price object
function printRow(priceObj) {
    let html = "<tr>";
    html += "<td>" +
        new Date(priceObj.start_timestamp).toLocaleTimeString()
        + "</td>";
    html += "<td>" + priceObj.marketprice + "</td>";
    html += "<td>" + priceObj.unit + "</td>";
    html += "</tr>";
    return html;
}

// Function to handle content switching and data fetching
function setContent(id) {
    // Hide all content sections and show the selected one
    let contents = document.querySelectorAll(".content");
    for (let i = 0; i < contents.length; i++) {
        contents[i].classList.add("d-none");
    }
    $("#" + id + "-content").removeClass("d-none");

    // Handle specific content sections
    if (id === "fetch") {
        fetchAndDisplayData();
    } else if (id === "map") {
        getEuropMap();
    }
}

// Function to fetch data from API and display it
function fetchAndDisplayData() {
    const fromDate = $("#from").val();
    const toDate = $("#to").val();
    
    // Display loading message
    $("#mychart").html("<p class='border p-2 rounded'>Loading data...</p>");
    
    // Base URL - using our local server as a proxy
    let url = '/api/power';
    url += "?country=de";
    url += "&start=" + fromDate;
    url += "&end=" + toDate;
    
    // Fetch data and process it
    $.get(url)
        .then((resp) => {
            if (!resp || !resp.data || resp.data.length === 0) {
                $("#mychart").html("<p class='border p-2 rounded text-danger'>No data available for the selected period</p>");
                return;
            }
            
            // Process data for chart
            console.log("Data received:", resp);
            
            // Prepare chart data
            myData.series = [];
            let chartline = {
                name: "EPEX-Spot-Prices",
                data: [],
                fillOpacity: 0.1
            };
            
            // Convert API data to chart points
            resp.data.forEach((price) => {
                if (price.marketprice !== undefined) {
                    chartline.data.push([price.start_timestamp, price.marketprice]);
                }
            });
            
            // Add the series to chart data
            myData.series.push(chartline);
            
            // Create the chart
            Highcharts.chart("mychart", myData);
            
            // Update the table with the same data
            writeTable();
        })
        .catch((error) => {
            console.error("Error fetching data:", error);
            $("#mychart").html("<p class='border p-2 rounded text-danger'>Error fetching data. Please try again later.</p>");
        });
}

// Function to update the data table
function writeTable() {
    // Fetch market data from our proxy endpoint
    let url = "/api/marketdata";
    $.get(url)
        .then((resp) => {
            if (!resp || !resp.data || resp.data.length === 0) {
                $("#mytable").html("<p>No market data available</p>");
                return;
            }
            
            // Process the data and create HTML
            let prices = resp.data;
            console.log("Market prices:", prices);
            
            let html = printHeader();
            html += "<tbody>";
            prices.forEach(price => {
                html += printRow(price);
            });
            html += "</tbody>";
            
            // Update the table
            $("#mytable").html(html);
        })
        .catch((error) => {
            console.error("Error fetching market data:", error);
            $("#mytable").html("<p class='text-danger'>Error loading market data</p>");
        });
}

// Initialize when document is ready
$(document).ready(() => {
    // Set up click handlers for navigation
    $("#fetch-link").click(() => { setContent('fetch'); });
    $("#map-link").click(() => { setContent('map'); });
    $("#contact-link").click(() => { setContent('contact'); });
    
    // Set up redraw button
    $("#redraw").click(() => {
        fetchAndDisplayData();
    });
    
    // Set initial content to fetch
    setContent("fetch");
});

// Chart configuration
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
        text: 'Energy Price Chart'
    },
    xAxis: {
        type: 'datetime'
    },
    yAxis: {
        title: {
            text: 'Preis (€/MWh)'
        }
    },
    tooltip: {
        formatter: function() {
            return Highcharts.dateFormat('%e. %b %Y, %H:%M', this.x) + '<br/>' +
                   this.series.name + ': <b>' + this.y.toFixed(2) + ' €/MWh</b>';
        }
    },
    navigator: {
        enabled: true,
        series: {
            type: 'line',
            color: '#FF0000'
        }
    }
};