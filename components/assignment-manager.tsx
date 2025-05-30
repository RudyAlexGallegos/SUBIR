
"use client"

import { useState, useMemo, FormEvent, useEffect } from "react"
import { v4 as uuidv4 } from "uuid"
import { format, subDays, isSameDay, parseISO } from "date-fns"
import { es } from "date-fns/locale"
import { jsPDF } from "jspdf"
import "jspdf-autotable"
import { Edit, Trash2, Plus, CalendarIcon, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

// Interfaces
interface Referee {
  id: string
  name: string
  category: string
  licenseNumber?: string
}

interface Championship {
  id: string
  name: string
}

interface AttendanceRecord {
  id: string
  refereeId: string
  date: string
  present: boolean
}

interface AssignmentReferee {
  id: string
  role: string
}

interface Assignment {
  id: string
  championshipId: string
  matchName: string
  matchDate: string
  matchTime: string
  location: string
  notes: string
  referees: AssignmentReferee[]
}

interface AssignmentManagerProps {
  referees?: Referee[]
  championships?: Championship[]
  attendance?: AttendanceRecord[]
  assignments?: Assignment[]
  onAddAssignment?: (assignment: Assignment) => void
  onUpdateAssignment?: (id: string, assignment: Assignment) => void
  onDeleteAssignment?: (id: string) => void
}

// Árbitros estáticos (reemplaza con tus datos reales)
const STATIC_REFEREES: Referee[] = [
  { id: "1", name: "Arbitro 1", category: "Nacional" },
  { id: "2", name: "Arbitro 2", category: "Regional" },
  { id: "3", name: "Arbitro 3", category: "FIFA" },
  // Agrega más árbitros según sea necesario
];

const DEFAULT_ASSIGNMENT: Assignment = {
  id: "",
  championshipId: "",
  matchName: "",
  matchDate: format(new Date(), "yyyy-MM-dd"),
  matchTime: "15:00",
  location: "",
  notes: "",
  referees: [
    { id: "", role: "Árbitro Principal" },
    { id: "", role: "Árbitro Asistente 1" },
    { id: "", role: "Árbitro Asistente 2" }
  ]
}

const REFEREE_ROLES = [
  "Árbitro Principal",
  "Árbitro Asistente 1",
  "Árbitro Asistente 2",
  "Cuarto Árbitro",
  "Árbitro VAR",
  "Árbitro AVAR",
  "Observador"
]

export default function AssignmentManager({
  referees: propReferees = [],
  championships = [],
  attendance = [],
  assignments = [],
  onAddAssignment = () => {},
  onUpdateAssignment = () => {},
  onDeleteAssignment = () => {},
}: AssignmentManagerProps) {
  const referees = useMemo(() => [...STATIC_REFEREES, ...propReferees], [propReferees])
  
  // Estado
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [newAssignment, setNewAssignment] = useState<Assignment>({...DEFAULT_ASSIGNMENT})
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [matchDate, setMatchDate] = useState<Date>(new Date())
  const [selectedChampionship, setSelectedChampionship] = useState<string>("all")

  // Función para verificar árbitros duplicados
  const checkDuplicateReferees = (assignment: Assignment, isEditing = false): string[] => {
    const errors: string[] = []
    const currentDate = parseISO(assignment.matchDate)
    const currentTime = assignment.matchTime
    const currentReferees = assignment.referees.map(r => r.id).filter(id => id !== "")

    // Verificar árbitros duplicados en el mismo partido
    const refereeCounts = new Map<string, number>()
    for (const id of currentReferees) {
      refereeCounts.set(id, (refereeCounts.get(id) || 0) + 1)
    }

    for (const [id, count] of refereeCounts.entries()) {
      if (count > 1) {
        const referee = referees.find(r => r.id === id)
        errors.push(`⚠️ ERROR: El árbitro ${referee?.name || id} está asignado múltiples veces en el mismo partido`)
      }
    }

    // Verificar árbitros duplicados en el mismo día y hora en cualquier campeonato
    assignments.forEach(existing => {
      if (isEditing && existing.id === assignment.id) return

      const existingDate = parseISO(existing.matchDate)
      if (isSameDay(existingDate, currentDate) && existing.matchTime === currentTime) {
        const existingReferees = existing.referees.map(r => r.id)
        currentReferees.forEach(id => {
          if (existingReferees.includes(id)) {
            const referee = referees.find(r => r.id === id)
            const champ = championships.find(c => c.id === existing.championshipId)
            errors.push(
              `⚠️ ADVERTENCIA! El árbitro ${referee?.name || id} ya está asignado el mismo día ` +
              `(${format(currentDate, "dd/MM/yyyy")}) y hora (${currentTime}) en el campeonato "${champ?.name || 'Sin nombre'}"`
            )
          }
        })
      }
    })

    return errors
  }

  // Árbitros elegibles
  const eligibleReferees = useMemo(() => {
    const today = new Date()
    const thirtyDaysAgo = subDays(today, 30)
    const attendanceStats = new Map<string, { present: number; total: number }>()

    referees.forEach(referee => {
      attendanceStats.set(referee.id, { present: 0, total: 0 })
    })

    attendance.forEach(record => {
      const recordDate = new Date(record.date)
      if (recordDate >= thirtyDaysAgo && recordDate <= today) {
        const stats = attendanceStats.get(record.refereeId)
        if (stats) {
          stats.total++
          if (record.present) stats.present++
        }
      }
    })

    return referees.filter(referee => {
      const stats = attendanceStats.get(referee.id)
      return stats ? stats.total === 0 || stats.present / stats.total >= 0.7 : true
    })
  }, [referees, attendance])

  // Manejadores de formulario
  const handleAddSubmit = (e: FormEvent) => {
    e.preventDefault()
    
    const errors = checkDuplicateReferees(newAssignment)
    if (errors.length > 0) {
      errors.forEach(error => toast.error(error))
      return
    }
    
    onAddAssignment({
      ...newAssignment,
      id: uuidv4(),
      matchDate: format(matchDate, "yyyy-MM-dd")
    })
    setNewAssignment({...DEFAULT_ASSIGNMENT})
    setMatchDate(new Date())
    setIsAddDialogOpen(false)
    toast.success("Designación agregada correctamente")
  }

  const handleEditSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!editingAssignment) return
    
    const errors = checkDuplicateReferees(editingAssignment, true)
    if (errors.length > 0) {
      errors.forEach(error => toast.error(error))
      return
    }
    
    onUpdateAssignment(editingAssignment.id, {
      ...editingAssignment,
      matchDate: format(matchDate, "yyyy-MM-dd"),
    })
    setEditingAssignment(null)
    setIsEditDialogOpen(false)
    toast.success("Designación actualizada correctamente")
  }

  // Funciones de edición
  const startEdit = (assignment: Assignment) => {
    setEditingAssignment({ ...assignment })
    setMatchDate(new Date(assignment.matchDate))
    setIsEditDialogOpen(true)
  }

  // Filtro de asignaciones
  const filteredAssignments = useMemo(() => {
    const term = searchTerm.toLowerCase()
    return assignments.filter(assignment => {
      const matchesSearch = 
        assignment.matchName.toLowerCase().includes(term) ||
        assignment.location.toLowerCase().includes(term) ||
        assignment.referees.some(ref => {
          const referee = referees.find(r => r.id === ref.id)
          return referee?.name.toLowerCase().includes(term) ?? false
        })
      
      const matchesChampionship = 
        selectedChampionship === "all" || 
        assignment.championshipId === selectedChampionship

      return matchesSearch && matchesChampionship
    })
  }, [assignments, searchTerm, selectedChampionship, referees])

  // Funciones de ayuda
  const getRefereeById = (id: string) => referees.find(referee => referee.id === id)
  const getChampionshipById = (id: string) => championships.find(championship => championship.id === id)

  // Manejadores de árbitros
  const handleAddRefereeToAssignment = (isEditing = false) => {
    const newReferee = { id: "", role: "Cuarto Árbitro" }
    if (isEditing && editingAssignment) {
      setEditingAssignment({
        ...editingAssignment,
        referees: [...editingAssignment.referees, newReferee]
      })
    } else {
      setNewAssignment(prev => ({
        ...prev,
        referees: [...prev.referees, newReferee]
      }))
    }
  }

  const handleRemoveRefereeFromAssignment = (index: number, isEditing = false) => {
    if (isEditing && editingAssignment) {
      setEditingAssignment({
        ...editingAssignment,
        referees: editingAssignment.referees.filter((_, i) => i !== index)
      })
    } else {
      setNewAssignment(prev => ({
        ...prev,
        referees: prev.referees.filter((_, i) => i !== index)
      }))
    }
  }

  const handleRefereeChange = (index: number, refereeId: string, isEditing = false) => {
    if (isEditing && editingAssignment) {
      const updatedReferees = [...editingAssignment.referees]
      updatedReferees[index].id = refereeId === "NONE" ? "" : refereeId
      const errors = checkDuplicateReferees({
        ...editingAssignment,
        referees: updatedReferees
      }, true)
      if (errors.length > 0) {
        errors.forEach(error => toast.error(error))
        return
      }
      setEditingAssignment({ ...editingAssignment, referees: updatedReferees })
    } else {
      const updatedReferees = [...newAssignment.referees]
      updatedReferees[index].id = refereeId === "NONE" ? "" : refereeId
      const errors = checkDuplicateReferees({
        ...newAssignment,
        referees: updatedReferees
      })
      if (errors.length > 0) {
        errors.forEach(error => toast.error(error))
        return
      }
      setNewAssignment({ ...newAssignment, referees: updatedReferees })
    }
  }

  const handleRoleChange = (index: number, role: string, isEditing = false) => {
    if (isEditing && editingAssignment) {
      const updatedReferees = [...editingAssignment.referees]
      updatedReferees[index].role = role
      setEditingAssignment({ ...editingAssignment, referees: updatedReferees })
    } else {
      const updatedReferees = [...newAssignment.referees]
      updatedReferees[index].role = role
      setNewAssignment({ ...newAssignment, referees: updatedReferees })
    }
  }

  // DE AQUI NO TOCAR
 // Exportar a PDF individual
