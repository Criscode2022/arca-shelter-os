export type User = {
  id: string; email: string; name: string; shelterName: string; phone: string; city: string; kennelCapacity: number; createdAt: string;
};
export type AuthResponse = { accessToken: string; user: User };
export type Animal = {
  id: string; fosterId: string | null; fosterName: string | null; name: string; species: string; breed: string; sex: string;
  ageMonths: number; weightKg: number; color: string; microchip: string; kennel: string; status: string; intakeDate: string; notes: string;
};
export type Medical = {
  id: string; animalId: string; animalName: string | null; kind: string; title: string; notes: string; givenAt: string; nextDue: string | null;
};
export type Foster = { id: string; name: string; email: string; phone: string; city: string; capacity: number; notes: string; placed: number };
export type Adoption = {
  id: string; animalId: string; animalName: string | null; applicantName: string; email: string; phone: string;
  homeType: string; hasYard: boolean; otherPets: string; status: string; notes: string;
};
export type Volunteer = { id: string; name: string; email: string; phone: string; skills: string; status: string };
export type Shift = { id: string; volunteerId: string; volunteerName: string; shiftDate: string; startTime: string; endTime: string; role: string; status: string };
export type Stock = { id: string; name: string; category: string; quantity: number; unit: string; minQuantity: number; low: boolean };
export type Dashboard = {
  shelterName: string;
  occupancy: { inHouse: number; capacity: number; remaining: number; pct: number };
  totals: { animals: number; available: number; medical: number; foster: number; adopted: number; intake: number };
  byStatus: Record<string, number>;
  bySpecies: Record<string, number>;
  dueMedical: { id: string; title: string; nextDue: string; animalName: string; kind: string }[];
  pendingAdoptions: { id: string; applicantName: string; status: string; animalName: string }[];
  lowStock: { name: string; quantity: number; unit: string; minQuantity: number }[];
  upcomingShifts: { date: string; startTime: string; role: string; volunteerName: string }[];
};
