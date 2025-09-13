package com.intern.erp.hr.service;

import com.intern.erp.hr.dto.LeaveBalanceDTO;
import com.intern.erp.hr.model.Employee;
import com.intern.erp.hr.model.LeaveBalance;
import com.intern.erp.hr.model.enums.LeaveType;
import com.intern.erp.hr.repository.EmployeeRepository;
import com.intern.erp.hr.repository.LeaveBalanceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class LeaveBalanceService {
    
    @Autowired
    private LeaveBalanceRepository leaveBalanceRepository;
    
    @Autowired
    private EmployeeRepository employeeRepository;
    
    public List<LeaveBalance> getAllLeaveBalances() {
        return leaveBalanceRepository.findAll();
    }
    
    public List<LeaveBalanceDTO> getAggregatedLeaveBalances() {
        List<LeaveBalance> allBalances = leaveBalanceRepository.findAll();
        List<Employee> allEmployees = employeeRepository.findAll();
        
        // Group leave balances by employee ID (using MongoDB ObjectId as key)
        Map<String, List<LeaveBalance>> balancesByEmployee = allBalances.stream()
                .collect(Collectors.groupingBy(LeaveBalance::getEmployeeId));
        
        // Create DTO for each employee
        return allEmployees.stream().map(employee -> {
            LeaveBalanceDTO dto = new LeaveBalanceDTO(employee.getEmployeeId(), 
                    employee.getFirstName() + " " + employee.getLastName());
            
            // Use employee's MongoDB id to find leave balances
            List<LeaveBalance> employeeBalances = balancesByEmployee.get(employee.getId());
            if (employeeBalances != null) {
                for (LeaveBalance balance : employeeBalances) {
                    LeaveBalanceDTO.LeaveTypeBalance typeBalance = 
                            new LeaveBalanceDTO.LeaveTypeBalance(balance.getTotalDays(), balance.getUsedDays());
                    
                    switch (balance.getLeaveType()) {
                        case ANNUAL:
                            dto.setAnnualLeave(typeBalance);
                            break;
                        case SICK:
                            dto.setSickLeave(typeBalance);
                            break;
                        case PERSONAL:
                            dto.setPersonalLeave(typeBalance);
                            break;
                        default:
                            // Handle other leave types if needed
                            break;
                    }
                }
            }
            return dto;
        }).collect(Collectors.toList());
    }
    
    public Optional<LeaveBalance> getLeaveBalanceById(String id) {
        return leaveBalanceRepository.findById(id);
    }
    
    public List<LeaveBalance> getLeaveBalancesByEmployeeId(String employeeId) {
        return leaveBalanceRepository.findByEmployeeId(employeeId);
    }
    
    public LeaveBalance saveLeaveBalance(LeaveBalance leaveBalance) {
        return leaveBalanceRepository.save(leaveBalance);
    }
    
    public void deleteLeaveBalance(String id) {
        leaveBalanceRepository.deleteById(id);
    }
}