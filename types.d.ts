interface Referee {
  id: string
  name: string
  phone: string
  email: string
  category: string
  active: boolean
}

interface AttendanceRecord {
  id: string
  refereeId: string
  date: string
  present: boolean
}

interface Championship {
  id: string
  name: string
  location: string
  startDate: string
  endDate: string
  description: string
}

interface Assignment {
  id: string
  championshipId: string
  refereeId: string
  matchName: string
  matchDate: string
  location: string
  role: string
  notes: string
}
