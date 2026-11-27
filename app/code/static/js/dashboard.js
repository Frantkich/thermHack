"use strict";

console.log("dashboard.js loaded")

// ============ Status

async function fetchThermostatStatus() {
    let therm_status_btn = document.getElementById("therm_status_btn");
    therm_status_btn.disabled = true;
    therm_status_btn.innerHTML = '<i class="bi bi-hourglass-split"></i>';
    let data;
    try {
        const res = await fetch(`/api/thermostat`, { method: "GET" });
        data = await res.json();
    } catch (e) {
        console.warn("Failed to retrieve thermostat status !");
        therm_status_btn.disabled = false;
        updateStatus("failed");
        return;
    }
    therm_status_btn = updateStatus(data.status);
    therm_status_btn.disabled = false;
}

function updateStatus(status) {
    const status_ico = document.getElementById("therm_status_ico");
    const status_txt = document.getElementById("therm_status_txt");
    let therm_status_btn = document.getElementById("therm_status_btn");
    // remove all eventListener (try something cleaner)
    therm_status_btn.parentNode.replaceChild(therm_status_btn.cloneNode(true), therm_status_btn);
    therm_status_btn = document.getElementById("therm_status_btn");
    switch (status) {
        case "on":
            status_ico.className = "bi bi-fire";
            status_ico.style.color = "#c94a24"
            status_txt.innerText = "ON";
            therm_status_btn.innerText = "Turn off";
            therm_status_btn.addEventListener("click", () => operateThermostat("off"));
            break
        case "off":
            status_ico.className = "bi bi-snow";
            status_ico.style.color = "#20a1aa"
            status_txt.innerText = "OFF";
            therm_status_btn.innerText = "Turn on";
            therm_status_btn.addEventListener("click", () => operateThermostat("on"));
            break
        default:
            status_ico.className = "bi bi-arrow-clockwise";
            status_txt.innerText = "Unknown";
            therm_status_btn.innerText = "Recheck status";
            therm_status_btn.addEventListener("click", fetchThermostatStatus);
            break
    }
    return therm_status_btn;

}

// ============ Operation

async function operateThermostat(action) {
    let therm_status_btn = document.getElementById("therm_status_btn");
    therm_status_btn.disabled = true;
    let data;
    try {
        const res = await fetch(`/api/thermostat/${action}`, { method: "POST" });
        data = await res.json();
    } catch (e) {
        console.warn("Failed to operate thermostat !");
        therm_status_btn = updateStatus("failed")
        therm_therm_status_btn.disabled = false;
        return;
    }
    therm_status_btn = updateStatus(data.status);
    await fetchLastLogs();
    therm_status_btn.disabled = false;
}

// ============ Logs

async function fetchLastLogs() {
    const motor_logs_fetching_row = document.getElementById("motor_logs_fetching_row");
    let data;
    try {
        const logs_count = 10;
        const res = await fetch(`/api/logs?count=${logs_count}`, { method: "GET" });
        data = await res.json();
    } catch (e) {
        console.warn("Failed to fetch action logs !");
        motor_logs_fetching_row.getElementsByTagName("td")[0].innerText = "Failed to fetch action logs !";
        return;
    }

    if (data.data.length) {
        if (motor_logs_fetching_row != null) {
            motor_logs_fetching_row.hidden = true;
        }
        updateLogsEntries(data.data);
    } else {
        motor_logs_fetching_row.getElementsByTagName("td")[0].innerText = "No log found.";
    }
}

function updateLogsEntries(logs) {
    const table_logs = document.getElementById("motor_logs").getElementsByTagName("tbody")[0];
    table_logs.innerHTML = "";
    logs.forEach(log => {
        const row = document.createElement("tr");
        // Date
        const cell_date = document.createElement("td");
        cell_date.innerText = new Date(log.timestamp).toLocaleString();
        row.appendChild(cell_date);
        // Action
        const cell_action = document.createElement("td");
        const cell_action_ico = document.createElement("i");
        cell_action.appendChild(cell_action_ico);
        if (log.action == "on") {
            cell_action_ico.className = "bi bi-fire"
            cell_action_ico.style.color = "#c94a24"
        } else if (log.action == "off") {
            cell_action_ico.className = "bi bi-snow"
            cell_action_ico.style.color = "#20a1aa"
        }
        row.appendChild(cell_action);
        // Status
        const cell_status = document.createElement("td");
        const cell_status_ico = document.createElement("i");
        cell_status.appendChild(cell_status_ico);
        if (log.status == log.action) {
            cell_status_ico.className = "bi bi-check-circle"
            cell_status_ico.style.color = "#17a112"
        } else {
            cell_status_ico.className = "bi bi-x-circle"
            cell_status_ico.style.color = "#c90d0d"
        }
        row.appendChild(cell_status);
        // IP
        const cell_ip = document.createElement("td");
        cell_ip.innerText = log.ip_address;
        row.appendChild(cell_ip);

        table_logs.appendChild(row);
    });
}

