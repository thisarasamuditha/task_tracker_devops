package com.thisara.demo.controller;

import com.thisara.demo.entity.User;
import com.thisara.demo.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    @Autowired
    private UserService userService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> loginData) {
        String username = loginData.get("username");
        String password = loginData.get("password");

        Optional<User> user = userService.authenticate(username, password);

        if (user.isPresent()) {
            // Here, generate a JWT token (optional) and return to the client
            String token = "jwt_token"; // This should be generated properly
            return ResponseEntity.ok(new HashMap<String, String>() {{
                put("message", "Login successful");
                put("token", token);
            }});
        }

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials");
    }

    @PostMapping("/signup")
    public ResponseEntity<String> signup(@RequestBody Map<String, String> signupData){
        String username = signupData.get("username");
        String password = signupData.get("password");

//        System.out.println(username);
//        System.out.println(password);

        // Check if username already exists
        if (userService.existsByUsername(username)) {
            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body("Username already exists");
        }

        // Save user to database
        userService.createUser(username, password);

        return ResponseEntity.ok("User registered successfully");
    }
}

