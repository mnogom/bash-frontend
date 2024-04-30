import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { WebLinksAddon } from '@xterm/addon-web-links';
import { io } from 'socket.io-client';

import '@xterm/xterm/css/xterm.css';

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
        brightBlack: '#262625',
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
const sio = io('ws://localhost:8080', {
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
})

sio.on('disconnect', () => {
    terminal.clear();
    elements.getSioStatus().classList.remove('sio-connected');
    elements.getSioStatus().classList.add('sio-not-connected');
})

sio.on('pty', (message) => {
    terminal.write(message)
});

// on input terminal
terminal.onData((data) => {
    sio.emit('pty', data)
});

// on resize terminal
window.addEventListener('resize', (event) => {
    fitAddon.fit()
    sio.emit('resize', {
        'cols': terminal.cols,
        'rows': terminal.rows,
    });
});