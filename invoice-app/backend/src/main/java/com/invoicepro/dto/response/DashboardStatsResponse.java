package com.invoicepro.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
public class DashboardStatsResponse {
    private long totalInvoices;
    private BigDecimal totalRevenue;
    private BigDecimal pendingAmount;
    private long totalCustomers;
    private List<InvoiceResponse> recentInvoices;
    private List<MonthlyRevenue> revenueByMonth;
    private List<StatusDistribution> statusDistribution;

    @Data
    @Builder
    public static class MonthlyRevenue {
        private String month;
        private BigDecimal revenue;
    }

    @Data
    @Builder
    public static class StatusDistribution {
        private String status;
        private long count;
    }
}
