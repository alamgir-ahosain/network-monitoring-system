package mbstucse.alamgir.backend.service;

import mbstucse.alamgir.backend.entity.Server;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ServerService {

    public List<Server> getAllServers() {
        return List.of(new Server("127.0.0.1", 22, "****", "***", "Alamgir Here"));  }
}