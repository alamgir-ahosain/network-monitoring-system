
package mbstucse.alamgir.backend.controller;

import mbstucse.alamgir.backend.dto.MetricsDTO;
import mbstucse.alamgir.backend.entity.Server;
import mbstucse.alamgir.backend.service.MetricsCollectorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/metrics")
public class MetricsController {

    @Autowired
    private MetricsCollectorService metricsService;

    @PostMapping("/collect")
    public MetricsDTO collectMetrics(@RequestBody Server server) throws Exception {
        return metricsService.collectMetrics(server);
    }
}