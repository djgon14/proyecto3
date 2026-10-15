/* =========================================
   AMBIENTES DEL COLEGIO
========================================= */

const rooms = [

    {
        id: "cancha-secundaria",
        name: "Cancha de Secundaria",
        type: "Deportivo",
        capacity: 80,
        image: "imag",
        description:
            "Cancha destinada a las actividades deportivas de secundaria."
    },

    {
        id: "cancha-primaria-1",
        name: "Cancha de Primaria 1",
        type: "Deportivo",
        capacity: 60,
        image: "cancha1.jpeg",
        description:
            "Primera cancha destinada a las actividades de primaria."
    },

    {
        id: "cancha-primaria-2",
        name: "Cancha de Primaria 2",
        type: "Deportivo",
        capacity: 60,
        image: "cancha2.jpeg",
        description:
            "Segunda cancha destinada a las actividades de primaria."
    },

    {
        id: "coliseo",
        name: "Coliseo",
        type: "Deportivo / Eventos",
        capacity: 500,
        image: "coliseo.jpeg",
        description:
            "Espacio amplio para eventos, deportes y actividades institucionales."
    },

    {
        id: "templo",
        name: "Templo",
        type: "Institucional",
        capacity: 450,
        image: "templo.jpeg",
        description:
            "Espacio destinado a celebraciones y actividades institucionales."
    },

    {
        id: "computacion-1",
        name: "Laboratorio de Computación 1",
        type: "Académico",
        capacity: 50,
        image: "curso1.jpeg",
        description:
            "Aula equipada para clases de computación y tecnología."
    },

    {
        id: "computacion-2",
        name: "Laboratorio de Computación 2",
        type: "Académico",
        capacity: 50,
        image: "curso2.jpeg",
        description:
            "Segunda aula para clases de computación y tecnología."
    },

    {
        id: "teatro",
        name: "Teatro",
        type: "Cultural / Eventos",
        capacity: 250,
        image: "teatro.jpeg",
        description:
            "Espacio para obras, presentaciones, ensayos y actos."
    },

    {
        id: "laboratorio-ciencias",
        name: "Laboratorio de Ciencias",
        type: "Química / Biología",
        capacity: 40,
        image: "laboratorio.jpeg",
        description:
            "Laboratorio utilizado para prácticas de química y biología."
    }

];


/* =========================================
   HORARIOS
========================================= */

const times = [];

for (let hour = 7; hour <= 19; hour++) {

    times.push(
        String(hour).padStart(2, "0") + ":00"
    );

    if (hour < 19) {

        times.push(
            String(hour).padStart(2, "0") + ":30"
        );

    }

}


/* =========================================
   ADMINISTRADORES
========================================= */

const administrators = [

    {
        username: "admin1",
        password: "donbosco1"
    },

    {
        username: "admin2",
        password: "donbosco2"
    }

];


/* =========================================
   VARIABLES
========================================= */

let selectedRoom = null;

let selectedDate = null;

let selectedStart = null;

let selectedEnd = null;

let currentMonth = new Date();

currentMonth.setDate(1);

let loggedUser =
    localStorage.getItem("don_bosco_user") || "";


/* =========================================
   FUNCIONES BÁSICAS
========================================= */

function getReservations() {

    return JSON.parse(
        localStorage.getItem(
            "don_bosco_reservations"
        ) || "[]"
    );

}


function saveReservations(reservations) {

    localStorage.setItem(
        "don_bosco_reservations",
        JSON.stringify(reservations)
    );

}


function getElement(id) {

    return document.getElementById(id);

}


/* =========================================
   FECHAS
========================================= */

function dateKey(date) {

    return (
        date.getFullYear() +
        "-" +
        String(date.getMonth() + 1).padStart(2, "0") +
        "-" +
        String(date.getDate()).padStart(2, "0")
    );

}


function formatDate(dateString) {

    if (!dateString) {

        return "—";

    }

    const [
        year,
        month,
        day
    ] = dateString.split("-").map(Number);


    return new Intl.DateTimeFormat(
        "es-BO",
        {
            weekday: "long",
            day: "2-digit",
            month: "long",
            year: "numeric"
        }
    ).format(
        new Date(
            year,
            month - 1,
            day
        )
    );

}


