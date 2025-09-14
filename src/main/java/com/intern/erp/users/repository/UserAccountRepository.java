package com.intern.erp.users.repository;

import com.intern.erp.users.model.UserAccount;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface UserAccountRepository extends MongoRepository<UserAccount, Long> {
    Optional<UserAccount> findByUsername(String username);
    Optional<UserAccount> findByEmail(String email); // new method
}
