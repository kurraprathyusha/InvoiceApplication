package com.invoicepro.controller;

import com.invoicepro.dto.request.PasswordChangeRequest;
import com.invoicepro.dto.request.ProfileRequest;
import com.invoicepro.dto.response.UserResponse;
import com.invoicepro.service.ProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth") // Auth routes per requirements
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;

    @PutMapping("/profile")
    public ResponseEntity<UserResponse> updateProfile(@Valid @RequestBody ProfileRequest request,
                                                      @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(profileService.updateProfile(request, userDetails.getUsername()));
    }

    @PutMapping("/change-password")
    public ResponseEntity<Void> changePassword(@Valid @RequestBody PasswordChangeRequest request,
                                               @AuthenticationPrincipal UserDetails userDetails) {
        profileService.changePassword(request, userDetails.getUsername());
        return ResponseEntity.ok().build();
    }
}
