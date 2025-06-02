window.addEventListener('DOMContentLoaded', () => {
    const priceEndPoints = [
        "AT", "BE", "CH", "CZ", "DE-LU", "DE-AT-LU",
        "DK1", "DK2", "FR", "HU", "IT-North", "NL",
        "NO2", "PL", "SE4", "SI"
    ];
    fillOption('country-price', priceEndPoints);

    const euroMapEndPoints = Object.values(validCbetCountries);
    fillOption('country-euro-map', euroMapEndPoints);

    const productionTypEndPoints = [
        "al", "am", "at", "ba", "be", "bg", "by", "ch", "cz", "de", "dk", "ee", "es", "fi", "fr",
        "gb", "ge", "gr", "hr", "hu", "ie", "it", "lt", "lu", "lv", "md", "me", "mk", "nl", "no",
        "pl", "pt", "ro", "rs", "ru", "se", "si", "sk", "tr", "ua", "xk", "eu27", "all"
    ];
    fillOption("country-production-by-type", productionTypEndPoints);
});

const fillOption = (id, arr) => {
    const select = document.getElementById(id);
    arr.forEach(obj => {
        const option = document.createElement('option');
        option.value = obj.toUpperCase();
        option.textContent = obj.toUpperCase();
        select.appendChild(option);
    });
    select.value = "AT";
}
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
    removeDNone(id);
    if (id === "price") {
        getPrice(id);
    }
    if (id === "euro-map") {
        drawEuropMap(id);
    };
    if (id === "production-by-type") {
        getPieChart(id);
    };

}
const removeDNone = (id) => {
    let contents = document.querySelectorAll(".content");
    for (let i = 0; i < contents.length; i++) {
        let ele = contents[i];
        ele.classList.add("d-none");
    };
    $("#" + id + "-content").removeClass("d-none");
}
const buildUrl = (url, id) => {
    const country = $(`#country-${id}`).val();
    const start = $(`#from-${id}`).val();
    const end = $(`#to-${id}`).val();
    if (id === "price") {
        url += "bzn=" + country;
    }
    else {
        url += "country=" + country;
    }
    url += "&start=" + start;
    url += "&end=" + end;
    return url
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
const getPrice = async (id) => {
    let apiEndpoint = "http://localhost:3000/api/price?";
    const url = buildUrl(apiEndpoint, id);
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

        Highcharts.chart("mychart", myData);
        writeTable(resp);
    });
}
function writeTable(resp) {
    if ($.fn.DataTable.isDataTable('#mytable')) {
        $('#mytable').DataTable().clear().destroy();
    }
    $("#mytable").empty();

    let html = printHeader();
    html += "<tbody>";
    for (let i = 0; i < resp.price.length; i++) {
        html += printRow(resp.unix_seconds[i], resp.price[i], resp.unit);
    }
    html += "</tbody>";
    $("#mytable").html(html);

    $('#mytable').DataTable({
        pageLength: 15,
        lengthChange: false,
        dom: '<"top"f>rt<"bottom"lip><"clear">'
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
    $("#price-link").click(() => { setContent('price') });
    $("#euro-map-link").click(() => { setContent('euro-map') });
    $("#production-by-type-link").click(() => { setContent('production-by-type') });
    $("#redraw-price").click(() => { setContent('price'); });
    $("#redraw-euro-map").click(() => { setContent('euro-map'); })
    $("#redraw-production-by-type").click(() => { setContent('production-by-type'); })
});


let myEuroMapData = {
    chart: {
        map: null,
        height: 700
    },
    title: {
        text: 'European Energy Map'
    },
    subtitle: {
        text:
            'Positive values indicate an import of electricity, whereas negative values show electricity exports.\n' +
            'Source map: <a href="https://code.highcharts.com/mapdata/custom/europe.topo.json">Europe</a>'
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
    series: [
        {
            // We'll populate `data` in getCbetData()
            data: [],
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
            }
        }
    ]
};
const getCbetData = async (id) => {
    let apiEndpoint = "http://localhost:3000/api/cbet?";
    const url = buildUrl(apiEndpoint, id);
    let rawCountry = $(`#country-${id}`).val() || "at";
    const country = rawCountry.toLowerCase();
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
        });

        countriesTotalSum.forEach(obj => {
            obj[1] /= totalSum;
        });
        myEuroMapData.chart.map = topology;
        myEuroMapData.series[0].data = countriesTotalSum;
        return myEuroMapData;
    });
}
const drawEuropMap = async (id) => {
    try {
        let data = {};
        data = await getCbetData(id);
        console.log(data);
        Highcharts.mapChart('container-map', data);
    } catch (error) {
        console.error('Error loading map:', error);
        document.getElementById('container-map').innerHTML =
            '<div class="alert alert-danger">Error loading map data. Please try again later.</div>';
    }
};

const includedProductionTypes = [
    "Hydro Run-of-River", "Biomass", "Fossil gas", "Geothermal",
    "Hydro water reservoir", "Hydro pumped storage", "Others", "Waste",
    "Wind onshore", "Solar"
];
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
const getPieChart = async (id) => {
    let apiEndpoint = "http://localhost:3000/api/power?";
    const url = buildUrl(apiEndpoint, id);
    $.get(url).then((resp) => {
        const publicPower = resp;
        let totalSum = 0;
        let filteredProdTyp = publicPower.production_types.filter(type =>
            includedProductionTypes.includes(type.name)
        );
        filteredProdTyp.forEach(type => { totalSum += sum(type.data) });
        console.log(filteredProdTyp);
        myPieChartData.series = [{
            name: 'Production Type',
            colorByPoint: true,
            innerSize: '60%',
            data: filteredProdTyp.filter(type => {
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