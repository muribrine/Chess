let socket = new io();
let FORM_BLOCKED = false;
let display_element_backup = {};
let available_moves = [];
let selected_square = [];
let COLOR = '';
let is_playing = false;

function backup_display_element(id){
  display_element_backup[id] = document.getElementById(id);
  document.getElementById(id).remove();
};

let logged_username = '';
let logged_ELO = 0;

let GAME_STATE = [
  'RNBQKBNR',
  'PPPPPPPP',
  '........',
  '........',
  '........',
  '........',
  'pppppppp',
  'rnbqkbnr'
];

const type_to_img = {
  'r': "/w_rook.svg", 'R': "/b_rook.svg",
  'n': "/w_knight.svg", 'N': "/b_knight.svg",
  'b': "/w_bishop.svg", 'B': "/b_bishop.svg",
  'q': "/w_queen.svg", 'Q': "/b_queen.svg",
  'k': "/w_king.svg", 'K': "/b_king.svg",
  'p': "/w_pawn.svg", 'P': "/b_pawn.svg",
  '.': "/EMPTY.png",
};

socket.on('begin_game', (opponent_usr, opponent_ELO, yo_color) => {

  if ( yo_color == "black" ) { GAME_STATE.reverse(); is_playing = false; } else {
    is_playing = true;
  };
  COLOR = yo_color;

  backup_display_element('username_display');
  backup_display_element('PLAY');

  let board = document.getElementById('BOARD');

  for (let row = 0; row < 8; row++) {
  for (let column = 0; column < 8; column++) {

      let coords = `X${row}Y${column}`;
      let square_color = (row + column) % 2 == 0 ? 'white_square' : 'black_square';

      let square = document.createElement('div');
      square.id = coords;
      square.classList.add("Square",square_color);

      let piece = document.createElement('img');
      piece.id = `img_${coords}`;
      piece.src = type_to_img[GAME_STATE[row][column]];

      if(GAME_STATE[row][column] == GAME_STATE[row][column].toUpperCase() && GAME_STATE[row][column]) {
        piece.classList.add("BLACK_PIECE");
      } else {
        if(GAME_STATE[row][column] == GAME_STATE[row][column].toLowerCase() && GAME_STATE[row][column]) {
          piece.classList.add("WHITE_PIECE");
        } else {
          piece.classList.add("NEUTRAL_PIECE");
        }
      };

      if(row == 0 && column == 0) { square.classList.add("SquareA") };
      if(row == 0 && column == 7) { square.classList.add("SquareB") };
      if(row == 7 && column == 0) { square.classList.add("SquareC") };
      if(row == 7 && column == 7) { square.classList.add("SquareD") };

      square.append(piece);
      square.onclick = () => { square_on_click(piece, yo_color, square); };

      board.append(square);

  };
  };

  document.getElementById('BOARD_opponent_display').innerText = `${opponent_usr} | ${opponent_ELO} ELO`;
  document.getElementById('BOARD_user_display').innerText = `${logged_username} | ${logged_ELO} ELO`;

  hide_blocking_overlay();

});

function square_on_click(piece, pieces_color, target_square) {

  if(!is_playing) { return; };

  let target_square_split_id = target_square.id.split('');
  let coords = [target_square_split_id[1], target_square_split_id[3]];

  available_moves.forEach(move => {
    
    if(move.toString() == coords && selected_square) {

      let row = GAME_STATE[selected_square[0]];
      row = row.split('');
      row[selected_square[1]] = '.';
      row = row.join('');
      GAME_STATE[selected_square[0]] = row;

      let row2 = GAME_STATE[coords[0]];
      row2 = row2.split('');
      row2[coords[1]] = selected_square[2];
      row2 = row2.join('');
      GAME_STATE[coords[0]] = row2;

      selected_square = [];
      update_board();
      if ( COLOR == "black" ) { GAME_STATE.reverse() };
      socket.emit('took_a_turn', GAME_STATE);
      is_playing = false;
      if ( COLOR == "black" ) { GAME_STATE.reverse() };

    };

  });

  available_moves = [];

  reset_ui_highlights();

  if(!is_playing) { return; };
  calculate_available_moves_and_highlight_ui(piece, pieces_color);

};

function reset_ui_highlights() {
  for(let row = 0; row < 8; row++) {
    for(let column = 0; column < 8; column++) {
  
      let square = document.getElementById(`X${row}Y${column}`);
      let img = document.getElementById(`img_X${row}Y${column}`);
  
      square.classList.remove('Highlight');
      square.classList.remove('Selected');
      selected_square = [];
      if(img.src.split('/').reverse()[0] == 'dot.svg') {
        img.src = '/EMPTY.png';
      };
  
  }};
};

