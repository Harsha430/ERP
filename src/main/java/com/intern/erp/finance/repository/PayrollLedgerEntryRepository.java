package com.intern.erp.finance.repository;

import com.intern.erp.finance.model.PayrollLedgerEntry;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface PayrollLedgerEntryRepository extends MongoRepository<PayrollLedgerEntry, Long> {
    
    List<PayrollLedgerEntry> findByAccountId(Long accountId);
    
    List<PayrollLedgerEntry> findByEntryDateBetween(LocalDate startDate, LocalDate endDate);
    
    List<PayrollLedgerEntry> findByJournalEntryId(Long journalEntryId);
}