export const SAMPLE_MATCH = {
  id: 'rma-bar-2026',
  homeCode: 'RMA',
  awayCode: 'BAR',
  homeName: 'Real Madrid',
  awayName: 'FC Barcelona',
  competition: 'La Liga',
  stadiumName: 'Santiago Bernabéu',
  venueCity: 'Madrid, Spain',
  dateLabel: 'Saturday 12 December, 16:00',
  shortDate: 'Sat 12 Dec, 16:00',
  minPrice: 80,
  currency: 'EUR',
};

export const getTicketCode = (s) =>
  `BER-RMA-BAR-${s.blockId}0${s.row}-${s.row}-${s.seat}`;