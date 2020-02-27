import FileSystem from "./modules/file-system";
import AppFolders from "./modules/app-folders";
import Config     from "./modules/config";
import Wine       from "./modules/wine";
import Command    from "./modules/command";
import System     from "./modules/system";
import Driver  from "./modules/driver";
import Network from "./modules/network";

class App {

    CONFIG      = new Config();
    COMMAND     = new Command();
    FILE_SYSTEM = new FileSystem();
    NETWORK     = new Network(this.CONFIG);
    APP_FOLDERS = new AppFolders(this.CONFIG, this.FILE_SYSTEM);
    WINE        = new Wine(this.CONFIG, this.COMMAND, this.FILE_SYSTEM);
    SYSTEM      = new System(this.CONFIG, this.COMMAND, this.FILE_SYSTEM);
    DRIVER      = new Driver(this.CONFIG, this.COMMAND, this.SYSTEM, this.FILE_SYSTEM);

    constructor() {
        this.getAppFolders().create();
    }

    /**
     * @returns {FileSystem}
     */
    getFileSystem() {
        return this.FILE_SYSTEM;
    }

    /**
     * @returns {Config}
     */
    getConfig() {
        return this.CONFIG;
    }

    /**
     * @returns {Command}
     */
    getCommand() {
        return this.COMMAND;
    }

    /**
     * @returns {AppFolders}
     */
    getAppFolders() {
        return this.APP_FOLDERS;
    }

    /**
     * @returns {Wine}
     */
    getWine() {
        return this.WINE;
    }

    /**
     * @returns {System}
     */
    getSystem() {
        return this.SYSTEM;
    }

    /**
     * @returns {Driver}
     */
    getDriver() {
        return this.DRIVER;
    }

    /**
     * @returns {Network}
     */
    getNetwork() {
        return this.NETWORK;
    }
}

export default new App();