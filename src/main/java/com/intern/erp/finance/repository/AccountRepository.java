package com.intern.erp.finance.repository;

import com.intern.erp.finance.model.Account;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface AccountRepository extends MongoRepository<Account,Long> {
}
