// Global variable to store fetched power data
let powerData = {};

// Chart configuration object
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
    series: []
};

// Function to fetch power data from API
async function fetchPowerData(fromDate, toDate) {
    try {
        // Build API URL
        let url = '/api/power';
        url += "?country=de";
        url += "&start=" + fromDate;
        url += "&end=" + toDate;
        
        console.log(`Fetching power data from: ${url}`);
        
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data && data.unix_seconds && data.production_types) {
            powerData = data; // Store the complete API response
            console.log("Power data stored:", powerData);
            console.log("Available production types:", data.production_types.map(type => type.name));
            return powerData;
        } else {
            console.warn("No power data received or invalid format");
            powerData = {};
            return {};
        }
        
    } catch (error) {
        console.error("Error fetching power data:", error);
        powerData = {};
        throw error;
    }
}

// Function to create chart from stored power data
function createChartFromPowerData() {
    if (!powerData || !powerData.unix_seconds || !powerData.production_types) {
        $("#mychart").html("<div class='alert alert-warning'>No power data available</div>");
        return;
    }
    
    // Prepare series data for the chart
    const series = [];
    
    powerData.production_types.forEach((productionType, index) => {
        const chartData = [];
        
        // Combine unix_seconds with production data
        powerData.unix_seconds.forEach((timestamp, i) => {
            if (productionType.data[i] !== undefined && productionType.data[i] !== null) {
                chartData.push([timestamp * 1000, productionType.data[i]]); // Convert to milliseconds
            }
        });
        
        // Add series to chart (limit to first 5 production types for readability)
        if (index < 5 && chartData.length > 0) {
            series.push({
                name: productionType.name,
                data: chartData,
                fillOpacity: index === 0 ? 0.3 : 0.1 // Make first series more prominent
            });
        }
    });
    
    // Update chart configuration
    const chartConfig = {
        ...myData,
        series: series,
        title: {
            text: 'Power Production by Type'
        },
        subtitle: {
            text: 'Energy Production Chart'
        },
        yAxis: {
            title: {
                text: 'Power (MW)'
            }
        },
        tooltip: {
            formatter: function() {
                return Highcharts.dateFormat('%e. %b %Y, %H:%M', this.x) + '<br/>' +
                       this.series.name + ': <b>' + this.y.toFixed(2) + ' MW</b>';
            }
        }
    };
    
    // Create the chart
    Highcharts.chart("mychart", chartConfig);
}

// Function to create table from stored power data
function createTableFromPowerData() {
    if (!powerData || !powerData.unix_seconds || !powerData.production_types) {
        $("#mytable").html("<div class='alert alert-warning'>No power data available</div>");
        return;
    }
    
    // Create table header with production types
    let html = "<thead>";
    html += "<tr>";
    html += "<th scope='col'>Zeit</th>";
    
    // Add columns for each production type (limit to first 5 for table readability)
    powerData.production_types.slice(0, 5).forEach(type => {
        html += "<th scope='col'>" + type.name + " (MW)</th>";
    });
    
    html += "</tr>";
    html += "</thead>";
    html += "<tbody>";
    
    // Add data rows (show only every 4th entry to avoid too many rows)
    powerData.unix_seconds.forEach((timestamp, index) => {
        if (index % 4 === 0) { // Show every 4th entry
            html += "<tr>";
            html += "<td>" + new Date(timestamp * 1000).toLocaleString() + "</td>";
            
            powerData.production_types.slice(0, 5).forEach(type => {
                const value = type.data[index];
                html += "<td>" + (value !== null && value !== undefined ? value.toFixed(2) : 'N/A') + "</td>";
            });
            
            html += "</tr>";
        }
    });
    
    html += "</tbody>";
    $("#mytable").html(html);
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

// Function to handle content switching
function setContent(id) {
    // Remove active class from all nav links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    // Add active class to clicked link
    document.getElementById(id + '-link').classList.add('active');
    
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

// Main function to fetch and display power data
async function fetchAndDisplayData() {
    const fromDate = $("#from").val();
    const toDate = $("#to").val();
    
    // Display loading message
    $("#mychart").html("<div class='d-flex justify-content-center'><div class='spinner-border' role='status'><span class='visually-hidden'>Loading...</span></div></div>");
    $("#mytable").html("<div class='d-flex justify-content-center'><div class='spinner-border' role='status'><span class='visually-hidden'>Loading...</span></div></div>");
    
    try {
        // Fetch power data and store it
        await fetchPowerData(fromDate, toDate);
        
        // Create chart and table from stored data
        createChartFromPowerData();
        createTableFromPowerData();
        
        console.log("Data fetch and display completed");
        
    } catch (error) {
        console.error("Error in fetchAndDisplayData:", error);
        $("#mychart").html("<div class='alert alert-danger'>Error loading data. Please try again.</div>");
        $("#mytable").html("<div class='alert alert-danger'>Error loading data. Please try again.</div>");
    }
}

// Utility function to get stored power data
function getPowerData() {
    return powerData;
}

// Initialize when document is ready
$(document).ready(() => {
    console.log("Initializing Energy Dashboard...");
    
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
    
    console.log("Dashboard initialized successfully");
});