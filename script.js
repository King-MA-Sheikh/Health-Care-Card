// Generate 6-character alphanumeric ID
function generateUniqueId() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = 'AG';
    for (let i = 0; i < 4; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

// Handle photo preview
document.getElementById('photo').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const preview = document.getElementById('photoPreview');
            preview.src = e.target.result;
            preview.style.display = 'block';
        }
        reader.readAsDataURL(file);
    }
});

// Handle form submission
document.getElementById('registrationForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Generate unique ID
    const uniqueId = generateUniqueId();
    
    // Get form data
    const formData = {
        name: document.getElementById('name').value,
        fname: document.getElementById('fname').value,
        contact: document.getElementById('contact').value,
        address: document.getElementById('address').value,
        uid: uniqueId,
        photo: document.getElementById('photoPreview').src
    };
    
    // Store data in localStorage
    localStorage.setItem('healthCardData', JSON.stringify(formData));
    
    // Redirect to card page
    window.location.href = 'Card.html';
});