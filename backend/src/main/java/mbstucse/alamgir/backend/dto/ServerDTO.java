package mbstucse.alamgir.backend.dto;

public class ServerDTO {
    private Long id;
    private String host;
    private int port;
    private String username;

    public Long getId() {  return id;  }
    public void setId(Long id) {     this.id = id; }
    public String getHost() {      return host;   }
    public void setHost(String host) {     this.host = host;  }
    public int getPort() {   return port;  }
    public void setPort(int port) {   this.port = port; }
    public String getUsername() {  return username; }
    public void setUsername(String username) {   this.username = username;  }

}