import { Lock, Calendar, List } from "lucide-react";

export const COLORS = {
  private: '#FFD700',
  event: '#FF69B4',
  default: '#87CEEB'
};

export const TABS = [
  { label: 'All', value: 'all', icon: <List size={24} /> },
  { label: 'Private', value: 'private', icon: <Lock size={24} /> },
  { label: 'Event', value: 'event', icon: <Calendar size={24} /> }
];

export const ROOMS = [
  { id: 1, name: 'Private Room 1', type: 'private', description: 'Play private game' },
  { id: 2, name: 'Private Room 2', type: 'private', description: 'Private game' },
  { id: 3, name: 'Event Room 1', type: 'event', description: 'Lets event' },
  { id: 4, name: 'Event Room 2', type: 'event', description: 'Play event game with us' }
];
