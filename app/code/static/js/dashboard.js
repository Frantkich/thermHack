"use strict";

console.log("dashboard.js loaded")

// ============ Status

async function fetchThermostatStatus() {
    let status_btn = document.getElementById("therm_status_btn");
    status_btn.disabled = true;
    status_btn.innerHTML = '<i class="bi bi-hourglass-split"></i>';
    let data;
    try {
        const res = await fetch(`/api/thermostat`, { method: "GET" });
        data = await res.json();
    } catch (e) {
        console.warn("Failed to retrieve thermostat status !");
        status_btn.disabled = false;
        updateStatus("failed");
        return;
    }
    status_btn = updateStatus(data.status);
    status_btn.disabled = false;
}

function updateStatus(status) {
    const status_ico = document.getElementById("therm_status_ico");
    const status_txt = document.getElementById("therm_status_txt");
    let status_btn = document.getElementById("therm_status_btn");
    // remove all eventListener (try something cleaner)
    status_btn.parentNode.replaceChild(status_btn.cloneNode(true), status_btn);
    status_btn = document.getElementById("therm_status_btn");
    switch (status) {
        case "on":
            status_ico.className = "bi bi-fire";
            status_ico.style.color = "#c94a24"
            status_txt.innerText = "ON";
            status_btn.innerText = "Turn off";
            status_btn.addEventListener("click", () => operateThermostat("off"));
            break
        case "off":
            status_ico.className = "bi bi-snow";
            status_ico.style.color = "#20a1aa"
            status_txt.innerText = "OFF";
            status_btn.innerText = "Turn on";
            status_btn.addEventListener("click", () => operateThermostat("on"));
            break
        default:
            status_ico.className = "bi bi-arrow-clockwise";
            status_txt.innerText = "Unknown";
            status_btn.innerText = "Recheck status";
            status_btn.addEventListener("click", fetchThermostatStatus);
            break
    }
    return status_btn;

}

// ============ Operation

async function operateThermostat(action) {
    let therm_status_btn = document.getElementById("therm_status_btn");
    therm_status_btn.disabled = true;
    let data;
    try {
        const res = await fetch(`/api/thermostat/${action}`, { method: "POST" });
        const data = await res.json();
    } catch (e) {
        console.warn("Failed to operate thermostat !");
        status_btn = updateStatus("failed")
        therm_status_btn.disabled = false;
        return;
    }
    status_btn = updateStatus(data.status);
    await fetchLastLogs();
    therm_status_btn.disabled = false;
}

// ============ Logs

async function fetchLastLogs() {
    const motor_logs_fetching_row = document.getElementById("motor_logs_fetching_row");
    let data;
    try {
        const logs_count = 10;
        const res = await fetch(`/api/actionslogs?count=${logs_count}`, { method: "GET" });
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
        const tasks_count = 14;
        const res = await fetch(`/api/tasks?count=${tasks_count}`, { method: "GET" });
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

function updatePlanning(tasks) {
    const table_planning = document.getElementById("planning").getElementsByTagName("tbody")[0];
    table_planning.innerHTML = "";
    tasks.forEach(task => {
        let cell_execution_hour_classname = "";
        const id_group = task.id.split("-")[0];
        let row = document.getElementById(id_group);
        if (row == null) {
            row = document.createElement("tr");
            row.id = id_group;
            // Date
            const cell_day = document.createElement("td");
            cell_day.innerText = task.day;
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
            edit_ico.setAttribute("data-bs-target", "#planning_edit_task");
            edit_ico.addEventListener("click", () => fillEditPlanning(task.id, row));
            cell_edit.appendChild(edit_ico);
            row.appendChild(cell_edit);
        }
        switch (task.name) {
            case "thermostat_on":
                cell_execution_hour_classname = "start";
                break;
            case "thermostat_off":
                cell_execution_hour_classname = "stop";
                break;
            default:
                throw new Error(`Task name (=${task.name}) not handled!`);;
        }
        const cell_execution_hour = row.getElementsByClassName(cell_execution_hour_classname)[0];
        cell_execution_hour.innerText = task.execution;
        table_planning.appendChild(row);
    });
}

function fillEditPlanning(task_id, row_el) {
    const task_date = task_id.split("-")[0];
    document.getElementById("planning_edit_tasks_title").innerText = `Editing schedule for ${task_date.slice(6, 2)}/${task_date.slice(4, 2)}`;

    document.getElementById("planning_edit_tasks_start").setAttribute("value", row_el.getElementsByClassName("start")[0].innerText);
    document.getElementById("planning_edit_tasks_stop").setAttribute("value", row_el.getElementsByClassName("stop")[0].innerText);

    document.getElementById("planning_edit_tasks_save").setAttribute("onclick", task_id);
}

function editTask(task_id) {
    console.log(task_id);
}

fetchThermostatStatus();
fetchLastLogs();
fetchPlanning();
