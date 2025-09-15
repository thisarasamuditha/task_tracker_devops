package com.thisara.demo.repository;  // Adjust package name accordingly

import com.thisara.demo.entity.User;  // Import the User entity
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
}