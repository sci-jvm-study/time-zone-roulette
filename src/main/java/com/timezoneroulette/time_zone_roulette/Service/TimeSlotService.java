package com.timezoneroulette.time_zone_roulette.Service;

import com.timezoneroulette.time_zone_roulette.Dto.ParticipantRequest;
import com.timezoneroulette.time_zone_roulette.Dto.ParticipantTime;
import com.timezoneroulette.time_zone_roulette.Dto.SlotResponse;
import com.timezoneroulette.time_zone_roulette.Dto.TimeSlotRequest;
import com.timezoneroulette.time_zone_roulette.Dto.TimeSlotResponse;
import com.timezoneroulette.time_zone_roulette.Model.AvailabilityInterval;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
public class TimeSlotService {

    private final AvailabilityService availabilityService;
    private final SlotScoringService slotScoringService;

    public TimeSlotService(
            AvailabilityService availabilityService,
            SlotScoringService slotScoringService
    ) {
        this.availabilityService = availabilityService;
        this.slotScoringService = slotScoringService;
    }

    private void validateRequest(TimeSlotRequest request) {
        if (!request.hasValidDuration()) {
            throw new IllegalArgumentException(
                    "Duration must be a multiple of 15 minutes"
            );
        }
        if (request.date().isBefore(java.time.LocalDate.now())) {
            throw new IllegalArgumentException(
                    "Date cannot be in the past"
            );
        }
        for (ParticipantRequest participant : request.participants()) {
            if (!participant.hasValidHours()) {
                throw new IllegalArgumentException(
                        "Start hour must be before end hour for participant: "
                                + participant.name()
                );
            }
            try {
                java.time.ZoneId.of(participant.timeZone());
            } catch (java.time.DateTimeException exception) {
                throw new IllegalArgumentException(
                        "Invalid time zone: " + participant.timeZone()
                );
            }
        }
    }

    public TimeSlotResponse findBestSlots(TimeSlotRequest timeSlotRequest) {
        validateRequest(timeSlotRequest);
        List<AvailabilityInterval> intervals = new ArrayList<>();
        for (ParticipantRequest participant : timeSlotRequest.participants()) {
            AvailabilityInterval interval =
                    availabilityService.getAvailability(
                            participant,
                            timeSlotRequest.date()
                    );
            intervals.add(interval);
        }
        AvailabilityInterval commonAvailability =
                findCommonAvailability(intervals);
        if (commonAvailability == null) {
            return new TimeSlotResponse(
                    timeSlotRequest.date(),
                    timeSlotRequest.durationMinutes(),
                    List.of()
            );
        }

        List<AvailabilityInterval> slots =
                generateSlots(
                        commonAvailability,
                        timeSlotRequest.durationMinutes()
                );
        List<SlotResponse> slotResponses = new ArrayList<>();
        for (AvailabilityInterval slot : slots) {
            int score = slotScoringService.calculateScore(
                    slot,
                    timeSlotRequest.participants()
            );
            List<ParticipantTime> participantTimes =
                    createParticipantTimes(
                            slot,
                            timeSlotRequest.participants()
                    );
            SlotResponse slotResponse = new SlotResponse(
                    score,
                    slot.start(),
                    slot.end(),
                    participantTimes
            );
            slotResponses.add(slotResponse);
        }
        slotResponses.sort(
                Comparator.comparingInt(SlotResponse::score).reversed()
        );
        List<SlotResponse> bestSlots =
                slotResponses.stream()
                        .limit(5)
                        .toList();
        return new TimeSlotResponse(
                timeSlotRequest.date(),
                timeSlotRequest.durationMinutes(),
                bestSlots
        );
    }

    private AvailabilityInterval findOverlap(
            AvailabilityInterval first,
            AvailabilityInterval second
    ) {
        Instant start = first.start().isAfter(second.start())
                ? first.start()
                : second.start();
        Instant end = first.end().isBefore(second.end())
                ? first.end()
                : second.end();
        if (!start.isBefore(end)) {
            return null;
        }
        return new AvailabilityInterval(start, end);
    }

    private AvailabilityInterval findCommonAvailability(
            List<AvailabilityInterval> intervals
    ) {
        AvailabilityInterval common = intervals.get(0);
        for (int i = 1; i < intervals.size(); i++) {
            common = findOverlap(
                    common,
                    intervals.get(i)
            );
            if (common == null) {
                return null;
            }
        }
        return common;
    }

    private List<AvailabilityInterval> generateSlots(
            AvailabilityInterval availability,
            int durationMinutes
    ) {
        List<AvailabilityInterval> slots = new ArrayList<>();
        Duration duration = Duration.ofMinutes(durationMinutes);
        Duration step = Duration.ofMinutes(30);
        Instant current = availability.start();
        while (!current.plus(duration).isAfter(availability.end())) {
            Instant slotEnd = current.plus(duration);
            slots.add(
                    new AvailabilityInterval(
                            current,
                            slotEnd
                    )
            );
            current = current.plus(step);
        }
        return slots;
    }

    private List<ParticipantTime> createParticipantTimes(
            AvailabilityInterval slot,
            List<ParticipantRequest> participants
    ) {
        List<ParticipantTime> participantTimes = new ArrayList<>();

        for (ParticipantRequest participant : participants) {

            ZoneId zoneId = ZoneId.of(participant.timeZone());

            ZonedDateTime localStart =
                    slot.start().atZone(zoneId);

            ZonedDateTime localEnd =
                    slot.end().atZone(zoneId);

            participantTimes.add(
                    new ParticipantTime(
                            participant.name(),
                            participant.timeZone(),
                            localStart,
                            localEnd
                    )
            );
        }

        return participantTimes;
    }
}