/* =========================================
   MINUTOS
========================================= */

function minutes(time) {

    const [
        hour,
        minute
    ] = time.split(":").map(Number);

    return hour * 60 + minute;

}


/* =========================================
   COMPROBAR CRUCE DE HORARIOS
========================================= */

function overlaps(
    start1,
    end1,
    start2,
    end2
) {

    return (
        minutes(start1) < minutes(end2) &&
        minutes(end1) > minutes(start2)
    );

}


/* =========================================
   COMPROBAR RESERVA
========================================= */

function hasConflict(
    roomId,
    date,
    start,
    end,
    ignoredId = ""
) {

    return getReservations().some(
        reservation => {

            return (

                reservation.roomId === roomId &&

                reservation.date === date &&

                reservation.id !== ignoredId &&

                overlaps(
                    start,
                    end,
                    reservation.start,
                    reservation.end
                )

            );

        }
    );

}


/* =========================================
   MENSAJE
========================================= */

function showToast(message) {

    const toast =
        getElement("toast");

    toast.textContent =
        message;

    toast.classList.add("show");


    setTimeout(() => {

        toast.classList.remove("show");

    }, 2800);

}


/* =========================================
   CREAR HORARIOS
========================================= */

function fillTimeSelectors() {

    const options =
        times.map(
            time =>
                `<option value="${time}">
                    ${time}
                </option>`
        ).join("");


    getElement("startTime")
        .innerHTML = options;

    getElement("endTime")
        .innerHTML = options;

    getElement("editStart")
        .innerHTML = options;

    getElement("editEnd")
        .innerHTML = options;


    getElement("startTime")
        .value = "08:00";

    getElement("endTime")
        .value = "09:00";

}


/* =========================================
   MOSTRAR AMBIENTES
========================================= */

function renderRooms() {

    const container =
        getElement("roomsGrid");


    container.innerHTML =
        rooms.map(room => {

            return `

                <article
                    class="room-card
                    ${selectedRoom &&
                    selectedRoom.id === room.id
                    ? "selected"
                    : ""}"
                    data-room="${room.id}">

                    <div class="room-image">
                        <img src="${room.image}" alt="${room.name}">
                    </div>

                    <div class="room-info">

                        <h3>
                            ${room.name}
                        </h3>

                        <p>
                            ${room.description}
                        </p>

                        <div class="room-meta">

                            <span>
                                ${room.type}
                            </span>

                            <span>
                                ${room.capacity}
                                personas
                            </span>

                        </div>

                    </div>

                </article>

            `;

        }).join("");


    document
        .querySelectorAll(".room-card")
        .forEach(card => {

            card.addEventListener(
                "click",
                () => {

                    selectedRoom =
                        rooms.find(
                            room =>
                                room.id ===
                                card.dataset.room
                        );


                    selectedStart = null;

                    selectedEnd = null;


                    updateRoomInfo();

                    renderRooms();

                    renderCalendar();

                    renderTimes();

                    updateSummary();


                    getElement(
                        "booking-section"
                    )?.scrollIntoView({
                        behavior: "smooth"
                    });

                }
            );

        });

}


/* =========================================
   INFORMACIÓN AMBIENTE
========================================= */

function updateRoomInfo() {

    if (!selectedRoom) {

        return;

    }


    getElement(
        "selectedRoomName"
    ).textContent =
        selectedRoom.name;


    getElement(
        "selectedRoomDescription"
    ).textContent =
        selectedRoom.description;


    getElement(
        "roomCapacity"
    ).textContent =
        selectedRoom.capacity +
        " personas";


    getElement(
        "roomType"
    ).textContent =
        selectedRoom.type;

}


/* =========================================
   CALENDARIO
========================================= */