// ============ Planning

async function fetchPlanning() {
    const planning_fetching_row = document.getElementById("planning_fetching_row");
    let data;
    try {
        const jobs_count = 14;
        const res = await fetch(`/api/jobs?count=${jobs_count}`, { method: "GET" });
        data = await res.json();
    } catch (e) {
        console.warn("Failed to fetch planning !");
        console.warn(e);
        planning_fetching_row.getElementsByTagName("td")[0].innerText = "Failed to fetch planning !";
        return;
    }

    if (data.data.length) {
        if (planning_fetching_row != null) {
            planning_fetching_row.hidden = true;
        }
        updatePlanning(data.data);
    } else {
        planning_fetching_row.getElementsByTagName("td")[0].innerText = "Nothing scheduled.";
    }
}

function updatePlanning(jobs) {
    const table_planning = document.getElementById("planning").getElementsByTagName("tbody")[0];
    table_planning.innerHTML = "";
    jobs.forEach(job => {
        let cell_execution_hour_classname = "";
        const id_group = job.id.split("-")[0];
        let row = document.getElementById(id_group);
        if (row == null) {
            row = document.createElement("tr");
            row.id = id_group;
            // Date
            const cell_day = document.createElement("td");
            cell_day.innerText = job.day;
            row.appendChild(cell_day);
            // Start/End
            const cell_start = document.createElement("td");
            cell_start.className = "start";
            row.appendChild(cell_start);
            const cell_end = document.createElement("td");
            cell_end.className = "stop";
            row.appendChild(cell_end);
            // Edit button
            const cell_edit = document.createElement("td");
            const edit_ico = document.createElement("div");
            edit_ico.className = "bi bi-pencil-square";
            edit_ico.setAttribute("type", "button");
            edit_ico.setAttribute("data-bs-toggle", "dialog");
            edit_ico.setAttribute("data-bs-target", "#planning_edit_job");
            edit_ico.addEventListener("click", () => fillEditPlanning(id_group, row));
            cell_edit.appendChild(edit_ico);
            row.appendChild(cell_edit);
        }
        switch (job.name) {
            case "thermostat_on":
                cell_execution_hour_classname = "start";
                break;
            case "thermostat_off":
                cell_execution_hour_classname = "stop";
                break;
            default:
                throw new Error(`job name (=${job.name}) not handled!`);;
        }
        const cell_execution_hour = row.getElementsByClassName(cell_execution_hour_classname)[0];
        cell_execution_hour.innerText = job.execution;
        cell_execution_hour.value = job.id;
        table_planning.appendChild(row);
    });
}

function fillEditPlanning(job_date, row_el) {
    document.getElementById("planning_edit_job_title").innerText = `Editing schedule for ${job_date.slice(6, 8)}/${job_date.slice(4, 6)}`;

    const job_start = row_el.getElementsByClassName("start")[0];
    const planning_edit_job_start = document.getElementById("planning_edit_job_start");
    planning_edit_job_start.value = job_start.innerText;

    const job_stop = row_el.getElementsByClassName("stop")[0];
    const planning_edit_job_stop = document.getElementById("planning_edit_job_stop");
    planning_edit_job_stop.value = job_stop.innerText;

    let planning_edit_job_save = document.getElementById("planning_edit_job_save");
    planning_edit_job_save.parentNode.replaceChild(planning_edit_job_save.cloneNode(true), planning_edit_job_save);
    planning_edit_job_save = document.getElementById("planning_edit_job_save");

    planning_edit_job_save.addEventListener("click", () => submitEditPlaning([[job_start.value, planning_edit_job_start.value], [job_stop.value, planning_edit_job_stop.value]]));
}

async function submitEditPlaning(jobs) {

    if (await editjob(jobs) == "ok") {
        fetchPlanning();
        document.getElementById("planning_edit_job").close();
        document.getElementById("planning_edit_job_start").value = "";
        document.getElementById("planning_edit_job_stop").value = "";
    }
}

async function editjob(jobs) {
    let data;
    try {
        const res = await fetch(`/api/jobs`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(jobs.map(job => ({ "id": job[0], "execution_hour": job[1] }))),
        });
        data = await res.json();
        return data.status;
    } catch (e) {
        console.warn("Failed to edit job execution hours !");
        console.warn(e);
        return;
    }
}

fetchThermostatStatus();
fetchLastLogs();
fetchPlanning();
