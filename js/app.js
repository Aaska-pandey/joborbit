const jobList = document.getElementById("job-list");
const resultsCount = document.getElementById("results-count");

const searchInput = document.getElementById("search-input");
const locationFilter = document.getElementById("location-filter");
const employmentFilter = document.getElementById("employment-filter");
const sortFilter = document.getElementById("sort-filter");
const savedFilter = document.getElementById("saved-filter");
const resetButton = document.getElementById("reset-filters");

const STORAGE_KEY = "joborbit-saved-jobs";

// Load saved job IDs from localStorage.
function loadSavedJobs() {
    try {
        const storedJobs = JSON.parse(
            localStorage.getItem(STORAGE_KEY) || "[]"
        );

        if (!Array.isArray(storedJobs)) {
            return [];
        }

        return storedJobs.filter(
            id => Number.isInteger(id) && jobs.some(job => job.id === id)
        );
    } catch (error) {
        console.error("Could not load saved jobs:", error);
        return [];
    }
}

let savedJobIds = loadSavedJobs();

// Persist saved job IDs in localStorage.
function persistSavedJobs() {
    try {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(savedJobIds)
        );
    } catch (error) {
        console.error("Could not save jobs:", error);
        alert("Your browser could not save bookmarks.");
    }
}

// Populate the location dropdown.
function populateLocations() {
    const locations = [...new Set(jobs.map(job => job.location))];

    locations.sort((a, b) => a.localeCompare(b));

    locations.forEach(location => {
        const option = document.createElement("option");

        option.value = location;
        option.textContent = location;

        locationFilter.appendChild(option);
    });
}

// Render the job cards.
function renderJobs(jobData) {
    jobList.replaceChildren();

    if (jobData.length === 0) {
        const emptyMessage = document.createElement("p");

        emptyMessage.className = "empty-state";
        emptyMessage.textContent =
            "No jobs found. Try changing your search or filters.";

        jobList.appendChild(emptyMessage);
    } else {
        jobData.forEach(job => {
            const isSaved = savedJobIds.includes(job.id);

            const jobCard = document.createElement("article");
            jobCard.className = "job-card";

            // Job title and company
            const header = document.createElement("div");
            header.className = "job-card-header";

            const information = document.createElement("div");

            const title = document.createElement("h3");
            title.textContent = job.title;

            const company = document.createElement("p");
            company.className = "job-company";
            company.textContent = job.company;

            information.append(title, company);

            const employmentType = document.createElement("span");
            employmentType.className = "job-type";
            employmentType.textContent = job.employmentType;

            header.append(information, employmentType);

            // Job description
            const description = document.createElement("p");
            description.className = "job-description";
            description.textContent = job.description;

            // Job details
            const details = document.createElement("div");
            details.className = "job-details";

            const location = document.createElement("span");
            location.textContent = `Location: ${job.location}`;

            const salary = document.createElement("span");
            salary.textContent = `Salary: ${job.salary}`;

            const date = document.createElement("span");
            date.textContent = `Posted: ${job.postedDate}`;

            details.append(location, salary, date);

            // Job actions
            const actions = document.createElement("div");
            actions.className = "job-card-actions";

            const applyLink = document.createElement("a");
            applyLink.className = "apply-button";
            applyLink.textContent = "View opportunity";
            applyLink.href = job.applicationUrl;
            applyLink.target = "_blank";
            applyLink.rel = "noopener noreferrer";

            const bookmarkButton = document.createElement("button");
            bookmarkButton.type = "button";

            bookmarkButton.className =
                `bookmark-button${isSaved ? " is-saved" : ""}`;

            bookmarkButton.dataset.jobId = String(job.id);
            bookmarkButton.setAttribute("aria-pressed", String(isSaved));

            bookmarkButton.textContent = isSaved
                ? "♥ Saved"
                : "♡ Save job";

            actions.append(applyLink, bookmarkButton);

            // Assemble the complete card
            jobCard.append(header, description, details, actions);
            jobList.appendChild(jobCard);
        });
    }

    resultsCount.textContent =
        `${jobData.length} ${jobData.length === 1 ? "job" : "jobs"} found`;
}

// Search, filter, and sort the jobs.
function applyFilters() {
    const searchTerm = searchInput.value.trim().toLowerCase();
    const selectedLocation = locationFilter.value;
    const selectedEmploymentType = employmentFilter.value;
    const selectedSort = sortFilter.value;
    const showSavedOnly = savedFilter.value === "saved";

    const filteredJobs = jobs.filter(job => {
        const matchesSearch =
            job.title.toLowerCase().includes(searchTerm) ||
            job.company.toLowerCase().includes(searchTerm);

        const matchesLocation =
            selectedLocation === "" ||
            job.location === selectedLocation;

        const matchesEmploymentType =
            selectedEmploymentType === "" ||
            job.employmentType === selectedEmploymentType;

        const matchesSaved =
            !showSavedOnly || savedJobIds.includes(job.id);

        return (
            matchesSearch &&
            matchesLocation &&
            matchesEmploymentType &&
            matchesSaved
        );
    });

    if (selectedSort === "newest") {
        filteredJobs.sort((a, b) =>
            b.postedDate.localeCompare(a.postedDate)
        );
    } else if (selectedSort === "oldest") {
        filteredJobs.sort((a, b) =>
            a.postedDate.localeCompare(b.postedDate)
        );
    }

    renderJobs(filteredJobs);
}

// Toggle a job's saved status.
function toggleBookmark(jobId) {
    if (savedJobIds.includes(jobId)) {
        savedJobIds = savedJobIds.filter(id => id !== jobId);
    } else {
        savedJobIds.push(jobId);
    }

    persistSavedJobs();
    applyFilters();
}

// Event delegation handles bookmark clicks on job cards.
jobList.addEventListener("click", event => {
    const bookmarkButton = event.target.closest(".bookmark-button");

    if (!bookmarkButton) {
        return;
    }

    const jobId = Number(bookmarkButton.dataset.jobId);

    toggleBookmark(jobId);
});

// Search and filter event listeners.
searchInput.addEventListener("input", applyFilters);
locationFilter.addEventListener("change", applyFilters);
employmentFilter.addEventListener("change", applyFilters);
sortFilter.addEventListener("change", applyFilters);
savedFilter.addEventListener("change", applyFilters);

// Reset the controls.
resetButton.addEventListener("click", () => {
    searchInput.value = "";
    locationFilter.value = "";
    employmentFilter.value = "";
    sortFilter.value = "newest";
    savedFilter.value = "all";

    applyFilters();
});

// Initialize the application.
populateLocations();
applyFilters();