function calculate_available_moves_and_highlight_ui(piece, pieces_color) {
  if ( piece.classList.contains( pieces_color.toUpperCase() + '_PIECE' ) || piece.classList.contains('NEUTRAL_PIECE')) {

    let coords = piece.id.split('_')[1].split('X')[1].split('Y');
    console.log(coords);
    if(STATE_at(coords) != '.') { 
      document.getElementById(`X${coords[0]}Y${coords[1]}`).classList.add('Selected');
      selected_square = [coords[0], coords[1], STATE_at(coords)];
    };
    let possible_moves = calculate_possible_moves(coords, pieces_color);

    available_moves = possible_moves;
    possible_moves.forEach(move => {

      let square = document.getElementById(`X${move[0]}Y${move[1]}`);
      let img = document.getElementById(`img_X${move[0]}Y${move[1]}`);

      if(STATE_at(move) != '.') { square.classList.add('Highlight') };
      if(img.src.split('/').reverse()[0] == 'EMPTY.png') { img.src = '/dot.svg' };

    });

  };
};

function calculate_possible_moves(coords, color) {

  let piece = GAME_STATE[coords[0]][coords[1]];
  let moves = [];

  coords = coords.map(x => Number(x));

  switch (piece.toLowerCase()) {
    case 'p': moves = calculate_p_moves(coords, color); break;
    case 'r': moves = calculate_r_moves(coords, color); break;
    case 'n': moves = calculate_n_moves(coords, color); break;
    case 'b': moves = calculate_b_moves(coords, color); break;
    case 'q': moves = calculate_q_moves(coords, color); break;
    case 'k': moves = calculate_k_moves(coords, color); break;

    default: break;
  }

  return moves;

};

function calculate_p_moves(coords, color) {

  let possible_moves = [];

  possible_moves.push([coords[0] - 1, coords[1]]);
  possible_moves.push([coords[0] - 1, coords[1] - 1]);
  possible_moves.push([coords[0] - 1, coords[1] + 1]);
  
  let result = [];
  possible_moves.forEach(move => {

    if(move[0] >= 0 && move[1] >= 0 && move[0] < 8 && move[1] < 8) {

      if( STATE_at(move) == '.' ) {
        if(coords[1] == move[1] ) {
          result.push(move);

          if( STATE_at([move[0] - 1, move[1]]) == '.' && coords[0] == 6 ) {
            result.push([coords[0] - 2, coords[1]]);
          }

        };
      };

      if(coords[1] != move[1] && STATE_at(move) != '.') {
        if(difference_in_color(color, move)) {
          result.push(move);
        };
      };

    };

  });

  return Array.from(new Set(result));;

};

function calculate_r_moves(coords, color) {

  let result = [];

  const direction_offsets = [
    [+1,0],
    [-1,0],
    [0,+1],
    [0,-1]
  ];

  for (let i = 0; i < 4; i++) {
    const row_offset = direction_offsets[i][0];
    const col_offset = direction_offsets[i][1];

    let stop = false;
    let j = 1;
    while(!stop) {

      let move = [ coords[0] + row_offset * j, coords[1] + col_offset * j ];

      if(move[0] >= 0 && move[1] >= 0 && move[0] < 8 && move[1] < 8) {

        if( STATE_at(move) == '.' ) {
          result.push(move);
        } else {
          if ( difference_in_color(color, move) ) {
            result.push(move);
          };
          stop = true;
        };

        j++;

      } else {
        stop = true;
      }

      
    };

  }

  
  return Array.from(new Set(result));
};

function calculate_n_moves(coords, color) {

  let possible_moves = [];
  possible_moves.push([coords[0] - 1, coords[1] + 2]); possible_moves.push([coords[0] - 1, coords[1] - 2]);
  possible_moves.push([coords[0] + 1, coords[1] + 2]); possible_moves.push([coords[0] + 1, coords[1] - 2]);
  possible_moves.push([coords[0] - 2, coords[1] + 1]); possible_moves.push([coords[0] - 2, coords[1] - 1]);
  possible_moves.push([coords[0] + 2, coords[1] + 1]); possible_moves.push([coords[0] + 2, coords[1] - 1]);

  let result = [];
  possible_moves.forEach(move => {
    if(move[0] >= 0 && move[1] >= 0 && move[0] < 8 && move[1] < 8) {
      if( STATE_at(move) == '.' ) {
        result.push(move);
      };
      if(difference_in_color(color, move)) {
        result.push(move);
      };

    };
  });

  return Array.from(new Set(result));
};

function calculate_b_moves(coords, color) {

  let result = [];

  const direction_offsets = [
    [+1,+1],
    [+1,-1],
    [-1,+1],
    [-1,-1]
  ];

  for (let i = 0; i < 4; i++) {
    const row_offset = direction_offsets[i][0];
    const col_offset = direction_offsets[i][1];

    let stop = false;
    let j = 1;
    while(!stop) {

      let move = [ coords[0] + row_offset * j, coords[1] + col_offset * j ];

      if(move[0] >= 0 && move[1] >= 0 && move[0] < 8 && move[1] < 8) {

        if( STATE_at(move) == '.' ) {
          result.push(move);
        } else {
          if ( difference_in_color(color, move) ) {
            result.push(move);
          };
          stop = true;
        };

        j++;

      } else {
        stop = true;
      }

    };

  }

  return Array.from(new Set(result));
};

