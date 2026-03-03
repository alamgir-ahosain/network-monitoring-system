package mbstucse.alamgir.backend.service;

import mbstucse.alamgir.backend.dto.MetricsDTO;
import mbstucse.alamgir.backend.entity.Server;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class MetricsCollectorService {

    @Autowired
    private SshService sshService;

    public MetricsDTO collectMetrics(Server server) throws Exception {

        String[] commands = {
                "top -bn1 | grep 'Cpu(s)'", // CPU usage
                "free -m", // Memory
                "df -h /", // Disk
                "cat /proc/net/dev", // Network
                "ps -e --no-headers | wc -l", // Process count
                "uptime -p", // Uptime
                "uptime", // Load average
                "uname -a", // OS info
                "who | wc -l", // Logged in users
                "swapon --show", // Swap usage
                "ps -eo pid,comm,%cpu,%mem --sort=-%cpu | head -n 6" // Top processes
        };
        Map<String, String> results = sshService.executeMultipleCommands( server.getHost(), server.getPort(), server.getUsername(), server.getPassword(), commands);


        MetricsDTO dto = new MetricsDTO();
        dto.setServerId(server.getId());
        dto.setServerName(server.getName());
        dto.setHost(server.getHost());
        dto.setPort(server.getPort());
        dto.setCpuUsage(parseCpu(results.get(commands[0])));
        dto.setMemoryUsage(parseMemory(results.get(commands[1])));
        dto.setDiskUsage(parseDisk(results.get(commands[2])));
        dto.setNetwork(parseNetwork(results.get(commands[3])));
        dto.setProcessCount(Integer.parseInt(results.get(commands[4]).trim()));
        dto.setUptime(results.get(commands[5]).trim());
        dto.setLoadAverage(parseLoad(results.get(commands[6])));
        dto.setOsInfo(results.get(commands[7]).trim());
        dto.setLoggedInUsers(Integer.parseInt(results.get(commands[8]).trim()));
        dto.setSwapInfo(results.get(commands[9]).trim());
        dto.setTopProcesses(parseTopProcesses(results.get(commands[10])));
        dto.setTimestamp(LocalDateTime.now());

        return dto;
    }




    private double parseCpu(String cpuOutput) {
        for (String part : cpuOutput.split(",")) {
            if (part.contains("id")) {
                double idle = Double.parseDouble(part.replaceAll("[^0-9.]", ""));
                return 100 - idle;
            }
        }
        return 0;
    }

    private double parseMemory(String memOutput) {
        String[] lines = memOutput.split("\n");
        for (String line : lines) {
            if (line.startsWith("Mem:")) {
                String[] tokens = line.split("\\s+");
                double used = Double.parseDouble(tokens[2]);
                double total = Double.parseDouble(tokens[1]);
                return (used / total) * 100;
            }
        }
        return 0;
    }

    private double parseDisk(String diskOutput) {
        String[] lines = diskOutput.split("\n");
        if (lines.length > 1) {
            String[] tokens = lines[1].split("\\s+");
            return Double.parseDouble(tokens[4].replace("%", ""));
        }
        return 0;
    }

    private Map<String, Long> parseNetwork(String netOutput) {
        Map<String, Long> net = new HashMap<>();
        long rx = 0, tx = 0;
        String[] lines = netOutput.split("\n");
        for (String line : lines) {
            if (line.contains(":")) {
                String[] parts = line.split(":");
                String[] data = parts[1].trim().split("\\s+");
                rx += Long.parseLong(data[0]);
                tx += Long.parseLong(data[8]);
            }
        }
        net.put("bytesReceived", rx);
        net.put("bytesSent", tx);
        return net;
    }

    private List<Double> parseLoad(String loadOutput) {
        int idx = loadOutput.indexOf("load average:");
        if (idx != -1) {
            String[] loads = loadOutput.substring(idx + 13).trim().split(",");
            return Arrays.stream(loads).map(String::trim).map(Double::parseDouble).toList();
        }
        return List.of(0.0, 0.0, 0.0);
    }

    private List<Map<String, Object>> parseTopProcesses(String output) {
        List<Map<String, Object>> list = new ArrayList<>();
        String[] lines = output.split("\n");
        for (int i = 1; i < lines.length; i++) { // skip header
            String line = lines[i].trim();
            if (line.isEmpty())  continue;
            String[] tokens = line.split("\\s+");
            if (tokens.length >= 4) {
                Map<String, Object> process = new HashMap<>();
                process.put("pid", tokens[0]);
                process.put("command", tokens[1]);
                process.put("cpu", tokens[2]);
                process.put("memory", tokens[3]);
                list.add(process);
            }
        }
        return list;
    }
}