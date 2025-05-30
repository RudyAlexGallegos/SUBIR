"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, ClipboardList, Trophy, Users } from "lucide-react"
import RefereeList from "@/components/referee-list"
import AttendanceTracker from "@/components/attendance-tracker"
import ChampionshipManager from "@/components/championship-manager"
import AssignmentManager from "@/components/assignment-manager"
import { Toaster } from "@/components/ui/toaster"
import { useToast } from "@/hooks/use-toast"

// Define types
interface Referee {
  id: string
  name: string
  email: string
  phone: string
}

interface AttendanceRecord {
  refereeId: string
  date: string
  isPresent: boolean
}

interface Championship {
  id: string
  name: string
  startDate: string
  endDate: string
}

interface Assignment {
  id: string
  refereeId: string
  championshipId: string
  matchDate: string
  role: string
}

export default function Home() {
  const { toast } = useToast()
  const [referees, setReferees] = useState<Referee[]>([])
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([])
  const [championships, setChampionships] = useState<Championship[]>([])
  const [assignments, setAssignments] = useState<Assignment[]>([])

  // Cargar datos al iniciar
  useEffect(() => {
    // En una aplicación real, aquí cargaríamos los datos desde el almacenamiento local
    // Para esta demo, usamos datos de ejemplo
    const savedReferees = localStorage.getItem("referees")
    const savedAttendance = localStorage.getItem("attendance")
    const savedChampionships = localStorage.getItem("championships")
    const savedAssignments = localStorage.getItem("assignments")

    if (savedReferees) setReferees(JSON.parse(savedReferees))
    if (savedAttendance) setAttendance(JSON.parse(savedAttendance))
    if (savedChampionships) setChampionships(JSON.parse(savedChampionships))
    if (savedAssignments) setAssignments(JSON.parse(savedAssignments))
  }, [])

  // Guardar datos cuando cambian
  useEffect(() => {
    localStorage.setItem("referees", JSON.stringify(referees))
  }, [referees])

  useEffect(() => {
    localStorage.setItem("attendance", JSON.stringify(attendance))
  }, [attendance])

  useEffect(() => {
    localStorage.setItem("championships", JSON.stringify(championships))
  }, [championships])

  useEffect(() => {
    localStorage.setItem("assignments", JSON.stringify(assignments))
  }, [assignments])

  const handleAddReferee = (referee: Referee) => {
    setReferees([...referees, referee])
    toast({
      title: "Árbitro agregado",
      description: `${referee.name} ha sido agregado a la lista.`,
    })
  }

  const handleUpdateReferee = (id: string, updatedReferee: Referee) => {
    setReferees(referees.map((ref) => (ref.id === id ? updatedReferee : ref)))
    toast({
      title: "Árbitro actualizado",
      description: `La información de ${updatedReferee.name} ha sido actualizada.`,
    })
  }

  const handleDeleteReferee = (id: string) => {
    const refereeToDelete = referees.find((ref) => ref.id === id)
    setReferees(referees.filter((ref) => ref.id !== id))

    // También eliminar registros de asistencia y asignaciones relacionadas
    setAttendance(attendance.filter((record) => record.refereeId !== id))
    setAssignments(assignments.filter((assignment) => assignment.refereeId !== id))

    toast({
      title: "Árbitro eliminado",
      description: `${refereeToDelete?.name || "El árbitro"} ha sido eliminado del sistema.`,
    })
  }

  const handleAddAttendance = (record: AttendanceRecord) => {
    // Verificar si ya existe un registro para esta fecha y árbitro
    const existingIndex = attendance.findIndex((a) => a.refereeId === record.refereeId && a.date === record.date)

    if (existingIndex >= 0) {
      // Actualizar registro existente
      const newAttendance = [...attendance]
      newAttendance[existingIndex] = record
      setAttendance(newAttendance)
    } else {
      // Agregar nuevo registro
      setAttendance([...attendance, record])
    }

    toast({
      title: "Asistencia registrada",
      description: `La asistencia ha sido actualizada correctamente.`,
    })
  }

  const handleAddChampionship = (championship: Championship) => {
    setChampionships([...championships, championship])
    toast({
      title: "Campeonato agregado",
      description: `${championship.name} ha sido agregado correctamente.`,
    })
  }

  const handleUpdateChampionship = (id: string, updatedChampionship: Championship) => {
    setChampionships(championships.map((c) => (c.id === id ? updatedChampionship : c)))
    toast({
      title: "Campeonato actualizado",
      description: `La información de ${updatedChampionship.name} ha sido actualizada.`,
    })
  }

  const handleDeleteChampionship = (id: string) => {
    const championshipToDelete = championships.find((c) => c.id === id)
    setChampionships(championships.filter((c) => c.id !== id))

    // También eliminar asignaciones relacionadas
    setAssignments(assignments.filter((a) => a.championshipId !== id))

    toast({
      title: "Campeonato eliminado",
      description: `${championshipToDelete?.name || "El campeonato"} ha sido eliminado del sistema.`,
    })
  }

  const handleAddAssignment = (assignment: Assignment) => {
    setAssignments([...assignments, assignment])
    toast({
      title: "Designación creada",
      description: `La designación ha sido creada correctamente.`,
    })
  }

  const handleUpdateAssignment = (id: string, updatedAssignment: Assignment) => {
    setAssignments(assignments.map((a) => (a.id === id ? updatedAssignment : a)))
    toast({
      title: "Designación actualizada",
      description: `La designación ha sido actualizada correctamente.`,
    })
  }

  const handleDeleteAssignment = (id: string) => {
    setAssignments(assignments.filter((a) => a.id !== id))
    toast({
      title: "Designación eliminada",
      description: `La designación ha sido eliminada correctamente.`,
    })
  }

  return (
    <div className="container mx-auto py-6">
      <header className="mb-6">
        <h1 className="text-3xl font-bold">Codar</h1>
        <p className="text-muted-foreground">Sistema de Gestión de Árbitros</p>
      </header>

      <Tabs defaultValue="referees" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="referees" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>Árbitros</span>
          </TabsTrigger>
          <TabsTrigger value="attendance" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>Asistencia</span>
          </TabsTrigger>
          <TabsTrigger value="championships" className="flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            <span>Campeonatos</span>
          </TabsTrigger>
          <TabsTrigger value="assignments" className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4" />
            <span>Designaciones</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="referees">
          <Card>
            <CardHeader>
              <CardTitle>Gestión de Árbitros</CardTitle>
              <CardDescription>Administra la lista de árbitros disponibles para designaciones.</CardDescription>
            </CardHeader>
            <CardContent>
              <RefereeList
                referees={referees}
                onAddReferee={handleAddReferee}
                onUpdateReferee={handleUpdateReferee}
                onDeleteReferee={handleDeleteReferee}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attendance">
          <Card>
            <CardHeader>
              <CardTitle>Control de Asistencia</CardTitle>
              <CardDescription>Registra la asistencia de los árbitros a los entrenamientos.</CardDescription>
            </CardHeader>
            <CardContent>
              <AttendanceTracker referees={referees} attendance={attendance} onAddAttendance={handleAddAttendance} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="championships">
          <Card>
            <CardHeader>
              <CardTitle>Gestión de Campeonatos</CardTitle>
              <CardDescription>Administra los campeonatos para realizar designaciones.</CardDescription>
            </CardHeader>
            <CardContent>
              <ChampionshipManager
                championships={championships}
                onAddChampionship={handleAddChampionship}
                onUpdateChampionship={handleUpdateChampionship}
                onDeleteChampionship={handleDeleteChampionship}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assignments">
          <Card>
            <CardHeader>
              <CardTitle>Designaciones</CardTitle>
              <CardDescription>Asigna árbitros a partidos basándose en su asistencia.</CardDescription>
            </CardHeader>
            <CardContent>
              <AssignmentManager
                referees={referees}
                championships={championships}
                attendance={attendance}
                assignments={assignments}
                onAddAssignment={handleAddAssignment}
                onUpdateAssignment={handleUpdateAssignment}
                onDeleteAssignment={handleDeleteAssignment}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      <Toaster />
    </div>
  )
}
