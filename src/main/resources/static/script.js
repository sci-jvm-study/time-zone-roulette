/* =========================================================
   TIME ZONE ROULETTE
   ========================================================= */


/* =========================================================
   CONFIG
   ========================================================= */

const API_URL =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
        ? "http://localhost:8080/api/v1/time-slots/search"
        : "/api/v1/time-slots/search";

const MAX_PARTICIPANTS = 5;

/* =========================================================
   TIMEZONE DATA
   ========================================================= */

const TIMEZONES = [
    "Pacific/Midway",
    "Pacific/Honolulu",
    "America/Anchorage",

    "America/Los_Angeles",
    "America/Denver",
    "America/Chicago",
    "America/New_York",
    "America/Toronto",

    "America/Sao_Paulo",
    "America/Argentina/Buenos_Aires",

    "Atlantic/Reykjavik",
    "Europe/London",
    "Europe/Paris",
    "Europe/Berlin",
    "Europe/Madrid",
    "Europe/Rome",
    "Europe/Amsterdam",
    "Europe/Zurich",
    "Europe/Stockholm",
    "Europe/Warsaw",
    "Europe/Athens",
    "Europe/Helsinki",

    "Africa/Cairo",
    "Africa/Johannesburg",
    "Africa/Nairobi",

    "Asia/Dubai",
    "Asia/Kolkata",
    "Asia/Kathmandu",
    "Asia/Dhaka",
    "Asia/Colombo",
    "Asia/Bangkok",
    "Asia/Ho_Chi_Minh",
    "Asia/Singapore",
    "Asia/Kuala_Lumpur",
    "Asia/Hong_Kong",
    "Asia/Shanghai",
    "Asia/Taipei",
    "Asia/Manila",
    "Asia/Tokyo",
    "Asia/Seoul",

    "Australia/Perth",
    "Australia/Darwin",
    "Australia/Adelaide",
    "Australia/Brisbane",
    "Australia/Sydney",
    "Australia/Melbourne",

    "Pacific/Auckland"
];


/* =========================================================
   DOM
   ========================================================= */

const participantsContainer =
    document.getElementById("participants");

const addParticipantButton =
    document.getElementById("addParticipant");

const findSlotsButton =
    document.getElementById("findSlots");

const results =
    document.getElementById("results");

const slotList =
    document.getElementById("slotList");

const dateInput =
    document.getElementById("date");

const durationInput =
    document.getElementById("duration");

const formError =
    document.getElementById("formError");

/* =========================================================
   INIT
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
    setMinimumDate();
    populateAllTimezones();
    setupParticipantEvents();
    detectBrowserTimezone();
    updateParticipantNumbers();
    updateAddButton();
});


/* =========================================================
   DATE
   ========================================================= */

function setMinimumDate() {
    const today =
        getLocalDateString();
    dateInput.min = today;
    if (!dateInput.value) {
        dateInput.value = today;
    }
}

function getLocalDateString() {
    const now = new Date();
    const year =
        now.getFullYear();
    const month =
        String(now.getMonth() + 1)
            .padStart(2, "0");
    const day =
        String(now.getDate())
            .padStart(2, "0");
    return `${year}-${month}-${day}`;
}

/* =========================================================
   TIMEZONE SELECTORS
   ========================================================= */

function populateAllTimezones() {
    const selects =
        document.querySelectorAll(".timezone");
    selects.forEach(select => {
        populateTimezoneSelect(select);
    });
}

function populateTimezoneSelect(select) {
    const currentValue =
        select.value;
    select.innerHTML = "";
    const placeholder =
        document.createElement("option");
    placeholder.value = "";
    placeholder.textContent =
        "Select timezone";
    select.appendChild(placeholder);

    TIMEZONES.forEach(timeZone => {
        const option =
            document.createElement("option");
        option.value =
            timeZone;
        option.textContent =
            formatTimezoneName(timeZone);
        select.appendChild(option);
    });

    if (currentValue) {
        select.value = currentValue;
    }
}

/* =========================================================
   TIMEZONE DISPLAY
   ========================================================= */

function formatTimezoneName(timeZone) {
    const parts =
        timeZone.split("/");
    const region =
        parts[0];
    const city =
        parts
            .slice(1)
            .join(" / ")
            .replaceAll("_", " ");
    return `${region} · ${city}`;
}

