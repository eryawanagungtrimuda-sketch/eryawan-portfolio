'use client';

import { Download } from 'lucide-react';

export default function ProjectSheetPrintButton() {
  return (
    <button type="button" className="project-sheet-print-button" onClick={() => window.print()}>
      <Download aria-hidden="true" size={16} />
      Download PDF
    </button>
  );
}
