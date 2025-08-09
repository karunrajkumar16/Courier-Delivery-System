const APP_DATA = {
    defaultCustomers: [
        {id: 1, name: "John Customer", email: "john@example.com", phone: "9876543210", address: "123 Main Street, Mumbai", password: "customer123", createdAt: "2025-08-04T12:00:00Z"}
    ],
    packageTypes: ["Document", "Parcel", "Fragile", "Electronics", "Clothing", "Books", "Medical", "Food"],
    serviceTypes: [
        {name: "Standard", multiplier: 1.0, description: "3-5 business days", price: "₹50", estimatedHours: 120},
        {name: "Express", multiplier: 1.5, description: "1-2 business days", price: "₹75", estimatedHours: 48}, 
        {name: "Same Day", multiplier: 2.0, description: "Same day delivery", price: "₹100", estimatedHours: 8},
        {name: "Premium", multiplier: 2.5, description: "Priority handling", price: "₹125", estimatedHours: 24}
    ],
    statusTypes: ["Pickup Scheduled", "In Transit", "Out for Delivery", "Delivered"],
    basePricing: {
        baseRate: 50,
        perKg: 25,
        minimumCharge: 100
    },
    samplePackages: [
        {
            id: 1,
            trackingId: "RJC20250804001",
            customerId: 1,
            sender: {name: "John Customer", phone: "9876543210", address: "123 Main Street, Mumbai"},
            receiver: {name: "Jane Receiver", phone: "9876543211", address: "456 Oak Avenue, Delhi"},
            packageDetails: {type: "Electronics", weight: 2.5, fragile: true},
            serviceType: "Express",
            cost: 175,
            status: "In Transit",
            createdAt: "2025-08-04T10:00:00Z",
            updatedAt: "2025-08-04T14:30:00Z",
            estimatedDelivery: "2025-08-06T18:00:00Z",
            statusHistory: [
                {status: "Pickup Scheduled", timestamp: "2025-08-04T10:00:00Z", location: "Mumbai", notes: "Package scheduled for pickup"},
                {status: "In Transit", timestamp: "2025-08-04T14:30:00Z", location: "Mumbai Hub", notes: "Package picked up and in transit"}
            ]
        }
    ],
    serviceFeatures: [
        {title: "Fast Delivery", description: "Quick and reliable delivery across India", icon: "fas fa-shipping-fast"},
        {title: "Real-time Tracking", description: "Track your package every step of the way", icon: "fas fa-map-marker-alt"},
        {title: "Secure Handling", description: "Your packages are safe with us", icon: "fas fa-shield-alt"},
        {title: "24/7 Support", description: "Customer support available round the clock", icon: "fas fa-headset"}
    ]
};

let currentUser = null;
let currentPackageForPickup = null;
let currentPackageForDelivery = null;
let signatureCanvas = null;
let isDrawing = false;

function initializeData() {
    if (!localStorage.getItem('rjcouriers_customers')) {
        localStorage.setItem('rjcouriers_customers', JSON.stringify(APP_DATA.defaultCustomers));
    }
    
    if (!localStorage.getItem('rjcouriers_packages')) {
        localStorage.setItem('rjcouriers_packages', JSON.stringify(APP_DATA.samplePackages));
    }
    
    if (!localStorage.getItem('rjcouriers_counter')) {
        localStorage.setItem('rjcouriers_counter', '2');
    }
}

function showModernSuccess(message) {
    document.getElementById('successMessage').innerHTML = message;
    showModal('successModal');
    createConfetti();
}

function showModernError(message) {
    document.getElementById('errorMessage').innerHTML = message;
    showModal('errorModal');
    
    const modal = document.querySelector('#errorModal .modern-modal');
    modal.style.animation = 'shake 0.5s ease-in-out';
    setTimeout(() => {
        modal.style.animation = '';
    }, 500);
}

function showModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    
    requestAnimationFrame(() => {
        modal.style.opacity = '1';
    });
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.style.opacity = '0';
    
    setTimeout(() => {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }, 300);
}

const shakeKeyframes = `
@keyframes shake {
    0%, 100% { transform: translateX(0); }
    10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
    20%, 40%, 60%, 80% { transform: translateX(5px); }
}`;

if (!document.querySelector('#shake-styles')) {
    const style = document.createElement('style');
    style.id = 'shake-styles';
    style.textContent = shakeKeyframes;
    document.head.appendChild(style);
}

function createConfetti() {
    const colors = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe'];
    const confettiCount = 50;
    
    for (let i = 0; i < confettiCount; i++) {
        const confetti = document.createElement('div');
        confetti.style.cssText = `
            position: fixed;
            width: 8px;
            height: 8px;
            background: ${colors[Math.floor(Math.random() * colors.length)]};
            left: ${Math.random() * 100}vw;
            top: -10px;
            border-radius: 50%;
            z-index: 3000;
            pointer-events: none;
            animation: confettiFall ${2 + Math.random() * 3}s linear forwards;
        `;
        
        document.body.appendChild(confetti);
        
        setTimeout(() => {
            confetti.remove();
        }, 5000);
    }
}

const confettiKeyframes = `
@keyframes confettiFall {
    0% {
        transform: translateY(-10px) rotate(0deg);
        opacity: 1;
    }
    100% {
        transform: translateY(100vh) rotate(360deg);
        opacity: 0;
    }
}`;

