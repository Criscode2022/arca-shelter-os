export const ANIMAL_STATUSES = [
  'intake',
  'medical',
  'available',
  'foster',
  'adopted',
  'archived',
] as const;

export type AnimalStatus = (typeof ANIMAL_STATUSES)[number];

export const ADOPTION_STATUSES = ['new', 'review', 'approved', 'denied', 'withdrawn'] as const;
export type AdoptionStatus = (typeof ADOPTION_STATUSES)[number];

const IN_HOUSE: AnimalStatus[] = ['intake', 'medical', 'available'];

export function isAnimalStatus(value: string): value is AnimalStatus {
  return (ANIMAL_STATUSES as readonly string[]).includes(value);
}

export function canOpenAdoption(status: string): boolean {
  return status === 'available' || status === 'foster';
}

export function canApproveAdoption(status: string): boolean {
  return status === 'new' || status === 'review';
}

export function kennelOccupancy(
  animals: { status: string }[],
  capacity: number,
): { inHouse: number; capacity: number; remaining: number; pct: number } {
  const inHouse = animals.filter((a) => IN_HOUSE.includes(a.status as AnimalStatus)).length;
  const safeCapacity = Math.max(0, capacity);
  return {
    inHouse,
    capacity: safeCapacity,
    remaining: Math.max(0, safeCapacity - inHouse),
    pct: safeCapacity ? Math.round((inHouse / safeCapacity) * 100) : 0,
  };
}

export function inventoryIsLow(quantity: number, minQuantity: number): boolean {
  return Number(quantity) <= Number(minQuantity);
}

export function nextAdoptionStatus(
  current: AdoptionStatus,
  action: 'review' | 'approve' | 'deny' | 'withdraw',
): AdoptionStatus {
  if (action === 'withdraw') return 'withdrawn';
  if (current === 'withdrawn' || current === 'denied' || current === 'approved') return current;
  if (action === 'review') return 'review';
  if (action === 'approve' && canApproveAdoption(current)) return 'approved';
  if (action === 'deny' && canApproveAdoption(current)) return 'denied';
  return current;
}