function renderCalendar() {

    const year =
        currentMonth.getFullYear();

    const month =
        currentMonth.getMonth();


    const firstDay =
        new Date(
            year,
            month,
            1
        );


    const daysInMonth =
        new Date(
            year,
            month + 1,
            0
        ).getDate();


    let startingDay =
        firstDay.getDay();


    startingDay =
        startingDay === 0
            ? 6
            : startingDay - 1;


    getElement(
        "monthLabel"
    ).textContent =
        new Intl.DateTimeFormat(
            "es-BO",
            {
                month: "long",
                year: "numeric"
            }
        ).format(currentMonth);


    let html = `

        <div class="calendar-grid">

            <div class="weekday">L</div>
            <div class="weekday">M</div>
            <div class="weekday">X</div>
            <div class="weekday">J</div>
            <div class="weekday">V</div>
            <div class="weekday">S</div>
            <div class="weekday">D</div>

    `;


    for (
        let i = 0;
        i < startingDay;
        i++
    ) {

        html += `
            <div class="day empty"></div>
        `;

    }


    for (
        let day = 1;
        day <= daysInMonth;
        day++
    ) {

        const date =
            new Date(
                year,
                month,
                day
            );


        const key =
            dateKey(date);


        let reservationClass =
            "";


        if (selectedRoom) {

            const reserved =
                getReservations().some(
                    reservation =>
                        reservation.roomId ===
                        selectedRoom.id &&
                        reservation.date === key
                );


            if (reserved) {

                reservationClass =
                    "has-reservation";

            }

        }


        html += `

            <button
                class="day
                ${reservationClass}
                ${selectedDate === key
                    ? "selected"
                    : ""}"
                data-date="${key}">

                ${day}

            </button>

        `;

    }


    html += `
        </div>
    `;


    getElement(
        "calendar"
    ).innerHTML = html;


    document
        .querySelectorAll(".day:not(.empty)")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    selectedDate =
                        button.dataset.date;


                    selectedStart = null;

                    selectedEnd = null;


                    renderCalendar();

                    renderTimes();

                    updateSummary();

                }
            );

        });

}


/* =========================================
   MOSTRAR HORARIOS
========================================= */

function renderTimes() {

    const container =
        getElement("times");


    if (
        !selectedRoom ||
        !selectedDate
    ) {

        container.innerHTML = `

            <div class="empty-state">

                Primero selecciona
                un ambiente y una fecha.

            </div>

        `;

        return;

    }


    getElement(
        "dateLabel"
    ).textContent =
        formatDate(selectedDate);


    container.innerHTML =
        times.map(time => {

            const reserved =
                getReservations().some(
                    reservation =>

                        reservation.roomId ===
                        selectedRoom.id &&

                        reservation.date ===
                        selectedDate &&

                        minutes(time) >=
                        minutes(reservation.start) &&

                        minutes(time) <
                        minutes(reservation.end)
                );


            return `

                <button
                    class="time-btn
                    ${reserved
                        ? "reserved"
                        : ""}"
                    ${reserved
                        ? "disabled"
                        : ""}
                    data-time="${time}">

                    ${time}

                    ·

                    ${reserved
                        ? "Ocupado"
                        : "Disponible"}

                </button>

            `;

        }).join("");


    document
        .querySelectorAll(
            ".time-btn:not(:disabled)"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const start =
                        button.dataset.time;


                    const index =
                        times.indexOf(start);


                    getElement(
                        "startTime"
                    ).value = start;


                    getElement(
                        "endTime"
                    ).value =
                        times[
                            Math.min(
                                index + 2,
                                times.length - 1
                            )
                        ];


                    checkRange();

                }
            );

        });

}


/* =========================================
   COMPROBAR RANGO
========================================= */

function checkRange() {

    if (
        !selectedRoom ||
        !selectedDate
    ) {

        return false;

    }


    const start =
        getElement(
            "startTime"
        ).value;


    const end =
        getElement(
            "endTime"
        ).value;


    if (
        minutes(end) <=
        minutes(start)
    ) {

        showRangeError(
            "La hora final debe ser posterior a la inicial."
        );

        return false;

    }


    if (
        hasConflict(
            selectedRoom.id,
            selectedDate,
            start,
            end
        )
    ) {

        showRangeError(
            "Ese horario ya tiene una reserva."
        );

        return false;

    }


    selectedStart = start;

    selectedEnd = end;


    const status =
        getElement(
            "rangeStatus"
        );


    status.className =
        "range-status ok";


    status.textContent =
        `Horario disponible: ${start} → ${end}`;


    updateSummary();


    return true;

}


/* =========================================
   ERROR DE RANGO
========================================= */

