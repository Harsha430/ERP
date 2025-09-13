package com.intern.erp.finance.controller;

import com.intern.erp.finance.model.Invoice;
import com.intern.erp.finance.service.InvoiceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/invoices")
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

    @PostMapping("/{id}/pay")
    public ResponseEntity<Invoice> markAsPaid(@PathVariable Long id) {
        Invoice paidInvoice = invoiceService.markInvoiceAsPaid(id);
        return ResponseEntity.ok(paidInvoice);
    }
}
