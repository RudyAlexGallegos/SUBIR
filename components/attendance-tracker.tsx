"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { format, parseISO, startOfWeek, addDays, isSameWeek } from "date-fns"
import { es } from "date-fns/locale"
import { Download, ChevronLeft, ChevronRight, FileText, FileSpreadsheet } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { v4 as uuidv4 } from "uuid"
import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"

type MeetingType = "ANALISIS_DE_PARTIDO" | "PREPARACION_FISICA" | "REUNION_ORDINARIA"

interface Referee {
  id: string
  name: string
  category: string
}

interface AttendanceRecord {
  id: string
  refereeId: string
  date: string
  meetingType: MeetingType
  present: boolean
}

const STATIC_REFEREES: Referee[] = [
  { id: "1", name: "Wilber Centeno", category: "Nacional" },
  { id: "2", name: "Juan Pérez", category: "Regional" },
  { id: "3", name: "María Gómez", category: "Nacional" },
  { id: "4", name: "Carlos López", category: "Regional" },
  { id: "5", name: "Ana Rodríguez", category: "Nacional" },
  { id: "6", name: "Luis Martínez", category: "Regional" },
]

const MEETING_TYPES: Record<MeetingType, string> = {
  ANALISIS_DE_PARTIDO: "Análisis de Partido",
  PREPARACION_FISICA: "Preparación Física",
  REUNION_ORDINARIA: "Reunión Ordinaria"
}

const getMeetingType = (date: Date): MeetingType => {
  const day = date.getDay()
  
  if (day === 1) return "ANALISIS_DE_PARTIDO"      // Lunes
  if (day === 2 || day === 4) return "PREPARACION_FISICA" // Martes o Jueves
  return "REUNION_ORDINARIA"                      // Viernes
}