function showRangeError(message) {

    selectedStart = null;

    selectedEnd = null;


    const status =
        getElement(
            "rangeStatus"
        );


    status.className =
        "range-status bad";


    status.textContent =
        message;


    updateSummary();

}


/* =========================================
   RESUMEN
========================================= */

function updateSummary() {

    getElement(
        "summaryRoom"
    ).textContent =
        selectedRoom
            ? selectedRoom.name
            : "—";


    getElement(
        "summaryDate"
    ).textContent =
        selectedDate
            ? formatDate(selectedDate)
            : "—";


    getElement(
        "summaryTime"
    ).textContent =
        selectedStart &&
        selectedEnd
            ? `${selectedStart} → ${selectedEnd}`
            : "—";

}


/* =========================================
   LOGIN ESTUDIANTE
========================================= */

getElement(
    "heroLogin"
).addEventListener(
    "click",
    () => {

        getElement(
            "loginModal"
        ).classList.remove(
            "hidden"
        );

    }
);


getElement(
    "loginForm"
).addEventListener(
    "submit",
    event => {

        event.preventDefault();


        const username =
            getElement(
                "loginUser"
            ).value.trim();


        const password =
            getElement(
                "loginPass"
            ).value;


        if (!username || !password) {

            return;

        }


        loggedUser = username;


        localStorage.setItem(
            "don_bosco_user",
            loggedUser
        );


        getElement(
            "loginModal"
        ).classList.add(
            "hidden"
        );


        /* AQUÍ APARECE TODO LO DE ABAJO */

        getElement(
            "mainContent"
        ).classList.remove(
            "hidden"
        );


        getElement(
            "loggedAs"
        ).textContent =
            "Sesión: " +
            loggedUser;


        renderRooms();

        renderCalendar();

        renderTimes();

        renderReservations();


        showToast(
            "Sesión iniciada correctamente."
        );


        setTimeout(() => {

            document
                .getElementById(
                    "mainContent"
                )
                .scrollIntoView({
                    behavior: "smooth"
                });

        }, 300);

    }
);


/* =========================================
   RESERVAR
========================================= */

getElement(
    "reservationForm"
).addEventListener(
    "submit",
    event => {

        event.preventDefault();


        if (
            !selectedRoom ||
            !selectedDate ||
            !selectedStart ||
            !selectedEnd
        ) {

            showToast(
                "Selecciona ambiente, fecha y horario."
            );

            return;

        }


        if (
            hasConflict(
                selectedRoom.id,
                selectedDate,
                selectedStart,
                selectedEnd
            )
        ) {

            showToast(
                "Ese horario acaba de ser ocupado."
            );

            return;

        }


        const reservation = {

            id:
                Date.now().toString(),

            roomId:
                selectedRoom.id,

            roomName:
                selectedRoom.name,

            date:
                selectedDate,

            start:
                selectedStart,

            end:
                selectedEnd,

            name:
                getElement("name")
                    .value.trim(),

            course:
                getElement("course")
                    .value.trim(),

            phone:
                getElement("phone")
                    .value.trim(),

            email:
                getElement("email")
                    .value.trim(),

            reason:
                getElement("reason")
                    .value.trim(),

            user:
                loggedUser

        };


        const reservations =
            getReservations();


        reservations.push(
            reservation
        );


        saveReservations(
            reservations
        );


        showToast(
            "¡Reserva guardada correctamente!"
        );


        getElement(
            "reservationForm"
        ).reset();


        renderCalendar();

        renderTimes();

        renderReservations();

        updateSummary();

    }
);


/* =========================================
   MIS RESERVAS
========================================= */

