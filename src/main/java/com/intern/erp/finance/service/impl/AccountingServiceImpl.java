package com.intern.erp.finance.service.impl;


import com.intern.erp.finance.model.Account;
import com.intern.erp.finance.model.JournalEntry;
import com.intern.erp.finance.model.LedgerEntry;
import com.intern.erp.finance.service.AccountingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AccountingServiceImpl implements AccountingService {


    @Autowired
    private  AccountingService accountingService;
    @Override
    public Account createAccount(Account account) {
        return accountingService.createAccount(account);
    }

    @Override
    public List<Account> getAllAccounts() {
        return accountingService.getAllAccounts();
    }

    @Override
    public Account getAccountById(Long id) {
        return accountingService.getAccountById(id);
    }

    @Override
    public String deactivateAccount(Long id) {
        Account acc = accountingService.getAccountById(id);
        acc.setIsActive(false);
        return "Account DeActivated";
    }


}