export default function WeeklyRefereeAttendance() {
  const { toast } = useToast()
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(startOfWeek(new Date()))
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([])
  const pdfRef = useRef<HTMLDivElement>(null)

  const workDays = useMemo(() => {
    return [1, 2, 4, 5].map(dayOffset => addDays(currentWeekStart, dayOffset))
  }, [currentWeekStart])

  useEffect(() => {
    const newAttendance: AttendanceRecord[] = []
    
    workDays.forEach(day => {
      STATIC_REFEREES.forEach(referee => {
        const dayString = format(day, "yyyy-MM-dd")
        const exists = attendance.some(
          r => r.refereeId === referee.id && r.date === dayString
        )
        
        if (!exists) {
          newAttendance.push({
            id: uuidv4(),
            refereeId: referee.id,
            date: dayString,
            meetingType: getMeetingType(day),
            present: false
          })
        }
      })
    })

    if (newAttendance.length > 0) {
      setAttendance(prev => [...prev, ...newAttendance])
    }
  }, [currentWeekStart])

  const goToPreviousWeek = () => setCurrentWeekStart(prev => addDays(prev, -7))
  const goToNextWeek = () => setCurrentWeekStart(prev => addDays(prev, 7))

  const toggleAttendance = (refereeId: string, date: Date) => {
    const dateString = format(date, "yyyy-MM-dd")
    
    setAttendance(prev => prev.map(record => 
      record.refereeId === refereeId && record.date === dateString
        ? { ...record, present: !record.present }
        : record
    ))
  }

  const weeklySummary = useMemo(() => {
    const summary: Record<string, { 
      present: number
      total: number
      details: Record<string, boolean>
    }> = {}

    STATIC_REFEREES.forEach(referee => {
      const refereeRecords = attendance.filter(
        r => r.refereeId === referee.id && 
             isSameWeek(parseISO(r.date), currentWeekStart)
      )
      
      const details: Record<string, boolean> = {}
      refereeRecords.forEach(record => {
        details[record.date] = record.present
      })
      
      summary[referee.id] = {
        present: refereeRecords.filter(r => r.present).length,
        total: refereeRecords.length,
        details
      }
    })

    return summary
  }, [attendance, currentWeekStart])

  const exportToCSV = () => {
    try {
      const weekTitle = `Asistencia Semanal - ${format(currentWeekStart, "dd/MM/yyyy")} a ${format(addDays(currentWeekStart, 6), "dd/MM/yyyy")}`
      const headers = ["Árbitro", "Categoría", ...workDays.map(day => format(day, "EEE dd/MM")), "Asistencias", "Faltas", "% Asistencia"]
      
      const rows = STATIC_REFEREES.map(referee => {
        const summary = weeklySummary[referee.id] || { present: 0, total: 0, details: {} }
        const percentage = summary.total > 0 ? Math.round((summary.present / summary.total) * 100) : 0
        
        return [
          referee.name,
          referee.category,
          ...workDays.map(day => {
            const dateStr = format(day, "yyyy-MM-dd")
            return summary.details[dateStr] ? "Presente" : "Ausente"
          }),
          summary.present.toString(),
          (summary.total - summary.present).toString(),
          `${percentage}%`
        ]
      })

      const csvContent = [
        weekTitle,
        headers.join(","),
        ...rows.map(row => row.join(","))
      ].join("\n")

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download", `asistencia_semanal_${format(currentWeekStart, "yyyyMMdd")}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast({
        title: "Reporte CSV exportado",
        description: "El consolidado semanal en CSV se ha descargado correctamente",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error al exportar CSV",
        description: "No se pudo generar el archivo CSV",
      })
    }
  }

  const exportToPDF = () => {
    try {
      const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm"
      })

      // Add main title
      doc.setFontSize(18)
      doc.setFont("helvetica", "bold")
      doc.text("COMISIÓN DEPARTAMENTAL DE ÁRBITROS", 105, 10, { align: "center" })

      // Add subtitle
      doc.setFontSize(14)
      doc.setFont("helvetica", "normal")
      doc.text("DESEMPEÑO ARBITRAL", 105, 17, { align: "center" })

      // Add week information
      doc.setFontSize(12)
      doc.text(
        `Consolidado Semanal de Asistencia - ${format(currentWeekStart, "dd/MM/yyyy")} a ${format(addDays(currentWeekStart, 6), "dd/MM/yyyy")}`,
        105,
        24,
        { align: "center" }
      )

      const headers = [
        "Árbitro",
        "Categoría",
        ...workDays.map(day => format(day, "EEE dd/MM")),
        "Asist.",
        "Faltas",
        "%"
      ]

      const data = STATIC_REFEREES.map(referee => {
        const summary = weeklySummary[referee.id] || { present: 0, total: 0, details: {} }
        const percentage = summary.total > 0 ? Math.round((summary.present / summary.total) * 100) : 0
        
        return [
          referee.name,
          referee.category,
          ...workDays.map(day => {
            const dateStr = format(day, "yyyy-MM-dd")
            return summary.details[dateStr] ? "✓" : "✗"
          }),
          summary.present.toString(),
          (summary.total - summary.present).toString(),
          `${percentage}%`
        ]
      })

      autoTable(doc, {
        head: [headers],
        body: data,
        startY: 30,
        styles: {
          fontSize: 8,
          cellPadding: 2,
          halign: 'center'
        },
        headStyles: {
          fillColor: [22, 163, 74],
          textColor: 255,
          fontStyle: 'bold'
        },
        alternateRowStyles: {
          fillColor: [241, 245, 249]
        },
        columnStyles: {
          0: { halign: 'left', cellWidth: 40 },
          1: { cellWidth: 25 },
          [headers.length - 3]: { cellWidth: 15 },
          [headers.length - 2]: { cellWidth: 15 },
          [headers.length - 1]: { cellWidth: 15 }
        },
        didDrawPage: (data) => {
          doc.setFontSize(10)
          doc.text(
            `Sistema de Control de Asistencia - ${new Date().toLocaleDateString()}`,
            data.settings.margin.left,
            doc.internal.pageSize.height - 10
          )
        }
      })

      doc.save(`asistencia_semanal_${format(currentWeekStart, "yyyyMMdd")}.pdf`)

      toast({
        title: "Reporte PDF exportado",
        description: "El consolidado semanal en PDF se ha descargado correctamente",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error al exportar PDF",
        description: "No se pudo generar el archivo PDF",
      })
    }
  }

  return (
    <div className="space-y-6 p-4" ref={pdfRef}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={goToPreviousWeek}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <h2 className="text-xl font-semibold text-center">
            Semana del {format(currentWeekStart, "dd MMM yyyy")}
          </h2>
          
          <Button variant="outline" size="icon" onClick={goToNextWeek}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex gap-2">
          <Button onClick={exportToPDF} className="gap-2" variant="outline">
            <FileText className="h-4 w-4" />
            Exportar PDF
          </Button>
          <Button onClick={exportToCSV} className="gap-2">
            <FileSpreadsheet className="h-4 w-4" />
            Exportar CSV
          </Button>
        </div>
      </div>

      <Tabs defaultValue={format(workDays[0], "yyyy-MM-dd")} className="w-full">
        <TabsList className="grid grid-cols-4 h-auto">
          {workDays.map(day => (
            <TabsTrigger 
              key={day.toString()} 
              value={format(day, "yyyy-MM-dd")}
              className="py-2 flex flex-col items-center"
            >
              <span className="font-medium">{format(day, "EEE", { locale: es })}</span>
              <span className="text-xs">{format(day, "dd/MM")}</span>
              <span className="text-xs text-blue-500 mt-1">
                {MEETING_TYPES[getMeetingType(day)]}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>
        
        {workDays.map(day => {
          const dayString = format(day, "yyyy-MM-dd")
          const meetingType = getMeetingType(day)
          
          return (
            <TabsContent key={dayString} value={dayString}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-center">
                    {format(day, "EEEE dd 'de' MMMM", { locale: es })}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[60%]">Árbitro</TableHead>
                          <TableHead className="text-center">Categoría</TableHead>
                          <TableHead className="text-center">Asistencia</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {STATIC_REFEREES.map(referee => {
                          const record = attendance.find(
                            r => r.refereeId === referee.id && r.date === dayString
                          )
                          
                          return (
                            <TableRow key={`${dayString}-${referee.id}`}>
                              <TableCell className="font-medium">{referee.name}</TableCell>
                              <TableCell className="text-center">{referee.category}</TableCell>
                              <TableCell className="text-center">
                                <Checkbox
                                  checked={record?.present || false}
                                  onCheckedChange={() => toggleAttendance(referee.id, day)}
                                  className="h-5 w-5"
                                />
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )
        })}
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle className="text-center">Consolidado Semanal</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[180px]">Árbitro</TableHead>
                  <TableHead className="min-w-[120px]">Categoría</TableHead>
                  {workDays.map(day => (
                    <TableHead key={day.toString()} className="text-center min-w-[100px]">
                      <div className="flex flex-col items-center">
                        <span>{format(day, "EEE", { locale: es })}</span>
                        <span className="text-xs">{format(day, "dd/MM")}</span>
                      </div>
                    </TableHead>
                  ))}
                  <TableHead className="text-center">Asist.</TableHead>
                  <TableHead className="text-center">Faltas</TableHead>
                  <TableHead className="text-center">% Asist.</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {STATIC_REFEREES.map(referee => {
                  const summary = weeklySummary[referee.id] || { present: 0, total: 0, details: {} }
                  const percentage = summary.total > 0 ? Math.round((summary.present / summary.total) * 100) : 0
                  
                  return (
                    <TableRow key={referee.id}>
                      <TableCell className="font-medium">{referee.name}</TableCell>
                      <TableCell>{referee.category}</TableCell>
                      
                      {workDays.map(day => {
                        const dateStr = format(day, "yyyy-MM-dd")
                        return (
                          <TableCell key={dateStr} className="text-center">
                            {summary.details[dateStr] ? (
                              <span className="text-green-600">✓</span>
                            ) : (
                              <span className="text-red-600">✗</span>
                            )}
                          </TableCell>
                        )
                      })}
                      
                      <TableCell className="text-center text-green-600 font-medium">{summary.present}</TableCell>
                      <TableCell className="text-center text-red-600 font-medium">{summary.total - summary.present}</TableCell>
                      <TableCell className="text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          percentage >= 80 ? "bg-green-100 text-green-800" :
                          percentage >= 50 ? "bg-yellow-100 text-yellow-800" :
                          "bg-red-100 text-red-800"
                        }`}>
                          {percentage}%
                        </span>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}