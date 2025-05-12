const Tesseract = require('tesseract.js');
const path = require('path');

/**
 * Checks if the document URL has a valid extension (.pdf, .jpg, .png, .webp)
 * Handles URLs with query parameters (e.g. ?Expires=..., etc.)
 */
function isValidDocumentFormat(documentUrl) {
  const cleanUrl = documentUrl.split('?')[0]; // Strip query params
  const ext = path.extname(cleanUrl).toLowerCase(); // Get the extension
  return ['.pdf', '.jpg', '.png', '.webp'].includes(ext);
}

/**
 * Extracts necessary details from the OCR result
 * Checks for hospital name, patient name, and bill details
 */
function extractRequiredDetails(extractedText) {
  // Example: Regex patterns for detecting hospital name, patient name, and bill amount
  const hospitalNamePattern = /(?:Hospital|Clinic):?\s*([A-Za-z\s]+)/i;
  const patientNamePattern = /(?:Patient|Name):?\s*([A-Za-z\s]+)/i;
  const billAmountPattern = /(?:Bill|Amount):?\s*(\d+(\.\d{2})?)/i;

  // Extract details using regex patterns
  const hospitalNameMatch = extractedText.match(hospitalNamePattern);
  const patientNameMatch = extractedText.match(patientNamePattern);
  const billAmountMatch = extractedText.match(billAmountPattern);

  return {
    hospitalName: hospitalNameMatch ? hospitalNameMatch[1] : null,
    patientName: patientNameMatch ? patientNameMatch[1] : null,
    billAmount: billAmountMatch ? billAmountMatch[1] : null,
  };
}

/**
 * Performs OCR on a remote image URL if it's a valid format
 */
async function verifyDocument(documentUrl, recipientName) {
    console.log("Received document URL:", documentUrl);

    if (!isValidDocumentFormat(documentUrl)) {
        throw new Error('Unsupported file format. Please upload a PDF, JPG, PNG, or WEBP file.');
    }

    try {
        const result = await Tesseract.recognize(documentUrl, 'eng', {
            logger: m => console.log(m)
        });
    
        console.log("Full OCR Result:", result);
    
        const extractedText = result.data.text?.trim();
        if (!extractedText) {
            throw new Error("Document seems invalid or contains no readable text.");
        }
        
        // Extract hospital name, patient name, and bill amount from the OCR text
        const { hospitalName, patientName, billAmount } = extractRequiredDetails(extractedText);
        
        if (!hospitalName || !patientName || !billAmount) {
            throw new Error("Required information (hospital name, patient name, or bill amount) missing in the document.");
        }

        // Check if the provided recipient name matches the patient name from the bill
        if (patientName.toLowerCase() === recipientName.toLowerCase()) {
            // Proceed to accept UPI ID or perform further actions
            console.log("Recipient name matches. Proceeding with UPI ID request.");
            return { 
                success: true, 
                patientName, 
                billAmount,
                message: "Document verified successfully."
            };
        } else {
            // Block the user if the names do not match
            console.log("Name mismatch: Verification failed.");
            throw new Error("Name mismatch: Verification failed. User blocked.");
        }

    } catch (err) {
        console.error("OCR Failed:", err.message || err);
        throw new Error("Server error during document verification.");
    }
}


module.exports = verifyDocument;
