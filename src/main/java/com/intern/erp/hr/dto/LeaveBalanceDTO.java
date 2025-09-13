package com.intern.erp.hr.dto;

public class LeaveBalanceDTO {
    
    public static class LeaveTypeBalance {
        private Long total;
        private Long used;
        private Long remaining;
        
        public LeaveTypeBalance(Long total, Long used) {
            this.total = total;
            this.used = used;
            this.remaining = total - used;
        }
        
        // Getters and setters
        public Long getTotal() { return total; }
        public void setTotal(Long total) { this.total = total; }
        
        public Long getUsed() { return used; }
        public void setUsed(Long used) { this.used = used; }
        
        public Long getRemaining() { return remaining; }
        public void setRemaining(Long remaining) { this.remaining = remaining; }
    }
    
    private String employeeId;
    private String employeeName;
    private LeaveTypeBalance annualLeave;
    private LeaveTypeBalance sickLeave;
    private LeaveTypeBalance personalLeave;
    
    public LeaveBalanceDTO(String employeeId, String employeeName) {
        this.employeeId = employeeId;
        this.employeeName = employeeName;
        // Initialize with default values
        this.annualLeave = new LeaveTypeBalance(0L, 0L);
        this.sickLeave = new LeaveTypeBalance(0L, 0L);
        this.personalLeave = new LeaveTypeBalance(0L, 0L);
    }
    
    // Getters and setters
    public String getEmployeeId() { return employeeId; }
    public void setEmployeeId(String employeeId) { this.employeeId = employeeId; }
    
    public String getEmployeeName() { return employeeName; }
    public void setEmployeeName(String employeeName) { this.employeeName = employeeName; }
    
    public LeaveTypeBalance getAnnualLeave() { return annualLeave; }
    public void setAnnualLeave(LeaveTypeBalance annualLeave) { this.annualLeave = annualLeave; }
    
    public LeaveTypeBalance getSickLeave() { return sickLeave; }
    public void setSickLeave(LeaveTypeBalance sickLeave) { this.sickLeave = sickLeave; }
    
    public LeaveTypeBalance getPersonalLeave() { return personalLeave; }
    public void setPersonalLeave(LeaveTypeBalance personalLeave) { this.personalLeave = personalLeave; }
}