if (!document.querySelector('#confetti-styles')) {
    const style = document.createElement('style');
    style.id = 'confetti-styles';
    style.textContent = confettiKeyframes;
    document.head.appendChild(style);
}

function generateTrackingId() {
    const counter = parseInt(localStorage.getItem('rjcouriers_counter')) || 1;
    const trackingId = `RJC${new Date().toISOString().slice(0,10).replace(/-/g,'')}${counter.toString().padStart(3, '0')}`;
    localStorage.setItem('rjcouriers_counter', (counter + 1).toString());
    return trackingId;
}

function calculateCost(weight, serviceType, fragile = false) {
    const service = APP_DATA.serviceTypes.find(s => s.name === serviceType);
    if (!service || !weight) return 0;
    
    let baseCost = APP_DATA.basePricing.baseRate + (weight * APP_DATA.basePricing.perKg);
    if (fragile) baseCost += 25; // Fragile handling fee
    const totalCost = baseCost * service.multiplier;
    return Math.max(totalCost, APP_DATA.basePricing.minimumCharge);
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function getStatusClass(status) {
    return `status-${status.toLowerCase().replace(/\s+/g, '-')}`;
}

function getPackageTypeIcon(type) {
    const iconMap = {
        'Document': 'fas fa-file-alt',
        'Parcel': 'fas fa-box',
        'Fragile': 'fas fa-wine-glass',
        'Electronics': 'fas fa-laptop',
        'Clothing': 'fas fa-tshirt',
        'Books': 'fas fa-book',
        'Medical': 'fas fa-pills',
        'Food': 'fas fa-utensils'
    };
    return iconMap[type] || 'fas fa-box';
}

function getStatusIcon(status) {
    const iconMap = {
        'Pickup Scheduled': 'fa-clock',
        'In Transit': 'fa-truck',
        'Out for Delivery': 'fa-shipping-fast',
        'Delivered': 'fa-check-circle'
    };
    return iconMap[status] || 'fa-box';
}

function animateCounter(elementId, targetValue) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    const startValue = 0;
    const duration = 1000;
    const startTime = performance.now();
    
    function updateCounter(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const currentValue = Math.floor(startValue + (targetValue - startValue) * easeOutQuart);
        
        element.textContent = currentValue;
        
        if (progress < 1) {
            requestAnimationFrame(updateCounter);
        }
    }
    
    requestAnimationFrame(updateCounter);
}

function showLanding() {
    hideAllModules();
    document.getElementById('landingModule').style.display = 'block';
    document.getElementById('mainNavbar').style.display = 'none';
    document.getElementById('floatingFab').style.display = 'none';
}

function showAuth(type) {
    hideAllModules();
    document.getElementById('authModule').style.display = 'block';
    document.getElementById('mainNavbar').style.display = 'none';
    
    if (type === 'signup') {
        document.getElementById('loginForm').style.display = 'none';
        document.getElementById('signupForm').style.display = 'block';
        document.getElementById('authTitle').textContent = 'Create Account';
        document.getElementById('authSubtitle').textContent = 'Join RJCouriers today';
        document.getElementById('authToggle').innerHTML = '<p>Already have an account? <button type="button" class="btn-link" onclick="toggleAuthForm()">Login here</button></p>';
    } else {
        document.getElementById('loginForm').style.display = 'block';
        document.getElementById('signupForm').style.display = 'none';
        document.getElementById('authTitle').textContent = 'Customer Login';
        document.getElementById('authSubtitle').textContent = 'Access your delivery dashboard';
        document.getElementById('authToggle').innerHTML = '<p>Don\'t have an account? <button type="button" class="btn-link" onclick="toggleAuthForm()">Sign up here</button></p>';
    }
    
    document.getElementById('loginEmail').value = '';
    document.getElementById('loginPassword').value = '';
}

function toggleAuthForm() {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const authToggle = document.getElementById('authToggle');
    
    if (loginForm.style.display === 'none') {
        loginForm.style.display = 'block';
        signupForm.style.display = 'none';
        document.getElementById('authTitle').textContent = 'Customer Login';
        document.getElementById('authSubtitle').textContent = 'Access your delivery dashboard';
        authToggle.innerHTML = '<p>Don\'t have an account? <button type="button" class="btn-link" onclick="toggleAuthForm()">Sign up here</button></p>';
    } else {
        loginForm.style.display = 'none';
        signupForm.style.display = 'block';
        document.getElementById('authTitle').textContent = 'Create Account';
        document.getElementById('authSubtitle').textContent = 'Join RJCouriers today';
        authToggle.innerHTML = '<p>Already have an account? <button type="button" class="btn-link" onclick="toggleAuthForm()">Login here</button></p>';
    }
}

function fillDemoCredentials() {
    document.getElementById('loginEmail').value = 'john@example.com';
    document.getElementById('loginPassword').value = 'customer123';
}

function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value.trim();
    
    if (!email || !password) {
        showModernError('Please enter both email and password.');
        return false;
    }
    
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
    submitBtn.disabled = true;
    
    API.login({ email, password })
        .then(() => {
            return API.getUserProfile();
        })
        .then(user => {
            currentUser = user;
            showUserDashboard();
            showModernSuccess(`Welcome back, ${user.name}! 🎉`);
        })
        .catch(error => {
            showModernError(error.message || 'Login failed. Please try again.');
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        });
    
    return false;
}