function renderReservations() {

    const container =
        getElement(
            "reservationsList"
        );


    const reservations =
        getReservations()
            .filter(
                reservation =>
                    reservation.user ===
                    loggedUser
            )
            .sort(
                (a, b) =>
                    (
                        a.date +
                        a.start
                    ).localeCompare(
                        b.date +
                        b.start
                    )
            );


    if (
        reservations.length === 0
    ) {

        container.innerHTML = `

            <div class="empty-state">

                Todavía no tienes reservas.

            </div>

        `;

        return;

    }


    container.innerHTML =
        reservations.map(
            reservation => `

                <article
                    class="reservation-item">

                    <div>

                        <strong>
                            ${reservation.roomName}
                        </strong>

                        <br>

                        <small>
                            ${reservation.reason}
                        </small>

                    </div>


                    <div>

                        <strong>
                            ${formatDate(
                                reservation.date
                            )}
                        </strong>

                        <br>

                        <small>
                            ${reservation.start}
                            →
                            ${reservation.end}
                        </small>

                    </div>


                    <div>

                        <strong>
                            ${reservation.name}
                        </strong>

                        <br>

                        <small>
                            ${reservation.course}
                        </small>

                    </div>


                    <div>

                        <span class="status">
                            Confirmada
                        </span>

                    </div>

                </article>

            `
        ).join("");

}


/* =========================================
   NAVEGAR MESES
========================================= */

getElement(
    "prevMonth"
).addEventListener(
    "click",
    () => {

        currentMonth.setMonth(
            currentMonth.getMonth() - 1
        );

        renderCalendar();

    }
);


getElement(
    "nextMonth"
).addEventListener(
    "click",
    () => {

        currentMonth.setMonth(
            currentMonth.getMonth() + 1
        );

        renderCalendar();

    }
);


/* =========================================
   CAMBIOS HORARIO
========================================= */

getElement(
    "checkRange"
).addEventListener(
    "click",
    checkRange
);


getElement(
    "startTime"
).addEventListener(
    "change",
    checkRange
);


getElement(
    "endTime"
).addEventListener(
    "change",
    checkRange
);


/* =========================================
   ADMIN LOGIN
========================================= */

getElement(
    "openAdmin"
).addEventListener(
    "click",
    () => {

        getElement(
            "adminLoginModal"
        ).classList.remove(
            "hidden"
        );

    }
);


getElement(
    "adminLoginForm"
).addEventListener(
    "submit",
    event => {

        event.preventDefault();


        const username =
            getElement(
                "adminUser"
            ).value;


        const password =
            getElement(
                "adminPass"
            ).value;


        const valid =
            administrators.some(
                admin =>
                    admin.username === username &&
                    admin.password === password
            );


        if (!valid) {

            showToast(
                "Usuario o contraseña incorrectos."
            );

            return;

        }


        getElement(
            "adminLoginModal"
        ).classList.add(
            "hidden"
        );


        getElement(
            "adminPanel"
        ).classList.remove(
            "hidden"
        );


        renderAdmin();

    }
);


/* =========================================
   ADMIN PANEL
========================================= */

function renderAdmin() {

    const reservations =
        getReservations()
            .sort(
                (a, b) =>
                    (
                        a.date +
                        a.start
                    ).localeCompare(
                        b.date +
                        b.start
                    )
            );


    const roomFilter =
        getElement(
            "adminRoomFilter"
        );


    roomFilter.innerHTML = `

        <option value="">
            Todos los ambientes
        </option>

        ${rooms.map(
            room =>
                `<option value="${room.id}">
                    ${room.name}
                </option>`
        ).join("")}

    `;


    const dateFilter =
        getElement(
            "adminDateFilter"
        );


    const dates =
        [
            ...new Set(
                reservations.map(
                    r => r.date
                )
            )
        ].sort();


    dateFilter.innerHTML = `

        <option value="">
            Todas las fechas
        </option>

        ${dates.map(
            date =>
                `<option value="${date}">
                    ${formatDate(date)}
                </option>`
        ).join("")}

    `;


    drawAdminTable();

}


/* =========================================
   TABLA ADMIN
========================================= */