function calculate_q_moves(coords, color) {
  let result = [];

  let diagonal_moves = calculate_b_moves(coords, color);
  let straight_moves = calculate_r_moves(coords, color);

  diagonal_moves.forEach(move => {
    result.push(move);
  });
  straight_moves.forEach(move => {
    result.push(move);
  });

  return Array.from(new Set(result));
};

function calculate_k_moves(coords, color) {

  let result = [];

  const direction_offsets = [
    [+1,0],
    [-1,0],
    [0,+1],
    [0,-1],
    [+1,+1],
    [+1,-1],
    [-1,+1],
    [-1,-1]
  ];

  for (let i = 0; i < 8; i++) {
    const row_offset = direction_offsets[i][0];
    const col_offset = direction_offsets[i][1];

    let move = [ coords[0] + row_offset, coords[1] + col_offset ];

    if(move[0] >= 0 && move[1] >= 0 && move[0] < 8 && move[1] < 8) {

      if( STATE_at(move) == '.' ) {
        result.push(move);
      } else {
        if ( difference_in_color(color, move) ) {
          result.push(move);
        };
      };

    };
  };
  
  return Array.from(new Set(result));
};

function difference_in_color(color, move) {
  if(color == 'white' && GAME_STATE[move[0]][move[1]].toUpperCase() == GAME_STATE[move[0]][move[1]]) {
    return true;
  };
  if(color == 'black' && GAME_STATE[move[0]][move[1]].toLowerCase() == GAME_STATE[move[0]][move[1]]) {
    return true;
  };
  return false;
};

function STATE_at(coords) {
  if ( GAME_STATE[coords[0]][coords[1]] ) {
    return GAME_STATE[coords[0]][coords[1]];
  } else {
    return false;
  };
};

socket.on('game_state_update', (new_game_state) => {

  GAME_STATE = new_game_state;
  if ( COLOR == "black" ) { GAME_STATE.reverse() };
  update_board();
  is_playing = true;

});

function update_board() {

  for(let x = 0; x < 8; x++) {
  for(let y = 0; y < 8; y++) {

    let piece_id = `img_X${x}Y${y}`;
    let piece_src = type_to_img[GAME_STATE[x][y]];

    let piece = document.getElementById(piece_id);
    piece.src = piece_src;
    piece.className = '';

    if(GAME_STATE[x][y] == GAME_STATE[x][y].toUpperCase() && GAME_STATE[x][y]) {
      piece.classList.add("BLACK_PIECE");
    } else {
      if(GAME_STATE[x][y] == GAME_STATE[x][y].toLowerCase() && GAME_STATE[x][y]) {
        piece.classList.add("WHITE_PIECE");
      } else {
        piece.classList.add("NEUTRAL_PIECE");
      }
    };

  };
  };

};





document.getElementById('PLAY_button_0').onclick = () => { show_blocking_overlay(); socket.emit('queue_request', 0) };
document.getElementById('PLAY_button_1').onclick = () => { show_blocking_overlay(); socket.emit('queue_request', 1) };
document.getElementById('PLAY_button_2').onclick = () => { show_blocking_overlay(); socket.emit('queue_request', 2) };

function show_blocking_overlay() { FORM_BLOCKED = true; document.getElementById('blocking_overlay').style['display'] = 'block' };
function hide_blocking_overlay() { FORM_BLOCKED = false; document.getElementById('blocking_overlay').style['display'] = 'none' };

socket.on('login_sucess', (auth_data) => {
  hide_blocking_overlay();

  backup_display_element('LOGIN'); // Removes the element
  backup_display_element('SIGNIN');
  document.getElementById('HOME').style['display'] = 'block';

  logged_username = auth_data['username']; logged_ELO = auth_data['ELO'];
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
  if (!FORM_BLOCKED) { show_blocking_overlay(); socket.emit('login_request', user, password) };
};

document.getElementById('SIGNIN_button').onclick = () => {
  let user = document.getElementById('SIGNIN_user').value;
  let password = document.getElementById('SIGNIN_password').value;
  let confirm_password = document.getElementById('SIGNIN_password_confirm').value;
  if (password != confirm_password ) { return };

  if (!FORM_BLOCKED) { show_blocking_overlay(); socket.emit('signin_request', user, password) };
};

document.getElementById('GOTO_signin').onclick = () => {
  if (!FORM_BLOCKED) { document.getElementById('LOGIN').style['display'] = 'none'; document.getElementById('SIGNIN').style['display'] = '' };
};

document.getElementById('GOTO_login').onclick = () => {
  if (!FORM_BLOCKED) { document.getElementById('LOGIN').style['display'] = ''; document.getElementById('SIGNIN').style['display'] = 'none' };
};
