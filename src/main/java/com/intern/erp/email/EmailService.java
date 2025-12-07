package com.intern.erp.email;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.internet.MimeMessage;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class EmailService {
    private final JavaMailSender mailSender;
    @Value("${spring.mail.username}")
    private String from;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendEmail(String to, String subject, String body) {
        log.debug("Sending plain email to={} subject='{}' bytes={} ", to, subject, body != null ? body.length() : 0);
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(from);
        message.setTo(to);
        message.setSubject(subject);
        message.setText(body);
        mailSender.send(message);
        log.info("Plain email sent to={} subject='{}'", to, subject);
    }

    public void sendEmailHtml(String to, String subject, String textBody, String htmlBody) {
        try {
            log.debug("Sending HTML email to={} subject='{}' textBytes={} htmlBytes={}", to, subject,
                textBody != null ? textBody.length() : 0, htmlBody != null ? htmlBody.length() : 0);
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
            helper.setFrom(from);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(textBody, htmlBody); // set both plain and html
            mailSender.send(mimeMessage);
            log.info("HTML email sent to={} subject='{}'", to, subject);
        } catch (Exception e) {
            log.warn("HTML email failed for to={} subject='{}' fallback to plain. cause={}", to, subject, e.getMessage());
            // Fallback to plain text
            sendEmail(to, subject, textBody != null ? textBody : htmlBody.replaceAll("<[^>]+>", ""));
        }
    }

    public void sendEmailWithAttachment(String to, String subject, String body, byte[] attachment, String fileName) {
        try {
            log.debug("Sending email with attachment to={} subject='{}' attachment='{}'", to, subject, fileName);
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
            helper.setFrom(from);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(body);
            
            // Add attachment
            helper.addAttachment(fileName, new org.springframework.core.io.ByteArrayResource(attachment));
            
            mailSender.send(mimeMessage);
            log.info("Email with attachment sent to={} subject='{}' attachment='{}'", to, subject, fileName);
        } catch (Exception e) {
            log.error("Failed to send email with attachment to={} subject='{}' attachment='{}'. Error: {}", 
                    to, subject, fileName, e.getMessage());
            // Fallback to sending email without attachment
            log.info("Falling back to plain email without attachment");
            sendEmail(to, subject, body);
        }
    }
}