function getTimezoneOffset(timeZone) {
    try {
        const date =
            new Date();
        const parts =
            new Intl.DateTimeFormat(
                "en-US",
                {
                    timeZone,
                    timeZoneName: "longOffset"
                }
            ).formatToParts(date);

        const offsetPart =
            parts.find(
                part =>
                    part.type === "timeZoneName"
            );

        if (!offsetPart) {
            return "UTC";
        }
        return offsetPart.value
            .replace("GMT", "UTC");

    } catch {
        return "";
    }
}

function updateTimezoneInfo(participant) {
    const select =
        participant.querySelector(".timezone");
    const info =
        participant.querySelector(".timezone-info");
    if (!select.value) {
        info.textContent =
            "Select a timezone";
        return;
    }

    const offset =
        getTimezoneOffset(select.value);
    info.textContent =
        `${offset} · ${formatTimezoneName(select.value)}`;
}

/* =========================================================
   AUTO DETECT BROWSER TIMEZONE
   ========================================================= */

function detectBrowserTimezone() {
    const firstParticipant =
        participantsContainer
            .querySelector(".participant");

    if (!firstParticipant) {
        return;
    }

    const select =
        firstParticipant
            .querySelector(".timezone");

    if (select.value) {
        return;
    }

    try {
        const detectedTimezone =
            Intl.DateTimeFormat()
                .resolvedOptions()
                .timeZone;

        if (
            detectedTimezone &&
            TIMEZONES.includes(detectedTimezone)
        ) {
            select.value =
                detectedTimezone;
            updateTimezoneInfo(
                firstParticipant
            );
            updateTimeline(
                firstParticipant
            );
        }

    } catch {
        // Browser timezone detection is optional.
    }
}


/* =========================================================
   PARTICIPANT EVENTS
   ========================================================= */

function setupParticipantEvents() {
    participantsContainer
        .addEventListener(
            "input",
            handleParticipantInput
        );

    participantsContainer
        .addEventListener(
            "change",
            handleParticipantChange
        );
}

function handleParticipantInput(event) {
    const participant =
        event.target.closest(".participant");

    if (!participant) {
        return;
    }

    if (
        event.target.classList.contains(
            "start-hour"
        ) ||
        event.target.classList.contains(
            "end-hour"
        )
    ) {

        updateTimeline(participant);

    }

    updateParticipantSubtitle(
        participant
    );
}


function handleParticipantChange(event) {
    const participant =
        event.target.closest(".participant");

    if (!participant) {
        return;
    }

    if (
        event.target.classList.contains(
            "timezone"
        )
    ) {
        updateTimezoneInfo(
            participant
        );

        updateParticipantSubtitle(
            participant
        );

    }

    if (
        event.target.classList.contains(
            "start-hour"
        ) ||
        event.target.classList.contains(
            "end-hour"
        )
    ) {
        updateTimeline(participant);
    }
}


/* =========================================================
   PARTICIPANT ADD
   ========================================================= */

addParticipantButton
    .addEventListener(
        "click",
        addParticipant
    );

function addParticipant() {
    const count =
        participantsContainer
            .querySelectorAll(".participant")
            .length;

    if (count >= MAX_PARTICIPANTS) {
        return;
    }

    const participant =
        createParticipant(count + 1);

    participantsContainer
        .appendChild(participant);

    populateTimezoneSelect(
        participant.querySelector(".timezone")
    );

    updateParticipantNumbers();
    updateAddButton();

    participant
        .querySelector(".name")
        .focus();

    participant.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });
}


