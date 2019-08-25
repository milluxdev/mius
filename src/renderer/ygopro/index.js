import { spawn } from 'child_process';
import { remote } from 'electron'

class Ygopro {
    joinGame(dir, path, ip, port, username, roomname, deckname) {
        let params = ['-h', ip, '-p', port, '-w', roomname, '-n',username,'-d',deckname,'-k' , '-j'];
        const defaults = {
            cwd: dir,
        };
        let sp = spawn(path, params, defaults); 
    }
    updateDeck(dir, path,deckname){
        const defaults = {
            cwd: dir,
        };
        let params = ['-d',deckname];
        let sp = spawn(path, params, defaults);
    }
}

export default new Ygopro();