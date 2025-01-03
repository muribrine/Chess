let socket = new io();
let FORM_BLOCKED = false;
let display_element_backup = {};
let logged_username = '';
let logged_ELO = 0;

function backup_display_element(id){
    display_element_backup[id] = document.getElementById(id);
    document.getElementById(id).remove();
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