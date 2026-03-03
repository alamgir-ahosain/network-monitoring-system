#  ServerPulse - Network Monitoring System


A server monitoring dashboard that connects to remote **Linux servers** via SSH, collects real-time system metrics, and visualizes them in a React application.





# 🚀 Project Demo 

>Demo on YouTube : [CLICK HERE](https://www.youtube.com/watch?v=6xfJqjVFXdc)


---

## Features

- **SSH connection**  to remote Linux servers (host, port, username, password)
- **Real-time system metrics** : CPU, memory, disk, load average, uptime
- **Process monitoring** (top CPU and memory usage)
- **Network I/O statistics** (bytes sent/received)
- **Historical charts** for CPU, memory, and disk usage
-  Automatic **threshold alerts** for high resource usage
---



##  Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| Java 17+ | Core language |
| Spring Boot 3.x | REST API framework |
| JSch  | SSH client for remote connections |
| Maven | Build tool |

### Frontend
| Technology | Purpose |
|---|---|
| React 18 | UI framework |
| Recharts | Charts & graphs |
| Plain CSS-in-JS | Styling |

---



##  Getting Started

### Prerequisites

- Java 17 or higher
- Node.js 18+ and npm
- A remote Linux server accessible via SSH



### Backend Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/alamgir-ahosain/network-monitoring-system.git
   cd network-monitoring-system/backend
   ```

2. **Configure the application** (optional — default port is `8080`)
   ```properties
   # src/main/resources/application.properties
   server.port=8080
   ```

3. **Build and run**
   ```bash
   mvn clean install
   mvn spring-boot:run
   ```

   The backend will start at http://localhost:8080


### Frontend Setup

1. **Navigate to the frontend directory**
   ```bash
   cd ../frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   npm install recharts
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

   The frontend will start at http://localhost:3000

---

##  API Reference

### `POST /api/metrics/collect`

Connects to a remote server via SSH and collects system metrics.

**Request Body**
```json
{
  "name": "prod-server-01",
  "host": "locahost",
  "port": 22,
  "username": "name",
  "password": "your-password"
}
```

**Response Body**
```json
{
  "serverName": "prod-server-01",
  "host": "192.168.1.100",
  "port": 22,
  "cpuUsage": "11.3",
  "memoryUsage": "72.5",
  "diskUsage": "14.0",
  "loadAverage": ["0.45", "0.60", "0.55"],
  "processCount": 142,
  "uptime": "10 days, 4:32",
  "osInfo": "Ubuntu 22.04.3 LTS",
  "loggedInUsers": "2",
  "swapInfo": "512MB / 2GB",
  "timestamp": "2025-03-04T10:30:00",
  "network": {
    "bytesReceived": 104857600,
    "bytesSent": 52428800
  },
  "topProcesses": [
    {
      "pid": "1234",
      "command": "java",
      "cpu": "5.2",
      "memory": "12.4"
    }
  ]
}
```

**Error Response**
```json
{
  "status": 500,
  "message": "SSH connection failed"
}
```