function drawAdminTable() {

    const search =
        getElement(
            "adminSearch"
        ).value.toLowerCase();


    const room =
        getElement(
            "adminRoomFilter"
        ).value;


    const date =
        getElement(
            "adminDateFilter"
        ).value;


    let reservations =
        getReservations();


    reservations =
        reservations.filter(
            reservation => {

                const text =
                    (
                        reservation.name +
                        " " +
                        reservation.course +
                        " " +
                        reservation.roomName +
                        " " +
                        reservation.user +
                        " " +
                        reservation.email +
                        " " +
                        reservation.phone
                    ).toLowerCase();


                return (

                    (!search ||
                        text.includes(search)) &&

                    (!room ||
                        reservation.roomId === room) &&

                    (!date ||
                        reservation.date === date)

                );

            }
        );


    reservations.sort(
        (a, b) =>
            (
                a.date +
                a.start
            ).localeCompare(
                b.date +
                b.start
            )
    );


    const tbody =
        getElement(
            "adminTableBody"
        );


    if (
        reservations.length === 0
    ) {

        tbody.innerHTML = `

            <tr>

                <td colspan="8">

                    No hay reservas.

                </td>

            </tr>

        `;

        return;

    }


    tbody.innerHTML =
        reservations.map(
            reservation => `

                <tr>

                    <td>
                        ${formatDate(
                            reservation.date
                        )}
                    </td>

                    <td>
                        ${reservation.start}
                        →
                        ${reservation.end}
                    </td>

                    <td>
                        ${reservation.roomName}
                    </td>

                    <td>
                        ${reservation.name}
                        <br>
                        <small>
                            ${reservation.user}
                        </small>
                    </td>

                    <td>
                        ${reservation.course}
                    </td>

                    <td>
                        ${reservation.phone}
                        <br>
                        ${reservation.email}
                    </td>

                    <td>
                        ${reservation.reason}
                    </td>

                    <td>

                        <button
                            class="admin-action edit-action"
                            data-edit="${reservation.id}">
                            Editar
                        </button>

                        <button
                            class="admin-action cancel-action"
                            data-cancel="${reservation.id}">
                            Cancelar
                        </button>

                    </td>

                </tr>

            `
        ).join("");


    document
        .querySelectorAll(
            "[data-edit]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    openEdit(
                        button.dataset.edit
                    );

                }
            );

        });


    document
        .querySelectorAll(
            "[data-cancel]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    cancelReservation(
                        button.dataset.cancel
                    );

                }
            );

        });

}


/* =========================================
   FILTROS ADMIN
========================================= */

getElement(
    "adminSearch"
).addEventListener(
    "input",
    drawAdminTable
);


getElement(
    "adminRoomFilter"
).addEventListener(
    "change",
    drawAdminTable
);


getElement(
    "adminDateFilter"
).addEventListener(
    "change",
    drawAdminTable
);


/* =========================================
   EDITAR RESERVA
========================================= */

function openEdit(id) {

    const reservation =
        getReservations()
            .find(
                r => r.id === id
            );


    if (!reservation) {

        return;

    }


    getElement(
        "editId"
    ).value =
        reservation.id;


    getElement(
        "editRoom"
    ).innerHTML =
        rooms.map(
            room =>
                `<option value="${room.id}">
                    ${room.name}
                </option>`
        ).join("");


    getElement(
        "editRoom"
    ).value =
        reservation.roomId;


    getElement(
        "editDate"
    ).value =
        reservation.date;


    getElement(
        "editStart"
    ).value =
        reservation.start;


    getElement(
        "editEnd"
    ).value =
        reservation.end;


    getElement(
        "editName"
    ).value =
        reservation.name;


    getElement(
        "editCourse"
    ).value =
        reservation.course;


    getElement(
        "editPhone"
    ).value =
        reservation.phone;


    getElement(
        "editEmail"
    ).value =
        reservation.email;


    getElement(
        "editReason"
    ).value =
        reservation.reason;


    getElement(
        "editModal"
    ).classList.remove(
        "hidden"
    );

}


/* =========================================
   GUARDAR EDICIÓN
========================================= */

