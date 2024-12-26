import { DataBase } from './db.ts';

type User = {

  username: string,
  ELO: number,
  socket: any,
  active_game_ID: string,

};

type Game = {

  clocks: number[],
  players: User[],
  player_colors: string[],
  GAME_STATE: string[]

};

type Maybe<T> = {

  v: boolean,
  c: T

};

export { DataBase, User, Game, Maybe };
