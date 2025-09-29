package com.intern.erp.outbox;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.Instant;


@Data
@AllArgsConstructor
@NoArgsConstructor
@Document(collection = "outbox_events")
public class OutboxEvent {
    @Id
    private String id;
    @Indexed
    private String type; // e.g., EMAIL
    private String payload; // JSON string
    @Indexed
    private boolean sent = false;
    @Indexed
    private Instant createdAt = Instant.now();
    private Instant sentAt;
    private int attempts = 0;
    private String lastError;
    private String template; // Optional template name (enum name)
    private boolean deadLetter = false; // moved to dead letter after max attempts

    // Getters and setters
    // ...
}
