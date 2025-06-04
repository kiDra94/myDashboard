# My Dashboard Application

**My Dashboard Application** is a web-based dashboard that visualizes electricity generation data across Europe. The application provides an interactive, centralized view of key energy metrics, including:

- **Energy prices** in various European markets  
- **Electricity flow** between countries
- **Types of electricity generation**, such as wind, solar, nuclear, hydro, and fossil fuels  

## 🔧 Technologies Used

- **[Energy Charts API](https://api.energy-charts.info/):** For retrieving real-time and historical electricity data  
- **[Bootstrap](https://getbootstrap.com/):** For responsive and clean UI styling  
- **[Highcharts](https://www.highcharts.com/):** For rendering interactive and visually engaging graphs  


## Prerequisites

To run this application, you will need:

* **Docker**: For the recommended containerized setup.

* **Node.js and npm**: If you choose to run the application directly without Docker.

## Using the Public Docker Image (Recommended)

You can skip building the image yourself and directly pull the pre-built public Docker image from the GitHub Container Registry.

### 1. Pull the Docker Image

Run this command to pull the latest public image:


    docker pull ghcr.io/kidra94/dashboard-container-ghcr:latest

### 2. Run the Docker Container

Start a container from the pulled image, mapping port 3000:

    docker run -p 3000:3000 --name dashboard_app_instance ghcr.io/kidra94/dashboard-container-ghcr:latest

    - p 3000:3000: Maps port 3000 on your host to port 3000 in the container.

    - --name dashboard_app_instance: Assigns a name to your container instance (optional).

    - ghcr.io/kidra94/dashboard-container-ghcr:latest: The public image tag.

### 3. Access the Application

    Open your web browser and navigate to:

    http://localhost:3000/index.html


## Starting with Docker (Build Locally)

If you prefer to build the image yourself:

### 1. Build the Docker Image

Navigate to the root directory of this project (where the Dockerfile is located) and run:

    docker build -f Dockerfile -t dashboard_container .

### 2. Run the Docker Container

    docker run -p 3000:3000 --name dashboard_app_instance dashboard_container

### 3. Access the Application

Open your web browser at:

    http://localhost:3000/index.html

## Starting Without Docker

If you prefer not to use Docker, you can run the application directly on your machine, provided you have Node.js and npm installed.

### 1. Install Dependencies

    npm install

### 2. Run the Application

Standard Start:

    npm run start

Start and Open in Browser:

    npm run start open

### 3. Open your browser at:

    http://localhost:3000/index.html

## Stopping the Application

### Docker Container: 

To stop the running Docker container, press Ctrl+C in the terminal where it's running. 

To remove it, run:

    docker rm dashboard_app_instance

### Without Docker:

Press Ctrl+C in the terminal where the app is running.

---

### If you have any questions or issues running the app, feel free to open an issue here.
