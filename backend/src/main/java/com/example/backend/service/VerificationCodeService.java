package com.example.backend.service;

import com.example.backend.entity.User;
import com.example.backend.entity.VerificationCode;
import com.example.backend.exception.InvalidCredentialsException;
import com.example.backend.repository.VerificationCodeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class VerificationCodeService {

    private final VerificationCodeRepository verificationCodeRepository;
    private final EmailService emailService;

    @Value("${app.verification.code-expiry-minutes}")
    private long expiryMinutes;

    private final SecureRandom random = new SecureRandom();

    public void generateAndSendEmailVerification(User user) {
        String code = generateSixDigitCode();

        VerificationCode verificationCode = VerificationCode.builder()
                .user(user)
                .code(code)
                .type(VerificationCode.Type.EMAIL_VERIFICATION)
                .expiresAt(LocalDateTime.now().plusMinutes(expiryMinutes))
                .build();

        verificationCodeRepository.save(verificationCode);
        emailService.sendVerificationCode(user.getEmail(), code);
    }

    public void generateAndSendPasswordReset(User user) {
        String code = generateSixDigitCode();

        VerificationCode verificationCode = VerificationCode.builder()
                .user(user)
                .code(code)
                .type(VerificationCode.Type.PASSWORD_RESET)
                .expiresAt(LocalDateTime.now().plusMinutes(expiryMinutes))
                .build();

        verificationCodeRepository.save(verificationCode);
        emailService.sendPasswordResetCode(user.getEmail(), code);
    }


    // verifyCode'dan farkı: kodu "used" yapmıyor, sadece geçerli mi diye bakıyor.
    // Forgot-password akışında "önce kodu doğrula, sonra şifre ekranını göster" için kullanılıyor.
    public void checkCodeValid(User user, String code, VerificationCode.Type type) {
        VerificationCode verificationCode = verificationCodeRepository
                .findTopByUserAndTypeAndUsedFalseOrderByCreatedAtDesc(user, type)
                .orElseThrow(() -> new InvalidCredentialsException("Invalid or expired code"));

        if (!verificationCode.getCode().equals(code)) {
            throw new InvalidCredentialsException("Invalid or expired code");
        }

        if (verificationCode.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new InvalidCredentialsException("Invalid or expired code");
        }
    }

    // Girilen kodu doğrular: en son gönderilen, henüz kullanılmamış kod ile eşleşiyor mu,
    // süresi dolmamış mı diye bakar. Doğruysa "used" yapıp geri döner.
    public VerificationCode verifyCode(User user, String code, VerificationCode.Type type) {
        VerificationCode verificationCode = verificationCodeRepository
                .findTopByUserAndTypeAndUsedFalseOrderByCreatedAtDesc(user, type)
                .orElseThrow(() -> new InvalidCredentialsException("Invalid or expired code"));

        if (!verificationCode.getCode().equals(code)) {
            throw new InvalidCredentialsException("Invalid or expired code");
        }

        if (verificationCode.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new InvalidCredentialsException("Invalid or expired code");
        }

        verificationCode.setUsed(true);
        verificationCodeRepository.save(verificationCode);

        return verificationCode;
    }

    private String generateSixDigitCode() {
        int number = 100000 + random.nextInt(900000); // 100000-999999 arası, hep 6 haneli
        return String.valueOf(number);
    }
}
