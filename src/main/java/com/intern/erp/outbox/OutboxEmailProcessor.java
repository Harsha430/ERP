package com.intern.erp.outbox;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.intern.erp.email.EmailService;
import com.intern.erp.email.EmailTemplate;
import com.intern.erp.email.EmailTemplateRenderer;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.List;

@Slf4j
@Component
public class OutboxEmailProcessor {
    private final OutboxEventRepository repo;
    private final EmailService emailService;
    private final OutboxService outboxService;
    private final EmailTemplateRenderer templateRenderer;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${outbox.email.max-attempts:5}")
    private int maxAttempts;

    public OutboxEmailProcessor(OutboxEventRepository repo, EmailService emailService, OutboxService outboxService, EmailTemplateRenderer templateRenderer) {
        this.repo = repo;
        this.emailService = emailService;
        this.outboxService = outboxService;
        this.templateRenderer = templateRenderer;
    }

    @Scheduled(fixedDelayString = "${outbox.email.poll-interval-ms:10000}") // configurable polling interval
    public void processOutbox() {
        var events = repo.findBySentFalseAndDeadLetterFalse();
        if (events.isEmpty()) {
            return; // idle
        }
        log.debug("Outbox processor found {} pending events", events.size());
        for (OutboxEvent event : events) {
            if (!"EMAIL".equals(event.getType())) {
                continue;
            }
            if (event.getAttempts() >= maxAttempts) {
                if (!event.isDeadLetter()) {
                    outboxService.markDeadLetter(event);
                    log.warn("Event {} moved to dead-letter after {} attempts", event.getId(), event.getAttempts());
                }
                continue;
            }
            try {
                JsonNode node = objectMapper.readTree(event.getPayload());
                String to = node.get("to").asText();
                if (event.getTemplate() != null) {
                    EmailTemplate template = EmailTemplate.valueOf(event.getTemplate());
                    // Build vars map
                    java.util.Iterator<String> it = node.fieldNames();
                    java.util.Map<String,Object> vars = new java.util.HashMap<>();
                    while (it.hasNext()) {
                        String f = it.next();
                        if (!"to".equals(f) && !"template".equals(f)) {
                            vars.put(f, node.get(f).isValueNode() ? node.get(f).asText() : node.get(f).toString());
                        }
                    }
                    var rendered = templateRenderer.render(template, vars);
                    emailService.sendEmailHtml(to, rendered.subject(), rendered.textBody(), rendered.htmlBody());
                } else {
                    String subject = node.has("subject") ? node.get("subject").asText() : "Notification";
                    String body = node.has("body") ? node.get("body").asText() : event.getPayload();
                    emailService.sendEmail(to, subject, body);
                }
                event.setSent(true);
                event.setSentAt(Instant.now());
                event.setLastError(null);
                repo.save(event);
                log.info("Marked outbox event {} as sent", event.getId());
            } catch (Exception e) {
                log.error("Failed processing outbox event {} attempt {}: {}", event.getId(), event.getAttempts() + 1, e.getMessage());
                outboxService.markFailed(event, e.getClass().getSimpleName() + ": " + e.getMessage());
                if (event.getAttempts() >= maxAttempts) {
                    outboxService.markDeadLetter(event);
                    log.warn("Event {} moved to dead-letter after failure", event.getId());
                }
            }
        }
    }
}
