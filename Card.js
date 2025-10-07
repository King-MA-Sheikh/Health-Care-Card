// Load data from localStorage and display on card
document.addEventListener('DOMContentLoaded', function() {
    const cardData = JSON.parse(localStorage.getItem('healthCardData'));
    const pdfButton = document.getElementById('pdfButton');
    
    if (cardData) {
        // Display data on main card
        document.getElementById('displayName').textContent = cardData.name;
        document.getElementById('displayFName').textContent = cardData.fname;
        document.getElementById('displayUID').textContent = cardData.uid;
        document.getElementById('displayContact').textContent = cardData.contact;
        document.getElementById('displayAddress').textContent = cardData.address;
        
        // Display data on PDF card
        document.getElementById('pdfDisplayName').textContent = cardData.name;
        document.getElementById('pdfDisplayFName').textContent = cardData.fname;
        document.getElementById('pdfDisplayUID').textContent = cardData.uid;
        document.getElementById('pdfDisplayContact').textContent = cardData.contact;
        document.getElementById('pdfDisplayAddress').textContent = cardData.address;
        
        if (cardData.photo) {
            document.getElementById('userPhoto').src = cardData.photo;
            document.getElementById('pdfUserPhoto').src = cardData.photo;
        }
        
        // Enable PDF button
        pdfButton.disabled = false;
    } else {
        // If no data found, disable PDF button and redirect to form
        pdfButton.disabled = true;
        alert('No data found. Please fill out the form first.');
        window.location.href = 'index.html';
    }
});

// Function to convert image to base64 (for local images)
function imageToBase64(img) {
    return new Promise((resolve) => {
        // For data URLs (user uploaded photos), use as is
        if (img.src.startsWith('data:')) {
            resolve(img.src);
            return;
        }
        
        // For local files, try to convert
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        
        try {
            ctx.drawImage(img, 0, 0);
            const dataURL = canvas.toDataURL('image/png');
            resolve(dataURL);
        } catch (error) {
            console.warn('Could not convert image to base64:', error);
            // Return original src as fallback
            resolve(img.src);
        }
    });
}

// Function to fetch and convert image to base64
function fetchImageAsBase64(url) {
    return new Promise((resolve, reject) => {
        fetch(url)
            .then(response => response.blob())
            .then(blob => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.readAsDataURL(blob);
            })
            .catch(error => reject(error));
    });
}

// Main PDF generation function
async function generatePDF() {
    const cardData = JSON.parse(localStorage.getItem('healthCardData'));
    
    if (!cardData) {
        alert('No data available to generate PDF. Please fill the form first.');
        return;
    }

    const loading = document.getElementById('loading');
    const element = document.getElementById('pdfContainer');
    const pdfButton = document.getElementById('pdfButton');
    
    try {
        // Show loading and disable button
        loading.style.display = 'flex';
        pdfButton.disabled = true;
        
        // Show PDF container temporarily
        element.style.display = 'flex';
        
        // Convert logo to base64 to ensure it appears in PDF
        try {
            const logoBase64 = await fetchImageAsBase64('logo.png');
            document.getElementById('pdfLogo').src = logoBase64;
        } catch (error) {
            console.warn('Could not load logo.png:', error);
        }
        
        // Convert QR code to base64
        try {
            const qrBase64 = await fetchImageAsBase64('qr.png');
            document.getElementById('pdfQr').src = qrBase64;
        } catch (error) {
            console.warn('Could not load qr.png:', error);
        }
        
        // Convert user photo to base64 if needed
        const userPhoto = document.getElementById('pdfUserPhoto');
        if (userPhoto.src && !userPhoto.src.startsWith('data:')) {
            try {
                const userPhotoBase64 = await fetchImageAsBase64(userPhoto.src);
                userPhoto.src = userPhotoBase64;
            } catch (error) {
                console.warn('Could not convert user photo to base64:', error);
            }
        }
        
        // Wait for DOM to update
        await new Promise(resolve => setTimeout(resolve, 1000));

        // PDF options optimized for single page
        const opt = {
            margin: [0, 0, 5, 5], // Reduced margins
            filename: `Health_Card_${cardData.uid}.pdf`,
            image: { 
                type: 'jpeg', 
                quality: 0.95 
            },
            html2canvas: { 
                scale: 2,
                useCORS: true,
                logging: false,

                scrollX: 0,
                scrollY: 0,

            },
            jsPDF: { 
                unit: 'mm', 
                format: 'a4', 
                orientation: 'portrait',
            },
            pagebreak: { 
                mode: ['avoid-all'] 
            }
        };

        // Generate and save PDF
        await html2pdf().set(opt).from(element).save();
        
    } catch (error) {
        console.error('PDF generation error:', error);
        
        // Try alternative method with even smaller margins
        try {
            console.log('Trying alternative PDF generation...');
            
            const simpleOpt = {
                margin: [2, 2, 2, 2],
                filename: `Health_Card_${cardData.uid}.pdf`,
                html2canvas: { 
                    scale: 2,
                    useCORS: true,
                    logging: false
                },
                jsPDF: { 
                    unit: 'mm', 
                    format: 'a4', 
                    orientation: 'portrait' 
                }
            };
            
            await html2pdf().set(simpleOpt).from(element).save();
        } catch (fallbackError) {
            console.error('Fallback PDF generation failed:', fallbackError);
            alert('Error generating PDF. Please try using a local web server for best results.');
        }
    } finally {
        // Always clean up
        loading.style.display = 'none';
        element.style.display = 'none';
        pdfButton.disabled = false;
        
        // Reload images to their original state
        if (cardData.photo) {
            document.getElementById('pdfUserPhoto').src = cardData.photo;
        }
        document.getElementById('pdfLogo').src = 'logo.png';
        document.getElementById('pdfQr').src = 'qr.png';
    }
}