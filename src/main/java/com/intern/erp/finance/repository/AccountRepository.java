package com.intern.erp.finance.repository;

import com.intern.erp.finance.model.Account;
import com.intern.erp.finance.model.enums.AccountType;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AccountRepository extends MongoRepository<Account,Long> {
    
    Optional<Account> findByName(String name);
    
    List<Account> findByType(AccountType type);
    
    Optional<Account> findByCode(String code);
}
