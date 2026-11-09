"use strict";

console.log("dashboard.js loaded")

// ============ Status

async function fetchThermostatStatus() {
    document.getElementById("therm_status_btn").disabled = true;
    try {
        const res = await fetch(`/api/thermostat`, { method: "GET" });
        const data = await res.json();
        updateStatus(data.status)
    } catch (e) {
        console.warn("Failed to retrieve thermostat status !");
        updateStatus("failed")
    }
    document.getElementById("therm_status_btn").disabled = false;
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
            status_ico.innerText = "🔥";
            status_txt.innerText = "ON";
            status_btn.innerText = "Turn off";
            status_btn.addEventListener("click", () => operateThermostat("off"));
            break
        case "off":
            status_ico.innerText = "❄️";
            status_txt.innerText = "OFF";
            status_btn.innerText = "Turn on";
            status_btn.addEventListener("click", () => operateThermostat("on"));
            break
        default:
            status_ico.innerText = "🔄";
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
        const res = await fetch(`/api/actions?count=${logs_count}`, { method: "GET" });
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
        if (log.action == "on") {
            cell_action.innerText = "ON 🔥";
        } else if (log.action == "off") {
            cell_action.innerText = "OFF ❄️";
        }
        row.appendChild(cell_action);
        // Status
        var cell_status = document.createElement("td");
        if (log.status == log.action) {
            cell_status.innerText = "✅";
        } else {
            cell_status.innerText = "❌";
        }
        row.appendChild(cell_status);
        // IP
        var cell_ip = document.createElement("td");
        cell_ip.innerText = log.ip_address;
        row.appendChild(cell_ip);

        table_logs.appendChild(row);
    });
}


fetchThermostatStatus()
fetchLastLogs()