package mbstucse.alamgir.backend.service;

import com.jcraft.jsch.*;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.LinkedHashMap;
import java.util.Map;

@Service
public class SshService {

    public Map<String, String> executeMultipleCommands(String host, int port, String user, String password, String[] commands) throws Exception {
        
        Map<String, String> results = new LinkedHashMap<>();

        JSch jsch = new JSch();
        Session session = jsch.getSession(user, host, port);
        session.setPassword(password);
        session.setConfig("StrictHostKeyChecking", "no");
        session.connect(5000); //5 sec timeout

        for (String command : commands) {
            ChannelExec channel = (ChannelExec) session.openChannel("exec");
            channel.setCommand(command);

            InputStream in = channel.getInputStream();
            channel.connect();

            BufferedReader reader = new BufferedReader(new InputStreamReader(in));
            StringBuilder output = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) {
                output.append(line).append("\n");
            }

            results.put(command, output.toString());
            channel.disconnect();
        }

        session.disconnect();
        return results;
    }
}