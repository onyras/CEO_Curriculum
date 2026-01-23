// CEO Curriculum Onboarding
// Checklist-style module selection with email submission

// ============================================
// PASTE YOUR GOOGLE APPS SCRIPT URL HERE:
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzTZ7NhydFCBILT5VrFbupXaoruhtpf__cjTcYaMxScTJTXVVG2zO39Qci-EpLTeJBuLA/exec';
// ============================================

let currentStep = 1;
const totalSteps = 8;

// Module data for building the summary
const moduleData = {};

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    // Build module data from the DOM
    document.querySelectorAll('.checklist-item').forEach(item => {
        const input = item.querySelector('input');
        const title = item.querySelector('.item-title').textContent;
        const subtitle = item.querySelector('.item-subtitle').textContent;
        moduleData[input.value] = {
            title,
            subtitle,
            domain: input.dataset.domain
        };
    });

    // Add change listeners to all checkboxes
    document.querySelectorAll('input[name="module"]').forEach(checkbox => {
        checkbox.addEventListener('change', updateCounts);
    });

    updateCounts();
});

// Navigate to next step
function nextStep() {
    if (currentStep < totalSteps) {
        // If going to review step, populate it
        if (currentStep === 7) {
            populateReview();
        }

        document.querySelector(`.wizard-step[data-step="${currentStep}"]`).classList.remove('active');
        document.querySelector(`.step[data-step="${currentStep}"]`).classList.remove('active');

        currentStep++;

        document.querySelector(`.wizard-step[data-step="${currentStep}"]`).classList.add('active');
        document.querySelector(`.step[data-step="${currentStep}"]`).classList.add('active');

        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// Navigate to previous step
function prevStep() {
    if (currentStep > 1) {
        document.querySelector(`.wizard-step[data-step="${currentStep}"]`).classList.remove('active');
        document.querySelector(`.step[data-step="${currentStep}"]`).classList.remove('active');

        currentStep--;

        document.querySelector(`.wizard-step[data-step="${currentStep}"]`).classList.add('active');
        document.querySelector(`.step[data-step="${currentStep}"]`).classList.add('active');

        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// Update selection counts
function updateCounts() {
    const domains = ['yourself', 'others', 'organizations', 'intensives'];
    let total = 0;

    domains.forEach(domain => {
        const count = document.querySelectorAll(`input[data-domain="${domain}"]:checked`).length;
        const counter = document.getElementById(`${domain}Count`);
        if (counter) counter.textContent = count;
        total += count;
    });

    const totalCounter = document.getElementById('totalCount');
    if (totalCounter) totalCounter.textContent = total;
}

// Get all selected modules grouped by domain
function getSelectedModules() {
    const selected = {
        yourself: [],
        others: [],
        organizations: [],
        intensives: []
    };

    document.querySelectorAll('input[name="module"]:checked').forEach(checkbox => {
        const data = moduleData[checkbox.value];
        if (data) {
            selected[data.domain].push({
                id: checkbox.value,
                title: data.title,
                subtitle: data.subtitle
            });
        }
    });

    return selected;
}

// Populate the review section
function populateReview() {
    const selected = getSelectedModules();
    const container = document.getElementById('reviewSections');

    const domainInfo = {
        yourself: { title: 'Leading Yourself', icon: 'yourself' },
        others: { title: 'Leading Others', icon: 'others' },
        organizations: { title: 'Leading the Organization', icon: 'organizations' },
        intensives: { title: 'Playbooks', icon: 'intensives' }
    };

    let html = '';
    let totalCount = 0;

    Object.entries(selected).forEach(([domain, modules]) => {
        if (modules.length > 0) {
            totalCount += modules.length;
            html += `
                <div class="review-domain">
                    <h3 class="review-domain-title ${domain}">${domainInfo[domain].title}</h3>
                    <ul class="review-list">
                        ${modules.map(m => `
                            <li>
                                <strong>${m.title}</strong>
                                <span>${m.subtitle}</span>
                            </li>
                        `).join('')}
                    </ul>
                </div>
            `;
        }
    });

    if (totalCount === 0) {
        html = '<div class="empty-review"><p>You haven\'t selected any modules yet. Go back and check off the topics that interest you.</p></div>';
    }

    container.innerHTML = html;
    document.getElementById('totalCount').textContent = totalCount;
}

// Build email body content
function buildEmailContent(clientName, clientEmail) {
    const selected = getSelectedModules();
    const domainTitles = {
        yourself: 'LEADING YOURSELF',
        others: 'LEADING OTHERS',
        organizations: 'LEADING THE ORGANIZATION',
        intensives: 'PLAYBOOKS'
    };

    let content = `LEADERSHIP DEVELOPMENT MAP\n`;
    content += `========================\n\n`;
    content += `Client: ${clientName}\n`;
    content += `Email: ${clientEmail}\n`;
    content += `Date: ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}\n\n`;

    let totalCount = 0;

    Object.entries(selected).forEach(([domain, modules]) => {
        if (modules.length > 0) {
            totalCount += modules.length;
            content += `${domainTitles[domain]}\n`;
            content += `${'─'.repeat(domainTitles[domain].length)}\n`;
            modules.forEach(m => {
                content += `☑ ${m.title}\n`;
                content += `  ${m.subtitle}\n\n`;
            });
            content += `\n`;
        }
    });

    content += `TOTAL MODULES: ${totalCount}\n\n`;
    content += `─────────────────────────────────\n`;
    content += `Next Steps:\n`;
    content += `• We'll use this map as our starting point\n`;
    content += `• In our next session, we'll identify highest-leverage opportunities\n`;
    content += `• We'll sequence 1-2 deep dives per quarter\n`;

    return content;
}

// Submit curriculum with email
function submitCurriculum() {
    const selected = getSelectedModules();
    const totalCount = Object.values(selected).flat().length;

    if (totalCount === 0) {
        alert('Please select at least one module before submitting.');
        return;
    }

    // Show email capture modal
    showEmailModal();
}

// Show email capture modal
function showEmailModal() {
    const modal = document.createElement('div');
    modal.className = 'email-modal';
    modal.id = 'emailModal';
    modal.innerHTML = `
        <div class="email-modal-content">
            <h2>Almost Done!</h2>
            <p>Enter your details to receive a copy of your development map.</p>

            <form id="curriculumForm" onsubmit="handleSubmit(event)">
                <div class="form-group">
                    <label for="clientName">Your Name</label>
                    <input type="text" id="clientName" name="clientName" required placeholder="Full name">
                </div>
                <div class="form-group">
                    <label for="clientEmail">Your Email</label>
                    <input type="email" id="clientEmail" name="clientEmail" required placeholder="you@company.com">
                </div>

                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="closeEmailModal()">Back</button>
                    <button type="submit" class="btn btn-primary" id="submitBtn">
                        <span class="btn-text">Submit Map</span>
                        <span class="btn-loading" style="display: none;">
                            <svg class="spinner" viewBox="0 0 24 24">
                                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" fill="none" stroke-dasharray="30 70"/>
                            </svg>
                        </span>
                    </button>
                </div>
            </form>
        </div>
    `;

    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('open'), 10);
    document.getElementById('clientName').focus();
}

// Close email modal
function closeEmailModal() {
    const modal = document.getElementById('emailModal');
    if (modal) {
        modal.classList.remove('open');
        setTimeout(() => modal.remove(), 300);
    }
}

// Handle form submission
async function handleSubmit(event) {
    event.preventDefault();

    const submitBtn = document.getElementById('submitBtn');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoading = submitBtn.querySelector('.btn-loading');

    // Show loading state
    btnText.style.display = 'none';
    btnLoading.style.display = 'inline-flex';
    submitBtn.disabled = true;

    const clientName = document.getElementById('clientName').value;
    const clientEmail = document.getElementById('clientEmail').value;
    const emailContent = buildEmailContent(clientName, clientEmail);

    try {
        // Send to Google Sheets
        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors', // Required for Google Apps Script
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                clientName,
                clientEmail,
                curriculum: emailContent,
                selections: getSelectedModules()
            })
        });

        // With no-cors, we can't read the response, but if no error was thrown, it likely succeeded
        closeEmailModal();
        showSuccessMessage(clientName, clientEmail);

    } catch (error) {
        console.error('Submission error:', error);
        // Show error message to user
        alert('There was an error submitting your map. Please try again or contact Nikolas directly.');

        // Reset button state
        const submitBtn = document.getElementById('submitBtn');
        const btnText = submitBtn.querySelector('.btn-text');
        const btnLoading = submitBtn.querySelector('.btn-loading');
        btnText.style.display = 'inline';
        btnLoading.style.display = 'none';
        submitBtn.disabled = false;
    }
}

// Show success message
function showSuccessMessage(clientName, clientEmail) {
    const reviewSection = document.querySelector('.wizard-step[data-step="8"] .step-content');

    // Replace the navigation with success message
    const existingNav = reviewSection.querySelector('.wizard-nav');
    if (existingNav) {
        existingNav.innerHTML = `
            <div class="success-message">
                <div class="success-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                </div>
                <h3>Map Submitted!</h3>
                <p>Thanks, ${clientName}. We'll use this as our starting point and discuss your highest-leverage opportunities in our upcoming session.</p>
            </div>
        `;
    }
}
