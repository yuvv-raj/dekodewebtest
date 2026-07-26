import { MeetingSlotProvider } from './meetingSlotProvider.js';

export class CalendarMeetingSlotProvider extends MeetingSlotProvider {
  async getAvailableSlots() {
    throw new Error('Calendar provider is not configured. Connect a secure server-side calendar adapter.');
  }
}
