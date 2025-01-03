function difference_in_color(color, move) {
    if (color == 'white' && GAME_STATE[move[0]][move[1]].toUpperCase() == GAME_STATE[move[0]][move[1]]) {
        return true;
    };
    if (color == 'black' && GAME_STATE[move[0]][move[1]].toLowerCase() == GAME_STATE[move[0]][move[1]]) {
        return true;
    };
    return false;
};

function STATE_at(coords) {
    if (GAME_STATE[coords[0]][coords[1]]) {
        return GAME_STATE[coords[0]][coords[1]];
    } else {
        return false;
    };
};

function update_board() {
    for (let x = 0; x < 8; x++) {
        for (let y = 0; y < 8; y++) {

            let piece_id = `img_X${x}Y${y}`;
            let piece_src = type_to_img[GAME_STATE[x][y]];

            let piece = document.getElementById(piece_id);
            piece.src = piece_src;
            piece.className = '';

            if (GAME_STATE[x][y] == GAME_STATE[x][y].toUpperCase() && GAME_STATE[x][y]) {
                piece.classList.add("BLACK_PIECE");
            } else {
                if (GAME_STATE[x][y] == GAME_STATE[x][y].toLowerCase() && GAME_STATE[x][y]) {
                    piece.classList.add("WHITE_PIECE");
                } else {
                    piece.classList.add("NEUTRAL_PIECE");
                }
            };
        };
    };
};