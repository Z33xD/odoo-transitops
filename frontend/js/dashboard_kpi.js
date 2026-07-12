const fleetData = {

    totalVehicles:3,

    availableVehicles:3,

    activeTrips:0,

    fleetUtilization:0

};

/* --input in const fleetData later---

fetch("/dashboard/fleet")
.then(res=>res.json())
.then(fleetData=>{

document.getElementById("totalVehicles").innerText =
fleetData.totalVehicles;

...
});
*/

document.getElementById("totalVehicles").innerText =
fleetData.totalVehicles;

document.getElementById("availableVehicles").innerText =
fleetData.availableVehicles;

document.getElementById("activeTrips").innerText =
fleetData.activeTrips;

document.getElementById("fleetUtilization").innerText =
fleetData.fleetUtilization + "%";

/* input info for all dashboards */