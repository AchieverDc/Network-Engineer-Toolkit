const defaultJobs = {
  router_installation: ["Screwdriver", "Ethernet Cable", "Power Adapter"],
  site_survey: ["Multimeter", "Laser Measure", "Notebook"],
};

let jobs = JSON.parse(localStorage.getItem("jobs")) || defaultJobs;
let selectedJob = localStorage.getItem("selectedJob") || "";

const jobSelect = document.getElementById("jobSelect");
const toolList = document.getElementById("toolList");
const newJobInput = document.getElementById("newJobInput");
const newToolInput = document.getElementById("newToolInput");
const notesTextarea = document.getElementById("notes");

function saveState() {
  localStorage.setItem("jobs", JSON.stringify(jobs));
  localStorage.setItem("selectedJob", selectedJob);
  localStorage.setItem("notes", notesTextarea.value);
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
    li.className =
      "flex justify-between items-center border rounded px-3 py-2 bg-gray-50";
    li.innerHTML = `
          <span>${tool}</span>
          <button onclick="removeTool(${index})" class="text-red-500 hover:text-red-700">🗑️</button>
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
    saveState();
  }
});

document.getElementById("deleteJobBtn").addEventListener("click", () => {
  if (selectedJob && jobs[selectedJob]) {
    delete jobs[selectedJob];
    selectedJob = "";
    populateJobs();
    renderTools();
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
  renderTools();
  saveState();
});

notesTextarea.value = localStorage.getItem("notes") || "";

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
  el.innerHTML = online
    ? '<span class="w-2 h-2 rounded-full bg-green-500 mr-2"></span>Online'
    : '<span class="w-2 h-2 rounded-full bg-red-500 mr-2"></span>Offline';
  el.className = `flex items-center text-sm font-medium ${
    online ? "text-green-600" : "text-red-600"
  }`;
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
updateStatus(navigator.onLine);
