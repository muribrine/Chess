import { DataBase, User, Game, Maybe } from './types.ts';
import { uidv4 } from './imports.ts';

let logged_users: { [id: string] : User } = {};
let queue: Maybe<User>[] = [
  {v:false, c:{username:'',ELO:0,socket:undefined,active_game_ID:''}},
  {v:false, c:{username:'',ELO:0,socket:undefined,active_game_ID:''}},
  {v:false, c:{username:'',ELO:0,socket:undefined,active_game_ID:''}},
];
let games: { [id: string ] : Game } = {};

function set_up_sockets(sio_server: any, db: DataBase) {
  sio_server.on('connection', (socket: any) => {

    const socket_ID: string = generate_random_uid();
    socket.on('login_request', async (username:string, password:string) => {

      let auth_request_maybe: Maybe<any> = await db.auth_user(username, password);
      if(!auth_request_maybe.v) { socket.emit('login_failed'); return; };

      let auth_data = auth_request_maybe.c['record'];
      let user: User = {
        username: auth_data['username'],
        ELO: auth_data['ELO'],
        socket: socket,
        active_game_ID: socket_ID,
      };

      logged_users[socket_ID] = user;
      socket.emit('login_sucess', auth_data);

    });

    socket.on('signin_request', async (username:string, password:string) => {

      const db_request_data = {
        'password': password,
        'passwordConfirm': password,
        'username': username,
        'email': '',
        'emailVisibility': false,
        'verified': false,
        'ELO': 0
      };

      let signin_request_maybe: Maybe<any> = await db.sign_in_user(db_request_data);
      if(!signin_request_maybe.v) { socket.emit('signin_failed'); return; };

      socket.emit('signin_sucess', signin_request_maybe.c);

    });

    socket.on('queue_request', (match_time:number) => {

      let user1: User = logged_users[socket_ID];

      if ( !queue[match_time].v ) { queue[match_time] = {v:true, c: user1}; return; };

      let user2: User = queue[match_time].c;
      let colors: string[] = Math.random() > 0.5 ? ['white','black'] : ['black', 'white'];

      user1.socket.emit('begin_game', user2.username, user2.ELO, colors[0]);
      user2.socket.emit('begin_game', user1.username, user1.ELO, colors[1]);

      queue[match_time] = {v:false, c:{username:'',ELO:0,socket:undefined, active_game_ID: ''}};

      set_up_game(user1, user2, colors, match_time);

    });

    socket.on('disconnect', () => {
      db.pb.authStore.clear();
      delete logged_users[socket_ID];
      // TODO: Stop games that have this player!
    });

  });
};

function set_up_game(user1: User, user2: User, colors: string[], timer: number) {

  let starting_clock_time: number;
  let added_clock_time: number;

  switch (timer) {
    case 0: // 5 min, no extra time.
      starting_clock_time = 300000; added_clock_time = 0; break;
    case 1: // 10 min, no extra time.
      starting_clock_time = 600000; added_clock_time = 0; break;
    case 2: // 10 min, 5 secs of extra time.
      starting_clock_time = 600000; added_clock_time = 5000; break;
    default: // 10 min, no extra time.
      starting_clock_time = 600000; added_clock_time = 0; break;
  }

  let game_ID = generate_random_gid();
  games[game_ID] = {
    clocks: [starting_clock_time, starting_clock_time],
    players: [user1, user2],
    player_colors: colors,
    GAME_STATE: [
      'RNBQKBNR',
      'PPPPPPPP',
      '........',
      '........',
      '........',
      '........',
      'pppppppp',
      'rnbqkbnr',
    ],
  };

  for (let i = 0; i < 2; i++) {
    
    let user: User = games[game_ID].players[i];
    user.socket.on('took_a_turn', (GAME_STATE: string[]) => {

      games[game_ID].GAME_STATE = GAME_STATE;

      let other_user = games[game_ID].players[1 - i];

      other_user.socket.emit('game_state_update', games[game_ID].GAME_STATE);

    });

  };

};

function generate_random_uid() {
  return `SOCKET_${uidv4()}-${Math.random()*Math.pow(10,18)}`;
};

function generate_random_gid() {
  return `GAME_${uidv4()}-${Math.random()*Math.pow(10,18)}`;
}

export { set_up_sockets };
