import type { CSSProperties } from 'react';

const SEATS = 8;
const DEGREES_PER_SEAT = 360 / SEATS;

interface PlayerAvatarProps {
  nickname: string;
  seatIndex: number;
}

function initialsFor(nickname: string): string {
  return nickname.trim().slice(0, 2).toUpperCase();
}

export function PlayerAvatar({ nickname, seatIndex }: PlayerAvatarProps) {
  const hue = (seatIndex * DEGREES_PER_SEAT) % 360;
  const style = { '--avatar-hue': hue } as CSSProperties;

  return (
    <div className="avatar" style={style} aria-label={nickname}>
      {initialsFor(nickname)}
    </div>
  );
}