function createParticipant(number) {
    const wrapper =
        document.createElement("div");

    wrapper.className =
        "participant";

    wrapper.innerHTML = `
        <div class="participant-header">
            <div class="participant-title">
                <span class="participant-index">
                    ${String(number).padStart(2, "0")}
                </span>
                <div>
                    <h3>
                        Participant ${number}
                    </h3>
                    <span class="participant-subtitle">
                        Add their timezone
                    </span>
                </div>
            </div>
        </div>

        <div class="form-grid">
            <label>
                Name
                <input
                    type="text"
                    class="name"
                    placeholder="Their name"
                    maxlength="50"
                    autocomplete="off"
                >
            </label>

            <label>
                Time zone
                <select class="timezone">
                    <option value="">
                        Select timezone
                    </option>
                </select>
                <span class="timezone-info">
                    Select a timezone
                </span>
            </label>
        </div>


        <div class="availability">
            <div class="availability-heading">
                <span class="availability-title">
                    Available
                </span>
                <span class="availability-description">
                    When can they meet?
                </span>
            </div>


            <div class="time-inputs">
                <label>
                    From
                    <input
                        type="number"
                        class="start-hour"
                        min="0"
                        max="23"
                        step="1"
                        value="8"
                    >
                </label>

                <span class="time-dash">
                    →
                </span>

                <label>
                    Until
                    <input
                        type="number"
                        class="end-hour"
                        min="0"
                        max="23"
                        step="1"
                        value="22"
                    >
                </label>
            </div>
        </div>


        <div class="timeline">
            <div class="timeline-labels">
                <span>00</span>
                <span>06</span>
                <span>12</span>
                <span>18</span>
                <span>24</span>
            </div>

            <div class="timeline-track">
                <div class="timeline-available"></div>
            </div>
        </div>
    `;
    return wrapper;
}

/* =========================================================
   PARTICIPANT NUMBERS
   ========================================================= */

function updateParticipantNumbers() {
    const participants =
        participantsContainer
            .querySelectorAll(".participant");

    participants.forEach(
        (participant, index) => {
            const number =
                index + 1;

            const numberText =
                String(number).padStart(2, "0");

            participant
                .querySelector(".participant-index")
                .textContent = numberText;

            participant
                .querySelector("h3")
                .textContent =
                `Participant ${number}`;

            updateParticipantSubtitle(
                participant
            );

            updateTimeline(
                participant
            );

        }
    );
}


function updateParticipantSubtitle(participant) {
    const name =
        participant
            .querySelector(".name")
            .value
            .trim();

    const subtitle =
        participant
            .querySelector(".participant-subtitle");

    const timezone =
        participant
            .querySelector(".timezone")
            .value;

    if (name && timezone) {
        subtitle.textContent =
            `${formatTimezoneName(timezone)}`;

    } else if (name) {
        subtitle.textContent =
            "Add their timezone";

    } else if (timezone) {
        subtitle.textContent =
            `${formatTimezoneName(timezone)}`;

    } else {
        subtitle.textContent =
            "Add your timezone";
    }
}

/* =========================================================
   ADD BUTTON STATE
   ========================================================= */

function updateAddButton() {

    const count =
        participantsContainer
            .querySelectorAll(".participant")
            .length;

    if (count >= MAX_PARTICIPANTS) {
        addParticipantButton
            .classList.add("hidden");

    } else {

        addParticipantButton
            .classList.remove("hidden");
    }
}


/* =========================================================
   TIMELINE
   ========================================================= */

function updateTimeline(participant) {
    const startInput =
        participant
            .querySelector(".start-hour");

    const endInput =
        participant
            .querySelector(".end-hour");

    const timeline =
        participant
            .querySelector(".timeline-available");

    let start =
        Number(startInput.value);

    let end =
        Number(endInput.value);

    if (
        Number.isNaN(start) ||
        Number.isNaN(end)
    ) {
        return;
    }

    start =
        Math.max(0, Math.min(23, start));
    end =
        Math.max(0, Math.min(24, end));

    if (end <= start) {
        timeline.style.left =
            `${(start / 24) * 100}%`;

        timeline.style.width =
            "0%";
        return;
    }

    const left =
        (start / 24) * 100;

    const width =
        ((end - start) / 24) * 100;

    timeline.style.left =
        `${left}%`;

    timeline.style.width =
        `${width}%`;
}


/* =========================================================
   VALIDATION
   ========================================================= */

