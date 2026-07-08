import { Badge } from './components/Badge';
import { Button } from './components/Button';
import { Panel } from './components/Panel';
import { PlayerAvatar } from './components/PlayerAvatar';
import { PlayingCard } from './components/PlayingCard';
import { ScoreRow } from './components/ScoreRow';
import { ThemeToggle } from './components/ThemeToggle';

const NICKNAMES = ['Priya', 'Rae', 'Sam', 'Ito'];

export function Gallery() {
  return (
    <main style={{ display: 'grid', gap: '1.5rem', padding: '2rem', maxWidth: 720 }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontFamily: 'var(--font-display)' }}>Least Count — component gallery</h1>
        <ThemeToggle />
      </header>

      <Panel>
        <h2>Buttons</h2>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Button variant="primary">Start game</Button>
          <Button variant="secondary">Copy invite link</Button>
          <Button variant="danger">Leave room</Button>
          <Button variant="ghost">Cancel</Button>
        </div>
      </Panel>

      <Panel>
        <h2>Badges</h2>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <Badge variant="primary">Host</Badge>
          <Badge variant="accent">Your turn</Badge>
          <Badge variant="success">Correct declare</Badge>
          <Badge variant="warn">Reconnecting</Badge>
          <Badge variant="danger">Eliminated</Badge>
        </div>
      </Panel>

      <Panel>
        <h2>Player avatars</h2>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {NICKNAMES.map((nickname, index) => (
            <PlayerAvatar key={nickname} nickname={nickname} seatIndex={index} />
          ))}
        </div>
      </Panel>

      <Panel>
        <h2>Playing cards</h2>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <PlayingCard variant="face" rank="K" suit="hearts" />
          <PlayingCard variant="face" rank="7" suit="spades" />
          <PlayingCard variant="back" />
          <PlayingCard variant="joker" />
        </div>
      </Panel>

      <Panel>
        <h2>Scoreboard</h2>
        <ScoreRow name="Priya" score={12} />
        <ScoreRow name="Rae" score={27} />
        <ScoreRow name="Sam" score={0} />
      </Panel>
    </main>
  );
}
