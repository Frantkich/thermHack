"use strict";

console.log("dashboard.js loaded")

// ============ Status

async function fetchThermostatStatus() {
    var status_btn = document.getElementById("therm_status_btn");
    status_btn.disabled = true;
    status_btn.innerHTML = '<i class="bi bi-hourglass-split"></i>';
    try {
        const res = await fetch(`/api/thermostat`, { method: "GET" });
        const data = await res.json();
        status_btn.disabled = false;
        updateStatus(data.status);
    } catch (e) {
        console.warn("Failed to retrieve thermostat status !");
        status_btn.disabled = false;
        updateStatus("failed");
    }
}

function updateStatus(status) {
    var status_ico = document.getElementById("therm_status_ico");
    var status_txt = document.getElementById("therm_status_txt");
    var status_btn = document.getElementById("therm_status_btn");
    // remove all eventListener (try something cleaner)
    status_btn.parentNode.replaceChild(status_btn.cloneNode(true), status_btn);
    var status_btn = document.getElementById("therm_status_btn");
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

}

// ============ Operation

async function operateThermostat(action) {
    document.getElementById("therm_status_btn").disabled = true;
    try {
        const res = await fetch(`/api/thermostat/${action}`, { method: "POST" });
        const data = await res.json();
        updateStatus(data.status);
        await fetchLastLogs();
    } catch (e) {
        console.warn("Failed to operate thermostat !");
        updateStatus("failed")
    }
    document.getElementById("therm_status_btn").disabled = false;
}

// ============ Logs

async function fetchLastLogs() {
    var logs_count = 10;
    try {
        const res = await fetch(`/api/actionslogs?count=${logs_count}`, { method: "GET" });
        const data = await res.json();
        if (data.data.length) {
            if (document.getElementById("motor_logs_fetching_row") != null) {
                document.getElementById("motor_logs_fetching_row").hidden = true;
            }
            updateLogsEntries(data.data);
        } else {
            document.getElementById("motor_logs_fetching_row").getElementsByTagName("td")[0].innerText = "No log found.";
        }
    } catch (e) {
        console.warn("Failed to fetch action logs !");
    }
}

function updateLogsEntries(logs) {
    var table_logs = document.getElementById("motor_logs").getElementsByTagName("tbody")[0];
    table_logs.innerHTML = "";
    logs.forEach(log => {
        var row = document.createElement("tr");
        // Date
        var cell_date = document.createElement("td");
        cell_date.innerText = new Date(log.timestamp).toLocaleString();
        row.appendChild(cell_date);
        // Action
        var cell_action = document.createElement("td");
        var cell_action_ico = document.createElement("i");
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
        var cell_status = document.createElement("td");
        var cell_status_ico = document.createElement("i");
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
        var cell_ip = document.createElement("td");
        cell_ip.innerText = log.ip_address;
        row.appendChild(cell_ip);

        table_logs.appendChild(row);
    });
}

// ============ Planning

async function fetchPlanning() {
    try {
        const res = await fetch(`/api/tasks`, { method: "GET" });
        const data = await res.json();
        if (data.data.length) {
            if (document.getElementById("planning_fetching_row") != null) {
                document.getElementById("planning_fetching_row").hidden = true;
            }
            updatePlanning(data.data);
        } else {
            document.getElementById("planning_fetching_row").getElementsByTagName("td")[0].innerText = "Nothing scheduled.";
        }
    } catch (e) {
        console.warn("Failed to fetch planning !");
    }
}

function updatePlanning(tasks) {
    var table_planning = document.getElementById("planning").getElementsByTagName("tbody")[0];
    table_planning.innerHTML = "";
    tasks.forEach(task => {
        var cell_execution_hour_classname = "";
        var id_group = task.id.split("-")[0];
        var row = document.getElementById(id_group);
        if (row == null) {
            row = document.createElement("tr");
            row.id = id_group;
            // Date
            var cell_day = document.createElement("td");
            cell_day.innerText = task.day;
            row.appendChild(cell_day);
            // Start/End
            var cell_start = document.createElement("td");
            cell_start.className = "start";
            row.appendChild(cell_start);
            var cell_end = document.createElement("td");
            cell_end.className = "end";
            row.appendChild(cell_end);
            // Edit button
            var cell_edit = document.createElement("td");
            var edit_ico = document.createElement("div");
            edit_ico.className = "bi bi-pencil-square";
            edit_ico.addEventListener("click", () => console.log("edit"));
            cell_edit.appendChild(edit_ico);
            row.appendChild(cell_edit);
        }
        switch (task.name) {
            case "thermostat_on":
                cell_execution_hour_classname = "start";
                break;
            case "thermostat_off":
                cell_execution_hour_classname = "end";
                break;
            default:
                break;
        }
        var cell_execution_hour = row.getElementsByClassName(cell_execution_hour_classname)[0];
        cell_execution_hour.innerText = task.execution;
        table_planning.appendChild(row);
    });
}

function editPlanning(task_day) {

}

fetchThermostatStatus();
fetchLastLogs();
fetchPlanning();
