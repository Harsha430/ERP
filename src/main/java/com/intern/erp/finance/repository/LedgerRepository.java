package com.intern.erp.finance.repository;

import com.intern.erp.finance.model.LedgerEntry;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface LedgerRepository extends MongoRepository<LedgerEntry,Long> {

    List<LedgerEntry> findByTransactionDateBetween(LocalDateTime start, LocalDateTime end);
}
