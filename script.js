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

    const pieChartsSelect = document.getElementById('country-public-power');
    const apiCountry = [
        "al", "am", "at", "ba", "be", "bg", "by", "ch", "cz", "de", "dk", "ee", "es", "fi", "fr",
        "gb", "ge", "gr", "hr", "hu", "ie", "it", "lt", "lu", "lv", "md", "me", "mk", "nl", "no",
        "pl", "pt", "ro", "rs", "ru", "se", "si", "sk", "tr", "ua", "xk", "eu27", "all"
    ];

    apiCountry.forEach(country => {
        const option = document.createElement('option');
        option.value = country.toUpperCase();
        option.textContent = country.toUpperCase();
        pieChartsSelect.appendChild(option);
    });

    pieChartsSelect.value = 'AT';

});
// TODO: implement logic for euroMap in the const EuroMap
const sum = arr => arr.reduce((a, b) => a + b, 0);
const validCbetCountry = [
    'dk', 'fo', 'hr', 'nl', 'ee', 'bg', 'es', 'it', 'sm', 'va', 'tr', 'mt',
    'fr', 'no', 'de', 'ie', 'ua', 'fi', 'se', 'ru', 'gb', 'cy', 'pt', 'gr',
    'lt', 'si', 'ba', 'mc', 'al', 'cnm', 'nc', 'rs', 'ro', 'me', 'li', 'at',
    'sk', 'hu', 'ad', 'lu', 'ch', 'be', 'kv', 'pl', 'mk', 'lv', 'by', 'is',
    'md', 'cz'
];
function setContent(id) {
    let contents = document.querySelectorAll(".content");

    for (let i = 0; i < contents.length; i++) {
        let ele = contents[i];
        ele.classList.add("d-none");
    };
    $("#" + id + "-content").removeClass("d-none");

    if (id === "fetch") {
        getPrice();
    }
    if (id === "map") {
        drawEuropMap()
    };
    if (id === "other") {
        getPieChart();
    };

}

const getPrice = async () => {
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
    $("#redraw").click(() => { setContent('fetch'); });
    $("#redraw-other").click(() => { setContent('other'); })
});

const getPieChart = async () => {
    const country = $("#country-public-power").val();
    const start = $("#from-public-power").val();
    const end = $("#to-public-power").val();

    let url = "http://localhost:3000/api/power?";
    url += "country=" + country.toLowerCase();
    url += "&start=" + start;
    url += "&end=" + end;
    myPieChartData.series.length = 0;
    $.get(url).then((resp) => {
        const publicPower = resp;
        let totalSum = 0;
        publicPower.production_types.forEach(type => { totalSum += sum(type.data) });

        myPieChartData.series = [{
            name: 'Production Type',
            colorByPoint: true,
            innerSize: '60%',
            data: publicPower.production_types.filter(type => {
                const value = sum(type.data);
                return value > 0 && (value / totalSum * 100) >= 0.5;
            })
                .map(type => ({
                    name: type.name,
                    y: sum(type.data)
                }))
        }];
        myPieChartData.chart.custom = { 'sum': parseInt(totalSum) };
        console.log(myPieChartData);
        myPieChartData.title.text = `Production Mix - ${$("#country-public-power").val()}`;

        Highcharts.chart('container', myPieChartData);
    });

}

const drawEuropMap = async () => {
    try {
        const topology = await fetch(
            'https://code.highcharts.com/mapdata/custom/europe.topo.json'
        ).then(response => response.json());

        
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

const getCbetData = async () => {

}
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
let myPieChartData = {
    chart: {
        type: 'pie',
        custom: {},
        events: {
            render() {
                const chart = this,
                    series = chart.series[0];
                let customLabel = chart.options.chart.custom.label;
                const totalSum = chart.options.chart.custom.sum || 0;

                if (!customLabel) {
                    customLabel = chart.options.chart.custom.label =
                        chart.renderer.label(
                            '<strong>' + totalSum + '<br>MW</br>' + '</strong>'
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
        text: ''
    },
    subtitle: {
        text: 'Source: <a href="https://api.energy-charts.info">Energy charts</a>'
    },
    tooltip: {
        pointFormat: '<b>{point.percentage:.0f}% of total production</b>'
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
    series: []
}