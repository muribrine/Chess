let available_moves = [];
let selected_square = [];
let COLOR = '';
let is_playing = false;
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

    if (yo_color == "black") { GAME_STATE.reverse(); is_playing = false; } else {
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
            square.classList.add("Square", square_color);

            let piece = document.createElement('img');
            piece.id = `img_${coords}`;
            piece.src = type_to_img[GAME_STATE[row][column]];

            if (GAME_STATE[row][column] == GAME_STATE[row][column].toUpperCase() && GAME_STATE[row][column]) {
                piece.classList.add("BLACK_PIECE");
            } else {
                if (GAME_STATE[row][column] == GAME_STATE[row][column].toLowerCase() && GAME_STATE[row][column]) {
                    piece.classList.add("WHITE_PIECE");
                } else {
                    piece.classList.add("NEUTRAL_PIECE");
                }
            };

            if (row == 0 && column == 0) { square.classList.add("SquareA") };
            if (row == 0 && column == 7) { square.classList.add("SquareB") };
            if (row == 7 && column == 0) { square.classList.add("SquareC") };
            if (row == 7 && column == 7) { square.classList.add("SquareD") };

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

    if (!is_playing) { return; };

    let target_square_split_id = target_square.id.split('');
    let coords = [target_square_split_id[1], target_square_split_id[3]];

    available_moves.forEach(move => {

        if (move.toString() == coords && selected_square) {

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
            if (COLOR == "black") { GAME_STATE.reverse() };
            socket.emit('took_a_turn', GAME_STATE);
            is_playing = false;
            if (COLOR == "black") { GAME_STATE.reverse() };

        };

    });

    available_moves = [];

    reset_ui_highlights();

    if (!is_playing) { return; };
    calculate_available_moves_and_highlight_ui(piece, pieces_color);

};

function reset_ui_highlights() {
    for (let row = 0; row < 8; row++) {
        for (let column = 0; column < 8; column++) {

            let square = document.getElementById(`X${row}Y${column}`);
            let img = document.getElementById(`img_X${row}Y${column}`);

            square.classList.remove('Highlight');
            square.classList.remove('Selected');
            selected_square = [];
            if (img.src.split('/').reverse()[0] == 'dot.svg') {
                img.src = '/EMPTY.png';
            };

        }
    };
};

function calculate_available_moves_and_highlight_ui(piece, pieces_color) {
    if (piece.classList.contains(pieces_color.toUpperCase() + '_PIECE') || piece.classList.contains('NEUTRAL_PIECE')) {

        let coords = piece.id.split('_')[1].split('X')[1].split('Y');
        if (STATE_at(coords) != '.') {
            document.getElementById(`X${coords[0]}Y${coords[1]}`).classList.add('Selected');
            selected_square = [coords[0], coords[1], STATE_at(coords)];
        };
        let possible_moves = calculate_possible_moves(coords, pieces_color);

        available_moves = possible_moves;
        possible_moves.forEach(move => {

            let square = document.getElementById(`X${move[0]}Y${move[1]}`);
            let img = document.getElementById(`img_X${move[0]}Y${move[1]}`);

            if (STATE_at(move) != '.') { square.classList.add('Highlight') };
            if (img.src.split('/').reverse()[0] == 'EMPTY.png') { img.src = '/dot.svg' };

        });

    };
};

socket.on('game_state_update', (new_game_state) => {

    GAME_STATE = new_game_state; is_playing = true;
    if (COLOR == "black") { GAME_STATE.reverse() };
    update_board();

});
