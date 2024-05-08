import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { WebLinksAddon } from '@xterm/addon-web-links';
import { io } from 'socket.io-client';

import '@xterm/xterm/css/xterm.css';

const BACKEND_URL = process.env.NODE_ENV === 'development' ? 'http://localhost:8000' : '/';

// create elements
const elements = {
    getApp: () => document.getElementById('app'),
    getTerminalHead: () => document.getElementById('terminal-head'),
    getTerminal: () => document.getElementById('terminal'),
    getTerminalScreen: () => document.getElementsByClassName('xterm-screen')[0],
    getTerminalViewport: () => document.getElementsByClassName('xterm-viewport')[0],
    getTerminalScrollArea: () => document.getElementsByClassName('xterm-scroll-area')[0],
    getSioStatus: () => document.getElementById('sio-status'),
};

// create terminal
const terminal = new Terminal({
    fontFamily: '"Cascadia Code", Menlo, monospace',
    theme: {
        foreground: '#F8F8F8',
        background: '#2D2E2C',
        selection: '#5DA5D533',
        black: '#1E1E1D',
        brightBlack: '#9e9e9e',
        red: '#CE5C5C',
        brightRed: '#FF7272',
        green: '#5BCC5B',
        brightGreen: '#72FF72',
        yellow: '#CCCC5B',
        brightYellow: '#FFFF72',
        blue: '#5D5DD3',
        brightBlue: '#7279FF',
        magenta: '#BC5ED1',
        brightMagenta: '#E572FF',
        cyan: '#5DA5D5',
        brightCyan: '#72F0FF',
        white: '#F8F8F8',
        brightWhite: '#FFFFFF'
      },
    allowProposedApi: true,
    cursorBlink: false,
    macOptionIsMeta: true,
    scrollback: 1000,
    cursorStyle: 'block',
    scrollOnUserInput: false,
    rows: 2,
});

// load terminal and make focus
terminal.open(elements.getTerminal());
terminal.focus();

// fit addon
const fitAddon = new FitAddon();
terminal.loadAddon(fitAddon);
fitAddon.fit();

// links addon
terminal.loadAddon(new WebLinksAddon());

// create & setup socket io
const sio = io(BACKEND_URL, {
    path: '/socket.io/',
    transports: ['websocket'],
    query: {
        'cols': terminal.cols,
        'rows': terminal.rows,
    }
});

sio.on('connect', () => {
    terminal.clear();
    elements.getSioStatus().classList.remove('sio-not-connected');
    elements.getSioStatus().classList.add('sio-connected');
});

sio.on('disconnect', () => {
    terminal.clear();
    elements.getSioStatus().classList.remove('sio-connected');
    elements.getSioStatus().classList.add('sio-not-connected');
});

sio.on('pty', (message) => {
    terminal.write(message)
});

// on input terminal
terminal.onData((data) => {
    sio.emit('pty', data)
});

terminal.onKey((data) => {
    if (data.key === "\x04") {
        terminal.clearTextureAtlas();
        sio.disconnect();
    }
});

const debounce = (func, ms)  => {
    let timeout;
    return function() {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, arguments), ms);
    };
};

const emitReize = (event) => {
    sio.emit('resize', {
        'cols': terminal.cols,
        'rows': terminal.rows,
    });
};

// on resize terminal
window.addEventListener('resize', debounce(emitReize, 400));
window.addEventListener('resize', () => fitAddon.fit());

elements.getSioStatus().addEventListener('click', () => {
    sio.connect();
});

Array.from(document.getElementsByClassName('helper-link')).forEach(element => {
    element.addEventListener('click', (event) => {
        terminal.focus();
        terminal.input(`${element.dataset.bsCommand}\r`);
    })
});

document.getElementById('helper-icon').addEventListener('click', () => {
    document.getElementById('helper').classList.toggle('helper-show');
    document.getElementById('helper-icon').classList.toggle('helper-icon-rotared');
});