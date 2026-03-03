package mbstucse.alamgir.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import mbstucse.alamgir.backend.entity.Server;

public interface ServerRepository extends JpaRepository<Server, Long> {
}