package com.example.backend.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class JwtUtil {
    @Value("${jwt.secret}")//jwt imzalanırken kullanılcak key
    private String secret;

    @Value("${jwt.expiration-ms}")//tokenin gecersiz olma suresi
    private long expirationMs;

    private SecretKey getSigningKey(){
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    public String generateToken(String email){
        Date now=new Date();
        Date expiry =new Date(now.getTime()+expirationMs);

        return Jwts.builder()
                .subject(email)//jwt sahibi
                .issuedAt(now)//token ne zmn olusturuldu
                .expiration(expiry)//ne zmn bitcek
                .signWith(getSigningKey())//imzala
                .compact();//string dondur
    }

        public String extractEmail(String token){
            return parseClaims(token).getSubject();
    }

    public boolean isTokenValid(String token) {
        try {
            Claims claims = parseClaims(token);//token okunuyor
            return claims.getExpiration().after(new Date());
        } catch (Exception e) {
            return false;
        }
    }

    private Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();//icindeki bilgileri alma
    }
}

