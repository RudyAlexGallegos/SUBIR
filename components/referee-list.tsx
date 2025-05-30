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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
import { Edit, Trash2, Plus } from "lucide-react"
import { v4 as uuidv4 } from "uuid"

interface Referee {
  id: string
  name: string
  phone: string
  email: string
  category: string
  active: boolean
}

interface RefereeListProps {
  referees: Referee[]
  onAddReferee: (referee: Referee) => void
  onUpdateReferee: (id: string, referee: Referee) => void
  onDeleteReferee: (id: string) => void
}

export default function RefereeList({ referees, onAddReferee, onUpdateReferee, onDeleteReferee }: RefereeListProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [newReferee, setNewReferee] = useState<Referee>({
    id: "",
    name: "",
    phone: "",
    email: "",
    category: "Nacional",
    active: true,
  })
  const [editingReferee, setEditingReferee] = useState<Referee | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onAddReferee({
      ...newReferee,
      id: uuidv4(),
    })
    setNewReferee({
      id: "",
      name: "",
      phone: "",
      email: "",
      category: "Nacional",
      active: true,
    })
    setIsAddDialogOpen(false)
  }

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingReferee) {
      onUpdateReferee(editingReferee.id, editingReferee)
      setEditingReferee(null)
      setIsEditDialogOpen(false)
    }
  }

  const startEdit = (referee: Referee) => {
    setEditingReferee({ ...referee })
    setIsEditDialogOpen(true)
  }

  const filteredReferees = referees.filter(
    (referee) =>
      referee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      referee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      referee.category.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="w-1/2">
          <Input
            placeholder="Buscar árbitros..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Agregar Árbitro
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleAddSubmit}>
              <DialogHeader>
                <DialogTitle>Agregar Nuevo Árbitro</DialogTitle>
                <DialogDescription>Ingresa los datos del nuevo árbitro para agregarlo al sistema.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Nombre
                  </Label>
                  <Input
                    id="name"
                    value={newReferee.name}
                    onChange={(e) => setNewReferee({ ...newReferee, name: e.target.value })}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="phone" className="text-right">
                    Teléfono
                  </Label>
                  <Input
                    id="phone"
                    value={newReferee.phone}
                    onChange={(e) => setNewReferee({ ...newReferee, phone: e.target.value })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="text-right">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={newReferee.email}
                    onChange={(e) => setNewReferee({ ...newReferee, email: e.target.value })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="category" className="text-right">
                    Categoría
                  </Label>
                  <Select
                    value={newReferee.category}
                    onValueChange={(value) => setNewReferee({ ...newReferee, category: value })}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Seleccionar categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Nacional">Nacional</SelectItem>
                      <SelectItem value="Regional">Primera</SelectItem>
                      <SelectItem value="Provincial">Segunda</SelectItem>
                      <SelectItem value="Local">Tercera -</SelectItem>
                      <SelectItem value="Local">Aspirante</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Guardar</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {referees.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground">
          No hay árbitros registrados. Agrega uno para comenzar.
        </div>
      ) : (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReferees.map((referee) => (
                <TableRow key={referee.id}>
                  <TableCell className="font-medium">{referee.name}</TableCell>
                  <TableCell>{referee.phone}</TableCell>
                  <TableCell>{referee.email}</TableCell>
                  <TableCell>{referee.category}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => startEdit(referee)}>
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
                              Esta acción eliminará permanentemente a {referee.name} del sistema y no se puede deshacer.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => onDeleteReferee(referee.id)}>Eliminar</AlertDialogAction>
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
          {editingReferee && (
            <form onSubmit={handleEditSubmit}>
              <DialogHeader>
                <DialogTitle>Editar Árbitro</DialogTitle>
                <DialogDescription>Actualiza la información del árbitro.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-name" className="text-right">
                    Nombre
                  </Label>
                  <Input
                    id="edit-name"
                    value={editingReferee.name}
                    onChange={(e) => setEditingReferee({ ...editingReferee, name: e.target.value })}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-phone" className="text-right">
                    Teléfono
                  </Label>
                  <Input
                    id="edit-phone"
                    value={editingReferee.phone}
                    onChange={(e) => setEditingReferee({ ...editingReferee, phone: e.target.value })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-email" className="text-right">
                    Email
                  </Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={editingReferee.email}
                    onChange={(e) => setEditingReferee({ ...editingReferee, email: e.target.value })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-category" className="text-right">
                    Categoría
                  </Label>
                  <Select
                    value={editingReferee.category}
                    onValueChange={(value) => setEditingReferee({ ...editingReferee, category: value })}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Seleccionar categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Nacional">Nacional</SelectItem>
                      <SelectItem value="Regional">Primera</SelectItem>
                      <SelectItem value="Provincial">Segunda</SelectItem>
                      <SelectItem value="Local">Tercera -</SelectItem>
                      <SelectItem value="Local">Aspirante</SelectItem>
                    </SelectContent>
                  </Select>
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
