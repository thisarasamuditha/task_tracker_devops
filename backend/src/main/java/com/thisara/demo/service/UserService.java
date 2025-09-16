package com.thisara.demo.service;

import com.thisara.demo.entity.User;
import com.thisara.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;

    public Optional<User> authenticate(String username, String password) {
        // Try to find user by username first
        Optional<User> user = userRepository.findByUsername(username);
        
        // If not found by username, try by email
        if (!user.isPresent()) {
            user = userRepository.findByUsername(username);
        }
        
        // Check if user exists and password matches
        if (user.isPresent() && user.get().getPassword().equals(password)) {
            return user;
        }
        return Optional.empty();
    }

    public boolean existsByUsername(String username) {
        return userRepository.findByUsername(username).isPresent();
    }

    public User createUser(String username, String password) {
        User user = new User();
        user.setUsername(username);
        user.setPassword(password); // later we can hash
        return userRepository.save(user);
    }

}