function handleSignup(event) {
    event.preventDefault();
    
    const name = document.getElementById('signupName').value.trim();
    const phone = document.getElementById('signupPhone').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const address = document.getElementById('signupAddress').value.trim();
    const password = document.getElementById('signupPassword').value.trim();
    
    if (!name || !phone || !email || !address || !password) {
        showModernError('Please fill in all required fields.');
        return false;
    }
    
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating Account...';
    submitBtn.disabled = true;
    
    const userData = {
        name,
        email,
        phone,
        address,
        password
    };
    
    API.register(userData)
        .then(() => {
            return API.login({ email, password });
        })
        .then(() => {
            return API.getUserProfile();
        })
        .then(user => {
            currentUser = user;
            showUserDashboard();
            showModernSuccess(`Welcome to RJCouriers, ${user.name}! Your account has been created successfully. 🎉`);
        })
        .catch(error => {
            showModernError(error.message || 'Registration failed. Please try again.');
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        });
    
    return false;
}

function logout() {
    API.logout();
    const navbar = document.getElementById('mainNavbar');
    navbar.style.opacity = '0';
    
    setTimeout(() => {
        currentUser = null;
        localStorage.removeItem('rjcouriers_current_user');
        showLanding();
        navbar.style.opacity = '1';
    }, 300);
}

function checkSession() {
    const userData = localStorage.getItem('rjcouriers_current_user');
    if (userData) {
        currentUser = JSON.parse(userData);
        showUserDashboard();
    } else {
        showLanding();
    }
}
function showUserDashboard() {
    hideAllModules();
    document.getElementById('mainNavbar').style.display = 'block';
    document.getElementById('floatingFab').style.display = 'block';
    
    document.getElementById('userNameNav').textContent = currentUser.name;
    
    showModule('dashboard');
}

function showModule(moduleName) {
    if (!currentUser && moduleName !== 'landing') {
        showModernError('Please login to access this feature.');
        showLanding();
        return;
    }
    
    hideAllModules();
    document.getElementById(`${moduleName}Module`).style.display = 'block';
    if (currentUser) {
        document.getElementById('floatingFab').style.display = 'block';
    }
    
    updateNavActiveState(moduleName);
    
    switch(moduleName) {
        case 'dashboard':
            initializeCustomerDashboard();
            break;
        case 'booking':
            initializeBookingModule();
            break;
        case 'tracking':
            break;
        case 'pickup':
            initializePickupModule();
            break;
        case 'delivery':
            initializeDeliveryModule();
            break;
        case 'profile':
            initializeProfileModule();
            break;
        case 'history':
            initializeHistoryModule();
            break;
    }
    
    setTimeout(() => {
        const moduleContent = document.querySelector(`#${moduleName}Module .glass-card`);
        if (moduleContent) {
            moduleContent.style.animation = 'modalSlideIn 0.5s ease forwards';
        }
    }, 100);
}

function updateNavActiveState(activeModule) {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.onclick && link.onclick.toString().includes(activeModule)) {
            link.classList.add('active');
        }
    });
}

function hideAllModules() {
    const modules = document.querySelectorAll('.module-content');
    modules.forEach(module => {
        module.style.display = 'none';
    });
}
function initializeCustomerDashboard() {
    document.getElementById('customerName').textContent = currentUser.name;
    updateCustomerStats();
    loadCustomerRecentPackages();
}

function updateCustomerStats() {
    const packages = JSON.parse(localStorage.getItem('rjcouriers_packages')) || [];
    const customerPackages = packages.filter(p => p.customerId === currentUser.id);
    
    const stats = {
        total: customerPackages.length,
        active: customerPackages.filter(p => !['Delivered'].includes(p.status)).length,
        delivered: customerPackages.filter(p => p.status === 'Delivered').length
    };
    
    animateCounter('customerTotalPackages', stats.total);
    animateCounter('customerActivePackages', stats.active);
    animateCounter('customerDeliveredPackages', stats.delivered);
}

function loadCustomerRecentPackages() {
    const packages = JSON.parse(localStorage.getItem('rjcouriers_packages')) || [];
    const customerPackages = packages.filter(p => p.customerId === currentUser.id).slice(-5).reverse();
    
    let html = '';
    if (customerPackages.length > 0) {
        html = '<table class="modern-table"><thead><tr>';
        html += '<th>Tracking ID</th><th>Receiver</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead><tbody>';
        
        customerPackages.forEach(pkg => {
            html += `<tr>
                <td><strong>${pkg.trackingId}</strong></td>
                <td>${pkg.receiver.name}</td>
                <td><span class="status-badge ${getStatusClass(pkg.status)}">${pkg.status}</span></td>
                <td>${formatDate(pkg.createdAt)}</td>
                <td>
                    <button class="btn-modern btn-sm btn-primary" onclick="viewPackageTracking('${pkg.trackingId}')">
                        <i class="fas fa-eye"></i>
                        Track
                    </button>
                    ${pkg.status === 'Pickup Scheduled' ? `
                        <button class="btn-modern btn-sm btn-success" onclick="showPickupConfirmation('${pkg.trackingId}')">
                            <i class="fas fa-hand-paper"></i>
                            Confirm Pickup
                        </button>
                    ` : ''}
                    ${pkg.status === 'Out for Delivery' ? `
                        <button class="btn-modern btn-sm btn-accent" onclick="showDeliveryConfirmation('${pkg.trackingId}')">
                            <i class="fas fa-check-circle"></i>
                            Confirm Delivery
                        </button>
                    ` : ''}
                </td>
            </tr>`;
        });
        
        html += '</tbody></table>';
    } else {
        html = '<div class="text-center text-muted"><p>No packages found. <button class="btn-link" onclick="showModule(\'booking\')">Book your first delivery!</button></p></div>';
    }
    
    document.getElementById('customerRecentPackages').innerHTML = html;
}

