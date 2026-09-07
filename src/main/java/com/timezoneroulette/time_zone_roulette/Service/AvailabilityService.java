package com.timezoneroulette.time_zone_roulette.Service;

import com.timezoneroulette.time_zone_roulette.Dto.ParticipantRequest;
import com.timezoneroulette.time_zone_roulette.Model.AvailabilityInterval;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;

@Service
public class AvailabilityService {

    public AvailabilityInterval getAvailability(
            ParticipantRequest participant,
            LocalDate date
    ){
        ZoneId zoneId = ZoneId.of(participant.timeZone());
        ZonedDateTime start = ZonedDateTime.of(
                date,
                LocalTime.of(participant.startHour(), 0),
                zoneId
        );
        ZonedDateTime end = ZonedDateTime.of(
                date,
                LocalTime.of(participant.endHour(), 0),
                zoneId
        );
        return new AvailabilityInterval(
                start.toInstant(),
                end.toInstant()
        );
    }
}
