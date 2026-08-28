package com.example.backend.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpEntity;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

// Railway (ve cogu bulut saglayici) giden SMTP baglantilarini (port 587/465)
// spam onlemi olarak engelliyor - bu yuzden Gmail'e dogrudan SMTP ile
// baglanmak yerine, Brevo'nun normal HTTPS API'sine (port 443, hicbir yerde
// engellenmiyor) istek atiyoruz. Gercek gonderimi Brevo hallediyor.
@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private static final String BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${app.mail.from}")
    private String fromAddress;

    @Value("${app.mail.brevo-api-key}")
    private String brevoApiKey;

    public void sendVerificationCode(String toEmail, String code) {
        send(toEmail, "Verify your TaskFlow account",
                "Your verification code is: " + code + "\n\nThis code expires in 10 minutes.");
    }

    public void sendPasswordResetCode(String toEmail, String code) {
        send(toEmail, "Reset your TaskFlow password",
                "Your password reset code is: " + code + "\n\nThis code expires in 10 minutes.");
    }

    private void send(String toEmail, String subject, String text) {
        HttpHeaders headers = new HttpHeaders();
        headers.set("api-key", brevoApiKey);
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> body = Map.of(
                "sender", Map.of("email", fromAddress, "name", "TaskFlow"),
                "to", List.of(Map.of("email", toEmail)),
                "subject", subject,
                "textContent", text,
                "htmlContent", "<p>" + text.replace("\n", "<br>") + "</p>"
        );

        try {
            restTemplate.postForEntity(BREVO_API_URL, new HttpEntity<>(body, headers), String.class);
        } catch (Exception e) {
            // Kod zaten veritabanina kaydedildi (VerificationCodeService), mail
            // gonderimi basarisiz olsa bile kullanici akisi tamamen kilitlenmesin -
            // ama sorunu gorebilelim diye logluyoruz.
            log.error("Failed to send email via Brevo to {}: {}", toEmail, e.getMessage());
        }
    }
}
