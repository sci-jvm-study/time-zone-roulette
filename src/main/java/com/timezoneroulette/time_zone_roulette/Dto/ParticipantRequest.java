package com.timezoneroulette.time_zone_roulette.Dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public record ParticipantRequest (
        @NotBlank(message = "Name is required")
        String name,
        @NotBlank(message = "Time zone is required")
        String timeZone,
        @Min(value = 0, message = "Start hour must be between 0 and 23")
        @Max(value = 23, message = "Start hour must be between 0 and 23")
        int startHour,
        @Min(value = 0, message = "End hour must be between 0 and 23")
        @Max(value = 23, message = "End hour must be between 0 and 23")
        int endHour
){
        public boolean hasValidHours() {
                return startHour < endHour;
        }
}