function initializeBookingModule() {
    setupFormDropdowns();
    setupCostCalculator();
    prefillSenderInfo();
}

function setupFormDropdowns() {
    const packageTypeSelect = document.getElementById('packageType');
    packageTypeSelect.innerHTML = '<option value="">Select Type</option>';
    APP_DATA.packageTypes.forEach(type => {
        packageTypeSelect.innerHTML += `<option value="${type}">${type}</option>`;
    });
    
    const serviceTypeSelect = document.getElementById('serviceType');
    serviceTypeSelect.innerHTML = '<option value="">Select Service</option>';
    APP_DATA.serviceTypes.forEach(service => {
        serviceTypeSelect.innerHTML += `<option value="${service.name}">${service.name} (${service.description})</option>`;
    });
    
    let serviceHtml = '';
    APP_DATA.serviceTypes.forEach(service => {
        serviceHtml += `<div class="service-item">
            <span><strong>${service.name}:</strong> ${service.description}</span>
            <span>${service.price}</span>
        </div>`;
    });
    
    serviceHtml += `<div class="pricing-info">
        <div class="price-item">
            <span><strong>Base Rate:</strong></span>
            <span>₹${APP_DATA.basePricing.baseRate}</span>
        </div>
        <div class="price-item">
            <span><strong>Per KG:</strong></span>
            <span>₹${APP_DATA.basePricing.perKg}</span>
        </div>
        <div class="price-item">
            <span><strong>Fragile Fee:</strong></span>
            <span>₹25</span>
        </div>
        <div class="price-item">
            <span><strong>Minimum:</strong></span>
            <span>₹${APP_DATA.basePricing.minimumCharge}</span>
        </div>
    </div>`;
    
    document.getElementById('serviceDetails').innerHTML = serviceHtml;
}

function prefillSenderInfo() {
    if (currentUser) {
        document.getElementById('senderName').value = currentUser.name;
        document.getElementById('senderPhone').value = currentUser.phone;
        document.getElementById('senderAddress').value = currentUser.address;
    }
}

function setupCostCalculator() {
    const weightInput = document.getElementById('packageWeight');
    const serviceSelect = document.getElementById('serviceType');
    const fragileCheckbox = document.getElementById('fragilePackage');
    
    function updateCost() {
        const weight = parseFloat(weightInput.value) || 0;
        const service = serviceSelect.value;
        const fragile = fragileCheckbox ? fragileCheckbox.checked : false;
        
        if (weight > 0 && service) {
            const cost = calculateCost(weight, service, fragile);
            const serviceData = APP_DATA.serviceTypes.find(s => s.name === service);
            
            let breakdown = `<div style="animation: modalSlideIn 0.3s ease;">`;
            breakdown += `<div class="service-item"><span>Base Rate:</span><span>₹${APP_DATA.basePricing.baseRate}</span></div>`;
            breakdown += `<div class="service-item"><span>Weight (${weight}kg @ ₹${APP_DATA.basePricing.perKg}/kg):</span><span>₹${weight * APP_DATA.basePricing.perKg}</span></div>`;
            if (fragile) {
                breakdown += `<div class="service-item"><span>Fragile Handling:</span><span>₹25</span></div>`;
            }
            breakdown += `<div class="service-item"><span>Service Multiplier (${serviceData.multiplier}x):</span><span>₹${cost.toFixed(2)}</span></div>`;
            breakdown += `</div>`;
            
            document.getElementById('costBreakdown').innerHTML = breakdown;
            animateCounter('totalCost', cost);
        } else {
            document.getElementById('costBreakdown').innerHTML = '<p class="text-muted">Enter package weight and service type to calculate cost</p>';
            document.getElementById('totalCost').textContent = '0';
        }
    }
    
    if (weightInput && serviceSelect) {
        weightInput.removeEventListener('input', updateCost);
        serviceSelect.removeEventListener('change', updateCost);
        
        weightInput.addEventListener('input', updateCost);
        serviceSelect.addEventListener('change', updateCost);
        
        if (fragileCheckbox) {
            fragileCheckbox.removeEventListener('change', updateCost);
            fragileCheckbox.addEventListener('change', updateCost);
        }
        
        updateCost();
    }
}

