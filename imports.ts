import http from 'node:http';
import express from 'express';
import { Server } from 'socket.io';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import Pocketbase from 'pocketbase';
import { v4 as uidv4 } from 'uuid';

const __dirname = dirname(fileURLToPath(import.meta.url));
import config from './config.json' with { type: 'json' };

export { http, express, Server, Pocketbase, __dirname, config, uidv4 };
