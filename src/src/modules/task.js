import _          from "lodash";
import Config     from "./config";
import Command    from "./command";
import FileSystem from "./file-system";
import Prefix     from "./prefix";
import System     from "./system";
import MangoHud   from "./mango-hud";

export default class Task {

    /**
     * @type {Config}
     */
    config = null;


    /**
     * @type {Prefix}
     */
    prefix = null;

    /**
     * @type {FileSystem}
     */
    fs = null;

    /**
     * @type {Monitor}
     */
    monitor = null;

    /**
     * @type {System}
     */
    system = null;

    /**
     * @type {MangoHud}
     */
    mangoHud = null;

    /**
     * @param {Config} config
     * @param {Prefix} prefix
     * @param {FileSystem} fs
     * @param {Monitor} monitor
     * @param {System} system
     * @param {MangoHud} mangoHud
     */
    constructor(config, prefix, fs, monitor, system, mangoHud) {
        this.prefix   = _.cloneDeep(prefix);
        this.config   = _.cloneDeep(config);
        this.fs       = fs;
        this.monitor  = monitor;
        this.system   = system;
        this.mangoHud = mangoHud;
    }

    desktop() {
        if (!this.config.getConfigValue('window.enable')) {
            return '';
        }

        let resolution = this.config.getConfigValue('window.resolution');
        let title      = _.upperFirst(_.camelCase(this.config.getGameName()));

        if ('auto' === resolution) {
            resolution = this.monitor.getDefault().resolution;
        }

        return `explorer "/desktop=${title},${resolution}"`;
    }

    game() {
        let driveC     = this.prefix.getWineDriveC();
        let gamePath   = _.trim(this.prefix.getGamesFolder(), '/');
        let additional = _.trim(this.config.getGamePath(), '/');

        let path     = [driveC, gamePath, additional].filter(s => s).join('/');
        let wine     = this.prefix.getWineBin();
        let fileName = this.config.getGameExe();
        let args     = this.config.getGameArguments().split("'").join('"');
        let desktop  = this.desktop();

        return `cd "${path}" && "${wine}" ${desktop} "${fileName}" ${args}`;
    }

    /**
     * @return {Promise}
     */
    run(mode = 'standard') {
        let promise = Promise.resolve();
        let logFile = `${this.prefix.getLogsDir()}/${this.config.getGameName()}.log`;

        if (this.fs.exists(logFile)) {
            this.fs.rm(logFile);
        }

        if ('debug' === mode) {
            this.prefix.setWineDebug('');
        }

        if ('fps' === mode) {
            if (this.prefix.isMangoHud()) {
                promise = promise
                    .then(() => this.mangoHud.update())
                    .then(() => {
                        this.config.setConfigValue('exports.MANGOHUD', 1);

                        if (!this.config.getConfigValue('exports.MANGOHUD_CONFIG')) {
                            this.config.setConfigValue('exports.MANGOHUD_CONFIG', 'cpu_temp,gpu_temp,position=top-left,height=500,font_size=32');
                        }
                    });
            } else if (this.prefix.isDxvk()) {
                if (!this.config.getConfigValue('exports.DXVK_HUD')) {
                    this.config.setConfigValue('exports.DXVK_HUD', 'fps,devinfo');
                }
            } else if (this.system.getMesaVersion()) {
                this.config.setConfigValue('exports.GALLIUM_HUD', 'simple,fps');
            }
        }

        return promise.then(() => {
            let winePrefix = window.app.getWinePrefix();

            winePrefix.setConfig(this.config);
            winePrefix.updatePulse();
            winePrefix.updateCsmt();

            this.monitor.save();

            return (new Command(this.prefix, this.config))
                .watch(this.game(), output => this.fs.filePutContents(logFile, output, this.fs.FILE_APPEND))
                .then(() => this.monitor.restore());
        });
    }
}