function handleBookingSubmit(event) {
    event.preventDefault();
    
    const form = document.getElementById('bookingForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return false;
    }
    
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Booking Package...</span>';
    submitBtn.disabled = true;
    
    setTimeout(() => {
        const fragileCheckbox = document.getElementById('fragilePackage');
        const fragile = fragileCheckbox ? fragileCheckbox.checked : false;
        const weight = parseFloat(document.getElementById('packageWeight').value);
        const serviceType = document.getElementById('serviceType').value;
        
        const packageData = {
            id: Date.now(),
            trackingId: generateTrackingId(),
            customerId: currentUser.id,
            sender: {
                name: document.getElementById('senderName').value.trim(),
                phone: document.getElementById('senderPhone').value.trim(),
                address: document.getElementById('senderAddress').value.trim()
            },
            receiver: {
                name: document.getElementById('receiverName').value.trim(),
                phone: document.getElementById('receiverPhone').value.trim(),
                email: document.getElementById('receiverEmail').value.trim(),
                address: document.getElementById('receiverAddress').value.trim()
            },
            packageDetails: {
                type: document.getElementById('packageType').value,
                weight: weight,
                fragile: fragile
            },
            serviceType: serviceType,
            cost: calculateCost(weight, serviceType, fragile),
            status: 'Pickup Scheduled',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            estimatedDelivery: new Date(Date.now() + APP_DATA.serviceTypes.find(s => s.name === serviceType).estimatedHours * 60 * 60 * 1000).toISOString(),
            statusHistory: [{
                status: 'Pickup Scheduled',
                timestamp: new Date().toISOString(),
                location: 'Origin',
                notes: 'Package booked successfully'
            }]
        };
        
        const packages = JSON.parse(localStorage.getItem('rjcouriers_packages')) || [];
        packages.push(packageData);
        localStorage.setItem('rjcouriers_packages', JSON.stringify(packages));
        
        showModernSuccess(`Package booked successfully! 🎉<br><strong>Tracking ID: ${packageData.trackingId}</strong><br>Cost: ₹${packageData.cost}<br>Estimated Delivery: ${formatDate(packageData.estimatedDelivery)}`);
        form.reset();
        
        // Reset cost calculator
        if (document.getElementById('costBreakdown')) {
            document.getElementById('costBreakdown').innerHTML = '<p class="text-muted">Enter package weight and service type to calculate cost</p>';
            document.getElementById('totalCost').textContent = '0';
        }
        
        prefillSenderInfo();
        
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        
        if (document.getElementById('dashboardModule').style.display !== 'none') {
            updateCustomerStats();
            loadCustomerRecentPackages();
        }
    }, 1500);
    
    return false;
}

function showPickupConfirmation(trackingId) {
    const packages = JSON.parse(localStorage.getItem('rjcouriers_packages')) || [];
    const packageData = packages.find(p => p.trackingId === trackingId);
    
    if (!packageData) {
        showModernError('Package not found.');
        return;
    }
    
    currentPackageForPickup = packageData;
    showModule('pickup');
    
    let detailsHtml = `
        <div class="package-info">
            <div class="info-row">
                <span class="info-label">Tracking ID:</span>
                <span class="info-value">${packageData.trackingId}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Package Type:</span>
                <span class="info-value">${packageData.packageDetails.type}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Weight:</span>
                <span class="info-value">${packageData.packageDetails.weight}kg</span>
            </div>
            <div class="info-row">
                <span class="info-label">Receiver:</span>
                <span class="info-value">${packageData.receiver.name}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Service:</span>
                <span class="info-value">${packageData.serviceType}</span>
            </div>
        </div>
    `;
    
    document.getElementById('pickupPackageDetails').innerHTML = detailsHtml;
    document.getElementById('pickupConfirmerName').value = currentUser.name;
}

function initializePickupModule() {
}

function handlePickupSubmit(event) {
    event.preventDefault();
    
    if (!currentPackageForPickup) {
        showModernError('No package selected for pickup confirmation.');
        return false;
    }
    
    const confirmerName = document.getElementById('pickupConfirmerName').value.trim();
    const notes = document.getElementById('pickupNotes').value.trim();
    
    if (!confirmerName) {
        showModernError('Please enter confirmer name.');
        return false;
    }
    
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Confirming Pickup...</span>';
    submitBtn.disabled = true;
    
    setTimeout(() => {
        const packages = JSON.parse(localStorage.getItem('rjcouriers_packages')) || [];
        const packageIndex = packages.findIndex(p => p.id === currentPackageForPickup.id);
        
        if (packageIndex === -1) {
            showModernError('Package not found');
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
            return false;
        }
        
        packages[packageIndex].status = 'In Transit';
        packages[packageIndex].updatedAt = new Date().toISOString();
        
        packages[packageIndex].statusHistory.push({
            status: 'In Transit',
            timestamp: new Date().toISOString(),
            location: 'Pickup Location',
            notes: notes || `Pickup confirmed by ${confirmerName}`
        });
        
        localStorage.setItem('rjcouriers_packages', JSON.stringify(packages));
        
        showModernSuccess(`Pickup confirmed successfully! ✅<br>Package is now "In Transit"`);
        
        document.getElementById('pickupForm').reset();
        currentPackageForPickup = null;
        
        showModule('dashboard');
        
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }, 1000);
    
    return false;
}
function showDeliveryConfirmation(trackingId) {
    const packages = JSON.parse(localStorage.getItem('rjcouriers_packages')) || [];
    const packageData = packages.find(p => p.trackingId === trackingId);
    
    if (!packageData) {
        showModernError('Package not found.');
        return;
    }
    
    currentPackageForDelivery = packageData;
    showModule('delivery');
    
    let detailsHtml = `
        <div class="package-info">
            <div class="info-row">
                <span class="info-label">Tracking ID:</span>
                <span class="info-value">${packageData.trackingId}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Package Type:</span>
                <span class="info-value">${packageData.packageDetails.type}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Weight:</span>
                <span class="info-value">${packageData.packageDetails.weight}kg</span>
            </div>
            <div class="info-row">
                <span class="info-label">Receiver:</span>
                <span class="info-value">${packageData.receiver.name}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Service:</span>
                <span class="info-value">${packageData.serviceType}</span>
            </div>
        </div>
    `;
    
    document.getElementById('deliveryPackageDetails').innerHTML = detailsHtml;
    document.getElementById('deliveryReceiverName').value = packageData.receiver.name;
}

