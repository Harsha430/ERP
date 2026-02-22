package com.intern.erp.security;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Collection;

@Component
public class ResponseLoggingFilter implements Filter {

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        
        chain.doFilter(request, response);
        
        if (response instanceof HttpServletResponse httpResponse) {
            String path = ((jakarta.servlet.http.HttpServletRequest) request).getRequestURI();
            if (path.contains("/auth/login")) {
                System.out.println("DEBUG: Outgoing headers for " + path + ":");
                Collection<String> headerNames = httpResponse.getHeaderNames();
                for (String headerName : headerNames) {
                    System.out.println("DEBUG: Response Header: " + headerName + " = " + httpResponse.getHeader(headerName));
                }
            }
        }
    }
}
