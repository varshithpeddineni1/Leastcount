/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @returns {void}
 */
export const up = (pgm) => {
  pgm.createTable('players', {
    id: 'id',
    nickname: { type: 'text', notNull: true },
    session_token: { type: 'text', notNull: true, unique: true },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    last_seen_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });

  pgm.createTable('games', {
    id: 'id',
    invite_code: { type: 'text', notNull: true, unique: true },
    host_player_id: { type: 'integer', notNull: true, references: 'players', onDelete: 'cascade' },
    status: { type: 'text', notNull: true, default: 'lobby' },
    hand_size: { type: 'integer', notNull: true, default: 5 },
    elimination_limit: { type: 'integer', notNull: true, default: 100 },
    wrong_declare_penalty: { type: 'integer', notNull: true, default: 40 },
    winner_player_id: { type: 'integer', references: 'players', onDelete: 'set null' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    ended_at: { type: 'timestamptz' },
  });

  pgm.createTable('game_players', {
    id: 'id',
    game_id: { type: 'integer', notNull: true, references: 'games', onDelete: 'cascade' },
    player_id: { type: 'integer', notNull: true, references: 'players', onDelete: 'cascade' },
    seat: { type: 'integer', notNull: true },
    current_score: { type: 'integer', notNull: true, default: 0 },
    joined_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    left_at: { type: 'timestamptz' },
    eliminated_at: { type: 'timestamptz' },
  });

  pgm.createTable('rounds', {
    id: 'id',
    game_id: { type: 'integer', notNull: true, references: 'games', onDelete: 'cascade' },
    round_number: { type: 'integer', notNull: true },
    declarer_player_id: { type: 'integer', references: 'players', onDelete: 'set null' },
    outcome: { type: 'text' },
    started_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    ended_at: { type: 'timestamptz' },
    // Server-only draw-pile order, per-player hands, and discard pile. Never
    // serialized to any client and never logged (ARC-6, SEC-6).
    private_state: { type: 'jsonb' },
  });

  pgm.createTable('moves', {
    id: 'id',
    round_id: { type: 'integer', notNull: true, references: 'rounds', onDelete: 'cascade' },
    seq: { type: 'integer', notNull: true },
    player_id: { type: 'integer', notNull: true, references: 'players', onDelete: 'cascade' },
    action_type: { type: 'text', notNull: true },
    discarded_cards: { type: 'jsonb' },
    draw_source: { type: 'text' },
    drawn_card: { type: 'jsonb' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });

  pgm.createTable('round_scores', {
    id: 'id',
    round_id: { type: 'integer', notNull: true, references: 'rounds', onDelete: 'cascade' },
    player_id: { type: 'integer', notNull: true, references: 'players', onDelete: 'cascade' },
    hand_total: { type: 'integer', notNull: true },
    delta: { type: 'integer', notNull: true },
    was_declarer: { type: 'boolean', notNull: true, default: false },
    result: { type: 'text', notNull: true },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });

  pgm.createTable('events', {
    id: 'id',
    game_id: { type: 'integer', references: 'games', onDelete: 'cascade' },
    type: { type: 'text', notNull: true },
    payload: { type: 'jsonb' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });

  // connect-pg-simple's expected session-store shape.
  pgm.createTable('session', {
    sid: { type: 'varchar', notNull: true, primaryKey: true },
    sess: { type: 'json', notNull: true },
    expire: { type: 'timestamp(6)', notNull: true },
  });

  pgm.createIndex('game_players', 'game_id');
  pgm.createIndex('game_players', 'player_id');
  pgm.createIndex('rounds', ['game_id', 'round_number']);
  pgm.createIndex('moves', ['round_id', 'seq']);
  pgm.createIndex('session', 'expire', { name: 'idx_session_expire' });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @returns {void}
 */
export const down = (pgm) => {
  pgm.dropTable('session');
  pgm.dropTable('events');
  pgm.dropTable('round_scores');
  pgm.dropTable('moves');
  pgm.dropTable('rounds');
  pgm.dropTable('game_players');
  pgm.dropTable('games');
  pgm.dropTable('players');
};
