package com.invoicepro.dto.response;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class CustomerResponse {
    private Long id;
    private String name;
    private String email;
    private String phone;
    private String address;
    private String gstNumber;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
