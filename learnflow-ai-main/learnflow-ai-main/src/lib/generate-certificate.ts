import { jsPDF } from 'jspdf';

export async function downloadCertificate(studentName: string, courseName: string, date: string) {
  // Create landscape PDF, true A4 size usually ~ 297x210 mm
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  // Background image dimensions
  const width = doc.internal.pageSize.getWidth();
  const height = doc.internal.pageSize.getHeight();

  try {
    // 1. Fetching our generated beautiful background
    const bgUrl = '/certificate-bg.png';
    const bgImage = await fetch(bgUrl).then(res => res.blob());
    const bgBase64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(bgImage);
    });

    // 2. Add the background completely flush
    doc.addImage(bgBase64, 'PNG', 0, 0, width, height);

    // 3. Define styling and insert text
    doc.setTextColor(30, 41, 59); // Slate-800 for elegant dark text
    
    // Certificate Title Overlay
    doc.setFontSize(40);
    doc.setFont('times', 'bold');
    doc.text('CERTIFICATE OF COMPLETION', width / 2, height * 0.35, { align: 'center' });

    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139); // Slate-500
    doc.text('This is proudly presented to', width / 2, height * 0.45, { align: 'center' });

    // Student Name
    doc.setTextColor(15, 23, 42); // Slate-900
    doc.setFontSize(32);
    doc.setFont('times', 'italic');
    doc.text(studentName.toUpperCase(), width / 2, height * 0.55, { align: 'center' });

    // Details Segment
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text('For successfully completing the comprehensive learning path in', width / 2, height * 0.65, { align: 'center' });

    // Course Title
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(22);
    doc.setFont('times', 'bold');
    doc.text(courseName, width / 2, height * 0.73, { align: 'center' });

    // Date & Signature blocks (bottom area)
    doc.setFontSize(12);
    doc.text(`Awarded on: ${date}`, width * 0.25, height * 0.85, { align: 'center' });
    doc.text('LearnFlow AI Platform', width * 0.75, height * 0.85, { align: 'center' });

    // Little line separators for signature area
    doc.setLineWidth(0.5);
    doc.line(width * 0.15, height * 0.82, width * 0.35, height * 0.82);
    doc.line(width * 0.65, height * 0.82, width * 0.85, height * 0.82);

    // Trigger Download!
    doc.save(`${studentName.replace(/\\s+/g, '_')}_${courseName.replace(/\\s+/g, '_')}_Certificate.pdf`);

  } catch (err) {
    console.error('Failed to generate PDF:', err);
    alert('Oops! Certificate background image failed to load. Are you sure it is in the public directory?');
  }
}
