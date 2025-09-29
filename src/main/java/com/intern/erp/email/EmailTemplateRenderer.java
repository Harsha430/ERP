package com.intern.erp.email;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.Map;

@Component
public class EmailTemplateRenderer {

    @Value("${app.company.name:Your Company}")
    private String companyName;

    public record RenderedEmail(String subject, String textBody, String htmlBody) {}

    public RenderedEmail render(EmailTemplate template, Map<String,Object> vars) {
        return switch (template) {
            case WELCOME -> welcome(vars);
            case ACCOUNT_DEBITED -> debit(vars);
            case ACCOUNT_CREDITED -> credit(vars);
            case PAYROLL_POSTED -> payroll(vars);
            case INVOICE_PAID -> invoicePaid(vars);
            case GENERIC -> generic(vars);
        };
    }

    private RenderedEmail welcome(Map<String,Object> v) {
        String username = str(v, "username", "User");
        String subject = "Welcome to " + companyName + ", " + username + "!";
        String text = "Hello " + username + "!\nYour account has been created at " + companyName + ".";
        String html = baseHtml("<p>Hello <strong>"+esc(username)+"</strong>!</p><p>Your account has been created at <strong>"+esc(companyName)+"</strong>.</p>");
        return new RenderedEmail(subject, text, html);
    }

    private RenderedEmail debit(Map<String,Object> v) {
        String account = str(v, "accountName", "Account");
        String amount = str(v, "amount", "0");
        String narration = str(v, "narration", "");
        String subject = "Debit Alert: " + account + " - " + amount;
        String text = "Your account '"+account+"' has been debited by "+amount+".\n"+narration;
        String html = baseHtml("<p>Your account '<strong>"+esc(account)+"</strong>' has been <span style='color:#b00020'>debited</span> by <strong>"+esc(amount)+"</strong>.</p><p>"+esc(narration)+"</p>");
        return new RenderedEmail(subject, text, html);
    }

    private RenderedEmail credit(Map<String,Object> v) {
        String account = str(v, "accountName", "Account");
        String amount = str(v, "amount", "0");
        String narration = str(v, "narration", "");
        String subject = "Credit Alert: " + account + " - " + amount;
        String text = "Your account '"+account+"' has been credited by "+amount+".\n"+narration;
        String html = baseHtml("<p>Your account '<strong>"+esc(account)+"</strong>' has been <span style='color:#0a7d00'>credited</span> by <strong>"+esc(amount)+"</strong>.</p><p>"+esc(narration)+"</p>");
        return new RenderedEmail(subject, text, html);
    }

    private RenderedEmail payroll(Map<String,Object> v) {
        String employee = str(v, "employeeName", "Employee");
        String net = str(v, "netSalary", "0");
        String date = str(v, "payDate", LocalDate.now().toString());
        String subject = "Payroll Posted: " + employee + " - " + net;
        String text = "Payroll processed for " + employee + " on " + date + ". Net: " + net;
        String html = baseHtml("<p>Payroll processed for <strong>"+esc(employee)+"</strong> on <strong>"+esc(date)+"</strong>.</p><p>Net Salary: <strong>"+esc(net)+"</strong></p>");
        return new RenderedEmail(subject, text, html);
    }

    private RenderedEmail invoicePaid(Map<String,Object> v) {
        String invoice = str(v, "invoiceNumber", "Invoice");
        String customer = str(v, "customerName", "Customer");
        String amount = str(v, "amount", "0");
        String subject = "Invoice Paid: " + invoice + " (" + customer + ")";
        String text = "Invoice " + invoice + " for customer " + customer + " has been marked PAID. Total: " + amount;
        String html = baseHtml("<p>Invoice <strong>"+esc(invoice)+"</strong> for <strong>"+esc(customer)+"</strong> is now <span style='color:#0a7d00'>PAID</span>.</p><p>Total Amount: <strong>"+esc(amount)+"</strong></p>");
        return new RenderedEmail(subject, text, html);
    }

    private RenderedEmail generic(Map<String,Object> v) {
        String subject = str(v, "subject", "Notification");
        String body = str(v, "body", "");
        String html = baseHtml("<p>"+esc(body)+"</p>");
        return new RenderedEmail(subject, body, html);
    }

    private String baseHtml(String inner) {
        return "<!DOCTYPE html><html><head><meta charset='UTF-8'><style>body{font-family:Arial,Helvetica,sans-serif;color:#222;} .footer{margin-top:24px;font-size:12px;color:#666}</style></head><body>" + inner + "<div class='footer'>"+esc(companyName)+" &copy; " + LocalDate.now().getYear() + "</div></body></html>";
    }

    private String str(Map<String,Object> v, String key, String def) {
        Object val = v.get(key);
        return val == null ? def : String.valueOf(val);
    }

    private String esc(String in) {
        return in == null ? "" : in.replace("&","&amp;").replace("<","&lt;").replace(">","&gt;");
    }
}

