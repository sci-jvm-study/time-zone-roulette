package com.timezoneroulette.time_zone_roulette.Dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;

import java.time.LocalDate;
import java.util.List;

public record TimeSlotRequest(
        @NotEmpty(message = "At least 2 participants are required")
        @Size(
                min = 2,
                max = 5,
                message = "Participants must be between 2 and 5"
        )
        List<@Valid ParticipantRequest> participants,
        @NotNull(message = "Date is required")
        LocalDate date,
        @Min(value = 15, message = "Duration must be at least 15 minutes")
        @Max(value = 240, message = "Duration cannot exceed 240 minutes")
        int durationMinutes
) {
        public boolean hasValidDuration() {
                return durationMinutes % 15 == 0;
        }
}
