package com.intern.erp.finance.service.impl;

import com.intern.erp.config.SequenceGeneratorService;
import com.intern.erp.finance.model.Expense;
import com.intern.erp.finance.model.JournalEntry;
import com.intern.erp.finance.model.LedgerEntry;
import com.intern.erp.finance.repository.ExpenseRepository;
import com.intern.erp.finance.repository.JournalEntryRepository;
import com.intern.erp.finance.repository.LedgerRepository;
import com.intern.erp.finance.service.ExpenseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import static com.intern.erp.finance.model.enums.EntrySource.EXPENSE;
import static com.intern.erp.finance.model.enums.EntrySource.MANUAL;
import static com.intern.erp.finance.model.enums.PaymentStatus.PAID;

@Service
public class ExpenseServiceImpl implements ExpenseService {

    private final JournalEntryRepository journalEntryRepository;
    private final LedgerRepository ledgerRepository;
    private final ExpenseRepository expenseRepository;
    private final SequenceGeneratorService sequenceGeneratorService;

    @Autowired
    public ExpenseServiceImpl(JournalEntryRepository journalEntryRepository, LedgerRepository ledgerRepository, ExpenseRepository expenseRepository, SequenceGeneratorService sequenceGeneratorService) {
        this.journalEntryRepository = journalEntryRepository;
        this.ledgerRepository = ledgerRepository;
        this.expenseRepository = expenseRepository;
        this.sequenceGeneratorService = sequenceGeneratorService;
    }

    @Override
    @Transactional
    public Expense addExpense(Expense expense) {
        expense.setId(sequenceGeneratorService.getSequenceNumber(Expense.class.getSimpleName()));
        return expenseRepository.save(expense);
    }


    @Override
    public List<Expense> getAllExpenses() {
        return expenseRepository.findAll();
    }

    @Override
    @Transactional
    public Expense markExpenseAsPaid(Long expenseId) {
        Expense expense = expenseRepository.findById(expenseId).orElseThrow();
        if (expense.getStatus() != PAID) {
            expense.setStatus(PAID);
            expenseRepository.save(expense);

            JournalEntry journalEntry = new JournalEntry();
            journalEntry.setId(sequenceGeneratorService.getSequenceNumber(JournalEntry.class.getSimpleName()));
            journalEntry.setEntryDate(LocalDate.now());
            journalEntry.setAmount(expense.getAmount());
            journalEntry.setNarration(expense.getDescription());
            journalEntry.setCreditAccountId(expense.getCreditAccount());
            journalEntry.setDebitAccountId(expense.getDebitAccount());
            journalEntry.setSource(EXPENSE);
            JournalEntry savedJournal = journalEntryRepository.save(journalEntry);

            LedgerEntry ledgerEntry = new LedgerEntry();
            ledgerEntry.setId(sequenceGeneratorService.getSequenceNumber(LedgerEntry.class.getSimpleName()));
            ledgerEntry.setAmount(expense.getAmount());
            ledgerEntry.setCreditAccount(expense.getCreditAccount());
            ledgerEntry.setDebitAccount(expense.getDebitAccount());
            ledgerEntry.setTransactionDate(LocalDateTime.now());
            ledgerEntry.setReferenceId(savedJournal.getId().toString());
            ledgerRepository.save(ledgerEntry);
        }
        return expense;
    }

}
