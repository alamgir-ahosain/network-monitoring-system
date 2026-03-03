package mbstucse.alamgir.backend.dto;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public class MetricsDTO {

    private Long serverId;
    private String serverName;
    private String host;
    private int port;
    private double cpuUsage;
    private double memoryUsage;
    private double diskUsage;
    private Map<String, Long> network; 
    private int processCount;
    private String uptime;
    private List<Double> loadAverage;
    private String osInfo;
    private int loggedInUsers;
    private String swapInfo;
    private List<Map<String, Object>> topProcesses;
    private LocalDateTime timestamp;

    public Long getServerId() {  return serverId;    }
    public void setServerId(Long serverId) {     this.serverId = serverId; }
    public String getServerName() {    return serverName;}
    public void setServerName(String serverName) {    this.serverName = serverName;}
    public String getHost() {     return host;  }
    public void setHost(String host) { this.host = host;  }
    public int getPort() {   return port;  }
    public void setPort(int port) {    this.port = port; }
    public double getCpuUsage() {   return cpuUsage;   }
    public void setCpuUsage(double cpuUsage) {    this.cpuUsage = cpuUsage;  }
    public double getMemoryUsage() {     return memoryUsage; }
    public void setMemoryUsage(double memoryUsage) {  this.memoryUsage = memoryUsage; }
    public double getDiskUsage() {    return diskUsage;}
    public void setDiskUsage(double diskUsage) {  this.diskUsage = diskUsage; }
    public Map<String, Long> getNetwork() {  return network;  }
    public void setNetwork(Map<String, Long> network) {      this.network = network;  }
    public int getProcessCount() {   return processCount; }
    public void setProcessCount(int processCount) {this.processCount = processCount;  }
    public String getUptime() {    return uptime;    }
    public void setUptime(String uptime) {   this.uptime = uptime;  }
    public List<Double> getLoadAverage() {     return loadAverage;  }
    public void setLoadAverage(List<Double> loadAverage) { this.loadAverage = loadAverage;}
    public String getOsInfo() {   return osInfo;}
    public void setOsInfo(String osInfo) {   this.osInfo = osInfo; }
    public int getLoggedInUsers() {  return loggedInUsers;}
    public void setLoggedInUsers(int loggedInUsers) {    this.loggedInUsers = loggedInUsers;   }
    public String getSwapInfo() { return swapInfo;  }
    public void setSwapInfo(String swapInfo) {    this.swapInfo = swapInfo; }
    public List<Map<String, Object>> getTopProcesses() {  return topProcesses; }
    public void setTopProcesses(List<Map<String, Object>> topProcesses) {    this.topProcesses = topProcesses; }
    public LocalDateTime getTimestamp() {        return timestamp;    }
    public void setTimestamp(LocalDateTime timestamp) {     this.timestamp = timestamp;  }
}