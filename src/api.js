import axios from 'axios';

export default class Api {

    static get defaultOptions() {
        return {
            baseUrl: null,
            listUrl: null,
            downloadUrl: null,
            uploadUrl: null,
            getAxios: axios.create,
            axiosOptions: {
                crossDomain: true,
                headers: {}
            }
        };
    }

    constructor(opts) {
        this.options = {...this.constructor.defaultOptions, ...opts};

        if (this.options.baseUrl) {
            this.options.axiosOptions.baseURL = this.options.baseUrl;
        }
        const {getAxios, axiosOptions} = this.options
        this.axios = getAxios(axiosOptions);
    }

    list(path) {
        var conf = this.computeConfig({params: {path: path}});
        return this.axios.get(this.options.listUrl, conf);
    }

    upload(data, config) {
        var conf = this.computeConfig(config);
        return this.axios.post(this.options.uploadUrl, data, conf);
    }

    computeConfig(conf) {
        if (!this.options.requestConfig) {
            return conf;
        }
        var overrideConf = this.options.requestConfig;
        if (overrideConf instanceof Function) {
            overrideConf = overrideConf();
        }
        return {...conf, ...overrideConf};
    }

    downloadUrl(file) {
        // TODO : proper
        if (this.options.downloadUrl)
            return this.options.downloadUrl + '?path=' + file.path;
    }

}