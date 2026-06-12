

export type RideStatus =
  | 'idle'
  | 'requesting'
  | 'accepted'
  | 'active'
  | 'completed'
  | 'cancelled'
  | 'rejected';


  const TERMINAL_STATES: RideStatus[] = ['completed', 'cancelled', 'rejected'];

  export const isTerminal = (status :RideStatus) => TERMINAL_STATES.includes(status)


  export const canTransition = (from: RideStatus, to: RideStatus): boolean => {
  const allowed: Record<RideStatus, RideStatus[]> = {
    idle:       ['requesting'],
    requesting: ['accepted', 'rejected', 'cancelled'],
    accepted:   ['active', 'cancelled'],
    active:     ['completed', 'cancelled'],
    completed:  [],
    cancelled:  [],
    rejected:   [],
  };
  return allowed[from].includes(to);
};
