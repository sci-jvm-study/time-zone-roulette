package com.timezoneroulette.time_zone_roulette.Controller;

import com.timezoneroulette.time_zone_roulette.Dto.TimeSlotRequest;
import com.timezoneroulette.time_zone_roulette.Dto.TimeSlotResponse;
import com.timezoneroulette.time_zone_roulette.Service.TimeSlotService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/time-slots")
@CrossOrigin(origins = "http://localhost:5500")
public class TimeSlotController {
    private final TimeSlotService timeSlotService;

    public TimeSlotController(TimeSlotService timeSlotService) {
        this.timeSlotService = timeSlotService;
    }

    @PostMapping("/search")
    public TimeSlotResponse search(
            @Valid @RequestBody TimeSlotRequest timeSlotRequest
    ) {
        return timeSlotService.findBestSlots(timeSlotRequest);
    }
}