function validateForm() {
    clearError();
    const participantElements =
        Array.from(
            participantsContainer
                .querySelectorAll(".participant")
        );

    if (
        participantElements.length < 2
    ) {
        showError(
            "Please add at least 2 people."
        );
        return false;
    }

    for (
        let i = 0;
        i < participantElements.length;
        i++
    ) {
        const participant =
            participantElements[i];

        const number =
            i + 1;

        const name =
            participant
                .querySelector(".name")
                .value
                .trim();

        const timezone =
            participant
                .querySelector(".timezone")
                .value;

        const start =
            Number(
                participant
                    .querySelector(".start-hour")
                    .value
            );

        const end =
            Number(
                participant
                    .querySelector(".end-hour")
                    .value
            );

        if (!name) {
            showError(
                `Please enter a name for participant ${number}.`
            );

            participant
                .querySelector(".name")
                .focus();

            return false;
        }


        if (!timezone) {
            showError(
                `Please select a timezone for ${name}.`
            );

            participant
                .querySelector(".timezone")
                .focus();

            return false;
        }


        if (
            Number.isNaN(start) ||
            Number.isNaN(end) ||
            start < 0 ||
            start > 23 ||
            end < 0 ||
            end > 23 ||
            start >= end
        ) {
            showError(
                `${name}'s availability must have a valid start and end time.`
            );

            return false;
        }
    }


    if (!dateInput.value) {
        showError(
            "Please choose a meeting date."
        );

        dateInput.focus();

        return false;
    }


    if (
        dateInput.value <
        dateInput.min
    ) {

        showError(
            "The meeting date cannot be in the past."
        );

        dateInput.focus();

        return false;
    }


    const duration =
        Number(durationInput.value);

    if (
        !duration ||
        duration < 15 ||
        duration > 240 ||
        duration % 15 !== 0
    ) {
        showError(
            "Please select a valid meeting duration."
        );

        return false;
    }

    return true;
}


/* =========================================================
   ERROR UI
   ========================================================= */

function showError(message) {
    formError.textContent =
        message;

    formError.classList.remove(
        "hidden"
    );
}


function clearError() {
    formError.textContent = "";

    formError.classList.add(
        "hidden"
    );
}


/* =========================================================
   API REQUEST
   ========================================================= */

findSlotsButton
    .addEventListener(
        "click",
        findSlots
    );


async function findSlots() {
    if (!validateForm()) {
        return;
    }

    setLoading(true);

    results.classList.add(
        "hidden"
    );

    slotList.innerHTML = "";

    try {
        const requestBody =
            buildRequest();

        const response =
            await fetch(
                API_URL,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(
                            requestBody
                        )
                }
            );


        let data = null;

        try {
            data = await response.json();
        } catch {
            data = null;
        }


        if (!response.ok) {
            throw new Error(
                getApiErrorMessage(data)
            );
        }

        if (window.umami) {
            umami.track("find-slots-success");
        }

        renderResults(data);

    } catch (error) {
        console.error(error);

        showError(
            error.message ||
            "Something went wrong. Please try again."
        );

    } finally {
        setLoading(false);
    }
}


/* =========================================================
   REQUEST BUILDER
   ========================================================= */

function buildRequest() {
    const participantElements =
        Array.from(
            participantsContainer
                .querySelectorAll(".participant")
        );


    const participants =
        participantElements.map(
            participant => {
                return {
                    name:
                        participant
                            .querySelector(".name")
                            .value
                            .trim(),

                    timeZone:
                        participant
                            .querySelector(".timezone")
                            .value,

                    startHour:
                        Number(
                            participant
                                .querySelector(".start-hour")
                                .value
                        ),

                    endHour:
                        Number(
                            participant
                                .querySelector(".end-hour")
                                .value
                        )
                };
            }
        );


    return {
        participants,
        date: dateInput.value,
        durationMinutes:
            Number(durationInput.value)
    };
}


/* =========================================================
   API ERROR
   ========================================================= */

function getApiErrorMessage(data) {
    if (!data) {
        return "The server returned an unexpected response.";
    }

    if (data.error) {
        return data.error;
    }

    if (data.errors) {
        const messages =
            Object.values(data.errors);

        if (messages.length) {
            return messages.join(" ");
        }
    }

    return "Something went wrong while finding your meeting time.";
}


/* =========================================================
   LOADING
   ========================================================= */

function setLoading(isLoading) {
    findSlotsButton.disabled =
        isLoading;

    const text =
        findSlotsButton
            .querySelector(".find-button-text");

    const arrow =
        findSlotsButton
            .querySelector(".find-button-arrow");

    if (isLoading) {
        text.textContent =
            "Finding the sweet spot…";

        arrow.textContent =
            "·";

    } else {
        text.textContent =
            "Find the sweet spot";

        arrow.textContent =
            "→";
    }
}


