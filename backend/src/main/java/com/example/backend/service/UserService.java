package com.example.backend.service;

import com.example.backend.dto.user.UserResponse;
import com.example.backend.entity.User;
import com.example.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public UserResponse getCurrentUser(User user) {
        return toResponse(user);
    }

    public UserResponse updateTheme(User user, String theme) {
        user.setTheme(theme);
        userRepository.save(user);
        return toResponse(user);
    }

    private UserResponse toResponse(User user) {
        return UserResponse.builder()
                .fullName(user.getFullName())
                .email(user.getEmail())
                .theme(user.getTheme())
                .build();
    }
}

