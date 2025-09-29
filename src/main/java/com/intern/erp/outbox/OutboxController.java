package com.intern.erp.outbox;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/outbox")
public class OutboxController {

    private final OutboxService outboxService;
    private final OutboxEmailProcessor emailProcessor; // Inject processor

    public OutboxController(OutboxService outboxService, OutboxEmailProcessor emailProcessor) {
        this.outboxService = outboxService;
        this.emailProcessor = emailProcessor;
    }

    @GetMapping("/test")
    public ResponseEntity<?> createAndProcessTestEvent() {
        OutboxEvent ev = outboxService.addTemplateEmailEvent(
            "99220040214@klu.ac.in",
            com.intern.erp.email.EmailTemplate.GENERIC,
            Map.of(
                "subject", "Outbox Test Successful",
                "body", "A test email was queued and processed."
            )
        );
        emailProcessor.processOutbox(); // Immediately trigger processing
        return ResponseEntity.ok(Map.of(
            "message", "Test event created and processor invoked.",
            "eventId", ev.getId(),
            "stats_after", outboxService.getStats()
        ));
    }

    public record EmailRequest(String to, String subject, String body) {}

    @GetMapping("/pending")
    public List<OutboxEvent> getPending() {
        return outboxService.getPending();
    }

    @PostMapping("/email")
    public ResponseEntity<?> createEmail(@RequestBody EmailRequest request) {
        if (request.to() == null || request.subject() == null || request.body() == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Missing to/subject/body"));
        }
        OutboxEvent ev = outboxService.addEmailEvent(request.to(), request.subject(), request.body());
        return ResponseEntity.ok(Map.of("id", ev.getId(), "status", "QUEUED"));
    }

    @PostMapping("/requeue/{id}")
    public ResponseEntity<?> requeue(@PathVariable String id) {
        try {
            OutboxEvent ev = outboxService.requeue(id);
            return ResponseEntity.ok(Map.of("id", ev.getId(), "status", "REQUEUED"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/failed")
    public List<OutboxEvent> getFailed() { return outboxService.getFailed(); }

    @GetMapping("/dead")
    public List<OutboxEvent> getDead() { return outboxService.getDead(); }

    public record TemplateEmailRequest(String to, String template, Map<String,Object> vars) {}

    @PostMapping("/template")
    public ResponseEntity<?> createTemplate(@RequestBody TemplateEmailRequest req) {
        if (req.to() == null || req.template() == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Missing to/template"));
        }
        try {
            var ev = outboxService.addTemplateEmailEvent(req.to(), com.intern.erp.email.EmailTemplate.valueOf(req.template()), req.vars());
            return ResponseEntity.ok(Map.of("id", ev.getId(), "status", "QUEUED", "template", req.template()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid template name"));
        }
    }

    @GetMapping("/stats")
    public Map<String,Object> stats() {
        return outboxService.getStats();
    }
}
