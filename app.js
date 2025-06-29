const defaultJobs = {
  site_survey: [
    "Laser Distance Meter",
    "Measuring Tape",
    "GPS Device",
    "Notebook & Pen",
    "Camera/Smartphone",
    "Multimeter",
    "Laptop with Wi-Fi Scanner",
  ],
  router_installation: [
    "Router",
    "Screwdriver Set",
    "Ethernet Cables",
    "RJ45 Connectors",
    "Cable Tester",
    "Crimping Tool",
    "Power Adapter",
    "Label Printer",
    "Drill & Wall Anchors",
  ],
  switch_installation: [
    "Network Switch",
    "Patch Cables",
    "Rack Screws",
    "Screwdriver Set",
    "Cable Tester",
    "Rack Mount Kit",
    "Label Printer",
    "Velcro/Zip Ties",
  ],
  starlink_installation: [
    "Starlink Dish",
    "Mounting Kit",
    "Satellite Compass App",
    "Cable Routing Tools",
    "Ladder",
    "Drill",
    "Weatherproof Tape",
    "Smartphone",
  ],
  wireless_access_point_setup: [
    "Access Point Device",
    "PoE Injector or PoE Switch",
    "Ethernet Cables",
    "Crimping Tool",
    "Screwdriver",
    "Wi-Fi Scanner App",
    "Wall/Ceiling Mount Kit",
  ],
  network_troubleshooting: [
    "Laptop",
    "Ethernet Cables",
    "Multimeter",
    "Cable Tester",
    "Wi-Fi Analyzer",
    "Ping/Traceroute Tools",
    "Loopback Plug",
    "Console Cable",
  ],
  fiber_optic_installation: [
    "Fiber Optic Cables",
    "OTDR (Optical Time-Domain Reflectometer)",
    "Fiber Cleaver",
    "Fusion Splicer",
    "Stripping Tools",
    "Alcohol Wipes",
    "Protective Sleeves",
    "Safety Glasses",
  ],
  network_rack_assembly: [
    "Rack Frame",
    "Patch Panel",
    "Screwdriver Set",
    "Power Distribution Unit (PDU)",
    "Cable Management Tray",
    "Ethernet Cables",
    "Label Printer",
    "Zip Ties",
  ],
  cctv_network_setup: [
    "IP Cameras",
    "NVR/DVR",
    "Ethernet Cables",
    "PoE Switch",
    "Crimping Tool",
    "Cable Tester",
    "Monitor",
    "Ladder",
  ],
  structured_cabling: [
    "Cat5e/Cat6 Cables",
    "Patch Panel",
    "RJ45 Connectors",
    "Cable Tester",
    "Crimping Tool",
    "Cable Stripper",
    "Label Printer",
    "Cable Tray or Raceway",
  ],
  ups_installation: [
    "UPS Unit",
    "Voltage Tester",
    "Power Cords",
    "Circuit Labels",
    "Screwdriver Set",
    "Cable Ties",
    "Battery Tester",
    "Multimeter",
  ],
};

let jobs = JSON.parse(localStorage.getItem("jobs")) || defaultJobs;
let selectedJob = localStorage.getItem("selectedJob") || "";
let notesByJob = JSON.parse(localStorage.getItem("notesByJob") || "{}");

const jobSelect = document.getElementById("jobSelect");
const toolList = document.getElementById("toolList");
const newJobInput = document.getElementById("newJobInput");
const newToolInput = document.getElementById("newToolInput");
const notesTextarea = document.getElementById("notes");

function saveState() {
  localStorage.setItem("jobs", JSON.stringify(jobs));
  localStorage.setItem("selectedJob", selectedJob);
  localStorage.setItem("notesByJob", JSON.stringify(notesByJob));
}

function populateJobs() {
  jobSelect.innerHTML = '<option value="">-- Choose a Job --</option>';
  Object.keys(jobs).forEach((job) => {
    const opt = document.createElement("option");
    opt.value = job;
    opt.textContent = job.replace(/_/g, " ");
    jobSelect.appendChild(opt);
  });
  jobSelect.value = selectedJob;
}

function renderTools() {
  toolList.innerHTML = "";
  if (!selectedJob || !jobs[selectedJob]) return;
  jobs[selectedJob].forEach((tool, index) => {
    const li = document.createElement("li");
    li.className = "tool-item";
    li.innerHTML = `
      <span>${tool}</span>
      <button onclick="removeTool(${index})" class="delete">🗑️</button>
    `;
    toolList.appendChild(li);
  });
}

function removeTool(index) {
  if (!selectedJob || !jobs[selectedJob]) return;
  jobs[selectedJob].splice(index, 1);
  saveState();
  renderTools();
}

document.getElementById("addJobBtn").addEventListener("click", () => {
  const job = newJobInput.value.trim().toLowerCase().replace(/\s+/g, "_");
  if (job && !jobs[job]) {
    jobs[job] = [];
    selectedJob = job;
    newJobInput.value = "";
    populateJobs();
    renderTools();
    notesTextarea.value = notesByJob[selectedJob] || "";
    saveState();
  }
});

document.getElementById("deleteJobBtn").addEventListener("click", () => {
  if (selectedJob && jobs[selectedJob]) {
    delete jobs[selectedJob];
    delete notesByJob[selectedJob];
    selectedJob = "";
    populateJobs();
    renderTools();
    notesTextarea.value = "";
    saveState();
  }
});

document.getElementById("addToolBtn").addEventListener("click", () => {
  const tool = newToolInput.value.trim();
  if (tool && selectedJob && jobs[selectedJob]) {
    jobs[selectedJob].push(tool);
    newToolInput.value = "";
    renderTools();
    saveState();
  }
});

jobSelect.addEventListener("change", (e) => {
  selectedJob = e.target.value;
  notesTextarea.value = notesByJob[selectedJob] || "";
  renderTools();
  saveState();
});

notesTextarea.addEventListener("input", () => {
  if (!selectedJob) return;
  notesByJob[selectedJob] = notesTextarea.value;
  saveState();
});

document.getElementById("fabAddJob").addEventListener("click", () => {
  newJobInput.focus();
});

document.getElementById("exportBtn").addEventListener("click", () => {
  const blob = new Blob([JSON.stringify(jobs, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "network-jobs.json";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
});

document.getElementById("importInput").addEventListener("change", (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const imported = JSON.parse(e.target.result);
      jobs = imported;
      selectedJob = Object.keys(imported)[0] || "";
      populateJobs();
      renderTools();
      notesTextarea.value = notesByJob[selectedJob] || "";
      saveState();
    } catch (err) {
      alert("Invalid JSON");
    }
  };
  reader.readAsText(file);
});

// Status
window.addEventListener("online", () => updateStatus(true));
window.addEventListener("offline", () => updateStatus(false));

function updateStatus(online) {
  const el = document.getElementById("status");
  el.className = "status " + (online ? "online" : "offline");
  el.innerHTML = `
    <span style="display:inline-block; width:0.5rem; height:0.5rem; border-radius:9999px; margin-right:0.5rem; background:${
      online ? "#22c55e" : "#ef4444"
    };"></span>${online ? "Online" : "Offline"}
  `;
}

// Service Worker Registration
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").catch(console.error);
  });
}

// Initialize
populateJobs();
renderTools();
notesTextarea.value = notesByJob[selectedJob] || "";
updateStatus(navigator.onLine);
