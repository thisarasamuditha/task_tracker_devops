package com.thisara.demo.controller;

import com.thisara.demo.dto.CreateTaskRequest;
import com.thisara.demo.entity.Tasks;
import com.thisara.demo.service.TaskService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

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

    @PutMapping("/users/{userId}/tasks/{taskId}")
    public ResponseEntity<?> updateTaskForUser(
            @PathVariable("userId") Long userId,
            @PathVariable("taskId") Long taskId,
            @RequestBody CreateTaskRequest request) {
        try {
            Tasks updated = taskService.updateTaskForUser(userId, taskId, request);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Failed to update task: " + e.getMessage());
        }
    }

    @DeleteMapping("/users/{userId}/tasks/{taskId}")
    public ResponseEntity<?> deleteTaskForUser(
            @PathVariable("userId") Long userId,
            @PathVariable("taskId") Long taskId) {
        try {
            taskService.deleteTaskForUser(userId, taskId);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Failed to delete task: " + e.getMessage());
        }
    }

    @GetMapping("/users/{userId}/tasks")
    public ResponseEntity<?> listTasksForUser(@PathVariable("userId") Long userId) {
        try {
            List<Tasks> tasks = taskService.getTasksForUser(userId);
            return ResponseEntity.ok(tasks);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Failed to list tasks: " + e.getMessage());
        }
    }

    @GetMapping("/users/{userId}/tasks/{taskId}")
    public ResponseEntity<?> getTaskForUser(@PathVariable("userId") Long userId,
                                            @PathVariable("taskId") Long taskId) {
        try {
            Tasks task = taskService.getTaskForUser(userId, taskId);
            return ResponseEntity.ok(task);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Failed to fetch task: " + e.getMessage());
        }
    }
}
