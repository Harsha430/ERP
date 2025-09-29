package com.intern.erp.finance.service.impl;

import com.intern.erp.config.SequenceGeneratorService;
import com.intern.erp.finance.model.Invoice;
import com.intern.erp.finance.model.JournalEntry;
import com.intern.erp.finance.model.LedgerEntry;
import com.intern.erp.finance.model.enums.EntrySource;
import com.intern.erp.finance.model.enums.PaymentStatus;
import com.intern.erp.finance.repository.ExpenseRepository;
import com.intern.erp.finance.repository.InvoiceRepository;
import com.intern.erp.finance.repository.JournalEntryRepository;
import com.intern.erp.finance.repository.LedgerRepository;
import com.intern.erp.finance.service.InvoiceService;
import com.intern.erp.outbox.OutboxService;
import com.intern.erp.email.EmailTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
@Service
public class InvoiceServiceImpl implements InvoiceService {

    private final JournalEntryRepository journalEntryRepository;
    private final LedgerRepository ledgerRepository;
    private final InvoiceRepository invoiceRepository;
    private final SequenceGeneratorService sequenceGeneratorService;
    @Autowired private OutboxService outboxService;

    @Autowired
    public InvoiceServiceImpl(JournalEntryRepository journalEntryRepository, LedgerRepository ledgerRepository, InvoiceRepository invoiceRepository, SequenceGeneratorService sequenceGeneratorService) {
        this.journalEntryRepository = journalEntryRepository;
        this.ledgerRepository = ledgerRepository;
        this.invoiceRepository = invoiceRepository;
        this.sequenceGeneratorService = sequenceGeneratorService;
    }

    @Override
    public Invoice createInvoice(Invoice invoice) {
        invoice.setId(sequenceGeneratorService.getSequenceNumber(Invoice.class.getSimpleName()));
        return invoiceRepository.save(invoice);
    }

    @Override
    public List<Invoice> getAllInvoices() {
        return invoiceRepository.findAll();
    }

    @Override
    @Transactional
    public Invoice markInvoiceAsPaid(Long invoiceId) {
        Invoice invoice = invoiceRepository.findById(invoiceId).orElseThrow();

        if (invoice.getStatus() != PaymentStatus.PAID) {
            invoice.setStatus(PaymentStatus.PAID);
            invoiceRepository.save(invoice); // update status

            // Queue invoice paid email (if customer email present)
            if (invoice.getCustomerEmail() != null && !invoice.getCustomerEmail().isBlank()) {
                outboxService.addTemplateEmailEvent(
                    invoice.getCustomerEmail(),
                    EmailTemplate.INVOICE_PAID,
                    java.util.Map.of(
                        "invoiceNumber", invoice.getInvoiceNumber(),
                        "customerName", invoice.getCustomerName(),
                        "amount", String.valueOf(invoice.getTotalAmount())
                    )
                );
            }

            // Journal Entry
            JournalEntry journalEntry = new JournalEntry();
            journalEntry.setId(sequenceGeneratorService.getSequenceNumber(JournalEntry.class.getSimpleName()));
            journalEntry.setSource(EntrySource.INVOICE);
            journalEntry.setNarration("Invoice " + invoice.getInvoiceNumber() + " paid by " + invoice.getCustomerName());
            journalEntry.setEntryDate(LocalDate.now());
            journalEntry.setCreditAccountId(invoice.getCreditAccount());
            journalEntry.setDebitAccountId(invoice.getDebitAccount());
            journalEntry.setAmount(invoice.getTotalAmount());
            JournalEntry savedJournal = journalEntryRepository.save(journalEntry);

            // Ledger Entry
            LedgerEntry ledgerEntry = new LedgerEntry();
            ledgerEntry.setId(sequenceGeneratorService.getSequenceNumber(LedgerEntry.class.getSimpleName()));
            ledgerEntry.setTransactionDate(LocalDateTime.now());
            ledgerEntry.setAmount(invoice.getTotalAmount()); // ✅ total
            ledgerEntry.setCreditAccount(invoice.getCreditAccount());
            ledgerEntry.setDebitAccount(invoice.getDebitAccount());
            ledgerEntry.setReferenceId(savedJournal.getId().toString());
            ledgerRepository.save(ledgerEntry);
        }

        return invoice;
    }
}
