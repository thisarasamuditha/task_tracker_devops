package com.thisara.demo.controller;

import com.thisara.demo.dto.CreateTaskRequest;
import com.thisara.demo.entity.Tasks;
import com.thisara.demo.service.TaskService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:5173")
public class TaskController {

    @Autowired
    private TaskService taskService;

    @PostMapping("/users/{userId}/tasks")
    public ResponseEntity<?> createTaskForUser(
            @PathVariable("userId") Long userId,
            @Valid @RequestBody CreateTaskRequest request) {

        try {
            Tasks created = taskService.createTaskForUser(userId, request);
            return ResponseEntity.status(201).body(created);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            // generic fallback
            return ResponseEntity.status(500).body("Failed to create task: " + e.getMessage());
        }
    }

    // ... other endpoints ...
}
