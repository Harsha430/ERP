package com.intern.erp.outbox;

import org.springframework.stereotype.Service;
import java.util.Map;
import java.util.List;
import java.util.Optional;
import java.util.HashMap;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.intern.erp.email.EmailTemplate;

@Service
public class OutboxService {
    private final OutboxEventRepository repo;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public OutboxService(OutboxEventRepository repo) {
        this.repo = repo;
    }

    public OutboxEvent addEmailEvent(String to, String subject, String body) {
        try {
            String payload = objectMapper.writeValueAsString(Map.of(
                "to", to,
                "subject", subject,
                "body", body
            ));
            OutboxEvent event = new OutboxEvent();
            event.setType("EMAIL");
            event.setPayload(payload);
            return repo.save(event);
        } catch (Exception e) {
            throw new RuntimeException("Failed to add email event", e);
        }
    }

    // New: template based email
    public OutboxEvent addTemplateEmailEvent(String to, EmailTemplate template, Map<String,Object> vars) {
        try {
            Map<String,Object> payload = new HashMap<>();
            if (vars != null) payload.putAll(vars);
            payload.put("to", to);
            payload.put("template", template.name());
            String payloadJson = objectMapper.writeValueAsString(payload);
            OutboxEvent event = new OutboxEvent();
            event.setType("EMAIL");
            event.setTemplate(template.name());
            event.setPayload(payloadJson);
            return repo.save(event);
        } catch (Exception e) {
            throw new RuntimeException("Failed to add template email event", e);
        }
    }

    public List<OutboxEvent> getPending() { return repo.findBySentFalseAndDeadLetterFalse(); }

    public List<OutboxEvent> getFailed() { return repo.findBySentFalseAndDeadLetterFalse().stream().filter(e -> e.getAttempts() > 0).toList(); }

    public List<OutboxEvent> getDead() { return repo.findByDeadLetterTrue(); }

    public Optional<OutboxEvent> getById(String id) { return repo.findById(id); }

    public OutboxEvent requeue(String id) {
        OutboxEvent ev = repo.findById(id).orElseThrow(() -> new IllegalArgumentException("Outbox event not found: " + id));
        ev.setSent(false);
        ev.setSentAt(null);
        ev.setAttempts(0);
        ev.setDeadLetter(false);
        ev.setLastError(null);
        return repo.save(ev);
    }

    public OutboxEvent markFailed(OutboxEvent ev, String error) {
        ev.setAttempts(ev.getAttempts() + 1);
        ev.setLastError(error);
        return repo.save(ev);
    }

    public OutboxEvent markDeadLetter(OutboxEvent ev) {
        ev.setDeadLetter(true);
        return repo.save(ev);
    }

    public java.util.Map<String,Object> getStats( ) {
        java.util.Map<String,Object> m = new java.util.HashMap<>();
        m.put("sent", repo.countBySentTrue());
        m.put("pending", repo.countBySentFalseAndDeadLetterFalse());
        m.put("dead", repo.countByDeadLetterTrue());
        m.put("failed", getFailed().size());
        return m;
    }
}
