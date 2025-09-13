package com.intern.erp.finance.service;

import com.intern.erp.finance.model.Invoice;

import java.util.List;

public interface InvoiceService {
    Invoice createInvoice(Invoice invoice);
    List<Invoice> getAllInvoices();
    Invoice markInvoiceAsPaid(Long invoiceId);
}