function initializeDeliveryModule() {
    const canvas = document.getElementById('signatureCanvas');
    if (canvas) {
        signatureCanvas = canvas;
        const ctx = canvas.getContext('2d');
        
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        
        canvas.addEventListener('mousedown', startDrawing);
        canvas.addEventListener('mousemove', draw);
        canvas.addEventListener('mouseup', stopDrawing);
        canvas.addEventListener('mouseout', stopDrawing);
        
        canvas.addEventListener('touchstart', handleTouch);
        canvas.addEventListener('touchmove', handleTouch);
        canvas.addEventListener('touchend', stopDrawing);
    }
}

function startDrawing(e) {
    isDrawing = true;
    const rect = signatureCanvas.getBoundingClientRect();
    const ctx = signatureCanvas.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
}

function draw(e) {
    if (!isDrawing) return;
    const rect = signatureCanvas.getBoundingClientRect();
    const ctx = signatureCanvas.getContext('2d');
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
}

function stopDrawing() {
    if (isDrawing) {
        isDrawing = false;
        const ctx = signatureCanvas.getContext('2d');
        ctx.beginPath();
    }
}

function handleTouch(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent(e.type === 'touchstart' ? 'mousedown' : 
                                     e.type === 'touchmove' ? 'mousemove' : 'mouseup', {
        clientX: touch.clientX,
        clientY: touch.clientY
    });
    signatureCanvas.dispatchEvent(mouseEvent);
}

function clearSignature() {
    if (signatureCanvas) {
        const ctx = signatureCanvas.getContext('2d');
        ctx.clearRect(0, 0, signatureCanvas.width, signatureCanvas.height);
    }
}

function handleDeliverySubmit(event) {
    event.preventDefault();
    
    if (!currentPackageForDelivery) {
        showModernError('No package selected for delivery confirmation.');
        return false;
    }
    
    const receiverName = document.getElementById('deliveryReceiverName').value.trim();
    const notes = document.getElementById('deliveryNotes').value.trim();
    
    if (!receiverName) {
        showModernError('Please enter receiver name.');
        return false;
    }
    
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Confirming Delivery...</span>';
    submitBtn.disabled = true;
    
    setTimeout(() => {
        const packages = JSON.parse(localStorage.getItem('rjcouriers_packages')) || [];
        const packageIndex = packages.findIndex(p => p.id === currentPackageForDelivery.id);
        
        if (packageIndex === -1) {
            showModernError('Package not found');
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
            return false;
        }
        
        packages[packageIndex].status = 'Delivered';
        packages[packageIndex].updatedAt = new Date().toISOString();
        
        packages[packageIndex].statusHistory.push({
            status: 'Delivered',
            timestamp: new Date().toISOString(),
            location: 'Delivery Address',
            notes: notes || `Delivered to ${receiverName}`
        });
        
        localStorage.setItem('rjcouriers_packages', JSON.stringify(packages));
        
        showModernSuccess(`Delivery confirmed successfully! 🎉<br>Package has been delivered to ${receiverName}`);
        
        // Reset form and signature
        document.getElementById('deliveryForm').reset();
        clearSignature();
        currentPackageForDelivery = null;
        
        // Go back to dashboard
        showModule('dashboard');
        
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }, 1000);
    
    return false;
}

// Tracking Module
function handleTrackingSubmit(event) {
    event.preventDefault();
    
    const trackingId = document.getElementById('trackingId').value.trim();
    if (!trackingId) {
        showModernError('Please enter a tracking ID');
        return false;
    }
    
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    submitBtn.disabled = true;
    
    setTimeout(() => {
        const packages = JSON.parse(localStorage.getItem('rjcouriers_packages')) || [];
        const packageData = packages.find(p => p.trackingId.toLowerCase() === trackingId.toLowerCase());
        
        if (!packageData) {
            showModernError('Package not found. Please check the tracking ID and try again.');
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
            return false;
        }
        
        displayTrackingResult(packageData);
        
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }, 1000);
    
    return false;
}

function handleQuickTrackingSubmit(event) {
    event.preventDefault();
    
    const trackingId = document.getElementById('quickTrackingId').value.trim();
    if (!trackingId) {
        showModernError('Please enter a tracking ID');
        return false;
    }
    
    // Simulate tracking search
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    submitBtn.disabled = true;
    
    setTimeout(() => {
        // Switch to tracking module and search
        showAuth('login');
        setTimeout(() => {
            showModernError('Please login to track your packages or use the tracking page for detailed tracking.');
        }, 500);
        
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }, 1000);
    
    return false;
}

