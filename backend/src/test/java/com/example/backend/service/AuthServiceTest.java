package com.example.backend.service;

import com.example.backend.dto.auth.*;
import com.example.backend.entity.User;
import com.example.backend.entity.VerificationCode;
import com.example.backend.exception.EmailAlreadyInUseException;
import com.example.backend.exception.InvalidCredentialsException;
import com.example.backend.exception.PasswordMismatchException;
import com.example.backend.repository.UserRepository;
import com.example.backend.security.JwtUtil;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

// AuthService'in bağımlılıkları (repository, encoder, jwt, verification) mock'lanıyor;
// gerçek veritabanına/gerçek maile hiç dokunulmuyor - sadece AuthService'in kendi mantığı test ediliyor.
@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtUtil jwtUtil;

    @Mock
    private VerificationCodeService verificationCodeService;

    @InjectMocks
    private AuthService authService;

    private User buildUser(boolean enabled) {
        return User.builder()
                .id(1L)
                .fullName("Test User")
                .email("test@example.com")
                .passwordHash("hashed-pw")
                .theme("white")
                .enabled(enabled)
                .build();
    }

    // ---------- register ----------

    @Test
    void register_passwordsDontMatch_throwsPasswordMismatch() {
        RegisterRequest request = new RegisterRequest();
        request.setFullName("Test User");
        request.setEmail("test@example.com");
        request.setPassword("password1");
        request.setConfirmPassword("password2");

        assertThrows(PasswordMismatchException.class, () -> authService.register(request));

        verifyNoInteractions(userRepository);
    }

    @Test
    void register_emailAlreadyInUse_throwsEmailAlreadyInUse() {
        RegisterRequest request = new RegisterRequest();
        request.setFullName("Test User");
        request.setEmail("test@example.com");
        request.setPassword("password1");
        request.setConfirmPassword("password1");

        when(userRepository.existsByEmail("test@example.com")).thenReturn(true);

        assertThrows(EmailAlreadyInUseException.class, () -> authService.register(request));

        verify(userRepository, never()).save(any());
    }

    @Test
    void register_validRequest_savesDisabledUserAndSendsCode() {
        RegisterRequest request = new RegisterRequest();
        request.setFullName("Test User");
        request.setEmail("test@example.com");
        request.setPassword("password1");
        request.setConfirmPassword("password1");

        when(userRepository.existsByEmail("test@example.com")).thenReturn(false);
        when(passwordEncoder.encode("password1")).thenReturn("hashed-pw");

        MessageResponse response = authService.register(request);

        assertThat(response.getMessage()).contains("verification code");

        verify(userRepository).save(argThat(user ->
                user.getEmail().equals("test@example.com")
                        && user.getPasswordHash().equals("hashed-pw")
                        && !user.isEnabled()
        ));
        verify(verificationCodeService).generateAndSendEmailVerification(any(User.class));
    }

    // ---------- login ----------

    @Test
    void login_unknownEmail_throwsInvalidCredentials() {
        LoginRequest request = new LoginRequest();
        request.setEmail("nobody@example.com");
        request.setPassword("whatever");

        when(userRepository.findByEmail("nobody@example.com")).thenReturn(Optional.empty());

        assertThrows(InvalidCredentialsException.class, () -> authService.login(request));
    }

    @Test
    void login_wrongPassword_throwsInvalidCredentials() {
        User user = buildUser(true);
        LoginRequest request = new LoginRequest();
        request.setEmail(user.getEmail());
        request.setPassword("wrong-pw");

        when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrong-pw", user.getPasswordHash())).thenReturn(false);

        assertThrows(InvalidCredentialsException.class, () -> authService.login(request));

        verify(jwtUtil, never()).generateToken(any());
    }

    @Test
    void login_accountNotVerified_throwsInvalidCredentials() {
        User user = buildUser(false);
        LoginRequest request = new LoginRequest();
        request.setEmail(user.getEmail());
        request.setPassword("correct-pw");

        when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("correct-pw", user.getPasswordHash())).thenReturn(true);

        InvalidCredentialsException ex = assertThrows(InvalidCredentialsException.class,
                () -> authService.login(request));
        assertThat(ex.getMessage()).contains("verify your email");
    }

    @Test
    void login_validCredentials_returnsAuthResponseWithToken() {
        User user = buildUser(true);
        LoginRequest request = new LoginRequest();
        request.setEmail(user.getEmail());
        request.setPassword("correct-pw");

        when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("correct-pw", user.getPasswordHash())).thenReturn(true);
        when(jwtUtil.generateToken(user.getEmail())).thenReturn("fake-jwt-token");

        AuthResponse response = authService.login(request);

        assertThat(response.getToken()).isEqualTo("fake-jwt-token");
        assertThat(response.getEmail()).isEqualTo(user.getEmail());
        assertThat(response.getTheme()).isEqualTo("white");
    }

    // ---------- resendVerification ----------

    @Test
    void resendVerification_alreadyVerifiedAccount_throwsInvalidCredentials() {
        User user = buildUser(true);
        EmailOnlyRequest request = new EmailOnlyRequest();
        request.setEmail(user.getEmail());

        when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));

        InvalidCredentialsException ex = assertThrows(InvalidCredentialsException.class,
                () -> authService.resendVerification(request));
        assertThat(ex.getMessage()).contains("already verified");

        verify(verificationCodeService, never()).generateAndSendEmailVerification(any());
    }

    @Test
    void resendVerification_unverifiedAccount_sendsNewCode() {
        User user = buildUser(false);
        EmailOnlyRequest request = new EmailOnlyRequest();
        request.setEmail(user.getEmail());

        when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));

        MessageResponse response = authService.resendVerification(request);

        assertThat(response.getMessage()).contains("sent");
        verify(verificationCodeService).generateAndSendEmailVerification(user);
    }

    // ---------- verifyEmail ----------

    @Test
    void verifyEmail_validCode_enablesUserAndReturnsToken() {
        User user = buildUser(false);
        VerifyEmailRequest request = new VerifyEmailRequest();
        request.setEmail(user.getEmail());
        request.setCode("123456");

        when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));
        when(jwtUtil.generateToken(user.getEmail())).thenReturn("fake-jwt-token");

        AuthResponse response = authService.verifyEmail(request);

        assertThat(user.isEnabled()).isTrue();
        assertThat(response.getToken()).isEqualTo("fake-jwt-token");
        verify(verificationCodeService).verifyCode(user, "123456", VerificationCode.Type.EMAIL_VERIFICATION);
        verify(userRepository).save(user);
    }

    @Test
    void verifyEmail_invalidCode_throwsInvalidCredentials() {
        User user = buildUser(false);
        VerifyEmailRequest request = new VerifyEmailRequest();
        request.setEmail(user.getEmail());
        request.setCode("000000");

        when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));
        doThrow(new InvalidCredentialsException("Invalid or expired code"))
                .when(verificationCodeService)
                .verifyCode(user, "000000", VerificationCode.Type.EMAIL_VERIFICATION);

        assertThrows(InvalidCredentialsException.class, () -> authService.verifyEmail(request));

        assertThat(user.isEnabled()).isFalse();
        verify(userRepository, never()).save(any());
    }

    // ---------- resetPassword ----------

    @Test
    void resetPassword_passwordsDontMatch_throwsPasswordMismatch() {
        User user = buildUser(true);
        ResetPasswordRequest request = new ResetPasswordRequest();
        request.setEmail(user.getEmail());
        request.setCode("123456");
        request.setNewPassword("newpass1");
        request.setConfirmNewPassword("newpass2");

        when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));

        assertThrows(PasswordMismatchException.class, () -> authService.resetPassword(request));

        verify(verificationCodeService, never()).verifyCode(any(), any(), any());
    }

    @Test
    void resetPassword_validRequest_updatesPasswordHash() {
        User user = buildUser(true);
        ResetPasswordRequest request = new ResetPasswordRequest();
        request.setEmail(user.getEmail());
        request.setCode("123456");
        request.setNewPassword("newpass1");
        request.setConfirmNewPassword("newpass1");

        when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));
        when(passwordEncoder.encode("newpass1")).thenReturn("new-hashed-pw");

        MessageResponse response = authService.resetPassword(request);

        assertThat(response.getMessage()).contains("Password reset successful");
        assertThat(user.getPasswordHash()).isEqualTo("new-hashed-pw");
        verify(verificationCodeService).verifyCode(user, "123456", VerificationCode.Type.PASSWORD_RESET);
        verify(userRepository).save(user);
    }
}
