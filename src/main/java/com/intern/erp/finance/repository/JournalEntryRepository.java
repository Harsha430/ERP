package com.intern.erp.finance.repository;

import com.intern.erp.finance.model.JournalEntry;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface JournalEntryRepository extends MongoRepository<JournalEntry,Long> {
}
