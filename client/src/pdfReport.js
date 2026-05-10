import { jsPDF } from 'jspdf';

/**
 * Generate a clinical PDF report for a Hyperion scan analysis.
 * Designed to look like a high-end medical letterhead.
 *
 * @param {Object} params
 * @param {string} params.rawFindings - Vision Agent raw geometry output
 * @param {string} params.verifiedReport - Final verified consensus
 * @param {string} params.urgencyFlag - High / Moderate / Low
 * @param {string} params.recommendedDept - Recommended department
 * @param {string} params.processingLatency - e.g. "3.2s"
 * @param {number} params.criticInterventions - Number of critic corrections
 * @param {string} [params.patientId] - Optional patient ID placeholder
 * @param {string} [params.imageBase64] - Optional base64 image to embed
 */
export function generateClinicalPDF({
    rawFindings,
    verifiedReport,
    urgencyFlag,
    recommendedDept,
    processingLatency,
    criticInterventions,
    patientId = 'N/A',
    imageBase64,
}) {
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const contentWidth = pageWidth - margin * 2;
    let y = margin;

    // Colors
    const primaryColor = [30, 41, 59];    // slate-800
    const accentColor = [6, 182, 212];    // cyan-500
    const indigoColor = [99, 102, 241];   // indigo-500
    const textColor = [51, 65, 85];       // slate-700
    const mutedColor = [148, 163, 184];   // slate-400
    const whiteColor = [255, 255, 255];

    // ─── Letterhead Header ───────────────────────────────────
    // Top accent bar (4mm tall)
    doc.setFillColor(...accentColor);
    doc.rect(0, 0, pageWidth, 4, 'F');

    // Title — starts 10mm below the accent bar
    y = 14;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(...primaryColor);
    doc.text('PROJECT HYPERION', margin, y);

    // Subtitle — 7mm below title baseline
    y += 7;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...mutedColor);
    doc.text('Clinical AI Diagnostic Swarm  \u2022  Verified Consensus Report', margin, y);

    // Divider line — 5mm below subtitle
    y += 6;
    doc.setDrawColor(...accentColor);
    doc.setLineWidth(0.5);
    doc.line(margin, y, pageWidth - margin, y);
    y += 5;

    // ─── Metadata Row ────────────────────────────────────────
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...mutedColor);

    const metaLeft = [
        `Patient ID: ${patientId}`,
        `Urgency: ${urgencyFlag}`,
        `Department: ${recommendedDept}`,
    ];
    const metaRight = [
        `Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`,
        `Latency: ${processingLatency}`,
        `Critic Interventions: ${criticInterventions}`,
    ];

    doc.text(metaLeft[0], margin, y);
    doc.text(metaLeft[1], margin, y + 5);
    doc.text(metaLeft[2], margin, y + 10);

    doc.text(metaRight[0], pageWidth - margin - doc.getTextWidth(metaRight[0]), y);
    doc.text(metaRight[1], pageWidth - margin - doc.getTextWidth(metaRight[1]), y + 5);
    doc.text(metaRight[2], pageWidth - margin - doc.getTextWidth(metaRight[2]), y + 10);

    y += 18;

    // ─── Embedded Scan Image ─────────────────────────────────
    if (imageBase64) {
        try {
            const imgData = `data:image/png;base64,${imageBase64}`;
            const imgHeight = 50;
            doc.addImage(imgData, 'PNG', margin, y, contentWidth, imgHeight, undefined, 'FAST');
            y += imgHeight + 6;

            // Caption
            doc.setFont('helvetica', 'italic');
            doc.setFontSize(7);
            doc.setTextColor(...mutedColor);
            doc.text('Source Scan Image', margin, y);
            y += 6;
        } catch (e) {
            console.warn('Could not embed image in PDF:', e.message);
        }
    }

    // ─── Section: Vision Agent Raw Findings ──────────────────
    doc.setFillColor(...accentColor);
    doc.rect(margin, y, 3, 10, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...primaryColor);
    doc.text('Vision Agent Raw Findings', margin + 6, y + 7);
    y += 14;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...textColor);

    const findingsLines = doc.splitTextToSize(rawFindings || 'No findings recorded.', contentWidth - 4);
    // Background box
    const boxHeight = findingsLines.length * 4.5 + 6;
    doc.setFillColor(248, 250, 252); // slate-50
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.roundedRect(margin, y, contentWidth, boxHeight, 2, 2, 'FD');
    doc.setTextColor(...textColor);
    doc.text(findingsLines, margin + 3, y + 5);
    y += boxHeight + 8;

    // ─── Section: Final Verified Consensus ───────────────────
    doc.setFillColor(...indigoColor);
    doc.rect(margin, y, 3, 10, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...primaryColor);
    doc.text('Final Verified Consensus', margin + 6, y + 7);
    y += 14;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...textColor);

    const reportLines = doc.splitTextToSize(verifiedReport || 'No verified report available.', contentWidth - 4);
    const reportBoxHeight = reportLines.length * 4.5 + 6;
    doc.setFillColor(238, 242, 255); // indigo-50
    doc.setDrawColor(199, 210, 254); // indigo-200
    doc.roundedRect(margin, y, contentWidth, reportBoxHeight, 2, 2, 'FD');
    doc.setTextColor(...textColor);
    doc.text(reportLines, margin + 3, y + 5);
    y += reportBoxHeight + 8;

    // ─── Footer ──────────────────────────────────────────────
    const footerY = 285; // near bottom of A4
    doc.setDrawColor(...accentColor);
    doc.setLineWidth(0.3);
    doc.line(margin, footerY, pageWidth - margin, footerY);

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7);
    doc.setTextColor(...mutedColor);
    doc.text('Powered by AMD MI300X Hardware Acceleration', margin, footerY + 5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    doc.text(`Generated by Project Hyperion • ${new Date().toISOString()}`, margin, footerY + 10);

    // Save
    const filename = `Hyperion_Report_${Date.now()}.pdf`;
    doc.save(filename);
}
