# My Dashboard Application

This repository contains the code for "My Dashboard Application," a web application designed to provide a centralized view of various metrics or information.

## Prerequisites

To run this application, you will need:

* **Docker**: For the recommended containerized setup.

* **Node.js and npm**: If you choose to run the application directly without Docker.

## Starting with Docker (Recommended)

The easiest and recommended way to get the application up and running is by using Docker. This ensures a consistent environment and simplifies dependency management.

### 1. Build the Docker Image

Navigate to the root directory of this project (where the `Dockerfile` is located) in your terminal and run the following command to build the Docker image:

docker build -f Dockerfile -t dashboard_container .


This command builds an image named `dashboard_container` based on your `Dockerfile`. The `.` at the end indicates that the build context is the current directory.

### 2. Run the Docker Container

Once the image is built, you can run a container from it. This will map port `3000` from your host machine to port `3000` inside the container, allowing you to access the application.

docker run -p 3000:3000 --name dashboard_app_instance dashboard_container


* `-p 3000:3000`: Maps port 3000 on your host to port 3000 in the container.

* `--name dashboard_app_instance`: Assigns a convenient name to your running container instance (you can choose any name).

* `dashboard_container`: This is the name of the Docker image you built in the previous step.

### 3. Access the Application

After running the container, the application should be accessible in your web browser at:

<http://localhost:3000>

## Starting Without Docker

If you prefer not to use Docker, you can run the application directly on your machine, provided you have Node.js and npm installed.

### 1. Install Dependencies

First, navigate to the root directory of the project in your terminal and install the necessary Node.js packages:

npm install


This command reads the `package.json` file and installs all listed dependencies.

### 2. Run the Application

Once the dependencies are installed, you can start the application using one of the following commands:

* **Standard Start**:

npm run start


This will start the application server. You will then need to manually open your web browser and navigate to `http://localhost:3000`.

* **Start and Open in Browser**:

npm run start open


This command will start the application server and automatically attempt to open a new tab in your default web browser at `http://localhost:3000`.

## Stopping the Application

* **Docker Container**: To stop the running Docker container, press `Ctrl+C` in the terminal where it's running. If you want to remove the container instance, you can then run `docker rm dashboard_app_instance`.

* **Without Docker**: To stop the application running via `npm`, press `Ctrl+C` in the terminal where it's running.