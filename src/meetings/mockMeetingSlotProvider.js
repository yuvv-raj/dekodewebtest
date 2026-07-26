import { MeetingSlotProvider } from './meetingSlotProvider.js';

export class MockMeetingSlotProvider extends MeetingSlotProvider {
  constructor(config = {}) {
    super();
    this.config = {
      businessDays: config.businessDays || [1, 2, 3, 4, 5],
      availableTimes: config.availableTimes || ['11:00', '14:00', '16:30'],
      daysToGenerate: config.daysToGenerate || 7,
      minimumBookingNoticeHours: config.minimumBookingNoticeHours || 24,
      companyTimezone: config.companyTimezone || 'Australia/Melbourne',
    };
  }

  async getAvailableSlots(now = new Date(), visitorTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone) {
    const slots = [];
    const cursor = new Date(now);
    cursor.setHours(0, 0, 0, 0);
    let eligibleDays = 0;
    while (eligibleDays < this.config.daysToGenerate) {
      cursor.setDate(cursor.getDate() + 1);
      if (!this.config.businessDays.includes(cursor.getDay())) continue;
      eligibleDays += 1;
      for (const time of this.config.availableTimes) {
        const [hours, minutes] = time.split(':').map(Number);
        const slot = new Date(cursor);
        slot.setHours(hours, minutes, 0, 0);
        if (slot.getTime() - now.getTime() < this.config.minimumBookingNoticeHours * 3600000) continue;
        slots.push({
          id: slot.toISOString(),
          iso: slot.toISOString(),
          label: new Intl.DateTimeFormat(undefined, {
            weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
            timeZone: visitorTimezone,
          }).format(slot),
          visitorTimezone,
          companyTimezone: this.config.companyTimezone,
          isMock: true,
        });
      }
    }
    return slots;
  }
}
