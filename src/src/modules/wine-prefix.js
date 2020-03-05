import Config     from "./config";
import Command    from "./command";
import System     from "./system";
import FileSystem from "./file-system";
import Monitor    from "./monitor";
import Wine       from "./wine";
import Replaces   from "./replaces";
import Utils      from "./utils";
import Registry   from "./registry";
import Patch      from "./patch";

export default class WinePrefix {
    /**
     * @type {Config}
     */
    config = null;

    /**
     * @type {Command}
     */
    command = null;

    /**
     * @type {System}
     */
    system = null;

    /**
     * @type {FileSystem}
     */
    fs = null;

    /**
     * @type {Wine}
     */
    wine = null;

    /**
     * @type {Replaces}
     */
    replaces = null;

    /**
     * @type {Registry}
     */
    registry = null;

    /**
     * @type {Patch}
     */
    patch = null;

    /**
     * @param {Config} config
     * @param {Command} command
     * @param {System} system
     * @param {FileSystem} fs
     * @param {Wine} wine
     * @param {Replaces} replaces
     * @param {Registry} registry
     * @param {Patch} patch
     */
    constructor(config, command, system, fs, wine, replaces, registry, patch) {
        this.config   = config;
        this.command  = command;
        this.system   = system;
        this.fs       = fs;
        this.wine     = wine;
        this.replaces = replaces;
        this.registry = registry;
        this.patch    = patch;
    }

    /**
     * @returns {boolean}
     */
    isCreated() {
        return this.fs.exists(this.config.getWinePrefix());
    }

    create() {
        let wineBinDir = this.config.getWineDir() + '/bin';

        if (this.fs.exists(wineBinDir)) {
            this.fs.chmod(wineBinDir);
        }

        if (!this.isCreated()) {
            this.wine.boot();
            this.config.setWinePrefixInfo('version', this.wine.getVersion());
            this.config.getConfigReplaces().forEach(path => this.replaces.replaceByFile(path, true));
            this.updateSandbox();
            this.updateSaves();
            this.updateGameFolder();
            this.updateRegs();
            this.patch.apply();
            this.updateCsmt();
            this.updatePulse();
            this.updateWindowsVersion();
        }
    }

    updateSandbox() {
        if (!this.config.isSandbox()) {
            return false;
        }

        let updateTimestampPath = this.config.getWinePrefix() + '/.update-timestamp';

        if (this.fs.exists(updateTimestampPath) && 'disable' === this.fs.fileGetContents(updateTimestampPath)) {
            return false;
        }

        this.fs.filePutContents(updateTimestampPath, 'disable');

        let driveZ = this.config.getWineDosDevices() + '/z:';

        if (this.fs.exists(driveZ)) {
            this.fs.rm(driveZ);
        }

        this.fs.glob(this.config.getWineDriveC() + '/users/' + this.system.getUserName() + '/*').forEach(path => {
            if (this.fs.isSymbolicLink(path)) {
                this.fs.rm(path);
                this.fs.mkdir(path);
            }
        });

        this.wine.reg('/d', 'HKEY_LOCAL_MACHINE\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Desktop\\Namespace\\{9D20AAE8-0625-44B0-9CA7-71889C2254D9}');

        return true;
    }

    updateSaves() {
        let path = this.config.getSavesFoldersFile();

        if (!this.fs.exists(path)) {
            return false;
        }

        if (true === this.config.getWinePrefixInfo('saves')) {
            return false;
        }

        this.config.setWinePrefixInfo('saves', true);

        let folders = Utils.jsonDecode(this.fs.fileGetContents(path));

        Object.keys(folders).forEach((folder) => {
            let saveFolderPath   = this.config.getSavesDir() + '/' + folder;
            let prefixFolderPath = this.config.getWineDriveC() + '/' + _.trim(this.replaces.replaceByString(folders[folder]), '/');

            this.fs.lnOfRoot(saveFolderPath, prefixFolderPath);
        });

        return true;
    }

    updateGameFolder() {
        let path = this.config.getGamesDir();
        let dest = this.config.getWinePrefixGameFolder();

        if (this.fs.exists(this.config.getWinePrefix()) && this.fs.exists(dest)) {
            return false;
        }

        this.fs.lnOfRoot(path, dest);

        return true;
    }

    updateRegs() {
        if (true === this.config.getWinePrefixInfo('registry')) {
            return false;
        }

        this.config.setWinePrefixInfo('registry', true);

        return this.registry.apply(this.config.getRegistryFiles());
    }

