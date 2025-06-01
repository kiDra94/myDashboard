# My Dashboard Application

This repository contains the code for "My Dashboard Application," a web application designed to provide a centralized view of various metrics or information.

## Prerequisites

To run this application, you will need:

* **Docker**: For the recommended containerized setup.

* **Node.js and npm**: If you choose to run the application directly without Docker.

## Using the Public Docker Image (Recommended)

You can skip building the image yourself and directly pull the pre-built public Docker image from the GitHub Container Registry.

### 1. Pull the Docker Image

Run this command to pull the latest public image:

```bash
docker pull ghcr.io/kidra94/dashboard-container-ghcr:latest

2. Run the Docker Container

Start a container from the pulled image, mapping port 3000:

docker run -p 3000:3000 --name dashboard_app_instance ghcr.io/kidra94/dashboard-container-ghcr:latest

    -p 3000:3000: Maps port 3000 on your host to port 3000 in the container.

    --name dashboard_app_instance: Assigns a name to your container instance (optional).

    ghcr.io/kidra94/dashboard-container-ghcr:latest: The public image tag.

3. Access the Application

Open your web browser and navigate to:

http://localhost:3000/index.html
Starting with Docker (Build Locally)

If you prefer to build the image yourself:
1. Build the Docker Image

Navigate to the root directory of this project (where the Dockerfile is located) and run:

docker build -f Dockerfile -t dashboard_container .

2. Run the Docker Container

docker run -p 3000:3000 --name dashboard_app_instance dashboard_container

3. Access the Application

Open your web browser at:

http://localhost:3000/index.html
Starting Without Docker

If you prefer not to use Docker, you can run the application directly on your machine, provided you have Node.js and npm installed.
1. Install Dependencies

npm install

2. Run the Application

    Standard Start:

npm run start

    Start and Open in Browser:

npm run start open

Open your browser at:

http://localhost:3000/index.html
Stopping the Application

    Docker Container: To stop the running Docker container, press Ctrl+C in the terminal where it's running. To remove it, run:

docker rm dashboard_app_instance

    Without Docker: Press Ctrl+C in the terminal where the app is running.

If you have any questions or issues running the app, feel free to open an issue here.


---

Would you like me to help you add badges or any other tips?