function displayTrackingResult(packageData) {
    const statuses = ['Pickup Scheduled', 'In Transit', 'Out for Delivery', 'Delivered'];
    const currentStatusIndex = statuses.indexOf(packageData.status);
    
    let progressHtml = '<div class="tracking-progress">';
    statuses.forEach((status, index) => {
        let stepClass = 'progress-step';
        if (index < currentStatusIndex) stepClass += ' completed';
        if (index === currentStatusIndex) stepClass += ' active';
        
        progressHtml += `
            <div class="${stepClass}">
                <div class="step-icon">
                    <i class="fas ${getStatusIcon(status)}"></i>
                </div>
                <div class="step-label">${status}</div>
            </div>
        `;
    });
    progressHtml += '</div>';
    
    let trackingHtml = `
        <div class="glass-card" style="animation: modalSlideIn 0.5s ease;">
            <div class="card-header" style="background: linear-gradient(135deg, rgba(67, 233, 123, 0.3), rgba(56, 249, 215, 0.3)); border-radius: 20px 20px 0 0;">
                <h3><i class="fas fa-check-circle"></i> Package Found</h3>
            </div>
            <div class="card-content">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-bottom: 2rem;">
                    <div>
                        <h4 style="color: #43e97b; margin-bottom: 1rem;">Package Details</h4>
                        <div class="package-info">
                            <div class="info-row">
                                <span class="info-label">Tracking ID:</span>
                                <span class="info-value">${packageData.trackingId}</span>
                            </div>
                            <div class="info-row">
                                <span class="info-label">Type:</span>
                                <span class="info-value">
                                    <i class="${getPackageTypeIcon(packageData.packageDetails.type)}"></i>
                                    ${packageData.packageDetails.type}
                                </span>
                            </div>
                            <div class="info-row">
                                <span class="info-label">Weight:</span>
                                <span class="info-value">${packageData.packageDetails.weight}kg</span>
                            </div>
                            <div class="info-row">
                                <span class="info-label">Fragile:</span>
                                <span class="info-value">${packageData.packageDetails.fragile ? 'Yes' : 'No'}</span>
                            </div>
                            <div class="info-row">
                                <span class="info-label">Service:</span>
                                <span class="info-value">${packageData.serviceType}</span>
                            </div>
                            <div class="info-row">
                                <span class="info-label">Current Status:</span>
                                <span class="info-value">
                                    <span class="status-badge ${getStatusClass(packageData.status)}">${packageData.status}</span>
                                </span>
                            </div>
                        </div>
                    </div>
                    <div>
                        <h4 style="color: #43e97b; margin-bottom: 1rem;">Sender & Receiver</h4>
                        <div class="package-info">
                            <div class="info-row">
                                <span class="info-label">From:</span>
                                <span class="info-value">${packageData.sender.name}</span>
                            </div>
                            <div class="info-row">
                                <span class="info-label">To:</span>
                                <span class="info-value">${packageData.receiver.name}</span>
                            </div>
                            <div class="info-row">
                                <span class="info-label">Booked:</span>
                                <span class="info-value">${formatDate(packageData.createdAt)}</span>
                            </div>
                            <div class="info-row">
                                <span class="info-label">Last Updated:</span>
                                <span class="info-value">${formatDate(packageData.updatedAt)}</span>
                            </div>
                            <div class="info-row">
                                <span class="info-label">Estimated Delivery:</span>
                                <span class="info-value">${formatDate(packageData.estimatedDelivery)}</span>
                            </div>
                        </div>
                    </div>
                </div>
                ${progressHtml}
                <div style="margin-top: 2rem;">
                    <h4 style="color: #43e97b; margin-bottom: 1rem;">Status History</h4>
                    <div class="package-info">
                        ${packageData.statusHistory.map(history => `
                            <div class="info-row">
                                <span class="info-label">${formatDate(history.timestamp)}</span>
                                <span class="info-value">
                                    <span class="status-badge ${getStatusClass(history.status)}">${history.status}</span>
                                    ${history.notes ? `<br><small class="text-muted" style="font-size: 0.8rem;">${history.notes}</small>` : ''}
                                    ${history.location ? `<br><small class="text-muted" style="font-size: 0.8rem;">Location: ${history.location}</small>` : ''}
                                </span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('trackingResult').innerHTML = trackingHtml;
    document.getElementById('trackingResult').style.display = 'block';
}

function viewPackageTracking(trackingId) {
    showModule('tracking');
    setTimeout(() => {
        document.getElementById('trackingId').value = trackingId;
        document.getElementById('trackingForm').dispatchEvent(new Event('submit'));
    }, 500);
}

// Profile Module
function initializeProfileModule() {
    if (currentUser) {
        document.getElementById('profileName').value = currentUser.name;
        document.getElementById('profilePhone').value = currentUser.phone;
        document.getElementById('profileEmail').value = currentUser.email;
        document.getElementById('profileAddress').value = currentUser.address;
    }
}

