package com.thisara.demo.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

public class CreateTaskRequest {
    // title is required
    @NotBlank(message = "Title is required")
    @Size(max = 255)
    private String title;

    private String description;

    // optional, default used if missing
    private String priority;

    // optional: format "YYYY-MM-DD"
    private LocalDate dueDate;

    // getters / setters
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }
    public LocalDate getDueDate() { return dueDate; }
    public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }
}
