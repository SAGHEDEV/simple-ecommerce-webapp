import type { ReactNode } from 'react'
const I = ({ children, size = 22 }: { children: ReactNode; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{children}</svg>
)
export const UserIcon = () => <I><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 4-6 8-6s8 2 8 6" /></I>
export const SearchIcon = () => <I><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></I>
export const CartIcon = () => <I><path d="M3 4h2l2.4 11.2a1 1 0 0 0 1 .8h8.8a1 1 0 0 0 1-.8L20 8H6" /><circle cx="9" cy="20" r="1.2" /><circle cx="17" cy="20" r="1.2" /></I>
export const CloseIcon = () => <I size={20}><path d="M6 6l12 12M18 6 6 18" /></I>
export const TrashIcon = () => <I size={18}><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" /></I>
export const TrophyIcon = () => <I size={36}><path d="M8 4h8v6a4 4 0 0 1-8 0V4ZM8 6H4v1a4 4 0 0 0 4 4M16 6h4v1a4 4 0 0 1-4 4M12 14v4M8 20h8" /></I>
export const CheckIcon = () => <I size={36}><circle cx="12" cy="12" r="9" /><path d="m8 12 3 3 5-6" /></I>
export const TruckIcon = () => <I size={36}><path d="M3 6h11v10H3zM14 9h4l3 3v4h-7" /><circle cx="7" cy="18" r="1.6" /><circle cx="17" cy="18" r="1.6" /></I>
export const HeadsetIcon = () => <I size={36}><path d="M4 14v-2a8 8 0 0 1 16 0v2" /><rect x="3" y="14" width="4" height="6" rx="1" /><rect x="17" y="14" width="4" height="6" rx="1" /></I>
export const Logo = () => (
  <svg width="36" height="28" viewBox="0 0 36 28" fill="#B88E2F"><path d="M2 26 14 2l5 9-7 15zM17 26 24 12l4 7-3 7zM24 12 29 3l6 11-4 12-6-14z" opacity=".9" /></svg>
)
