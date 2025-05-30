"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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
import { Textarea } from "@/components/ui/textarea"
import { Edit, Trash2, Plus } from "lucide-react"
import { v4 as uuidv4 } from "uuid"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"

interface Championship {
  id: string
  name: string
  location: string
  startDate: string
  endDate: string
  description: string
}

interface ChampionshipManagerProps {
  championships: Championship[]
  onAddChampionship: (championship: Championship) => void
  onUpdateChampionship: (id: string, championship: Championship) => void
  onDeleteChampionship: (id: string) => void
}

export default function ChampionshipManager({
  championships,
  onAddChampionship,
  onUpdateChampionship,
  onDeleteChampionship,
}: ChampionshipManagerProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [newChampionship, setNewChampionship] = useState<Championship>({
    id: "",
    name: "",
    location: "",
    startDate: format(new Date(), "yyyy-MM-dd"),
    endDate: format(new Date(new Date().setMonth(new Date().getMonth() + 1)), "yyyy-MM-dd"),
    description: "",
  })
  const [editingChampionship, setEditingChampionship] = useState<Championship | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [startDate, setStartDate] = useState<Date>(new Date())
  const [endDate, setEndDate] = useState<Date>(new Date(new Date().setMonth(new Date().getMonth() + 1)))

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onAddChampionship({
      ...newChampionship,
      id: uuidv4(),
      startDate: format(startDate, "yyyy-MM-dd"),
      endDate: format(endDate, "yyyy-MM-dd"),
    })
    setNewChampionship({
      id: "",
      name: "",
      location: "",
      startDate: format(new Date(), "yyyy-MM-dd"),
      endDate: format(new Date(new Date().setMonth(new Date().getMonth() + 1)), "yyyy-MM-dd"),
      description: "",
    })
    setStartDate(new Date())
    setEndDate(new Date(new Date().setMonth(new Date().getMonth() + 1)))
    setIsAddDialogOpen(false)
  }

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingChampionship) {
      onUpdateChampionship(editingChampionship.id, {
        ...editingChampionship,
        startDate: format(startDate, "yyyy-MM-dd"),
        endDate: format(endDate, "yyyy-MM-dd"),
      })
      setEditingChampionship(null)
      setIsEditDialogOpen(false)
    }
  }

  const startEdit = (championship: Championship) => {
    setEditingChampionship({ ...championship })
    setStartDate(new Date(championship.startDate))
    setEndDate(new Date(championship.endDate))
    setIsEditDialogOpen(true)
  }

  const filteredChampionships = championships.filter(
    (championship) =>
      championship.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      championship.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      championship.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="w-1/2">
          <Input
            placeholder="Buscar campeonatos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Agregar Campeonato
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleAddSubmit}>
              <DialogHeader>
                <DialogTitle>Agregar Nuevo Campeonato</DialogTitle>
                <DialogDescription>Ingresa los datos del nuevo campeonato para agregarlo al sistema.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Nombre
                  </Label>
                  <Input
                    id="name"
                    value={newChampionship.name}
                    onChange={(e) => setNewChampionship({ ...newChampionship, name: e.target.value })}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="location" className="text-right">
                    Ubicación
                  </Label>
                  <Input
                    id="location"
                    value={newChampionship.location}
                    onChange={(e) => setNewChampionship({ ...newChampionship, location: e.target.value })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="startDate" className="text-right">
                    Fecha Inicio
                  </Label>
                  <div className="col-span-3">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {format(startDate, "PPP", { locale: es })}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={startDate}
                          onSelect={(date) => date && setStartDate(date)}
                          initialFocus
                          locale={es}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="endDate" className="text-right">
                    Fecha Fin
                  </Label>
                  <div className="col-span-3">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {format(endDate, "PPP", { locale: es })}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={endDate}
                          onSelect={(date) => date && setEndDate(date)}
                          initialFocus
                          locale={es}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="description" className="text-right">
                    Descripción
                  </Label>
                  <Textarea
                    id="description"
                    value={newChampionship.description}
                    onChange={(e) => setNewChampionship({ ...newChampionship, description: e.target.value })}
                    className="col-span-3"
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Guardar</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {championships.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground">
          No hay campeonatos registrados. Agrega uno para comenzar.
        </div>
      ) : (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Ubicación</TableHead>
                <TableHead>Fecha Inicio</TableHead>
                <TableHead>Fecha Fin</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredChampionships.map((championship) => (
                <TableRow key={championship.id}>
                  <TableCell className="font-medium">{championship.name}</TableCell>
                  <TableCell>{championship.location}</TableCell>
                  <TableCell>{format(new Date(championship.startDate), "dd/MM/yyyy")}</TableCell>
                  <TableCell>{format(new Date(championship.endDate), "dd/MM/yyyy")}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => startEdit(championship)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta acción eliminará permanentemente el campeonato {championship.name} del sistema y no
                              se puede deshacer.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => onDeleteChampionship(championship.id)}>
                              Eliminar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          {editingChampionship && (
            <form onSubmit={handleEditSubmit}>
              <DialogHeader>
                <DialogTitle>Editar Campeonato</DialogTitle>
                <DialogDescription>Actualiza la información del campeonato.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-name" className="text-right">
                    Nombre
                  </Label>
                  <Input
                    id="edit-name"
                    value={editingChampionship.name}
                    onChange={(e) => setEditingChampionship({ ...editingChampionship, name: e.target.value })}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-location" className="text-right">
                    Ubicación
                  </Label>
                  <Input
                    id="edit-location"
                    value={editingChampionship.location}
                    onChange={(e) => setEditingChampionship({ ...editingChampionship, location: e.target.value })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-startDate" className="text-right">
                    Fecha Inicio
                  </Label>
                  <div className="col-span-3">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {format(startDate, "PPP", { locale: es })}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={startDate}
                          onSelect={(date) => date && setStartDate(date)}
                          initialFocus
                          locale={es}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-endDate" className="text-right">
                    Fecha Fin
                  </Label>
                  <div className="col-span-3">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {format(endDate, "PPP", { locale: es })}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={endDate}
                          onSelect={(date) => date && setEndDate(date)}
                          initialFocus
                          locale={es}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-description" className="text-right">
                    Descripción
                  </Label>
                  <Textarea
                    id="edit-description"
                    value={editingChampionship.description}
                    onChange={(e) => setEditingChampionship({ ...editingChampionship, description: e.target.value })}
                    className="col-span-3"
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Actualizar</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
