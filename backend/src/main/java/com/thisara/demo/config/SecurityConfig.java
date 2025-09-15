package com.thisara.demo.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        // Disabling CSRF for API endpoints
        http.csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                    .requestMatchers("/api/auth/login", "/api/auth/register", "/login", "/register").permitAll()  // Allow public access to auth endpoints
                    .anyRequest().authenticated()  // Protect all other endpoints
                )
                .httpBasic(httpBasic -> {})  // Enable HTTP Basic for API testing
                .formLogin(form -> form
                    .loginPage("/login")  // Custom login page URL for web interface
                    .permitAll()
                )
                .logout(logout -> logout
                    .permitAll()  // Enable logout for all
                );

        return http.build();
    }
}
