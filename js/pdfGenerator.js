// Initialize jsPDF
if (typeof window.jspdf === 'undefined') {
    console.error('jsPDF not loaded');
}

window.jsPDF = window.jspdf.jsPDF;

async function generatePDF() {
    try {
        console.log('Starting PDF generation...');
        
        // Initialize jsPDF
        if (!window.jsPDF) {
            console.error('jsPDF library not loaded!');
            alert('PDF generation library not loaded. Please refresh the page and try again.');
            return;
        }
        
        console.log('Initializing jsPDF...');
        const doc = new window.jsPDF('p', 'pt', 'a4');
        const pageWidth = doc.internal.pageSize.width;
        const pageHeight = doc.internal.pageSize.height;
        const margin = 50;
        const contentWidth = pageWidth - (margin * 2);
        let yOffset = margin;

        // Colors
        const goldColor = [218, 165, 32];
        const grayColor = [128, 128, 128];
        const darkGrayColor = [51, 51, 51];
        
        // Show generating message
        document.getElementById('generating-pdf').classList.add('active');
        
        // Function to add text with proper wrapping
        function addWrappedText(text, x, y, maxWidth, lineHeight, color, fontSize, align = 'left') {
            if (!text) return y;
            doc.setFontSize(fontSize);
            doc.setTextColor(...color);
            const lines = doc.splitTextToSize(text, maxWidth);
            
            if (align === 'center') {
                lines.forEach(line => {
                    const textWidth = doc.getTextWidth(line);
                    doc.text(line, x + (maxWidth - textWidth) / 2, y);
                    y += lineHeight;
                });
            } else {
                doc.text(lines, x, y);
                y += lines.length * lineHeight;
            }
            return y;
        }

        // Function to add a decorative border
        function addBorder(y, height) {
            const borderWidth = 2;
            doc.setDrawColor(...goldColor);
            doc.setLineWidth(borderWidth);
            doc.rect(margin, y, contentWidth, height);
            return y + height;
        }

        // Function to check and add new page if needed
        function checkAndAddPage(requiredSpace) {
            if (yOffset + requiredSpace > pageHeight - margin) {
                doc.addPage();
                yOffset = margin;
                return true;
            }
            return false;
        }

        // Add mystical header decoration
        function addHeaderDecoration(y) {
            const decorHeight = 5;
            doc.setDrawColor(...goldColor);
            doc.setLineWidth(2);
            doc.line(margin, y, margin + contentWidth, y);
            doc.line(margin, y + decorHeight, margin + contentWidth, y + decorHeight);
            return y + decorHeight * 2;
        }

        // Add main title
        yOffset = addHeaderDecoration(yOffset);
        yOffset = addWrappedText('Your Mystical Tarot Reading', margin, yOffset + 40, contentWidth, 40, goldColor, 32, 'center');
        yOffset = addHeaderDecoration(yOffset + 10);

        // Add date and reading type with styling
        yOffset += 20;
        const dateText = document.getElementById('readingDate').textContent;
        yOffset = addWrappedText(dateText, margin, yOffset, contentWidth, 20, grayColor, 14, 'center');
        
        const readingType = document.getElementById('readingType').textContent;
        yOffset = addWrappedText(`Reading Type: ${readingType}`, margin, yOffset + 20, contentWidth, 25, goldColor, 18, 'center');
        yOffset += 30;

        // Process each reading section
        const readingSections = document.querySelectorAll('.reading-section');
        
        for (const section of readingSections) {
            // Check if we need a new page
            checkAndAddPage(400); // Estimated space needed for a section

            // Add section container
            const sectionStartY = yOffset;
            yOffset += 20;

            // Add question
            const questionInfo = section.querySelector('.reading-info');
            if (questionInfo) {
                yOffset = addWrappedText(questionInfo.textContent, margin + 20, yOffset, contentWidth - 40, 20, goldColor, 16);
                yOffset += 20;
            }

            // Add card image
            const cardImg = section.querySelector('img');
            if (cardImg) {
                try {
                    console.log('Processing card image...');
                    const imgData = await new Promise((resolve, reject) => {
                        const img = new Image();
                        img.crossOrigin = 'Anonymous';
                        img.onload = () => {
                            try {
                                const canvas = document.createElement('canvas');
                                canvas.width = img.width;
                                canvas.height = img.height;
                                const ctx = canvas.getContext('2d');
                                ctx.drawImage(img, 0, 0);
                                resolve(canvas.toDataURL('image/jpeg'));
                            } catch (err) {
                                reject(err);
                            }
                        };
                        img.onerror = () => reject(new Error('Failed to load image'));
                        img.src = cardImg.src;
                    });

                    // Calculate image dimensions to fit properly
                    const maxImgWidth = contentWidth - 100;
                    const maxImgHeight = 300;
                    const imgAspectRatio = cardImg.width / cardImg.height;
                    let imgWidth = maxImgWidth;
                    let imgHeight = imgWidth / imgAspectRatio;

                    if (imgHeight > maxImgHeight) {
                        imgHeight = maxImgHeight;
                        imgWidth = imgHeight * imgAspectRatio;
                    }

                    // Center the image
                    const imgX = margin + (contentWidth - imgWidth) / 2;
                    checkAndAddPage(imgHeight + 60);
                    doc.addImage(imgData, 'JPEG', imgX, yOffset, imgWidth, imgHeight);
                    yOffset += imgHeight + 30;

                    // Add card name
                    const cardName = section.querySelector('.card-name');
                    if (cardName) {
                        yOffset = addWrappedText(cardName.textContent, margin, yOffset, contentWidth, 25, goldColor, 16, 'center');
                        yOffset += 20;
                    }
                } catch (error) {
                    console.error('Error processing card image:', error);
                }
            }

            // Add interpretation
            const interpretation = section.querySelector('.interpretation div:not(.loading)');
            if (interpretation) {
                checkAndAddPage(200); // Estimate space for interpretation
                yOffset = addWrappedText(interpretation.textContent, margin + 20, yOffset, contentWidth - 40, 20, darkGrayColor, 12);
            }

            // Add section border
            addBorder(sectionStartY, yOffset - sectionStartY + 20);
            yOffset += 40; // Space between sections
        }

        // Save the PDF
        const fileName = `Mystical_Tarot_Reading_${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(fileName);

        // Hide generating message
        document.getElementById('generating-pdf').classList.remove('active');
        console.log('PDF generation complete!');
    } catch (error) {
        console.error('Error generating PDF:', error);
        alert('There was an error generating the PDF. Please check the console for details.');
        document.getElementById('generating-pdf').classList.remove('active');
    }
}
