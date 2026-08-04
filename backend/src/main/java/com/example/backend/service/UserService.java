package com.example.backend.service;

import com.example.backend.dto.user.ChangePasswordRequest;
import com.example.backend.dto.user.UserResponse;
import com.example.backend.entity.User;
import com.example.backend.exception.InvalidCredentialsException;
import com.example.backend.exception.PasswordMismatchException;
import com.example.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserResponse getCurrentUser(User user) {
        return toResponse(user);
    }

    public UserResponse updateTheme(User user, String theme) {
        user.setTheme(theme);
        userRepository.save(user);
        return toResponse(user);
    }


    public void changePassword(User user, ChangePasswordRequest request) {

        if (!passwordEncoder.matches(request.getOldPassword(), user.getPasswordHash())) {
            throw new InvalidCredentialsException("Current password is incorrect");
        }

        if (!request.getNewPassword().equals(request.getConfirmNewPassword())) {
            throw new PasswordMismatchException("New passwords do not match");
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    private UserResponse toResponse(User user) {
        return UserResponse.builder()
                .fullName(user.getFullName())
                .email(user.getEmail())
                .theme(user.getTheme())
                .build();
    }
}

