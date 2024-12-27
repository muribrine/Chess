import { http, express, Server as SocketIO_Server, __dirname, config } from './imports.ts';
import { DataBase } from './types.ts';

import { set_up_routing } from './router.ts';
import { set_up_sockets } from './sockets.ts';

let express_app: any;
let http_server: any;
let http_server_port: number = config.HTTP_SERVER_PORT;
let sio_server: SocketIO_Server; //Socket IO server.

let db: DataBase;
let db_url = config.DATA_BASE_URL;

try {

  db = new DataBase(db_url);
  if(!db) { throw Error('Could not connect to database.')};

  express_app = express();
  if(!express_app) { throw Error('Could not create the express app.')};

  http_server = http.createServer(express_app);
  if(!http_server) { throw Error('Could not create the HTTP server.')};

  sio_server = new SocketIO_Server(http_server);
  if(!sio_server) { throw Error('Could not create the SocketIO server.')};

  set_up_routing(express_app, __dirname, config.ROUTES);
  set_up_sockets(sio_server, db);

  http_server.listen(http_server_port, () => {

    console.log(`HTTP server listening on port ${http_server_port}`);

  });

} catch (error) {
  console.error(error);
};
