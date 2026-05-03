package com.invoicepro.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ProfileRequest {
    @NotBlank(message = "Name is required")
    private String name;
    
    private String phone;
    private String companyName;
    private String address;
}
