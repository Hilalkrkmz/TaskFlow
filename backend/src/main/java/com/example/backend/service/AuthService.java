package com.example.backend.service;

import com.example.backend.dto.auth.*;
import com.example.backend.entity.User;
import com.example.backend.entity.VerificationCode;
import com.example.backend.exception.EmailAlreadyInUseException;
import com.example.backend.exception.InvalidCredentialsException;
import com.example.backend.exception.PasswordMismatchException;
import com.example.backend.repository.UserRepository;
import com.example.backend.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final VerificationCodeService verificationCodeService;

    // Artık JWT dönmüyor - hesap enabled=false olarak oluşuyor, kod email'e gidiyor.
    public MessageResponse register(RegisterRequest request) {

        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new PasswordMismatchException("Passwords do not match");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new EmailAlreadyInUseException("Email already in use");
        }

        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .enabled(false)
                .build();

        userRepository.save(user);

        verificationCodeService.generateAndSendEmailVerification(user);

        return new MessageResponse("Registration successful. Please check your email for a verification code.");
    }

    public AuthResponse verifyEmail(VerifyEmailRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new InvalidCredentialsException("Invalid or expired code"));

        verificationCodeService.verifyCode(user, request.getCode(), VerificationCode.Type.EMAIL_VERIFICATION);

        user.setEnabled(true);
        userRepository.save(user);

        String token = jwtUtil.generateToken(user.getEmail());

        return AuthResponse.builder()
                .token(token)
                .fullName(user.getFullName())
                .email(user.getEmail())
                .theme(user.getTheme())
                .build();
    }

    public MessageResponse resendVerification(EmailOnlyRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new InvalidCredentialsException("No account found with this email"));

        if (user.isEnabled()) {
            throw new InvalidCredentialsException("This account is already verified");
        }

        verificationCodeService.generateAndSendEmailVerification(user);
        return new MessageResponse("A new verification code has been sent to your email.");
    }

    public AuthResponse login(LoginRequest request) {

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new InvalidCredentialsException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new InvalidCredentialsException("Invalid email or password");
        }

        if (!user.isEnabled()) {
            throw new InvalidCredentialsException("Please verify your email before logging in");
        }

        String token = jwtUtil.generateToken(user.getEmail());

        return AuthResponse.builder()
                .token(token)
                .fullName(user.getFullName())
                .email(user.getEmail())
                .theme(user.getTheme())
                .build();
    }

    public MessageResponse verifyResetCode(VerifyEmailRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new InvalidCredentialsException("Invalid or expired code"));

        verificationCodeService.checkCodeValid(user, request.getCode(), VerificationCode.Type.PASSWORD_RESET);

        return new MessageResponse("Code verified. You can now set a new password.");
    }

    public MessageResponse forgotPassword(EmailOnlyRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new InvalidCredentialsException("No account found with this email"));

        verificationCodeService.generateAndSendPasswordReset(user);
        return new MessageResponse("A password reset code has been sent to your email.");
    }

    public MessageResponse resetPassword(ResetPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new InvalidCredentialsException("Invalid or expired code"));

        if (!request.getNewPassword().equals(request.getConfirmNewPassword())) {
            throw new PasswordMismatchException("Passwords do not match");
        }

        verificationCodeService.verifyCode(user, request.getCode(), VerificationCode.Type.PASSWORD_RESET);

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        return new MessageResponse("Password reset successful. You can now log in.");
    }
}
