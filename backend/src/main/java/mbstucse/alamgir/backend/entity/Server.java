package mbstucse.alamgir.backend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "servers")
public class Server {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String host;
    private int port;
    private String username;
    private String password;
    private String name;

    public Server() {}
    public Server(String host, int port, String username, String password, String name) {
        this.host = host;
        this.port = port;
        this.username = username;
        this.password = password;
        this.name = name;
    }

    public Long getId() { return id;}
    public void setId(Long id) {   this.id = id;   }
    public String getHost() {    return host;}
    public void setHost(String host) { this.host = host;   }
    public int getPort() {  return port;  }
    public void setPort(int port) { this.port = port; }
    public String getUsername() {   return username; }
    public void setUsername(String username) { this.username = username;   }
    public String getPassword() { return password; }
    public void setPassword(String password) {this.password = password;}
    public String getName() {   return name; }
    public void setName(String name) {   this.name = name;   }
}