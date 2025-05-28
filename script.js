window.addEventListener('DOMContentLoaded', () => {
    const bznSelect = document.getElementById('country');
    const bzn = [
        "AT", "BE", "CH", "CZ", "DE-LU", "DE-AT-LU",
        "DK1", "DK2", "FR", "HU", "IT-North", "NL",
        "NO2", "PL", "SE4", "SI"
    ];

    bzn.forEach(bzn => {
        const option = document.createElement('option');
        option.value = bzn;
        option.textContent = bzn;
        bznSelect.appendChild(option);
    });

    bznSelect.value = 'AT'; // Set default
});

function setContent(id) {
    let contents = document.querySelectorAll(".content");
    let links = document.querySelectorAll(".nav-link");

    for (let i = 0; i < contents.length; i++) {
        let ele = contents[i];
        ele.classList.add("d-none");
    };
    $("#" + id + "-content").removeClass("d-none");


    if (id == "fetch") {
        const country = $("#country").val();
        const start = $("#from").val();
        const end = $("#to").val();

        let url = "http://localhost:3000/api/price?";
        url += "bzn=" + country;
        url += "&start=" + start;
        url += "&end=" + end;

        $.get(url).then((resp) => {
            let prices = {};
            prices = resp;
            myData.series = [];

            let chartline = {
                name: "Day-ahead spot market price ",
                data: [],
                fillOpacity: 0.1
            };

            for (let i = 0; i < prices.unix_seconds.length; i++) {
                let timestamp = prices.unix_seconds[i] * 1000; // Convert to milliseconds
                let marketprice = prices.price[i];
                chartline.data.push([timestamp, marketprice]);
            }

            myData.series.push(chartline);

            // Render chart
            Highcharts.chart("mychart", myData);
            writeTable(country, start, end);
        });
    }
    if (id = "map") { getEuropMap() };
    if (id = "other") { getPieChart() };

}

function writeTable(country, start, end) {
    let url = "http://localhost:3000/api/price?";
    url += "bzn=" + country;
    url += "&start=" + start;
    url += "&end=" + end;

    // Destroy old table if DataTable was initialized
    if ($.fn.DataTable.isDataTable("#mytable")) {
        $('#mytable').DataTable().destroy();
    }

    $("#mytable").empty(); // Clears full table

    $.get(url).then((resp) => {
        let html = printHeader();
        html += "<tbody>";
        for (let i = 0; i < resp.price.length; i++) {
            html += printRow(resp.unix_seconds[i], resp.price[i], resp.unit);
        }
        html += "</tbody>";
        $("#mytable").html(html);

        // Initialize DataTable after table is populated
        $('#mytable').DataTable({
            pageLength: 15,
            lengthChange: false,
            dom: '<"top"f>rt<"bottom"lip><"clear">'
        });
    });
}

function printHeader() {
    let html = "<thead>";
    html += "<tr>";
    html += "<th scope='col'>Time</th>";
    html += "<th scope='col'>Value</th>";
    html += "<th scope='col'>Unit</th>";
    html += "</tr>";
    html += "</thead >";
    return html;
}
function printRow(timeUnix, price, unit) {
    let date = new Date(timeUnix * 1000);
    let timeStr = date.toLocaleTimeString();

    let html = "<tr>";
    html += "<td>" + timeStr + "</td>";
    html += "<td>" + price + "</td>";
    html += "<td>" + unit + "</td>";
    html += "</tr>";
    return html;
}
$(document).ready(() => { // document (dom) ready!
    $("#fetch-link").click(() => { setContent('fetch') });//registering
    $("#map-link").click(() => { setContent('map') });
    $("#other-link").click(() => { setContent('other') });
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
        text: 'Prices'
    },
    subtitle: {
        text: ''
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

const getPieChart= async () => {
    Highcharts.chart('container', {
        chart: {
            type: 'pie',
            custom: {},
            events: {
                render() {
                    const chart = this,
                        series = chart.series[0];
                    let customLabel = chart.options.chart.custom.label;
    
                    if (!customLabel) {
                        customLabel = chart.options.chart.custom.label =
                            chart.renderer.label(
                                'Total<br/>' +
                                '<strong>2 877 820</strong>'
                            )
                                .css({
                                    color: '#000',
                                    textAnchor: 'middle'
                                })
                                .add();
                    }
    
                    const x = series.center[0] + chart.plotLeft,
                        y = series.center[1] + chart.plotTop -
                        (customLabel.attr('height') / 2);
    
                    customLabel.attr({
                        x,
                        y
                    });
                    // Set font size based on chart diameter
                    customLabel.css({
                        fontSize: `${series.center[2] / 12}px`
                    });
                }
            }
        },
        accessibility: {
            point: {
                valueSuffix: '%'
            }
        },
        title: {
            text: '2023 Norway car registrations'
        },
        subtitle: {
            text: 'Source: <a href="https://www.ssb.no/transport-og-reiseliv/faktaside/bil-og-transport">SSB</a>'
        },
        tooltip: {
            pointFormat: '{series.name}: <b>{point.percentage:.0f}%</b>'
        },
        legend: {
            enabled: false
        },
        plotOptions: {
            series: {
                allowPointSelect: true,
                cursor: 'pointer',
                borderRadius: 8,
                dataLabels: [{
                    enabled: true,
                    distance: 20,
                    format: '{point.name}'
                }, {
                    enabled: true,
                    distance: -15,
                    format: '{point.percentage:.0f}%',
                    style: {
                        fontSize: '0.9em'
                    }
                }],
                showInLegend: true
            }
        },
        series: [{
            name: 'Registrations',
            colorByPoint: true,
            innerSize: '75%',
            data: [{
                name: 'EV',
                y: 23.9
            }, {
                name: 'Hybrids',
                y: 12.6
            }, {
                name: 'Diesel',
                y: 37.0
            }, {
                name: 'Petrol',
                y: 26.4
            }]
        }]
    })
}