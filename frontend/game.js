let socket = new io();
let FORM_WAITING = false;
let logged_username = '';
let logged_ELO = 0;

let GAME_STATE = [
  'rnbqkbnr',
  'pppppppp',
  '',
  '',
  '',
  '',
  'PPPPPPPP',
  'RNBQKBNR'
];

const type_to_img = {
  'r': "/w_rook.svg",
  'R': "/b_rook.svg",
  'n': "/w_knight.svg",
  'N': "/b_knight.svg",
  'b': "/w_bishop.svg",
  'B': "/b_bishop.svg",
  'q': "/w_queen.svg",
  'Q': "/b_queen.svg",
  'k': "/w_king.svg",
  'K': "/b_king.svg",
  'p': "/w_pawn.svg",
  'P': "/b_pawn.svg",
}

socket.on('begin_game', (_timer, opponent_usr, opponent_ELO, yo_color) => {

  if(yo_color == 1) { GAME_STATE.reverse() };

  document.getElementById('username_display').remove();
  document.getElementById('PLAY').remove();

  let board = document.getElementById('BOARD');

  for (let x = 0; x < 8; x++) {
  for (let y = 0; y < 8; y++) {

      let coords = `X${x}Y${y}`;
      let square_color = (x + y) % 2 === 0 ? 'White_Square' : 'Black_Square';

      let square = document.createElement('div');
      square.id = coords;
      square.classList.add("Square");
      square.classList.add(square_color);

      let piece = document.createElement('img');
      piece.id = `img_${coords}`;
      piece.src = type_to_img[GAME_STATE[x][y]];
      if(GAME_STATE[x][y]) {
      if(GAME_STATE[x][y] == GAME_STATE[x][y].toUpperCase()) {
        piece.classList.add("BLACK_PIECE");
      } else {
        piece.classList.add("WHITE_PIECE");
      }};
      



      if(x == 0 && y == 0) { square.classList.add("SquareA") };
      if(x == 0 && y == 7) { square.classList.add("SquareB") };
      if(x == 7 && y == 0) { square.classList.add("SquareC") };
      if(x == 7 && y == 7) { square.classList.add("SquareD") };

      if(type_to_img[GAME_STATE[x][y]]) {
        square.append(piece);
      };
      board.append(square);

  };
  };

  if(yo_color == 1) { GAME_STATE.reverse() };

  document.getElementById('BOARD_opponent_display').innerText = `${opponent_usr} | ${opponent_ELO} ELO`;
  document.getElementById('BOARD_user_display').innerText = `${logged_username} | ${logged_ELO} ELO`;

  hide_blocking_overlay();

});










document.getElementById('PLAY_button_0').onclick = () => { show_blocking_overlay(); socket.emit('queue_for_play', 0) };
document.getElementById('PLAY_button_1').onclick = () => { show_blocking_overlay(); socket.emit('queue_for_play', 1) };
document.getElementById('PLAY_button_2').onclick = () => { show_blocking_overlay(); socket.emit('queue_for_play', 2) };

function show_blocking_overlay() { FORM_WAITING = true; document.getElementById('blocking_overlay').style['display'] = 'block' };
function hide_blocking_overlay() { FORM_WAITING = false; document.getElementById('blocking_overlay').style['display'] = 'none' };

socket.on('login_sucess', (auth_data) => {
  hide_blocking_overlay();

  document.getElementById('LOGIN').remove(); document.getElementById('SIGNIN').remove();
  document.getElementById('HOME').style['display'] = 'block';

  logged_username = auth_data['record']['username']; logged_ELO = auth_data['record']['ELO'];
  document.getElementById('username_display').innerText = `Usuário: ${logged_username} | ${logged_ELO} ELO`;
});

socket.on('login_failed', () => { hide_blocking_overlay(); alert('Failed to Login user') });
socket.on('signin_failed', () => { hide_blocking_overlay(); alert('Failed to Sign in user') });

socket.on('signin_sucess', (_auth_data) => {
  document.getElementById('LOGIN').style['display'] = '';
  document.getElementById('SIGNIN').style['display'] = 'none';
  hide_blocking_overlay();
});


document.getElementById('LOGIN_button').onclick = () => { 
  let user = document.getElementById('LOGIN_user').value;
  let password = document.getElementById('LOGIN_password').value;
  if (!FORM_WAITING) { show_blocking_overlay(); socket.emit('login', user, password) };
};

document.getElementById('SIGNIN_button').onclick = () => {
  let user = document.getElementById('SIGNIN_user').value;
  let password = document.getElementById('SIGNIN_password').value;
  let confirm_password = document.getElementById('SIGNIN_password_confirm').value;
  if (password != confirm_password ) { return };

  if (!FORM_WAITING) { show_blocking_overlay(); socket.emit('signin', user, password) };
};

document.getElementById('GOTO_signin').onclick = () => {
  if (!FORM_WAITING) { document.getElementById('LOGIN').style['display'] = 'none'; document.getElementById('SIGNIN').style['display'] = '' };
};

document.getElementById('GOTO_login').onclick = () => {
  if (!FORM_WAITING) { document.getElementById('LOGIN').style['display'] = ''; document.getElementById('SIGNIN').style['display'] = 'none' };
};