function handleProfileSubmit(event) {
    event.preventDefault();
    
    const name = document.getElementById('profileName').value.trim();
    const phone = document.getElementById('profilePhone').value.trim();
    const address = document.getElementById('profileAddress').value.trim();
    
    if (!name || !phone || !address) {
        showModernError('Please fill in all required fields.');
        return false;
    }
    
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Saving Changes...</span>';
    submitBtn.disabled = true;
    
    setTimeout(() => {
        // Update current user
        currentUser.name = name;
        currentUser.phone = phone;
        currentUser.address = address;
        
        // Update in localStorage
        const customers = JSON.parse(localStorage.getItem('rjcouriers_customers'));
        const customerIndex = customers.findIndex(c => c.id === currentUser.id);
        if (customerIndex !== -1) {
            customers[customerIndex] = currentUser;
            localStorage.setItem('rjcouriers_customers', JSON.stringify(customers));
        }
        
        localStorage.setItem('rjcouriers_current_user', JSON.stringify(currentUser));
        
        // Update navigation
        document.getElementById('userNameNav').textContent = currentUser.name;
        
        showModernSuccess('Profile updated successfully! ✅');
        
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }, 1000);
    
    return false;
}

// Booking History Module
function initializeHistoryModule() {
    setupHistoryFilters();
    loadBookingHistory();
}

function setupHistoryFilters() {
    const statusFilter = document.getElementById('historyStatusFilter');
    statusFilter.innerHTML = '<option value="">All Status</option>';
    APP_DATA.statusTypes.forEach(status => {
        statusFilter.innerHTML += `<option value="${status}">${status}</option>`;
    });
}

function loadBookingHistory() {
    const packages = JSON.parse(localStorage.getItem('rjcouriers_packages')) || [];
    const customerPackages = packages.filter(p => p.customerId === currentUser.id);
    
    let html = '';
    if (customerPackages.length > 0) {
        html = '<table class="modern-table"><thead><tr>';
        html += '<th>Tracking ID</th><th>Receiver Name</th><th>Status</th><th>Service</th><th>Cost</th><th>Created Date</th><th>Actions</th></tr></thead><tbody>';
        
        customerPackages.forEach(pkg => {
            html += `<tr>
                <td><strong>${pkg.trackingId}</strong></td>
                <td>${pkg.receiver.name}<br><small class="text-muted">${pkg.receiver.phone}</small></td>
                <td><span class="status-badge ${getStatusClass(pkg.status)}">${pkg.status}</span></td>
                <td>${pkg.serviceType}</td>
                <td style="font-weight: 600; color: #43e97b;">₹${pkg.cost}</td>
                <td>${formatDate(pkg.createdAt)}</td>
                <td>
                    <button class="btn-modern btn-sm btn-primary" onclick="viewPackageTracking('${pkg.trackingId}')">
                        <i class="fas fa-eye"></i>
                        Track
                    </button>
                    ${pkg.status === 'Pickup Scheduled' ? `
                        <button class="btn-modern btn-sm btn-success" onclick="showPickupConfirmation('${pkg.trackingId}')">
                            <i class="fas fa-hand-paper"></i>
                            Confirm Pickup
                        </button>
                    ` : ''}
                    ${pkg.status === 'Out for Delivery' ? `
                        <button class="btn-modern btn-sm btn-accent" onclick="showDeliveryConfirmation('${pkg.trackingId}')">
                            <i class="fas fa-check-circle"></i>
                            Confirm Delivery
                        </button>
                    ` : ''}
                </td>
            </tr>`;
        });
        
        html += '</tbody></table>';
    } else {
        html = '<div class="text-center text-muted"><p>No bookings found. <button class="btn-link" onclick="showModule(\'booking\')">Create your first booking!</button></p></div>';
    }
    
    document.getElementById('historyTableContent').innerHTML = html;
}

function filterHistory() {
    // For now, just reload all history - can be enhanced for actual filtering
    loadBookingHistory();
}

function searchHistory() {
    // For now, just reload all history - can be enhanced for actual searching
    loadBookingHistory();
}

// Global functions for onclick handlers
window.showModule = showModule;
window.showLanding = showLanding;
window.showAuth = showAuth;
window.toggleAuthForm = toggleAuthForm;
window.fillDemoCredentials = fillDemoCredentials;
window.logout = logout;
window.closeModal = closeModal;
window.viewPackageTracking = viewPackageTracking;
window.showPickupConfirmation = showPickupConfirmation;
window.showDeliveryConfirmation = showDeliveryConfirmation;
window.clearSignature = clearSignature;
window.loadBookingHistory = loadBookingHistory;
window.filterHistory = filterHistory;
window.searchHistory = searchHistory;

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    initializeData();
    checkSession();
    
    // Authentication forms
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.getElementById('signupForm').addEventListener('submit', handleSignup);
    
    // Booking form
    document.getElementById('bookingForm').addEventListener('submit', handleBookingSubmit);
    
    // Tracking forms
    document.getElementById('trackingForm').addEventListener('submit', handleTrackingSubmit);
    document.getElementById('quickTrackingForm').addEventListener('submit', handleQuickTrackingSubmit);
    
    // Pickup form
    document.getElementById('pickupForm').addEventListener('submit', handlePickupSubmit);
    
    // Delivery form
    document.getElementById('deliveryForm').addEventListener('submit', handleDeliverySubmit);
    
    // Profile form
    document.getElementById('profileForm').addEventListener('submit', handleProfileSubmit);
    
    // Close modals on outside click
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal-overlay')) {
            const modal = e.target;
            closeModal(modal.id);
        }
    });
    
    // Modern input animations
    const inputs = document.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            if (this.parentElement) {
                this.parentElement.style.transform = 'scale(1.02)';
            }
        });
        
        input.addEventListener('blur', function() {
            if (this.parentElement) {
                this.parentElement.style.transform = 'scale(1)';
            }
        });
    });
});