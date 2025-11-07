package com.thisara.demo.service;

import com.thisara.demo.dto.CreateTaskRequest;
import com.thisara.demo.entity.Tasks;
import com.thisara.demo.repository.TaskRepository;
import com.thisara.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
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


}