const exportToPDF = (assignment: Assignment) => {
  try {
    const doc = new jsPDF()
    const championship = getChampionshipById(assignment.championshipId)

    doc.setFont("helvetica", "bold")
    doc.setFontSize(18)
    doc.setTextColor(0, 0, 139)
    doc.text("DESIGNACIÓN ARBITRAL", 105, 20, { align: "center" })

    doc.setFont("helvetica", "normal")
    doc.setFontSize(12)
    doc.setTextColor(0, 0, 0)
    doc.text(`Campeonato: ${championship?.name || 'No especificado'}`, 20, 35)
    doc.text(`Partido: ${assignment.matchName || 'No especificado'}`, 20, 45)
    doc.text(`Fecha: ${assignment.matchDate ? format(parseISO(assignment.matchDate), "dd/MM/yyyy") : 'No especificada'}`, 20, 55)
    doc.text(`Hora: ${assignment.matchTime || 'No especificada'}`, 20, 65)
    doc.text(`Ubicación: ${assignment.location || 'No especificada'}`, 20, 75)

    doc.setFont("helvetica", "bold")
    doc.text("Árbitros Designados:", 20, 90)
    doc.setFont("helvetica", "normal")

    assignment.referees.forEach((ref, index) => {
      const referee = getRefereeById(ref.id)
      const yPosition = 100 + (index * 10)

      doc.text(`${ref.role}:`, 25, yPosition)
      doc.text(`${referee?.name || 'No asignado'} (${referee?.category || 'N/A'})`, 60, yPosition)

      if (referee && !eligibleReferees.some(r => r.id === referee.id)) {
        doc.setTextColor(255, 165, 0)
        doc.text("(Baja Asistencia)", 130, yPosition)
        doc.setTextColor(0, 0, 0)
      }
    })

    let yPosition = 100 + (assignment.referees.length * 10)

    if (assignment.notes) {
      doc.setFont("helvetica", "bold")
      doc.text("Notas:", 20, yPosition + 10)
      doc.setFont("helvetica", "normal")
      const splitNotes = doc.splitTextToSize(assignment.notes, 170)
      doc.text(splitNotes, 25, yPosition + 20)
      yPosition += splitNotes.length * 7
    }

    // Firma
    doc.setFont("helvetica", "italic")
    doc.setFontSize(11)
    doc.text("_________________________", 20, 260)
    doc.text("Responsable de Designaciones", 20, 268)

    // Pie de página
    doc.setFontSize(10)
    doc.setTextColor(100)
    doc.text(`Generado el ${format(new Date(), "dd/MM/yyyy HH:mm")}`, 105, 285, { align: "center" })

    const fileName = `Designacion_${assignment.matchName.replace(/\s+/g, '_') || 'designacion'}.pdf`
    doc.save(fileName)
    toast.success("PDF generado correctamente")

  } catch (error) {
    console.error("Error al generar PDF:", error)
    toast.error("Ocurrió un error al generar el PDF")
  }
}

