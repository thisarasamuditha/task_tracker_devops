package com.thisara.demo.service;

import com.thisara.demo.dto.CreateTaskRequest;
import com.thisara.demo.entity.Tasks;
import com.thisara.demo.repository.TaskRepository;
import com.thisara.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class TaskService {

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private UserRepository userRepository;

    public Tasks createTaskForUser(Long userId, CreateTaskRequest req) {
        // ensure user exists
        if (!userRepository.existsById(userId)) {
            throw new IllegalArgumentException("User not found with id: " + userId);
        }

        Tasks task = new Tasks();
        task.setUserId(userId);
        task.setTitle(req.getTitle());
        task.setDescription(req.getDescription());

        // Set status from request or default to PENDING
        String status = req.getStatus() == null || req.getStatus().isBlank() ? "PENDING" : req.getStatus().toUpperCase();
        // Validate status: allow PENDING, IN_PROGRESS, COMPLETED
        if (!status.equals("PENDING") && !status.equals("IN_PROGRESS") && !status.equals("COMPLETED")) {
            status = "PENDING";
        }
        task.setStatus(status);
        
        // Set priority from request or default to LOW
        String priority = req.getPriority() == null || req.getPriority().isBlank() ? "LOW" : req.getPriority().toUpperCase();
        // Validate priority: allow LOW, MEDIUM, HIGH
        if (!priority.equals("LOW") && !priority.equals("MEDIUM") && !priority.equals("HIGH")) {
            priority = "LOW";
        }
        task.setPriority(priority);

        task.setDueDate(req.getDueDate());

        // set timestamps if your entity allows it (your entity currently has createdAt/updatedAt with insertable=false,
        // but if you can change them to insertable=true you can set them; otherwise DB can set defaults).
        try {
            task.setCreatedAt(LocalDateTime.now());
            task.setUpdatedAt(LocalDateTime.now());
        } catch (Exception ignored) {
            // ignore if your entity does not allow setting (matching existing column settings)
        }

        return taskRepository.save(task);
    }

    public Tasks updateTaskForUser(Long userId, CreateTaskRequest req) {
        // ensure user exists
        if (!userRepository.existsById(userId)) {
            throw new IllegalArgumentException("User not found with id: " + userId);
        }

        Tasks task = new Tasks();
        task.setUserId(userId);
        task.setTitle(req.getTitle());
        task.setDescription(req.getDescription());

        // default status & priority if missing
        task.setStatus(req.getPriority() == null ? "PENDING" : "PENDING"); // status always start PENDING
        String priority = req.getPriority() == null || req.getPriority().isBlank() ? "LOW" : req.getPriority().toUpperCase();
        // simple validation: allow LOW, MEDIUM, HIGH
        if (!priority.equals("LOW") && !priority.equals("MEDIUM") && !priority.equals("HIGH")) {
            priority = "LOW";
        }
        task.setPriority(priority);

        task.setDueDate(req.getDueDate());

        // set timestamps if your entity allows it (your entity currently has createdAt/updatedAt with insertable=false,
        // but if you can change them to insertable=true you can set them; otherwise DB can set defaults).
        try {
            task.setCreatedAt(LocalDateTime.now());
            task.setUpdatedAt(LocalDateTime.now());
        } catch (Exception ignored) {
            // ignore if your entity does not allow setting (matching existing column settings)
        }

        return taskRepository.save(task);
    }

    /**
     * Get all tasks for a specific user
     */
    public List<Tasks> getTasksForUser(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new IllegalArgumentException("User not found with id: " + userId);
        }
        return taskRepository.findByUserId(userId);
    }

    /**
     * Get a single task by ID (with ownership check)
     */
    public Tasks getTaskById(Long userId, Long taskId) {
        if (!userRepository.existsById(userId)) {
            throw new IllegalArgumentException("User not found with id: " + userId);
        }
        
        Tasks task = taskRepository.findById(taskId)
                .orElseThrow(() -> new IllegalArgumentException("Task not found with id: " + taskId));
        
        // Verify ownership
        if (!task.getUserId().equals(userId)) {
            throw new IllegalArgumentException("Task does not belong to this user");
        }
        
        return task;
    }


}