/* =========================================================
   RESULTS
   ========================================================= */

function renderResults(data) {
    results.classList.remove(
        "hidden"
    );

    const slots =
        data.bestSlots || [];

    if (!slots.length) {
        slotList.innerHTML = `
            <div class="no-results">
                No overlap found.
                <div class="no-results-small">
                    Try widening everyone's availability
                    or choosing another date.
                </div>
            </div>

        `;

        results.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

        return;
    }


    slotList.innerHTML =
        slots
            .map(
                (slot, index) =>
                    renderSlot(
                        slot,
                        index,
                        data.durationMinutes
                    )
            )
            .join("");


    results.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}


/* =========================================================
   SLOT CARD
   ========================================================= */

function renderSlot(
    slot,
    index,
    durationMinutes
) {

    const isBest =
        index === 0;

    const rank =
        String(index + 1)
            .padStart(2, "0");


    const start =
        new Date(slot.start);

    const end =
        new Date(slot.end);


    const primaryTime =
        formatUtcTime(start, end);

    const date =
        formatDate(start);


    const participantTimes =
        (slot.participantTimes || [])
            .map(
                participant =>
                    renderParticipantTime(
                        participant,
                        start,
                        end
                    )
            )
            .join("");


    return `

        <article
            class="slot-card ${isBest ? "best" : ""}"
        >

            ${
                isBest
                    ? `
                        <span class="best-badge">
                            BEST MATCH
                        </span>
                      `
                    : ""
            }


            <div class="slot-rank">
                ${rank}
            </div>


            <div>

                <div class="slot-time">
                    ${escapeHtml(primaryTime)}
                </div>

                <div class="slot-date">
                    ${escapeHtml(date)}
                    ·
                    ${durationMinutes} MIN
                </div>

            </div>


            <div class="slot-score">

                <div class="score-number">
                    ${escapeHtml(String(slot.score))}
                </div>

                <div class="score-label">
                    COMFORT
                </div>

            </div>


            <div class="participant-times">
                ${participantTimes}
            </div>

        </article>

    `;
}


/* =========================================================
   PARTICIPANT LOCAL TIME
   ========================================================= */

function renderParticipantTime(
    participant,
    fallbackStart,
    fallbackEnd
) {

    let start;
    let end;

    if (
        participant.start &&
        participant.end
    ) {
        start =
            new Date(participant.start);

        end =
            new Date(participant.end);

    } else {
        start =
            fallbackStart;

        end =
            fallbackEnd;
    }


    const timezone =
        participant.timeZone;


    const time =
        formatTimeForTimezone(
            start,
            end,
            timezone
        );


    return `
        <div class="local-time">
            <div class="local-time-name">
                ${escapeHtml(
                    participant.name || "Participant"
                )}
            </div>

            <div class="local-time-value">
                ${escapeHtml(time)}
            </div>
        </div>
    `;
}


/* =========================================================
   DATE / TIME FORMATTERS
   ========================================================= */

function formatUtcTime(start, end) {
    const startText =
        new Intl.DateTimeFormat(
            "en-US",
            {
                hour: "numeric",
                minute: "2-digit",
                hour12: false,
                timeZone: "UTC"
            }
        ).format(start);

    const endText =
        new Intl.DateTimeFormat(
            "en-US",
            {
                hour: "numeric",
                minute: "2-digit",
                hour12: false,
                timeZone: "UTC"
            }
        ).format(end);

    return `${startText}–${endText} UTC`;
}


function formatDate(date) {

    return new Intl.DateTimeFormat(
        "en-US",
        {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric",
            timeZone: "UTC"
        }
    ).format(date);
}


function formatTimeForTimezone(
    start,
    end,
    timezone
) {

    try {
        const formatter =
            new Intl.DateTimeFormat(
                "en-US",
                {
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                    timeZone: timezone
                }
            );

        return `${formatter.format(start)}–${formatter.format(end)}`;
    } catch {
        return "Time unavailable";
    }
}


/* =========================================================
   HTML ESCAPE
   ========================================================= */

function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}