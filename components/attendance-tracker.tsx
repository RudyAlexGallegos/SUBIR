"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarIcon, Save } from "lucide-react"
import { v4 as uuidv4 } from "uuid"

interface Referee {
  id: string
  name: string
  category: string
}

interface AttendanceRecord {
  id: string
  refereeId: string
  date: string
  present: boolean
}

interface AttendanceTrackerProps {
  referees: Referee[]
  attendance: AttendanceRecord[]
  onAddAttendance: (record: AttendanceRecord) => void
}

export default function AttendanceTracker({ referees, attendance, onAddAttendance }: AttendanceTrackerProps) {
  const [date, setDate] = useState<Date>(new Date())
  const [attendanceStatus, setAttendanceStatus] = useState<{ [key: string]: boolean }>({})

  // Inicializar el estado de asistencia cuando cambia la fecha
  const handleDateChange = (newDate: Date | undefined) => {
    if (!newDate) return

    setDate(newDate)

    // Reiniciar el estado de asistencia
    const newAttendanceStatus: { [key: string]: boolean } = {}

    // Cargar asistencias existentes para esta fecha
    const dateString = format(newDate, "yyyy-MM-dd")
    referees.forEach((referee) => {
      const existingRecord = attendance.find((record) => record.refereeId === referee.id && record.date === dateString)
      newAttendanceStatus[referee.id] = existingRecord ? existingRecord.present : false
    })

    setAttendanceStatus(newAttendanceStatus)
  }

  const toggleAttendance = (refereeId: string) => {
    setAttendanceStatus((prev) => ({
      ...prev,
      [refereeId]: !prev[refereeId],
    }))
  }

  const saveAttendance = () => {
    const dateString = format(date, "yyyy-MM-dd")

    Object.entries(attendanceStatus).forEach(([refereeId, present]) => {
      onAddAttendance({
        id: uuidv4(),
        refereeId,
        date: dateString,
        present,
      })
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-[240px] justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(date, "PPP", { locale: es })}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="single" selected={date} onSelect={handleDateChange} initialFocus locale={es} />
            </PopoverContent>
          </Popover>
        </div>
        <Button onClick={saveAttendance} className="flex items-center gap-2">
          <Save className="h-4 w-4" />
          Guardar Asistencia
        </Button>
      </div>

      {referees.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            No hay árbitros registrados. Agrega árbitros en la sección de Árbitros para registrar asistencia.
          </CardContent>
        </Card>
      ) : (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead className="text-center">Asistencia</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {referees.map((referee) => (
                <TableRow key={referee.id}>
                  <TableCell className="font-medium">{referee.name}</TableCell>
                  <TableCell>{referee.category}</TableCell>
                  <TableCell className="text-center">
                    <Checkbox
                      checked={attendanceStatus[referee.id] || false}
                      onCheckedChange={() => toggleAttendance(referee.id)}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
