import { query, queryOne, execute, generateId } from '@/lib/db'
import { conflict, notFound } from '@/lib/api-handler'

export type CrewRole = 'captain' | 'engineer' | 'deckhand' | 'nets_officer'
export type CrewStatus = 'active' | 'inactive'

export interface BoatCrewMember {
  id: string
  boat_id: string
  crew_member_id: string
  role: CrewRole
  status: CrewStatus
  joined_date: string
  created_at: string
  crew_name?: string
  crew_email?: string
  boat_name?: string
  registration_number?: string
}

export interface AddBoatCrewInput {
  boatId: string
  crewMemberId: string
  role?: CrewRole
  joinedDate?: string
}

export async function listBoatCrew(
  tenantId: string,
  boatId?: string,
): Promise<BoatCrewMember[]> {
  const conditions = ['b.tenant_id = ?', "bc.status = 'active'"]
  const params: unknown[] = [tenantId]

  if (boatId) {
    conditions.push('bc.boat_id = ?')
    params.push(boatId)
  }

  return query<BoatCrewMember>(
    `SELECT bc.*,
            CONCAT(u.first_name, ' ', u.last_name) as crew_name,
            u.email as crew_email,
            b.name as boat_name,
            b.registration_number
     FROM boat_crew bc
     JOIN boats b ON bc.boat_id = b.id
     JOIN users u ON bc.crew_member_id = u.id
     WHERE ${conditions.join(' AND ')}
     ORDER BY b.name ASC, bc.joined_date DESC`,
    params,
  )
}

export async function addBoatCrew(
  tenantId: string,
  input: AddBoatCrewInput,
): Promise<BoatCrewMember> {
  const boat = await queryOne<{ id: string }>(
    'SELECT id FROM boats WHERE id = ? AND tenant_id = ?',
    [input.boatId, tenantId],
  )
  if (!boat) throw notFound('Boat not found')

  const user = await queryOne<{ id: string }>(
    'SELECT id FROM users WHERE id = ?',
    [input.crewMemberId],
  )
  if (!user) throw notFound('Crew member not found')

  const existing = await queryOne<{ id: string; status: string }>(
    'SELECT id, status FROM boat_crew WHERE boat_id = ? AND crew_member_id = ?',
    [input.boatId, input.crewMemberId],
  )
  if (existing) {
    if (existing.status === 'active') {
      throw conflict('Crew member is already assigned to this boat')
    }
    await execute(
      `UPDATE boat_crew SET status = 'active', role = ?, joined_date = ? WHERE id = ?`,
      [input.role || 'deckhand', input.joinedDate || new Date().toISOString().slice(0, 10), existing.id],
    )
    const row = await getBoatCrewById(existing.id)
    if (!row) throw new Error('Failed to reactivate crew assignment')
    return row
  }

  const id = generateId()
  await execute(
    `INSERT INTO boat_crew (id, boat_id, crew_member_id, role, status, joined_date)
     VALUES (?, ?, ?, ?, 'active', ?)`,
    [
      id,
      input.boatId,
      input.crewMemberId,
      input.role || 'deckhand',
      input.joinedDate || new Date().toISOString().slice(0, 10),
    ],
  )

  const row = await getBoatCrewById(id)
  if (!row) throw new Error('Failed to add crew member')
  return row
}

export async function getBoatCrewById(id: string): Promise<BoatCrewMember | null> {
  return queryOne<BoatCrewMember>(
    `SELECT bc.*,
            CONCAT(u.first_name, ' ', u.last_name) as crew_name,
            u.email as crew_email,
            b.name as boat_name,
            b.registration_number
     FROM boat_crew bc
     JOIN boats b ON bc.boat_id = b.id
     JOIN users u ON bc.crew_member_id = u.id
     WHERE bc.id = ?`,
    [id],
  )
}

export async function removeBoatCrew(
  tenantId: string,
  crewAssignmentId: string,
): Promise<boolean> {
  const row = await queryOne<{ id: string }>(
    `SELECT bc.id FROM boat_crew bc
     JOIN boats b ON bc.boat_id = b.id
     WHERE bc.id = ? AND b.tenant_id = ?`,
    [crewAssignmentId, tenantId],
  )
  if (!row) throw notFound('Crew assignment not found')

  const result = await execute(
    `UPDATE boat_crew SET status = 'inactive' WHERE id = ?`,
    [crewAssignmentId],
  )
  return ((result as { affectedRows?: number }).affectedRows ?? 0) > 0
}
