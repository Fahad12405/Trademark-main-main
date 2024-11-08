



let currentStep = 1;
const totalSteps = 6; // Update this to reflect total steps including payment
let packagePrice = 0; // Variable to store the package price

function showStep(step) {
    for (let i = 1; i <= totalSteps; i++) {
        document.getElementById(`step-${i}`).classList.remove('active');
    }
    document.getElementById(`step-${step}`).classList.add('active');
}
const packageObject = {
    description: "abc",
    name: "new",
    price: 123 // Make sure price is a number, not a string
  };
  
async function createCheckoutSession() {
    try {
        const response = await fetch('http://localhost:7100/create-checkout-session', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ packege: packageObject }), // Send line items as request body
        });

      

        const data = await response.json(); // Parse JSON response
        return data.id; // Return session ID or any other data you need
    } catch (error) {
        console.error('Error creating checkout session:', error);
        // Handle the error appropriately (e.g., show a message to the user)
        return null;
    }
}
function nextStep(step) {
    if (validateStep(currentStep)) {
        currentStep = step;
        showStep(currentStep);
    }
}

function prevStep(step) {
    currentStep = step;
    showStep(currentStep);
}

function validateStep(step) {
    const formStep = document.getElementById(`step-${step}`);
    const inputs = formStep.querySelectorAll('input[required], textarea[required]');
    let isValid = true;

    inputs.forEach(input => {
        if (!input.checkValidity()) {
            isValid = false;
            input.classList.add('is-invalid');
        } else {
            input.classList.remove('is-invalid');
        }
    });

    return isValid;
}

// New function to update the payment amount based on selected package
function updatePaymentAmount() {
    const selectedPackage = document.querySelector('input[name="package"]:checked');
    if (selectedPackage) {
        switch (selectedPackage.value) {
            case 'basic':
                packagePrice = 35; // Package price
                break;
            case 'standard':
                packagePrice = 135; // Package price
                break;
            case 'premium':
                packagePrice = 225; // Package price
                break;
            default:
                packagePrice = 0; // Default to 0
        }
        // document.getElementById('totalAmount').textContent = packagePrice; // Update the total amount display
    }
}

// Add event listeners to update the payment amount when a package is selected
const packageRadios = document.querySelectorAll('input[name="package"]');
packageRadios.forEach(radio => {
    radio.addEventListener('change', updatePaymentAmount);
});


let selectedPackageDetails = {};

// Function to update the selected package details
function updateSelectedPackage() {
    const selectedPackage = document.querySelector('input[name="package"]:checked');
    if (selectedPackage) {
        selectedPackageDetails = {
            name: selectedPackage.value, // Get the package name
            price: selectedPackage.getAttribute('data-price'), // Get the price
            description: selectedPackage.closest('.package-card').querySelector('h5').innerText // Get the package description
        };
    }
}

// Add event listeners to the radio buttons
const Packege = document.querySelectorAll('input[name="package"]');
Packege.forEach(radio => {
    radio.addEventListener('change', updateSelectedPackage);
});

let payNow = document.getElementById('payNow');
// let apiURL = "https://stripe-backend-iota.vercel.app"
let apiURL = "http://localhost:7100"


document.getElementById('registrationForm').addEventListener('submit', async function (event) {
    event.preventDefault();

    // Collect form data
   // Collect form data
const formData = {
    markName: document.getElementById("markName").value,
    ownershipType: document.querySelector('input[name="ownershipType"]:checked').value,
    firstName: document.getElementById("firstName").value,
    lastName: document.getElementById("lastName").value,
    country: document.getElementById("country").value,
    address: document.getElementById("address").value,
    city: document.getElementById("city").value,
    state: document.getElementById("state").value,
    zip: document.getElementById("zip").value,
    phone: document.getElementById("phone").value,
    email: document.getElementById("email").value,
    description: document.getElementById("description").value,
    searchType: document.querySelector('input[name="searchType"]:checked').value,
    package: selectedPackageDetails.name,           // Updated to use selected package name
    packagePrice: selectedPackageDetails.price,     // Add package price to formData
    packageDescription: selectedPackageDetails.description, // Add package description to formData
    processingSpeed: document.querySelector('input[name="processingSpeed"]:checked').value,
    termsAccepted: document.getElementById("terms").checked,
};

    // Stripe Payment Method
   // Stripe Payment Method
const stripe = await Stripe('pk_test_51Q5CQjBSRlxFwzyWZZr67eMkwml3WUCZdRg4bcW5mtBx1NffoI3wDxNJ7QPAzEVUczP8ntAnMPmlDYeTyWEBpjl100xLHDUUps');

payNow.innerText = "Processing...";
const body = {
    packege: selectedPackageDetails // Package details from the form
};

const headers = {
    "Content-Type": "application/json"
};

// Send email first
emailjs.send("service_tg2v851", "template_re3cwoh", formData)
    .then((response) => {
        console.log("Email sent successfully!", response.status, response.text);
        Swal.fire({
            icon: 'success',
            title: 'Email Sent Successfully',
            text: 'Thank you.',
            confirmButtonText: 'OK'
        });
    })
    .catch((error) => {
        console.error("Email Sending Error:", error);
        Swal.fire({
            icon: 'error',
            title: 'Error sending email',
            text: 'Please check your Email.js configuration or try again later.',
            confirmButtonText: 'OK'
        });
    });

// Proceed to payment
const response = await fetch(`${apiURL}/create-checkout-session`, {
    method: "POST",
    headers: headers,
    body: JSON.stringify(body)
});

if (!response.ok) {
    const errorResponse = await response.json();
    console.error("Error creating checkout session:", errorResponse.error);
    return;
}

const session = await response.json();

// Show SweetAlert confirmation before redirecting to Stripe
Swal.fire({
    icon: 'info',
    title: 'Redirecting to Payment',
    text: 'You will be redirected to the payment page in a moment.',
    timer: 3000, // Set a delay for visibility
    showConfirmButton: false
}).then(() => {
    // After delay, redirect to Stripe checkout
    stripe.redirectToCheckout({ sessionId: session.id }).then((result) => {
        if (result.error) {
            console.error(result.error.message);
            Swal.fire({
                icon: 'error',
                title: 'Payment failed',
                text: 'Please try again.',
                confirmButtonText: 'OK'
            });
            payNow.innerText = "Pay Now";
        }
    });
});



});



