import action from "./action";
import api    from "../api";

export default {
    namespaced: true,
    state:      {
        configs: [],
    },
    mutations:  {
        [action.LOAD](state, { configs, prefix }) {
            state.configs = (configs || []).map(config => ({
                name:        config.getGameName(),
                description: config.getGameDescription(),
                version:     config.getGameVersion(),
                time:        config.getGameTime(),
                code:        config.getCode(),
                icon:        config.getGameIcon() ? 'local:/' + config.getGameIcon() + '?t=' + api.currentTime : '',
                background:  config.getGameBackground() ? 'local:/' + config.getGameBackground() + '?t=' + api.currentTime : '',
                esync:       config.isEsync(),
                pulse:       config.isPulse(),
                csmt:        config.isCsmt(),
                window:      config.isWindow(),
                startAt:     null,
                launched:    false,
                config,
                prefix,
            }));
        },
        [action.PLAY](state, config) {
            state.configs = state.configs.map(item => {
                if (item.code === config.code) {
                    item.launched = true;
                    item.startAt  = api.currentTime;
                }

                return item;
            });
        },
        [action.STOP](state, config) {
            state.configs = state.configs.map(item => {
                if (item.code === config.code) {
                    item.launched = false;

                    if (item.startAt) {
                        item.time = item.time + (api.currentTime - item.startAt);
                        item.config.setConfigValue('app.time', item.time);
                        item.config.save();
                    }
                }

                return item;
            });
        },
        [action.CLEAR](state) {
            state.configs = [];
        },
    },
    actions:    {
        [action.LOAD]({ commit, state }) {
            if (state.configs.length > 0) {
                return;
            }

            commit(action.LOAD, { configs: app.getConfig().findConfigs(), prefix: app.getPrefix() });
        },
        [action.PLAY]({ commit, dispatch }, { config, mode }) {
            commit(action.PLAY, config);

            app.createTask(config.config)
                .run(mode)
                .then(() => dispatch(action.STOP, config));
        },
        [action.STOP]({ commit }, config) {
            commit(action.STOP, config);
        },
        [action.SAVE]({ commit, dispatch }, { config, item }) {
            config.setFlatConfig(item);
            config.save();

            commit(action.CLEAR);

            return dispatch(action.LOAD);
        },
    },
};