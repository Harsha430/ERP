package com.intern.erp.finance.service.impl;

import com.intern.erp.config.SequenceGeneratorService;
import com.intern.erp.finance.model.Account;
import com.intern.erp.finance.model.Expense;
import com.intern.erp.finance.repository.AccountRepository;
import com.intern.erp.finance.service.AccountingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class AccountingServiceImpl implements AccountingService {

    @Autowired
    private AccountRepository accountRepository;
    private SequenceGeneratorService sequenceGeneratorService;

    @Override
    public Account createAccount(Account account) {
        account.setId(sequenceGeneratorService.getSequenceNumber(Account.class.getSimpleName()));
        return accountRepository.save(account);
    }

    @Override
    public List<Account> getAllAccounts() {
        return accountRepository.findAll();
    }

    @Override
    public Account getAccountById(Long id) {
        Optional<Account> account = accountRepository.findById(id);
        return account.orElseThrow(() -> new RuntimeException("Account not found with id: " + id));
    }

    @Override
    public String deactivateAccount(Long id) {
        Account account = getAccountById(id);
        account.setIsActive(false);
        accountRepository.save(account);
        return "Account Deactivated";
    }
}
