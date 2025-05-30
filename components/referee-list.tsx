"use client"

import { useState, useMemo } from "react"
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
import { Edit, Trash2, Plus, Search } from "lucide-react"
import { v4 as uuidv4 } from "uuid"

type RefereeCategory = "Nacional" | "Primera Categoria" | "Segunda Categoria" | "Tercera Categoria" | "Aspirante"

interface Referee {
  id: string
  name: string
  phone: string
  email: string
  category: RefereeCategory
  active: boolean
}

interface RefereeListProps {
  referees?: Referee[]
  onAddReferee?: (referee: Referee) => void
  onUpdateReferee?: (id: string, referee: Referee) => void
  onDeleteReferee?: (id: string) => void
  readonly?: boolean
}

const CATEGORIES: { value: RefereeCategory; label: string }[] = [
  { value: "Nacional", label: "Nacional" },
  { value: "Primera Categoria", label: "Primera Categoria" },
  { value: "Segunda Categoria", label: "Segunda Categoria" },
  { value: "Tercera Categoria", label: "Tercera Categoria" },
  { value: "Aspirante", label: "Aspirante" },
]

const DEFAULT_REFEREE: Omit<Referee, "id"> = {
  name: "",
  phone: "",
  email: "",
  category: "Nacional",
  active: true,
}

// Función para generar email basado en el primer nombre
const generateEmail = (name: string) => {
  const firstName = name.split(' ')[0].toLowerCase()
  return `${firstName}@codarpuno.com`
}

