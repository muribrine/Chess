import { http, express, Server, dirname, fileURLToPath, Logger, DB, User, ResultType } from "./imports.ts";
const __dirname = dirname(fileURLToPath(import.meta.url));

class Backend {

  express_app: any;
  http_server: any;
  http_server_port: Number;
  socket_io_server: Server;
  logger: Logger;
  db: DB;

  logged_players: any;
  game_queue: any;
  games: any;

  constructor (port: Number, logger: Logger, db_url: string) {

    this.logger = logger;
    this.logged_players = {};
    this.game_queue = [0,0,0];
    this.games = {};

    this.db = new DB(db_url);
    if(!this.db) { throw Error("Could not connect to database.")};

    this.express_app = express();
    if(!this.express_app) { throw Error("Could not initialize express.")};

    this.http_server = http.createServer(this.express_app);
    this.http_server_port = port;
    if(!this.http_server) { throw Error("Could not initialize HTTP server.")};

    this.socket_io_server = new Server(this.http_server);
    if(!this.socket_io_server) { throw Error("Could not initialize SOCKET_IO server.")};

    this.set_up_routing();
    this.set_up_socket_io();

    this.http_server.listen(this.http_server_port, () => {this.logger.log(`HTTP server listening on port ${this.http_server_port}.`, "normal")});

  };

  set_up_routing() {

    const ROUTES = [
      ["/", "/frontend/index.html"],
      ["/style.css", "/frontend/style.css"],
      ["/game.js", "/frontend/game.js"],
      ["/king.svg", "/PIECES/king.svg"],
      ["/queen.svg", "/PIECES/queen.svg"],
      ["/pawn.svg", "/PIECES/pawn.svg"],
      ["/rook.svg", "/PIECES/rook.svg"],
      ["/bishop.svg", "/PIECES/bishop.svg"],
      ["/knight.svg", "/PIECES/knight.svg"]
    ];

    ROUTES.forEach(route => {
      let request = route[0];
      let response = route[1];

      this.express_app.get(request, (_req: any, res:any) => {
        this.logger.log(`Got a request for path '${request}'.`,"normal");
        res.sendFile(__dirname + response);
      });

    });

  };

  set_up_socket_io() {

    this.socket_io_server.on('connection', (socket: any) => {

      const socketID =
      'Socket_' +
      (Math.random() + 1).toString(36).substring(2) +
      (Math.random() + 1).toString(36).substring(2) +
      (Math.random() * Math.pow(10,18));
      // TODO: Use a actually random number.

      socket.on('login', async (user: string, password: string) => {

        this.logger.log('Got a login request.', 'normal');

        let auth_request_result: ResultType<any> = await this.db.auth(user, password);
        if (auth_request_result.valid) {
          let auth_data = auth_request_result.value;
          let user: User = {
            username: auth_data['record']['username'],
            ELO: auth_data['record']['ELO'],
            socket: socket,
            socketID: socketID,
          }

          this.logger.log(`Login request sucessful, user: ${user.username}.`, "normal");
          this.logged_players[socketID] = user;
          socket.emit('login_sucess', auth_data);
        } else {
          this.logger.log(`Login request failed. socketID: ${socketID}. Supposed user: ${user}.`, "normal");
          socket.emit('login_failed');
        }

      });

      socket.on('signin', async (user: string, password:string) => {

        this.logger.log('Got a signin request.', 'normal');

        const user_data = {
          "password": password,
          "passwordConfirm": password,
          "username": user,
          "email": "",
          "emailVisibility": false,
          "verified": false,
          "ELO": 0,
        };

        let new_user_request_result: ResultType<any> = await this.db.signin(user_data);
        if(new_user_request_result.valid) {
          let new_user = new_user_request_result.value;
          this.logger.log(`Created a new user, user: ${new_user['username']}.`, "normal");
          socket.emit('signin_sucess', new_user);
        } else {
          this.logger.log(`Failed to create a new user.`, "normal");
          socket.emit('signin_failed');
        };

      });

      socket.on('queue_for_play', (timer: number) => {

        let user: User = this.logged_players[socketID];

        this.logger.log(`Got a request to play from the user: ${user.username}.`, "normal");

        // TIMER: 0 = 5min; 1 = 10min; 2 = 10min | 5;

        if(this.game_queue[timer]) {

          let opponent: User = this.game_queue[timer];

          let yo_username = user.username; let yo_ELO = user.ELO; let yo_color = Math.random() > 0.5 ? 1 : -1;
          let op_username = opponent.username; let op_ELO = opponent.ELO; let op_color = -yo_color; let op_socket = opponent.socket;

          this.logger.log(`Starting a match between the players: ${yo_username}(${yo_color}) and ${op_username}(${op_color})`, "normal");
          socket.emit('begin_game', timer, op_username, op_ELO, yo_color);
          op_socket.emit('begin_game', timer, yo_username, yo_ELO, op_color);
          this.execute_game(timer, opponent, op_color, user, yo_color);

          this.game_queue[timer] = 0;

        } else {

          this.logger.log(`Found no match for the player: ${user.username}. Adding to game queue.`, "normal");
          this.game_queue[timer] = user;

        };

      });

      socket.on('disconnect', () => {
        this.db.client.authStore.clear();
        delete this.logged_players[socketID];
      });

    });

  };

  execute_game(timer: number, player1: User, player1_color: number, player2: User, player2_color: number) {

    let p1_usr = player1.username;
    let p2_usr = player2.username;

    this.games[p1_usr + '***' + p2_usr] = {
      'timer': timer,
      'player1': player1,
      'player1_color': player1_color,
      'player2': player2,
      'player2_color': player2_color,
      'GAME_STATE': [
        'rnbqkbnr',
        'pppppppp',
        '',
        '',
        '',
        '',
        'PPPPPPPP',
        'RNBQKBNR',
      ],
    };
  };
};


const logger = new Logger();

try {
  new Backend(8080, logger,  `https://mi-chess.pockethost.io/`);
} catch (error) {
  logger.log(error, "error");
}
