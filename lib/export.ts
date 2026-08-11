import type { Expense, Category } from "./types";
import { formatMoney } from "./currency";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export function exportToCSV(expenses: Expense[], categories: Category[], currency: string, month: string) {
  const currentMonthExpenses = expenses.filter(e => e.date.startsWith(month));
  
  if (currentMonthExpenses.length === 0) {
    alert("Tidak ada pengeluaran bulan ini untuk diekspor.");
    return;
  }

  const headers = ["Tanggal", "Kategori", "Catatan", "Nominal"];
  const rows = currentMonthExpenses.map(exp => {
    const cat = categories.find(c => c.id === exp.category);
    return [
      exp.date,
      cat ? cat.label : exp.category,
      `"${exp.note.replace(/"/g, '""')}"`, // escape quotes
      exp.amount
    ];
  });

  const csvContent = [
    headers.join(","),
    ...rows.map(r => r.join(","))
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `MyDuitku_${month}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportToPDF(expenses: Expense[], categories: Category[], currency: string, month: string) {
  const currentMonthExpenses = expenses.filter(e => e.date.startsWith(month));
  
  if (currentMonthExpenses.length === 0) {
    alert("Tidak ada pengeluaran bulan ini untuk diekspor.");
    return;
  }

  const doc = new jsPDF();
  
  doc.setFontSize(18);
  doc.text(`Laporan Pengeluaran - ${month}`, 14, 22);

  const head = [["Tanggal", "Kategori", "Catatan", "Nominal"]];
  const body = currentMonthExpenses.map(exp => {
    const cat = categories.find(c => c.id === exp.category);
    return [
      exp.date,
      cat ? cat.label : exp.category,
      exp.note,
      formatMoney(exp.amount, currency as any)
    ];
  });

  autoTable(doc, {
    startY: 30,
    head: head,
    body: body,
    theme: 'striped',
    headStyles: { fillColor: [130, 85, 0] }, // Primary color
  });

  doc.save(`MyDuitku_${month}.pdf`);
}
