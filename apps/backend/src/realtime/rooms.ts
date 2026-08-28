/**
 * Creates the room identifier for a ticket.
 *
 * @param ticketId - The ticket identifier
 * @returns The room identifier formatted as `ticket:<ticketId>`
 */
export function ticketRoom(ticketId: string): string {
    return `ticket:${ticketId}`
}