// Exportar todas las designaciones
const exportAllToPDF = () => {
  try {
    if (assignments.length === 0) {
      toast.warning("No hay designaciones para exportar")
      return
    }

    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm"
    })

    doc.setFont("helvetica", "bold")
    doc.setFontSize(20)
    doc.setTextColor(0, 0, 139)
    doc.text("DESIGNACIONES CODAR PUNO", 148, 15, { align: "center" })

    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(0, 0, 0)
    doc.text(`Total de designaciones: ${assignments.length}`, 20, 25)
    doc.text(`Fecha de generación: ${format(new Date(), "dd/MM/yyyy HH:mm")}`, 250, 25)

    let yPosition = 35

    assignments.forEach((assignment, index) => {
      const championship = getChampionshipById(assignment.championshipId)

      if (yPosition > 180) {
        // Firma antes de saltar de página
        doc.setFont("helvetica", "italic")
        doc.setFontSize(11)
        doc.text("_________________________", 20, 190)
        doc.text("Responsable de Designaciones", 20, 198)

        doc.addPage("landscape")
        yPosition = 20
      }

      doc.setFontSize(14)
      doc.setFont("helvetica", "bold")
      doc.text(`Designación #${index + 1}`, 20, yPosition)
      yPosition += 10

      doc.setFontSize(12)
      doc.setFont("helvetica", "normal")
      doc.text(`Campeonato: ${championship?.name || 'No especificado'}`, 20, yPosition)
      yPosition += 10
      doc.text(`Partido: ${assignment.matchName || 'No especificado'}`, 20, yPosition)
      yPosition += 10
      doc.text(`Fecha: ${assignment.matchDate ? format(parseISO(assignment.matchDate), "dd/MM/yyyy") : 'No especificada'}`, 20, yPosition)
      yPosition += 10
      doc.text(`Hora: ${assignment.matchTime || 'No especificada'}`, 20, yPosition)
      yPosition += 10
      doc.text(`Ubicación: ${assignment.location || 'No especificada'}`, 20, yPosition)
      yPosition += 15

      doc.setFont("helvetica", "bold")
      doc.text("Árbitros Designados:", 20, yPosition)
      yPosition += 10
      doc.setFont("helvetica", "normal")

      assignment.referees.forEach((ref, refIndex) => {
        const referee = getRefereeById(ref.id)
        const yRefPosition = yPosition + (refIndex * 10)

        doc.text(`${ref.role}:`, 25, yRefPosition)
        doc.text(`${referee?.name || 'No asignado'} (${referee?.category || 'N/A'})`, 60, yRefPosition)

        if (referee && !eligibleReferees.some(r => r.id === referee.id)) {
          doc.setTextColor(255, 165, 0)
          doc.text("(Baja Asistencia)", 130, yRefPosition)
          doc.setTextColor(0, 0, 0)
        }
      })

      yPosition += assignment.referees.length * 10 + 10

      if (assignment.notes) {
        doc.setFont("helvetica", "bold")
        doc.text("Notas:", 20, yPosition)
        yPosition += 8
        doc.setFont("helvetica", "normal")
        const splitNotes = doc.splitTextToSize(assignment.notes, 230)
        doc.text(splitNotes, 25, yPosition)
        yPosition += splitNotes.length * 7
      }

      doc.setDrawColor(200, 200, 200)
      doc.line(20, yPosition, 280, yPosition)
      yPosition += 10
    })

    // Firma final
    doc.setFont("helvetica", "italic")
    doc.setFontSize(11)
    doc.text("_________________________", 20, yPosition + 10)
    doc.text("Responsable de Designaciones", 20, yPosition + 18)

    // Pie de página
    doc.setFontSize(10)
    doc.setTextColor(100)
    doc.text(`Generado el ${format(new Date(), "dd/MM/yyyy HH:mm")}`, 148, 205, { align: "center" })

    const fileName = `Designaciones_${format(new Date(), "yyyy-MM-dd")}.pdf`
    doc.save(fileName)
    toast.success(`PDF con ${assignments.length} designaciones generado correctamente`)

  } catch (error) {
    console.error("Error al generar PDF:", error)
    toast.error("Ocurrió un error al generar el PDF")
  }
}

