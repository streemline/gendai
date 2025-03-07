import { useContext } from "react";
import { LanguageContext } from "../App";
import { useQuery } from "@tanstack/react-query";
import { type WorkEntry } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, FileDown } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from 'xlsx';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import { format } from "date-fns";
import { ru, uk, cs } from "date-fns/locale";

const locales = {
  ru,
  uk,
  cs
};

export default function Statistics() {
  const { t, language } = useContext(LanguageContext);

  const { data, isLoading } = useQuery<WorkEntry[]>({
    queryKey: ["/api/work-entries"],
    refetchInterval: 1000
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const totalHours = data?.reduce((sum, entry) => sum + Number(entry.totalHours), 0) || 0;
  const totalAmount = data?.reduce((sum, entry) => sum + Number(entry.totalAmount), 0) || 0;

  const chartData = data?.map(entry => ({
    date: format(new Date(entry.date), 'PP', { locale: locales[language] }),
    hours: Number(entry.totalHours),
    amount: Number(entry.totalAmount)
  }));

  const exportToPdf = () => {
    const doc = new jsPDF({
      compress: true,
      putOnlyUsedFonts: true,
      floatPrecision: 16,
      unit: 'mm'
    });

    doc.setFontSize(14);
    doc.text("VÝKAZ PRÁCE 2024", 14, 20);
    doc.text("JMÉNO:", 100, 20);

    const tableHeaders = [
      "datum",
      "název a místo akce",
      "popis činnosti",
      "pracovní doba",
      "přerušení pracovní doby",
      "počet hodin",
      "Kč/hod",
      "celkem Kč/den",
      "podpis odpověd. pracovníka"
    ];

    const tableData = data?.map(entry => [
      format(new Date(entry.date), 'dd.MM.yyyy', { locale: locales[language] }),
      entry.eventName,
      entry.description,
      `${format(new Date(entry.startTime), 'HH:mm')}-${format(new Date(entry.endTime), 'HH:mm')}`,
      entry.breakDuration,
      entry.totalHours,
      entry.hourlyRate,
      entry.totalAmount,
      ""
    ]) || [];

    doc.setFont("helvetica", "normal");

    autoTable(doc, {
      head: [tableHeaders],
      body: tableData,
      startY: 25,
      theme: 'grid',
      styles: {
        font: "helvetica",
        fontSize: 8,
        fontStyle: "normal",
        cellPadding: 2,
        minCellWidth: 10,
        halign: 'center',
        valign: 'middle',
        lineWidth: 0.1,
        lineColor: [0, 0, 0]
      },
      headStyles: {
        fillColor: false,
        textColor: 0,
        fontSize: 8,
        fontStyle: "normal",
        lineWidth: 0.1,
        lineColor: [0, 0, 0]
      },
      columnStyles: {
        0: { cellWidth: 20 },
        1: { cellWidth: 30 },
        2: { cellWidth: 30 },
        3: { cellWidth: 20 },
        4: { cellWidth: 20 },
        5: { cellWidth: 15 },
        6: { cellWidth: 15 },
        7: { cellWidth: 20 },
        8: { cellWidth: 20 }
      }
    });

    const finalY = (doc as any).lastAutoTable.finalY || 220;

    doc.setFontSize(10);
    doc.text("součet hodin:", 14, finalY + 10);
    doc.text(`${totalHours.toFixed(2)}`, 50, finalY + 10);
    doc.text("CELKEM K ÚHRADĚ:", 14, finalY + 20);
    doc.text(`${totalAmount.toFixed(2)} Kč`, 50, finalY + 20);

    doc.text("podpis pracovníka:", 120, finalY + 50);

    const fileName = `work-entries-${format(new Date(), 'yyyy-MM')}.pdf`;
    doc.save(fileName);
  };

  const exportToExcel = () => {
    const formattedData = data?.map(entry => ({
      [t.form.date]: format(new Date(entry.date), 'PP', { locale: locales[language] }),
      [t.form.eventName]: entry.eventName,
      [t.form.eventLocation]: entry.eventLocation,
      [t.form.description]: entry.description,
      [t.form.startTime]: format(new Date(entry.startTime), "HH:mm", { locale: locales[language] }),
      [t.form.endTime]: format(new Date(entry.endTime), "HH:mm", { locale: locales[language] }),
      [t.form.breakDuration]: entry.breakDuration,
      [t.form.hourlyRate]: entry.hourlyRate,
      [t.form.totalHours]: entry.totalHours,
      [t.form.totalAmount]: `${entry.totalAmount} Kč`
    }));

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(formattedData || []);
    XLSX.utils.book_append_sheet(workbook, worksheet, "Work Entries");

    const fileName = `work-entries-${format(new Date(), 'yyyy-MM')}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <Link href="/">
          <Button variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t.navigation.home}
          </Button>
        </Link>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <FileDown className="w-4 h-4 mr-2" />
              {t.form.export}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={exportToPdf}>
              <Download className="w-4 h-4 mr-2" />
              PDF
            </DropdownMenuItem>
            <DropdownMenuItem onClick={exportToExcel}>
              <Download className="w-4 h-4 mr-2" />
              Excel
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>{t.statistics?.totalHours || t.stats?.totalHours}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalHours.toFixed(2)} h</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t.stats.totalAmount}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAmount.toFixed(2)} Kč</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t.stats.byDay}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="hours" fill="#2563eb" name={t.stats.totalHours} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}