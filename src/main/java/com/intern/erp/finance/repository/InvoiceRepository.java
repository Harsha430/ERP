package com.intern.erp.finance.repository;

import com.intern.erp.finance.model.Invoice;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface InvoiceRepository extends MongoRepository<Invoice,Long> {
}