/// DE AQUI NO TOCAR
  // Verificación de duplicidades en tiempo real
  useEffect(() => {
    if (newAssignment.referees.length > 0) {
      const errors = checkDuplicateReferees(newAssignment)
      if (errors.length > 0) {
        errors.forEach(error => toast.error(error))
      }
    }
  }, [newAssignment.referees, assignments])

  // Interfaz gráfica
  return (
    <div className="p-4 space-y-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="flex-1">
              <Label htmlFor="search">Buscar</Label>
              <Input
                id="search"
                placeholder="Buscar partidos, árbitros o ubicaciones"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <Label htmlFor="championship">Campeonato</Label>
              <Select
                value={selectedChampionship}
                onValueChange={setSelectedChampionship}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar campeonato" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los campeonatos</SelectItem>
                  {championships.map(champ => (
                    <SelectItem key={champ.id} value={champ.id}>
                      {champ.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Campeonato</TableHead>
                <TableHead>Partido</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Hora</TableHead>
                <TableHead>Ubicación</TableHead>
                <TableHead>Árbitros</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAssignments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    No se encontraron designaciones
                  </TableCell>
                </TableRow>
              ) : (
                filteredAssignments.map(assignment => {
                  const championship = getChampionshipById(assignment.championshipId)
                  return (
                    <TableRow key={assignment.id}>
                      <TableCell>
                        <Badge variant="secondary">
                          {championship?.name || "Sin campeonato"}
                        </Badge>
                      </TableCell>
                      <TableCell>{assignment.matchName}</TableCell>
                      <TableCell>
                        {format(parseISO(assignment.matchDate), "dd/MM/yyyy")}
                      </TableCell>
                      <TableCell>{assignment.matchTime}</TableCell>
                      <TableCell>{assignment.location}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {assignment.referees.map((ref, index) => {
                            const referee = getRefereeById(ref.id)
                            const isEligible = eligibleReferees.some(r => r.id === ref.id)
                            return (
                              <div 
                                key={index} 
                                className={`text-sm ${
                                  !isEligible ? 'text-amber-600' : ''
                                }`}
                              >
                                {ref.role}: {referee?.name || "No asignado"} ({referee?.category || "N/A"})
                                {!isEligible && " (Baja asistencia)"}
                              </div>
                            )
                          })}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => startEdit(assignment)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              onDeleteAssignment?.(assignment.id)
                              toast.success("Designación eliminada")
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => exportToPDF(assignment)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
          
          <div className="mt-6 flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500">
                Mostrando {filteredAssignments.length} de {assignments.length} designaciones
              </p>
            </div>
            <div>
              <Button onClick={exportAllToPDF}>
                <Download className="mr-2 h-4 w-4" />
                Exportar todas
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    
      {/* Diálogo para agregar nueva designación */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogTrigger asChild>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Agregar Designación
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-3xl max-h-screen overflow-auto">
          <DialogHeader>
            <DialogTitle>Agregar Nueva Designación</DialogTitle>
            <DialogDescription>
              Complete los campos para agregar una nueva designación arbitral.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="championship">Campeonato</Label>
                <Select
                  value={newAssignment.championshipId}
                  onValueChange={(value) => 
                    setNewAssignment(prev => ({ ...prev, championshipId: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar campeonato" />
                  </SelectTrigger>
                  <SelectContent>
                    {championships.map(champ => (
                      <SelectItem key={champ.id} value={champ.id}>
                        {champ.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="matchDate">Fecha del partido</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="matchDate"
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {matchDate ? format(matchDate, "PPP", { locale: es }) : <span>Seleccionar fecha</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={matchDate}
                      onSelect={(date) => {
                        if (date) {
                          setMatchDate(date)
                          setNewAssignment(prev => ({
                            ...prev,
                            matchDate: format(date, "yyyy-MM-dd")
                          }))
                        }
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="matchName">Nombre del partido</Label>
              <Input
                id="matchName"
                value={newAssignment.matchName}
                onChange={(e) => 
                  setNewAssignment(prev => ({ ...prev, matchName: e.target.value }))
                }
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="matchTime">Hora</Label>
                <Input
                  id="matchTime"
                  type="time"
                  value={newAssignment.matchTime}
                  onChange={(e) => 
                    setNewAssignment(prev => ({ ...prev, matchTime: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Ubicación</Label>
                <Input
                  id="location"
                  value={newAssignment.location}
                  onChange={(e) => 
                    setNewAssignment(prev => ({ ...prev, location: e.target.value }))
                  }
                />
              </div>
            </div>
            
            <div>
              <Label>Árbitros</Label>
              <div className="space-y-2">
                {newAssignment.referees.map((ref, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Select
                      value={ref.id || "NONE"}
                      onValueChange={(value) => handleRefereeChange(index, value)}
                    >
                      <SelectTrigger className="w-1/2">
                        <SelectValue placeholder="Seleccionar árbitro" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NONE">Sin árbitro</SelectItem>
                        {referees.map(referee => (
                          <SelectItem key={referee.id} value={referee.id}>
                            {referee.name} ({referee.category})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select
                      value={ref.role}
                      onValueChange={(value) => handleRoleChange(index, value)}
                    >
                      <SelectTrigger className="w-1/2">
                        <SelectValue placeholder="Seleccionar rol" />
                      </SelectTrigger>
                      <SelectContent>
                        {REFEREE_ROLES.map(role => (
                          <SelectItem key={role} value={role}>
                            {role}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveRefereeFromAssignment(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleAddRefereeToAssignment()}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Añadir árbitro
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Notas</Label>
              <Textarea
                id="notes"
                value={newAssignment.notes}
                onChange={(e) => 
                  setNewAssignment(prev => ({ ...prev, notes: e.target.value }))
                }
              />
            </div>
            
            <DialogFooter>
              <Button type="submit">Guardar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Diálogo para editar designación */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-3xl max-h-screen overflow-auto">
          <DialogHeader>
            <DialogTitle>Editar Designación</DialogTitle>
            <DialogDescription>
              Edite los campos de la designación arbitral.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            {editingAssignment && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="editChampionship">Campeonato</Label>
                    <Select
                      value={editingAssignment.championshipId}
                      onValueChange={(value) => 
                        setEditingAssignment(prev => prev ? { ...prev, championshipId: value } : null)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar campeonato" />
                      </SelectTrigger>
                      <SelectContent>
                        {championships.map(champ => (
                          <SelectItem key={champ.id} value={champ.id}>
                            {champ.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="editMatchDate">Fecha del partido</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          id="editMatchDate"
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {matchDate ? format(matchDate, "PPP", { locale: es }) : <span>Seleccionar fecha</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={matchDate}
                          onSelect={(date) => {
                            if (date) {
                              setMatchDate(date)
                              setEditingAssignment(prev => prev ? {
                                ...prev,
                                matchDate: format(date, "yyyy-MM-dd")
                              } : null)
                            }
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="editMatchName">Nombre del partido</Label>
                  <Input
                    id="editMatchName"
                    value={editingAssignment.matchName}
                    onChange={(e) => 
                      setEditingAssignment(prev => prev ? { ...prev, matchName: e.target.value } : null)
                    }
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="editMatchTime">Hora</Label>
                    <Input
                      id="editMatchTime"
                      type="time"
                      value={editingAssignment.matchTime}                                                                                  
                      onChange={(e) => 
                        setEditingAssignment(prev => prev ? { ...prev, matchTime: e.target.value } : null)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="editLocation">Ubicación</Label>
                    <Input
                      id="editLocation"
                      value={editingAssignment.location}
                      onChange={(e) => 
                        setEditingAssignment(prev => prev ? { ...prev, location: e.target.value } : null)
                      }
                    />
                  </div>
                </div>
                
                <div>
                  <Label>Árbitros</Label>
                  <div className="space-y-2">
                    {editingAssignment.referees.map((ref, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Select
                          value={ref.id || "NONE"}
                          onValueChange={(value) => handleRefereeChange(index, value, true)}
                        >
                          <SelectTrigger className="w-1/2">
                            <SelectValue placeholder="Seleccionar árbitro" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="NONE">Sin árbitro</SelectItem>
                            {referees.map(referee => (
                              <SelectItem key={referee.id} value={referee.id}>
                                {referee.name} ({referee.category})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select
                          value={ref.role}
                          onValueChange={(value) => handleRoleChange(index, value, true)}
                        >
                          <SelectTrigger className="w-1/2">
                            <SelectValue placeholder="Seleccionar rol" />
                          </SelectTrigger>
                          <SelectContent>
                            {REFEREE_ROLES.map(role => (
                              <SelectItem key={role} value={role}>
                                {role}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveRefereeFromAssignment(index, true)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleAddRefereeToAssignment(true)}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Añadir árbitro
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="editNotes">Notas</Label>
                  <Textarea
                    id="editNotes"
                    value={editingAssignment.notes}
                    onChange={(e) => 
                      setEditingAssignment(prev => prev ? { ...prev, notes: e.target.value } : null)
                    }
                  />
                </div>
                
                <DialogFooter>
                  <Button type="submit">Guardar cambios</Button>
                </DialogFooter>
              </>
            )}
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}