import http from "node:http";
import express from "express";
import { Server } from "socket.io";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { Logger } from "./logger.ts";
import { DB } from "./db.ts";
import Pocketbase from "pocketbase";

type ReturnType<T> = {
  valid: boolean,
  value: T
};

type User = {
  username: string,
  ELO: number,
  socket: any, //May not always be present.
  socketID: string,
};

type GAME = {
  timer: number,
  clocks: number[],
  player_1: User,
  player_2: User,
  player_1_color: number,
  player_2_color: number,
  GAME_STATE: string[]
};

export {http, express, Server, dirname, fileURLToPath, Logger, DB, Pocketbase, User, ReturnType, GAME };