    updateCsmt() {
        if (!this.fs.exists(this.config.getWinePrefix())) {
            return false;
        }

        let csmt = this.config.isCsmt();

        if (this.config.getWinePrefixInfo('csmt') === csmt) {
            return false;
        }

        this.config.setWinePrefixInfo('csmt', csmt);

        let regs = [
            "Windows Registry Editor Version 5.00\n",
            "[HKEY_CURRENT_USER\\Software\\Wine\\Direct3D]\n",
        ];

        let path = this.config.getWineDriveC() + '/csmt.reg';

        if (csmt) {
            regs.push('"csmt"=-\n');
        } else {
            regs.push('"csmt"=dword:0\n');
        }

        this.fs.filePutContents(path, Utils.encode(regs.join('\n'), 'utf-16'));
        this.wine.reg(path);

        return true;
    }

    updatePulse() {
        if (!this.fs.exists(this.config.getWinePrefix())) {
            return false;
        }

        let pulseAudio = this.system.existsCommand('pulseaudio');
        let pulse      = this.config.isPulse() && pulseAudio;

        if (this.config.getWinePrefixInfo('pulse') === pulse) {
            return false;
        }

        this.config.setWinePrefixInfo('pulse', pulse);

        let regs = [
            "Windows Registry Editor Version 5.00\n",
            "[HKEY_CURRENT_USER\\Software\\Wine\\Drivers]\n",
        ];

        let path = this.config.getWineDriveC() + '/sound.reg';

        if (pulse) {
            regs.push('"Audio"="pulse"\n');
        } else {
            regs.push('"Audio"="alsa"\n');
        }

        this.fs.filePutContents(path, Utils.encode(regs.join('\n'), 'utf-16'));
        this.wine.reg(path);

        return true;
    }

    updateWindowsVersion() {
        if (!this.fs.exists(this.config.getWinePrefix())) {
            return false;
        }

        let winver = this.config.getWindowsVersion();

        if (this.config.getWinePrefixInfo('winver') === winver) {
            return false;
        }

        this.config.setWinePrefixInfo('winver', winver);

        let regs = [
            "Windows Registry Editor Version 5.00\n",
        ];

        let path   = this.config.getWineDriveC() + '/winver.reg';
        let append = {};

        switch (winver) {
            case 'win2k':
                append = {
                    'HKEY_LOCAL_MACHINE\\Software\\Microsoft\\Windows NT\\CurrentVersion': {
                        'CSDVersion':         'Service Pack 4',
                        'CurrentBuildNumber': '2195',
                        'CurrentVersion':     '5.0',
                    },
                    'HKEY_LOCAL_MACHINE\\System\\CurrentControlSet\\Control\\Windows':     {
                        'CSDVersion': 'dword:00000400',
                    },
                };
                break;

            case 'winxp':
                append = {
                    'HKEY_LOCAL_MACHINE\\Software\\Microsoft\\Windows NT\\CurrentVersion': {
                        'CSDVersion':         'Service Pack 3',
                        'CurrentBuildNumber': '2600',
                        'CurrentVersion':     '5.1',
                    },
                    'HKEY_LOCAL_MACHINE\\System\\CurrentControlSet\\Control\\Windows':     {
                        'CSDVersion': 'dword:00000300',
                    },
                };
                break;

            case 'win10':
                this.wine.run('reg', 'add', 'HKLM\\System\\CurrentControlSet\\Control\\ProductOptions', '/v', 'ProductType', '/d', 'WinNT', '/f');
                append = {
                    'HKEY_LOCAL_MACHINE\\Software\\Microsoft\\Windows NT\\CurrentVersion': {
                        'CSDVersion':         '',
                        'CurrentBuildNumber': '10240',
                        'CurrentVersion':     '10.0',
                    },
                    'HKEY_LOCAL_MACHINE\\System\\CurrentControlSet\\Control\\Windows':     {
                        'CSDVersion': 'dword:00000300',
                    },
                };
                break;

            case 'win7':
            default:
                this.wine.run('reg', 'add', 'HKLM\\System\\CurrentControlSet\\Control\\ProductOptions', '/v', 'ProductType', '/d', 'WinNT', '/f');
                append = {
                    'HKEY_LOCAL_MACHINE\\Software\\Microsoft\\Windows NT\\CurrentVersion': {
                        'CSDVersion':         'Service Pack 1',
                        'CurrentBuildNumber': '7601',
                        'CurrentVersion':     '6.1',
                    },
                    'HKEY_LOCAL_MACHINE\\System\\CurrentControlSet\\Control\\Windows':     {
                        'CSDVersion': 'dword:00000100',
                    },
                };
        }

        Object.keys(append).forEach(path => {
            regs.push(`\n[${path}]\n`);

            Object.keys(append[path]).forEach(field => {
                let value = append[path][field];
                regs.push(`"${field}"="${value}"`);
            })
        });

        this.fs.filePutContents(path, Utils.encode(regs.join('\n'), 'utf-16'));
        this.wine.reg(path);

        return true;
    }
}