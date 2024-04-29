import { Terminal } from '@xterm/xterm';
import { FitAddon } from 'xterm-addon-fit';
import { io } from "socket.io-client";
import '@xterm/xterm/css/xterm.css'

let term = new Terminal({
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
console.log(term.cols, term.rows);

// load term
term.open(document.getElementById('terminal'));

// fit addon
const fitAddon = new FitAddon();
term.loadAddon(fitAddon);
fitAddon.fit();

// create socket io
const sio = io('ws://localhost:8080', {
    path: '/socket.io/',
    transports: ['websocket'],
    query: {
        "cols": term.cols,
        "rows": term.rows,
    }
});

sio.on('connect', () => {
    term.clear();
})

sio.on('pty', (message) => {
    term.write(message)
});

// on input terminal
term.onData((data) => {
    sio.emit("pty", data)
});

// on resize terminal
// TODO: make debounce
window.addEventListener("resize", (event) => {
    fitAddon.fit()
    sio.emit("resize", {
        "cols": term.cols,
        "rows": term.rows,
    })
});

document.getElementById('terminal').focus();