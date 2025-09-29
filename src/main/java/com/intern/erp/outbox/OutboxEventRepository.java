package com.intern.erp.outbox;

import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface OutboxEventRepository extends MongoRepository<OutboxEvent, String> {
    List<OutboxEvent> findBySentFalse();
    List<OutboxEvent> findBySentFalseAndDeadLetterFalse();
    List<OutboxEvent> findByDeadLetterTrue();
    long countBySentTrue();
    long countBySentFalseAndDeadLetterFalse();
    long countByDeadLetterTrue();
}
