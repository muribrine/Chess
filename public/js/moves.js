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

        if (move[0] >= 0 && move[1] >= 0 && move[0] < 8 && move[1] < 8) {

            if (STATE_at(move) == '.') {
                if (coords[1] == move[1]) {
                    result.push(move);

                    if (STATE_at([move[0] - 1, move[1]]) == '.' && coords[0] == 6) {
                        result.push([coords[0] - 2, coords[1]]);
                    }

                };
            };

            if (coords[1] != move[1] && STATE_at(move) != '.') {
                if (difference_in_color(color, move)) {
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
        [+1, 0],
        [-1, 0],
        [0, +1],
        [0, -1]
    ];

    for (let i = 0; i < 4; i++) {
        const row_offset = direction_offsets[i][0];
        const col_offset = direction_offsets[i][1];

        let stop = false;
        let j = 1;
        while (!stop) {

            let move = [coords[0] + row_offset * j, coords[1] + col_offset * j];

            if (move[0] >= 0 && move[1] >= 0 && move[0] < 8 && move[1] < 8) {

                if (STATE_at(move) == '.') {
                    result.push(move);
                } else {
                    if (difference_in_color(color, move)) {
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
        if (move[0] >= 0 && move[1] >= 0 && move[0] < 8 && move[1] < 8) {
            if (STATE_at(move) == '.') {
                result.push(move);
            };
            if (difference_in_color(color, move)) {
                result.push(move);
            };

        };
    });

    return Array.from(new Set(result));
};

function calculate_b_moves(coords, color) {

    let result = [];

    const direction_offsets = [
        [+1, +1],
        [+1, -1],
        [-1, +1],
        [-1, -1]
    ];

    for (let i = 0; i < 4; i++) {
        const row_offset = direction_offsets[i][0];
        const col_offset = direction_offsets[i][1];

        let stop = false;
        let j = 1;
        while (!stop) {

            let move = [coords[0] + row_offset * j, coords[1] + col_offset * j];

            if (move[0] >= 0 && move[1] >= 0 && move[0] < 8 && move[1] < 8) {

                if (STATE_at(move) == '.') {
                    result.push(move);
                } else {
                    if (difference_in_color(color, move)) {
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
        [+1, 0],
        [-1, 0],
        [0, +1],
        [0, -1],
        [+1, +1],
        [+1, -1],
        [-1, +1],
        [-1, -1]
    ];

    for (let i = 0; i < 8; i++) {
        const row_offset = direction_offsets[i][0];
        const col_offset = direction_offsets[i][1];

        let move = [coords[0] + row_offset, coords[1] + col_offset];

        if (move[0] >= 0 && move[1] >= 0 && move[0] < 8 && move[1] < 8) {

            if (STATE_at(move) == '.') {
                result.push(move);
            } else {
                if (difference_in_color(color, move)) {
                    result.push(move);
                };
            };

        };
    };

    return Array.from(new Set(result));
};