export default function RefereeList({ 
  referees: propReferees = [], 
  onAddReferee: propOnAddReferee, 
  onUpdateReferee: propOnUpdateReferee, 
  onDeleteReferee: propOnDeleteReferee,
  readonly = false
}: RefereeListProps) {
  // Lista completa de árbitros con emails generados automáticamente
  const staticReferees: Referee[] = [
    // Árbitros originales
    { id: "1", name: "Wilber Centeno", phone: "951123456", category: "Nacional", active: true, email: generateEmail("Wilber Centeno") },
    { id: "2", name: "Edson Pino", phone: "951234567", category: "Primera Categoria", active: true, email: generateEmail("Edson Pino") },
    { id: "3", name: "Gedeon Maquera", phone: "951345678", category: "Nacional", active: true, email: generateEmail("Gedeon Maquera") },
    { id: "4", name: "Vidal Quiñonez", phone: "951456789", category: "Primera Categoria", active: true, email: generateEmail("Vidal Quiñonez") },
    { id: "5", name: "Nestor Quispe", phone: "951567890", category: "Primera Categoria", active: true, email: generateEmail("Nestor Quispe") },
    { id: "6", name: "Maximo Diaz", phone: "951678901", category: "Nacional", active: true, email: generateEmail("Maximo Diaz") },
    { id: "7", name: "Ruben Bonifacio", phone: "951789012", category: "Primera Categoria", active: true, email: generateEmail("Ruben Bonifacio") },
    { id: "8", name: "Jose Flores", phone: "951890123", category: "Primera Categoria", active: true, email: generateEmail("Jose Flores") },
    { id: "9", name: "Javier Ortega", phone: "951901234", category: "Primera Categoria", active: true, email: generateEmail("Javier Ortega") },
    { id: "10", name: "Kim Condori", phone: "951012345", category: "Segunda Categoria", active: true, email: generateEmail("Kim Condori") },
    { id: "11", name: "Aldo Centeno", phone: "951123450", category: "Nacional", active: true, email: generateEmail("Aldo Centeno") },
    { id: "12", name: "Armando Salas", phone: "951234501", category: "Nacional", active: true, email: generateEmail("Armando Salas") },
    
    // Nuevos árbitros solicitados
    { id: "13", name: "Gustavo Sucari", phone: "951345012", category: "Nacional", active: true, email: generateEmail("Gustavo Sucari") },
    { id: "14", name: "Alex Apaza", phone: "951456123", category: "Primera Categoria", active: true, email: generateEmail("Alex Apaza") },
    { id: "15", name: "Eloy Yucra", phone: "951567234", category: "Primera Categoria", active: true, email: generateEmail("Eloy Yucra") },
    { id: "16", name: "Omar Irquinigo", phone: "951678345", category: "Primera Categoria", active: true, email: generateEmail("Omar Irquinigo") },
    { id: "17", name: "Edgar Luna", phone: "951789456", category: "Primera Categoria", active: true, email: generateEmail("Edgar Luna") },
    { id: "18", name: "Efrain Achata", phone: "951890567", category: "Primera Categoria", active: true, email: generateEmail("Efrain Achata") },
    { id: "19", name: "Wilson Gutierrez", phone: "951901678", category: "Primera Categoria", active: true, email: generateEmail("Wilson Gutierrez") },
    { id: "20", name: "Zayda Gonza", phone: "951012789", category: "Primera Categoria", active: true, email: generateEmail("Zayda Gonza") },
    { id: "21", name: "Laydy Quispe", phone: "951123890", category: "Primera Categoria", active: true, email: generateEmail("Laydy Quispe") },
    { id: "22", name: "Heber Chambilla", phone: "951234901", category: "Primera Categoria", active: true, email: generateEmail("Heber Chambilla") },
    { id: "23", name: "Jose Aviles", phone: "951345012", category: "Primera Categoria", active: true, email: generateEmail("Jose Aviles") },
    { id: "24", name: "Eloy Ordoñez", phone: "951456123", category: "Primera Categoria", active: true, email: generateEmail("Eloy Ordoñez") },
    { id: "25", name: "Fernando Quispe", phone: "951567234", category: "Primera Categoria", active: true, email: generateEmail("Fernando Quispe") },
    { id: "26", name: "Alberto Mamani", phone: "951678345", category: "Primera Categoria", active: true, email: generateEmail("Alberto Mamani") },
    { id: "27", name: "Henry Pino", phone: "951789456", category: "Primera Categoria", active: true, email: generateEmail("Henry Pino") },
    { id: "28", name: "Elisban Condori", phone: "951890567", category: "Primera Categoria", active: true, email: generateEmail("Elisban Condori") },
    { id: "29", name: "Walter Suarez", phone: "951901678", category: "Primera Categoria", active: true, email: generateEmail("Walter Suarez") },
    { id: "30", name: "Lesther Pino", phone: "951012789", category: "Primera Categoria", active: true, email: generateEmail("Lesther Pino") },
    { id: "31", name: "Percy Quispe", phone: "951123890", category: "Primera Categoria", active: true, email: generateEmail("Percy Quispe") },
    { id: "32", name: "Jhontan Bernedo", phone: "951234901", category: "Primera Categoria", active: true, email: generateEmail("Jhontan Bernedo") },
    { id: "33", name: "Claudia Apaza", phone: "951345012", category: "Primera Categoria", active: true, email: generateEmail("Claudia Apaza") },
    { id: "34", name: "Edgar Cruz", phone: "951456123", category: "Primera Categoria", active: true, email: generateEmail("Edgar Cruz") },
    { id: "35", name: "Lenin Espinoza", phone: "951567234", category: "Primera Categoria", active: true, email: generateEmail("Lenin Espinoza") },
    { id: "36", name: "Melquiades Barreda", phone: "951678345", category: "Primera Categoria", active: true, email: generateEmail("Melquiades Barreda") },
    { id: "37", name: "Angel Huaman", phone: "951789456", category: "Primera Categoria", active: true, email: generateEmail("Angel Huaman") },
    { id: "38", name: "Flora Ibañez", phone: "951890567", category: "Primera Categoria", active: true, email: generateEmail("Flora Ibañez") },
    { id: "39", name: "Clinton Salamanca", phone: "951901678", category: "Primera Categoria", active: true, email: generateEmail("Clinton Salamanca") },
    { id: "40", name: "Jhon Salamanca", phone: "951012789", category: "Primera Categoria", active: true, email: generateEmail("Jhon Salamanca") },
    { id: "41", name: "Noe Cahui", phone: "951123890", category: "Primera Categoria", active: true, email: generateEmail("Noe Cahui") },
    { id: "42", name: "Ulises Arcata", phone: "951234901", category: "Primera Categoria", active: true, email: generateEmail("Ulises Arcata") },
    { id: "43", name: "Jair Garnica", phone: "951345012", category: "Primera Categoria", active: true, email: generateEmail("Jair Garnica") },
    { id: "44", name: "Mauro Fernandez", phone: "951456123", category: "Primera Categoria", active: true, email: generateEmail("Mauro Fernandez") },
    { id: "45", name: "Alex Gallegos", phone: "951567234", category: "Primera Categoria", active: true, email: generateEmail("Alex Gallegos") },
    { id: "46", name: "Rene Huacani", phone: "951678345", category: "Primera Categoria", active: true, email: generateEmail("Rene Huacani") },
    { id: "47", name: "Dyland Larico", phone: "951789456", category: "Primera Categoria", active: true, email: generateEmail("Dyland Larico") },
    { id: "48", name: "Jasmani Chambi", phone: "951890567", category: "Primera Categoria", active: true, email: generateEmail("Jasmani Chambi") },
    { id: "49", name: "Gonzalo Tapia", phone: "951901678", category: "Primera Categoria", active: true, email: generateEmail("Gonzalo Tapia") },
    { id: "50", name: "Nestor Cruz", phone: "951012789", category: "Primera Categoria", active: true, email: generateEmail("Nestor Cruz") },
    { id: "51", name: "Franck Coaquira", phone: "951123890", category: "Primera Categoria", active: true, email: generateEmail("Franck Coaquira") },
    { id: "52", name: "Juber Mamani", phone: "951234901", category: "Primera Categoria", active: true, email: generateEmail("Juber Mamani") }
  ]

  // Estado combinado
  const [internalReferees, setInternalReferees] = useState<Referee[]>([...staticReferees, ...propReferees])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [newReferee, setNewReferee] = useState<Omit<Referee, "id">>(DEFAULT_REFEREE)
  const [editingReferee, setEditingReferee] = useState<Referee | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  // Memoizar árbitros filtrados para mejor rendimiento
  const filteredReferees = useMemo(() => {
    const term = searchTerm.toLowerCase()
    return internalReferees.filter(referee => 
      referee.name.toLowerCase().includes(term) ||
      (referee.email && referee.email.toLowerCase().includes(term)) ||
      referee.category.toLowerCase().includes(term) ||
      (referee.phone && referee.phone.includes(term))
    )
  }, [internalReferees, searchTerm])

  // Manejo de árbitros
  const handleAddReferee = (referee: Omit<Referee, "id">) => {
    const refereeWithId = { ...referee, id: uuidv4() }
    const newRefereeList = [...internalReferees, refereeWithId]
    
    setInternalReferees(newRefereeList)
    propOnAddReferee?.(refereeWithId)
    setNewReferee(DEFAULT_REFEREE)
    setIsAddDialogOpen(false)
  }

  const handleUpdateReferee = (id: string, updatedReferee: Referee) => {
    const updatedReferees = internalReferees.map(referee => 
      referee.id === id ? updatedReferee : referee
    )
    
    setInternalReferees(updatedReferees)
    propOnUpdateReferee?.(id, updatedReferee)
    setEditingReferee(null)
    setIsEditDialogOpen(false)
  }

  const handleDeleteReferee = (id: string) => {
    const updatedReferees = internalReferees.filter(referee => referee.id !== id)
    setInternalReferees(updatedReferees)
    propOnDeleteReferee?.(id)
  }

  // Handlers de formulario
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleAddReferee(newReferee)
  }

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingReferee) {
      handleUpdateReferee(editingReferee.id, editingReferee)
    }
  }

  const startEdit = (referee: Referee) => {
    setEditingReferee({ ...referee })
    setIsEditDialogOpen(true)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-1/2">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar árbitros..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full"
          />
        </div>
        
        {!readonly && (
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Agregar Árbitro
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleAddSubmit}>
                <DialogHeader>
                  <DialogTitle>Agregar Nuevo Árbitro</DialogTitle>
                  <DialogDescription>
                    Completa los datos del árbitro. Los campos marcados con * son obligatorios.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      Nombre *
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
                      type="tel"
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
                      Categoría *
                    </Label>
                    <Select
                      value={newReferee.category}
                      onValueChange={(value: RefereeCategory) => 
                        setNewReferee({ ...newReferee, category: value })
                      }
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Seleccionar categoría" />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((category) => (
                          <SelectItem key={category.value} value={category.value}>
                            {category.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">Guardar Árbitro</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {internalReferees.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground">
          No hay árbitros registrados. {!readonly && "Agrega uno para comenzar."}
        </div>
      ) : (
        <div className="border rounded-md overflow-hidden">
          <Table>
            <TableHeader className="bg-gray-50 dark:bg-gray-800">
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Categoría</TableHead>
                {!readonly && <TableHead className="text-right">Acciones</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReferees.length > 0 ? (
                filteredReferees.map((referee) => (
                  <TableRow key={referee.id}>
                    <TableCell className="font-medium">{referee.name}</TableCell>
                    <TableCell>{referee.phone || "-"}</TableCell>
                    <TableCell>{referee.email || "-"}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        referee.category === "Nacional" ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" :
                        referee.category === "Primera Categoria" ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" :
                        referee.category === "Segunda Categoria" ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" :
                        "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                      }`}>
                        {CATEGORIES.find(c => c.value === referee.category)?.label}
                      </span>
                    </TableCell>
                    {!readonly && (
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => startEdit(referee)}
                            aria-label={`Editar ${referee.name}`}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" aria-label={`Eliminar ${referee.name}`}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>¿Confirmas que deseas eliminar este árbitro?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta acción no se puede deshacer. El árbitro <strong>{referee.name}</strong> será eliminado permanentemente del sistema.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => handleDeleteReferee(referee.id)}
                                  className="bg-destructive hover:bg-destructive/90"
                                >
                                  Confirmar Eliminación
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={readonly ? 4 : 5} className="text-center py-10 text-muted-foreground">
                    No se encontraron árbitros que coincidan con la búsqueda.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Diálogo de Edición */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          {editingReferee && (
            <form onSubmit={handleEditSubmit}>
              <DialogHeader>
                <DialogTitle>Editar Árbitro</DialogTitle>
                <DialogDescription>
                  Modifica los datos del árbitro. Los campos marcados con * son obligatorios.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-name" className="text-right">
                    Nombre *
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
                    type="tel"
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
                    Categoría *
                  </Label>
                  <Select
                    value={editingReferee.category}
                    onValueChange={(value: RefereeCategory) => 
                      setEditingReferee({ ...editingReferee, category: value })
                    }
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Seleccionar categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Actualizar Árbitro</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}