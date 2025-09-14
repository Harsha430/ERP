package com.intern.erp.finance.controller;

import com.intern.erp.finance.model.Invoice;
import com.intern.erp.finance.service.InvoiceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping({"/api/invoices","/api/finance/invoices"})
public class InvoiceController {

    @Autowired
    private InvoiceService invoiceService;

    @PostMapping
    public ResponseEntity<Invoice> createInvoice(@RequestBody Invoice invoice) {
        Invoice saved = invoiceService.createInvoice(invoice);
        return ResponseEntity.ok(saved);
    }

    @GetMapping
    public ResponseEntity<List<Invoice>> getAllInvoices() {
        return ResponseEntity.ok(invoiceService.getAllInvoices());
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<Invoice>> getByStatus(@PathVariable String status) {
        List<Invoice> filtered = invoiceService.getAllInvoices().stream()
                .filter(inv -> inv.getStatus() != null && inv.getStatus().name().equalsIgnoreCase(status))
                .collect(Collectors.toList());
        return ResponseEntity.ok(filtered);
    }

    @PostMapping("/{id}/pay")
    public ResponseEntity<Invoice> markAsPaidPost(@PathVariable Long id) {
        Invoice paidInvoice = invoiceService.markInvoiceAsPaid(id);
        return ResponseEntity.ok(paidInvoice);
    }

    @PutMapping("/{id}/mark-paid")
    public ResponseEntity<Invoice> markAsPaidPut(@PathVariable Long id) {
        Invoice paidInvoice = invoiceService.markInvoiceAsPaid(id);
        return ResponseEntity.ok(paidInvoice);
    }
}