getElement(
    "editForm"
).addEventListener(
    "submit",
    event => {

        event.preventDefault();


        const id =
            getElement(
                "editId"
            ).value;


        const roomId =
            getElement(
                "editRoom"
            ).value;


        const room =
            rooms.find(
                r => r.id === roomId
            );


        const date =
            getElement(
                "editDate"
            ).value;


        const start =
            getElement(
                "editStart"
            ).value;


        const end =
            getElement(
                "editEnd"
            ).value;


        if (
            minutes(end) <=
            minutes(start)
        ) {

            showToast(
                "La hora final debe ser posterior."
            );

            return;

        }


        if (
            hasConflict(
                roomId,
                date,
                start,
                end,
                id
            )
        ) {

            showToast(
                "Ese horario ya está ocupado."
            );

            return;

        }


        const reservations =
            getReservations();


        const updated =
            reservations.map(
                reservation => {

                    if (
                        reservation.id !== id
                    ) {

                        return reservation;

                    }


                    return {

                        ...reservation,

                        roomId:
                            room.id,

                        roomName:
                            room.name,

                        date:
                            date,

                        start:
                            start,

                        end:
                            end,

                        name:
                            getElement(
                                "editName"
                            ).value,

                        course:
                            getElement(
                                "editCourse"
                            ).value,

                        phone:
                            getElement(
                                "editPhone"
                            ).value,

                        email:
                            getElement(
                                "editEmail"
                            ).value,

                        reason:
                            getElement(
                                "editReason"
                            ).value

                    };

                }
            );


        saveReservations(
            updated
        );


        getElement(
            "editModal"
        ).classList.add(
            "hidden"
        );


        renderAdmin();

        renderCalendar();

        renderTimes();

        renderReservations();


        showToast(
            "Reserva modificada correctamente."
        );

    }
);


/* =========================================
   CANCELAR
========================================= */

function cancelReservation(id) {

    const reservation =
        getReservations()
            .find(
                r => r.id === id
            );


    if (!reservation) {

        return;

    }


    const confirmCancel =
        confirm(
            "¿Seguro que deseas cancelar esta reserva?"
        );


    if (!confirmCancel) {

        return;

    }


    const updated =
        getReservations()
            .filter(
                r => r.id !== id
            );


    saveReservations(
        updated
    );


    renderAdmin();

    renderCalendar();

    renderTimes();

    renderReservations();


    showToast(
        "Reserva cancelada."
    );

}


/* =========================================
   CERRAR ADMIN
========================================= */

getElement(
    "closeAdminPanel"
).addEventListener(
    "click",
    () => {

        getElement(
            "adminPanel"
        ).classList.add(
            "hidden"
        );

    }
);


/* =========================================
   CERRAR MODALES
========================================= */

document
    .querySelectorAll(
        "[data-close]"
    )
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                getElement(
                    button.dataset.close
                ).classList.add(
                    "hidden"
                );

            }
        );

    });


/* =========================================
   EXPORTAR RESERVAS
========================================= */

getElement(
    "exportReservations"
).addEventListener(
    "click",
    () => {

        const reservations =
            getReservations()
                .sort(
                    (a, b) =>
                        (
                            a.date +
                            a.start
                        ).localeCompare(
                            b.date +
                            b.start
                        )
                );


        const rows = [

            [
                "Fecha",
                "Inicio",
                "Fin",
                "Ambiente",
                "Nombre",
                "Curso / Área",
                "Teléfono",
                "Correo",
                "Motivo",
                "Usuario"
            ],

            ...reservations.map(
                reservation => [

                    reservation.date,

                    reservation.start,

                    reservation.end,

                    reservation.roomName,

                    reservation.name,

                    reservation.course,

                    reservation.phone,

                    reservation.email,

                    reservation.reason,

                    reservation.user

                ]
            )

        ];


        const csv =
            "\uFEFF" +
            rows
                .map(
                    row =>
                        row
                            .map(
                                value =>
                                    `"${String(value)
                                        .replaceAll(
                                            '"',
                                            '""'
                                        )}"`
                            )
                            .join(";")
                )
                .join("\n");


        const blob =
            new Blob(
                [csv],
                {
                    type:
                        "text/csv;charset=utf-8;"
                }
            );


        const url =
            URL.createObjectURL(blob);


        const link =
            document.createElement("a");


        link.href = url;

        link.download =
            "reservas_don_bosco.csv";


        link.click();


        URL.revokeObjectURL(url);

    }
);


/* =========================================
   INICIAR
========================================= */

fillTimeSelectors();

renderCalendar();

renderTimes();

updateSummary();


/*
   IMPORTANTE:

   Aunque el usuario ya haya iniciado sesión
   anteriormente, NO mostramos automáticamente
   la página de reservas al abrirla.

   De esta manera siempre tendrá que pulsar
   "Iniciar sesión para reservar".
*/


if (loggedUser) {

    /*
       Se mantiene guardado el usuario,
       pero el contenido permanece oculto
       hasta que vuelva a iniciar sesión.
    */

    loggedUser = "";

}