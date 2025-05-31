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
    bznSelect.value = "AT"; // Set default

    const mapSelect = document.getElementById('country-euro-map');
    Object.values(validCbetCountries).forEach(country => {
        const option = document.createElement('option');
        option.value = country.toUpperCase();
        option.textContent = country.toUpperCase();
        mapSelect.appendChild(option);
    });
    mapSelect.value = "AT"; // Set default


    const pieChartsSelect = document.getElementById('country-public-power');
    const apiCountryies = [
        "al", "am", "at", "ba", "be", "bg", "by", "ch", "cz", "de", "dk", "ee", "es", "fi", "fr",
        "gb", "ge", "gr", "hr", "hu", "ie", "it", "lt", "lu", "lv", "md", "me", "mk", "nl", "no",
        "pl", "pt", "ro", "rs", "ru", "se", "si", "sk", "tr", "ua", "xk", "eu27", "all"
    ];
    apiCountryies.forEach(country => {
        const option = document.createElement('option');
        option.value = country.toUpperCase();
        option.textContent = country.toUpperCase();
        pieChartsSelect.appendChild(option);
    });
    pieChartsSelect.value = "AT";
});

const sum = arr => arr.reduce((a, b) => a + b, 0);
const validCbetCountries = {
    "Denmark": "dk", "Faroe Islands": "fo", "Croatia": "hr", "Netherlands": "nl", "Estonia": "ee", "Bulgaria": "bg",
    "Spain": "es", "Italy": "it", "San Marino": "sm", "Vatican": "va", "Turkey": "tr", "Malta": "mt",
    "France": "fr", "Norway": "no", "Germany": "de", "Ireland": "ie", "Ukraine": "ua", "Finland": "fi",
    "Sweden": "se", "Russia": "ru", "United Kingdom": "gb", "Cyprus": "cy", "Portugal": "pt", "Greece": "gr",
    "Lithuania": "lt", "Slovenia": "si", "Bosnia-Herzegovina": "ba", "Monaco": "mc", "Albania": "al",
    "Serbia": "rs", "Romania": "ro", "Montenegro": "me", "Liechtenstein": "li", "Austria": "at",
    "Slovakia": "sk", "Hungary": "hu", "Andorra": "ad", "Luxembourg": "lu", "Switzerland": "ch", "Belgium": "be",
    "Kosovo": "kv", "Poland": "pl", "Macedonia": "mk", "Latvia": "lv", "Belarus": "by", "Iceland": "is",
    "Moldova": "md", "Czech Republic": "cz"
};

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
        drawEuropMap();
    };
    if (id === "production-by-type") {
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
    html += "<th scope='col'>Date and Time</th>";
    html += "<th scope='col'>Value</th>";
    html += "<th scope='col'>Unit</th>";
    html += "</tr>";
    html += "</thead >";
    return html;
}
function printRow(timeUnix, price, unit) {
    let date = new Date(timeUnix * 1000);
    let timeStr = date.toLocaleString();

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
    $("#production-by-type-link").click(() => { setContent('production-by-type') });
    $("#redraw").click(() => { setContent('fetch'); });
    $("#redraw-euro-map").click(() => { setContent('map'); })
    $("#redraw-production-by-type").click(() => { setContent('production-by-type'); })
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
        let data = {};
        data = await getCbetData();
        console.log(data);
        Highcharts.mapChart('container-map', data);
    } catch (error) {
        console.error('Error loading map:', error);
        document.getElementById('container-map').innerHTML =
            '<div class="alert alert-danger">Error loading map data. Please try again later.</div>';
    }
};

const getCbetData = async () => {
    const country = $("#country-euro-map").val() || "at";
    const start = $("#from-euro-map").val();
    const end = $("#to-euro-map").val();

    let url = "http://localhost:3000/api/cbet?";
    url += "country=" + country.toLowerCase();
    url += "&start=" + start;
    url += "&end=" + end;

    const topology = await fetch(
        'https://code.highcharts.com/mapdata/custom/europe.topo.json'
    ).then(response => response.json());
    return $.get(url).then((resp) => {
        const cbetData = resp.countries;
        let countriesTotalSum = [];
        let totalSum = 0;
        cbetData.forEach(obj => {
            const cntrySum = sum(obj.data)
            totalSum += Math.abs(cntrySum);
            if (obj.name === "sum") {
                countriesTotalSum.push([country.toLowerCase(), cntrySum]);
            } else {
                countriesTotalSum.push([validCbetCountries[obj.name], cntrySum]);
            }
        })
        let finalData = {};
        console.log(countriesTotalSum);
        countriesTotalSum.forEach(obj => {
            obj[1] /= totalSum;
        })
        console.log(countriesTotalSum);
        finalData = {
            chart: {
                map: topology,
                height: 700
            },
            title: {
                text: 'European Energy Map'
            },
            subtitle: {
                text: 'Positive values indicate an import of electricity, whereas negative values show electricity exports.\nSource map: <a href="https://code.highcharts.com/mapdata/custom/europe.topo.json">Europe</a>'
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
                    [0, '#66ff66'],
                    [0.5, '#cccccc'],
                    [1, '#ff6666']
                ]
            },
            series: [{
                data: countriesTotalSum,
                name: 'Energy Price Index',
                states: {
                    hover: {
                        color: '#BADA55'
                    }
                },
                dataLabels: {
                    enabled: true,
                    format: '{point.name}'
                },
                tooltip: {
                    pointFormat: '{point.name}: <b>{point.value:.2f}%</b>'
                },
            }]
        }
        return finalData;
    });
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